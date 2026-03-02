<?php

namespace App\Console\Commands;

use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\PaymentSetting;
use App\Models\User;
use App\Services\EnrollmentService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateMonthlyPayments extends Command
{
    protected $signature = 'payments:generate-monthly {--month= : Mes a generar (YYYY-MM)}';
    protected $description = 'Generar mensualidades automáticamente para estudiantes inscritos según su modalidad';

    public function handle(EnrollmentService $enrollmentService): int
    {
        $this->info('Generando mensualidades...');

        // Obtener el mes para el cual generar pagos
        $month   = $this->option('month') ? Carbon::parse($this->option('month')) : Carbon::now();
        $dueDate = $month->copy()->day(5);

        $this->info("Mes       : {$month->locale('es')->isoFormat('MMMM YYYY')}");
        $this->info("Vencimiento: {$dueDate->format('d/m/Y')}");
        $this->newLine();

        // Configuración de pagos activa (opcional — se usa como fallback si no hay modalidad)
        $paymentSetting = PaymentSetting::where('is_active', true)->first();

        if (! $paymentSetting) {
            $this->warn('⚠️  No hay configuración de pagos activa. Se usará el monthly_fee de cada programa como fallback.');
        }

        // Obtener todas las inscripciones activas
        $activeEnrollments = Enrollment::with(['student.studentProfile', 'program'])
            ->where('status', 'active')
            ->get();

        if ($activeEnrollments->isEmpty()) {
            $this->warn('No se encontraron inscripciones activas.');
            return 0;
        }

        $generated = 0;
        $skipped   = 0;
        $errors    = 0;

        foreach ($activeEnrollments as $enrollment) {
            $student = $enrollment->student;
            $program = $enrollment->program;

            // Saltar si ya existe el cobro para este mes
            $existingPayment = Payment::where('student_id', $enrollment->student_id)
                ->where('program_id', $enrollment->program_id)
                ->where('enrollment_id', $enrollment->id)
                ->where('due_date', $dueDate)
                ->exists();

            if ($existingPayment) {
                $this->line("  ⏭️  {$student->name} — ya tiene cobro para " . $dueDate->locale('es')->isoFormat('MMMM YYYY'));
                $skipped++;
                continue;
            }

            // Calcular monto según modalidad o fallback al monthly_fee del programa
            $modality          = $student->studentProfile?->modality;
            $finalAmount       = null;
            $originalAmount    = null;
            $discountPct       = null;
            $discountAmount    = null;

            if ($modality && $paymentSetting) {
                // Contar hermanos activos para descuento familiar
                $siblingsCount = 1;
                if ($student->parent_id) {
                    $siblingsCount = User::where('parent_id', $student->parent_id)
                        ->whereHas('programEnrollments', fn($q) => $q->whereIn('status', ['active', 'waiting']))
                        ->count();
                }

                $paymentInfo    = $enrollmentService->getPaymentAmount($modality, $siblingsCount);
                $finalAmount    = $paymentInfo['amount'];
                $originalAmount = $paymentInfo['original_amount'];
                $discountPct    = $paymentInfo['discount_percentage'] > 0 ? $paymentInfo['discount_percentage'] : null;
                $discountAmount = $paymentInfo['discount_amount'] > 0 ? $paymentInfo['discount_amount'] : null;

            } else {
                // Fallback: usar monthly_fee del programa
                $finalAmount    = (float) ($program->monthly_fee ?? 0);
                $originalAmount = $finalAmount;

                if ($finalAmount <= 0) {
                    $this->warn("  ⏭️  {$student->name} — sin modalidad ni monthly_fee configurado, se omite.");
                    $skipped++;
                    continue;
                }

                if (! $modality) {
                    $this->warn("  ⚠️  {$student->name} — sin modalidad asignada, usando monthly_fee del programa (\${$finalAmount}).");
                }
            }

            $concept = "Mensualidad {$program->name} — " . $dueDate->locale('es')->isoFormat('MMMM YYYY');
            if ($modality) {
                $concept .= " ({$modality})";
            }
            if ($discountPct) {
                $concept .= " — Descuento familiar {$discountPct}%";
            }

            try {
                Payment::create([
                    'student_id'          => $enrollment->student_id,
                    'program_id'          => $enrollment->program_id,
                    'enrollment_id'       => $enrollment->id,
                    'concept'             => $concept,
                    'modality'            => $modality,
                    'payment_type'        => 'single',
                    'amount'              => $finalAmount,
                    'original_amount'     => $originalAmount,
                    'discount_percentage' => $discountPct,
                    'discount_amount'     => $discountAmount,
                    'paid_amount'         => 0,
                    'remaining_amount'    => $finalAmount,
                    'due_date'            => $dueDate,
                    'status'              => 'pending',
                ]);

                $line = "  ✅ {$student->name}";
                $line .= $modality ? " ({$modality})" : " (sin modalidad)";
                $line .= " — {$program->name}: $" . number_format($finalAmount, 0, ',', '.');
                if ($discountPct) {
                    $line .= " (Descuento {$discountPct}%)";
                }
                $this->info($line);
                $generated++;

            } catch (\Exception $e) {
                $this->error("  ❌ Error con {$student->name}: {$e->getMessage()}");
                $errors++;
            }
        }

        $this->newLine();
        $this->info('✨ Resumen:');
        $this->info("   Generados : {$generated}");
        $this->info("   Omitidos  : {$skipped}");
        if ($errors > 0) {
            $this->error("   Errores   : {$errors}");
        }

        return 0;
    }
}

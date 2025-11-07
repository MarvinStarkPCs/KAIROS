<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Console\Command;
use Carbon\Carbon;

class GenerateMonthlyPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:generate-monthly {--month= : Month (YYYY-MM)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generar mensualidades automáticamente para estudiantes inscritos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generando mensualidades...');

        // Obtener el mes para el cual generar pagos
        $month = $this->option('month')
            ? Carbon::parse($this->option('month'))
            : Carbon::now()->addMonth(); // Mes siguiente

        $dueDate = $month->copy()->day(5); // Vencimiento el día 5 del mes

        $this->info("Generando pagos para el mes: {$month->format('F Y')}");
        $this->info("Fecha de vencimiento: {$dueDate->format('d/m/Y')}");

        // Obtener todos los estudiantes con inscripciones activas
        $activeEnrollments = Enrollment::with(['student', 'program'])
            ->where('status', 'active')
            ->get();

        if ($activeEnrollments->isEmpty()) {
            $this->warn('No se encontraron inscripciones activas');
            return 0;
        }

        $generated = 0;
        $skipped = 0;

        foreach ($activeEnrollments as $enrollment) {
            // Verificar que el programa tenga tarifa mensual configurada
            if (!$enrollment->program->monthly_fee || $enrollment->program->monthly_fee <= 0) {
                $this->warn("  ⏭️  {$enrollment->student->name} - {$enrollment->program->name} no tiene tarifa mensual configurada");
                $skipped++;
                continue;
            }

            // Verificar si ya existe un pago para este estudiante, programa y mes
            $existingPayment = Payment::where('student_id', $enrollment->student_id)
                ->where('program_id', $enrollment->program_id)
                ->where('enrollment_id', $enrollment->id)
                ->where('due_date', $dueDate)
                ->exists();

            if ($existingPayment) {
                $this->warn("  ⏭️  {$enrollment->student->name} - Ya tiene mensualidad para " . $dueDate->locale('es')->isoFormat('MMMM YYYY'));
                $skipped++;
                continue;
            }

            $amount = $enrollment->program->monthly_fee;

            Payment::create([
                'student_id' => $enrollment->student_id,
                'program_id' => $enrollment->program_id,
                'enrollment_id' => $enrollment->id,
                'concept' => "Mensualidad {$enrollment->program->name} - " . $dueDate->locale('es')->isoFormat('MMMM YYYY'),
                'payment_type' => 'single',
                'amount' => $amount,
                'original_amount' => $amount,
                'paid_amount' => 0,
                'remaining_amount' => $amount,
                'due_date' => $dueDate,
                'status' => 'pending',
            ]);

            $this->info("  ✅ {$enrollment->student->name} - {$enrollment->program->name}: \${$amount}");
            $generated++;
        }

        $this->newLine();
        $this->info("✨ Resumen:");
        $this->info("   Mensualidades generadas: {$generated}");
        $this->info("   Omitidas (ya existían): {$skipped}");
        $this->info("   Total inscripciones activas: {$activeEnrollments->count()}");

        return 0;
    }
}

<?php

namespace App\Console\Commands;

use App\Mail\PaymentReminder;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class SendPaymentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:send-reminders {--days=3 : Días antes del vencimiento para enviar recordatorio}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Enviar recordatorios de pago por correo a estudiantes y responsables';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $daysBeforeDue = (int) $this->option('days');

        $this->info("Buscando pagos que vencen en los próximos {$daysBeforeDue} días...");

        // Buscar pagos pendientes que venzan hoy o en los próximos X días
        $targetDate = Carbon::today()->addDays($daysBeforeDue);

        $payments = Payment::with(['student', 'program'])
            ->whereIn('status', ['pending'])
            ->whereBetween('due_date', [Carbon::today(), $targetDate])
            ->where('remaining_amount', '>', 0)
            ->get();

        if ($payments->isEmpty()) {
            $this->info('No hay pagos próximos a vencer.');
            return 0;
        }

        $this->info("Se encontraron {$payments->count()} pago(s) próximos a vencer.");

        $sent = 0;
        $errors = 0;

        foreach ($payments as $payment) {
            $student = $payment->student;
            if (!$student) {
                $this->warn("  ⏭️  Pago #{$payment->id}: No tiene estudiante asociado");
                continue;
            }

            $studentName = trim($student->name . ' ' . ($student->last_name ?? ''));
            $daysUntilDue = Carbon::today()->diffInDays($payment->due_date, false);

            // Determinar a quién enviar: al responsable (parent) y/o al estudiante
            $recipients = [];

            // Si tiene responsable (parent_id), enviar al responsable
            if ($student->parent_id) {
                $parent = User::find($student->parent_id);
                if ($parent && $parent->email) {
                    $parentName = trim($parent->name . ' ' . ($parent->last_name ?? ''));
                    $recipients[] = [
                        'email' => $parent->email,
                        'name' => $parentName,
                        'type' => 'responsable',
                    ];
                }
            }

            // También al estudiante si tiene email
            if ($student->email) {
                $recipients[] = [
                    'email' => $student->email,
                    'name' => $studentName,
                    'type' => 'estudiante',
                ];
            }

            if (empty($recipients)) {
                $this->warn("  ⏭️  {$studentName}: No tiene email ni responsable con email");
                continue;
            }

            foreach ($recipients as $recipient) {
                try {
                    Mail::to($recipient['email'])->send(
                        new PaymentReminder($payment, $recipient['name'], $studentName, max(0, $daysUntilDue))
                    );

                    $this->info("  ✅ {$studentName} → {$recipient['email']} ({$recipient['type']}) - Vence en {$daysUntilDue} día(s)");
                    $sent++;
                } catch (\Exception $e) {
                    $this->error("  ❌ Error enviando a {$recipient['email']}: {$e->getMessage()}");
                    \Log::error("Error enviando recordatorio de pago #{$payment->id} a {$recipient['email']}: {$e->getMessage()}");
                    $errors++;
                }
            }
        }

        $this->newLine();
        $this->info("✨ Resumen:");
        $this->info("   Correos enviados: {$sent}");
        if ($errors > 0) {
            $this->error("   Errores: {$errors}");
        }
        $this->info("   Pagos revisados: {$payments->count()}");

        return 0;
    }
}

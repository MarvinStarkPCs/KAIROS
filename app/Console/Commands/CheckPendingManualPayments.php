<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Models\Enrollment;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CheckPendingManualPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:check-pending-manual';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verificar pagos manuales pendientes del 1-5 del mes y actualizar estados';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();

        // Solo ejecutar si es día 6 o posterior del mes
        if ($today->day < 6) {
            $this->info('Este comando solo se ejecuta después del día 5 del mes.');
            return 0;
        }

        $this->info('Verificando pagos manuales pendientes...');

        // Obtener pagos pendientes creados manualmente (sin wompi_reference)
        // que tienen fecha de vencimiento entre el 1 y el 5 del mes actual
        $firstDay = $today->copy()->startOfMonth();
        $fifthDay = $today->copy()->startOfMonth()->day(5);

        $pendingPayments = Payment::where('status', 'pending')
            ->whereNull('wompi_reference') // Pagos manuales (no de pasarela)
            ->whereBetween('due_date', [$firstDay, $fifthDay])
            ->with(['student', 'program', 'enrollment'])
            ->get();

        if ($pendingPayments->isEmpty()) {
            $this->info('No se encontraron pagos manuales pendientes del 1-5 de este mes.');
            return 0;
        }

        $updated = 0;
        $suspended = 0;

        foreach ($pendingPayments as $payment) {
            // Cambiar estado del pago a vencido (overdue)
            $payment->status = 'overdue';
            $payment->save();

            $this->warn("  ⚠️  Pago vencido: {$payment->student->name} - {$payment->concept}");
            $updated++;

            // Si el pago está asociado a una inscripción, suspender la inscripción
            if ($payment->enrollment_id) {
                $enrollment = Enrollment::find($payment->enrollment_id);

                if ($enrollment && $enrollment->status === 'active') {
                    $enrollment->status = 'suspended';
                    $enrollment->save();

                    $this->error("  🚫 Inscripción suspendida: {$enrollment->student->name} - {$enrollment->program->name}");
                    $suspended++;
                }
            }
        }

        $this->newLine();
        $this->info("✨ Resumen:");
        $this->info("   Pagos marcados como vencidos: {$updated}");
        $this->info("   Inscripciones suspendidas: {$suspended}");

        return 0;
    }
}

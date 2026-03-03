<?php

namespace App\Console\Commands;

use App\Models\Payment;
use Illuminate\Console\Command;
use Carbon\Carbon;

class MarkOverduePayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:mark-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Marcar como vencidos los pagos que pasaron su fecha de vencimiento';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Verificando pagos vencidos...');

        $today = Carbon::today();

        // Buscar pagos pendientes cuyo período de gracia (hasta el día 5 del mes) ya venció.
        // Un pago se considera vencido cuando hoy es posterior al día 5 del mes de su due_date.
        $overduePayments = Payment::where('status', 'pending')
            ->whereRaw("DATE_FORMAT(due_date, '%Y-%m-05') < CURDATE()")
            ->get();

        if ($overduePayments->isEmpty()) {
            $this->info('No se encontraron pagos vencidos');
            return 0;
        }

        $count = 0;

        foreach ($overduePayments as $payment) {
            $payment->update(['status' => 'overdue']);

            $this->warn("  ⚠️  Pago #{$payment->id} - {$payment->student->name} - {$payment->concept}");
            $this->line("      Fecha de vencimiento: {$payment->due_date->format('d/m/Y')}");
            $count++;
        }

        $this->newLine();
        $this->info("✨ {$count} pago(s) marcado(s) como vencido(s)");

        return 0;
    }
}

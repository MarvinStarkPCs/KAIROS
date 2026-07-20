<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Models\AcademicProgram;
use App\Models\User;
use App\Services\WompiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProcessRecurringPayments extends Command
{
    public function __construct(protected WompiService $wompiService)
    {
        parent::__construct();
    }
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:process-recurring
                            {--dry-run : Show what would be processed without actually charging}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process recurring monthly payments for students with saved cards';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando procesamiento de pagos recurrentes...');

        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->warn('Modo DRY-RUN: No se realizarán cobros reales');
        }

        // Obtener pagos que tienen cobro recurrente configurado y es momento de cobrar
        $payments = Payment::with(['student', 'program', 'enrollment'])
            ->where('is_recurring', true)
            ->where('status', 'completed') // El pago inicial ya fue completado
            ->whereNotNull('card_token')
            ->where(function ($query) {
                $query->whereDate('next_charge_date', '<=', Carbon::today())
                    ->orWhereNull('next_charge_date'); // Primera vez que se cobra después del inicial
            })
            ->where('failed_attempts', '<', 3) // Máximo 3 intentos fallidos
            ->get();

        $successful = 0;
        $failed = 0;

        if ($payments->isEmpty()) {
            $this->info('No hay pagos recurrentes por tarjeta pendientes de procesar');
        } else {
            $this->info("Encontrados {$payments->count()} pagos por tarjeta para procesar");
        }

        foreach ($payments as $payment) {
            $studentName = $payment->student->name . ' ' . $payment->student->last_name;
            $this->line("Procesando: {$studentName} - {$payment->program->name}");

            if ($dryRun) {
                $this->info("  [DRY-RUN] Se cobraría: \${$payment->program->monthly_fee}");
                continue;
            }

            try {
                // Crear nueva transacción con Wompi usando el token guardado
                $result = $this->chargeRecurringPayment($payment);

                if ($result['success']) {
                    $this->info("  ✓ Cobro exitoso - Transaction ID: {$result['transaction_id']}");
                    $successful++;

                    // Resetear intentos fallidos
                    $payment->failed_attempts = 0;
                    $payment->next_charge_date = Carbon::now()->addDays(30);
                    $payment->save();

                } else {
                    $this->error("  ✗ Cobro fallido: {$result['error']}");
                    $failed++;

                    // Incrementar intentos fallidos
                    $payment->increment('failed_attempts');

                    if ($payment->failed_attempts >= 3) {
                        $this->warn("  ⚠ Máximo de intentos alcanzado. Se suspende cobro automático.");
                    }

                    $payment->save();
                }

            } catch (\Exception $e) {
                $this->error("  ✗ Error: {$e->getMessage()}");
                Log::error("Error procesando pago recurrente: ", [
                    'payment_id' => $payment->id,
                    'error' => $e->getMessage()
                ]);
                $failed++;
            }
        }

        // --- Cobros Nequi ---
        $this->newLine();
        $this->info('Procesando cobros automáticos por Nequi...');
        [$nequiOk, $nequiFail] = $this->processNequiPayments($dryRun);
        $successful += $nequiOk;
        $failed += $nequiFail;

        $this->newLine();
        $this->info("Procesamiento completado:");
        $this->info("  Exitosos: {$successful}");
        $this->info("  Fallidos: {$failed}");

        return Command::SUCCESS;
    }

    /**
     * Cobrar pagos pendientes del mes a todos los usuarios con Nequi autorizado:
     * - Responsables/padres: cobran los pagos de sus hijos en un solo cargo
     * - Estudiantes adultos: cobran sus propios pagos (si no tienen papá con Nequi activo)
     */
    private function processNequiPayments(bool $dryRun): array
    {
        $today = Carbon::today();

        // Responsables que pagan por sus hijos
        $parents = User::whereNotNull('nequi_payment_source_id')
            ->where('nequi_subscription_active', true)
            ->role('Padre/Madre')
            ->get();

        // IDs de estudiantes ya cubiertos por un responsable con Nequi activo
        $coveredStudentIds = $parents
            ->flatMap(fn($p) => $p->dependents()->pluck('id'))
            ->unique();

        // Estudiantes adultos con Nequi propio (excluye los que ya paga su responsable)
        $selfPayers = User::whereNotNull('nequi_payment_source_id')
            ->where('nequi_subscription_active', true)
            ->role('Estudiante')
            ->whereNotIn('id', $coveredStudentIds)
            ->get();

        // Unificar en una colección de pagadores con sus student_ids
        $payers = $parents->map(fn($p) => [
            'user'        => $p,
            'student_ids' => $p->dependents()->pluck('id'),
            'tipo'        => 'Responsable',
        ])->merge($selfPayers->map(fn($s) => [
            'user'        => $s,
            'student_ids' => collect([$s->id]),
            'tipo'        => 'Estudiante',
        ]));

        if ($payers->isEmpty()) {
            $this->line('  No hay responsables ni estudiantes con Nequi activo.');
            return [0, 0];
        }

        $successful = 0;
        $failed = 0;

        foreach ($payers as ['user' => $payer, 'student_ids' => $studentIds, 'tipo' => $tipo]) {
            $pending = Payment::whereIn('student_id', $studentIds)
                ->where('status', 'pending')
                ->whereMonth('due_date', $today->month)
                ->whereYear('due_date', $today->year)
                ->whereNull('wompi_transaction_id')
                ->with(['student', 'program'])
                ->get();

            if ($pending->isEmpty()) {
                continue;
            }

            $totalAmount = $pending->sum('amount');
            $totalCents  = (int) ($totalAmount * 100);
            $reference   = 'NQ-' . $payer->id . '-' . $today->format('Ym') . '-' . time();
            $paymentIds  = $pending->pluck('id')->join(', ');

            foreach ($pending as $payment) {
                $studentName = $payment->student->name . ' ' . ($payment->student->last_name ?? '');
                $this->line("  [{$tipo}] + {$studentName} — {$payment->program?->name} — \${$payment->amount}");
            }
            $this->line("  → Cobro automático (source #{$payer->nequi_payment_source_id}): \${$totalAmount} ({$pending->count()} pagos)");

            if ($dryRun) {
                $this->info("  [DRY-RUN] Débito automático \${$totalAmount} (sin push)");
                continue;
            }

            try {
                $transaction = $this->wompiService->chargeWithPaymentSource(
                    paymentSourceId: (int) $payer->nequi_payment_source_id,
                    amountInCents: $totalCents,
                    reference: $reference,
                    customerEmail: $payer->email,
                );

                $txStatus = $transaction['status'] ?? 'PENDING';
                $txId     = $transaction['id'] ?? null;

                Payment::whereIn('id', $pending->pluck('id'))->update([
                    'wompi_transaction_id' => $txId,
                    'wompi_reference'      => $reference,
                    'payment_method'       => 'nequi',
                ]);

                if ($txStatus === 'APPROVED') {
                    Payment::whereIn('id', $pending->pluck('id'))->update([
                        'status'       => 'completed',
                        'paid_amount'  => \DB::raw('amount'),
                        'payment_date' => now(),
                    ]);
                }

                $this->info("  ✓ Transacción creada (tx: {$txId}, estado: {$txStatus})");
                $successful++;
            } catch (\Exception $e) {
                $this->error("  ✗ Error: {$e->getMessage()}");
                Log::error('ProcessRecurringPayments Nequi error', [
                    'payment_ids' => $paymentIds,
                    'payer_id'    => $payer->id,
                    'tipo'        => $tipo,
                    'error'       => $e->getMessage(),
                ]);
                $failed++;
            }
        }

        return [$successful, $failed];
    }

    /**
     * Realizar cobro recurrente usando el token de tarjeta guardado
     */
    private function chargeRecurringPayment(Payment $payment): array
    {
        $config = $this->wompiService->getActiveConfig();

        $wompiUrl = $config['api_url'];
        $privateKey = $config['private_key'];
        $publicKey = $config['public_key'];
        $integritySecret = $config['integrity_secret'];

        // Obtener el monto mensual del programa
        $amount = $payment->program->monthly_fee;
        $amountInCents = (int) ($amount * 100);

        // Crear referencia única para este cobro (máximo 32 caracteres)
        $reference = 'REC-' . $payment->enrollment_id . '-' . time();

        // Validar largo de referencia
        if (strlen($reference) > 32) {
            $reference = 'REC-' . substr(md5($payment->enrollment_id . time()), 0, 23);
        }

        // Validar email del estudiante
        $customerEmail = filter_var($payment->student->email, FILTER_VALIDATE_EMAIL)
            ? $payment->student->email
            : 'noreply@academialinaje.com';

        // Preparar datos de la transacción
        $data = [
            'acceptance_token' => $this->getAcceptanceToken(),
            'amount_in_cents' => $amountInCents,
            'currency' => 'COP',
            'customer_email' => $customerEmail,
            'payment_method' => [
                'type' => 'CARD',
                'token' => $payment->card_token,
                'installments' => 1,
            ],
            'reference' => $reference,
        ];

        // Agregar payment_source_id solo si existe
        if (!empty($payment->payment_source_id)) {
            $data['payment_source_id'] = $payment->payment_source_id;
        }

        // Generar firma de integridad para producción
        // En modo test (pub_test_*), Wompi NO requiere firma
        $isTest = str_starts_with($publicKey, 'pub_test_');
        if (!empty($integritySecret) && !$isTest) {
            $integrityString = $reference . $amountInCents . 'COP' . $integritySecret;
            $data['signature'] = [
                'integrity' => hash('sha256', $integrityString)
            ];

            Log::info('Wompi: Firma de integridad añadida a transacción recurrente', [
                'reference' => $reference,
                'signature' => $data['signature']['integrity']
            ]);
        }

        // Realizar petición a Wompi
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $privateKey,
            'Content-Type' => 'application/json',
        ])->post("{$wompiUrl}/transactions", $data);

        if ($response->successful()) {
            $transaction = $response->json();

            Log::info('Cobro recurrente creado:', [
                'payment_id' => $payment->id,
                'transaction_id' => $transaction['data']['id'],
                'status' => $transaction['data']['status']
            ]);

            // Crear nuevo registro de pago para este cobro mensual
            $newPayment = Payment::create([
                'student_id' => $payment->student_id,
                'program_id' => $payment->program_id,
                'enrollment_id' => $payment->enrollment_id,
                'concept' => 'Mensualidad - ' . $payment->program->name . ' - ' . Carbon::now()->format('M Y'),
                'payment_type' => 'single',
                'amount' => $amount,
                'original_amount' => $amount,
                'paid_amount' => 0,
                'remaining_amount' => $amount,
                'due_date' => Carbon::today(),
                'status' => 'pending',
                'wompi_reference' => $reference,
                'wompi_transaction_id' => $transaction['data']['id'],
                'payment_method' => 'CARD',
                'is_recurring' => false, // Este es un pago individual del plan recurrente
                'parent_payment_id' => $payment->id, // Referencia al pago inicial
            ]);

            return [
                'success' => true,
                'transaction_id' => $transaction['data']['id'],
                'payment_id' => $newPayment->id,
            ];
        } else {
            $error = $response->json()['error']['messages'] ?? 'Unknown error';
            Log::error('Error en cobro recurrente:', [
                'payment_id' => $payment->id,
                'error' => $error,
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'error' => is_array($error) ? implode(', ', $error) : $error,
            ];
        }
    }

    /**
     * Obtener token de aceptación de términos de Wompi
     */
    private function getAcceptanceToken(): string
    {
        $config = $this->wompiService->getActiveConfig();

        $wompiUrl = $config['api_url'];
        $publicKey = $config['public_key'];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $publicKey,
        ])->get("{$wompiUrl}/merchants/{$publicKey}");

        if ($response->successful()) {
            $data = $response->json();
            return $data['data']['presigned_acceptance']['acceptance_token'] ?? '';
        }

        return '';
    }
}

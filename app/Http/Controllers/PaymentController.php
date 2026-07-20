<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\User;
use App\Models\AcademicProgram;
use App\Models\Enrollment;
use App\Models\PaymentSetting;
use App\Mail\AbonoRegistrado;
use App\Mail\PaymentConfirmed;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\StoreInstallmentsRequest;
use App\Http\Requests\AddTransactionRequest;
use App\Services\WompiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function __construct(protected WompiService $wompiService)
    {
    }
    /**
     * Display payments index/list
     */
    public function index(Request $request)
    {
        $query = Payment::with(['student', 'program', 'enrollment', 'transactions']);

        // Filtros
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->filled('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('due_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('due_date', '<=', $request->date_to);
        }

        // Solo mostrar pagos principales (no cuotas hijas)
        $query->whereNull('parent_payment_id');

        $perPage = in_array((int) $request->per_page, [10, 20, 30, 100]) ? (int) $request->per_page : 20;
        $payments = $query->orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();

        // Agregar información calculada a cada pago
        $payments->getCollection()->transform(function ($payment) {
            $payment->has_transactions = $payment->transactions->isNotEmpty();
            $payment->pending_balance = $payment->getPendingBalance();
            return $payment;
        });

        $programs = AcademicProgram::active()->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'programs' => $programs,
            'filters' => $request->only(['status', 'search', 'program_id', 'payment_type', 'date_from', 'date_to', 'per_page']),
        ]);
    }

    /**
     * Show form to create new payment
     */
    public function create()
    {
        // Cargar inscripciones activas con estudiante y programa
        $enrollments = Enrollment::with(['student', 'program'])
            ->active()
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'student_id' => $enrollment->student_id,
                    'student_name' => $enrollment->student->name,
                    'student_email' => $enrollment->student->email ?? '',
                    'program_id' => $enrollment->program_id,
                    'program_name' => $enrollment->program->name,
                ];
            });

        return Inertia::render('Payments/Form', [
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Store a new payment record
     */
    public function store(StorePaymentRequest $request)
    {
        $validated = $request->validated();

        $validated['recorded_by'] = auth()->id();
        $validated['payment_type'] = $validated['payment_type'] ?? 'single';

        // Inicializar campos de montos
        $validated['original_amount'] = $validated['amount'];
        $validated['paid_amount'] = 0;
        $validated['remaining_amount'] = $validated['amount'];

        // If status is completed, set as fully paid
        if ($validated['status'] === 'completed') {
            $validated['payment_date'] = now();
            $validated['paid_amount'] = $validated['amount'];
            $validated['remaining_amount'] = 0;
        }

        $payment = Payment::create($validated);

        flash_success('Pago registrado exitosamente');
        return redirect()->route('pagos.index');
    }

    /**
     * Display payment details
     */
    public function show(Payment $payment)
    {
        $payment->load(['student', 'program', 'enrollment', 'recordedBy', 'transactions.recordedBy']);
        $payment->pending_balance = $payment->getPendingBalance();

        return Inertia::render('Payments/Show', [
            'payment'     => $payment,
            'canEditAbonos' => auth()->id() === 1,
        ]);
    }

    /**
     * Show form to edit payment
     */
    public function edit(Payment $payment)
    {
        $payment->load('transactions.recordedBy');
        $payment->pending_balance = $payment->getPendingBalance();

        // Cargar inscripciones activas con estudiante y programa
        $enrollments = Enrollment::with(['student', 'program'])
            ->active()
            ->get()
            ->map(function ($enrollment) {
                return [
                    'id' => $enrollment->id,
                    'student_id' => $enrollment->student_id,
                    'student_name' => $enrollment->student->name,
                    'student_email' => $enrollment->student->email ?? '',
                    'program_id' => $enrollment->program_id,
                    'program_name' => $enrollment->program->name,
                ];
            });

        return Inertia::render('Payments/Form', [
            'payment'       => array_merge($payment->toArray(), [
                'wompi_transaction_id' => $payment->wompi_transaction_id,
                'wompi_reference'      => $payment->wompi_reference,
                'payment_method'       => $payment->payment_method,
                'payment_source_id'    => $payment->payment_source_id,
                'payment_date'         => $payment->payment_date?->format('Y-m-d'),
            ]),
            'enrollments'   => $enrollments,
            'canEditAbonos' => auth()->id() === 1,
        ]);
    }

    /**
     * Update a payment record
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'concept'          => 'nullable|string|max:255',
            'amount'           => 'nullable|numeric|min:0',
            'due_date'         => 'nullable|date',
            'reference_number' => 'nullable|string|max:100',
            'notes'            => 'nullable|string|max:500',
        ], [
            'concept.max'           => 'El concepto no puede exceder 255 caracteres',
            'amount.numeric'        => 'El monto debe ser un número',
            'amount.min'            => 'El monto debe ser mayor o igual a 0',
            'due_date.date'         => 'La fecha debe ser válida',
            'reference_number.max'  => 'El número de referencia no puede exceder 100 caracteres',
            'notes.max'             => 'Las notas no pueden exceder 500 caracteres',
        ]);

        // Solo el usuario ID 1 puede cambiar estado y campos Nequi/Wompi
        if (auth()->id() === 1) {
            if ($request->filled('status')) {
                $request->validate(['status' => 'in:pending,completed,overdue,cancelled']);
                $validated['status'] = $request->status;
            }
            if ($request->filled('payment_method')) {
                $validated['payment_method'] = $request->payment_method;
            }
            if ($request->has('wompi_transaction_id')) {
                $validated['wompi_transaction_id'] = $request->wompi_transaction_id ?: null;
            }
            if ($request->has('wompi_reference')) {
                $validated['wompi_reference'] = $request->wompi_reference ?: null;
            }
            if ($request->has('payment_source_id')) {
                $validated['payment_source_id'] = $request->payment_source_id ?: null;
            }
            if ($request->filled('payment_date')) {
                $validated['payment_date'] = $request->payment_date;
            }
        }

        // Si se cambia el monto, recalcular remaining_amount basado en los abonos ya realizados
        if (isset($validated['amount']) && $validated['amount'] != $payment->amount) {
            $newAmount = $validated['amount'];
            $paidAmount = $payment->paid_amount ?? 0;
            $newRemaining = max(0, $newAmount - $paidAmount);

            $validated['remaining_amount'] = $newRemaining;

            // Si ya se pagó todo o más, marcar como completado
            if ($newRemaining <= 0 && $paidAmount > 0) {
                $validated['status'] = 'completed';
                $validated['remaining_amount'] = 0;
                if (!$payment->payment_date) {
                    $validated['payment_date'] = now();
                }
            }
        }

        // If changing to completed and no payment_date, set it to now
        if (isset($validated['status']) && $validated['status'] === 'completed' && !$payment->payment_date) {
            $validated['payment_date'] = now();
        }

        $payment->update($validated);

        flash_success('Pago actualizado exitosamente');
        return redirect()->route('pagos.index');
    }

    /**
     * Delete a payment record
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();

        flash_success('Pago eliminado exitosamente');
        return redirect()->route('pagos.index');
    }

    /**
     * Mark payment as paid
     */
    public function markAsPaid(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'payment_method' => 'required|string|max:50',
            'reference_number' => 'nullable|string|max:100',
        ], [
            'payment_method.required' => 'El método de pago es obligatorio',
            'payment_method.max' => 'El método de pago no puede exceder 50 caracteres',
            'reference_number.max' => 'El número de referencia no puede exceder 100 caracteres',
        ]);

        $payment->markAsPaid(
            $validated['payment_method'],
            $validated['reference_number'] ?? null
        );

        flash_success('Pago marcado como pagado exitosamente');
        return redirect()->back();
    }

    public function generateInvoice(Payment $payment)
    {
        abort(501, 'Generación de facturas no implementada');
    }

    /**
     * Create installment plan
     */
    public function createInstallments(StoreInstallmentsRequest $request)
    {
        $validated = $request->validated();

        // Calcular descuento familiar si el estudiante tiene hermanos
        $student = User::findOrFail($validated['student_id']);
        $modality = $validated['modality'] ?? null;
        $originalAmount = $validated['total_amount'];
        $discountPercentage = null;
        $discountAmount = null;
        $finalAmount = $validated['total_amount'];

        // Verificar si el estudiante tiene descuento familiar (hermanos matriculados)
        if ($student->parent_id) {
            $siblingsCount = User::where('parent_id', $student->parent_id)
                ->whereHas('programEnrollments', function ($q) {
                    $q->whereIn('status', ['active', 'waiting']);
                })
                ->count();

            if ($siblingsCount > 0 && $modality) {
                $enrollmentService = app(\App\Services\EnrollmentService::class);
                $paymentInfo = $enrollmentService->getPaymentAmount($modality, $siblingsCount);

                if ($paymentInfo['discount_percentage'] > 0) {
                    $originalAmount = $paymentInfo['original_amount'];
                    $finalAmount = $paymentInfo['amount'];
                    $discountPercentage = $paymentInfo['discount_percentage'];
                    $discountAmount = $paymentInfo['discount_amount'];
                }
            }
        }

        $installments = Payment::createInstallmentPlan(
            $validated['student_id'],
            $validated['program_id'],
            $validated['enrollment_id'],
            $validated['concept'] . ($discountPercentage ? " - Descuento {$discountPercentage}%" : ''),
            $finalAmount,
            $validated['number_of_installments'],
            $validated['start_date'],
            $modality,
            $discountPercentage ? $originalAmount : null,
            $discountPercentage,
            $discountAmount
        );

        $message = "Plan de {$validated['number_of_installments']} cuotas creado exitosamente";
        if ($discountPercentage) {
            $message .= " (Descuento familiar del {$discountPercentage}% aplicado)";
        }

        flash_success($message);
        return redirect()->route('pagos.index');
    }

    /**
     * Add transaction (partial payment) to a payment
     */
    public function addTransaction(AddTransactionRequest $request, Payment $payment)
    {
        $validated = $request->validated();

        // Validar que el monto no exceda el saldo pendiente
        $pendingBalance = $payment->getPendingBalance();
        if ($validated['amount'] > $pendingBalance) {
            flash_error('El monto del abono no puede exceder el saldo pendiente de $' . number_format($pendingBalance, 2));
            return redirect()->back();
        }

        // Generar número de referencia automático: ABN-{payment_id}-{número secuencial}-{timestamp}
        $transactionCount = $payment->transactions()->count() + 1;
        $referenceNumber = 'ABN-' . $payment->id . '-' . str_pad($transactionCount, 3, '0', STR_PAD_LEFT) . '-' . now()->format('YmdHis');

        $transaction = $payment->addTransaction(
            $validated['amount'],
            $validated['payment_method'],
            $referenceNumber,
            $validated['notes'] ?? null
        );

        // Recargar el pago para tener los montos actualizados
        $payment->refresh()->load(['student', 'program']);
        $student = $payment->student;
        $studentName = trim($student->name . ' ' . ($student->last_name ?? ''));

        // Enviar correo de abono al estudiante y/o responsable
        try {
            $recipients = [];

            if ($student->parent_id) {
                $parent = User::find($student->parent_id);
                if ($parent?->email) {
                    $recipients[] = [
                        'email' => $parent->email,
                        'name'  => trim($parent->name . ' ' . ($parent->last_name ?? '')),
                    ];
                }
            }

            if ($student->email) {
                $recipients[] = [
                    'email' => $student->email,
                    'name'  => $studentName,
                ];
            }

            foreach ($recipients as $recipient) {
                Mail::to($recipient['email'])->send(
                    new AbonoRegistrado($payment, $transaction, $recipient['name'], $studentName)
                );
            }
        } catch (\Exception $e) {
            \Log::error("Error enviando correo de abono #{$payment->id}: {$e->getMessage()}");
        }

        flash_success('Abono registrado exitosamente');
        return redirect()->back();
    }

    /**
     * Update an existing transaction (abono) — solo usuario id=1
     */
    public function updateTransaction(Request $request, Payment $payment, \App\Models\PaymentTransaction $paymentTransaction)
    {
        if (auth()->id() !== 1) {
            flash_error('No tienes permiso para editar abonos.');
            return redirect()->back();
        }

        if ($paymentTransaction->payment_id !== $payment->id) {
            abort(404);
        }

        // Máximo permitido = total del pago menos lo que ya abonaron los OTROS abonos
        $otherTransactionsTotal = $payment->transactions()
            ->where('id', '!=', $paymentTransaction->id)
            ->sum('amount');
        $maxAllowed = (float) $payment->amount - (float) $otherTransactionsTotal;

        $validated = $request->validate([
            'amount'         => ['required', 'numeric', 'min:0.01', "max:{$maxAllowed}"],
            'payment_method' => ['required', 'string', 'in:cash,transfer,credit_card,manual'],
            'notes'          => ['nullable', 'string', 'max:500'],
        ], [
            'amount.required'         => 'El monto es obligatorio.',
            'amount.min'              => 'El monto debe ser mayor a cero.',
            'amount.max'              => 'El monto no puede superar el valor total del pago ($' . number_format($maxAllowed, 2) . ').',
            'payment_method.required' => 'El método de pago es obligatorio.',
            'payment_method.in'       => 'Método de pago no válido.',
        ]);

        $paymentTransaction->update($validated);

        // Recalcular paid_amount y remaining_amount en el pago padre
        $totalPaid                 = $payment->transactions()->sum('amount');
        $payment->paid_amount      = $totalPaid;
        $payment->remaining_amount = max(0, $payment->amount - $totalPaid);
        if ($payment->remaining_amount <= 0) {
            $payment->status       = 'completed';
            $payment->payment_date = $payment->payment_date ?? now()->toDateString();
        } else {
            $payment->status = $payment->due_date < now()->toDateString() ? 'overdue' : 'pending';
        }
        $payment->save();

        flash_success('Abono actualizado correctamente.');
        return redirect()->back();
    }

    /**
     * Get payment details with transactions
     */
    public function getPaymentDetails(Payment $payment)
    {
        $payment->load(['student', 'program', 'enrollment', 'transactions.recordedBy', 'installments']);

        $payment->pending_balance = $payment->getPendingBalance();
        $payment->has_transactions = $payment->transactions->isNotEmpty();

        return response()->json($payment);
    }

    /**
     * Mostrar configuración de pagos
     */
    public function settings()
    {
        $paymentSetting = PaymentSetting::first();

        return Inertia::render('Payments/Settings', [
            'paymentSetting' => $paymentSetting,
        ]);
    }

    /**
     * Actualizar configuración de pagos
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'amount_linaje_kids' => ['required', 'numeric', 'min:1500'],
            'amount_linaje_teens' => ['required', 'numeric', 'min:1500'],
            'amount_linaje_big' => ['required', 'numeric', 'min:1500'],
            'is_active' => ['required', 'boolean'],
            'enable_online_payment' => ['required', 'boolean'],
            'enable_manual_payment' => ['required', 'boolean'],
            'discount_min_students' => ['required', 'integer', 'min:2', 'max:20'],
            'discount_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
        ], [
            'amount_linaje_kids.required' => 'El monto de Linaje Kids es obligatorio',
            'amount_linaje_kids.numeric' => 'El monto debe ser un número',
            'amount_linaje_kids.min' => 'El monto debe ser al menos $1,500 COP',
            'amount_linaje_teens.required' => 'El monto de Linaje Teens es obligatorio',
            'amount_linaje_teens.numeric' => 'El monto debe ser un número',
            'amount_linaje_teens.min' => 'El monto debe ser al menos $1,500 COP',
            'amount_linaje_big.required' => 'El monto de Linaje Big es obligatorio',
            'amount_linaje_big.numeric' => 'El monto debe ser un número',
            'amount_linaje_big.min' => 'El monto debe ser al menos $1,500 COP',
            'is_active.required' => 'El estado es obligatorio',
            'is_active.boolean' => 'El estado debe ser verdadero o falso',
            'discount_min_students.required' => 'El mínimo de estudiantes es obligatorio',
            'discount_min_students.min' => 'El mínimo de estudiantes debe ser al menos 2',
            'discount_percentage.required' => 'El porcentaje de descuento es obligatorio',
            'discount_percentage.max' => 'El porcentaje de descuento no puede ser mayor a 100%',
        ]);

        // Al menos un método de pago debe estar habilitado
        if (!$validated['enable_online_payment'] && !$validated['enable_manual_payment']) {
            flash_error('Debe haber al menos un método de pago habilitado.');
            return redirect()->back();
        }

        $paymentSetting = PaymentSetting::first();

        if ($paymentSetting) {
            $paymentSetting->update($validated);
            flash_success('Configuración de pagos actualizada correctamente');
        } else {
            PaymentSetting::create($validated);
            flash_success('Configuración de pagos creada correctamente');
        }

        return redirect()->back();
    }

    /**
     * Verificar estado de pago en Wompi manualmente
     */
    public function checkWompiStatus(Payment $payment)
    {
        // Verificar que el pago tenga un wompi_transaction_id o wompi_reference
        if (!$payment->wompi_transaction_id && !$payment->wompi_reference) {
            flash_error('Este pago no tiene información de Wompi para consultar.');
            return redirect()->back();
        }

        try {
            $transactionId = $payment->wompi_transaction_id;

            // Si no tiene transaction_id pero tiene reference, buscar por reference
            if (!$transactionId && $payment->wompi_reference) {
                flash_info('Este pago aún no tiene un ID de transacción registrado. Espere a que Wompi procese el pago.');
                return redirect()->back();
            }

            $config = $this->wompiService->getActiveConfig();

            // Consultar transacción en Wompi
            $response = Http::get("{$config['api_url']}/transactions/{$transactionId}");

            if (!$response->successful()) {
                \Log::error('Error consultando transacción en Wompi', [
                    'payment_id' => $payment->id,
                    'transaction_id' => $transactionId,
                    'response' => $response->body()
                ]);
                flash_error('No se pudo consultar el estado en Wompi. Verifique que el ID de transacción sea correcto.');
                return redirect()->back();
            }

            $transactionData = $response->json()['data'];
            $status = $transactionData['status'];

            // Actualizar el pago según el estado
            $originalStatus = $payment->status;

            if ($status === 'APPROVED' && $payment->status !== 'completed') {
                $payment->status = 'completed';
                $payment->payment_date = now();
                $payment->paid_amount = $payment->amount;
                $payment->remaining_amount = 0;
                $payment->payment_method = $transactionData['payment_method_type'] ?? $payment->payment_method;

                $payment->save();

                \Log::info('Pago actualizado manualmente desde Wompi', [
                    'payment_id' => $payment->id,
                    'transaction_id' => $transactionId,
                    'old_status' => $originalStatus,
                    'new_status' => 'completed'
                ]);

                flash_success('¡Pago verificado y actualizado! Estado en Wompi: APROBADO');
            } elseif ($status === 'DECLINED' || $status === 'ERROR') {
                if ($payment->status !== 'cancelled') {
                    $payment->status = 'cancelled';
                    $payment->save();

                    \Log::info('Pago rechazado verificado desde Wompi', [
                        'payment_id' => $payment->id,
                        'transaction_id' => $transactionId
                    ]);
                }

                flash_warning('El pago fue rechazado en Wompi. Estado: ' . $status);
            } elseif ($status === 'PENDING') {
                flash_info('El pago está pendiente en Wompi. Estado: PENDIENTE');
            } else {
                flash_info('Estado del pago en Wompi: ' . $status);
            }

            return redirect()->back();

        } catch (\Exception $e) {
            \Log::error('Error verificando estado en Wompi: ' . $e->getMessage(), [
                'payment_id' => $payment->id,
                'exception' => $e->getTraceAsString()
            ]);
            flash_error('Ocurrió un error al consultar el estado en Wompi: ' . $e->getMessage());
            return redirect()->back();
        }
    }

    /**
     * Webhook de Wompi para recibir notificaciones de pagos
     */
    public function wompiWebhook(Request $request)
    {
        \Log::info('Wompi Webhook recibido:', $request->all());

        $config = $this->wompiService->getActiveConfig();

        // Verificar firma del webhook
        $signature = $request->header('X-Event-Checksum');
        $eventData = $request->all();

        $expectedSignature = hash('sha256', json_encode($eventData['data']) . $config['events_secret']);

        if ($signature !== $expectedSignature) {
            \Log::error('Firma de webhook inválida');
            return response()->json(['error' => 'Firma inválida'], 401);
        }

        $event = $eventData['event'];

        // Manejar activación de payment source Nequi (autorización inicial única)
        if ($event === 'nequi_token.updated') {
            $tokenData = $eventData['data']['nequi_token'] ?? [];
            if (($tokenData['status'] ?? '') === 'AVAILABLE') {
                $sourceId = (string) ($tokenData['id'] ?? '');
                if ($sourceId) {
                    User::where('nequi_payment_source_id', $sourceId)
                        ->update(['nequi_subscription_active' => true]);
                    \Log::info('Nequi payment source activado', ['source_id' => $sourceId]);
                }
            }
            return response()->json(['message' => 'Nequi token procesado'], 200);
        }

        // Solo procesar eventos de transacciones
        if ($event !== 'transaction.updated') {
            return response()->json(['message' => 'Evento ignorado'], 200);
        }

        $transactionData = $eventData['data']['transaction'];

        // Buscar todos los pagos con esa referencia (puede ser cobro combinado Nequi)
        $payments = Payment::where('wompi_reference', $transactionData['reference'])->get();

        if ($payments->isEmpty()) {
            \Log::error('Pago no encontrado para referencia: ' . $transactionData['reference']);
            return response()->json(['error' => 'Pago no encontrado'], 404);
        }

        $payment = $payments->first();

        // IDEMPOTENCY CHECK
        if ($payment->wompi_transaction_id === $transactionData['id'] &&
            in_array($payment->status, ['completed', 'cancelled'])) {
            \Log::info('Webhook duplicado ignorado (ya procesado):', [
                'payment_id' => $payment->id,
                'transaction_id' => $transactionData['id'],
                'status' => $payment->status
            ]);
            return response()->json(['message' => 'Webhook ya procesado'], 200);
        }

        $status = $transactionData['status'];

        // Actualizar todos los pagos de esta referencia
        foreach ($payments as $p) {
            $p->wompi_transaction_id = $transactionData['id'];
            $p->payment_method = $transactionData['payment_method_type'] ?? 'nequi';
        }

        if ($status === 'APPROVED') {
            foreach ($payments as $p) {
                $p->status = 'completed';
                $p->payment_date = now();
                $p->paid_amount = $p->amount;
            }
            $payment->status = 'completed';
            $payment->payment_date = now();
            $payment->paid_amount = $payment->amount;
            $payment->remaining_amount = 0;

            // Si es pago con tarjeta, guardar token para cobros recurrentes
            if (isset($transactionData['payment_method']['type']) &&
                in_array($transactionData['payment_method']['type'], ['CARD', 'BANCOLOMBIA_TRANSFER'])) {

                // Verificar si hay un token de tarjeta
                if (isset($transactionData['payment_method']['extra']['token'])) {
                    $payment->card_token = $transactionData['payment_method']['extra']['token'];
                    $payment->payment_source_id = $transactionData['payment_source_id'] ?? null;
                    $payment->is_recurring = true;

                    // Guardar info de la tarjeta
                    if (isset($transactionData['payment_method']['extra']['last_four'])) {
                        $payment->last_4_digits = $transactionData['payment_method']['extra']['last_four'];
                    }
                    if (isset($transactionData['payment_method']['extra']['card_type'])) {
                        $payment->card_brand = $transactionData['payment_method']['extra']['card_type'];
                    }

                    // Establecer próxima fecha de cobro (30 días después)
                    $payment->next_charge_date = Carbon::now()->addDays(30);
                }
            }

            // Si es pago Nequi aprobado, guardar payment_source_id para cobros automáticos futuros
            if (($transactionData['payment_method_type'] ?? '') === 'NEQUI') {
                $sourceId = $transactionData['payment_source_id'] ?? null;
                if ($sourceId) {
                    // Identificar al responsable por el wompi_reference del pago
                    $studentId = $payment->student_id;
                    $student   = User::find($studentId);
                    // El pagador puede ser el estudiante mismo o su responsable
                    $payer = $student?->parent ?? $student;
                    if ($payer && !$payer->nequi_payment_source_id) {
                        $payer->update(['nequi_payment_source_id' => (string) $sourceId]);
                        \Log::info('Nequi payment_source_id guardado para cobros automáticos', [
                            'payer_id'  => $payer->id,
                            'source_id' => $sourceId,
                        ]);
                    }
                }
            }

            \Log::info('Pagos aprobados:', ['payment_ids' => $payments->pluck('id'), 'transaction_id' => $transactionData['id']]);

            // Email al padre del primer pago
            try {
                $recipient = $payment->student;
                $parent = $recipient->parent_id ? User::find($recipient->parent_id) : null;
                if ($parent?->email) {
                    Mail::to($parent->email)->send(new PaymentConfirmed($payment));
                }
            } catch (\Exception $e) {
                \Log::error('Error enviando email de confirmación: ' . $e->getMessage());
            }

        } elseif ($status === 'DECLINED' || $status === 'ERROR') {
            foreach ($payments as $p) {
                $p->status = 'cancelled';
            }
            \Log::warning('Pagos rechazados:', ['payment_ids' => $payments->pluck('id'), 'transaction_id' => $transactionData['id']]);
        }

        foreach ($payments as $p) {
            $p->save();
        }

        return response()->json(['message' => 'Webhook procesado exitosamente'], 200);
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\User;
use App\Models\AcademicProgram;
use App\Models\Enrollment;
use App\Models\PaymentSetting;
use App\Mail\PaymentConfirmed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Carbon\Carbon;

class PaymentController extends Controller
{
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

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->filled('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }

        // Solo mostrar pagos principales (no cuotas hijas)
        $query->whereNull('parent_payment_id');

        $payments = $query->orderBy('created_at', 'desc')->paginate(20);

        // Agregar información calculada a cada pago
        $payments->getCollection()->transform(function ($payment) {
            $payment->has_transactions = $payment->transactions->isNotEmpty();
            $payment->pending_balance = $payment->getPendingBalance();
            return $payment;
        });

        $students = User::role('Estudiante')->orderBy('name')->get(['id', 'name']);
        $programs = AcademicProgram::where('status', 'active')->orderBy('name')->get(['id', 'name']);

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'students' => $students,
            'programs' => $programs,
            'filters' => $request->only(['status', 'student_id', 'program_id', 'payment_type']),
        ]);
    }

    /**
     * Show form to create new payment
     */
    public function create()
    {
        // Cargar inscripciones activas con estudiante y programa
        $enrollments = Enrollment::with(['student', 'program'])
            ->where('status', 'active')
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
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'program_id' => 'nullable|exists:academic_programs,id',
            'enrollment_id' => 'nullable|exists:enrollments,id',
            'concept' => 'required|string|max:255',
            'payment_type' => 'nullable|in:single,partial',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'status' => 'required|in:pending,completed,overdue,cancelled',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ], [
            'student_id.required' => 'El estudiante es obligatorio',
            'student_id.exists' => 'El estudiante seleccionado no existe',
            'program_id.exists' => 'El programa seleccionado no existe',
            'enrollment_id.exists' => 'La inscripción seleccionada no existe',
            'concept.required' => 'El concepto del pago es obligatorio',
            'concept.max' => 'El concepto no puede exceder 255 caracteres',
            'amount.required' => 'El monto es obligatorio',
            'amount.numeric' => 'El monto debe ser un número',
            'amount.min' => 'El monto debe ser mayor o igual a 0',
            'due_date.required' => 'La fecha de vencimiento es obligatoria',
            'due_date.date' => 'La fecha debe ser válida',
            'status.required' => 'El estado es obligatorio',
            'status.in' => 'El estado debe ser: pendiente, completado, vencido o cancelado',
            'payment_method.max' => 'El método de pago no puede exceder 50 caracteres',
            'reference_number.max' => 'El número de referencia no puede exceder 100 caracteres',
            'notes.max' => 'Las notas no pueden exceder 500 caracteres',
        ]);

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
        $payment->load(['student', 'program', 'enrollment', 'recordedBy']);

        return Inertia::render('Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Show form to edit payment
     */
    public function edit(Payment $payment)
    {
        // Cargar inscripciones activas con estudiante y programa
        $enrollments = Enrollment::with(['student', 'program'])
            ->where('status', 'active')
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
            'payment' => $payment,
            'enrollments' => $enrollments,
        ]);
    }

    /**
     * Update a payment record
     */
    public function update(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'concept' => 'nullable|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:pending,completed,overdue,cancelled',
            'payment_method' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ], [
            'concept.max' => 'El concepto no puede exceder 255 caracteres',
            'amount.numeric' => 'El monto debe ser un número',
            'amount.min' => 'El monto debe ser mayor o igual a 0',
            'due_date.date' => 'La fecha debe ser válida',
            'status.in' => 'El estado debe ser: pendiente, completado, vencido o cancelado',
            'payment_method.max' => 'El método de pago no puede exceder 50 caracteres',
            'reference_number.max' => 'El número de referencia no puede exceder 100 caracteres',
            'notes.max' => 'Las notas no pueden exceder 500 caracteres',
        ]);

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

    /**
     * Generate invoice PDF (placeholder)
     */
    public function generateInvoice(Payment $payment)
    {
        // TODO: Implement PDF generation
        return redirect()->back()
            ->with('info', 'Generación de facturas próximamente');
    }

    /**
     * Create installment plan
     */
    public function createInstallments(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'program_id' => 'nullable|exists:academic_programs,id',
            'enrollment_id' => 'nullable|exists:enrollments,id',
            'concept' => 'required|string|max:255',
            'total_amount' => 'required|numeric|min:0',
            'number_of_installments' => 'required|integer|min:2|max:12',
            'start_date' => 'required|date',
        ], [
            'student_id.required' => 'El estudiante es obligatorio',
            'student_id.exists' => 'El estudiante seleccionado no existe',
            'concept.required' => 'El concepto es obligatorio',
            'total_amount.required' => 'El monto total es obligatorio',
            'total_amount.numeric' => 'El monto debe ser un número',
            'total_amount.min' => 'El monto debe ser mayor a 0',
            'number_of_installments.required' => 'El número de cuotas es obligatorio',
            'number_of_installments.integer' => 'El número de cuotas debe ser un entero',
            'number_of_installments.min' => 'Debe haber al menos 2 cuotas',
            'number_of_installments.max' => 'No puede haber más de 12 cuotas',
            'start_date.required' => 'La fecha de inicio es obligatoria',
            'start_date.date' => 'La fecha debe ser válida',
        ]);

        $installments = Payment::createInstallmentPlan(
            $validated['student_id'],
            $validated['program_id'],
            $validated['enrollment_id'],
            $validated['concept'],
            $validated['total_amount'],
            $validated['number_of_installments'],
            $validated['start_date']
        );

        flash_success("Plan de {$validated['number_of_installments']} cuotas creado exitosamente");
        return redirect()->route('pagos.index');
    }

    /**
     * Add transaction (partial payment) to a payment
     */
    public function addTransaction(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|max:50',
            'reference_number' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
        ], [
            'amount.required' => 'El monto del abono es obligatorio',
            'amount.numeric' => 'El monto debe ser un número',
            'amount.min' => 'El monto debe ser mayor a 0',
            'payment_method.required' => 'El método de pago es obligatorio',
        ]);

        // Validar que el monto no exceda el saldo pendiente
        $pendingBalance = $payment->getPendingBalance();
        if ($validated['amount'] > $pendingBalance) {
            flash_error('El monto del abono no puede exceder el saldo pendiente de $' . number_format($pendingBalance, 2));
            return redirect()->back();
        }

        $payment->addTransaction(
            $validated['amount'],
            $validated['payment_method'],
            $validated['reference_number'] ?? null,
            $validated['notes'] ?? null
        );

        flash_success('Abono registrado exitosamente');
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
            'monthly_amount' => ['required', 'numeric', 'min:1000'],
            'is_active' => ['required', 'boolean'],
        ], [
            'monthly_amount.required' => 'El monto mensual es obligatorio',
            'monthly_amount.numeric' => 'El monto debe ser un número',
            'monthly_amount.min' => 'El monto debe ser al menos $1,000 COP',
            'is_active.required' => 'El estado es obligatorio',
            'is_active.boolean' => 'El estado debe ser verdadero o falso',
        ]);

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
                // Intentar consultar por referencia (esto requiere buscar en el historial de transacciones)
                flash_info('Este pago aún no tiene un ID de transacción registrado. Espere a que Wompi procese el pago.');
                return redirect()->back();
            }

            // Consultar transacción en Wompi
            $response = Http::get("https://production.wompi.co/v1/transactions/{$transactionId}");

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

        // Verificar firma del webhook
        $signature = $request->header('X-Event-Checksum');
        $eventData = $request->all();

        $expectedSignature = hash('sha256', json_encode($eventData['data']) . config('wompi.events_secret'));

        if ($signature !== $expectedSignature) {
            \Log::error('Firma de webhook inválida');
            return response()->json(['error' => 'Firma inválida'], 401);
        }

        $event = $eventData['event'];
        $transactionData = $eventData['data']['transaction'];

        // Solo procesar eventos de transacciones aprobadas o rechazadas
        if ($event !== 'transaction.updated') {
            return response()->json(['message' => 'Evento ignorado'], 200);
        }

        // Buscar el pago por la referencia
        $payment = Payment::where('wompi_reference', $transactionData['reference'])->first();

        if (!$payment) {
            \Log::error('Pago no encontrado para referencia: ' . $transactionData['reference']);
            return response()->json(['error' => 'Pago no encontrado'], 404);
        }

        // Actualizar el pago según el estado de la transacción
        $status = $transactionData['status'];

        $payment->wompi_transaction_id = $transactionData['id'];
        $payment->payment_method = $transactionData['payment_method_type'];

        if ($status === 'APPROVED') {
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

            \Log::info('Pago aprobado:', ['payment_id' => $payment->id, 'transaction_id' => $transactionData['id']]);

            // Enviar email de confirmación al responsable o estudiante
            try {
                $recipient = $payment->student;

                // Si el estudiante tiene padre/guardian, enviar el email al padre
                if ($recipient->parent_id) {
                    $parent = User::find($recipient->parent_id);
                    if ($parent && $parent->email) {
                        Mail::to($parent->email)->send(new PaymentConfirmed($payment));
                        \Log::info('Email enviado al padre/guardian:', ['email' => $parent->email]);
                    }
                }

                // También enviar al estudiante si tiene email
                if ($recipient->email) {
                    Mail::to($recipient->email)->send(new PaymentConfirmed($payment));
                    \Log::info('Email enviado al estudiante:', ['email' => $recipient->email]);
                }
            } catch (\Exception $e) {
                \Log::error('Error enviando email de confirmación: ' . $e->getMessage());
            }

        } elseif ($status === 'DECLINED' || $status === 'ERROR') {
            $payment->status = 'cancelled';

            \Log::warning('Pago rechazado:', ['payment_id' => $payment->id, 'transaction_id' => $transactionData['id']]);
        }

        $payment->save();

        return response()->json(['message' => 'Webhook procesado exitosamente'], 200);
    }
}
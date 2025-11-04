<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\User;
use App\Models\AcademicProgram;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PaymentController extends Controller
{
    /**
     * Display payments dashboard
     */
    public function index()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $today = Carbon::today();

        // Calculate income this month (completed payments)
        $monthlyPayments = Payment::where('status', 'completed')
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->get();

        $totalIngresosMes = $monthlyPayments->sum('amount');

        // Calculate previous month for comparison
        $previousMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $previousMonthEnd = Carbon::now()->subMonth()->endOfMonth();
        $previousMonthTotal = Payment::where('status', 'completed')
            ->whereBetween('payment_date', [$previousMonthStart, $previousMonthEnd])
            ->sum('amount');

        $cambioPercentage = $previousMonthTotal > 0
            ? round((($totalIngresosMes - $previousMonthTotal) / $previousMonthTotal) * 100, 1)
            : 0;

        $cambioTexto = $cambioPercentage >= 0
            ? "+{$cambioPercentage}% vs mes anterior"
            : "{$cambioPercentage}% vs mes anterior";

        // Calculate pending payments
        $pagosPendientes = Payment::where('status', 'pending')->get();
        $totalPendiente = $pagosPendientes->sum('amount');
        $estudiantesPendientes = $pagosPendientes->pluck('student_id')->unique()->count();
        $vencidos = Payment::where('status', 'overdue')->sum('amount');
        $porVencer = Payment::where('status', 'pending')
            ->where('due_date', '<=', Carbon::now()->addWeek())
            ->where('due_date', '>=', $today)
            ->sum('amount');

        // Payment methods breakdown
        $paymentMethodsCount = Payment::where('status', 'completed')
            ->whereBetween('payment_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('payment_method, count(*) as count')
            ->groupBy('payment_method')
            ->get();

        $totalCount = $paymentMethodsCount->sum('count');

        $metodosPago = $paymentMethodsCount->map(function ($method) use ($totalCount) {
            $percentage = $totalCount > 0 ? round(($method->count / $totalCount) * 100) : 0;
            $nombre = match($method->payment_method) {
                'credit_card' => 'Tarjeta',
                'transfer' => 'Transferencia',
                'cash' => 'Efectivo',
                'paypal' => 'PayPal',
                'stripe' => 'Stripe',
                default => ucfirst($method->payment_method ?? 'Otro')
            };

            return [
                'nombre' => $nombre,
                'porcentaje' => $percentage,
                'icon' => $method->payment_method ?? 'card',
            ];
        });

        // Recent transactions
        $recentPayments = Payment::with(['student', 'program'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $transacciones = $recentPayments->map(function ($payment) {
            $estado = match($payment->status) {
                'completed' => 'completado',
                'pending' => 'pendiente',
                'overdue' => 'rechazado',
                'cancelled' => 'rechazado',
                default => 'pendiente'
            };

            $metodo = match($payment->payment_method) {
                'credit_card' => 'Tarjeta',
                'transfer' => 'Transferencia',
                'cash' => 'Efectivo',
                'paypal' => 'PayPal',
                'stripe' => 'Stripe',
                default => ucfirst($payment->payment_method ?? 'N/A')
            };

            return [
                'id' => $payment->id,
                'fecha' => $payment->payment_date ? $payment->payment_date->format('d M Y') : $payment->due_date->format('d M Y'),
                'hora' => $payment->created_at->format('h:i A'),
                'estudiante' => [
                    'nombre' => $payment->student->name,
                    'tipo' => $payment->program?->name ?? 'General',
                    'avatar' => null,
                ],
                'concepto' => $payment->concept,
                'metodo' => $metodo,
                'metodoBadge' => strtolower($payment->payment_method ?? 'card'),
                'monto' => $payment->amount,
                'estado' => $estado,
                'acciones' => ['ver', 'descargar'],
            ];
        });

        // Goal target (you can make this configurable)
        $objetivo = 64000;
        $porcentajeObjetivo = $objetivo > 0 ? round(($totalIngresosMes / $objetivo) * 100) : 0;

        return Inertia::render('Pay/Index', [
            'ingresosMes' => [
                'total' => $totalIngresosMes,
                'cambio' => $cambioTexto,
                'porcentaje' => $porcentajeObjetivo,
                'objetivo' => $objetivo,
            ],
            'pagosPendientes' => [
                'total' => $totalPendiente,
                'estudiantes' => $estudiantesPendientes,
                'vencidos' => $vencidos,
                'porVencer' => $porVencer,
            ],
            'metodosPago' => $metodosPago,
            'transacciones' => $transacciones,
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

        // If status is completed and no payment_date, set it to now
        if ($validated['status'] === 'completed' && !isset($validated['payment_date'])) {
            $validated['payment_date'] = now();
        }

        $payment = Payment::create($validated);

        return redirect()->back()
            ->with('success', 'Pago registrado exitosamente');
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

        return redirect()->back()
            ->with('success', 'Pago actualizado exitosamente');
    }

    /**
     * Delete a payment record
     */
    public function destroy(Payment $payment)
    {
        $payment->delete();

        return redirect()->back()
            ->with('success', 'Pago eliminado exitosamente');
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

        return redirect()->back()
            ->with('success', 'Pago marcado como pagado exitosamente');
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
}
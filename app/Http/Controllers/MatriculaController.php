<?php

namespace App\Http\Controllers;

use App\Models\AcademicProgram;
use App\Models\Payment;
use App\Http\Requests\EnrollmentRequest;
use App\Services\EnrollmentService;
use App\Services\WompiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MatriculaController extends Controller
{
    public function __construct(
        protected EnrollmentService $enrollmentService,
        protected WompiService $wompiService
    ) {}

    /**
     * Mostrar el formulario de matrícula pública
     */
    public function create()
    {
        $programs = AcademicProgram::where('status', 'active')
            ->with(['schedules' => function ($query) {
                $query->where('status', 'active')
                    ->with('professor:id,name')
                    ->withCount(['enrollments as enrolled_count' => function ($q) {
                        $q->where('status', 'enrolled');
                    }])
                    ->select('id', 'academic_program_id', 'days_of_week', 'start_time', 'end_time', 'professor_id', 'max_students', 'status');
            }])
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        // Agregar información de cupos disponibles (ahora sin N+1 queries)
        $programs->each(function ($program) {
            $program->schedules->each(function ($schedule) {
                $schedule->available_slots = $schedule->max_students - $schedule->enrolled_count;
                $schedule->has_capacity = $schedule->available_slots > 0;
            });
        });

        // Filtrar solo programas que tienen horarios
        $programs = $programs->filter(fn($program) => $program->schedules->count() > 0)->values();

        return Inertia::render('Matricula/Create', [
            'programs' => $programs,
        ]);
    }

    /**
     * Procesar el formulario de matrícula
     */
    public function store(EnrollmentRequest $request)
    {
        \Log::info('===== DATOS RAW RECIBIDOS =====');
        \Log::info('is_minor (raw):', ['value' => $request->input('is_minor'), 'type' => gettype($request->input('is_minor'))]);
        \Log::info('estudiantes (raw):', ['value' => $request->input('estudiantes'), 'exists' => $request->has('estudiantes')]);
        \Log::info('All input:', $request->all());

        \Log::info('===== DATOS VALIDADOS =====');
        \Log::info('Datos de matrícula validados:', $request->validated());


        try {

            // Procesar según el tipo de matrícula
            $result = $request->is_minor
                ? $this->enrollmentService->processMinorEnrollment($request->validated())
                : $this->enrollmentService->processAdultEnrollment($request->validated());

            $payments = $result['payments'];
            $responsible = $result['responsible'];
            
  \Log::info ($responsible);
            // Redirigir al checkout
            return $this->redirectToCheckout($payments);

        } catch (\Exception $e) {
            \Log::error('Error al procesar matrícula:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            // Agregar el mensaje de error específico para debugging
            $errorMessage = config('app.debug')
                ? 'Error: ' . $e->getMessage()
                : 'Ocurrió un error al procesar la matrícula. Por favor intenta nuevamente.';

            // Usar back() con flash para que Inertia lo maneje correctamente
            return back()->with('error', $errorMessage)->withInput();
        }
    }

    /**
     * Redirigir al checkout apropiado
     */
    protected function redirectToCheckout(array $payments)
    {
        if (count($payments) === 1) {
            return redirect()->route('matricula.checkout', ['payment' => $payments[0]->id]);
        }

        $paymentIds = collect($payments)->pluck('id')->implode(',');
        return redirect()->route('matricula.checkout.multiple', ['payments' => $paymentIds]);
    }

    /**
     * Mostrar página de checkout para múltiples pagos
     */
    public function checkoutMultiple(Request $request)
    {
        $paymentIds = array_filter(
            explode(',', $request->query('payments', '')),
            'is_numeric'
        );

        if (empty($paymentIds)) {
            flash_error('No se encontraron pagos para procesar.');
            return redirect()->route('home');
        }

        $payments = Payment::with(['student', 'program', 'enrollment'])
            ->whereIn('id', $paymentIds)
            ->where('status', 'pending')
            ->get();

        if ($payments->isEmpty()) {
            flash_error('No se encontraron pagos pendientes.');
            return redirect()->route('home');
        }

        $config = $this->wompiService->getActiveConfig();

        // Preparar datos para cada pago
        $paymentsData = $payments->map(function ($payment) use ($config) {
            $checkoutData = $this->wompiService->prepareCheckoutData(
                $payment->wompi_reference,
                $payment->amount,
                $config['public_key'],
                $config['integrity_secret']
            );

            return array_merge([
                'id' => $payment->id,
                'concept' => $payment->concept,
                'amount' => $payment->amount,
                'wompi_reference' => $payment->wompi_reference,
                'student' => $payment->student,
                'program' => $payment->program,
            ], $checkoutData);
        });

        return Inertia::render('Matricula/CheckoutMultiple', [
            'payments' => $paymentsData,
            'totalAmount' => $payments->sum('amount'),
            'wompiPublicKey' => $config['public_key'],
            'redirectUrl' => config('wompi.redirect_url'),
        ]);
    }

    /**
     * Mostrar página de checkout individual
     */
    public function checkout($paymentId)
    {
        $payment = Payment::with(['student', 'program', 'enrollment'])
            ->findOrFail($paymentId);

        // Validar que el pago sea accesible
        if ($payment->status !== 'pending') {
            flash_error('Este pago ya ha sido procesado.');
            return redirect()->route('home');
        }

        // Validar que el pago sea reciente (creado en las últimas 24 horas)
        if ($payment->created_at->diffInHours(now()) > 24) {
            flash_error('Este enlace de pago ha expirado. Por favor, contacte al administrador.');
            return redirect()->route('home');
        }

        // Obtener configuración de Wompi
        $config = $this->wompiService->getActiveConfig();
        $amountInCents = (int) ($payment->amount * 100);

        // Generar firma de integridad solo para producción
        // En test mode, Wompi no requiere firma
        $integritySignature = null;
        if (!empty($config['integrity_secret']) && !$config['is_test']) {
            $integrityString = $payment->wompi_reference . $amountInCents . 'COP' . $config['integrity_secret'];
            $integritySignature = hash('sha256', $integrityString);
        }

        return Inertia::render('Matricula/Checkout', [
            'payment' => $payment,
            'wompi_config' => [
                'public_key' => $config['public_key'],
                'integrity_signature' => $integritySignature,
            ],
        ]);
    }

    /**
     * Crear payment link de Wompi y redirigir
     */
    public function createPaymentLink($paymentId)
    {
        try {
            $payment = Payment::with(['student', 'program'])
                ->findOrFail($paymentId);

            // Validar que el pago esté pendiente
            if ($payment->status !== 'pending') {
                flash_error('Este pago ya ha sido procesado.');
                return redirect()->route('home');
            }

            $customerEmail = $payment->student->email ?? 'noreply@academialinaje.com';
            $customerName = trim($payment->student->name . ' ' . $payment->student->last_name);
            $description = $payment->concept ?? 'Pago de matrícula - ' . $payment->program->name;

            // Crear payment link en Wompi
            $paymentLink = $this->wompiService->createPaymentLink(
                $payment->wompi_reference,
                $payment->amount,
                $customerEmail,
                $customerName,
                $description
            );

            // Guardar el payment_link_id en el pago para referencia
            $payment->update([
                'metadata' => array_merge($payment->metadata ?? [], [
                    'wompi_payment_link_id' => $paymentLink['id'],
                    'wompi_payment_link_url' => $paymentLink['url'] ?? null,
                ])
            ]);

            \Log::info('Payment link creado, redirigiendo a Wompi', [
                'payment_id' => $payment->id,
                'wompi_url' => $paymentLink['url'] ?? null,
                'wompi_id' => $paymentLink['id'] ?? null
            ]);

            // Validar que el URL existe antes de redirigir
            if (empty($paymentLink['url'])) {
                throw new \Exception('No se pudo obtener el URL de pago de Wompi');
            }

            // Retornar el URL como JSON para que el frontend haga el redirect
            // No podemos usar redirect()->away() porque es una petición de Inertia
            return response()->json([
                'redirect_url' => $paymentLink['url']
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al crear payment link de Wompi', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            flash_error('Error al procesar el pago: ' . $e->getMessage());
            return back();
        }
    }

    /**
     * Página de confirmación después del pago
     */
    public function confirmation(Request $request)
    {
        $paymentId = $request->query('id');

        if (!$paymentId) {
            flash_error('No se encontró información del pago.');
            return redirect()->route('home');
        }

        $payment = Payment::with(['student', 'program'])
            ->find($paymentId);

        if (!$payment) {
            flash_error('No se encontró el pago especificado.');
            return redirect()->route('home');
        }

        return Inertia::render('Matricula/Confirmation', [
            'payment' => $payment,
        ]);
    }
}

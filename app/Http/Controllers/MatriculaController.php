<?php

namespace App\Http\Controllers;

use App\Models\AcademicProgram;
use App\Models\Payment;
use App\Http\Requests\EnrollmentRequest;
use App\Services\EnrollmentService;
use App\Services\WompiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\EnrollmentManualPayment;
use App\Mail\EnrollmentWelcome;
use App\Models\SmtpSetting;
use App\Models\PaymentSetting;
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
            ->where('is_demo', false)
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

        $paymentSetting = PaymentSetting::where('is_active', true)->first();

        return Inertia::render('Matricula/Create', [
            'programs' => $programs,
            'paymentMethods' => [
                'online' => $paymentSetting?->enable_online_payment ?? true,
                'manual' => $paymentSetting?->enable_manual_payment ?? true,
            ],
            'modalityPrices' => [
                'Linaje Kids' => (float) ($paymentSetting?->amount_linaje_kids ?? 100000),
                'Linaje Teens' => (float) ($paymentSetting?->amount_linaje_teens ?? 100000),
                'Linaje Big' => (float) ($paymentSetting?->amount_linaje_big ?? 100000),
            ],
            'discountInfo' => [
                'min_students' => $paymentSetting?->discount_min_students ?? 3,
                'percentage' => (float) ($paymentSetting?->discount_percentage ?? 0),
            ],
        ]);
    }

    /**
     * Procesar el formulario de matrícula/demo
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
            // Verificar si es una inscripción para clase demo
            $programId = $request->is_minor
                ? $request->input('estudiantes.0.program_id')
                : $request->input('responsable.program_id');

            $program = AcademicProgram::find($programId);

            // Si es un programa demo, solo guardar solicitud sin crear usuarios
            if ($program && $program->is_demo) {
                return $this->storeDemoRequest($request->validated());
            }

            // Si NO es demo, procesamiento normal de matrícula completa
            $result = $request->is_minor
                ? $this->enrollmentService->processMinorEnrollment($request->validated())
                : $this->enrollmentService->processAdultEnrollment($request->validated());

            $payments = $result['payments'];

            // Enviar correo de bienvenida con datos de matrícula y enlace para establecer contraseña
            try {
                $this->configureSmtpFromDatabase();
                Mail::to($result['responsible']->email)
                    ->send(new EnrollmentWelcome(
                        $result['responsible'],
                        $payments,
                        (bool) $request->is_minor
                    ));
            } catch (\Exception $e) {
                \Log::error('Error al enviar correo de bienvenida', [
                    'user_id' => $result['responsible']->id,
                    'email' => $result['responsible']->email,
                    'error' => $e->getMessage(),
                ]);
            }

            // Verificar método de pago
            $paymentMethod = $request->input('payment_method', 'online');

            if ($paymentMethod === 'manual') {
                // Pago manual - marcar pagos como pendientes de pago manual y mostrar confirmación
                foreach ($payments as $payment) {
                    $payment->update([
                        'payment_method' => 'manual',
                        'notes' => 'Pago manual - pendiente de confirmación por administrador',
                    ]);

                    // Enviar correo de matrícula con pago pendiente
                    try {
                        $payment->load(['student', 'program']);
                        $email = $payment->student->email ?? null;
                        if ($email) {
                            $this->configureSmtpFromDatabase();
                            Mail::to($email)->send(new EnrollmentManualPayment($payment));
                        }
                    } catch (\Exception $e) {
                        \Log::error('Error al enviar correo de pago manual', [
                            'payment_id' => $payment->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                return redirect()->route('matricula.confirmation')->with('success', 'Tu matrícula ha sido registrada exitosamente. Acércate a nuestras instalaciones para realizar el pago.');
            }

            // Redirigir al checkout para pago en línea
            return $this->redirectToCheckout($payments);

        } catch (\Exception $e) {
            \Log::error('Error al procesar matrícula:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            $errorMessage = config('app.debug')
                ? 'Error: ' . $e->getMessage()
                : 'Ocurrió un error al procesar la solicitud. Por favor intenta nuevamente.';

            return back()->with('error', $errorMessage)->withInput();
        }
    }

    /**
     * Guardar solicitud de clase demo (sin crear usuarios ni pagos)
     */
    protected function storeDemoRequest(array $data)
    {
        try {
            $responsable = $data['responsable'];
            $isMinor = $data['is_minor'];

            // Preparar datos de estudiantes si es menor
            $studentsData = null;
            if ($isMinor && isset($data['estudiantes'])) {
                $studentsData = collect($data['estudiantes'])->map(function ($student) {
                    return [
                        'name' => $student['name'],
                        'last_name' => $student['last_name'],
                        'document_type' => $student['document_type'],
                        'document_number' => $student['document_number'],
                        'birth_date' => $student['birth_date'] ?? null,
                        'gender' => $student['gender'],
                        'email' => $student['email'] ?? null,
                        'program_id' => $student['program_id'],
                        'schedule_id' => $student['schedule_id'] ?? null,
                        'datos_musicales' => $student['datos_musicales'] ?? null,
                    ];
                })->toArray();
            }

            // Crear solicitud de demo
            $demoRequest = \App\Models\DemoRequest::create([
                'responsible_name' => $responsable['name'],
                'responsible_last_name' => $responsable['last_name'],
                'responsible_email' => $responsable['email'],
                'responsible_phone' => $responsable['phone'] ?? null,
                'responsible_mobile' => $responsable['mobile'],
                'responsible_document_type' => $responsable['document_type'],
                'responsible_document_number' => $responsable['document_number'],
                'responsible_birth_date' => $responsable['birth_date'],
                'responsible_gender' => $responsable['gender'],
                'responsible_address' => $responsable['address'],
                'responsible_city' => $responsable['city'],
                'responsible_department' => $responsable['department'],
                'is_minor' => $isMinor,
                'program_id' => $isMinor ? $data['estudiantes'][0]['program_id'] : $responsable['program_id'],
                'schedule_id' => $isMinor ? ($data['estudiantes'][0]['schedule_id'] ?? null) : ($responsable['schedule_id'] ?? null),
                'students_data' => $studentsData,
                'status' => 'pending',
            ]);

            \Log::info('Solicitud de clase demo creada exitosamente', [
                'demo_request_id' => $demoRequest->id,
                'responsible_email' => $demoRequest->responsible_email,
            ]);

            // Redirigir a página de confirmación simple
            return redirect()->route('matricula.demo.confirmacion', ['request' => $demoRequest->id]);

        } catch (\Exception $e) {
            \Log::error('Error al guardar solicitud demo:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
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
        // Validar que Wompi esté activo antes de permitir el pago
        if (!$this->wompiService->isPaymentActive()) {
            flash_info('You are enrolled, but you must contact the administrator to continue the payment process.');
            return redirect()->route('home');
        }

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

        // Validar que Wompi esté activo antes de permitir el pago
        if (!$this->wompiService->isPaymentActive()) {
            flash_info('You are enrolled, but you must contact the administrator to continue the payment process.');
            return redirect()->route('home');
        }

        // Validar que el pago sea accesible
        if ($payment->status !== 'pending') {
            \Log::info('Pago ya procesado', [
                'payment_id' => $payment->id,
                'status' => $payment->status,
            ]);
            flash_error('Este pago ya ha sido procesado.');
            return redirect()->route('home');
        }

        // Validar que el pago sea reciente (creado en las últimas 24 horas)
        if ($payment->created_at->diffInHours(now()) > 24) {
            \Log::info('Pago expirado', [
                'payment_id' => $payment->id,
                'created_at' => $payment->created_at,
                'hours_diff' => $payment->created_at->diffInHours(now()),
            ]);
            flash_error('Este enlace de pago ha expirado. Por favor, contacte al administrador.');
            return redirect()->route('home');
        }

        // Obtener configuración de Wompi
        $config = $this->wompiService->getActiveConfig();

        \Log::info($config);
        /**
         * Preparar datos de checkout con firma de integridad
         *
         * IMPORTANTE: El servicio automáticamente:
         * - Detecta si es modo test (pub_test_*) o producción (pub_prod_*)
         * - En modo test: integrity_signature será null (no requerida)
         * - En modo producción: genera la firma SHA256 si hay integrity_secret
         *
         * La firma se genera como: hash('sha256', reference + amountInCents + currency + secret)
         */
        $checkoutData = $this->wompiService->prepareCheckoutData(
            $payment->wompi_reference,
            $payment->amount,
            $config['public_key'],
            $config['integrity_secret']
        );

        $paymentSetting = PaymentSetting::first();

        return Inertia::render('Matricula/Checkout', [
            'payment' => $payment,
            'wompi_config' => [
                'public_key' => $config['public_key'],
                'integrity_signature' => $checkoutData['integrity_signature'],
            ],
            'paymentMethods' => [
                'online' => $paymentSetting?->enable_online_payment ?? true,
                'manual' => $paymentSetting?->enable_manual_payment ?? true,
            ],
        ]);
    }

    /**
     * Crear payment link de Wompi y redirigir
     */
    public function createPaymentLink($paymentId)
    {
        // Validar que Wompi esté activo antes de crear payment link
        if (!$this->wompiService->isPaymentActive()) {
            flash_info('You are enrolled, but you must contact the administrator to continue the payment process.');
            return redirect()->route('home');
        }

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
     * Procesar pago manual desde la página de checkout
     */
    public function checkoutManualPayment($paymentId)
    {
        $payment = Payment::with(['student', 'program'])->findOrFail($paymentId);

        if ($payment->status !== 'pending') {
            flash_error('Este pago ya ha sido procesado.');
            return redirect()->route('home');
        }

        $payment->update([
            'payment_method' => 'manual',
            'notes' => 'Pago manual - pendiente de confirmación por administrador',
        ]);

        // Enviar correo de confirmación de matrícula con pago pendiente
        try {
            $email = $payment->student->email;
            if ($email) {
                $this->configureSmtpFromDatabase();
                Mail::to($email)->send(new EnrollmentManualPayment($payment));
            }
        } catch (\Exception $e) {
            \Log::error('Error al enviar correo de pago manual', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);
        }

        return redirect()->route('matricula.confirmation')
            ->with('success', 'Tu matrícula ha sido registrada exitosamente. Acércate a nuestras instalaciones para realizar el pago.');
    }

    /**
     * Página de confirmación después del pago
     */
    public function confirmation(Request $request)
    {
        $paymentId = $request->query('id');

        // Si no hay paymentId pero hay mensaje de éxito, es pago manual
        if (!$paymentId && session('success')) {
            return Inertia::render('Matricula/Confirmation', [
                'payment' => null,
                'status' => 'MANUAL',
                'transactionId' => null,
                'message' => session('success'),
            ]);
        }

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
            'status' => $payment->status ?? 'PENDING',
            'transactionId' => $payment->transaction_id ?? $payment->id,
        ]);
    }

    /**
     * Página de confirmación para solicitud de clase demo
     */
    public function demoConfirmation($requestId)
    {
        $demoRequest = \App\Models\DemoRequest::with(['program', 'schedule'])
            ->findOrFail($requestId);

        return Inertia::render('Matricula/DemoConfirmation', [
            'demoRequest' => $demoRequest,
        ]);
    }

    /**
     * Configurar SMTP dinámicamente desde la base de datos y purgar el mailer cacheado.
     */
    private function configureSmtpFromDatabase(): void
    {
        $smtpSetting = SmtpSetting::where('is_active', true)->first();

        if ($smtpSetting) {
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => $smtpSetting->host,
                'mail.mailers.smtp.port' => $smtpSetting->port,
                'mail.mailers.smtp.username' => $smtpSetting->username,
                'mail.mailers.smtp.password' => $smtpSetting->password,
                'mail.mailers.smtp.encryption' => $smtpSetting->encryption,
                'mail.from.address' => $smtpSetting->from_address,
                'mail.from.name' => $smtpSetting->from_name,
            ]);

            // Purgar el mailer cacheado para que use la nueva configuración
            Mail::purge('smtp');
        }
    }
}

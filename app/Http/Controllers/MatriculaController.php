<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AcademicProgram;
use App\Models\Enrollment;
use App\Models\ParentGuardian;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;

class MatriculaController extends Controller
{
    /**
     * Mostrar el formulario de matrícula pública
     */
    public function create()
    {
        $programs = AcademicProgram::where('status', 'active')
            ->with(['schedules' => function ($query) {
                $query->where('status', 'active')
                    ->with('professor:id,name')
                    ->select('id', 'academic_program_id', 'days_of_week', 'start_time', 'end_time', 'professor_id', 'max_students', 'status');
            }])
            ->orderBy('name')
            ->get(['id', 'name', 'description']);

        // Agregar información de cupos disponibles a cada horario
        $programs->each(function ($program) {
            $program->schedules->each(function ($schedule) {
                $enrolledCount = $schedule->enrollments()->where('status', 'enrolled')->count();
                $schedule->enrolled_count = $enrolledCount;
                $schedule->available_slots = $schedule->max_students - $enrolledCount;
                $schedule->has_capacity = $schedule->available_slots > 0;
            });
        });

        // Filtrar solo programas que tienen horarios
        $programs = $programs->filter(function ($program) {
            return $program->schedules->count() > 0;
        })->values();

        return Inertia::render('Matricula/Create', [
            'programs' => $programs,
        ]);
    }

    /**
     * Procesar el formulario de matrícula
     */
    public function store(Request $request)
    {
        // Debug: Ver qué datos llegan
        \Log::info('Datos de matrícula recibidos:', $request->all());

        // Validación completa del formulario
        $validated = $request->validate([
            // Datos del responsable (quien se registra)
            'responsable.name' => ['required', 'string', 'max:255'],
            'responsable.last_name' => ['required', 'string', 'max:255'],
            'responsable.email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'responsable.password' => ['required', 'string', 'min:8', 'confirmed'],
            'responsable.document_type' => ['required', Rule::in(['TI', 'CC', 'CE', 'Pasaporte'])],
            'responsable.document_number' => ['required', 'string', 'max:50', 'unique:users,document_number'],
            'responsable.birth_place' => ['nullable', 'string', 'max:255'],
            'responsable.birth_date' => ['required', 'date', 'before:today'],
            'responsable.gender' => ['required', Rule::in(['M', 'F'])],
            'responsable.address' => ['required', 'string'],
            'responsable.neighborhood' => ['nullable', 'string', 'max:255'],
            'responsable.phone' => ['nullable', 'string', 'max:20'],
            'responsable.mobile' => ['required', 'string', 'max:20'],
            'responsable.city' => ['required', 'string', 'max:255'],
            'responsable.department' => ['required', 'string', 'max:255'],

            // Indica si el estudiante es el mismo que el responsable o es un menor
            'is_minor' => ['required', 'boolean'],

            // Si NO es menor (adulto que se inscribe a sí mismo)
            'responsable.plays_instrument' => ['required_if:is_minor,false', 'boolean'],
            'responsable.instruments_played' => ['nullable', 'string'],
            'responsable.has_music_studies' => ['required_if:is_minor,false', 'boolean'],
            'responsable.music_schools' => ['nullable', 'string'],
            'responsable.desired_instrument' => ['required_if:is_minor,false', 'string', 'max:255'],
            'responsable.modality' => ['required_if:is_minor,false', Rule::in(['Linaje Kids', 'Linaje Teens', 'Linaje Big'])],
            'responsable.current_level' => ['required_if:is_minor,false', 'integer', 'min:1', 'max:10'],
            'responsable.program_id' => ['required_if:is_minor,false', 'exists:academic_programs,id'],
            'responsable.schedule_id' => ['nullable', 'exists:schedules,id'],

            // Array de estudiantes (si es menor)
            'estudiantes' => ['required_if:is_minor,true', 'array', 'min:1', 'max:10'],
            'estudiantes.*.name' => ['required', 'string', 'max:255'],
            'estudiantes.*.last_name' => ['required', 'string', 'max:255'],
            'estudiantes.*.email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'estudiantes.*.document_type' => ['required', Rule::in(['TI', 'CC', 'CE', 'Pasaporte'])],
            'estudiantes.*.document_number' => ['required', 'string', 'max:50', 'unique:users,document_number'],
            'estudiantes.*.birth_place' => ['nullable', 'string', 'max:255'],
            'estudiantes.*.birth_date' => ['required', 'date', 'before:today'],
            'estudiantes.*.gender' => ['required', Rule::in(['M', 'F'])],
            'estudiantes.*.datos_musicales.plays_instrument' => ['required', 'boolean'],
            'estudiantes.*.datos_musicales.instruments_played' => ['nullable', 'string'],
            'estudiantes.*.datos_musicales.has_music_studies' => ['required', 'boolean'],
            'estudiantes.*.datos_musicales.music_schools' => ['nullable', 'string'],
            'estudiantes.*.datos_musicales.desired_instrument' => ['required', 'string', 'max:255'],
            'estudiantes.*.datos_musicales.modality' => ['required', Rule::in(['Linaje Kids', 'Linaje Teens', 'Linaje Big'])],
            'estudiantes.*.datos_musicales.current_level' => ['required', 'integer', 'min:1', 'max:10'],
            'estudiantes.*.program_id' => ['required', 'exists:academic_programs,id'],
            'estudiantes.*.schedule_id' => ['nullable', 'exists:schedules,id'],

            // Autorización y compromiso
            'parental_authorization' => [
                function ($attribute, $value, $fail) use ($request) {
                    // Solo validar si is_minor es true
                    if ($request->input('is_minor') == true) {
                        if (!$value || $value !== true) {
                            $fail('Debe aceptar la autorización parental para menores de edad.');
                        }
                    }
                },
            ],
            'payment_commitment' => ['required', 'accepted'],
        ], [
            // Mensajes personalizados - Responsable
            'responsable.name.required' => 'El nombre del responsable es obligatorio',
            'responsable.last_name.required' => 'Los apellidos del responsable son obligatorios',
            'responsable.email.required' => 'El correo electrónico es obligatorio',
            'responsable.email.unique' => 'Este correo electrónico ya está registrado',
            'responsable.password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'responsable.password.confirmed' => 'Las contraseñas no coinciden',
            'responsable.document_number.required' => 'El número de documento es obligatorio',
            'responsable.document_number.unique' => 'Este número de documento ya está registrado',
            'responsable.birth_date.required' => 'La fecha de nacimiento es obligatoria',
            'responsable.birth_date.before' => 'La fecha de nacimiento debe ser anterior a hoy',
            'responsable.mobile.required' => 'El número de celular es obligatorio',
            'responsable.address.required' => 'La dirección es obligatoria',
            'responsable.city.required' => 'La ciudad es obligatoria',
            'responsable.department.required' => 'El departamento es obligatorio',

            // Mensajes - Datos musicales responsable
            'responsable.desired_instrument.required_if' => 'Debe indicar el instrumento que desea estudiar',
            'responsable.modality.required_if' => 'Debe seleccionar una modalidad',
            'responsable.program_id.required_if' => 'Debe seleccionar un programa académico',

            // Mensajes - Estudiantes
            'estudiantes.required_if' => 'Debe agregar al menos un estudiante',
            'estudiantes.min' => 'Debe agregar al menos un estudiante',
            'estudiantes.max' => 'No puede agregar más de 10 estudiantes',
            'estudiantes.*.name.required' => 'El nombre del estudiante es obligatorio',
            'estudiantes.*.last_name.required' => 'Los apellidos del estudiante son obligatorios',
            'estudiantes.*.email.unique' => 'Este correo electrónico ya está registrado',
            'estudiantes.*.document_number.required' => 'El número de documento del estudiante es obligatorio',
            'estudiantes.*.document_number.unique' => 'Este número de documento ya está registrado',
            'estudiantes.*.birth_date.required' => 'La fecha de nacimiento del estudiante es obligatoria',
            'estudiantes.*.birth_date.before' => 'La fecha de nacimiento debe ser anterior a hoy',
            'estudiantes.*.gender.required' => 'El género del estudiante es obligatorio',
            'estudiantes.*.datos_musicales.desired_instrument.required' => 'Debe indicar el instrumento que el estudiante desea estudiar',
            'estudiantes.*.datos_musicales.modality.required' => 'Debe seleccionar una modalidad para el estudiante',
            'estudiantes.*.program_id.required' => 'Debe seleccionar un programa académico para cada estudiante',

            // Mensajes - Autorizaciones
            'payment_commitment.accepted' => 'Debe aceptar el compromiso de pago',
            'parental_authorization.accepted' => 'Debe aceptar la autorización parental',
        ]);

        DB::beginTransaction();

        try {
            // 1. Crear el usuario responsable
            $responsableData = $validated['responsable'];
            $responsableData['password'] = Hash::make($responsableData['password']);
            $responsableData['user_type'] = $validated['is_minor'] ? 'guardian' : 'both';

            $responsable = User::create($responsableData);
            $responsable->assignRole('Estudiante');

            $payments = [];
            $enrollments = [];

            // 2. Si NO es menor, el responsable ES el estudiante
            if (!$validated['is_minor']) {
                // El responsable es el estudiante adulto que se inscribe a sí mismo
                // Necesita tener datos musicales en el formulario

                // Verificar que el responsable tenga programa seleccionado
                if (!isset($validated['responsable']['program_id'])) {
                    throw new \Exception('Debe seleccionar un programa académico');
                }

                // Agregar datos musicales al responsable si no existen
                $responsable->plays_instrument = $validated['responsable']['plays_instrument'] ?? false;
                $responsable->instruments_played = $validated['responsable']['instruments_played'] ?? null;
                $responsable->has_music_studies = $validated['responsable']['has_music_studies'] ?? false;
                $responsable->music_schools = $validated['responsable']['music_schools'] ?? null;
                $responsable->desired_instrument = $validated['responsable']['desired_instrument'] ?? null;
                $responsable->modality = $validated['responsable']['modality'] ?? 'Linaje Big';
                $responsable->current_level = $validated['responsable']['current_level'] ?? 1;
                $responsable->save();

                // Crear inscripción para el responsable
                $enrollment = Enrollment::create([
                    'student_id' => $responsable->id,
                    'program_id' => $validated['responsable']['program_id'],
                    'enrolled_level' => $responsable->current_level,
                    'enrollment_date' => Carbon::today(),
                    'status' => 'active',
                    'payment_commitment_signed' => true,
                    'payment_commitment_date' => now(),
                ]);

                $enrollments[] = $enrollment;

                // Si se seleccionó un horario, inscribir al estudiante
                if (!empty($validated['responsable']['schedule_id'])) {
                    $schedule = \App\Models\Schedule::find($validated['responsable']['schedule_id']);

                    if ($schedule && $schedule->hasAvailableSlots()) {
                        \App\Models\ScheduleEnrollment::create([
                            'student_id' => $responsable->id,
                            'schedule_id' => $validated['responsable']['schedule_id'],
                            'enrollment_date' => Carbon::today(),
                            'status' => 'enrolled',
                        ]);
                    }
                }

                // Crear pago inicial de matrícula
                $program = AcademicProgram::find($validated['responsable']['program_id']);

                // Obtener el monto configurado desde PaymentSetting
                $paymentSetting = PaymentSetting::where('is_active', true)->first();
                $paymentAmount = $paymentSetting ? (float) $paymentSetting->monthly_amount : 100000;

                // Validar que el monto cumpla con el mínimo de Wompi (1,500 COP)
                if ($paymentAmount < 1500) {
                    $paymentAmount = 1500;
                }

                $payment = \App\Models\Payment::create([
                    'student_id' => $responsable->id,
                    'program_id' => $program->id,
                    'enrollment_id' => $enrollment->id,
                    'concept' => 'Matrícula ' . $program->name . ' - ' . $responsable->name,
                    'payment_type' => 'single',
                    'amount' => $paymentAmount,
                    'original_amount' => $paymentAmount,
                    'paid_amount' => 0,
                    'remaining_amount' => $paymentAmount,
                    'due_date' => Carbon::today(),
                    'status' => 'pending',
                    'wompi_reference' => 'MAT-' . $enrollment->id . '-' . time(),
                ]);

                $payments[] = $payment;
            }
            // 3. Si es menor, procesar cada estudiante hijo
            elseif ($validated['is_minor']) {
                foreach ($validated['estudiantes'] as $estudianteData) {
                    // Crear usuario para el estudiante
                    $datosUsuario = [
                        'name' => $estudianteData['name'],
                        'last_name' => $estudianteData['last_name'],
                        'email' => $estudianteData['email'] ?? null,
                        'document_type' => $estudianteData['document_type'],
                        'document_number' => $estudianteData['document_number'],
                        'birth_place' => $estudianteData['birth_place'] ?? null,
                        'birth_date' => $estudianteData['birth_date'],
                        'gender' => $estudianteData['gender'],
                        'user_type' => 'student',
                        'parent_id' => $responsable->id,
                        // Heredar datos de ubicación del responsable
                        'address' => $responsableData['address'],
                        'neighborhood' => $responsableData['neighborhood'] ?? null,
                        'city' => $responsableData['city'],
                        'department' => $responsableData['department'],
                        'phone' => $responsableData['phone'] ?? null,
                        'mobile' => $responsableData['mobile'],
                        // Datos musicales
                        'plays_instrument' => $estudianteData['datos_musicales']['plays_instrument'],
                        'instruments_played' => $estudianteData['datos_musicales']['instruments_played'] ?? null,
                        'has_music_studies' => $estudianteData['datos_musicales']['has_music_studies'],
                        'music_schools' => $estudianteData['datos_musicales']['music_schools'] ?? null,
                        'desired_instrument' => $estudianteData['datos_musicales']['desired_instrument'],
                        'modality' => $estudianteData['datos_musicales']['modality'],
                        'current_level' => $estudianteData['datos_musicales']['current_level'],
                    ];

                    // Si el estudiante tiene email, generar contraseña temporal
                    if (!empty($datosUsuario['email'])) {
                        $datosUsuario['password'] = Hash::make('temporal123');
                    } else {
                        $datosUsuario['password'] = null;
                    }

                    $studentUser = User::create($datosUsuario);
                    $studentUser->assignRole('Estudiante');

                    // 3. Crear registro en parent_guardians
                    ParentGuardian::create([
                        'student_id' => $studentUser->id,
                        'relationship_type' => 'padre',
                        'name' => $responsable->name . ' ' . $responsable->last_name,
                        'address' => $responsable->address,
                        'phone' => $responsable->mobile,
                        'has_signed_authorization' => true,
                        'authorization_date' => now(),
                    ]);

                    // 4. Crear la inscripción (enrollment) para este estudiante
                    $enrollment = Enrollment::create([
                        'student_id' => $studentUser->id,
                        'program_id' => $estudianteData['program_id'],
                        'enrolled_level' => $estudianteData['datos_musicales']['current_level'],
                        'enrollment_date' => Carbon::today(),
                        'status' => 'active',
                        'payment_commitment_signed' => true,
                        'payment_commitment_date' => now(),
                        'parental_authorization_signed' => true,
                        'parental_authorization_date' => now(),
                        'parent_guardian_name' => $responsable->name . ' ' . $responsable->last_name,
                    ]);

                    $enrollments[] = $enrollment;

                    // 5. Si se seleccionó un horario, inscribir al estudiante
                    if (!empty($estudianteData['schedule_id'])) {
                        $schedule = \App\Models\Schedule::find($estudianteData['schedule_id']);

                        if ($schedule && $schedule->hasAvailableSlots()) {
                            \App\Models\ScheduleEnrollment::create([
                                'student_id' => $studentUser->id,
                                'schedule_id' => $estudianteData['schedule_id'],
                                'enrollment_date' => Carbon::today(),
                                'status' => 'enrolled',
                            ]);
                        }
                    }

                    // 6. Crear pago inicial de matrícula para este estudiante
                    $program = AcademicProgram::find($estudianteData['program_id']);

                    // Obtener el monto configurado desde PaymentSetting
                    $paymentSetting = PaymentSetting::where('is_active', true)->first();
                    $paymentAmount = $paymentSetting ? (float) $paymentSetting->monthly_amount : 100000;

                    // Validar que el monto cumpla con el mínimo de Wompi (1,500 COP)
                    if ($paymentAmount < 1500) {
                        $paymentAmount = 1500;
                    }

                    $payment = \App\Models\Payment::create([
                        'student_id' => $studentUser->id,
                        'program_id' => $program->id,
                        'enrollment_id' => $enrollment->id,
                        'concept' => 'Matrícula ' . $program->name . ' - ' . $studentUser->name,
                        'payment_type' => 'single',
                        'amount' => $paymentAmount,
                        'original_amount' => $paymentAmount,
                        'paid_amount' => 0,
                        'remaining_amount' => $paymentAmount,
                        'due_date' => Carbon::today(),
                        'status' => 'pending',
                        'wompi_reference' => 'MAT-' . $enrollment->id . '-' . time(),
                    ]);

                    $payments[] = $payment;
                }
            }

            DB::commit();

            // Redirigir al checkout de pagos
            if (!empty($payments)) {
                flash_success('¡Matrícula(s) creada(s) exitosamente! Proceda con el pago.');

                // Si solo hay un pago (adulto individual), redirigir al checkout simple
                if (count($payments) === 1) {
                    return redirect()->route('matricula.checkout', ['payment' => $payments[0]->id]);
                }

                // Si hay múltiples pagos, pasar todos los IDs
                $paymentIds = array_map(fn($p) => $p->id, $payments);
                return redirect()->route('matricula.checkout.multiple', ['payments' => implode(',', $paymentIds)]);
            }

            flash_error('No se crearon pagos.');
            return redirect()->route('home');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error en matrícula: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            flash_error('Ocurrió un error al procesar la matrícula: ' . $e->getMessage());
            return redirect()->back()->withInput();
        }
    }

    /**
     * Mostrar página de checkout para múltiples pagos
     */
    public function checkoutMultiple(Request $request)
    {
        $paymentIds = explode(',', $request->query('payments', ''));
        $paymentIds = array_filter($paymentIds, 'is_numeric');

        if (empty($paymentIds)) {
            flash_error('No se encontraron pagos para procesar.');
            return redirect()->route('home');
        }

        $payments = \App\Models\Payment::with(['student', 'program', 'enrollment'])
            ->whereIn('id', $paymentIds)
            ->where('status', 'pending')
            ->get();

        if ($payments->isEmpty()) {
            flash_error('No se encontraron pagos pendientes.');
            return redirect()->route('home');
        }

        // Obtener configuración activa de Wompi
        $wompiSetting = \App\Models\WompiSetting::where('is_active', true)->first();

        if (!$wompiSetting) {
            $wompiPublicKey = config('wompi.public_key');
            $integritySecret = config('wompi.integrity_secret');
        } else {
            $wompiPublicKey = $wompiSetting->public_key;
            $integritySecret = $wompiSetting->integrity_secret;
        }

        // Preparar datos para cada pago
        $paymentsData = $payments->map(function ($payment) use ($integritySecret) {
            $amountInCents = (int) ($payment->amount * 100);
            $currency = 'COP';
            $integrityString = $payment->wompi_reference . $amountInCents . $currency . $integritySecret;
            $integritySignature = hash('sha256', $integrityString);

            return [
                'id' => $payment->id,
                'concept' => $payment->concept,
                'amount' => $payment->amount,
                'amountInCents' => $amountInCents,
                'wompi_reference' => $payment->wompi_reference,
                'integritySignature' => $integritySignature,
                'student' => $payment->student,
                'program' => $payment->program,
            ];
        });

        $totalAmount = $payments->sum('amount');

        return Inertia::render('Matricula/CheckoutMultiple', [
            'payments' => $paymentsData,
            'totalAmount' => $totalAmount,
            'wompiPublicKey' => $wompiPublicKey,
            'redirectUrl' => config('wompi.redirect_url'),
        ]);
    }

    /**
     * Mostrar página de checkout con widget de Wompi
     */
    public function checkout($paymentId)
    {
        $payment = \App\Models\Payment::with(['student', 'program', 'enrollment'])
            ->findOrFail($paymentId);

        // Verificar que el pago esté pendiente
        if ($payment->status !== 'pending') {
            flash_error('Este pago ya ha sido procesado.');
            return redirect()->route('home');
        }

        // Obtener configuración activa de Wompi desde la base de datos
        $wompiSetting = \App\Models\WompiSetting::where('is_active', true)->first();

        // Si no hay configuración activa, usar las del .env como fallback
        if (!$wompiSetting) {
            $wompiPublicKey = config('wompi.public_key');
            $integritySecret = config('wompi.integrity_secret');
        } else {
            $wompiPublicKey = $wompiSetting->public_key;
            $integritySecret = $wompiSetting->integrity_secret;
        }

        // Generar firma de integridad para Wompi
        $amountInCents = (int) ($payment->amount * 100);
        $currency = 'COP';

        // Concatenar: reference + amount_in_cents + currency + integrity_secret
        $integrityString = $payment->wompi_reference . $amountInCents . $currency . $integritySecret;
        $integritySignature = hash('sha256', $integrityString);

        \Log::info('Wompi Integrity Signature', [
            'reference' => $payment->wompi_reference,
            'amount' => $amountInCents,
            'currency' => $currency,
            'string' => $integrityString,
            'signature' => $integritySignature,
        ]);

        return Inertia::render('Matricula/Checkout', [
            'payment' => $payment,
            'wompiPublicKey' => $wompiPublicKey,
            'redirectUrl' => config('wompi.redirect_url'),
            'amountInCents' => $amountInCents,
            'integritySignature' => $integritySignature,
        ]);
    }

    /**
     * Página de confirmación después del pago
     */
    public function confirmation(Request $request)
    {
        $transactionId = $request->query('id');

        if (!$transactionId) {
            flash_error('No se recibió el ID de transacción.');
            return redirect()->route('home');
        }

        // Consultar el estado de la transacción directamente en Wompi
        try {
            $wompiSetting = \App\Models\WompiSetting::where('is_active', true)->first();
            $publicKey = $wompiSetting ? $wompiSetting->public_key : config('wompi.public_key');

            // Consultar transacción en Wompi
            $response = \Http::get("https://production.wompi.co/v1/transactions/{$transactionId}");

            if (!$response->successful()) {
                \Log::error('Error consultando transacción en Wompi', ['transaction_id' => $transactionId]);
                flash_error('No se pudo consultar el estado del pago.');
                return redirect()->route('home');
            }

            $transactionData = $response->json()['data'];
            $reference = $transactionData['reference'];

            // Buscar el pago por la referencia
            $payment = \App\Models\Payment::where('wompi_reference', $reference)->first();

            if (!$payment) {
                \Log::error('Pago no encontrado para referencia: ' . $reference);
                flash_error('No se encontró información del pago.');
                return redirect()->route('home');
            }

            // Actualizar el pago con los datos de Wompi
            $payment->wompi_transaction_id = $transactionId;
            $payment->payment_method = $transactionData['payment_method_type'] ?? null;

            if ($transactionData['status'] === 'APPROVED') {
                $payment->status = 'completed';
                $payment->payment_date = now();
                $payment->paid_amount = $payment->amount;
                $payment->remaining_amount = 0;

                \Log::info('Pago aprobado desde confirmación', ['payment_id' => $payment->id, 'transaction_id' => $transactionId]);
            } elseif ($transactionData['status'] === 'DECLINED' || $transactionData['status'] === 'ERROR') {
                $payment->status = 'cancelled';
                \Log::warning('Pago rechazado desde confirmación', ['payment_id' => $payment->id, 'transaction_id' => $transactionId]);
            }

            $payment->save();

            return Inertia::render('Matricula/Confirmation', [
                'payment' => $payment->load('student', 'program'),
                'status' => $transactionData['status'],
                'transactionId' => $transactionId,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en confirmación de pago: ' . $e->getMessage());
            flash_error('Ocurrió un error al procesar la confirmación del pago.');
            return redirect()->route('home');
        }
    }
}

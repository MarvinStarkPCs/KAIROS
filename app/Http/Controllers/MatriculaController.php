<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AcademicProgram;
use App\Models\Enrollment;
use App\Models\ParentGuardian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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
            'responsable.email' => ['required', 'email', 'unique:users,email'],
            'responsable.password' => ['required', 'string', 'min:8', 'confirmed'],
            'responsable.document_type' => ['required', Rule::in(['TI', 'CC'])],
            'responsable.document_number' => ['required', 'string', 'unique:users,document_number'],
            'responsable.birth_place' => ['nullable', 'string', 'max:255'],
            'responsable.birth_date' => ['required', 'date'],
            'responsable.gender' => ['required', Rule::in(['M', 'F'])],
            'responsable.address' => ['required', 'string'],
            'responsable.neighborhood' => ['nullable', 'string', 'max:255'],
            'responsable.phone' => ['nullable', 'string', 'max:20'],
            'responsable.mobile' => ['required', 'string', 'max:20'],
            'responsable.city' => ['required', 'string', 'max:255'],
            'responsable.department' => ['required', 'string', 'max:255'],

            // Indica si el estudiante es el mismo que el responsable o es un menor
            'is_minor' => ['required', 'boolean'],

            // Datos del estudiante (si es menor)
            'estudiante.name' => ['required_if:is_minor,true', 'string', 'max:255'],
            'estudiante.last_name' => ['required_if:is_minor,true', 'string', 'max:255'],
            'estudiante.email' => ['nullable', 'email', 'unique:users,email'],
            'estudiante.document_type' => ['required_if:is_minor,true', Rule::in(['TI', 'CC'])],
            'estudiante.document_number' => ['required_if:is_minor,true', 'string', 'unique:users,document_number'],
            'estudiante.birth_place' => ['nullable', 'string', 'max:255'],
            'estudiante.birth_date' => ['required_if:is_minor,true', 'date'],
            'estudiante.gender' => ['required_if:is_minor,true', Rule::in(['M', 'F'])],

            // Datos musicales (del estudiante)
            'datos_musicales.plays_instrument' => ['required', 'boolean'],
            'datos_musicales.instruments_played' => ['nullable', 'string'],
            'datos_musicales.has_music_studies' => ['required', 'boolean'],
            'datos_musicales.music_schools' => ['nullable', 'string'],
            'datos_musicales.desired_instrument' => ['required', 'string', 'max:255'],
            'datos_musicales.modality' => ['required', Rule::in(['Linaje Kids', 'Linaje Teens', 'Linaje Big'])],
            'datos_musicales.current_level' => ['required', 'integer', 'min:1'],

            // Programa académico
            'program_id' => ['required', 'exists:academic_programs,id'],
            'schedule_id' => ['nullable', 'exists:schedules,id'],

            // Autorización y compromiso
            'parental_authorization' => ['required_if:is_minor,true', 'accepted'],
            'payment_commitment' => ['required', 'accepted'],
        ], [
            'responsable.name.required' => 'El nombre del responsable es obligatorio',
            'responsable.email.required' => 'El correo electrónico es obligatorio',
            'responsable.email.unique' => 'Este correo electrónico ya está registrado',
            'responsable.document_number.unique' => 'Este número de documento ya está registrado',
            'estudiante.email.unique' => 'Este correo electrónico ya está registrado',
            'estudiante.document_number.unique' => 'Este número de documento ya está registrado',
            'program_id.required' => 'Debe seleccionar un programa académico',
            'payment_commitment.accepted' => 'Debe aceptar el compromiso de pago',
            'parental_authorization.accepted' => 'Debe aceptar la autorización parental',
        ]);

        DB::beginTransaction();

        try {
            // 1. Crear el usuario responsable
            $responsableData = $validated['responsable'];
            $responsableData['password'] = Hash::make($responsableData['password']);
            $responsableData['user_type'] = $validated['is_minor'] ? 'guardian' : 'both';

            // Si el responsable también es el estudiante, agregar datos musicales
            if (!$validated['is_minor']) {
                $responsableData = array_merge($responsableData, $validated['datos_musicales']);
            }

            $responsable = User::create($responsableData);
            $responsable->assignRole('Estudiante');

            $studentUser = null;

            // 2. Si es menor, crear usuario para el estudiante
            if ($validated['is_minor']) {
                $estudianteData = $validated['estudiante'];
                $estudianteData['user_type'] = 'student';
                $estudianteData['parent_id'] = $responsable->id;

                // Si el estudiante tiene email, generar contraseña temporal
                if (!empty($estudianteData['email'])) {
                    $estudianteData['password'] = Hash::make('temporal123'); // Contraseña temporal
                } else {
                    // Si no tiene email, usar el email del responsable con +hijo
                    $estudianteData['email'] = null;
                    $estudianteData['password'] = null;
                }

                // Heredar datos de ubicación del responsable
                $estudianteData['address'] = $responsableData['address'];
                $estudianteData['neighborhood'] = $responsableData['neighborhood'] ?? null;
                $estudianteData['city'] = $responsableData['city'];
                $estudianteData['department'] = $responsableData['department'];
                $estudianteData['phone'] = $responsableData['phone'] ?? null;
                $estudianteData['mobile'] = $responsableData['mobile'];

                // Agregar datos musicales al estudiante
                $estudianteData = array_merge($estudianteData, $validated['datos_musicales']);

                $studentUser = User::create($estudianteData);
                $studentUser->assignRole('Estudiante');

                // 3. Crear registro en parent_guardians
                ParentGuardian::create([
                    'student_id' => $studentUser->id,
                    'relationship_type' => 'padre', // Podríamos agregar un campo en el form
                    'name' => $responsable->name . ' ' . $responsable->last_name,
                    'address' => $responsable->address,
                    'phone' => $responsable->mobile,
                    'has_signed_authorization' => true,
                    'authorization_date' => now(),
                ]);
            }

            // 4. Crear la inscripción (enrollment)
            $enrollmentData = [
                'student_id' => $validated['is_minor'] ? $studentUser->id : $responsable->id,
                'program_id' => $validated['program_id'],
                'enrolled_level' => $validated['datos_musicales']['current_level'],
                'enrollment_date' => Carbon::today(),
                'status' => 'active',
                'payment_commitment_signed' => true,
                'payment_commitment_date' => now(),
            ];

            // Si es menor, agregar información de autorización parental
            if ($validated['is_minor']) {
                $enrollmentData['parental_authorization_signed'] = true;
                $enrollmentData['parental_authorization_date'] = now();
                $enrollmentData['parent_guardian_name'] = $responsable->name . ' ' . $responsable->last_name;
            }

            $enrollment = Enrollment::create($enrollmentData);

            // 5. Si se seleccionó un horario, inscribir al estudiante
            if (!empty($validated['schedule_id'])) {
                $schedule = \App\Models\Schedule::find($validated['schedule_id']);

                if ($schedule && $schedule->hasAvailableSlots()) {
                    \App\Models\ScheduleEnrollment::create([
                        'student_id' => $validated['is_minor'] ? $studentUser->id : $responsable->id,
                        'schedule_id' => $validated['schedule_id'],
                        'enrollment_date' => Carbon::today(),
                        'status' => 'enrolled',
                    ]);
                }
            }

            // 6. Crear pago inicial de matrícula (pendiente)
            $program = AcademicProgram::find($validated['program_id']);
            $studentId = $validated['is_minor'] ? $studentUser->id : $responsable->id;
            $paymentResponsible = $validated['is_minor'] ? $responsable : $responsable;

            $payment = \App\Models\Payment::create([
                'student_id' => $studentId,
                'program_id' => $program->id,
                'enrollment_id' => $enrollment->id,
                'concept' => 'Matrícula - ' . $program->name,
                'payment_type' => 'single',
                'amount' => $program->monthly_fee, // Primera mensualidad
                'original_amount' => $program->monthly_fee,
                'paid_amount' => 0,
                'remaining_amount' => $program->monthly_fee,
                'due_date' => Carbon::today(),
                'status' => 'pending',
                'wompi_reference' => 'MAT-' . $enrollment->id . '-' . time(),
            ]);

            DB::commit();

            // Redirigir al checkout de pago
            return redirect()->route('matricula.checkout', ['payment' => $payment->id]);

        } catch (\Exception $e) {
            DB::rollBack();
            flash_error('Ocurrió un error al procesar la matrícula. Por favor, intente nuevamente.');
            return redirect()->back()->withInput();
        }
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

        // Generar firma de integridad para Wompi
        $amountInCents = (int) ($payment->amount * 100);
        $currency = 'COP';

        // Para el widget, la firma de integridad NO se requiere en modo test
        // O se debe usar un integrity key específico (diferente al events_secret)
        // Por ahora, vamos a intentar sin firma primero
        $integritySignature = null;

        return Inertia::render('Matricula/Checkout', [
            'payment' => $payment,
            'wompiPublicKey' => config('wompi.public_key'),
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
        $status = $request->query('status');

        // Buscar el pago por la referencia de Wompi
        $payment = \App\Models\Payment::where('wompi_transaction_id', $transactionId)->first();

        if (!$payment) {
            flash_error('No se encontró información del pago.');
            return redirect()->route('home');
        }

        return Inertia::render('Matricula/Confirmation', [
            'payment' => $payment,
            'status' => $status,
            'transactionId' => $transactionId,
        ]);
    }
}

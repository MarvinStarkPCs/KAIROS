<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Búsqueda rápida de usuarios (JSON) para la barra del header
     */
    public function search(Request $request)
    {
        $search = $request->input('q', '');

        if (strlen($search) < 2) {
            return response()->json([]);
        }

        $users = User::with('roles')
            ->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->limit(8)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => trim($user->name.' '.($user->last_name ?? '')),
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->roles->first()?->name ?? 'Sin rol',
            ]);

        return response()->json($users);
    }

    /**
     * Mostrar lista de usuarios
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'studentProfile', 'teacherProfile']);

        // Filtrar por tipo de usuario
        if ($request->filled('type')) {
            $type = $request->input('type');
            if ($type === 'student') {
                $query->role('Estudiante');
            } elseif ($type === 'teacher') {
                $query->role('Profesor');
            } elseif ($type === 'admin') {
                $query->role('Administrador');
            } elseif ($type === 'parent') {
                $query->role('Responsable');
            }
        }

        // Buscar por nombre o email
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Security/Users/Index', [
            'users' => $users->through(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'last_name' => $user->last_name,
                'full_name' => trim($user->name.' '.($user->last_name ?? '')),
                'email' => $user->email,
                'avatar' => $user->avatar,
                'document_type' => $user->document_type,
                'document_number' => $user->document_number,
                'mobile' => $user->mobile,
                'roles' => $user->roles->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                ])->toArray(),
                'user_type' => $this->getUserType($user),
                'has_student_profile' => $user->studentProfile !== null,
                'has_teacher_profile' => $user->teacherProfile !== null,
                'modality' => $user->studentProfile?->modality,
                'created_at' => $user->created_at->toIso8601String(),
            ]),
            'filters' => [
                'type' => $request->input('type', ''),
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    /**
     * Determinar el tipo de usuario basado en sus roles
     */
    private function getUserType(User $user): string
    {
        if ($user->hasRole('Administrador')) {
            return 'Administrador';
        }
        if ($user->hasRole('Profesor')) {
            return 'Profesor';
        }
        if ($user->hasRole('Estudiante')) {
            return 'Estudiante';
        }
        if ($user->hasRole('Responsable') || $user->hasRole('Padre/Madre')) {
            return 'Responsable';
        }

        return 'Sin rol';
    }

    /**
     * Mostrar detalles de un usuario
     */
    public function show(User $user)
    {
        $user->load([
            'roles',
            'studentProfile',
            'teacherProfile',
            'parent',
            'parentGuardians',
            'dependents.programEnrollments.program',
            'dependents.payments',
            'dependents.studentProfile',
            'programEnrollments.program',
            'teachingSchedules.academicProgram',
            'teachingSchedules.students',
            'scheduleEnrollments.schedule.academicProgram',
            'scheduleEnrollments.schedule.professor',
            'payments.program',
        ]);

        // Horarios de enseñanza (para profesores)
        $teachingSchedules = $user->teachingSchedules->map(fn ($schedule) => [
            'id' => $schedule->id,
            'name' => $schedule->name,
            'program_name' => $schedule->academicProgram?->name,
            'days_of_week' => $schedule->days_of_week,
            'start_time' => $schedule->start_time,
            'end_time' => $schedule->end_time,
            'classroom' => $schedule->classroom,
            'status' => $schedule->status,
            'students_count' => $schedule->students->count(),
            'max_students' => $schedule->max_students,
        ])->toArray();

        // Horarios inscritos (para estudiantes)
        $enrolledSchedules = $user->scheduleEnrollments->map(fn ($se) => [
            'id' => $se->id,
            'schedule_name' => $se->schedule?->name,
            'program_name' => $se->schedule?->academicProgram?->name,
            'professor_name' => $se->schedule?->professor ? trim($se->schedule->professor->name.' '.($se->schedule->professor->last_name ?? '')) : null,
            'days_of_week' => $se->schedule?->days_of_week,
            'start_time' => $se->schedule?->start_time,
            'end_time' => $se->schedule?->end_time,
            'classroom' => $se->schedule?->classroom,
            'status' => $se->status,
        ])->toArray();

        // Resumen de pagos (para estudiantes)
        $paymentSummary = [
            'total' => $user->payments->count(),
            'pending' => $user->payments->where('status', 'pending')->count(),
            'completed' => $user->payments->where('status', 'completed')->count(),
            'overdue' => $user->payments->where('status', 'pending')->where('due_date', '<', now())->count(),
            'total_amount' => $user->payments->sum('amount'),
            'paid_amount' => $user->payments->where('status', 'completed')->sum('paid_amount'),
            'pending_amount' => $user->payments->where('status', 'pending')->sum('remaining_amount'),
        ];

        // Últimos pagos
        $recentPayments = $user->payments->sortByDesc('created_at')->take(5)->map(fn ($payment) => [
            'id' => $payment->id,
            'concept' => $payment->concept,
            'program_name' => $payment->program?->name,
            'amount' => $payment->amount,
            'paid_amount' => $payment->paid_amount,
            'status' => $payment->status,
            'due_date' => $payment->due_date?->format('Y-m-d'),
            'payment_date' => $payment->payment_date?->format('Y-m-d'),
            'installment_number' => $payment->installment_number,
            'total_installments' => $payment->total_installments,
        ])->values()->toArray();

        // Dependientes con resumen (para padres/responsables)
        $dependentsWithSummary = $user->dependents->map(fn ($dep) => [
            'id' => $dep->id,
            'name' => trim($dep->name.' '.($dep->last_name ?? '')),
            'email' => $dep->email,
            'phone' => $dep->phone,
            'mobile' => $dep->mobile,
            'document_type' => $dep->document_type,
            'document_number' => $dep->document_number,
            'birth_date' => $dep->birth_date?->format('Y-m-d'),
            'gender' => $dep->gender,
            'student_profile' => $dep->studentProfile ? [
                'modality' => $dep->studentProfile->modality,
                'desired_instrument' => $dep->studentProfile->desired_instrument,
                'current_level' => $dep->studentProfile->current_level,
                'emergency_contact_name' => $dep->studentProfile->emergency_contact_name,
                'emergency_contact_phone' => $dep->studentProfile->emergency_contact_phone,
                'medical_conditions' => $dep->studentProfile->medical_conditions,
                'allergies' => $dep->studentProfile->allergies,
            ] : null,
            'enrollments' => $dep->programEnrollments->map(fn ($e) => [
                'program_name' => $e->program?->name,
                'status' => $e->status,
                'enrollment_date' => $e->enrollment_date?->format('Y-m-d'),
                'enrolled_level' => $e->enrolled_level,
            ])->toArray(),
            'payments_pending' => $dep->payments->where('status', 'pending')->count(),
            'payments_pending_amount' => $dep->payments->where('status', 'pending')->sum('remaining_amount'),
        ]);

        return Inertia::render('Security/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'last_name' => $user->last_name,
                'full_name' => trim($user->name.' '.($user->last_name ?? '')),
                'email' => $user->email,
                'avatar' => $user->avatar,
                // Datos personales
                'document_type' => $user->document_type,
                'document_number' => $user->document_number,
                'birth_date' => $user->birth_date?->format('Y-m-d'),
                'birth_place' => $user->birth_place,
                'gender' => $user->gender,
                // Contacto
                'phone' => $user->phone,
                'mobile' => $user->mobile,
                'address' => $user->address,
                'neighborhood' => $user->neighborhood,
                'city' => $user->city,
                'department' => $user->department,
                // Relaciones
                'parent_id' => $user->parent_id,
                'parent' => $user->parent ? [
                    'id' => $user->parent->id,
                    'name' => trim($user->parent->name.' '.($user->parent->last_name ?? '')),
                    'email' => $user->parent->email,
                    'phone' => $user->parent->phone,
                    'mobile' => $user->parent->mobile,
                    'document_type' => $user->parent->document_type,
                    'document_number' => $user->parent->document_number,
                    'address' => $user->parent->address,
                    'neighborhood' => $user->parent->neighborhood,
                    'city' => $user->parent->city,
                    'department' => $user->parent->department,
                ] : null,
                // Acudientes registrados en la tabla parent_guardians (datos de matrícula)
                'parent_guardians' => $user->parentGuardians->map(fn ($pg) => [
                    'id' => $pg->id,
                    'relationship_type' => $pg->relationship_type,
                    'name' => $pg->name,
                    'address' => $pg->address,
                    'phone' => $pg->phone,
                    'has_signed_authorization' => $pg->has_signed_authorization,
                    'authorization_date' => $pg->authorization_date?->format('Y-m-d H:i'),
                ])->toArray(),
                'dependents' => $user->dependents->map(fn ($dep) => [
                    'id' => $dep->id,
                    'name' => trim($dep->name.' '.($dep->last_name ?? '')),
                    'email' => $dep->email,
                ]),
                'dependents_with_summary' => $dependentsWithSummary,
                // Roles
                'roles' => $user->roles->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                ])->toArray(),
                'user_type' => $this->getUserType($user),
                // Perfiles
                'student_profile' => $user->studentProfile ? [
                    'id' => $user->studentProfile->id,
                    'modality' => $user->studentProfile->modality,
                    'desired_instrument' => $user->studentProfile->desired_instrument,
                    'plays_instrument' => $user->studentProfile->plays_instrument,
                    'instruments_played' => $user->studentProfile->instruments_played,
                    'has_music_studies' => $user->studentProfile->has_music_studies,
                    'music_schools' => $user->studentProfile->music_schools,
                    'current_level' => $user->studentProfile->current_level,
                    'emergency_contact_name' => $user->studentProfile->emergency_contact_name,
                    'emergency_contact_phone' => $user->studentProfile->emergency_contact_phone,
                    'medical_conditions' => $user->studentProfile->medical_conditions,
                    'allergies' => $user->studentProfile->allergies,
                ] : null,
                'teacher_profile' => $user->teacherProfile ? [
                    'id' => $user->teacherProfile->id,
                    'instruments_played' => $user->teacherProfile->instruments_played,
                    'music_schools' => $user->teacherProfile->music_schools,
                    'experience_years' => $user->teacherProfile->experience_years,
                    'bio' => $user->teacherProfile->bio,
                    'specialization' => $user->teacherProfile->specialization,
                    'hourly_rate' => $user->teacherProfile->hourly_rate,
                    'is_active' => $user->teacherProfile->is_active,
                ] : null,
                // Horarios
                'teaching_schedules' => $teachingSchedules,
                'enrolled_schedules' => $enrolledSchedules,
                // Pagos
                'payment_summary' => $paymentSummary,
                'recent_payments' => $recentPayments,
                // Inscripciones (con autorizaciones)
                'enrollments' => $user->programEnrollments->map(fn ($enrollment) => [
                    'id' => $enrollment->id,
                    'program_name' => $enrollment->program?->name,
                    'status' => $enrollment->status,
                    'enrollment_date' => $enrollment->enrollment_date?->format('Y-m-d'),
                    'enrolled_level' => $enrollment->enrolled_level,
                    // Autorizaciones
                    'payment_commitment_signed' => $enrollment->payment_commitment_signed,
                    'payment_commitment_date' => $enrollment->payment_commitment_date?->format('Y-m-d H:i'),
                    'parental_authorization_signed' => $enrollment->parental_authorization_signed,
                    'parental_authorization_date' => $enrollment->parental_authorization_date?->format('Y-m-d H:i'),
                    'parent_guardian_name' => $enrollment->parent_guardian_name,
                ])->toArray(),
                // Timestamps
                'created_at' => $user->created_at->toIso8601String(),
                'updated_at' => $user->updated_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Mostrar formulario para crear usuario
     */
    public function create()
    {
        $roles = Role::all()->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
        ]);

        return Inertia::render('Security/Users/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Guardar nuevo usuario
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'roles' => 'array',
            // Datos personales opcionales
            'document_type' => 'nullable|in:CC,TI,CE,Pasaporte',
            'document_number' => 'nullable|string|max:50',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|in:M,F',
            'mobile' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'last_name' => $validated['last_name'] ?? null,
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'document_type' => $validated['document_type'] ?? null,
            'document_number' => $validated['document_number'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'mobile' => $validated['mobile'] ?? null,
        ]);

        if ($validated['roles'] ?? []) {
            $user->syncRoles($validated['roles']);

            // Crear perfiles según los roles asignados
            $roleNames = Role::whereIn('id', $validated['roles'])->pluck('name')->toArray();

            if (in_array('Estudiante', $roleNames)) {
                $user->studentProfile()->create([
                    'modality' => 'Linaje Big',
                    'plays_instrument' => false,
                    'has_music_studies' => false,
                ]);
            }

            if (in_array('Profesor', $roleNames)) {
                $user->teacherProfile()->create([
                    'instruments_played' => 'Por definir',
                    'is_active' => true,
                ]);
            }
        }

        flash_success('Usuario creado exitosamente');

        return redirect()->route('usuarios.index');
    }

    /**
     * Mostrar formulario para editar usuario
     */
    public function edit(User $user)
    {
        $user->load(['roles', 'studentProfile', 'teacherProfile']);

        $roles = Role::all()->map(fn ($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'assigned' => $user->hasRole($role->name),
        ]);

        return Inertia::render('Security/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                // Datos personales
                'document_type' => $user->document_type,
                'document_number' => $user->document_number,
                'birth_date' => $user->birth_date?->format('Y-m-d'),
                'birth_place' => $user->birth_place,
                'gender' => $user->gender,
                // Contacto
                'phone' => $user->phone,
                'mobile' => $user->mobile,
                'address' => $user->address,
                'neighborhood' => $user->neighborhood,
                'city' => $user->city,
                'department' => $user->department,
                // Perfiles
                'student_profile' => $user->studentProfile ? [
                    'id' => $user->studentProfile->id,
                    'modality' => $user->studentProfile->modality,
                    'desired_instrument' => $user->studentProfile->desired_instrument,
                    'plays_instrument' => $user->studentProfile->plays_instrument,
                    'instruments_played' => $user->studentProfile->instruments_played,
                    'has_music_studies' => $user->studentProfile->has_music_studies,
                    'music_schools' => $user->studentProfile->music_schools,
                    'current_level' => $user->studentProfile->current_level,
                    'emergency_contact_name' => $user->studentProfile->emergency_contact_name,
                    'emergency_contact_phone' => $user->studentProfile->emergency_contact_phone,
                    'medical_conditions' => $user->studentProfile->medical_conditions,
                    'allergies' => $user->studentProfile->allergies,
                ] : null,
                'teacher_profile' => $user->teacherProfile ? [
                    'id' => $user->teacherProfile->id,
                    'instruments_played' => $user->teacherProfile->instruments_played,
                    'music_schools' => $user->teacherProfile->music_schools,
                    'experience_years' => $user->teacherProfile->experience_years,
                    'bio' => $user->teacherProfile->bio,
                    'specialization' => $user->teacherProfile->specialization,
                    'hourly_rate' => $user->teacherProfile->hourly_rate,
                    'is_active' => $user->teacherProfile->is_active,
                ] : null,
            ],
            'roles' => $roles,
            'hasStudentRole' => $user->hasRole('Estudiante'),
            'hasTeacherRole' => $user->hasRole('Profesor'),
        ]);
    }

    /**
     * Actualizar usuario
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'roles' => 'array',
            // Datos personales
            'document_type' => 'nullable|in:CC,TI,CE,Pasaporte',
            'document_number' => 'nullable|string|max:50',
            'birth_date' => 'nullable|date',
            'birth_place' => 'nullable|string|max:255',
            'gender' => 'nullable|in:M,F',
            // Contacto
            'phone' => 'nullable|string|max:20',
            'mobile' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            // Perfil de estudiante
            'student_profile' => 'nullable|array',
            'student_profile.modality' => 'nullable|in:Linaje Kids,Linaje Teens,Linaje Big',
            'student_profile.desired_instrument' => 'nullable|string|max:255',
            'student_profile.plays_instrument' => 'nullable|boolean',
            'student_profile.instruments_played' => 'nullable|string',
            'student_profile.has_music_studies' => 'nullable|boolean',
            'student_profile.music_schools' => 'nullable|string',
            'student_profile.current_level' => 'nullable|integer|min:1|max:10',
            'student_profile.emergency_contact_name' => 'nullable|string|max:255',
            'student_profile.emergency_contact_phone' => 'nullable|string|max:20',
            'student_profile.medical_conditions' => 'nullable|string',
            'student_profile.allergies' => 'nullable|string',
            // Perfil de profesor
            'teacher_profile' => 'nullable|array',
            'teacher_profile.instruments_played' => 'nullable|string',
            'teacher_profile.music_schools' => 'nullable|string',
            'teacher_profile.experience_years' => 'nullable|integer|min:0|max:50',
            'teacher_profile.bio' => 'nullable|string',
            'teacher_profile.specialization' => 'nullable|string|max:255',
            'teacher_profile.hourly_rate' => 'nullable|numeric|min:0',
            'teacher_profile.is_active' => 'nullable|boolean',
        ]);

        // Actualizar datos básicos del usuario
        $user->update([
            'name' => $validated['name'],
            'last_name' => $validated['last_name'] ?? null,
            'email' => $validated['email'],
            'document_type' => $validated['document_type'] ?? null,
            'document_number' => $validated['document_number'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'birth_place' => $validated['birth_place'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'mobile' => $validated['mobile'] ?? null,
            'address' => $validated['address'] ?? null,
            'neighborhood' => $validated['neighborhood'] ?? null,
            'city' => $validated['city'] ?? null,
            'department' => $validated['department'] ?? null,
        ]);

        // Actualizar contraseña si se proporcionó
        if ($validated['password'] ?? null) {
            $user->update([
                'password' => bcrypt($validated['password']),
            ]);
        }

        // Sincronizar roles
        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        // Actualizar perfil de estudiante
        if (isset($validated['student_profile']) && $user->hasRole('Estudiante')) {
            $user->studentProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $validated['student_profile']
            );
        }

        // Actualizar perfil de profesor
        if (isset($validated['teacher_profile']) && $user->hasRole('Profesor')) {
            $user->teacherProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $validated['teacher_profile']
            );
        }

        flash_success('Usuario actualizado exitosamente');

        return redirect()->route('usuarios.index');
    }

    /**
     * Eliminar usuario
     */
    public function destroy(User $user)
    {
        // No permitir eliminar el usuario autenticado
        if ($user->id === auth()->id()) {
            flash_error('No puedes eliminar tu propio usuario');

            return back();
        }

        $user->delete();

        flash_success('Usuario eliminado exitosamente');

        return redirect()->route('usuarios.index');
    }
}

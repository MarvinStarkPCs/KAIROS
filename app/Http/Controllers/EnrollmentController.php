<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RemembersListFilters;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Mail\EnrollmentWelcome;
use App\Models\AcademicProgram;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Schedule;
use App\Models\ScheduleEnrollment;
use App\Models\User;
use App\Services\EnrollmentService;
use App\Services\MonthlyPaymentService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EnrollmentController extends Controller
{
    use RemembersListFilters;

    /** Filtros del listado que se recuerdan entre visitas. */
    private const FILTER_KEYS = ['program_id', 'status', 'search'];

    public function __construct(
        protected EnrollmentService $enrollmentService,
        protected MonthlyPaymentService $monthlyPayments,
    ) {}

    public function index(Request $request)
    {
        $filters = $this->rememberedFilters($request, 'matriculas', self::FILTER_KEYS);

        $query = Enrollment::with(['student', 'program'])
            ->latest();

        // Filtros opcionales
        if ($filters['program_id']) {
            $query->where('program_id', $filters['program_id']);
        }

        if ($filters['status']) {
            $query->where('status', $filters['status']);
        }

        if ($filters['search']) {
            $search = $filters['search'];
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $enrollments = $query->paginate(15);

        // Estadísticas
        $byStatus = Enrollment::selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $stats = [
            'total_enrollments' => (int) $byStatus->sum(),
            'active_enrollments' => (int) ($byStatus['active'] ?? 0),
            'waiting_list' => (int) ($byStatus['waiting'] ?? 0),
            'suspended' => (int) ($byStatus['suspended'] ?? 0),
            'withdrawn' => (int) ($byStatus['withdrawn'] ?? 0),
        ];

        // Listas para filtros (excluyendo programas demo)
        $programs = AcademicProgram::active()
            ->where('is_demo', false)
            ->orderBy('name')
            ->get(['id', 'name']);

        $students = User::role('Estudiante')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Enrollments/Index', [
            'enrollments' => $enrollments,
            'stats' => $stats,
            'programs' => $programs,
            'students' => $students,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        $programs = AcademicProgram::active()
            ->where('is_demo', false)
            ->withCount(['enrollments as active_count' => fn ($query) => $query->active()])
            ->orderBy('name')
            ->get();

        // Agregar información de disponibilidad
        $programs->transform(function ($program) {
            $program->has_capacity = true; // Si quitamos max_slots, siempre hay capacidad
            $program->remaining_slots = null;

            return $program;
        });

        $students = User::role('Estudiante')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Enrollments/Create', [
            'programs' => $programs,
            'students' => $students,
        ]);
    }

    public function store(StoreEnrollmentRequest $request)
    {
        $validated = $request->validated();

        // Verificar que el estudiante no esté ya inscrito en el mismo programa
        $existingEnrollment = Enrollment::where('student_id', $validated['student_id'])
            ->where('program_id', $validated['program_id'])
            ->whereIn('status', ['active', 'waiting'])
            ->exists();

        if ($existingEnrollment) {
            flash_error('El estudiante ya está inscrito en este programa');

            return redirect()->back()->withInput();
        }

        // Si no se proporciona fecha, usar hoy
        if (! isset($validated['enrollment_date'])) {
            $validated['enrollment_date'] = Carbon::today();
        }

        // Crear la inscripción al programa
        $scheduleId = $validated['schedule_id'] ?? null;
        unset($validated['schedule_id']); // Remove from enrollment data

        // Si el status solicitado es 'active', se crea en 'waiting' hasta que
        // se registre el pago — Payment::addTransaction() la activa automáticamente
        $requestedActive = $validated['status'] === 'active';
        if ($requestedActive) {
            $validated['status'] = 'waiting';
        }

        $enrollment = Enrollment::create($validated);

        // Generar el pago pendiente para que el admin pueda registrarlo
        $payment = null;
        if ($requestedActive) {
            $payment = $this->generateCurrentMonthPayment($enrollment);
        }

        // Enviar correo de bienvenida si se generó el pago
        if ($payment) {
            try {
                $enrollment->load('student');
                $student = $enrollment->student;
                $isMinor = (bool) $student->parent_id;
                $responsible = $isMinor ? User::find($student->parent_id) : $student;

                if ($responsible?->email) {
                    Mail::to($responsible->email)->send(
                        new EnrollmentWelcome($responsible, [$payment], $isMinor)
                    );
                }
            } catch (\Exception $e) {
                \Log::error("Error enviando correo de bienvenida (inscripción #{$enrollment->id}): {$e->getMessage()}");
            }
        }

        // Si se seleccionó un horario, inscribir al estudiante en ese horario
        if ($scheduleId) {
            $schedule = \App\Models\Schedule::findOrFail($scheduleId);

            // Verificar que haya cupos disponibles
            if (! $schedule->hasAvailableSlots()) {
                flash_warning('Inscripción al programa creada, pero el horario seleccionado no tiene cupos disponibles');

                return redirect()->route('inscripciones.index');
            }

            // Verificar que el horario pertenezca al programa
            if ($schedule->academic_program_id != $validated['program_id']) {
                flash_warning('Inscripción al programa creada, pero el horario seleccionado no pertenece a este programa');

                return redirect()->route('inscripciones.index');
            }

            // Verificar que el estudiante no esté ya inscrito en este horario
            $existingScheduleEnrollment = \App\Models\ScheduleEnrollment::where('student_id', $validated['student_id'])
                ->where('schedule_id', $scheduleId)
                ->where('status', 'enrolled')
                ->exists();

            if (! $existingScheduleEnrollment) {
                \App\Models\ScheduleEnrollment::create([
                    'student_id' => $validated['student_id'],
                    'schedule_id' => $scheduleId,
                    'enrollment_date' => $validated['enrollment_date'],
                    'status' => 'enrolled',
                ]);

                $msg = $requestedActive
                    ? 'Inscripción en espera — se activará al registrar el pago. Estudiante inscrito en el horario.'
                    : 'Inscripción creada exitosamente y estudiante inscrito en el horario seleccionado';
                flash_success($msg);
            } else {
                flash_success('Inscripción al programa creada exitosamente (el estudiante ya estaba inscrito en el horario)');
            }
        } else {
            $msg = $requestedActive
                ? 'Inscripción en espera — se activará automáticamente al registrar el pago.'
                : 'Inscripción creada exitosamente';
            flash_success($msg);
        }

        return redirect()->route('inscripciones.index');
    }

    public function show(Enrollment $enrollment)
    {
        $enrollment->load([
            'student',
            'program.schedules' => function ($query) {
                $query->where('status', 'active')
                    ->with(['professor', 'enrollments']);
            },
        ]);

        // Obtener horarios en los que el estudiante está inscrito
        $studentSchedules = $enrollment->student->scheduleEnrollments()
            ->with('schedule.professor')
            ->where('status', 'enrolled')
            ->get();

        // Obtener pagos relacionados a esta inscripción
        $payments = $enrollment->student->payments()
            ->where('program_id', $enrollment->program_id)
            ->orWhere('enrollment_id', $enrollment->id)
            ->latest()
            ->get();

        // Historial de cambios de modalidad por edad, para dejar constancia
        // de por que cambio el valor de la mensualidad.
        $modalityHistory = [];
        $profile = $enrollment->student->studentProfile;

        if ($profile) {
            $modalityHistory = \Spatie\Activitylog\Models\Activity::query()
                ->where('log_name', 'student_modality')
                ->where('subject_type', $profile->getMorphClass())
                ->where('subject_id', $profile->id)
                ->latest()
                ->get()
                ->map(fn ($activity) => [
                    'id' => $activity->id,
                    'description' => $activity->description,
                    'from' => $activity->properties['from'] ?? null,
                    'to' => $activity->properties['to'] ?? null,
                    'age' => $activity->properties['age'] ?? null,
                    'date' => $activity->created_at?->toDateTimeString(),
                ])
                ->all();
        }

        return Inertia::render('Enrollments/Show', [
            'enrollment' => $enrollment,
            'studentSchedules' => $studentSchedules,
            'payments' => $payments,
            'currentModality' => $profile?->modality,
            'modalityHistory' => $modalityHistory,
        ]);
    }

    public function edit(Request $request, Enrollment $enrollment)
    {
        $enrollment->load('student', 'program');

        $schedules = Schedule::where('academic_program_id', $enrollment->program_id)
            ->where('status', 'active')
            ->with('professor:id,name')
            ->get(['id', 'name', 'days_of_week', 'start_time', 'end_time', 'classroom', 'professor_id']);

        $currentScheduleEnrollment = ScheduleEnrollment::where('student_id', $enrollment->student_id)
            ->whereHas('schedule', fn ($q) => $q->where('academic_program_id', $enrollment->program_id))
            ->where('status', 'enrolled')
            ->with('schedule:id,name,days_of_week,start_time,end_time,classroom')
            ->first();

        // Solo para usuario ID 1: pasar lista de programas con sus horarios activos
        $allPrograms = auth()->id() === 1
            ? AcademicProgram::active()
                ->where('is_demo', false)
                ->with(['schedules' => fn ($q) => $q->active()->with('professor:id,name')->select('id', 'academic_program_id', 'name', 'days_of_week', 'start_time', 'end_time', 'classroom', 'professor_id')])
                ->get(['id', 'name'])
            : collect();

        $user = auth()->user();
        $canManageMonths = $user->hasPermissionTo('generar_pago_mensual');
        $paymentYears = $this->paymentYearRange($enrollment);
        $paymentYear = (int) $request->integer('anio', (int) now()->year);
        if (! in_array($paymentYear, $paymentYears, true)) {
            $paymentYear = (int) now()->year;
        }

        return Inertia::render('Enrollments/Edit', [
            'enrollment' => [
                'id' => $enrollment->id,
                'status' => $enrollment->status,
                'student' => ['id' => $enrollment->student->id, 'name' => $enrollment->student->name, 'email' => $enrollment->student->email],
                'program' => ['id' => $enrollment->program->id, 'name' => $enrollment->program->name],
            ],
            'schedules' => $schedules,
            'currentScheduleEnrollment' => $currentScheduleEnrollment,
            'authId' => auth()->id(),
            'canGeneratePayment' => $canManageMonths,
            'allPrograms' => $allPrograms,
            'canRevertPayments' => $canManageMonths && $user->hasPermissionTo('eliminar_pago'),
            'canRegisterPayments' => $user->hasPermissionTo('procesar_pago'),
            'paymentYear' => $paymentYear,
            'paymentYears' => $paymentYears,
            'paymentMonths' => fn () => $canManageMonths
                ? $this->monthlyPayments->yearOverview($enrollment, $paymentYear)
                : [],
        ]);
    }

    public function update(Request $request, Enrollment $enrollment)
    {
        $validated = $request->validate([
            'schedule_id' => ['nullable', 'exists:schedules,id'],
        ], [
            'schedule_id.exists' => 'El horario seleccionado no existe',
        ]);

        $currentScheduleEnrollment = ScheduleEnrollment::where('student_id', $enrollment->student_id)
            ->whereHas('schedule', fn ($q) => $q->where('academic_program_id', $enrollment->program_id))
            ->where('status', 'enrolled')
            ->first();

        if ($validated['schedule_id']) {
            if ($currentScheduleEnrollment) {
                $currentScheduleEnrollment->update(['schedule_id' => $validated['schedule_id']]);
            } else {
                ScheduleEnrollment::create([
                    'student_id' => $enrollment->student_id,
                    'schedule_id' => $validated['schedule_id'],
                    'enrollment_date' => now(),
                    'status' => 'enrolled',
                ]);
            }
        } elseif ($currentScheduleEnrollment) {
            $currentScheduleEnrollment->update(['status' => 'dropped']);
        }

        flash_success('Horario actualizado exitosamente');

        return redirect()->route('inscripciones.index');
    }

    public function destroy(Enrollment $enrollment)
    {
        // Verificar si tiene pagos asociados
        $hasPayments = $enrollment->student->payments()
            ->where('enrollment_id', $enrollment->id)
            ->exists();

        if ($hasPayments) {
            flash_error('No se puede eliminar la inscripción porque tiene pagos asociados. Considere marcarla como retirada en su lugar.');

            return redirect()->back();
        }

        $enrollment->delete();

        flash_success('Inscripción eliminada exitosamente');

        return redirect()->route('inscripciones.index');
    }

    /**
     * Inscribir estudiante en un programa de forma rápida
     */
    public function quickEnroll(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'program_id' => ['required', 'exists:academic_programs,id'],
        ]);

        // Verificar que no exista inscripción activa
        $existingEnrollment = Enrollment::where('student_id', $validated['student_id'])
            ->where('program_id', $validated['program_id'])
            ->whereIn('status', ['active', 'waiting'])
            ->exists();

        if ($existingEnrollment) {
            flash_error('El estudiante ya está inscrito en este programa');

            return redirect()->back();
        }

        Enrollment::create([
            'student_id' => $validated['student_id'],
            'program_id' => $validated['program_id'],
            'enrollment_date' => Carbon::today(),
            'status' => 'active',
        ]);

        flash_success('Estudiante inscrito exitosamente');

        return redirect()->back();
    }

    /**
     * Cambiar estado de inscripción (solo usuario ID 1)
     */
    public function changeStatus(Request $request, Enrollment $enrollment)
    {
        if (auth()->id() !== 1) {
            abort(403, 'No tienes permiso para cambiar el estado de una matrícula.');
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'waiting', 'suspended', 'withdrawn', 'cancelled'])],
        ], [
            'status.in' => 'Estado no válido',
        ]);

        $previousStatus = $enrollment->status;
        $enrollment->update($validated);

        // Si la inscripción se activa desde otro estado, generar el pago mensual
        if ($validated['status'] === 'active' && $previousStatus !== 'active') {
            $this->generateCurrentMonthPayment($enrollment);
        }

        $statusMessages = [
            'active' => 'Inscripción activada exitosamente',
            'waiting' => 'Inscripción movida a lista de espera',
            'suspended' => 'Inscripción suspendida',
            'withdrawn' => 'Inscripción marcada como retirada',
            'cancelled' => 'Inscripción cancelada',
        ];

        flash_success($statusMessages[$validated['status']]);

        return redirect()->back();
    }

    /**
     * Cambiar programa académico de una inscripción (solo usuario ID 1)
     */
    public function changeProgram(Request $request, Enrollment $enrollment)
    {
        if (auth()->id() !== 1) {
            abort(403, 'No tienes permiso para cambiar el programa de una matrícula.');
        }

        $validated = $request->validate([
            'program_id' => ['required', 'exists:academic_programs,id', 'different:'.$enrollment->program_id],
            'schedule_id' => ['required', 'exists:schedules,id'],
        ], [
            'program_id.required' => 'Debes seleccionar un programa',
            'program_id.exists' => 'El programa seleccionado no existe',
            'program_id.different' => 'El programa seleccionado es el mismo que el actual',
            'schedule_id.required' => 'Debes seleccionar un horario del nuevo programa',
            'schedule_id.exists' => 'El horario seleccionado no existe',
        ]);

        $newProgram = AcademicProgram::findOrFail($validated['program_id']);
        $newSchedule = Schedule::findOrFail($validated['schedule_id']);

        // Verificar que el horario pertenezca al nuevo programa
        if ($newSchedule->academic_program_id !== $newProgram->id) {
            flash_error('El horario seleccionado no pertenece al programa elegido.');

            return redirect()->back();
        }

        // Retirar al estudiante del horario actual del programa viejo
        ScheduleEnrollment::where('student_id', $enrollment->student_id)
            ->whereHas('schedule', fn ($q) => $q->where('academic_program_id', $enrollment->program_id))
            ->where('status', 'enrolled')
            ->update(['status' => 'dropped']);

        $oldProgramName = $enrollment->program->name;
        $enrollment->update(['program_id' => $validated['program_id']]);

        // Inscribir en el horario del nuevo programa
        ScheduleEnrollment::firstOrCreate(
            ['student_id' => $enrollment->student_id, 'schedule_id' => $newSchedule->id],
            ['enrollment_date' => Carbon::today(), 'status' => 'enrolled']
        )->update(['status' => 'enrolled']);

        flash_success("Programa cambiado de \"{$oldProgramName}\" a \"{$newProgram->name}\" y asignado al horario \"{$newSchedule->name}\".");

        return redirect()->back();
    }

    /**
     * Generar el pago del mes actual si el mes aún no tiene cobro.
     */
    public function generatePayment(Enrollment $enrollment)
    {
        abort_unless(auth()->user()->hasPermissionTo('generar_pago_mensual'), 403);

        $month = Carbon::today()->startOfMonth();
        if ($this->monthlyPayments->monthHasPayment($enrollment, $month)) {
            flash_info('Este mes ya tiene un cobro generado.');

            return redirect()->back();
        }

        $payment = $this->monthlyPayments->generate($enrollment, $month);
        $payment
            ? flash_success('Pago del mes generado exitosamente.')
            : flash_error('No se pudo calcular el monto: el estudiante no tiene modalidad y el programa no tiene mensualidad.');

        return redirect()->back();
    }

    /**
     * Generar la mensualidad de cualquier mes (formato YYYY-MM).
     */
    public function generatePaymentForMonth(Request $request, Enrollment $enrollment)
    {
        abort_unless(auth()->user()->hasPermissionTo('generar_pago_mensual'), 403);

        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ], [
            'month.required' => 'Debes indicar el mes',
            'month.date_format' => 'El mes no es válido',
        ]);

        $month = Carbon::createFromFormat('Y-m', $validated['month'])->startOfMonth();
        $label = $month->locale('es')->isoFormat('MMMM YYYY');

        if (! in_array($month->year, $this->paymentYearRange($enrollment), true)) {
            flash_error("No se pueden generar cobros para {$label}.");

            return redirect()->back();
        }

        if ($this->monthlyPayments->monthHasPayment($enrollment, $month)) {
            flash_info("{$label} ya tiene un cobro generado.");

            return redirect()->back();
        }

        $payment = $this->monthlyPayments->generate($enrollment, $month);
        $payment
            ? flash_success("Pago generado para {$label}.")
            : flash_error('No se pudo calcular el monto: el estudiante no tiene modalidad y el programa no tiene mensualidad.');

        return redirect()->back();
    }

    /**
     * Revertir una mensualidad generada: se elimina y el mes queda sin cobro.
     */
    public function revertPayment(Enrollment $enrollment, Payment $payment)
    {
        $user = auth()->user();
        abort_unless($user->hasPermissionTo('generar_pago_mensual') && $user->hasPermissionTo('eliminar_pago'), 403);
        abort_unless($payment->enrollment_id === $enrollment->id, 404);

        if ($reason = $this->monthlyPayments->revertBlocker($payment)) {
            flash_error("No se puede revertir: {$reason}");

            return redirect()->back();
        }

        $label = Carbon::parse($payment->due_date)->locale('es')->isoFormat('MMMM YYYY');
        $this->monthlyPayments->revert($payment);
        flash_success("Se revirtió la mensualidad de {$label}.");

        return redirect()->back();
    }

    /** Años disponibles en la cuadrícula: desde el año de la matrícula hasta el próximo. */
    private function paymentYearRange(Enrollment $enrollment): array
    {
        $from = Carbon::parse($enrollment->enrollment_date ?? $enrollment->created_at)->year;
        $to = (int) now()->year + 1;

        return range(min($from, $to), $to);
    }

    /** Cobro del mes actual al activar una matrícula, si el mes aún no lo tiene. */
    private function generateCurrentMonthPayment(Enrollment $enrollment): ?Payment
    {
        $month = Carbon::today()->startOfMonth();
        if ($this->monthlyPayments->monthHasPayment($enrollment, $month)) {
            return null;
        }

        return $this->monthlyPayments->generate($enrollment, $month);
    }

    /**
     * Obtener estudiantes disponibles para un programa
     */
    public function availableStudents(AcademicProgram $program)
    {
        // Obtener IDs de estudiantes ya inscritos en este programa
        $enrolledStudentIds = $program->enrollments()
            ->whereIn('status', ['active', 'waiting'])
            ->pluck('student_id')
            ->toArray();

        $availableStudents = User::role('Estudiante')
            ->whereNotIn('id', $enrolledStudentIds)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json($availableStudents);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\AcademicProgram;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Carbon\Carbon;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Enrollment::with(['student', 'program'])
            ->latest();

        // Filtros opcionales
        if ($request->filled('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $enrollments = $query->paginate(15);

        // Estadísticas
        $stats = [
            'total_enrollments' => Enrollment::count(),
            'active_enrollments' => Enrollment::where('status', 'active')->count(),
            'waiting_list' => Enrollment::where('status', 'waiting')->count(),
            'withdrawn' => Enrollment::where('status', 'withdrawn')->count(),
        ];

        // Listas para filtros
        $programs = AcademicProgram::where('status', 'active')
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
            'filters' => $request->only(['program_id', 'status', 'search']),
        ]);
    }

    public function create()
    {
        $programs = AcademicProgram::where('status', 'active')
            ->withCount(['enrollments as active_count' => function ($query) {
                $query->where('status', 'active');
            }])
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'program_id' => ['required', 'exists:academic_programs,id'],
            'schedule_id' => ['nullable', 'exists:schedules,id'],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['active', 'waiting', 'withdrawn'])],
        ], [
            'student_id.required' => 'El estudiante es obligatorio',
            'student_id.exists' => 'El estudiante seleccionado no existe',
            'program_id.required' => 'El programa académico es obligatorio',
            'program_id.exists' => 'El programa académico seleccionado no existe',
            'schedule_id.exists' => 'El horario seleccionado no existe',
            'enrollment_date.date' => 'La fecha de inscripción debe ser una fecha válida',
            'status.required' => 'El estado es obligatorio',
            'status.in' => 'El estado debe ser: activo, en espera o retirado',
        ]);

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
        if (!isset($validated['enrollment_date'])) {
            $validated['enrollment_date'] = Carbon::today();
        }

        // Crear la inscripción al programa
        $scheduleId = $validated['schedule_id'] ?? null;
        unset($validated['schedule_id']); // Remove from enrollment data

        $enrollment = Enrollment::create($validated);

        // Si se seleccionó un horario, inscribir al estudiante en ese horario
        if ($scheduleId) {
            $schedule = \App\Models\Schedule::findOrFail($scheduleId);

            // Verificar que haya cupos disponibles
            if (!$schedule->hasAvailableSlots()) {
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

            if (!$existingScheduleEnrollment) {
                \App\Models\ScheduleEnrollment::create([
                    'student_id' => $validated['student_id'],
                    'schedule_id' => $scheduleId,
                    'enrollment_date' => $validated['enrollment_date'],
                    'status' => 'enrolled',
                ]);

                flash_success('Inscripción creada exitosamente y estudiante inscrito en el horario seleccionado');
            } else {
                flash_success('Inscripción al programa creada exitosamente (el estudiante ya estaba inscrito en el horario)');
            }
        } else {
            flash_success('Inscripción creada exitosamente');
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
            }
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

        return Inertia::render('Enrollments/Show', [
            'enrollment' => $enrollment,
            'studentSchedules' => $studentSchedules,
            'payments' => $payments,
        ]);
    }

    public function edit(Enrollment $enrollment)
    {
        $enrollment->load('student', 'program');

        $programs = AcademicProgram::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Enrollments/Edit', [
            'enrollment' => $enrollment,
            'programs' => $programs,
        ]);
    }

    public function update(Request $request, Enrollment $enrollment)
    {
        $validated = $request->validate([
            'program_id' => ['required', 'exists:academic_programs,id'],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['active', 'waiting', 'withdrawn'])],
        ], [
            'program_id.required' => 'El programa académico es obligatorio',
            'program_id.exists' => 'El programa académico seleccionado no existe',
            'enrollment_date.date' => 'La fecha de inscripción debe ser una fecha válida',
            'status.required' => 'El estado es obligatorio',
            'status.in' => 'El estado debe ser: activo, en espera o retirado',
        ]);

        // Si cambia de programa, verificar que no esté ya inscrito
        if ($validated['program_id'] != $enrollment->program_id) {
            $existingEnrollment = Enrollment::where('student_id', $enrollment->student_id)
                ->where('program_id', $validated['program_id'])
                ->where('id', '!=', $enrollment->id)
                ->whereIn('status', ['active', 'waiting'])
                ->exists();

            if ($existingEnrollment) {
                flash_error('El estudiante ya está inscrito en este programa');
                return redirect()->back()->withInput();
            }
        }

        $enrollment->update($validated);

        flash_success('Inscripción actualizada exitosamente');

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
     * Cambiar estado de inscripción
     */
    public function changeStatus(Request $request, Enrollment $enrollment)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['active', 'waiting', 'withdrawn'])],
        ]);

        $enrollment->update($validated);

        $statusMessages = [
            'active' => 'Inscripción activada exitosamente',
            'waiting' => 'Inscripción movida a lista de espera',
            'withdrawn' => 'Inscripción marcada como retirada',
        ];

        flash_success($statusMessages[$validated['status']]);

        return redirect()->back();
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

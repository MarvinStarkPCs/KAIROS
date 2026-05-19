<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\AcademicProgram;
use App\Models\ScheduleSetting;
use App\Models\User;
use App\Models\ScheduleEnrollment;
use App\Http\Requests\StoreScheduleRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $schedules = Schedule::with(['academicProgram', 'professor'])
            ->withCount(['enrollments as enrolled_count' => function ($query) {
                $query->where('status', 'enrolled');
            }])
            ->latest()
            ->get();

        // Agregar available_slots a cada horario
        $schedules->transform(function ($schedule) {
            $schedule->available_slots = $schedule->availableSlots();
            return $schedule;
        });

        // Calcular estadísticas
        $stats = [
            'total_schedules' => Schedule::count(),
            'active_schedules' => Schedule::where('status', 'active')->count(),
            'total_students_enrolled' => ScheduleEnrollment::where('status', 'enrolled')->distinct('student_id')->count('student_id'),
            'total_available_slots' => $schedules->sum('available_slots'),
        ];

        // Obtener listas de profesores y estudiantes para acciones rápidas
        $allProfessors = User::role('Profesor')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $allStudents = User::role('Estudiante')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $allPrograms = AcademicProgram::orderBy('name')->get(['id', 'name', 'color']);

        return Inertia::render('Schedules/Index', [
            'schedules' => $schedules,
            'stats' => $stats,
            'allProfessors' => $allProfessors,
            'allStudents' => $allStudents,
            'allPrograms' => $allPrograms,
        ]);
    }

    public function create()
    {
        $programs = AcademicProgram::active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $professors = User::role('Profesor')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Schedules/Create', [
            'programs' => $programs,
            'professors' => $professors,
        ]);
    }

    public function store(StoreScheduleRequest $request)
    {
        $validated = $request->validated();

        $scheduleSetting = ScheduleSetting::first();

        // Validar que no haya solapamiento de horarios para el mismo programa académico
        if (!$scheduleSetting || $scheduleSetting->validate_program_overlap) {
            $this->validateProgramOverlap($validated, null);
        }

        // Validar que no haya solapamiento de horarios para el mismo profesor
        if ($request->filled('professor_id') && (!$scheduleSetting || $scheduleSetting->validate_professor_overlap)) {
            $this->validateProfessorOverlap($validated, null);
        }

        Schedule::create($validated);

        flash_success('Horario creado exitosamente');

        return redirect()->route('horarios.index');
    }


    public function show(Schedule $schedule)
    {
        $schedule->load([
            'academicProgram',
            'professor',
            'enrollments' => function ($query) {
                $query->with('student')->where('status', 'enrolled');
            }
        ]);

        $schedule->enrolled_count = $schedule->enrollments->count();
        $schedule->available_slots = $schedule->availableSlots();

        // Estudiantes disponibles para inscribir
        $enrolledStudentIds = $schedule->enrollments->pluck('student_id')->toArray();

        $availableStudents = User::role('Estudiante')
            ->whereNotIn('id', $enrolledStudentIds)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Schedules/Show', [
            'schedule' => $schedule,
            'availableStudents' => $availableStudents,
        ]);
    }

    public function edit(Schedule $schedule)
    {
        $programs = AcademicProgram::active()
            ->orderBy('name')
            ->get(['id', 'name']);

        $professors = User::role('Profesor')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $schedule->load('academicProgram', 'professor');

        return Inertia::render('Schedules/Edit', [
            'schedule' => $schedule,
            'programs' => $programs,
            'professors' => $professors,
        ]);
    }

    public function update(StoreScheduleRequest $request, Schedule $schedule)
    {
        $validated = $request->validated();

        $scheduleSetting = ScheduleSetting::first();

        // Validar que no haya solapamiento de horarios para el mismo programa académico
        if (!$scheduleSetting || $scheduleSetting->validate_program_overlap) {
            $this->validateProgramOverlap($validated, $schedule->id);
        }

        // Validar que no haya solapamiento de horarios para el mismo profesor
        if ($request->filled('professor_id') && (!$scheduleSetting || $scheduleSetting->validate_professor_overlap)) {
            $this->validateProfessorOverlap($validated, $schedule->id);
        }

        $schedule->update($validated);

        flash_success('Horario actualizado exitosamente');

        return redirect()->route('horarios.index');
    }

    public function destroy(Schedule $schedule)
    {
        // Verificar que no tenga estudiantes inscritos activos
        $enrolledCount = $schedule->enrollments()->where('status', 'enrolled')->count();

        if ($enrolledCount > 0) {
            flash_error('No se puede eliminar el horario porque tiene estudiantes inscritos activos');
            return redirect()->back();
        }

        $schedule->delete();

        flash_success('Horario eliminado exitosamente');

        return redirect()->route('horarios.index');
    }

    public function enrollStudent(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
        ], [
            'student_id.required' => 'El estudiante es obligatorio',
            'student_id.exists' => 'El estudiante seleccionado no existe',
        ]);

        // Verificar que haya cupos disponibles
        if (!$schedule->hasAvailableSlots()) {
            flash_error('No hay cupos disponibles en este horario');
            return redirect()->back();
        }

        // Verificar que el estudiante no esté ya inscrito
        $existingEnrollment = $schedule->enrollments()
            ->where('student_id', $validated['student_id'])
            ->where('status', 'enrolled')
            ->exists();

        if ($existingEnrollment) {
            flash_error('El estudiante ya está inscrito en este horario');
            return redirect()->back();
        }

        ScheduleEnrollment::create([
            'student_id' => $validated['student_id'],
            'schedule_id' => $schedule->id,
            'enrollment_date' => now(),
            'status' => 'enrolled',
        ]);

        flash_success('Estudiante inscrito exitosamente');

        return redirect()->back();
    }

    public function disenrollStudent(Schedule $schedule, User $student)
    {
        $enrollment = $schedule->enrollments()
            ->where('student_id', $student->id)
            ->where('status', 'enrolled')
            ->first();

        if (!$enrollment) {
            flash_error('El estudiante no está inscrito en este horario');
            return redirect()->back();
        }

        $enrollment->update(['status' => 'dropped']);

        flash_success('Estudiante desinscrito exitosamente');

        return redirect()->back();
    }

    /**
     * Obtener eventos de calendario en formato FullCalendar
     */
    public function calendarEvents(Request $request)
    {
        $query = Schedule::with(['academicProgram', 'professor']);

        // Aplicar filtros
        if ($request->filled('program_id')) {
            $query->where('academic_program_id', $request->program_id);
        }

        if ($request->filled('professor_id')) {
            $query->where('professor_id', $request->professor_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        } else {
            $query->active();
        }

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        $schedules = $query->get();

        // Convertir a formato FullCalendar
        $events = $schedules->map(function ($schedule) {
            return $schedule->toCalendarEvent();
        });

        return response()->json($events);
    }

    /**
     * Actualizar solo el profesor asignado a un horario
     */
    public function updateProfessor(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'professor_id' => ['nullable', 'exists:users,id'],
        ], [
            'professor_id.exists' => 'El profesor seleccionado no existe',
        ]);

        // Si se asigna un profesor, validar que no tenga conflictos de horario
        $scheduleSetting = ScheduleSetting::first();
        if ($request->filled('professor_id') && (!$scheduleSetting || $scheduleSetting->validate_professor_overlap)) {
            $data = [
                'professor_id' => $validated['professor_id'],
                'days_of_week' => $schedule->days_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
            ];
            $this->validateProfessorOverlap($data, $schedule->id);
        }

        $schedule->update(['professor_id' => $validated['professor_id']]);

        flash_success('Profesor actualizado exitosamente');

        return redirect()->back();
    }

    /**
     * Verificar conflictos de horario para un estudiante
     */
    public function checkStudentConflicts(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'schedule_id' => ['required', 'exists:schedules,id'],
        ]);

        $student = User::findOrFail($validated['student_id']);
        $newSchedule = Schedule::findOrFail($validated['schedule_id']);

        // Obtener todos los horarios en los que el estudiante está inscrito
        $studentSchedules = $student->scheduleEnrollments()
            ->with('schedule')
            ->where('status', 'enrolled')
            ->get()
            ->pluck('schedule');

        // Verificar conflictos
        $conflicts = $studentSchedules->filter(function ($schedule) use ($newSchedule) {
            return $schedule->hasConflictWith($newSchedule);
        });

        return response()->json([
            'has_conflicts' => $conflicts->isNotEmpty(),
            'conflicts' => $conflicts->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'name' => $schedule->name,
                    'days_of_week' => $schedule->days_of_week,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                ];
            }),
        ]);
    }

    /**
     * Inscripción masiva de estudiantes en un horario
     */
    public function bulkEnroll(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['required', 'exists:users,id'],
        ], [
            'student_ids.required' => 'Debe seleccionar al menos un estudiante',
            'student_ids.array' => 'El formato de estudiantes es inválido',
            'student_ids.min' => 'Debe seleccionar al menos un estudiante',
            'student_ids.*.exists' => 'Uno o más estudiantes seleccionados no existen',
        ]);

        $enrolled = 0;
        $skipped = 0;
        $conflicts = [];

        foreach ($validated['student_ids'] as $studentId) {
            // Verificar cupos disponibles
            if (!$schedule->hasAvailableSlots()) {
                flash_warning("Se inscribieron {$enrolled} estudiantes. No hay más cupos disponibles.");
                break;
            }

            // Verificar si ya está inscrito
            $existingEnrollment = $schedule->enrollments()
                ->where('student_id', $studentId)
                ->where('status', 'enrolled')
                ->exists();

            if ($existingEnrollment) {
                $skipped++;
                continue;
            }

            // Verificar conflictos de horario
            $student = User::find($studentId);
            $studentSchedules = $student->scheduleEnrollments()
                ->with('schedule')
                ->where('status', 'enrolled')
                ->get()
                ->pluck('schedule');

            $hasConflict = $studentSchedules->contains(function ($existingSchedule) use ($schedule) {
                return $existingSchedule->hasConflictWith($schedule);
            });

            if ($hasConflict) {
                $conflicts[] = $student->name;
                continue;
            }

            // Inscribir
            ScheduleEnrollment::create([
                'student_id' => $studentId,
                'schedule_id' => $schedule->id,
                'enrollment_date' => now(),
                'status' => 'enrolled',
            ]);

            $enrolled++;
        }

        $message = "Se inscribieron {$enrolled} estudiantes exitosamente.";
        if ($skipped > 0) {
            $message .= " {$skipped} ya estaban inscritos.";
        }
        if (!empty($conflicts)) {
            $message .= " " . count($conflicts) . " estudiantes tienen conflictos de horario: " . implode(', ', $conflicts);
        }

        flash_success($message);

        return redirect()->back();
    }

    /**
     * Validar que no haya solapamiento de horarios para el mismo programa académico
     */
    private function validateProgramOverlap(array $data, ?int $excludeScheduleId = null)
    {
        $daysArray = array_map('trim', explode(',', $data['days_of_week']));

        $overlapping = Schedule::where('academic_program_id', $data['academic_program_id'])
            ->where('status', '!=', 'completed')
            ->when($excludeScheduleId, function ($query, $id) {
                $query->where('id', '!=', $id);
            })
            ->get()
            ->filter(function ($schedule) use ($daysArray, $data) {
                // Verificar si hay días en común
                $scheduleDays = array_map('trim', explode(',', $schedule->days_of_week));
                $commonDays = array_intersect($daysArray, $scheduleDays);

                if (empty($commonDays)) {
                    return false;
                }

                // Verificar si hay solapamiento de horarios
                $start1 = strtotime($data['start_time']);
                $end1 = strtotime($data['end_time']);
                $start2 = strtotime($schedule->start_time);
                $end2 = strtotime($schedule->end_time);

                return ($start1 < $end2 && $end1 > $start2);
            });

        if ($overlapping->isNotEmpty()) {
            $conflictSchedule = $overlapping->first();
            throw \Illuminate\Validation\ValidationException::withMessages([
                'academic_program_id' => 'El programa académico ya tiene un horario en el mismo día y hora: ' . $conflictSchedule->name . ' (' . $conflictSchedule->days_of_week . ' ' . $conflictSchedule->start_time . '-' . $conflictSchedule->end_time . ')',
            ]);
        }
    }

    /**
     * Validar que no haya solapamiento de horarios para el mismo profesor
     */
    private function validateProfessorOverlap(array $data, ?int $excludeScheduleId = null)
    {
        $daysArray = array_map('trim', explode(',', $data['days_of_week']));

        $overlapping = Schedule::where('professor_id', $data['professor_id'])
            ->where('status', '!=', 'completed')
            ->when($excludeScheduleId, function ($query, $id) {
                $query->where('id', '!=', $id);
            })
            ->get()
            ->filter(function ($schedule) use ($daysArray, $data) {
                // Verificar si hay días en común
                $scheduleDays = array_map('trim', explode(',', $schedule->days_of_week));
                $commonDays = array_intersect($daysArray, $scheduleDays);

                if (empty($commonDays)) {
                    return false;
                }

                // Verificar si hay solapamiento de horarios
                $start1 = strtotime($data['start_time']);
                $end1 = strtotime($data['end_time']);
                $start2 = strtotime($schedule->start_time);
                $end2 = strtotime($schedule->end_time);

                return ($start1 < $end2 && $end1 > $start2);
            });

        if ($overlapping->isNotEmpty()) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'professor_id' => 'El profesor ya tiene un horario asignado en el mismo día y hora',
            ]);
        }
    }

    /**
     * Mostrar configuración de validaciones de horarios
     */
    public function settings()
    {
        $scheduleSetting = ScheduleSetting::first();

        return Inertia::render('Schedules/Settings', [
            'scheduleSetting' => $scheduleSetting,
        ]);
    }

    /**
     * Actualizar configuración de validaciones de horarios
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'validate_program_overlap' => ['required', 'boolean'],
            'validate_professor_overlap' => ['required', 'boolean'],
        ], [
            'validate_program_overlap.required' => 'La configuración de solapamiento de programa es obligatoria',
            'validate_program_overlap.boolean' => 'El valor debe ser verdadero o falso',
            'validate_professor_overlap.required' => 'La configuración de solapamiento de profesor es obligatoria',
            'validate_professor_overlap.boolean' => 'El valor debe ser verdadero o falso',
        ]);

        $scheduleSetting = ScheduleSetting::first();

        if ($scheduleSetting) {
            $scheduleSetting->update($validated);
        } else {
            ScheduleSetting::create($validated);
        }

        flash_success('Configuración de horarios actualizada correctamente');

        return redirect()->back();
    }
}

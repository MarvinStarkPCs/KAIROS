<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\AcademicProgram;
use App\Models\User;
use App\Models\ScheduleEnrollment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

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

        return Inertia::render('Schedules/Index', [
            'schedules' => $schedules,
            'stats' => $stats,
            'allProfessors' => $allProfessors,
            'allStudents' => $allStudents,
        ]);
    }

    public function create()
    {
        $programs = AcademicProgram::where('status', 'active')
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'academic_program_id' => ['required', 'exists:academic_programs,id'],
            'professor_id' => ['nullable', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'days_of_week' => ['required', 'string'], // "lunes,miércoles,viernes"
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'classroom' => ['nullable', 'string', 'max:100'],
            'semester' => ['nullable', 'string', 'max:50'],
            'max_students' => ['required', 'integer', 'min:1', 'max:200'],
            'status' => ['required', Rule::in(['active', 'inactive', 'completed'])],
        ], [
            'academic_program_id.required' => 'El programa académico es obligatorio',
            'academic_program_id.exists' => 'El programa académico seleccionado no existe',
            'professor_id.exists' => 'El profesor seleccionado no existe',
            'name.required' => 'El nombre del horario es obligatorio',
            'name.max' => 'El nombre no puede superar los 255 caracteres',
            'days_of_week.required' => 'Los días de la semana son obligatorios',
            'start_time.required' => 'La hora de inicio es obligatoria',
            'start_time.date_format' => 'La hora de inicio debe tener formato HH:MM',
            'end_time.required' => 'La hora de fin es obligatoria',
            'end_time.date_format' => 'La hora de fin debe tener formato HH:MM',
            'end_time.after' => 'La hora de fin debe ser posterior a la hora de inicio',
            'max_students.required' => 'El cupo máximo es obligatorio',
            'max_students.integer' => 'El cupo máximo debe ser un número entero',
            'max_students.min' => 'El cupo máximo debe ser al menos 1',
            'max_students.max' => 'El cupo máximo no puede superar los 200 estudiantes',
            'status.required' => 'El estado es obligatorio',
            'status.in' => 'El estado debe ser: activo, inactivo o completado',
        ]);

        // Validar que no haya solapamiento de horarios para el mismo profesor
        if ($request->filled('professor_id')) {
            $this->validateNoOverlap($validated, null);
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
        $programs = AcademicProgram::where('status', 'active')
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

    public function update(Request $request, Schedule $schedule)
    {
        $validated = $request->validate([
            'academic_program_id' => ['required', 'exists:academic_programs,id'],
            'professor_id' => ['nullable', 'exists:users,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'days_of_week' => ['required', 'string'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'classroom' => ['nullable', 'string', 'max:100'],
            'semester' => ['nullable', 'string', 'max:50'],
            'max_students' => ['required', 'integer', 'min:1', 'max:200'],
            'status' => ['required', Rule::in(['active', 'inactive', 'completed'])],
        ], [
            'academic_program_id.required' => 'El programa académico es obligatorio',
            'academic_program_id.exists' => 'El programa académico seleccionado no existe',
            'professor_id.exists' => 'El profesor seleccionado no existe',
            'name.required' => 'El nombre del horario es obligatorio',
            'name.max' => 'El nombre no puede superar los 255 caracteres',
            'days_of_week.required' => 'Los días de la semana son obligatorios',
            'start_time.required' => 'La hora de inicio es obligatoria',
            'start_time.date_format' => 'La hora de inicio debe tener formato HH:MM',
            'end_time.required' => 'La hora de fin es obligatoria',
            'end_time.date_format' => 'La hora de fin debe tener formato HH:MM',
            'end_time.after' => 'La hora de fin debe ser posterior a la hora de inicio',
            'max_students.required' => 'El cupo máximo es obligatorio',
            'max_students.integer' => 'El cupo máximo debe ser un número entero',
            'max_students.min' => 'El cupo máximo debe ser al menos 1',
            'max_students.max' => 'El cupo máximo no puede superar los 200 estudiantes',
            'status.required' => 'El estado es obligatorio',
            'status.in' => 'El estado debe ser: activo, inactivo o completado',
        ]);

        // Validar que no haya solapamiento de horarios para el mismo profesor
        if ($request->filled('professor_id')) {
            $this->validateNoOverlap($validated, $schedule->id);
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

    public function unenrollStudent(Schedule $schedule, User $student)
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
     * Validar que no haya solapamiento de horarios para el mismo profesor
     */
    private function validateNoOverlap(array $data, ?int $excludeScheduleId = null)
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
}

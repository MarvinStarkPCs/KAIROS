<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\Attendance;
use App\Models\Activity;
use App\Models\ActivityEvaluation;
use App\Models\ScheduleEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class TeacherController extends Controller
{
    /**
     * Mostrar los grupos/horarios del profesor
     */
    public function myGroups()
    {
        $teacher = auth()->user();

        // Obtener todos los horarios donde el profesor es el asignado
        $schedules = Schedule::with([
            'academicProgram',
            'enrollments' => function($query) {
                $query->where('status', 'enrolled')->with('student');
            }
        ])
        ->where('professor_id', $teacher->id)
        ->where('status', 'active')
        ->get();

        // Formatear datos para el frontend
        $groups = $schedules->map(function ($schedule) {
            return [
                'id' => $schedule->id,
                'program' => [
                    'id' => $schedule->academicProgram->id,
                    'name' => $schedule->academicProgram->name,
                    'color' => $schedule->academicProgram->color ?? '#7a9b3c',
                ],
                'days_of_week' => $schedule->days_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'classroom' => $schedule->classroom,
                'total_students' => $schedule->enrollments->count(),
            ];
        });

        return Inertia::render('Teacher/MyGroups', [
            'groups' => $groups,
        ]);
    }

    /**
     * Ver detalles de un grupo específico
     */
    public function groupDetail(Schedule $schedule)
    {
        // Verificar que el profesor sea el asignado a este horario
        if ($schedule->professor_id !== auth()->id()) {
            abort(403, 'No tienes permiso para ver este grupo');
        }

        $schedule->load([
            'academicProgram.studyPlans.activities.evaluationCriteria',
            'enrollments' => function($query) {
                $query->where('status', 'enrolled')
                    ->with('student')
                    ->orderBy('enrollment_date');
            }
        ]);

        // Generar fechas de clase basándose en los días del horario
        $classDates = $this->generateClassDates($schedule);

        // Obtener todas las asistencias de este horario
        $allAttendances = Attendance::where('schedule_id', $schedule->id)
            ->with('student')
            ->get();

        // Agrupar asistencias por fecha
        $attendancesByDate = $allAttendances->groupBy(function($item) {
            return $item->class_date->format('Y-m-d');
        });

        // Obtener el total de actividades del programa
        $totalActivities = Activity::whereHas('studyPlan', function($query) use ($schedule) {
            $query->where('program_id', $schedule->academic_program_id);
        })->where('status', 'active')->count();

        // Obtener todas las evaluaciones de los estudiantes de este horario
        $studentEvaluations = ActivityEvaluation::where('schedule_id', $schedule->id)
            ->with(['activity', 'evaluationCriteria'])
            ->get()
            ->groupBy('student_id');

        // Agrupar asistencias por estudiante para estadísticas
        $attendancesByStudent = $allAttendances->groupBy('student_id');

        // Formatear estudiantes con sus estadísticas de asistencia y progreso
        $students = $schedule->enrollments->map(function ($enrollment) use ($attendancesByStudent, $studentEvaluations, $totalActivities, $classDates) {
            $studentAttendances = $attendancesByStudent->get($enrollment->student_id, collect());

            $totalClasses = count($classDates);
            $presentCount = $studentAttendances->where('status', 'present')->count();
            $lateCount = $studentAttendances->where('status', 'late')->count();
            $absentCount = $studentAttendances->where('status', 'absent')->count();
            $markedClasses = $studentAttendances->count();

            // Calcular progreso académico
            $evaluations = $studentEvaluations->get($enrollment->student_id, collect());
            $evaluatedActivityIds = $evaluations->pluck('activity_id')->unique()->count();

            // Calcular promedio de calificaciones
            $totalPointsEarned = 0;
            $totalMaxPoints = 0;
            foreach ($evaluations as $eval) {
                if ($eval->evaluationCriteria) {
                    $totalPointsEarned += $eval->points_earned;
                    $totalMaxPoints += $eval->evaluationCriteria->max_points;
                }
            }
            $averageGrade = $totalMaxPoints > 0 ? round(($totalPointsEarned / $totalMaxPoints) * 100, 1) : 0;

            // Crear mapa de asistencias por fecha
            $attendanceByDate = [];
            foreach ($studentAttendances as $att) {
                $attendanceByDate[$att->class_date->format('Y-m-d')] = [
                    'status' => $att->status,
                    'notes' => $att->notes,
                ];
            }

            return [
                'id' => $enrollment->student->id,
                'name' => $enrollment->student->name,
                'email' => $enrollment->student->email,
                'enrollment_date' => $enrollment->enrollment_date,
                'attendance_stats' => [
                    'total' => $totalClasses,
                    'marked' => $markedClasses,
                    'present' => $presentCount,
                    'late' => $lateCount,
                    'absent' => $absentCount,
                    'percentage' => $markedClasses > 0 ? round((($presentCount + $lateCount) / $markedClasses) * 100, 1) : 0,
                ],
                'progress_stats' => [
                    'evaluated_activities' => $evaluatedActivityIds,
                    'total_activities' => $totalActivities,
                    'progress_percentage' => $totalActivities > 0 ? round(($evaluatedActivityIds / $totalActivities) * 100, 1) : 0,
                    'average_grade' => $averageGrade,
                ],
                'attendance_by_date' => $attendanceByDate,
            ];
        });

        // Obtener actividades del programa
        $activities = Activity::whereHas('studyPlan', function($query) use ($schedule) {
            $query->where('program_id', $schedule->academic_program_id);
        })
        ->with(['studyPlan', 'evaluationCriteria'])
        ->where('status', 'active')
        ->orderBy('order')
        ->get();

        // Formatear fechas de clase con resumen de asistencia
        $classDatesList = collect($classDates)->map(function($date) use ($attendancesByDate, $schedule) {
            $dateStr = $date->format('Y-m-d');
            $attendances = $attendancesByDate->get($dateStr, collect());

            return [
                'date' => $dateStr,
                'day_name' => $this->getDayNameInSpanish($date->dayOfWeek),
                'is_past' => $date->isPast(),
                'is_today' => $date->isToday(),
                'total_students' => $schedule->enrollments->count(),
                'marked_count' => $attendances->count(),
                'present_count' => $attendances->where('status', 'present')->count(),
                'late_count' => $attendances->where('status', 'late')->count(),
                'absent_count' => $attendances->where('status', 'absent')->count(),
            ];
        })->sortByDesc('date')->values();

        return Inertia::render('Teacher/GroupDetail', [
            'schedule' => [
                'id' => $schedule->id,
                'program' => [
                    'id' => $schedule->academicProgram->id,
                    'name' => $schedule->academicProgram->name,
                    'color' => $schedule->academicProgram->color ?? '#7a9b3c',
                ],
                'days_of_week' => $schedule->days_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'location' => $schedule->location ?? $schedule->classroom,
                'start_date' => $schedule->start_date,
                'end_date' => $schedule->end_date,
            ],
            'students' => $students,
            'activities' => $activities,
            'classDates' => $classDatesList,
        ]);
    }

    /**
     * Generar fechas de clase basándose en los días del horario
     */
    private function generateClassDates(Schedule $schedule): array
    {
        $days = array_map('trim', explode(',', $schedule->days_of_week));

        // Mapeo de días en español a número de día de la semana (Carbon)
        $dayMap = [
            'lunes' => Carbon::MONDAY,
            'martes' => Carbon::TUESDAY,
            'miércoles' => Carbon::WEDNESDAY,
            'miercoles' => Carbon::WEDNESDAY,
            'jueves' => Carbon::THURSDAY,
            'viernes' => Carbon::FRIDAY,
            'sábado' => Carbon::SATURDAY,
            'sabado' => Carbon::SATURDAY,
            'domingo' => Carbon::SUNDAY,
        ];

        // Fecha de inicio (usar start_date del horario o hace 3 meses)
        $startDate = $schedule->start_date
            ? Carbon::parse($schedule->start_date)
            : Carbon::now()->subMonths(3)->startOfWeek();

        // Fecha de fin (usar end_date del horario o hoy + 1 semana para ver próximas clases)
        $endDate = $schedule->end_date
            ? Carbon::parse($schedule->end_date)
            : Carbon::now()->addWeek();

        // No ir más allá de hoy + 1 semana
        if ($endDate->gt(Carbon::now()->addWeek())) {
            $endDate = Carbon::now()->addWeek();
        }

        $classDates = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            foreach ($days as $day) {
                $dayNumber = $dayMap[strtolower($day)] ?? null;
                if ($dayNumber !== null && $current->dayOfWeek === $dayNumber) {
                    $classDates[] = $current->copy();
                }
            }
            $current->addDay();
        }

        return $classDates;
    }

    /**
     * Obtener nombre del día en español
     */
    private function getDayNameInSpanish(int $dayOfWeek): string
    {
        $days = [
            Carbon::SUNDAY => 'Domingo',
            Carbon::MONDAY => 'Lunes',
            Carbon::TUESDAY => 'Martes',
            Carbon::WEDNESDAY => 'Miércoles',
            Carbon::THURSDAY => 'Jueves',
            Carbon::FRIDAY => 'Viernes',
            Carbon::SATURDAY => 'Sábado',
        ];

        return $days[$dayOfWeek] ?? '';
    }

    /**
     * Marcar asistencia grupal
     */
    public function markGroupAttendance(Request $request, Schedule $schedule)
    {
        // Verificar que el profesor sea el asignado
        if ($schedule->professor_id !== auth()->id()) {
            abort(403, 'No tienes permiso para marcar asistencia de este grupo');
        }

        $validated = $request->validate([
            'class_date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:users,id',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.notes' => 'nullable|string|max:500',
        ], [
            'class_date.required' => 'La fecha de clase es obligatoria',
            'attendances.required' => 'Debe marcar al menos un estudiante',
            'attendances.*.student_id.required' => 'El estudiante es obligatorio',
            'attendances.*.status.required' => 'El estado de asistencia es obligatorio',
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['attendances'] as $attendanceData) {
                // Verificar si ya existe un registro para este estudiante, horario y fecha
                Attendance::updateOrCreate(
                    [
                        'student_id' => $attendanceData['student_id'],
                        'schedule_id' => $schedule->id,
                        'class_date' => $validated['class_date'],
                    ],
                    [
                        'status' => $attendanceData['status'],
                        'notes' => $attendanceData['notes'] ?? null,
                        'recorded_by' => auth()->id(),
                    ]
                );
            }

            DB::commit();
            flash_success('Asistencia registrada exitosamente');

            return redirect()->back();
        } catch (\Exception $e) {
            DB::rollBack();
            flash_error('Error al registrar la asistencia: ' . $e->getMessage());
            return redirect()->back();
        }
    }

    /**
     * Página para evaluar estudiantes
     */
    public function evaluateActivity(Schedule $schedule, Activity $activity)
    {
        // Verificar que el profesor sea el asignado
        if ($schedule->professor_id !== auth()->id()) {
            abort(403, 'No tienes permiso para evaluar este grupo');
        }

        // Verificar que la actividad pertenezca al programa del horario
        if ($activity->studyPlan->program_id !== $schedule->academic_program_id) {
            abort(403, 'Esta actividad no pertenece al programa de este grupo');
        }

        $activity->load(['studyPlan', 'evaluationCriteria']);

        // Obtener estudiantes del horario con su información de asistencia
        $students = ScheduleEnrollment::where('schedule_id', $schedule->id)
            ->where('status', 'enrolled')
            ->with(['student'])
            ->get()
            ->map(function ($enrollment) use ($activity, $schedule) {
                // Obtener evaluaciones existentes de este estudiante para esta actividad
                $existingEvaluations = ActivityEvaluation::where('student_id', $enrollment->student_id)
                    ->where('activity_id', $activity->id)
                    ->with('evaluationCriteria')
                    ->get();

                // Verificar si el estudiante tiene al menos una asistencia registrada en este horario
                $hasAttendance = Attendance::where('student_id', $enrollment->student_id)
                    ->where('schedule_id', $schedule->id)
                    ->exists();

                // Obtener estadísticas de asistencia
                $attendanceStats = Attendance::where('student_id', $enrollment->student_id)
                    ->where('schedule_id', $schedule->id)
                    ->selectRaw('COUNT(*) as total')
                    ->selectRaw('SUM(CASE WHEN status = "present" THEN 1 ELSE 0 END) as present')
                    ->selectRaw('SUM(CASE WHEN status = "late" THEN 1 ELSE 0 END) as late')
                    ->selectRaw('SUM(CASE WHEN status = "absent" THEN 1 ELSE 0 END) as absent')
                    ->first();

                return [
                    'id' => $enrollment->student->id,
                    'name' => $enrollment->student->name,
                    'email' => $enrollment->student->email,
                    'existing_evaluations' => $existingEvaluations,
                    'has_attendance' => $hasAttendance,
                    'attendance_stats' => [
                        'total' => $attendanceStats->total ?? 0,
                        'present' => $attendanceStats->present ?? 0,
                        'late' => $attendanceStats->late ?? 0,
                        'absent' => $attendanceStats->absent ?? 0,
                    ],
                ];
            });

        return Inertia::render('Teacher/EvaluateActivity', [
            'schedule' => [
                'id' => $schedule->id,
                'program' => [
                    'name' => $schedule->academicProgram->name,
                    'color' => $schedule->academicProgram->color ?? '#7a9b3c',
                ],
            ],
            'activity' => [
                'id' => $activity->id,
                'name' => $activity->name,
                'description' => $activity->description,
                'weight' => $activity->weight,
                'study_plan' => [
                    'module_name' => $activity->studyPlan->module_name,
                ],
                'evaluation_criteria' => $activity->evaluationCriteria,
            ],
            'students' => $students,
        ]);
    }

    /**
     * Guardar evaluaciones
     */
    public function storeEvaluations(Request $request, Schedule $schedule, Activity $activity)
    {
        // Verificar que el profesor sea el asignado
        if ($schedule->professor_id !== auth()->id()) {
            abort(403, 'No tienes permiso para evaluar este grupo');
        }

        $validated = $request->validate([
            'evaluation_date' => 'required|date',
            'evaluations' => 'required|array',
            'evaluations.*.student_id' => 'required|exists:users,id',
            'evaluations.*.criteria' => 'required|array',
            'evaluations.*.criteria.*.evaluation_criteria_id' => 'required|exists:evaluation_criteria,id',
            'evaluations.*.criteria.*.points_earned' => 'required|numeric|min:0',
            'evaluations.*.feedback' => 'nullable|string|max:1000',
        ], [
            'evaluation_date.required' => 'La fecha de evaluación es obligatoria',
            'evaluations.required' => 'Debe evaluar al menos un estudiante',
        ]);

        DB::beginTransaction();
        try {
            $studentsWithoutAttendance = [];

            foreach ($validated['evaluations'] as $evaluationData) {
                // Verificar que el estudiante tenga asistencia registrada
                $hasAttendance = Attendance::where('student_id', $evaluationData['student_id'])
                    ->where('schedule_id', $schedule->id)
                    ->exists();

                if (!$hasAttendance) {
                    // Obtener nombre del estudiante para el mensaje de error
                    $student = \App\Models\User::find($evaluationData['student_id']);
                    $studentsWithoutAttendance[] = $student->name ?? 'ID: ' . $evaluationData['student_id'];
                    continue; // Saltar este estudiante
                }

                foreach ($evaluationData['criteria'] as $criteriaData) {
                    ActivityEvaluation::updateOrCreate(
                        [
                            'student_id' => $evaluationData['student_id'],
                            'activity_id' => $activity->id,
                            'evaluation_criteria_id' => $criteriaData['evaluation_criteria_id'],
                            'schedule_id' => $schedule->id,
                        ],
                        [
                            'teacher_id' => auth()->id(),
                            'points_earned' => $criteriaData['points_earned'],
                            'feedback' => $evaluationData['feedback'] ?? null,
                            'evaluation_date' => $validated['evaluation_date'],
                        ]
                    );
                }
            }

            DB::commit();

            if (!empty($studentsWithoutAttendance)) {
                flash_warning('Evaluaciones guardadas parcialmente. Los siguientes estudiantes no tienen asistencia registrada: ' . implode(', ', $studentsWithoutAttendance));
            } else {
                flash_success('Evaluaciones guardadas exitosamente');
            }

            return redirect()->route('profesor.grupo.detalle', $schedule);
        } catch (\Exception $e) {
            DB::rollBack();
            flash_error('Error al guardar las evaluaciones: ' . $e->getMessage());
            return redirect()->back();
        }
    }
}

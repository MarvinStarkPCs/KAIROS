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
                'day_of_week' => $schedule->day_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'location' => $schedule->location,
                'total_students' => $schedule->enrollments->count(),
                'start_date' => $schedule->start_date,
                'end_date' => $schedule->end_date,
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

        // Obtener asistencias recientes de este horario
        $recentAttendances = Attendance::where('schedule_id', $schedule->id)
            ->where('class_date', '>=', Carbon::now()->subWeeks(2))
            ->with('student')
            ->get()
            ->groupBy('student_id');

        // Formatear estudiantes con sus estadísticas de asistencia
        $students = $schedule->enrollments->map(function ($enrollment) use ($recentAttendances) {
            $studentAttendances = $recentAttendances->get($enrollment->student_id, collect());

            $totalClasses = $studentAttendances->count();
            $presentCount = $studentAttendances->where('status', 'present')->count();
            $lateCount = $studentAttendances->where('status', 'late')->count();
            $absentCount = $studentAttendances->where('status', 'absent')->count();

            return [
                'id' => $enrollment->student->id,
                'name' => $enrollment->student->name,
                'email' => $enrollment->student->email,
                'enrollment_date' => $enrollment->enrollment_date,
                'attendance_stats' => [
                    'total' => $totalClasses,
                    'present' => $presentCount,
                    'late' => $lateCount,
                    'absent' => $absentCount,
                    'percentage' => $totalClasses > 0 ? round((($presentCount + $lateCount) / $totalClasses) * 100, 1) : 0,
                ],
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

        return Inertia::render('Teacher/GroupDetail', [
            'schedule' => [
                'id' => $schedule->id,
                'program' => [
                    'id' => $schedule->academicProgram->id,
                    'name' => $schedule->academicProgram->name,
                    'color' => $schedule->academicProgram->color ?? '#7a9b3c',
                ],
                'day_of_week' => $schedule->day_of_week,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'location' => $schedule->location,
                'start_date' => $schedule->start_date,
                'end_date' => $schedule->end_date,
            ],
            'students' => $students,
            'activities' => $activities,
        ]);
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

        // Obtener estudiantes del horario
        $students = ScheduleEnrollment::where('schedule_id', $schedule->id)
            ->where('status', 'enrolled')
            ->with(['student'])
            ->get()
            ->map(function ($enrollment) use ($activity) {
                // Obtener evaluaciones existentes de este estudiante para esta actividad
                $existingEvaluations = ActivityEvaluation::where('student_id', $enrollment->student_id)
                    ->where('activity_id', $activity->id)
                    ->with('evaluationCriteria')
                    ->get();

                return [
                    'id' => $enrollment->student->id,
                    'name' => $enrollment->student->name,
                    'email' => $enrollment->student->email,
                    'existing_evaluations' => $existingEvaluations,
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
            foreach ($validated['evaluations'] as $evaluationData) {
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
            flash_success('Evaluaciones guardadas exitosamente');

            return redirect()->route('profesor.grupo.detalle', $schedule);
        } catch (\Exception $e) {
            DB::rollBack();
            flash_error('Error al guardar las evaluaciones: ' . $e->getMessage());
            return redirect()->back();
        }
    }
}

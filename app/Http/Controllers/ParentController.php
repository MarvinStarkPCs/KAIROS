<?php

namespace App\Http\Controllers;

use App\Models\AcademicProgram;
use App\Models\ActivityEvaluation;
use App\Models\Attendance;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ParentController extends Controller
{
    /**
     * Dashboard del responsable: muestra todos los hijos con resumen académico
     */
    public function dashboard()
    {
        $user = Auth::user();

        $children = $user->dependents()
            ->with([
                'programEnrollments' => function ($q) {
                    $q->whereIn('status', ['active', 'waiting'])->with('program');
                },
            ])
            ->get()
            ->map(function ($child) {
                return [
                    'id' => $child->id,
                    'name' => $child->name,
                    'last_name' => $child->last_name,
                    'document_type' => $child->document_type,
                    'document_number' => $child->document_number,
                    'birth_date' => $child->birth_date?->format('Y-m-d'),
                    'age' => $child->birth_date?->age,
                    'enrollments' => $child->programEnrollments->map(fn ($e) => [
                        'id' => $e->id,
                        'program_id' => $e->program_id,
                        'program_name' => $e->program->name,
                        'program_color' => $e->program->color ?? '#6b5544',
                        'status' => $e->status,
                        'enrollment_date' => $e->enrollment_date?->format('Y-m-d'),
                        'stats' => $this->getProgramStats($child->id, $e->program),
                    ]),
                    'attendance' => $this->getChildAttendanceStats($child->id),
                    'pending_payments' => $child->payments()->where('status', 'pending')->count(),
                ];
            });

        return Inertia::render('Parent/Dashboard', [
            'children' => $children,
        ]);
    }

    /**
     * Ver calificaciones detalladas de un hijo en un programa
     */
    public function childGrades(User $child, $programId = null)
    {
        $parent = Auth::user();

        // Verificar que el hijo pertenece a este responsable
        if ($child->parent_id !== $parent->id) {
            abort(403, 'No tienes permiso para ver este estudiante');
        }

        // Obtener matrículas activas del hijo
        $enrollments = $child->programEnrollments()
            ->with(['program'])
            ->whereIn('status', ['active', 'waiting'])
            ->get();

        // Si se especifica un programa, obtener sus detalles
        $selectedProgram = null;
        $modules = [];
        $programStats = null;

        if ($programId) {
            $enrollment = $enrollments->firstWhere('program_id', $programId);

            if ($enrollment) {
                $selectedProgram = $enrollment->program;

                // Obtener módulos con actividades y evaluaciones
                $modules = $selectedProgram->studyPlans()
                    ->orderBy('level')
                    ->with(['activities' => function ($query) {
                        $query->where('status', 'active')
                            ->orderBy('order')
                            ->with('evaluationCriteria');
                    }])
                    ->get()
                    ->map(function ($module) use ($child) {
                        $activities = $module->activities->map(function ($activity) use ($child) {
                            $evaluations = ActivityEvaluation::where('student_id', $child->id)
                                ->where('activity_id', $activity->id)
                                ->with('evaluationCriteria')
                                ->get();

                            $totalMaxPoints = $activity->getTotalMaxPoints();
                            $totalEarned = $evaluations->sum('points_earned');
                            $percentage = $totalMaxPoints > 0 ? round(($totalEarned / $totalMaxPoints) * 100, 1) : null;

                            return [
                                'id' => $activity->id,
                                'name' => $activity->name,
                                'description' => $activity->description,
                                'weight' => $activity->weight,
                                'total_max_points' => $totalMaxPoints,
                                'points_earned' => $totalEarned,
                                'percentage' => $percentage,
                                'is_evaluated' => $evaluations->isNotEmpty(),
                                'evaluation_date' => $evaluations->max('evaluation_date'),
                                'feedback' => $evaluations->pluck('feedback')->filter()->first(),
                                'criteria_evaluations' => $evaluations->map(function ($eval) {
                                    return [
                                        'criteria_name' => $eval->evaluationCriteria->name ?? 'General',
                                        'max_points' => $eval->evaluationCriteria->max_points ?? 0,
                                        'points_earned' => $eval->points_earned,
                                    ];
                                }),
                            ];
                        });

                        $evaluatedActivities = $activities->where('is_evaluated', true)->count();
                        $totalActivities = $activities->count();
                        $moduleAverage = $activities->where('is_evaluated', true)->avg('percentage');

                        return [
                            'id' => $module->id,
                            'name' => $module->module_name,
                            'description' => $module->description,
                            'level' => $module->level,
                            'hours' => $module->hours,
                            'activities' => $activities,
                            'progress' => [
                                'evaluated' => $evaluatedActivities,
                                'total' => $totalActivities,
                                'percentage' => $totalActivities > 0 ? round(($evaluatedActivities / $totalActivities) * 100, 1) : 0,
                                'average_score' => $moduleAverage ? round($moduleAverage, 1) : null,
                            ],
                        ];
                    });

                // Estadísticas generales del programa
                $allActivities = $modules->pluck('activities')->flatten(1);
                $evaluatedActivities = $allActivities->where('is_evaluated', true);

                $programStats = [
                    'total_modules' => $modules->count(),
                    'total_activities' => $allActivities->count(),
                    'evaluated_activities' => $evaluatedActivities->count(),
                    'overall_progress' => $allActivities->count() > 0
                        ? round(($evaluatedActivities->count() / $allActivities->count()) * 100, 1)
                        : 0,
                    'overall_average' => $evaluatedActivities->avg('percentage')
                        ? round($evaluatedActivities->avg('percentage'), 1)
                        : null,
                ];
            }
        }

        // Obtener asistencias del hijo
        $attendanceData = $this->getStudentAttendance($child->id);

        return Inertia::render('Parent/ChildGrades', [
            'child' => [
                'id' => $child->id,
                'name' => $child->name.' '.($child->last_name ?? ''),
            ],
            'enrollments' => $enrollments->map(fn ($e) => [
                'id' => $e->id,
                'program_id' => $e->program_id,
                'program_name' => $e->program->name,
                'program_color' => $e->program->color ?? '#6b5544',
                'status' => $e->status,
            ]),
            'selectedProgramId' => $programId ? (int) $programId : null,
            'selectedProgram' => $selectedProgram ? [
                'id' => $selectedProgram->id,
                'name' => $selectedProgram->name,
                'description' => $selectedProgram->description,
                'color' => $selectedProgram->color ?? '#6b5544',
            ] : null,
            'modules' => $modules,
            'programStats' => $programStats,
            'attendanceStats' => $attendanceData['stats'],
            'recentAttendances' => $attendanceData['recent'],
        ]);
    }

    /**
     * Obtener estadísticas resumidas de un programa para el dashboard
     */
    private function getProgramStats(int $studentId, AcademicProgram $program): array
    {
        $modules = $program->studyPlans()
            ->orderBy('level')
            ->with(['activities' => function ($q) {
                $q->where('status', 'active')->with('evaluationCriteria');
            }])
            ->get();

        $totalModules = $modules->count();
        $totalActivities = 0;
        $evaluatedActivities = 0;
        $scores = [];

        foreach ($modules as $module) {
            foreach ($module->activities as $activity) {
                $totalActivities++;
                $evaluations = ActivityEvaluation::where('student_id', $studentId)
                    ->where('activity_id', $activity->id)
                    ->get();
                if ($evaluations->isNotEmpty()) {
                    $evaluatedActivities++;
                    $totalMax = $activity->getTotalMaxPoints();
                    $totalEarned = $evaluations->sum('points_earned');
                    if ($totalMax > 0) {
                        $scores[] = round(($totalEarned / $totalMax) * 100, 1);
                    }
                }
            }
        }

        return [
            'total_modules' => $totalModules,
            'total_activities' => $totalActivities,
            'evaluated_activities' => $evaluatedActivities,
            'overall_progress' => $totalActivities > 0
                ? round(($evaluatedActivities / $totalActivities) * 100, 1) : 0,
            'overall_average' => count($scores) > 0
                ? round(array_sum($scores) / count($scores), 1) : null,
        ];
    }

    /**
     * Obtener estadísticas de asistencia resumidas de un hijo (para dashboard)
     */
    private function getChildAttendanceStats(int $studentId): array
    {
        $allAttendances = Attendance::where('student_id', $studentId)->get();
        $totalClasses = $allAttendances->count();
        $presentCount = $allAttendances->where('status', 'present')->count();
        $lateCount = $allAttendances->where('status', 'late')->count();
        $absentCount = $allAttendances->where('status', 'absent')->count();
        $excusedCount = $allAttendances->where('status', 'excused')->count();

        return [
            'total_classes' => $totalClasses,
            'present' => $presentCount,
            'late' => $lateCount,
            'absent' => $absentCount,
            'excused' => $excusedCount,
            'percentage' => $totalClasses > 0
                ? round((($presentCount + $lateCount + $excusedCount) / $totalClasses) * 100, 1)
                : 0,
        ];
    }

    /**
     * Obtener estadísticas y registros de asistencia completos (para vista de calificaciones)
     */
    private function getStudentAttendance(int $studentId): array
    {
        $allAttendances = Attendance::where('student_id', $studentId)->get();

        $totalClasses = $allAttendances->count();
        $presentCount = $allAttendances->where('status', 'present')->count();
        $lateCount = $allAttendances->where('status', 'late')->count();
        $absentCount = $allAttendances->where('status', 'absent')->count();
        $excusedCount = $allAttendances->where('status', 'excused')->count();

        $attendancePercentage = $totalClasses > 0
            ? round((($presentCount + $lateCount + $excusedCount) / $totalClasses) * 100, 1)
            : 0;

        $recentAttendances = Attendance::with(['schedule.academicProgram'])
            ->where('student_id', $studentId)
            ->where('class_date', '>=', Carbon::now()->subDays(30))
            ->orderBy('class_date', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($attendance) {
                return [
                    'id' => $attendance->id,
                    'class_date' => $attendance->class_date->format('Y-m-d'),
                    'status' => $attendance->status,
                    'notes' => $attendance->notes,
                    'program_name' => $attendance->schedule->academicProgram->name ?? 'N/A',
                    'program_color' => $attendance->schedule->academicProgram->color ?? '#6b5544',
                    'schedule_day' => $attendance->schedule->day_of_week ?? null,
                    'schedule_time' => $attendance->schedule->start_time ?? null,
                ];
            });

        return [
            'stats' => [
                'total_classes' => $totalClasses,
                'present' => $presentCount,
                'late' => $lateCount,
                'absent' => $absentCount,
                'excused' => $excusedCount,
                'percentage' => $attendancePercentage,
            ],
            'recent' => $recentAttendances,
        ];
    }
}

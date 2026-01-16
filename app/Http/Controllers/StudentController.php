<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\ActivityEvaluation;
use App\Models\StudentProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentController extends Controller
{
    /**
     * Dashboard del estudiante con resumen de su progreso
     */
    public function dashboard()
    {
        $student = Auth::user();

        // Obtener matrículas activas del estudiante con sus programas
        $enrollments = Enrollment::with([
            'program' => function ($query) {
                $query->with(['studyPlans' => function ($q) {
                    $q->orderBy('level')->with(['activities' => function ($a) {
                        $a->where('status', 'active')->orderBy('order');
                    }]);
                }]);
            }
        ])
            ->where('student_id', $student->id)
            ->whereIn('status', ['active', 'waiting'])
            ->get();

        // Calcular estadísticas generales
        $stats = [
            'total_programs' => $enrollments->count(),
            'active_programs' => $enrollments->where('status', 'active')->count(),
            'total_evaluations' => ActivityEvaluation::where('student_id', $student->id)->count(),
            'average_score' => $this->calculateOverallAverage($student->id),
        ];

        // Obtener últimas evaluaciones
        $recentEvaluations = ActivityEvaluation::with(['activity.studyPlan.program', 'teacher'])
            ->where('student_id', $student->id)
            ->orderBy('evaluation_date', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($eval) {
                $maxPoints = $eval->activity->evaluationCriteria()
                    ->where('id', $eval->evaluation_criteria_id)
                    ->value('max_points') ?? $eval->activity->getTotalMaxPoints();

                return [
                    'id' => $eval->id,
                    'activity_name' => $eval->activity->name,
                    'program_name' => $eval->activity->studyPlan->program->name ?? 'N/A',
                    'points_earned' => $eval->points_earned,
                    'max_points' => $maxPoints,
                    'percentage' => $maxPoints > 0 ? round(($eval->points_earned / $maxPoints) * 100, 1) : 0,
                    'feedback' => $eval->feedback,
                    'evaluation_date' => $eval->evaluation_date,
                    'teacher_name' => $eval->teacher->name ?? 'N/A',
                ];
            });

        // Progreso por programa
        $programsProgress = $enrollments->map(function ($enrollment) use ($student) {
            $program = $enrollment->program;
            $progress = $this->calculateProgramProgress($student->id, $program->id);

            return [
                'enrollment_id' => $enrollment->id,
                'program_id' => $program->id,
                'program_name' => $program->name,
                'program_color' => $program->color ?? '#6b5544',
                'enrollment_date' => $enrollment->enrollment_date,
                'status' => $enrollment->status,
                'progress_percentage' => $progress['percentage'],
                'completed_activities' => $progress['completed'],
                'total_activities' => $progress['total'],
                'average_score' => $progress['average_score'],
            ];
        });

        return Inertia::render('Student/Dashboard', [
            'stats' => $stats,
            'programsProgress' => $programsProgress,
            'recentEvaluations' => $recentEvaluations,
        ]);
    }

    /**
     * Ver calificaciones detalladas de un programa
     */
    public function grades($programId = null)
    {
        $student = Auth::user();

        // Obtener matrículas activas
        $enrollments = Enrollment::with(['program'])
            ->where('student_id', $student->id)
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
                    ->map(function ($module) use ($student) {
                        $activities = $module->activities->map(function ($activity) use ($student) {
                            // Obtener evaluaciones del estudiante para esta actividad
                            $evaluations = ActivityEvaluation::where('student_id', $student->id)
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

                        // Calcular progreso del módulo
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

        return Inertia::render('Student/Grades', [
            'enrollments' => $enrollments->map(fn($e) => [
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
        ]);
    }

    /**
     * Calcular promedio general del estudiante
     */
    private function calculateOverallAverage($studentId)
    {
        $evaluations = ActivityEvaluation::where('student_id', $studentId)
            ->with('activity.evaluationCriteria')
            ->get();

        if ($evaluations->isEmpty()) {
            return null;
        }

        $totalPercentage = 0;
        $count = 0;

        foreach ($evaluations as $eval) {
            $maxPoints = $eval->evaluationCriteria?->max_points
                ?? $eval->activity->getTotalMaxPoints();

            if ($maxPoints > 0) {
                $totalPercentage += ($eval->points_earned / $maxPoints) * 100;
                $count++;
            }
        }

        return $count > 0 ? round($totalPercentage / $count, 1) : null;
    }

    /**
     * Calcular progreso de un programa específico
     */
    private function calculateProgramProgress($studentId, $programId)
    {
        $program = \App\Models\AcademicProgram::with(['studyPlans.activities' => function ($q) {
            $q->where('status', 'active');
        }])->find($programId);

        if (!$program) {
            return ['percentage' => 0, 'completed' => 0, 'total' => 0, 'average_score' => null];
        }

        $totalActivities = 0;
        $completedActivities = 0;
        $scores = [];

        foreach ($program->studyPlans as $module) {
            foreach ($module->activities as $activity) {
                $totalActivities++;

                $evaluation = ActivityEvaluation::where('student_id', $studentId)
                    ->where('activity_id', $activity->id)
                    ->first();

                if ($evaluation) {
                    $completedActivities++;
                    $maxPoints = $activity->getTotalMaxPoints();
                    if ($maxPoints > 0) {
                        $scores[] = ($evaluation->points_earned / $maxPoints) * 100;
                    }
                }
            }
        }

        return [
            'percentage' => $totalActivities > 0 ? round(($completedActivities / $totalActivities) * 100, 1) : 0,
            'completed' => $completedActivities,
            'total' => $totalActivities,
            'average_score' => count($scores) > 0 ? round(array_sum($scores) / count($scores), 1) : null,
        ];
    }
}

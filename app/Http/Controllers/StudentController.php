<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\ActivityEvaluation;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class StudentController extends Controller
{
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

        // Obtener asistencias del estudiante
        $attendanceData = $this->getStudentAttendance($student->id);

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
            'attendanceStats' => $attendanceData['stats'],
            'recentAttendances' => $attendanceData['recent'],
        ]);
    }

    /**
     * Obtener estadísticas y registros de asistencia del estudiante
     */
    private function getStudentAttendance($studentId)
    {
        // Obtener todas las asistencias del estudiante
        $allAttendances = Attendance::where('student_id', $studentId)->get();

        // Calcular estadísticas generales
        $totalClasses = $allAttendances->count();
        $presentCount = $allAttendances->where('status', 'present')->count();
        $lateCount = $allAttendances->where('status', 'late')->count();
        $absentCount = $allAttendances->where('status', 'absent')->count();
        $excusedCount = $allAttendances->where('status', 'excused')->count();

        $attendancePercentage = $totalClasses > 0
            ? round((($presentCount + $lateCount + $excusedCount) / $totalClasses) * 100, 1)
            : 0;

        // Obtener asistencias recientes (últimos 30 días) con detalles del horario
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

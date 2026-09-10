<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Centraliza el cálculo de métricas académicas: avance de estudiantes,
 * cobertura de calificación de los profesores y visión general de la academia.
 *
 * Todas las consultas se hacen de forma agregada para evitar N+1: se traen
 * los totales en pocas queries y el cruce final se resuelve en memoria.
 */
class AcademicAnalyticsService
{
    /** Porcentaje mínimo para considerar una actividad aprobada. */
    public const PASSING_THRESHOLD = 60.0;

    /** Por debajo de este promedio un estudiante se marca en riesgo. */
    public const AT_RISK_THRESHOLD = 60.0;

    /** Estados de matrícula que cuentan como "cursando". */
    public const ACTIVE_STATUSES = ['active', 'waiting'];

    // ---------------------------------------------------------------------
    // Bloques base (una query cada uno)
    // ---------------------------------------------------------------------

    /**
     * Total de actividades activas por programa.
     *
     * @return Collection<int, int> program_id => total
     */
    public function activityTotalsByProgram(): Collection
    {
        return DB::table('activities')
            ->join('study_plans', 'activities.study_plan_id', '=', 'study_plans.id')
            ->where('activities.status', 'active')
            ->selectRaw('study_plans.program_id as program_id, COUNT(activities.id) as total')
            ->groupBy('study_plans.program_id')
            ->get()
            ->pluck('total', 'program_id')
            ->map(fn ($total) => (int) $total);
    }

    /**
     * Puntaje máximo de cada actividad (suma de sus criterios).
     *
     * @return Collection<int, float> activity_id => max_points
     */
    public function maxPointsByActivity(): Collection
    {
        return DB::table('evaluation_criteria')
            ->selectRaw('activity_id, SUM(max_points) as max_points')
            ->groupBy('activity_id')
            ->get()
            ->pluck('max_points', 'activity_id')
            ->map(fn ($points) => (float) $points);
    }

    /**
     * Una fila por (estudiante, programa, actividad) con los puntos obtenidos.
     * Es la base para calcular avance y promedio sin recorrer evaluación por evaluación.
     */
    public function evaluationRollup(?int $programId = null, ?int $studentId = null): Collection
    {
        $query = DB::table('activity_evaluations as ae')
            ->join('activities as a', 'ae.activity_id', '=', 'a.id')
            ->join('study_plans as sp', 'a.study_plan_id', '=', 'sp.id')
            ->where('a.status', 'active')
            ->selectRaw(
                'ae.student_id as student_id, sp.program_id as program_id, ae.activity_id as activity_id, '.
                'SUM(ae.points_earned) as earned, MAX(ae.evaluation_date) as last_date'
            )
            ->groupBy('ae.student_id', 'sp.program_id', 'ae.activity_id');

        if ($programId) {
            $query->where('sp.program_id', $programId);
        }
        if ($studentId) {
            $query->where('ae.student_id', $studentId);
        }

        return $query->get();
    }

    /**
     * Asistencia agregada por (estudiante, programa).
     */
    public function attendanceRollup(?int $programId = null, ?int $studentId = null): Collection
    {
        $query = DB::table('attendances as at')
            ->join('schedules as s', 'at.schedule_id', '=', 's.id')
            ->selectRaw(
                'at.student_id as student_id, s.academic_program_id as program_id, COUNT(*) as total, '.
                "SUM(CASE WHEN at.status IN ('present','late') THEN 1 ELSE 0 END) as attended"
            )
            ->groupBy('at.student_id', 's.academic_program_id');

        if ($programId) {
            $query->where('s.academic_program_id', $programId);
        }
        if ($studentId) {
            $query->where('at.student_id', $studentId);
        }

        return $query->get();
    }

    // ---------------------------------------------------------------------
    // Métricas por estudiante
    // ---------------------------------------------------------------------

    /**
     * Una fila por matrícula (estudiante + programa) con su avance y promedio.
     *
     * Filtros aceptados: program_id, status, search, risk ('at_risk'|'no_grades'|'on_track').
     */
    public function studentMetrics(array $filters = []): Collection
    {
        $programId = $filters['program_id'] ?? null;
        $status = $filters['status'] ?? null;
        $search = trim((string) ($filters['search'] ?? ''));

        $enrollments = DB::table('enrollments as e')
            ->join('users as u', 'e.student_id', '=', 'u.id')
            ->join('academic_programs as p', 'e.program_id', '=', 'p.id')
            ->selectRaw(
                'e.id as enrollment_id, e.status as enrollment_status, e.enrollment_date as enrollment_date, '.
                'u.id as student_id, u.name as student_name, u.last_name as student_last_name, u.email as student_email, '.
                'p.id as program_id, p.name as program_name, p.color as program_color'
            )
            ->when($programId, fn ($q) => $q->where('e.program_id', $programId))
            ->when(
                $status,
                fn ($q) => $q->where('e.status', $status),
                fn ($q) => $q->whereIn('e.status', self::ACTIVE_STATUSES)
            )
            ->when($search !== '', function ($q) use ($search) {
                $term = '%'.$search.'%';
                $q->where(function ($inner) use ($term) {
                    $inner->where('u.name', 'like', $term)
                        ->orWhere('u.last_name', 'like', $term)
                        ->orWhere('u.email', 'like', $term);
                });
            })
            ->orderBy('u.name')
            ->orderBy('u.last_name')
            ->get();

        $activityTotals = $this->activityTotalsByProgram();
        $maxPoints = $this->maxPointsByActivity();
        $evaluations = $this->evaluationRollup($programId)->groupBy(
            fn ($row) => $row->student_id.'-'.$row->program_id
        );
        $attendance = $this->attendanceRollup($programId)->keyBy(
            fn ($row) => $row->student_id.'-'.$row->program_id
        );

        $rows = $enrollments->map(function ($enrollment) use ($activityTotals, $maxPoints, $evaluations, $attendance) {
            $key = $enrollment->student_id.'-'.$enrollment->program_id;
            $studentEvaluations = $evaluations->get($key, collect());
            $totalActivities = (int) ($activityTotals[$enrollment->program_id] ?? 0);

            $scores = $studentEvaluations
                ->map(fn ($row) => $this->activityPercentage((float) $row->earned, $maxPoints[$row->activity_id] ?? 0.0))
                ->filter(fn ($score) => $score !== null);

            $evaluatedCount = $studentEvaluations->count();
            $average = $scores->isNotEmpty() ? round($scores->avg(), 1) : null;
            $lastEvaluation = $studentEvaluations->max('last_date');

            $attendanceRow = $attendance->get($key);
            $attendanceRate = $attendanceRow && (int) $attendanceRow->total > 0
                ? round(((int) $attendanceRow->attended / (int) $attendanceRow->total) * 100, 1)
                : null;

            return [
                'enrollment_id' => (int) $enrollment->enrollment_id,
                'enrollment_status' => $enrollment->enrollment_status,
                'enrollment_date' => $enrollment->enrollment_date,
                'student_id' => (int) $enrollment->student_id,
                'student_name' => trim($enrollment->student_name.' '.($enrollment->student_last_name ?? '')),
                'student_email' => $enrollment->student_email,
                'program_id' => (int) $enrollment->program_id,
                'program_name' => $enrollment->program_name,
                'program_color' => $enrollment->program_color ?? '#7a9b3c',
                'total_activities' => $totalActivities,
                'evaluated_activities' => $evaluatedCount,
                'pending_activities' => max($totalActivities - $evaluatedCount, 0),
                'progress' => $totalActivities > 0
                    ? round((min($evaluatedCount, $totalActivities) / $totalActivities) * 100, 1)
                    : 0.0,
                'average' => $average,
                'passing' => $average !== null ? $average >= self::PASSING_THRESHOLD : null,
                'attendance_rate' => $attendanceRate,
                'attendance_records' => $attendanceRow ? (int) $attendanceRow->total : 0,
                'last_evaluation' => $lastEvaluation,
            ];
        });

        return $this->applyRiskFilter($rows, $filters['risk'] ?? null)->values();
    }

    /**
     * Detalle académico completo de un estudiante en un programa concreto.
     * Reproduce la vista de calificaciones del estudiante, pero para cualquier usuario autorizado.
     */
    public function studentDetail(User $student, ?int $programId = null): array
    {
        $enrollments = DB::table('enrollments as e')
            ->join('academic_programs as p', 'e.program_id', '=', 'p.id')
            ->where('e.student_id', $student->id)
            ->selectRaw('e.status as status, p.id as id, p.name as name, p.color as color')
            ->orderBy('p.name')
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'name' => $row->name,
                'color' => $row->color ?? '#7a9b3c',
                'status' => $row->status,
            ]);

        $selectedProgramId = $programId ?: ($enrollments->first()['id'] ?? null);

        if (! $selectedProgramId) {
            return [
                'programs' => $enrollments->values()->all(),
                'selected_program_id' => null,
                'modules' => [],
                'summary' => null,
            ];
        }

        $evaluations = DB::table('activity_evaluations as ae')
            ->leftJoin('evaluation_criteria as ec', 'ae.evaluation_criteria_id', '=', 'ec.id')
            ->leftJoin('users as t', 'ae.teacher_id', '=', 't.id')
            ->where('ae.student_id', $student->id)
            ->selectRaw(
                'ae.activity_id as activity_id, ae.points_earned as points_earned, ae.feedback as feedback, '.
                'ae.evaluation_date as evaluation_date, ec.name as criteria_name, ec.max_points as criteria_max_points, '.
                't.name as teacher_name, t.last_name as teacher_last_name'
            )
            ->get()
            ->groupBy('activity_id');

        $modules = DB::table('study_plans as sp')
            ->where('sp.program_id', $selectedProgramId)
            ->orderBy('sp.level')
            ->orderBy('sp.id')
            ->selectRaw('sp.id as id, sp.module_name as name, sp.description as description, sp.level as level, sp.hours as hours')
            ->get();

        $activities = DB::table('activities as a')
            ->join('study_plans as sp', 'a.study_plan_id', '=', 'sp.id')
            ->where('sp.program_id', $selectedProgramId)
            ->where('a.status', 'active')
            ->orderBy('a.order')
            ->selectRaw('a.id as id, a.study_plan_id as module_id, a.name as name, a.description as description, a.weight as weight')
            ->get()
            ->groupBy('module_id');

        $maxPoints = $this->maxPointsByActivity();

        $modulesPayload = $modules->map(function ($module) use ($activities, $evaluations, $maxPoints) {
            $moduleActivities = $activities->get($module->id, collect())->map(function ($activity) use ($evaluations, $maxPoints) {
                $activityEvaluations = $evaluations->get($activity->id, collect());
                $totalMaxPoints = (float) ($maxPoints[$activity->id] ?? 0.0);
                $earned = (float) $activityEvaluations->sum('points_earned');
                $percentage = $this->activityPercentage($earned, $totalMaxPoints);
                $teacher = $activityEvaluations->first();

                return [
                    'id' => (int) $activity->id,
                    'name' => $activity->name,
                    'description' => $activity->description,
                    'weight' => (float) $activity->weight,
                    'total_max_points' => $totalMaxPoints,
                    'points_earned' => $activityEvaluations->isNotEmpty() ? $earned : null,
                    'percentage' => $percentage,
                    'is_evaluated' => $activityEvaluations->isNotEmpty(),
                    'evaluation_date' => $activityEvaluations->max('evaluation_date'),
                    'feedback' => $activityEvaluations->pluck('feedback')->filter()->first(),
                    'teacher_name' => $teacher && $teacher->teacher_name
                        ? trim($teacher->teacher_name.' '.($teacher->teacher_last_name ?? ''))
                        : null,
                    'criteria' => $activityEvaluations->map(fn ($evaluation) => [
                        'name' => $evaluation->criteria_name ?? 'General',
                        'max_points' => (float) ($evaluation->criteria_max_points ?? 0),
                        'points_earned' => (float) $evaluation->points_earned,
                    ])->values()->all(),
                ];
            })->values();

            $evaluated = $moduleActivities->where('is_evaluated', true);
            $moduleAverage = $evaluated->pluck('percentage')->filter(fn ($value) => $value !== null);

            return [
                'id' => (int) $module->id,
                'name' => $module->name,
                'description' => $module->description,
                'level' => (int) $module->level,
                'hours' => (int) $module->hours,
                'activities' => $moduleActivities->all(),
                'progress' => [
                    'evaluated' => $evaluated->count(),
                    'total' => $moduleActivities->count(),
                    'percentage' => $moduleActivities->count() > 0
                        ? round(($evaluated->count() / $moduleActivities->count()) * 100, 1)
                        : 0.0,
                    'average' => $moduleAverage->isNotEmpty() ? round($moduleAverage->avg(), 1) : null,
                ],
            ];
        })->values();

        $allActivities = $modulesPayload->pluck('activities')->flatten(1);
        $evaluatedActivities = $allActivities->where('is_evaluated', true);
        $averages = $evaluatedActivities->pluck('percentage')->filter(fn ($value) => $value !== null);

        $attendanceRow = $this->attendanceRollup($selectedProgramId, $student->id)->first();

        return [
            'programs' => $enrollments->values()->all(),
            'selected_program_id' => (int) $selectedProgramId,
            'modules' => $modulesPayload->all(),
            'summary' => [
                'total_modules' => $modulesPayload->count(),
                'total_activities' => $allActivities->count(),
                'evaluated_activities' => $evaluatedActivities->count(),
                'progress' => $allActivities->count() > 0
                    ? round(($evaluatedActivities->count() / $allActivities->count()) * 100, 1)
                    : 0.0,
                'average' => $averages->isNotEmpty() ? round($averages->avg(), 1) : null,
                'passed_activities' => $evaluatedActivities
                    ->filter(fn ($activity) => ($activity['percentage'] ?? 0) >= self::PASSING_THRESHOLD)
                    ->count(),
                'attendance_rate' => $attendanceRow && (int) $attendanceRow->total > 0
                    ? round(((int) $attendanceRow->attended / (int) $attendanceRow->total) * 100, 1)
                    : null,
                'attendance_records' => $attendanceRow ? (int) $attendanceRow->total : 0,
            ],
        ];
    }

    // ---------------------------------------------------------------------
    // Métricas de profesores (avance de calificación)
    // ---------------------------------------------------------------------

    /**
     * Cobertura de calificación por profesor y por grupo.
     *
     * "Esperadas" = actividades activas del programa x estudiantes inscritos en el grupo.
     * "Registradas" = pares (estudiante, actividad) ya evaluados en ese grupo.
     */
    public function teacherMetrics(array $filters = []): Collection
    {
        $programId = $filters['program_id'] ?? null;
        $search = trim((string) ($filters['search'] ?? ''));

        $schedules = DB::table('schedules as s')
            ->join('academic_programs as p', 's.academic_program_id', '=', 'p.id')
            ->leftJoin('users as t', 's.professor_id', '=', 't.id')
            ->where('s.status', 'active')
            ->when($programId, fn ($q) => $q->where('s.academic_program_id', $programId))
            ->selectRaw(
                's.id as schedule_id, s.name as schedule_name, s.professor_id as teacher_id, '.
                't.name as teacher_name, t.last_name as teacher_last_name, t.email as teacher_email, '.
                'p.id as program_id, p.name as program_name, p.color as program_color'
            )
            ->orderBy('s.name')
            ->get();

        $activityTotals = $this->activityTotalsByProgram();

        $studentsPerSchedule = DB::table('schedule_enrollments')
            ->where('status', 'enrolled')
            ->selectRaw('schedule_id, COUNT(*) as total')
            ->groupBy('schedule_id')
            ->get()
            ->pluck('total', 'schedule_id');

        // Pares (estudiante, actividad) evaluados, agrupados por horario.
        $evaluatedPairs = DB::table('activity_evaluations as ae')
            ->join('activities as a', 'ae.activity_id', '=', 'a.id')
            ->where('a.status', 'active')
            ->selectRaw(
                'ae.schedule_id as schedule_id, ae.student_id as student_id, ae.activity_id as activity_id, '.
                'MAX(ae.evaluation_date) as last_date'
            )
            ->groupBy('ae.schedule_id', 'ae.student_id', 'ae.activity_id')
            ->get()
            ->groupBy('schedule_id');

        $groups = $schedules->map(function ($schedule) use ($activityTotals, $studentsPerSchedule, $evaluatedPairs) {
            $students = (int) ($studentsPerSchedule[$schedule->schedule_id] ?? 0);
            $activities = (int) ($activityTotals[$schedule->program_id] ?? 0);
            $expected = $students * $activities;

            $pairs = $evaluatedPairs->get($schedule->schedule_id, collect());
            $done = $expected > 0 ? min($pairs->count(), $expected) : $pairs->count();

            return [
                'schedule_id' => (int) $schedule->schedule_id,
                'schedule_name' => $schedule->schedule_name,
                'teacher_id' => $schedule->teacher_id ? (int) $schedule->teacher_id : null,
                'teacher_name' => $schedule->teacher_name
                    ? trim($schedule->teacher_name.' '.($schedule->teacher_last_name ?? ''))
                    : 'Sin profesor asignado',
                'teacher_email' => $schedule->teacher_email,
                'program_id' => (int) $schedule->program_id,
                'program_name' => $schedule->program_name,
                'program_color' => $schedule->program_color ?? '#7a9b3c',
                'students' => $students,
                'activities' => $activities,
                'expected_evaluations' => $expected,
                'completed_evaluations' => $done,
                'pending_evaluations' => max($expected - $done, 0),
                'coverage' => $expected > 0 ? round(($done / $expected) * 100, 1) : null,
                'last_evaluation' => $pairs->max('last_date'),
            ];
        });

        return $groups
            ->groupBy(fn ($group) => $group['teacher_id'] ?? 0)
            ->map(function (Collection $teacherGroups) {
                $first = $teacherGroups->first();
                $expected = $teacherGroups->sum('expected_evaluations');
                $done = $teacherGroups->sum('completed_evaluations');

                return [
                    'teacher_id' => $first['teacher_id'],
                    'teacher_name' => $first['teacher_name'],
                    'teacher_email' => $first['teacher_email'],
                    'groups_count' => $teacherGroups->count(),
                    'students' => $teacherGroups->sum('students'),
                    'expected_evaluations' => $expected,
                    'completed_evaluations' => $done,
                    'pending_evaluations' => max($expected - $done, 0),
                    'coverage' => $expected > 0 ? round(($done / $expected) * 100, 1) : null,
                    'last_evaluation' => $teacherGroups->pluck('last_evaluation')->filter()->max(),
                    'groups' => $teacherGroups->sortBy('schedule_name')->values()->all(),
                ];
            })
            ->when($search !== '', fn (Collection $teachers) => $teachers->filter(
                fn ($teacher) => str_contains(
                    mb_strtolower($teacher['teacher_name'].' '.($teacher['teacher_email'] ?? '')),
                    mb_strtolower($search)
                )
            ))
            ->sortByDesc('pending_evaluations')
            ->values();
    }

    // ---------------------------------------------------------------------
    // Visión general
    // ---------------------------------------------------------------------

    public function overview(array $filters = []): array
    {
        $programId = $filters['program_id'] ?? null;
        $students = $this->studentMetrics(['program_id' => $programId]);
        $teachers = $this->teacherMetrics(['program_id' => $programId]);

        $withGrades = $students->filter(fn ($row) => $row['average'] !== null);
        $averages = $withGrades->pluck('average');
        $attendanceRates = $students->pluck('attendance_rate')->filter(fn ($value) => $value !== null);

        $expected = $teachers->sum('expected_evaluations');
        $completed = $teachers->sum('completed_evaluations');

        $summary = [
            'active_students' => $students->pluck('student_id')->unique()->count(),
            'enrollments' => $students->count(),
            'programs' => $students->pluck('program_id')->unique()->count(),
            'teachers' => $teachers->filter(fn ($row) => $row['teacher_id'] !== null)->count(),
            'average_grade' => $averages->isNotEmpty() ? round($averages->avg(), 1) : null,
            'average_progress' => $students->isNotEmpty() ? round($students->avg('progress'), 1) : 0.0,
            'attendance_rate' => $attendanceRates->isNotEmpty() ? round($attendanceRates->avg(), 1) : null,
            'evaluation_coverage' => $expected > 0 ? round(($completed / $expected) * 100, 1) : null,
            'pending_evaluations' => max($expected - $completed, 0),
            'at_risk_students' => $withGrades->filter(fn ($row) => $row['average'] < self::AT_RISK_THRESHOLD)->count(),
            'students_without_grades' => $students->filter(fn ($row) => $row['average'] === null)->count(),
        ];

        return [
            'summary' => $summary,
            'by_program' => $this->programBreakdown($students, $teachers),
            'grade_distribution' => $this->gradeDistribution($withGrades),
            'evaluation_trend' => $this->evaluationTrend($programId),
            'at_risk' => $withGrades
                ->filter(fn ($row) => $row['average'] < self::AT_RISK_THRESHOLD)
                ->sortBy('average')
                ->take(10)
                ->values()
                ->all(),
            'top_students' => $withGrades
                ->sortByDesc('average')
                ->take(10)
                ->values()
                ->all(),
            'teachers_pending' => $teachers
                ->filter(fn ($row) => $row['pending_evaluations'] > 0)
                ->take(8)
                ->values()
                ->all(),
        ];
    }

    private function programBreakdown(Collection $students, Collection $teachers): array
    {
        $coverageByProgram = $teachers
            ->pluck('groups')
            ->flatten(1)
            ->groupBy('program_id')
            ->map(function (Collection $groups) {
                $expected = $groups->sum('expected_evaluations');
                $done = $groups->sum('completed_evaluations');

                return $expected > 0 ? round(($done / $expected) * 100, 1) : null;
            });

        return $students
            ->groupBy('program_id')
            ->map(function (Collection $rows, $programId) use ($coverageByProgram) {
                $averages = $rows->pluck('average')->filter(fn ($value) => $value !== null);
                $attendance = $rows->pluck('attendance_rate')->filter(fn ($value) => $value !== null);
                $first = $rows->first();

                return [
                    'program_id' => (int) $programId,
                    'program_name' => $first['program_name'],
                    'program_color' => $first['program_color'],
                    'students' => $rows->pluck('student_id')->unique()->count(),
                    'activities' => $first['total_activities'],
                    'progress' => round($rows->avg('progress'), 1),
                    'average' => $averages->isNotEmpty() ? round($averages->avg(), 1) : null,
                    'attendance_rate' => $attendance->isNotEmpty() ? round($attendance->avg(), 1) : null,
                    'evaluation_coverage' => $coverageByProgram[$programId] ?? null,
                    'at_risk' => $averages->filter(fn ($value) => $value < self::AT_RISK_THRESHOLD)->count(),
                ];
            })
            ->sortByDesc('students')
            ->values()
            ->all();
    }

    private function gradeDistribution(Collection $withGrades): array
    {
        $buckets = [
            ['label' => '0 - 59', 'min' => 0.0, 'max' => 59.999],
            ['label' => '60 - 69', 'min' => 60.0, 'max' => 69.999],
            ['label' => '70 - 79', 'min' => 70.0, 'max' => 79.999],
            ['label' => '80 - 89', 'min' => 80.0, 'max' => 89.999],
            ['label' => '90 - 100', 'min' => 90.0, 'max' => 100.0],
        ];

        return collect($buckets)->map(fn ($bucket) => [
            'range' => $bucket['label'],
            'students' => $withGrades
                ->filter(fn ($row) => $row['average'] >= $bucket['min'] && $row['average'] <= $bucket['max'])
                ->count(),
        ])->all();
    }

    /**
     * Evaluaciones registradas por mes en los últimos 6 meses.
     */
    private function evaluationTrend(?int $programId): array
    {
        $since = Carbon::now()->startOfMonth()->subMonths(5);

        $rows = DB::table('activity_evaluations as ae')
            ->join('activities as a', 'ae.activity_id', '=', 'a.id')
            ->join('study_plans as sp', 'a.study_plan_id', '=', 'sp.id')
            ->where('ae.evaluation_date', '>=', $since->toDateString())
            ->when($programId, fn ($q) => $q->where('sp.program_id', $programId))
            ->get(['ae.evaluation_date', 'ae.student_id', 'ae.activity_id'])
            ->groupBy(fn ($row) => Carbon::parse($row->evaluation_date)->format('Y-m'));

        return collect(range(0, 5))
            ->map(function ($offset) use ($since, $rows) {
                $month = $since->copy()->addMonths($offset);
                $monthRows = $rows->get($month->format('Y-m'), collect());

                return [
                    'month' => ucfirst($month->locale('es')->isoFormat('MMM YYYY')),
                    'evaluations' => $monthRows
                        ->unique(fn ($row) => $row->student_id.'-'.$row->activity_id)
                        ->count(),
                ];
            })
            ->all();
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    /**
     * Porcentaje de una actividad. Devuelve null si la actividad no tiene
     * criterios configurados, para no ensuciar los promedios con ceros falsos.
     */
    private function activityPercentage(float $earned, float $maxPoints): ?float
    {
        if ($maxPoints <= 0) {
            return null;
        }

        return round(min(($earned / $maxPoints) * 100, 100), 1);
    }

    private function applyRiskFilter(Collection $rows, ?string $risk): Collection
    {
        return match ($risk) {
            'at_risk' => $rows->filter(
                fn ($row) => $row['average'] !== null && $row['average'] < self::AT_RISK_THRESHOLD
            ),
            'no_grades' => $rows->filter(fn ($row) => $row['average'] === null),
            'on_track' => $rows->filter(
                fn ($row) => $row['average'] !== null && $row['average'] >= self::AT_RISK_THRESHOLD
            ),
            default => $rows,
        };
    }
}

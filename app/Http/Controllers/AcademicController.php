<?php

namespace App\Http\Controllers;

use App\Models\AcademicProgram;
use App\Models\User;
use App\Services\AcademicAnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Panel Académico: visión general de la academia, avance de cada estudiante
 * y cobertura de calificación de los profesores.
 */
class AcademicController extends Controller
{
    /** Etiquetas en español para el estado de la matrícula en el CSV. */
    private const ENROLLMENT_LABELS = [
        'active' => 'Activa',
        'waiting' => 'En espera',
        'suspended' => 'Suspendida',
        'withdrawn' => 'Retirada',
    ];

    public function __construct(private readonly AcademicAnalyticsService $analytics) {}

    /**
     * Visión general de la parte académica.
     */
    public function overview(Request $request): Response
    {
        $filters = $this->resolveFilters($request, ['program_id']);

        return Inertia::render('Academic/Overview', [
            'overview' => $this->analytics->overview($filters),
            'programs' => $this->programOptions(),
            'filters' => $filters,
        ]);
    }

    /**
     * Progreso de cada estudiante, con filtros por programa, estado y riesgo.
     */
    public function students(Request $request): Response
    {
        $filters = $this->resolveFilters($request, ['program_id', 'status', 'search', 'risk']);
        $students = $this->analytics->studentMetrics($filters);

        return Inertia::render('Academic/Students', [
            'students' => $students->all(),
            'summary' => $this->studentsSummary($students),
            'programs' => $this->programOptions(),
            'filters' => $filters,
        ]);
    }

    /**
     * Detalle académico de un estudiante: módulos, actividades y notas por criterio.
     */
    public function studentDetail(Request $request, User $student): Response
    {
        $programId = $request->integer('program_id') ?: null;
        $detail = $this->analytics->studentDetail($student, $programId);

        return Inertia::render('Academic/StudentDetail', [
            'student' => [
                'id' => $student->id,
                'name' => trim($student->name.' '.($student->last_name ?? '')),
                'email' => $student->email,
                'avatar' => $student->avatar ?? null,
            ],
            'detail' => $detail,
        ]);
    }

    /**
     * Avance de calificación de los profesores, por profesor y por grupo.
     */
    public function teachers(Request $request): Response
    {
        $filters = $this->resolveFilters($request, ['program_id', 'search']);
        $teachers = $this->analytics->teacherMetrics($filters);

        $expected = $teachers->sum('expected_evaluations');
        $completed = $teachers->sum('completed_evaluations');

        return Inertia::render('Academic/Teachers', [
            'teachers' => $teachers->all(),
            'summary' => [
                'teachers' => $teachers->filter(fn ($row) => $row['teacher_id'] !== null)->count(),
                'groups' => $teachers->sum('groups_count'),
                'students' => $teachers->sum('students'),
                'expected_evaluations' => $expected,
                'completed_evaluations' => $completed,
                'pending_evaluations' => max($expected - $completed, 0),
                'coverage' => $expected > 0 ? round(($completed / $expected) * 100, 1) : null,
                'unassigned_groups' => $teachers
                    ->filter(fn ($row) => $row['teacher_id'] === null)
                    ->sum('groups_count'),
            ],
            'programs' => $this->programOptions(),
            'filters' => $filters,
        ]);
    }

    /**
     * Exporta el progreso de los estudiantes en CSV con los filtros aplicados.
     */
    public function exportStudents(Request $request): StreamedResponse
    {
        $filters = $this->resolveFilters($request, ['program_id', 'status', 'search', 'risk']);
        $students = $this->analytics->studentMetrics($filters);

        $filename = 'progreso-academico-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($students) {
            $handle = fopen('php://output', 'w');

            // BOM para que Excel respete los acentos.
            fwrite($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, [
                'Estudiante',
                'Correo',
                'Programa',
                'Estado',
                'Actividades evaluadas',
                'Actividades totales',
                'Avance (%)',
                'Promedio',
                'Asistencia (%)',
                'Última evaluación',
            ]);

            foreach ($students as $student) {
                fputcsv($handle, [
                    $student['student_name'],
                    $student['student_email'],
                    $student['program_name'],
                    self::ENROLLMENT_LABELS[$student['enrollment_status']] ?? $student['enrollment_status'],
                    $student['evaluated_activities'],
                    $student['total_activities'],
                    $student['progress'],
                    $student['average'] ?? 'Sin calificar',
                    $student['attendance_rate'] ?? 'Sin registros',
                    $student['last_evaluation'] ?? '',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    /**
     * Programas disponibles para los selectores de filtro.
     */
    private function programOptions(): array
    {
        return AcademicProgram::query()
            ->orderBy('name')
            ->get(['id', 'name', 'color', 'status'])
            ->map(fn (AcademicProgram $program) => [
                'id' => $program->id,
                'name' => $program->name,
                'color' => $program->color ?? '#7a9b3c',
                'status' => $program->status,
            ])
            ->all();
    }

    /**
     * Normaliza los filtros de la request a los valores esperados por el servicio.
     */
    private function resolveFilters(Request $request, array $allowed): array
    {
        $filters = [];

        if (in_array('program_id', $allowed, true)) {
            $filters['program_id'] = $request->integer('program_id') ?: null;
        }

        if (in_array('status', $allowed, true)) {
            $status = $request->string('status')->toString();
            $filters['status'] = in_array($status, ['active', 'waiting', 'suspended', 'withdrawn'], true)
                ? $status
                : null;
        }

        if (in_array('search', $allowed, true)) {
            $filters['search'] = $request->string('search')->trim()->toString() ?: null;
        }

        if (in_array('risk', $allowed, true)) {
            $risk = $request->string('risk')->toString();
            $filters['risk'] = in_array($risk, ['at_risk', 'no_grades', 'on_track'], true) ? $risk : null;
        }

        return $filters;
    }

    /**
     * Totales de la tabla de estudiantes, calculados sobre el conjunto ya filtrado.
     */
    private function studentsSummary(\Illuminate\Support\Collection $students): array
    {
        $withGrades = $students->filter(fn ($row) => $row['average'] !== null);
        $averages = $withGrades->pluck('average');
        $attendance = $students->pluck('attendance_rate')->filter(fn ($value) => $value !== null);

        return [
            'total' => $students->count(),
            'students' => $students->pluck('student_id')->unique()->count(),
            'average_progress' => $students->isNotEmpty() ? round($students->avg('progress'), 1) : 0.0,
            'average_grade' => $averages->isNotEmpty() ? round($averages->avg(), 1) : null,
            'attendance_rate' => $attendance->isNotEmpty() ? round($attendance->avg(), 1) : null,
            'at_risk' => $withGrades
                ->filter(fn ($row) => $row['average'] < AcademicAnalyticsService::AT_RISK_THRESHOLD)
                ->count(),
            'without_grades' => $students->count() - $withGrades->count(),
        ];
    }
}

import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Award,
    BarChart3,
    CalendarCheck,
    ClipboardCheck,
    GraduationCap,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';

import AcademicNav from './shared/AcademicNav';
import ProgramFilter from './shared/ProgramFilter';
import type {
    AcademicFilters,
    OverviewData,
    ProgramOption,
} from './shared/types';
import {
    GradeValue,
    ProgramDot,
    ProgressBar,
    formatDateOrPending,
    formatPercent,
    gradeTone,
} from './shared/ui';

interface Props {
    overview: OverviewData;
    programs: ProgramOption[];
    filters: AcademicFilters;
}

const BUCKET_COLORS = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

function EmptyState({ text }: { text: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <BarChart3 className="mb-3 h-10 w-10 opacity-40" />
            <p className="text-sm">{text}</p>
        </div>
    );
}

function ChartTooltip({
    active,
    payload,
    label,
    suffix,
}: {
    active?: boolean;
    payload?: { value: number | string; name?: string }[];
    label?: string;
    suffix: string;
}) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground">
                {payload[0].value} {suffix}
            </p>
        </div>
    );
}

export default function AcademicOverview({
    overview,
    programs,
    filters,
}: Props) {
    const {
        summary,
        by_program,
        grade_distribution,
        evaluation_trend,
        at_risk,
        top_students,
        teachers_pending,
    } = overview;

    const applyProgram = (programId: number | null) => {
        router.get('/academico', programId ? { program_id: programId } : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasGrades = grade_distribution.some((bucket) => bucket.students > 0);
    const hasTrend = evaluation_trend.some((point) => point.evaluations > 0);

    return (
        <AppLayout>
            <Head title="Panel Académico" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Panel Académico
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Estado general de la academia: avance de los
                            estudiantes y cobertura de calificación.
                        </p>
                    </div>
                    <ProgramFilter
                        programs={programs}
                        value={filters.program_id ?? null}
                        onChange={applyProgram}
                    />
                </div>

                <AcademicNav active="overview" />

                {/* Indicadores principales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Estudiantes activos
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {summary.active_students}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.enrollments} matrículas en{' '}
                                        {summary.programs} programas
                                    </p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Promedio general
                                    </p>
                                    <p
                                        className={`text-2xl font-bold ${gradeTone(summary.average_grade)}`}
                                    >
                                        {summary.average_grade !== null
                                            ? summary.average_grade.toFixed(1)
                                            : 'Sin datos'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.students_without_grades} sin
                                        calificaciones
                                    </p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                                    <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Cobertura de calificación
                                    </p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {formatPercent(
                                            summary.evaluation_coverage,
                                        )}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.pending_evaluations}{' '}
                                        evaluaciones pendientes
                                    </p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                                    <ClipboardCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Estudiantes en riesgo
                                    </p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {summary.at_risk_students}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Promedio por debajo de 60
                                    </p>
                                </div>
                                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Indicadores secundarios */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <TrendingUp className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Avance promedio del plan
                                </p>
                                <p className="text-lg font-semibold">
                                    {summary.average_progress.toFixed(1)}%
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Asistencia promedio
                                </p>
                                <p className="text-lg font-semibold">
                                    {formatPercent(summary.attendance_rate)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <GraduationCap className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Profesores con grupo activo
                                </p>
                                <p className="text-lg font-semibold">
                                    {summary.teachers}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Gráficas */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Distribución de promedios
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!hasGrades ? (
                                <EmptyState text="Todavía no hay calificaciones registradas" />
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={grade_distribution}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            className="stroke-border"
                                        />
                                        <XAxis
                                            dataKey="range"
                                            tick={{ fontSize: 12 }}
                                            className="fill-muted-foreground"
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 12 }}
                                            className="fill-muted-foreground"
                                        />
                                        <Tooltip
                                            content={
                                                <ChartTooltip suffix="estudiantes" />
                                            }
                                        />
                                        <Bar
                                            dataKey="students"
                                            radius={[4, 4, 0, 0]}
                                        >
                                            {grade_distribution.map(
                                                (_, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={
                                                            BUCKET_COLORS[
                                                                index
                                                            ] ?? '#64748b'
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Evaluaciones registradas por mes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!hasTrend ? (
                                <EmptyState text="Sin evaluaciones en los últimos seis meses" />
                            ) : (
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={evaluation_trend}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            className="stroke-border"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                            className="fill-muted-foreground"
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 12 }}
                                            className="fill-muted-foreground"
                                        />
                                        <Tooltip
                                            content={
                                                <ChartTooltip suffix="evaluaciones" />
                                            }
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="evaluations"
                                            stroke="#7a9b3c"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Resumen por programa */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Resumen por programa
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {by_program.length === 0 ? (
                            <EmptyState text="No hay matrículas activas para mostrar" />
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Programa</TableHead>
                                            <TableHead className="text-right">
                                                Estudiantes
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Actividades
                                            </TableHead>
                                            <TableHead className="w-48">
                                                Avance
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Promedio
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Cobertura
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Asistencia
                                            </TableHead>
                                            <TableHead className="text-right">
                                                En riesgo
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {by_program.map((program) => (
                                            <TableRow key={program.program_id}>
                                                <TableCell className="font-medium">
                                                    <ProgramDot
                                                        color={
                                                            program.program_color
                                                        }
                                                        name={
                                                            program.program_name
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {program.students}
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums">
                                                    {program.activities}
                                                </TableCell>
                                                <TableCell>
                                                    <ProgressBar
                                                        value={program.progress}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <GradeValue
                                                        value={program.average}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground tabular-nums">
                                                    {formatPercent(
                                                        program.evaluation_coverage,
                                                        '—',
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground tabular-nums">
                                                    {formatPercent(
                                                        program.attendance_rate,
                                                        '—',
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {program.at_risk > 0 ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                        >
                                                            {program.at_risk}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            0
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Listas de atención */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                Estudiantes que necesitan atención
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {at_risk.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    Ningún estudiante está por debajo del
                                    umbral.
                                </p>
                            ) : (
                                at_risk.map((student) => (
                                    <Link
                                        key={student.enrollment_id}
                                        href={`/academico/estudiantes/${student.student_id}?program_id=${student.program_id}`}
                                        className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {student.student_name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {student.program_name}
                                            </p>
                                        </div>
                                        <div className="ml-3 shrink-0 text-right">
                                            <GradeValue
                                                value={student.average}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {student.evaluated_activities}{' '}
                                                de {student.total_activities}{' '}
                                                actividades
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ClipboardCheck className="h-4 w-4 text-purple-500" />
                                Profesores con calificaciones pendientes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {teachers_pending.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    Todos los grupos están al día.
                                </p>
                            ) : (
                                teachers_pending.map((teacher) => (
                                    <div
                                        key={
                                            teacher.teacher_id ?? 'sin-asignar'
                                        }
                                        className="flex items-center justify-between rounded-lg border border-border p-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {teacher.teacher_name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {teacher.groups_count} grupos ·
                                                última evaluación{' '}
                                                {formatDateOrPending(
                                                    teacher.last_evaluation,
                                                )}
                                            </p>
                                        </div>
                                        <div className="ml-3 shrink-0 text-right">
                                            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                                {teacher.pending_evaluations}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                pendientes
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Mejores promedios */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Award className="h-4 w-4 text-green-500" />
                            Mejores promedios
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {top_students.length === 0 ? (
                            <EmptyState text="Todavía no hay calificaciones registradas" />
                        ) : (
                            <div className="grid gap-2 md:grid-cols-2">
                                {top_students.map((student, index) => (
                                    <Link
                                        key={student.enrollment_id}
                                        href={`/academico/estudiantes/${student.student_id}?program_id=${student.program_id}`}
                                        className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                                            {index + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {student.student_name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {student.program_name}
                                            </p>
                                        </div>
                                        <GradeValue value={student.average} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

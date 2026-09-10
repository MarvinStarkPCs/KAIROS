import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CalendarCheck,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Circle,
    Mail,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

import type { ModuleDetail, StudentDetailData } from './shared/types';
import {
    GradeValue,
    ProgressBar,
    formatDateOrPending,
    formatPercent,
    gradeTone,
} from './shared/ui';

interface Props {
    student: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
    };
    detail: StudentDetailData;
}

function ModuleCard({ module }: { module: ModuleDetail }) {
    const [open, setOpen] = useState(module.progress.evaluated > 0);

    return (
        <Card>
            <CardHeader
                className="cursor-pointer"
                onClick={() => setOpen((prev) => !prev)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="flex items-center gap-2 text-base">
                            {open ? (
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                            ) : (
                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className="truncate">{module.name}</span>
                            <Badge variant="outline" className="shrink-0">
                                Nivel {module.level}
                            </Badge>
                        </CardTitle>
                        {module.description && (
                            <p className="mt-1 pl-6 text-sm text-muted-foreground">
                                {module.description}
                            </p>
                        )}
                    </div>
                    <div className="shrink-0 text-right">
                        <GradeValue value={module.progress.average} />
                        <p className="text-xs text-muted-foreground">
                            {module.progress.evaluated} de{' '}
                            {module.progress.total} actividades
                        </p>
                    </div>
                </div>
                <div className="pt-2 pl-6">
                    <ProgressBar value={module.progress.percentage} />
                </div>
            </CardHeader>

            {open && (
                <CardContent className="space-y-3">
                    {module.activities.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                            Este módulo todavía no tiene actividades activas.
                        </p>
                    ) : (
                        module.activities.map((activity) => (
                            <div
                                key={activity.id}
                                className={cn(
                                    'rounded-lg border p-4',
                                    activity.is_evaluated
                                        ? 'border-border'
                                        : 'border-dashed border-border bg-muted/30',
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <p className="flex items-center gap-2 font-medium">
                                            {activity.is_evaluated ? (
                                                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                                            ) : (
                                                <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            )}
                                            <span className="truncate">
                                                {activity.name}
                                            </span>
                                        </p>
                                        {activity.description && (
                                            <p className="mt-1 pl-6 text-sm text-muted-foreground">
                                                {activity.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="shrink-0 text-right">
                                        {activity.is_evaluated ? (
                                            <>
                                                <p
                                                    className={cn(
                                                        'text-lg font-bold',
                                                        gradeTone(
                                                            activity.percentage,
                                                        ),
                                                    )}
                                                >
                                                    {activity.percentage !==
                                                    null
                                                        ? `${activity.percentage.toFixed(1)}%`
                                                        : 'Sin criterios'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {activity.points_earned ??
                                                        0}{' '}
                                                    de{' '}
                                                    {activity.total_max_points}{' '}
                                                    puntos
                                                </p>
                                            </>
                                        ) : (
                                            <Badge variant="secondary">
                                                Sin calificar
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {activity.criteria.length > 0 && (
                                    <div className="mt-3 space-y-1 pl-6">
                                        {activity.criteria.map(
                                            (criteria, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between text-sm text-muted-foreground"
                                                >
                                                    <span className="truncate">
                                                        {criteria.name}
                                                    </span>
                                                    <span className="ml-3 shrink-0 tabular-nums">
                                                        {criteria.points_earned}{' '}
                                                        / {criteria.max_points}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}

                                {activity.feedback && (
                                    <p className="mt-3 rounded-md bg-muted p-3 pl-3 text-sm text-muted-foreground italic">
                                        “{activity.feedback}”
                                    </p>
                                )}

                                {activity.is_evaluated && (
                                    <p className="mt-2 pl-6 text-xs text-muted-foreground">
                                        Calificada el{' '}
                                        {formatDateOrPending(
                                            activity.evaluation_date,
                                        )}
                                        {activity.teacher_name
                                            ? ` por ${activity.teacher_name}`
                                            : ''}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </CardContent>
            )}
        </Card>
    );
}

export default function AcademicStudentDetail({ student, detail }: Props) {
    const { programs, selected_program_id, modules, summary } = detail;

    const changeProgram = (programId: number) => {
        router.get(
            `/academico/estudiantes/${student.id}`,
            { program_id: programId },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <AppLayout>
            <Head title={`Progreso de ${student.name}`} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/academico/estudiantes">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {student.name}
                            </h1>
                            <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {student.email}
                            </p>
                        </div>
                    </div>
                </div>

                {programs.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            Este estudiante no tiene matrículas registradas.
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Selector de programa */}
                        <div className="flex flex-wrap gap-2">
                            {programs.map((program) => (
                                <button
                                    key={program.id}
                                    type="button"
                                    onClick={() => changeProgram(program.id)}
                                    className={cn(
                                        'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                                        program.id === selected_program_id
                                            ? 'border-primary bg-primary/10 text-foreground'
                                            : 'border-border text-muted-foreground hover:bg-muted',
                                    )}
                                >
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{
                                            backgroundColor: program.color,
                                        }}
                                    />
                                    {program.name}
                                </button>
                            ))}
                        </div>

                        {/* Resumen del programa seleccionado */}
                        {summary && (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-muted-foreground">
                                            Avance del plan
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {summary.progress.toFixed(1)}%
                                        </p>
                                        <div className="mt-2">
                                            <ProgressBar
                                                value={summary.progress}
                                                showLabel={false}
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {summary.evaluated_activities} de{' '}
                                            {summary.total_activities}{' '}
                                            actividades
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-xs text-muted-foreground">
                                            Promedio
                                        </p>
                                        <p
                                            className={cn(
                                                'text-2xl font-bold',
                                                gradeTone(summary.average),
                                            )}
                                        >
                                            {summary.average !== null
                                                ? summary.average.toFixed(1)
                                                : 'Sin calificar'}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {summary.passed_activities}{' '}
                                            actividades aprobadas
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2">
                                            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">
                                                Asistencia
                                            </p>
                                        </div>
                                        <p className="text-2xl font-bold">
                                            {formatPercent(
                                                summary.attendance_rate,
                                            )}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {summary.attendance_records} clases
                                            registradas
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">
                                                Módulos
                                            </p>
                                        </div>
                                        <p className="text-2xl font-bold">
                                            {summary.total_modules}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            en el plan de estudios
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Módulos */}
                        <div className="space-y-4">
                            {modules.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        Este programa todavía no tiene plan de
                                        estudios configurado.
                                    </CardContent>
                                </Card>
                            ) : (
                                modules.map((module) => (
                                    <ModuleCard
                                        key={module.id}
                                        module={module}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

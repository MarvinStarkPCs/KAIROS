import { Head, router } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    GraduationCap,
    Search,
    TriangleAlert,
} from 'lucide-react';
import { Fragment, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    ProgramOption,
    TeacherMetric,
    TeachersSummary,
} from './shared/types';
import {
    ProgramDot,
    ProgressBar,
    formatDateOrPending,
    formatPercent,
} from './shared/ui';

interface Props {
    teachers: TeacherMetric[];
    summary: TeachersSummary;
    programs: ProgramOption[];
    filters: AcademicFilters;
}

export default function AcademicTeachers({
    teachers,
    summary,
    programs,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const applyFilters = (changes: Partial<AcademicFilters>) => {
        const next = {
            program_id: filters.program_id ?? undefined,
            search: filters.search ?? undefined,
            ...changes,
        };

        const query = Object.fromEntries(
            Object.entries(next).filter(
                ([, value]) =>
                    value !== undefined && value !== null && value !== '',
            ),
        );

        router.get('/academico/profesores', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleRow = (key: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    return (
        <AppLayout>
            <Head title="Avance de profesores" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Avance de calificaciones
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Cuánto ha calificado cada profesor frente a lo que le
                        corresponde en sus grupos activos.
                    </p>
                </div>

                <AcademicNav active="teachers" />

                {/* Totales */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Cobertura global
                                    </p>
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {formatPercent(summary.coverage)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.completed_evaluations} de{' '}
                                        {summary.expected_evaluations}{' '}
                                        evaluaciones
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
                                        Pendientes
                                    </p>
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {summary.pending_evaluations}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        calificaciones sin registrar
                                    </p>
                                </div>
                                <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
                                    <TriangleAlert className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Profesores
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {summary.teachers}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.groups} grupos ·{' '}
                                        {summary.students} estudiantes
                                    </p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                    <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-sm font-medium text-muted-foreground">
                                Grupos sin profesor
                            </p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {summary.unassigned_groups}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Nadie puede calificarlos hasta asignar un
                                profesor
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <Card>
                    <CardContent className="flex flex-wrap items-end gap-3 pt-6">
                        <div className="min-w-[220px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Buscar profesor
                            </label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter')
                                            applyFilters({ search });
                                    }}
                                    placeholder="Nombre o correo"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Programa
                            </label>
                            <ProgramFilter
                                programs={programs}
                                value={filters.program_id ?? null}
                                onChange={(programId) =>
                                    applyFilters({
                                        program_id: programId ?? undefined,
                                    })
                                }
                            />
                        </div>

                        <Button onClick={() => applyFilters({ search })}>
                            Aplicar
                        </Button>
                    </CardContent>
                </Card>

                {/* Tabla de profesores */}
                <Card>
                    <CardContent className="pt-6">
                        {teachers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <GraduationCap className="mb-3 h-10 w-10 opacity-40" />
                                <p className="text-sm">
                                    No hay grupos activos que coincidan con los
                                    filtros.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-8" />
                                            <TableHead>Profesor</TableHead>
                                            <TableHead className="text-right">
                                                Grupos
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Estudiantes
                                            </TableHead>
                                            <TableHead className="w-52">
                                                Cobertura
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Pendientes
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Última evaluación
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {teachers.map((teacher) => {
                                            const key = String(
                                                teacher.teacher_id ??
                                                    'sin-asignar',
                                            );
                                            const isOpen = expanded.has(key);

                                            return (
                                                <Fragment key={key}>
                                                    <TableRow
                                                        className="cursor-pointer"
                                                        onClick={() =>
                                                            toggleRow(key)
                                                        }
                                                    >
                                                        <TableCell>
                                                            {isOpen ? (
                                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <p className="font-medium">
                                                                {
                                                                    teacher.teacher_name
                                                                }
                                                            </p>
                                                            {teacher.teacher_email && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {
                                                                        teacher.teacher_email
                                                                    }
                                                                </p>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {
                                                                teacher.groups_count
                                                            }
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {teacher.students}
                                                        </TableCell>
                                                        <TableCell>
                                                            <ProgressBar
                                                                value={
                                                                    teacher.coverage
                                                                }
                                                            />
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {
                                                                    teacher.completed_evaluations
                                                                }{' '}
                                                                de{' '}
                                                                {
                                                                    teacher.expected_evaluations
                                                                }
                                                            </p>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {teacher.pending_evaluations >
                                                            0 ? (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                                >
                                                                    {
                                                                        teacher.pending_evaluations
                                                                    }
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                >
                                                                    Al día
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right text-sm text-muted-foreground">
                                                            {formatDateOrPending(
                                                                teacher.last_evaluation,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>

                                                    {isOpen &&
                                                        teacher.groups.map(
                                                            (group) => (
                                                                <TableRow
                                                                    key={`${key}-${group.schedule_id}`}
                                                                    className="bg-muted/40"
                                                                >
                                                                    <TableCell />
                                                                    <TableCell className="pl-8">
                                                                        <p className="text-sm font-medium">
                                                                            {
                                                                                group.schedule_name
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            <ProgramDot
                                                                                color={
                                                                                    group.program_color
                                                                                }
                                                                                name={
                                                                                    group.program_name
                                                                                }
                                                                            />
                                                                        </p>
                                                                    </TableCell>
                                                                    <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                                                                        {
                                                                            group.activities
                                                                        }{' '}
                                                                        act.
                                                                    </TableCell>
                                                                    <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                                                                        {
                                                                            group.students
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <ProgressBar
                                                                            value={
                                                                                group.coverage
                                                                            }
                                                                        />
                                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                                            {
                                                                                group.completed_evaluations
                                                                            }{' '}
                                                                            de{' '}
                                                                            {
                                                                                group.expected_evaluations
                                                                            }
                                                                        </p>
                                                                    </TableCell>
                                                                    <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                                                                        {
                                                                            group.pending_evaluations
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-right text-sm text-muted-foreground">
                                                                        {formatDateOrPending(
                                                                            group.last_evaluation,
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ),
                                                        )}
                                                </Fragment>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

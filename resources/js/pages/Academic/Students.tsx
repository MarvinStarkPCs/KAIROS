import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, Download, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    StudentMetric,
    StudentsSummary,
} from './shared/types';
import {
    EnrollmentBadge,
    GradeValue,
    ProgramDot,
    ProgressBar,
    formatDateOrPending,
    formatPercent,
} from './shared/ui';

interface Props {
    students: StudentMetric[];
    summary: StudentsSummary;
    programs: ProgramOption[];
    filters: AcademicFilters;
}

type SortKey =
    | 'student_name'
    | 'progress'
    | 'average'
    | 'attendance_rate'
    | 'last_evaluation';

const PAGE_SIZE = 25;

export default function AcademicStudents({
    students,
    summary,
    programs,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [sortKey, setSortKey] = useState<SortKey>('student_name');
    const [sortAsc, setSortAsc] = useState(true);
    const [visible, setVisible] = useState(PAGE_SIZE);

    /** Reenvía los filtros al servidor conservando los que ya estaban puestos. */
    const applyFilters = (changes: Partial<AcademicFilters>) => {
        const next = {
            program_id: filters.program_id ?? undefined,
            status: filters.status ?? undefined,
            search: filters.search ?? undefined,
            risk: filters.risk ?? undefined,
            ...changes,
        };

        const query = Object.fromEntries(
            Object.entries(next).filter(
                ([, value]) =>
                    value !== undefined && value !== null && value !== '',
            ),
        );

        router.get('/academico/estudiantes', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleSort = (key: SortKey) => {
        if (key === sortKey) {
            setSortAsc((prev) => !prev);
            return;
        }
        setSortKey(key);
        setSortAsc(key === 'student_name');
    };

    const sorted = useMemo(() => {
        const rows = [...students];

        rows.sort((a, b) => {
            const left = a[sortKey];
            const right = b[sortKey];

            // Los valores nulos siempre van al final, sin importar la dirección.
            if (left === null && right === null) return 0;
            if (left === null) return 1;
            if (right === null) return -1;

            if (typeof left === 'string' && typeof right === 'string') {
                return sortAsc
                    ? left.localeCompare(right)
                    : right.localeCompare(left);
            }

            return sortAsc
                ? Number(left) - Number(right)
                : Number(right) - Number(left);
        });

        return rows;
    }, [students, sortKey, sortAsc]);

    const rows = sorted.slice(0, visible);

    const exportQuery = new URLSearchParams(
        Object.entries({
            program_id: filters.program_id ?? '',
            status: filters.status ?? '',
            search: filters.search ?? '',
            risk: filters.risk ?? '',
        }).filter(([, value]) => value !== '' && value !== null) as [
            string,
            string,
        ][],
    ).toString();

    const SortableHead = ({
        label,
        sortBy,
        align,
    }: {
        label: string;
        sortBy: SortKey;
        align?: 'right';
    }) => (
        <TableHead className={align === 'right' ? 'text-right' : undefined}>
            <button
                type="button"
                onClick={() => toggleSort(sortBy)}
                className="inline-flex items-center gap-1 hover:text-foreground"
            >
                {label}
                <ArrowUpDown
                    className={`h-3 w-3 ${sortKey === sortBy ? 'text-foreground' : 'opacity-40'}`}
                />
            </button>
        </TableHead>
    );

    return (
        <AppLayout>
            <Head title="Progreso de estudiantes" />

            <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Progreso de estudiantes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Avance del plan de estudios, promedio y asistencia
                            de cada matrícula.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <a
                            href={`/academico/estudiantes/export${exportQuery ? `?${exportQuery}` : ''}`}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Exportar CSV
                        </a>
                    </Button>
                </div>

                <AcademicNav active="students" />

                {/* Totales del conjunto filtrado */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs text-muted-foreground">
                                Matrículas
                            </p>
                            <p className="text-xl font-bold">{summary.total}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs text-muted-foreground">
                                Estudiantes
                            </p>
                            <p className="text-xl font-bold">
                                {summary.students}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs text-muted-foreground">
                                Avance promedio
                            </p>
                            <p className="text-xl font-bold">
                                {summary.average_progress.toFixed(1)}%
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs text-muted-foreground">
                                Promedio general
                            </p>
                            <p className="text-xl font-bold">
                                <GradeValue
                                    value={summary.average_grade}
                                    className="text-xl"
                                />
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-xs text-muted-foreground">
                                En riesgo
                            </p>
                            <p className="text-xl font-bold text-red-600 dark:text-red-400">
                                {summary.at_risk}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtros */}
                <Card>
                    <CardContent className="flex flex-wrap items-end gap-3 pt-6">
                        <div className="min-w-[220px] flex-1">
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Buscar
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
                                    placeholder="Nombre o correo del estudiante"
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

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Estado
                            </label>
                            <Select
                                value={filters.status ?? 'all'}
                                onValueChange={(value) =>
                                    applyFilters({
                                        status:
                                            value === 'all' ? undefined : value,
                                    })
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Activas y en espera" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Activas y en espera
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Activa
                                    </SelectItem>
                                    <SelectItem value="waiting">
                                        En espera
                                    </SelectItem>
                                    <SelectItem value="suspended">
                                        Suspendida
                                    </SelectItem>
                                    <SelectItem value="withdrawn">
                                        Retirada
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                Desempeño
                            </label>
                            <Select
                                value={filters.risk ?? 'all'}
                                onValueChange={(value) =>
                                    applyFilters({
                                        risk:
                                            value === 'all' ? undefined : value,
                                    })
                                }
                            >
                                <SelectTrigger className="w-[190px]">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="at_risk">
                                        En riesgo
                                    </SelectItem>
                                    <SelectItem value="on_track">
                                        Al día
                                    </SelectItem>
                                    <SelectItem value="no_grades">
                                        Sin calificaciones
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={() => applyFilters({ search })}>
                            Aplicar
                        </Button>
                    </CardContent>
                </Card>

                {/* Tabla */}
                <Card>
                    <CardContent className="pt-6">
                        {students.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Users className="mb-3 h-10 w-10 opacity-40" />
                                <p className="text-sm">
                                    Ninguna matrícula coincide con los filtros.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <SortableHead
                                                    label="Estudiante"
                                                    sortBy="student_name"
                                                />
                                                <TableHead>Programa</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead className="w-52">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            toggleSort(
                                                                'progress',
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 hover:text-foreground"
                                                    >
                                                        Avance
                                                        <ArrowUpDown
                                                            className={`h-3 w-3 ${sortKey === 'progress' ? 'text-foreground' : 'opacity-40'}`}
                                                        />
                                                    </button>
                                                </TableHead>
                                                <SortableHead
                                                    label="Promedio"
                                                    sortBy="average"
                                                    align="right"
                                                />
                                                <SortableHead
                                                    label="Asistencia"
                                                    sortBy="attendance_rate"
                                                    align="right"
                                                />
                                                <SortableHead
                                                    label="Última evaluación"
                                                    sortBy="last_evaluation"
                                                    align="right"
                                                />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rows.map((student) => (
                                                <TableRow
                                                    key={student.enrollment_id}
                                                >
                                                    <TableCell>
                                                        <Link
                                                            href={`/academico/estudiantes/${student.student_id}?program_id=${student.program_id}`}
                                                            className="block hover:underline"
                                                        >
                                                            <p className="font-medium">
                                                                {
                                                                    student.student_name
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    student.student_email
                                                                }
                                                            </p>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        <ProgramDot
                                                            color={
                                                                student.program_color
                                                            }
                                                            name={
                                                                student.program_name
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <EnrollmentBadge
                                                            status={
                                                                student.enrollment_status
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <ProgressBar
                                                            value={
                                                                student.progress
                                                            }
                                                        />
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {
                                                                student.evaluated_activities
                                                            }{' '}
                                                            de{' '}
                                                            {
                                                                student.total_activities
                                                            }{' '}
                                                            actividades
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <GradeValue
                                                            value={
                                                                student.average
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                                                        {formatPercent(
                                                            student.attendance_rate,
                                                            '—',
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm text-muted-foreground">
                                                        {formatDateOrPending(
                                                            student.last_evaluation,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {visible < sorted.length && (
                                    <div className="mt-4 flex justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                setVisible(
                                                    (prev) => prev + PAGE_SIZE,
                                                )
                                            }
                                        >
                                            Mostrar más (
                                            {sorted.length - visible} restantes)
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

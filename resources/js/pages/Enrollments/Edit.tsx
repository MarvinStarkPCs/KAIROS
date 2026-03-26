import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Clock, MapPin, User as UserIcon, ShieldCheck, BookOpen } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Schedule {
    id: number;
    name: string;
    days_of_week: string | string[];
    start_time: string;
    end_time: string;
    classroom: string | null;
    professor: { id: number; name: string } | null;
}

interface ScheduleEnrollment {
    id: number;
    schedule_id: number;
    schedule: Schedule;
}

type EnrollmentStatus = 'active' | 'waiting' | 'suspended' | 'withdrawn' | 'cancelled';

interface Enrollment {
    id: number;
    status: EnrollmentStatus;
    student: { id: number; name: string; email: string };
    program: { id: number; name: string };
}

interface ProgramSchedule {
    id: number;
    name: string;
    days_of_week: string | string[];
    start_time: string;
    end_time: string;
    classroom: string | null;
    professor: { id: number; name: string } | null;
}

interface Program {
    id: number;
    name: string;
    schedules: ProgramSchedule[];
}

interface Props {
    enrollment: Enrollment;
    schedules: Schedule[];
    currentScheduleEnrollment: ScheduleEnrollment | null;
    authId: number;
    allPrograms: Program[];
}

const STATUS_OPTIONS: { value: EnrollmentStatus; label: string }[] = [
    { value: 'active',    label: 'Activo' },
    { value: 'waiting',   label: 'En espera' },
    { value: 'suspended', label: 'Suspendido' },
    { value: 'withdrawn', label: 'Retirado' },
    { value: 'cancelled', label: 'Cancelado' },
];

function formatDays(days: string | string[]): string {
    if (Array.isArray(days)) return days.join(', ');
    if (!days) return '';
    // Intenta parsear como JSON, si falla asume CSV
    try {
        const parsed = JSON.parse(days);
        return Array.isArray(parsed) ? parsed.join(', ') : days;
    } catch {
        return days;
    }
}

export default function Edit({ enrollment, schedules, currentScheduleEnrollment, authId, allPrograms }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        schedule_id: currentScheduleEnrollment?.schedule_id?.toString() ?? '',
    });

    const { data: programData, setData: setProgramData, post: postProgram, processing: processingProgram, errors: programErrors } = useForm({
        program_id: '',
        schedule_id: '',
    });

    const selectedProgram = allPrograms.find((p) => p.id.toString() === programData.program_id) ?? null;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/matriculas/${enrollment.id}`);
    };

    const handleStatusChange = (newStatus: string) => {
        router.post(
            `/matriculas/${enrollment.id}/change-status`,
            { status: newStatus },
            { preserveScroll: true },
        );
    };

    const handleProgramChange: FormEventHandler = (e) => {
        e.preventDefault();
        postProgram(`/matriculas/${enrollment.id}/change-program`, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Editar Matrícula" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Editar Matrícula</h1>
                        <p className="text-muted-foreground">
                            Cambiar horario de {enrollment.student.name}
                        </p>
                    </div>
                    <Link href="/matriculas">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>

                {/* Estado — solo visible para usuario ID 1 */}
                {authId === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <ShieldCheck className="h-4 w-4" />
                                Estado de la matrícula
                            </CardTitle>
                            <CardDescription>
                                Solo el administrador principal puede modificar este campo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-56">
                                <Label className="mb-2 block">Estado</Label>
                                <Select value={enrollment.status} onValueChange={handleStatusChange}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Cambio de programa — solo visible para usuario ID 1 */}
                {authId === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BookOpen className="h-4 w-4" />
                                Cambiar programa académico
                            </CardTitle>
                            <CardDescription>
                                Solo el administrador principal puede cambiar el programa de una matrícula.
                                Programa actual: <strong>{enrollment.program.name}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProgramChange} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Selector de programa */}
                                    <div className="space-y-1">
                                        <Label>Nuevo programa <span className="text-destructive">*</span></Label>
                                        <Select
                                            value={programData.program_id}
                                            onValueChange={(v) => {
                                                setProgramData('program_id', v);
                                                setProgramData('schedule_id', '');
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona un programa" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allPrograms
                                                    .filter((p) => p.id !== enrollment.program.id)
                                                    .map((p) => (
                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        {programErrors.program_id && (
                                            <p className="text-sm text-destructive">{programErrors.program_id}</p>
                                        )}
                                    </div>

                                    {/* Selector de horario — aparece cuando hay programa seleccionado */}
                                    {selectedProgram && (
                                        <div className="space-y-1">
                                            <Label>Horario <span className="text-destructive">*</span></Label>
                                            {selectedProgram.schedules.length === 0 ? (
                                                <p className="text-sm text-muted-foreground pt-2">
                                                    Este programa no tiene horarios activos.
                                                </p>
                                            ) : (
                                                <Select
                                                    value={programData.schedule_id}
                                                    onValueChange={(v) => setProgramData('schedule_id', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona un horario" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {selectedProgram.schedules.map((s) => (
                                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                                {s.name} · {formatDays(s.days_of_week)} {s.start_time}–{s.end_time}
                                                                {s.professor ? ` (${s.professor.name})` : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            {programErrors.schedule_id && (
                                                <p className="text-sm text-destructive">{programErrors.schedule_id}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        disabled={processingProgram || !programData.program_id || !programData.schedule_id}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {processingProgram ? 'Guardando...' : 'Cambiar programa'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Horario del Programa</CardTitle>
                            <CardDescription>
                                Selecciona el horario para {enrollment.program.name}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Estudiante (solo lectura) */}
                            <div className="space-y-1">
                                <Label>Estudiante</Label>
                                <div className="rounded-md border border-border bg-muted p-3">
                                    <p className="font-medium">{enrollment.student.name}</p>
                                    <p className="text-sm text-muted-foreground">{enrollment.student.email}</p>
                                </div>
                            </div>

                            {/* Programa (solo lectura) */}
                            <div className="space-y-1">
                                <Label>Programa</Label>
                                <div className="rounded-md border border-border bg-muted p-3">
                                    <p className="font-medium">{enrollment.program.name}</p>
                                </div>
                            </div>

                            {/* Selector de horario */}
                            <div className="space-y-2">
                                <Label>Horario <span className="text-destructive">*</span></Label>

                                {schedules.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No hay horarios activos disponibles para este programa.
                                    </p>
                                ) : (
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {/* Opción sin horario */}
                                        <label
                                            className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors ${
                                                data.schedule_id === ''
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="schedule_id"
                                                value=""
                                                checked={data.schedule_id === ''}
                                                onChange={() => setData('schedule_id', '')}
                                                className="sr-only"
                                            />
                                            <span className="font-medium text-muted-foreground">Sin horario asignado</span>
                                        </label>

                                        {schedules.map((schedule) => (
                                            <label
                                                key={schedule.id}
                                                className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 transition-colors ${
                                                    data.schedule_id === schedule.id.toString()
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="schedule_id"
                                                    value={schedule.id.toString()}
                                                    checked={data.schedule_id === schedule.id.toString()}
                                                    onChange={() => setData('schedule_id', schedule.id.toString())}
                                                    className="sr-only"
                                                />
                                                <span className="font-medium">{schedule.name}</span>
                                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatDays(schedule.days_of_week)} · {schedule.start_time} – {schedule.end_time}
                                                </span>
                                                {schedule.classroom && (
                                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {schedule.classroom}
                                                    </span>
                                                )}
                                                {schedule.professor && (
                                                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <UserIcon className="h-3.5 w-3.5" />
                                                        {schedule.professor.name}
                                                    </span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {errors.schedule_id && (
                                    <p className="text-sm text-destructive">{errors.schedule_id}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Link href="/matriculas">
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}

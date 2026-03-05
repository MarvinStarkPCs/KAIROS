import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Clock, MapPin, User as UserIcon } from 'lucide-react';
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

interface Enrollment {
    id: number;
    student: { id: number; name: string; email: string };
    program: { id: number; name: string };
}

interface Props {
    enrollment: Enrollment;
    schedules: Schedule[];
    currentScheduleEnrollment: ScheduleEnrollment | null;
}

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

export default function Edit({ enrollment, schedules, currentScheduleEnrollment }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        schedule_id: currentScheduleEnrollment?.schedule_id?.toString() ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/matriculas/${enrollment.id}`);
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

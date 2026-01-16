import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Clock, Users, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatTimeRange } from '@/lib/format';

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Program {
    id: number;
    name: string;
    description?: string;
    active_count: number;
    has_capacity: boolean;
    remaining_slots?: number | null;
}

interface Schedule {
    id: number;
    name: string;
    days_of_week: string;
    start_time: string;
    end_time: string;
    classroom: string | null;
    professor: {
        id: number;
        name: string;
    } | null;
    enrolled_count: number;
    max_students: number;
    available_slots: number;
}

interface Props {
    programs: Program[];
    students: Student[];
}

export default function Create({ programs, students }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        program_id: '',
        schedule_id: '',
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active' as 'active' | 'waiting' | 'withdrawn',
    });

    const [availableSchedules, setAvailableSchedules] = useState<Schedule[]>([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/inscripciones');
    };

    const selectedProgram = programs.find((p) => p.id.toString() === data.program_id);

    // Load schedules when program is selected
    useEffect(() => {
        if (data.program_id) {
            setLoadingSchedules(true);
            console.log('Fetching schedules for program:', data.program_id);

            fetch(`/api/programas/${data.program_id}/horarios`)
                .then((res) => {
                    console.log('Response status:', res.status);
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((schedules) => {
                    console.log('Schedules loaded:', schedules);
                    setAvailableSchedules(schedules);
                })
                .catch((error) => {
                    console.error('Error loading schedules:', error);
                    setAvailableSchedules([]);
                })
                .finally(() => {
                    setLoadingSchedules(false);
                });
        } else {
            setAvailableSchedules([]);
            setData('schedule_id', '');
        }
    }, [data.program_id]);

    return (
        <AppLayout>
            <Head title="Nueva Matrícula" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Nueva Matrícula</h1>
                        <p className="text-muted-foreground">
                            Matricular un estudiante en un programa académico
                        </p>
                    </div>
                    <Link href="/inscripciones">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>

                {/* Form */}
                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos de la Matrícula</CardTitle>
                            <CardDescription>
                                Complete los datos del estudiante y el programa al que se matriculará
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Estudiante */}
                            <div className="space-y-2">
                                <Label htmlFor="student_id">
                                    Estudiante <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.student_id}
                                    onValueChange={(value) => setData('student_id', value)}
                                >
                                    <SelectTrigger id="student_id">
                                        <SelectValue placeholder="Seleccione un estudiante" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {students.map((student) => (
                                            <SelectItem key={student.id} value={student.id.toString()}>
                                                <div>
                                                    <div className="font-medium">{student.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {student.email}
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.student_id && (
                                    <p className="text-sm text-destructive">{errors.student_id}</p>
                                )}
                            </div>

                            {/* Programa */}
                            <div className="space-y-2">
                                <Label htmlFor="program_id">
                                    Programa Académico <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.program_id}
                                    onValueChange={(value) => setData('program_id', value)}
                                >
                                    <SelectTrigger id="program_id">
                                        <SelectValue placeholder="Seleccione un programa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map((program) => (
                                            <SelectItem key={program.id} value={program.id.toString()}>
                                                <div>
                                                    <div className="font-medium">{program.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {program.active_count} estudiantes activos
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.program_id && (
                                    <p className="text-sm text-destructive">{errors.program_id}</p>
                                )}

                                {selectedProgram && (
                                    <div className="p-3 bg-muted rounded-md text-sm">
                                        <p className="font-medium">{selectedProgram.name}</p>
                                        {selectedProgram.description && (
                                            <p className="text-muted-foreground mt-1">
                                                {selectedProgram.description}
                                            </p>
                                        )}
                                        <p className="mt-2">
                                            Estudiantes activos: {selectedProgram.active_count}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Fecha de Matrícula */}
                            <div className="space-y-2">
                                <Label htmlFor="enrollment_date">Fecha de Matrícula</Label>
                                <Input
                                    id="enrollment_date"
                                    type="date"
                                    value={data.enrollment_date}
                                    onChange={(e) => setData('enrollment_date', e.target.value)}
                                />
                                {errors.enrollment_date && (
                                    <p className="text-sm text-destructive">{errors.enrollment_date}</p>
                                )}
                            </div>

                            {/* Horario (opcional) */}
                            {data.program_id && (
                                <div className="space-y-2">
                                    <Label htmlFor="schedule_id">
                                        Horario (Opcional)
                                    </Label>
                                    {loadingSchedules ? (
                                        <div className="text-sm text-muted-foreground p-2">
                                            Cargando horarios disponibles...
                                        </div>
                                    ) : availableSchedules.length === 0 ? (
                                        <div className="text-sm text-muted-foreground p-2 border rounded">
                                            No hay horarios disponibles para este programa
                                        </div>
                                    ) : (
                                        <>
                                            <Select
                                                value={data.schedule_id}
                                                onValueChange={(value) => setData('schedule_id', value)}
                                            >
                                                <SelectTrigger id="schedule_id">
                                                    <SelectValue placeholder="Seleccionar horario (opcional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableSchedules.map((schedule) => (
                                                        <SelectItem
                                                            key={schedule.id}
                                                            value={schedule.id.toString()}
                                                            disabled={schedule.available_slots === 0}
                                                        >
                                                            <div className="flex flex-col gap-1">
                                                                <span className="font-medium">{schedule.name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {schedule.days_of_week} • {formatTimeRange(schedule.start_time, schedule.end_time)}
                                                                    {schedule.available_slots === 0 && ' • Sin cupos'}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.schedule_id && (
                                                <p className="text-sm text-destructive">{errors.schedule_id}</p>
                                            )}

                                            {/* Schedule Details */}
                                            {data.schedule_id && availableSchedules.find(s => s.id.toString() === data.schedule_id) && (
                                                <Card className="mt-3">
                                                    <CardContent className="pt-4">
                                                        {(() => {
                                                            const schedule = availableSchedules.find(
                                                                s => s.id.toString() === data.schedule_id
                                                            )!;
                                                            return (
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                                        <span>{schedule.days_of_week}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                                        <span>{formatTimeRange(schedule.start_time, schedule.end_time)}</span>
                                                                    </div>
                                                                    {schedule.classroom && (
                                                                        <div className="flex items-center gap-2">
                                                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                                                            <span>{schedule.classroom}</span>
                                                                        </div>
                                                                    )}
                                                                    {schedule.professor && (
                                                                        <div className="flex items-center gap-2">
                                                                            <Users className="h-4 w-4 text-muted-foreground" />
                                                                            <span>{schedule.professor.name}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-2 pt-2">
                                                                        <Badge
                                                                            variant={schedule.available_slots > 0 ? 'default' : 'destructive'}
                                                                        >
                                                                            {schedule.enrolled_count}/{schedule.max_students} inscritos
                                                                            {schedule.available_slots > 0
                                                                                ? ` • ${schedule.available_slots} cupos disponibles`
                                                                                : ' • Sin cupos'}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Estado */}
                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    Estado <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(value: 'active' | 'waiting' | 'withdrawn') =>
                                        setData('status', value)
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="waiting">En Espera</SelectItem>
                                        <SelectItem value="withdrawn">Retirado</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Link href="/inscripciones">
                                    <Button type="button" variant="outline">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Guardando...' : 'Crear Matrícula'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}

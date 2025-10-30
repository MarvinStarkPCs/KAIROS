import AppLayout from '@/layouts/app/app-sidebar-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useForm, router } from '@inertiajs/react';
import { FormEvent } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import type { PageProps } from '@/types';

interface AcademicProgram {
    id: number;
    name: string;
}

interface Professor {
    id: number;
    name: string;
    email: string;
}

interface Schedule {
    id: number;
    academic_program_id: number;
    academic_program: AcademicProgram;
    professor_id: number | null;
    professor: Professor | null;
    name: string;
    description: string | null;
    days_of_week: string;
    start_time: string;
    end_time: string;
    classroom: string | null;
    semester: string | null;
    max_students: number;
    status: 'active' | 'inactive' | 'completed';
}

interface Props extends PageProps {
    schedule: Schedule;
    programs: AcademicProgram[];
    professors: Professor[];
}

const daysOfWeek = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miércoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sábado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' },
];

export default function ScheduleEdit({ schedule, programs, professors }: Props) {
    // Convertir días de string a array
    const initialDays = schedule.days_of_week
        ? schedule.days_of_week.split(',').map(d => d.trim())
        : [];

    const { data, setData, put, processing, errors } = useForm({
        academic_program_id: schedule.academic_program_id.toString(),
        professor_id: schedule.professor_id?.toString() || '',
        name: schedule.name,
        description: schedule.description || '',
        days_of_week: initialDays,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        classroom: schedule.classroom || '',
        semester: schedule.semester || '',
        max_students: schedule.max_students.toString(),
        status: schedule.status,
    });

    const handleDayToggle = (day: string, checked: boolean) => {
        if (checked) {
            setData('days_of_week', [...data.days_of_week, day]);
        } else {
            setData('days_of_week', data.days_of_week.filter(d => d !== day));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Manually transform and submit
        const submitData = {
            ...data,
            days_of_week: Array.isArray(data.days_of_week)
                ? data.days_of_week.join(',')
                : data.days_of_week,
        };

        // Use the router directly for more control
        router.put(`/horarios/${schedule.id}`, submitData, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Heading
                title="Editar Horario"
                description={`Editando: ${schedule.name}`}
            />

            <div className="mb-6">
                <Link href="/horarios">
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Volver a Horarios
                    </Button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                {/* Programa Académico */}
                <div className="space-y-2">
                    <Label htmlFor="academic_program_id">
                        Programa Académico <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        value={data.academic_program_id}
                        onValueChange={(value) => setData('academic_program_id', value)}
                    >
                        <SelectTrigger id="academic_program_id">
                            <SelectValue placeholder="Selecciona un programa" />
                        </SelectTrigger>
                        <SelectContent>
                            {programs.map((program) => (
                                <SelectItem key={program.id} value={program.id.toString()}>
                                    {program.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.academic_program_id && (
                        <p className="text-sm text-destructive">{errors.academic_program_id}</p>
                    )}
                </div>

                {/* Profesor */}
                <div className="space-y-2">
                    <Label htmlFor="professor_id">Profesor (Opcional)</Label>
                    <Select
                        value={data.professor_id}
                        onValueChange={(value) => setData('professor_id', value)}
                    >
                        <SelectTrigger id="professor_id">
                            <SelectValue placeholder="Selecciona un profesor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Sin asignar</SelectItem>
                            {professors.map((professor) => (
                                <SelectItem key={professor.id} value={professor.id.toString()}>
                                    {professor.name} ({professor.email})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.professor_id && (
                        <p className="text-sm text-destructive">{errors.professor_id}</p>
                    )}
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                    <Label htmlFor="name">
                        Nombre del Horario <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Ej: Matemáticas - Grupo A"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                    <Label htmlFor="description">Descripción (Opcional)</Label>
                    <Textarea
                        id="description"
                        placeholder="Descripción del horario..."
                        rows={3}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    {errors.description && (
                        <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                </div>

                {/* Días de la semana */}
                <div className="space-y-2">
                    <Label>
                        Días de la Semana <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border rounded-lg">
                        {daysOfWeek.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={day.value}
                                    checked={data.days_of_week.includes(day.value)}
                                    onCheckedChange={(checked) =>
                                        handleDayToggle(day.value, checked as boolean)
                                    }
                                />
                                <Label htmlFor={day.value} className="cursor-pointer">
                                    {day.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                    {errors.days_of_week && (
                        <p className="text-sm text-destructive">{errors.days_of_week}</p>
                    )}
                </div>

                {/* Horarios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hora de inicio */}
                    <div className="space-y-2">
                        <Label htmlFor="start_time">
                            Hora de Inicio <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="start_time"
                            type="time"
                            value={data.start_time}
                            onChange={(e) => setData('start_time', e.target.value)}
                        />
                        {errors.start_time && (
                            <p className="text-sm text-destructive">{errors.start_time}</p>
                        )}
                    </div>

                    {/* Hora de fin */}
                    <div className="space-y-2">
                        <Label htmlFor="end_time">
                            Hora de Fin <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="end_time"
                            type="time"
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                        />
                        {errors.end_time && (
                            <p className="text-sm text-destructive">{errors.end_time}</p>
                        )}
                    </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Aula */}
                    <div className="space-y-2">
                        <Label htmlFor="classroom">Aula (Opcional)</Label>
                        <Input
                            id="classroom"
                            type="text"
                            placeholder="Ej: Aula 101"
                            value={data.classroom}
                            onChange={(e) => setData('classroom', e.target.value)}
                        />
                        {errors.classroom && (
                            <p className="text-sm text-destructive">{errors.classroom}</p>
                        )}
                    </div>

                    {/* Semestre */}
                    <div className="space-y-2">
                        <Label htmlFor="semester">Semestre (Opcional)</Label>
                        <Input
                            id="semester"
                            type="text"
                            placeholder="Ej: 2025-1"
                            value={data.semester}
                            onChange={(e) => setData('semester', e.target.value)}
                        />
                        {errors.semester && (
                            <p className="text-sm text-destructive">{errors.semester}</p>
                        )}
                    </div>
                </div>

                {/* Cupo y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cupo máximo */}
                    <div className="space-y-2">
                        <Label htmlFor="max_students">
                            Cupo Máximo de Estudiantes <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="max_students"
                            type="number"
                            min="1"
                            max="200"
                            placeholder="Ej: 30"
                            value={data.max_students}
                            onChange={(e) => setData('max_students', e.target.value)}
                        />
                        {errors.max_students && (
                            <p className="text-sm text-destructive">{errors.max_students}</p>
                        )}
                    </div>

                    {/* Estado */}
                    <div className="space-y-2">
                        <Label htmlFor="status">
                            Estado <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => setData('status', value as 'active' | 'inactive' | 'completed')}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Selecciona un estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Activo</SelectItem>
                                <SelectItem value="inactive">Inactivo</SelectItem>
                                <SelectItem value="completed">Completado</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-sm text-destructive">{errors.status}</p>
                        )}
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={processing} className="flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Link href="/horarios">
                        <Button type="button" variant="outline">
                            Cancelar
                        </Button>
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}

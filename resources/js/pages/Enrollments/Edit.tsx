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
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Program {
    id: number;
    name: string;
}

interface Enrollment {
    id: number;
    student_id: number;
    program_id: number;
    enrollment_date: string;
    status: 'active' | 'waiting' | 'withdrawn';
    student: Student;
    program: Program;
}

interface Props {
    enrollment: Enrollment;
    programs: Program[];
}

export default function Edit({ enrollment, programs }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        program_id: enrollment.program_id.toString(),
        enrollment_date: enrollment.enrollment_date,
        status: enrollment.status,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/inscripciones/${enrollment.id}`);
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
                            Modificar matrícula de {enrollment.student.name}
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
                                Actualice los datos de la matrícula. El estudiante no puede ser modificado.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Estudiante (Read-only) */}
                            <div className="space-y-2">
                                <Label>Estudiante</Label>
                                <div className="p-3 bg-muted rounded-md">
                                    <p className="font-medium">{enrollment.student.name}</p>
                                    <p className="text-sm text-muted-foreground">{enrollment.student.email}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    El estudiante no puede ser modificado en una matrícula existente
                                </p>
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
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map((program) => (
                                            <SelectItem key={program.id} value={program.id.toString()}>
                                                {program.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.program_id && (
                                    <p className="text-sm text-destructive">{errors.program_id}</p>
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
                                <p className="text-xs text-muted-foreground">
                                    {data.status === 'active' && 'La matrícula está activa y el estudiante puede acceder al programa'}
                                    {data.status === 'waiting' && 'El estudiante está en lista de espera'}
                                    {data.status === 'withdrawn' && 'El estudiante se ha retirado del programa'}
                                </p>
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

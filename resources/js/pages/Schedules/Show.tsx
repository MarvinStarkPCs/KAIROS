import AppLayout from '@/layouts/app/app-sidebar-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit, UserPlus, UserMinus, Clock, Users, Calendar, MapPin } from 'lucide-react';
import { useState } from 'react';
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

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Enrollment {
    id: number;
    student_id: number;
    student: Student;
    enrollment_date: string;
    status: string;
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
    enrolled_count: number;
    available_slots: number;
    enrollments: Enrollment[];
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    schedule: Schedule;
    availableStudents: Student[];
}

export default function ScheduleShow({ schedule, availableStudents }: Props) {
    const [openEnrollDialog, setOpenEnrollDialog] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        student_id: '',
    });

    const handleEnrollStudent = () => {
        post(`/horarios/${schedule.id}/enroll`, {
            preserveScroll: true,
            onSuccess: () => {
                setOpenEnrollDialog(false);
                reset();
            },
        });
    };

    const handleUnenrollStudent = (student: Student) => {
        if (confirm(`¿Estás seguro de desinscribir a ${student.name} de este horario?`)) {
            router.delete(`/horarios/${schedule.id}/unenroll/${student.id}`, {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: Schedule['status']) => {
        const styles = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            completed: 'bg-blue-100 text-blue-800',
        };

        const labels = {
            active: 'Activo',
            inactive: 'Inactivo',
            completed: 'Completado',
        };

        return (
            <Badge className={styles[status]}>
                {labels[status]}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Heading
                title="Detalle del Horario"
                description={schedule.name}
            />

            {/* Botones de acción */}
            <div className="mb-6 flex gap-3">
                <Link href="/horarios">
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Volver a Horarios
                    </Button>
                </Link>
                <Link href={`/horarios/${schedule.id}/edit`}>
                    <Button className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Editar Horario
                    </Button>
                </Link>
            </div>

            {/* Información del horario */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* Programa y Profesor */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Información General</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Programa Académico</p>
                            <p className="text-sm font-semibold">{schedule.academic_program.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Profesor</p>
                            <p className="text-sm font-semibold">
                                {schedule.professor ? (
                                    <>
                                        {schedule.professor.name}
                                        <br />
                                        <span className="text-xs text-muted-foreground">
                                            {schedule.professor.email}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-muted-foreground">Sin asignar</span>
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Estado</p>
                            <div className="mt-1">{getStatusBadge(schedule.status)}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Horario */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Horario
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Días</p>
                            <p className="text-sm font-semibold">{schedule.days_of_week}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Hora</p>
                            <p className="text-sm font-semibold">
                                {schedule.start_time} - {schedule.end_time}
                            </p>
                        </div>
                        {schedule.classroom && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Aula
                                </p>
                                <p className="text-sm font-semibold">{schedule.classroom}</p>
                            </div>
                        )}
                        {schedule.semester && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Semestre
                                </p>
                                <p className="text-sm font-semibold">{schedule.semester}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Cupo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Cupo de Estudiantes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Inscritos</p>
                            <p className="text-2xl font-bold">
                                {schedule.enrolled_count} / {schedule.max_students}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Cupos disponibles</p>
                            <p className="text-xl font-bold text-green-600">
                                {schedule.available_slots}
                            </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{
                                    width: `${(schedule.enrolled_count / schedule.max_students) * 100}%`,
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Descripción */}
            {schedule.description && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-base">Descripción</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{schedule.description}</p>
                    </CardContent>
                </Card>
            )}

            {/* Estudiantes Inscritos */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Estudiantes Inscritos</CardTitle>
                            <CardDescription>
                                {schedule.enrolled_count} estudiante(s) inscrito(s)
                            </CardDescription>
                        </div>
                        <Dialog open={openEnrollDialog} onOpenChange={setOpenEnrollDialog}>
                            <DialogTrigger asChild>
                                <Button
                                    className="flex items-center gap-2"
                                    disabled={schedule.available_slots === 0}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Inscribir Estudiante
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Inscribir Estudiante</DialogTitle>
                                    <DialogDescription>
                                        Selecciona un estudiante para inscribir en este horario
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="student">Estudiante</Label>
                                        <Select
                                            value={data.student_id}
                                            onValueChange={(value) => setData('student_id', value)}
                                        >
                                            <SelectTrigger id="student">
                                                <SelectValue placeholder="Selecciona un estudiante" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableStudents.length === 0 ? (
                                                    <div className="p-2 text-sm text-muted-foreground">
                                                        No hay estudiantes disponibles
                                                    </div>
                                                ) : (
                                                    availableStudents.map((student) => (
                                                        <SelectItem
                                                            key={student.id}
                                                            value={student.id.toString()}
                                                        >
                                                            {student.name} ({student.email})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setOpenEnrollDialog(false);
                                            reset();
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleEnrollStudent}
                                        disabled={!data.student_id || processing}
                                    >
                                        {processing ? 'Inscribiendo...' : 'Inscribir'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {schedule.enrollments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay estudiantes inscritos en este horario
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Fecha de Inscripción</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedule.enrollments.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="font-medium">
                                                {enrollment.student.name}
                                            </TableCell>
                                            <TableCell>{enrollment.student.email}</TableCell>
                                            <TableCell>
                                                {new Date(enrollment.enrollment_date).toLocaleDateString('es-ES')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleUnenrollStudent(enrollment.student)}
                                                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                                                >
                                                    <UserMinus className="w-4 h-4" />
                                                    Desinscribir
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}

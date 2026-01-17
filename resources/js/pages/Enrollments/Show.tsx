import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, DollarSign, Calendar, Users } from 'lucide-react';

type EnrollmentStatus = 'active' | 'waiting' | 'withdrawn';

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Professor {
    id: number;
    name: string;
}

interface Schedule {
    id: number;
    name: string;
    days_of_week: string;
    start_time: string;
    end_time: string;
    classroom: string;
    professor: Professor;
}

interface Payment {
    id: number;
    concept: string;
    amount: number;
    due_date: string;
    payment_date: string | null;
    status: string;
    payment_method: string | null;
}

interface Enrollment {
    id: number;
    student_id: number;
    program_id: number;
    enrollment_date: string;
    status: EnrollmentStatus;
    created_at: string;
    student: Student;
    program: {
        id: number;
        name: string;
        description: string;
        duration_months: number;
        schedules: Array<Schedule & { enrollments: any[] }>;
    };
}

interface Props {
    enrollment: Enrollment;
    studentSchedules: Array<{ schedule: Schedule }>;
    payments: Payment[];
}

export default function Show({ enrollment, studentSchedules, payments }: Props) {
    const getStatusBadge = (status: EnrollmentStatus) => {
        const badges = {
            active: <Badge className="bg-green-500">Activo</Badge>,
            waiting: <Badge className="bg-yellow-500">En espera</Badge>,
            withdrawn: <Badge className="bg-gray-500">Retirado</Badge>,
        };
        return badges[status];
    };

    const getPaymentStatusBadge = (status: string) => {
        const badges: Record<string, React.ReactElement> = {
            pending: <Badge variant="outline">Pendiente</Badge>,
            completed: <Badge className="bg-green-500">Pagado</Badge>,
            cancelled: <Badge variant="destructive">Cancelado</Badge>,
            overdue: <Badge variant="destructive">Vencido</Badge>,
        };
        return badges[status] || <Badge>{status}</Badge>;
    };

    return (
        <AppLayout>
            <Head title={`Matrícula #${enrollment.id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Detalle de Matrícula #{enrollment.id}</h1>
                        <p className="text-muted-foreground">
                            {enrollment.student.name} - {enrollment.program.name}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/matriculas/${enrollment.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                        <Link href="/matriculas">
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Información del Estudiante */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Información del Estudiante
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                                <p className="text-lg">{enrollment.student.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Email</p>
                                <p>{enrollment.student.email}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información de la Matrícula */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Información de la Matrícula
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Programa</p>
                                <p className="text-lg">{enrollment.program.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fecha de Matrícula</p>
                                <p>{new Date(enrollment.enrollment_date).toLocaleDateString('es-ES')}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                <div className="mt-1">{getStatusBadge(enrollment.status)}</div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Duración</p>
                                <p>{enrollment.program.duration_months} meses</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Descripción del Programa */}
                {enrollment.program.description && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Descripción del Programa</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{enrollment.program.description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Horarios del Estudiante */}
                <Card>
                    <CardHeader>
                        <CardTitle>Horarios Inscritos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {studentSchedules.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                                El estudiante no está inscrito en ningún horario
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Horario</TableHead>
                                        <TableHead>Días</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Aula</TableHead>
                                        <TableHead>Profesor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentSchedules.map((item) => (
                                        <TableRow key={item.schedule.id}>
                                            <TableCell className="font-medium">{item.schedule.name}</TableCell>
                                            <TableCell>{item.schedule.days_of_week}</TableCell>
                                            <TableCell>
                                                {item.schedule.start_time} - {item.schedule.end_time}
                                            </TableCell>
                                            <TableCell>{item.schedule.classroom || '-'}</TableCell>
                                            <TableCell>{item.schedule.professor?.name || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Pagos */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Pagos Relacionados
                        </CardTitle>
                        <Link href={`/pagos?student_id=${enrollment.student_id}`}>
                            <Button variant="outline" size="sm">
                                Ver todos
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {payments.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                                No hay pagos registrados para esta matrícula
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Concepto</TableHead>
                                        <TableHead>Monto</TableHead>
                                        <TableHead>Vencimiento</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Método</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">{payment.concept}</TableCell>
                                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                {payment.due_date
                                                    ? new Date(payment.due_date).toLocaleDateString('es-ES')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                                            <TableCell>{payment.payment_method || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Horarios Disponibles del Programa */}
                <Card>
                    <CardHeader>
                        <CardTitle>Horarios Disponibles del Programa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {enrollment.program.schedules.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">
                                No hay horarios disponibles para este programa
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Horario</TableHead>
                                        <TableHead>Días</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Aula</TableHead>
                                        <TableHead>Profesor</TableHead>
                                        <TableHead>Inscritos</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enrollment.program.schedules.map((schedule) => (
                                        <TableRow key={schedule.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/horarios/${schedule.id}`}
                                                    className="font-medium hover:underline"
                                                >
                                                    {schedule.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{schedule.days_of_week}</TableCell>
                                            <TableCell>
                                                {schedule.start_time} - {schedule.end_time}
                                            </TableCell>
                                            <TableCell>{schedule.classroom || '-'}</TableCell>
                                            <TableCell>{schedule.professor?.name || '-'}</TableCell>
                                            <TableCell>{schedule.enrollments?.length || 0}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Pen,
    Mail,
    Phone,
    MapPin,
    Calendar,
    FileText,
    GraduationCap,
    DollarSign,
    CheckCircle2,
    XCircle,
    Clock,
} from 'lucide-react';

interface Dependent {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    document_type: string;
    document_number: string;
    birth_date: string;
    age: number;
    address: string | null;
}

interface Enrollment {
    id: number;
    academic_program: {
        id: number;
        name: string;
        description: string | null;
    };
    enrollment_date: string;
    status: string;
}

interface Payment {
    id: number;
    amount: number;
    payment_type: string;
    concept: string;
    status: string;
    due_date: string;
    created_at: string;
}

interface Attendance {
    id: number;
    schedule: {
        id: number;
        name: string;
    };
    date: string;
    status: string;
    notes: string | null;
}

interface Props {
    dependent: Dependent;
    enrollments: Enrollment[];
    payments: Payment[];
    attendances: Attendance[];
}

const statusColors = {
    active: 'bg-green-500',
    waiting: 'bg-yellow-500',
    graduated: 'bg-blue-500',
    cancelled: 'bg-red-500',
    pending: 'bg-yellow-500',
    completed: 'bg-green-500',
    overdue: 'bg-red-500',
    present: 'bg-green-500',
    absent: 'bg-red-500',
    excused: 'bg-yellow-500',
    late: 'bg-orange-500',
};

const statusLabels = {
    active: 'Activo',
    waiting: 'En espera',
    graduated: 'Graduado',
    cancelled: 'Cancelado',
    pending: 'Pendiente',
    completed: 'Completado',
    overdue: 'Vencido',
    present: 'Presente',
    absent: 'Ausente',
    excused: 'Justificado',
    late: 'Tardanza',
};

export default function Show({
    dependent,
    enrollments,
    payments,
    attendances,
}: Props) {
    return (
        <AppLayout variant="sidebar">
            <Head title={dependent.name} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                                router.visit('/dependientes')
                            }
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {dependent.name}
                            </h1>
                            <p className="text-muted-foreground">
                                Información detallada del dependiente
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() =>
                            router.visit(
                                `/dependientes/${dependent.id}/editar`,
                            )
                        }
                    >
                        <Pen className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Documento
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {dependent.document_type}{' '}
                                        {dependent.document_number}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Fecha de Nacimiento
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(
                                            dependent.birth_date,
                                        ).toLocaleDateString('es-CO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}{' '}
                                        ({dependent.age} años)
                                    </p>
                                </div>
                            </div>

                            {dependent.email && (
                                <div className="flex items-start gap-3">
                                    <Mail className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Correo Electrónico
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {dependent.email}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {dependent.phone && (
                                <div className="flex items-start gap-3">
                                    <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Teléfono
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {dependent.phone}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {dependent.address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">
                                            Dirección
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {dependent.address}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="h-8 w-8 text-blue-500" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {enrollments.length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Inscripciones
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-8 w-8 text-yellow-500" />
                                    <div>
                                        <p className="text-2xl font-bold">
                                            {
                                                payments.filter(
                                                    (p) => p.status === 'pending',
                                                ).length
                                            }
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Pagos Pendientes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="enrollments" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="enrollments">
                            Inscripciones
                        </TabsTrigger>
                        <TabsTrigger value="payments">Pagos</TabsTrigger>
                        <TabsTrigger value="attendances">Asistencias</TabsTrigger>
                    </TabsList>

                    <TabsContent value="enrollments">
                        <Card>
                            <CardHeader>
                                <CardTitle>Inscripciones</CardTitle>
                                <CardDescription>
                                    Programas académicos en los que está inscrito
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {enrollments.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        No tiene inscripciones registradas
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Programa</TableHead>
                                                <TableHead>
                                                    Fecha de Inscripción
                                                </TableHead>
                                                <TableHead>Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {enrollments.map((enrollment) => (
                                                <TableRow key={enrollment.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">
                                                                {
                                                                    enrollment
                                                                        .academic_program
                                                                        .name
                                                                }
                                                            </p>
                                                            {enrollment
                                                                .academic_program
                                                                .description && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        enrollment
                                                                            .academic_program
                                                                            .description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(
                                                            enrollment.enrollment_date,
                                                        ).toLocaleDateString(
                                                            'es-CO',
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                statusColors[
                                                                    enrollment
                                                                        .status as keyof typeof statusColors
                                                                ]
                                                            }
                                                        >
                                                            {
                                                                statusLabels[
                                                                    enrollment
                                                                        .status as keyof typeof statusLabels
                                                                ]
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payments">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pagos Recientes</CardTitle>
                                <CardDescription>
                                    Últimos 10 pagos registrados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {payments.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        No tiene pagos registrados
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Concepto</TableHead>
                                                <TableHead>Monto</TableHead>
                                                <TableHead>
                                                    Fecha de Vencimiento
                                                </TableHead>
                                                <TableHead>Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">
                                                                {payment.concept}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    payment.payment_type
                                                                }
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        $
                                                        {payment.amount.toLocaleString(
                                                            'es-CO',
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(
                                                            payment.due_date,
                                                        ).toLocaleDateString(
                                                            'es-CO',
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                statusColors[
                                                                    payment
                                                                        .status as keyof typeof statusColors
                                                                ]
                                                            }
                                                        >
                                                            {
                                                                statusLabels[
                                                                    payment
                                                                        .status as keyof typeof statusLabels
                                                                ]
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="attendances">
                        <Card>
                            <CardHeader>
                                <CardTitle>Asistencias Recientes</CardTitle>
                                <CardDescription>
                                    Últimas 20 asistencias registradas
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {attendances.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground">
                                        No tiene asistencias registradas
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Horario</TableHead>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Notas</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {attendances.map((attendance) => (
                                                <TableRow key={attendance.id}>
                                                    <TableCell className="font-medium">
                                                        {attendance.schedule.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(
                                                            attendance.date,
                                                        ).toLocaleDateString(
                                                            'es-CO',
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                statusColors[
                                                                    attendance
                                                                        .status as keyof typeof statusColors
                                                                ]
                                                            }
                                                        >
                                                            {
                                                                statusLabels[
                                                                    attendance
                                                                        .status as keyof typeof statusLabels
                                                                ]
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {attendance.notes || (
                                                            <span className="text-muted-foreground">
                                                                -
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

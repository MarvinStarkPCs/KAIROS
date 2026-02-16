import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft, Edit2, User, GraduationCap, Music, Phone, MapPin,
    Calendar, FileText, Heart, AlertCircle, BookOpen, CheckCircle,
    XCircle, Clock, DollarSign, Users, CalendarDays, CreditCard, School
} from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
}

interface StudentProfile {
    id: number;
    modality: string | null;
    desired_instrument: string | null;
    plays_instrument: boolean;
    instruments_played: string | null;
    has_music_studies: boolean;
    music_schools: string | null;
    current_level: number | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    medical_conditions: string | null;
    allergies: string | null;
}

interface TeacherProfile {
    id: number;
    instruments_played: string;
    music_schools: string | null;
    experience_years: number | null;
    bio: string | null;
    specialization: string | null;
    hourly_rate: number | null;
    is_active: boolean;
}

interface Parent {
    id: number;
    name: string;
    email: string | null;
}

interface Enrollment {
    id: number;
    program_name: string | null;
    status: string;
    enrollment_date: string | null;
    enrolled_level: number | null;
    payment_commitment_signed: boolean;
    payment_commitment_date: string | null;
    parental_authorization_signed: boolean;
    parental_authorization_date: string | null;
    parent_guardian_name: string | null;
}

interface TeachingSchedule {
    id: number;
    name: string | null;
    program_name: string | null;
    days_of_week: string | null;
    start_time: string | null;
    end_time: string | null;
    classroom: string | null;
    status: string | null;
    students_count: number;
    max_students: number | null;
}

interface EnrolledSchedule {
    id: number;
    schedule_name: string | null;
    program_name: string | null;
    professor_name: string | null;
    days_of_week: string | null;
    start_time: string | null;
    end_time: string | null;
    classroom: string | null;
    status: string | null;
}

interface PaymentSummary {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
}

interface RecentPayment {
    id: number;
    concept: string | null;
    program_name: string | null;
    amount: number;
    paid_amount: number;
    status: string;
    due_date: string | null;
    payment_date: string | null;
    installment_number: number | null;
    total_installments: number | null;
}

interface DependentEnrollment {
    program_name: string | null;
    status: string;
}

interface DependentWithSummary {
    id: number;
    name: string;
    email: string | null;
    enrollments: DependentEnrollment[];
    payments_pending: number;
    payments_pending_amount: number;
}

interface UserData {
    id: number;
    name: string;
    last_name: string | null;
    full_name: string;
    email: string | null;
    avatar: string | null;
    document_type: string | null;
    document_number: string | null;
    birth_date: string | null;
    birth_place: string | null;
    gender: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    neighborhood: string | null;
    city: string | null;
    department: string | null;
    parent_id: number | null;
    parent: Parent | null;
    dependents: Parent[];
    dependents_with_summary: DependentWithSummary[];
    roles: Role[];
    user_type: string;
    student_profile: StudentProfile | null;
    teacher_profile: TeacherProfile | null;
    teaching_schedules: TeachingSchedule[];
    enrolled_schedules: EnrolledSchedule[];
    payment_summary: PaymentSummary;
    recent_payments: RecentPayment[];
    enrollments: Enrollment[];
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    user: UserData;
}

export default function UsersShow({ user }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: route('programas_academicos.index') },
        { title: 'Usuarios', href: route('usuarios.index') },
        { title: user.full_name, href: route('usuarios.show', user.id) },
    ];

    const formatDate = (date: string | null) => {
        if (!date) return 'No especificada';
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined) return '$0';
        return '$' + Number(amount).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const formatTime = (time: string | null) => {
        if (!time) return '';
        return time.substring(0, 5);
    };

    const getGenderLabel = (gender: string | null) => {
        if (!gender) return 'No especificado';
        return gender === 'M' ? 'Masculino' : 'Femenino';
    };

    const getDocumentTypeLabel = (type: string | null) => {
        const types: Record<string, string> = {
            'CC': 'Cedula de Ciudadania',
            'TI': 'Tarjeta de Identidad',
            'CE': 'Cedula de Extranjeria',
            'Pasaporte': 'Pasaporte',
        };
        return type ? types[type] || type : 'No especificado';
    };

    const getUserTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Administrador': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
            'Profesor': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
            'Estudiante': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
            'Responsable': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
        };
        return colors[type] || 'bg-muted text-foreground';
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
            'active': { label: 'Activo', variant: 'default' },
            'enrolled': { label: 'Inscrito', variant: 'default' },
            'waiting': { label: 'En espera', variant: 'secondary' },
            'completed': { label: 'Completado', variant: 'outline' },
            'cancelled': { label: 'Cancelado', variant: 'destructive' },
            'suspended': { label: 'Suspendido', variant: 'destructive' },
        };
        const s = map[status] || { label: status, variant: 'secondary' as const };
        return <Badge variant={s.variant}>{s.label}</Badge>;
    };

    const getPaymentStatusBadge = (status: string) => {
        const map: Record<string, { label: string; className: string }> = {
            'pending': { label: 'Pendiente', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' },
            'completed': { label: 'Pagado', className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' },
            'overdue': { label: 'Vencido', className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' },
            'partial': { label: 'Parcial', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' },
        };
        const s = map[status] || { label: status, className: 'bg-muted text-foreground' };
        return <Badge className={s.className}>{s.label}</Badge>;
    };

    const isTeacher = user.roles.some(r => r.name === 'Profesor');
    const isStudent = user.roles.some(r => r.name === 'Estudiante');
    const isParent = user.roles.some(r => r.name === 'Padre/Madre');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usuario: ${user.full_name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-background">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('usuarios.index')}>
                            <Button variant="ghost" size="sm">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{user.full_name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge className={getUserTypeColor(user.user_type)}>{user.user_type}</Badge>
                                {user.roles.map((role) => (
                                    <Badge key={role.id} variant="outline">{role.name}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Link href={route('usuarios.edit', user.id)}>
                        <Button className="bg-[#7a9b3c] hover:bg-[#6a8a2c]">
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar Usuario
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Datos Personales */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Datos Personales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Nombre Completo</p>
                                    <p className="font-medium">{user.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{user.email || 'No tiene'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Tipo de Documento</p>
                                    <p className="font-medium">{getDocumentTypeLabel(user.document_type)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Numero de Documento</p>
                                    <p className="font-medium">{user.document_number || 'No especificado'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                                    <p className="font-medium">{formatDate(user.birth_date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Genero</p>
                                    <p className="font-medium">{getGenderLabel(user.gender)}</p>
                                </div>
                                {user.birth_place && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">Lugar de Nacimiento</p>
                                        <p className="font-medium">{user.birth_place}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contacto y Ubicacion */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                Contacto y Ubicacion
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Telefono</p>
                                    <p className="font-medium">{user.phone || 'No especificado'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Celular</p>
                                    <p className="font-medium">{user.mobile || 'No especificado'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Direccion</p>
                                <p className="font-medium">{user.address || 'No especificada'}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Barrio</p>
                                    <p className="font-medium">{user.neighborhood || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Ciudad</p>
                                    <p className="font-medium">{user.city || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Departamento</p>
                                    <p className="font-medium">{user.department || '-'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Perfil de Estudiante */}
                    {user.student_profile && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Perfil de Estudiante
                                </CardTitle>
                                <CardDescription>Informacion musical y academica</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Modalidad</p>
                                        <Badge variant="secondary">{user.student_profile.modality || 'No definida'}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Nivel Actual</p>
                                        <p className="font-medium">{user.student_profile.current_level || 1}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Instrumento Deseado</p>
                                        <p className="font-medium">{user.student_profile.desired_instrument || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Toca Instrumento</p>
                                        <Badge variant={user.student_profile.plays_instrument ? 'default' : 'secondary'}>
                                            {user.student_profile.plays_instrument ? 'Si' : 'No'}
                                        </Badge>
                                    </div>
                                </div>
                                {user.student_profile.instruments_played && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Instrumentos que toca</p>
                                        <p className="font-medium">{user.student_profile.instruments_played}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Estudios Musicales</p>
                                        <Badge variant={user.student_profile.has_music_studies ? 'default' : 'secondary'}>
                                            {user.student_profile.has_music_studies ? 'Si' : 'No'}
                                        </Badge>
                                    </div>
                                    {user.student_profile.music_schools && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Escuelas/Academias</p>
                                            <p className="font-medium">{user.student_profile.music_schools}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Contacto de Emergencia */}
                                {(user.student_profile.emergency_contact_name || user.student_profile.emergency_contact_phone) && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Contacto de Emergencia
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Nombre</p>
                                                <p className="font-medium">{user.student_profile.emergency_contact_name || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Telefono</p>
                                                <p className="font-medium">{user.student_profile.emergency_contact_phone || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info Medica */}
                                {(user.student_profile.medical_conditions || user.student_profile.allergies) && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                                            <Heart className="h-4 w-4" />
                                            Informacion Medica
                                        </p>
                                        {user.student_profile.medical_conditions && (
                                            <div className="mb-2">
                                                <p className="text-sm text-muted-foreground">Condiciones Medicas</p>
                                                <p className="font-medium">{user.student_profile.medical_conditions}</p>
                                            </div>
                                        )}
                                        {user.student_profile.allergies && (
                                            <div>
                                                <p className="text-sm text-muted-foreground">Alergias</p>
                                                <p className="font-medium">{user.student_profile.allergies}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Perfil de Profesor */}
                    {user.teacher_profile && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Music className="h-5 w-5" />
                                    Perfil de Profesor
                                </CardTitle>
                                <CardDescription>Informacion profesional</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Estado</p>
                                        <Badge variant={user.teacher_profile.is_active ? 'default' : 'destructive'}>
                                            {user.teacher_profile.is_active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>
                                    {user.teacher_profile.experience_years !== null && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Experiencia</p>
                                            <p className="font-medium">{user.teacher_profile.experience_years} anos</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Instrumentos que domina</p>
                                    <p className="font-medium">{user.teacher_profile.instruments_played}</p>
                                </div>
                                {user.teacher_profile.specialization && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Especializacion</p>
                                        <p className="font-medium">{user.teacher_profile.specialization}</p>
                                    </div>
                                )}
                                {user.teacher_profile.music_schools && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Formacion Musical</p>
                                        <p className="font-medium">{user.teacher_profile.music_schools}</p>
                                    </div>
                                )}
                                {user.teacher_profile.bio && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Biografia</p>
                                        <p className="font-medium text-sm">{user.teacher_profile.bio}</p>
                                    </div>
                                )}
                                {user.teacher_profile.hourly_rate !== null && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tarifa por Hora</p>
                                        <p className="font-medium">{formatCurrency(user.teacher_profile.hourly_rate)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* === HORARIOS DEL PROFESOR === */}
                    {isTeacher && user.teaching_schedules.length > 0 && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5" />
                                    Horarios de Clase Asignados
                                </CardTitle>
                                <CardDescription>
                                    {user.teaching_schedules.length} grupo{user.teaching_schedules.length !== 1 ? 's' : ''} asignado{user.teaching_schedules.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted">
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Grupo</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Programa</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dias</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Horario</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aula</th>
                                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estudiantes</th>
                                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {user.teaching_schedules.map((schedule) => (
                                                <tr key={schedule.id} className="hover:bg-muted transition-colors">
                                                    <td className="px-4 py-3 font-medium">{schedule.name || `Grupo #${schedule.id}`}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{schedule.program_name || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="capitalize text-muted-foreground">{schedule.days_of_week || '-'}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">{schedule.classroom || '-'}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center gap-1 font-medium">
                                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {schedule.students_count}{schedule.max_students ? `/${schedule.max_students}` : ''}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {getStatusBadge(schedule.status || 'active')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* === HORARIOS INSCRITOS DEL ESTUDIANTE === */}
                    {isStudent && user.enrolled_schedules.length > 0 && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarDays className="h-5 w-5" />
                                    Horarios Inscritos
                                </CardTitle>
                                <CardDescription>
                                    Clases en las que esta inscrito el estudiante
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted">
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Grupo</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Programa</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Profesor</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dias</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Horario</th>
                                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aula</th>
                                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {user.enrolled_schedules.map((es) => (
                                                <tr key={es.id} className="hover:bg-muted transition-colors">
                                                    <td className="px-4 py-3 font-medium">{es.schedule_name || '-'}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{es.program_name || '-'}</td>
                                                    <td className="px-4 py-3 text-muted-foreground">{es.professor_name || '-'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="capitalize text-muted-foreground">{es.days_of_week || '-'}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {formatTime(es.start_time)} - {formatTime(es.end_time)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">{es.classroom || '-'}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        {getStatusBadge(es.status || 'enrolled')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* === RESUMEN DE PAGOS (ESTUDIANTE) === */}
                    {isStudent && user.payment_summary.total > 0 && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Resumen de Pagos
                                </CardTitle>
                                <CardDescription>
                                    Estado financiero del estudiante
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Tarjetas de resumen */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-center">
                                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{user.payment_summary.total}</p>
                                        <p className="text-sm text-blue-600">Total Pagos</p>
                                    </div>
                                    <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4 text-center">
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(user.payment_summary.paid_amount)}</p>
                                        <p className="text-sm text-green-600">Pagado</p>
                                    </div>
                                    <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-4 text-center">
                                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{user.payment_summary.pending}</p>
                                        <p className="text-sm text-yellow-600">Pendientes</p>
                                    </div>
                                    {user.payment_summary.overdue > 0 ? (
                                        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 text-center">
                                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{user.payment_summary.overdue}</p>
                                            <p className="text-sm text-red-600">Vencidos</p>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg bg-muted p-4 text-center">
                                            <p className="text-2xl font-bold text-muted-foreground">{formatCurrency(user.payment_summary.pending_amount)}</p>
                                            <p className="text-sm text-muted-foreground">Por Pagar</p>
                                        </div>
                                    )}
                                </div>

                                {/* Ultimos pagos */}
                                {user.recent_payments.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-muted-foreground mb-3">Ultimos Pagos</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="border-b bg-muted">
                                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Concepto</th>
                                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Programa</th>
                                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Monto</th>
                                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Vencimiento</th>
                                                        <th className="px-4 py-2 text-center font-medium text-muted-foreground">Cuota</th>
                                                        <th className="px-4 py-2 text-center font-medium text-muted-foreground">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {user.recent_payments.map((payment) => (
                                                        <tr key={payment.id} className="hover:bg-muted transition-colors">
                                                            <td className="px-4 py-2 font-medium">{payment.concept || '-'}</td>
                                                            <td className="px-4 py-2 text-muted-foreground">{payment.program_name || '-'}</td>
                                                            <td className="px-4 py-2 text-right font-medium">{formatCurrency(payment.amount)}</td>
                                                            <td className="px-4 py-2 text-muted-foreground">{payment.due_date ? new Date(payment.due_date).toLocaleDateString('es-ES') : '-'}</td>
                                                            <td className="px-4 py-2 text-center text-muted-foreground">
                                                                {payment.installment_number && payment.total_installments
                                                                    ? `${payment.installment_number}/${payment.total_installments}`
                                                                    : '-'
                                                                }
                                                            </td>
                                                            <td className="px-4 py-2 text-center">
                                                                {getPaymentStatusBadge(payment.status)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Relaciones Familiares (simple - para no-padres) */}
                    {(user.parent || (user.dependents.length > 0 && !isParent)) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Relaciones Familiares
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {user.parent && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Responsable/Tutor</p>
                                        <Link href={route('usuarios.show', user.parent.id)} className="text-blue-600 hover:underline font-medium">
                                            {user.parent.name}
                                        </Link>
                                        {user.parent.email && (
                                            <p className="text-sm text-muted-foreground">{user.parent.email}</p>
                                        )}
                                    </div>
                                )}
                                {user.dependents.length > 0 && !isParent && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Dependientes ({user.dependents.length})</p>
                                        <div className="space-y-2">
                                            {user.dependents.map((dep) => (
                                                <div key={dep.id} className="flex items-center justify-between p-2 bg-muted rounded">
                                                    <div>
                                                        <Link href={route('usuarios.show', dep.id)} className="text-blue-600 hover:underline font-medium">
                                                            {dep.name}
                                                        </Link>
                                                        {dep.email && (
                                                            <p className="text-sm text-muted-foreground">{dep.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* === PORTAL DE PADRE/RESPONSABLE: Dependientes con resumen === */}
                    {isParent && user.dependents_with_summary && user.dependents_with_summary.length > 0 && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Hijos / Dependientes
                                </CardTitle>
                                <CardDescription>
                                    Resumen de inscripciones y pagos de cada dependiente
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {user.dependents_with_summary.map((dep) => (
                                        <div key={dep.id} className="rounded-lg border bg-card p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <Link href={route('usuarios.show', dep.id)} className="text-lg font-semibold text-blue-700 dark:text-blue-300 hover:underline">
                                                        {dep.name}
                                                    </Link>
                                                    {dep.email && (
                                                        <p className="text-sm text-muted-foreground">{dep.email}</p>
                                                    )}
                                                </div>
                                                {dep.payments_pending > 0 && (
                                                    <div className="text-right">
                                                        <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                                            {dep.payments_pending} pago{dep.payments_pending !== 1 ? 's' : ''} pendiente{dep.payments_pending !== 1 ? 's' : ''}
                                                        </Badge>
                                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 font-medium">
                                                            {formatCurrency(dep.payments_pending_amount)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            {dep.enrollments.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {dep.enrollments.map((enr, idx) => (
                                                        <div key={idx} className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-sm">
                                                            <School className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span className="font-medium text-foreground">{enr.program_name || 'Sin programa'}</span>
                                                            {getStatusBadge(enr.status)}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Sin inscripciones</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Inscripciones y Autorizaciones */}
                    {user.enrollments && user.enrollments.length > 0 && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Inscripciones y Autorizaciones
                                </CardTitle>
                                <CardDescription>
                                    Programas en los que esta inscrito y estado de autorizaciones
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {user.enrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="p-4 border rounded-lg bg-muted">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{enrollment.program_name || 'Programa sin nombre'}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Inscrito el {enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString('es-ES') : 'N/A'}
                                                        {enrollment.enrolled_level && ` - Nivel ${enrollment.enrolled_level}`}
                                                    </p>
                                                </div>
                                                {getStatusBadge(enrollment.status)}
                                            </div>

                                            {/* Autorizaciones */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                                {/* Compromiso de Pago */}
                                                <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
                                                    {enrollment.payment_commitment_signed ? (
                                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">Compromiso de Pago</p>
                                                        {enrollment.payment_commitment_signed ? (
                                                            <p className="text-sm text-green-600">
                                                                Firmado {enrollment.payment_commitment_date && `el ${enrollment.payment_commitment_date}`}
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm text-red-500">No firmado</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Autorizacion Parental */}
                                                <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
                                                    {enrollment.parental_authorization_signed ? (
                                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">Autorizacion Parental</p>
                                                        {enrollment.parental_authorization_signed ? (
                                                            <>
                                                                <p className="text-sm text-green-600">
                                                                    Firmado {enrollment.parental_authorization_date && `el ${enrollment.parental_authorization_date}`}
                                                                </p>
                                                                {enrollment.parent_guardian_name && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Por: {enrollment.parent_guardian_name}
                                                                    </p>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">No aplica (adulto)</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Info del Sistema */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Informacion del Sistema
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                                    <p className="font-medium">{formatDate(user.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Ultima Actualizacion</p>
                                    <p className="font-medium">{formatDate(user.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

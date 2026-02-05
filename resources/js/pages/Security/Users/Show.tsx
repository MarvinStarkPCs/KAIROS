import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Edit2, User, GraduationCap, Music, Phone, MapPin, Calendar, FileText, Heart, AlertCircle, BookOpen, CheckCircle, XCircle } from 'lucide-react';
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
    roles: Role[];
    user_type: string;
    student_profile: StudentProfile | null;
    teacher_profile: TeacherProfile | null;
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
            'Administrador': 'bg-purple-100 text-purple-800',
            'Profesor': 'bg-blue-100 text-blue-800',
            'Estudiante': 'bg-green-100 text-green-800',
            'Responsable': 'bg-orange-100 text-orange-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usuario: ${user.full_name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-[#f9f6f2]">
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
                            <h1 className="text-3xl font-bold tracking-tight text-gray-800">{user.full_name}</h1>
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
                                    <p className="text-sm text-gray-500">Nombre Completo</p>
                                    <p className="font-medium">{user.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{user.email || 'No tiene'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tipo de Documento</p>
                                    <p className="font-medium">{getDocumentTypeLabel(user.document_type)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Numero de Documento</p>
                                    <p className="font-medium">{user.document_number || 'No especificado'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                                    <p className="font-medium">{formatDate(user.birth_date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Genero</p>
                                    <p className="font-medium">{getGenderLabel(user.gender)}</p>
                                </div>
                                {user.birth_place && (
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-500">Lugar de Nacimiento</p>
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
                                    <p className="text-sm text-gray-500">Telefono</p>
                                    <p className="font-medium">{user.phone || 'No especificado'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Celular</p>
                                    <p className="font-medium">{user.mobile || 'No especificado'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Direccion</p>
                                <p className="font-medium">{user.address || 'No especificada'}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Barrio</p>
                                    <p className="font-medium">{user.neighborhood || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ciudad</p>
                                    <p className="font-medium">{user.city || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Departamento</p>
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
                                        <p className="text-sm text-gray-500">Modalidad</p>
                                        <Badge variant="secondary">{user.student_profile.modality || 'No definida'}</Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Nivel Actual</p>
                                        <p className="font-medium">{user.student_profile.current_level || 1}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Instrumento Deseado</p>
                                        <p className="font-medium">{user.student_profile.desired_instrument || 'No especificado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Toca Instrumento</p>
                                        <Badge variant={user.student_profile.plays_instrument ? 'default' : 'secondary'}>
                                            {user.student_profile.plays_instrument ? 'Si' : 'No'}
                                        </Badge>
                                    </div>
                                </div>
                                {user.student_profile.instruments_played && (
                                    <div>
                                        <p className="text-sm text-gray-500">Instrumentos que toca</p>
                                        <p className="font-medium">{user.student_profile.instruments_played}</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Estudios Musicales</p>
                                        <Badge variant={user.student_profile.has_music_studies ? 'default' : 'secondary'}>
                                            {user.student_profile.has_music_studies ? 'Si' : 'No'}
                                        </Badge>
                                    </div>
                                    {user.student_profile.music_schools && (
                                        <div>
                                            <p className="text-sm text-gray-500">Escuelas/Academias</p>
                                            <p className="font-medium">{user.student_profile.music_schools}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Contacto de Emergencia */}
                                {(user.student_profile.emergency_contact_name || user.student_profile.emergency_contact_phone) && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            Contacto de Emergencia
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Nombre</p>
                                                <p className="font-medium">{user.student_profile.emergency_contact_name || '-'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Telefono</p>
                                                <p className="font-medium">{user.student_profile.emergency_contact_phone || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info Medica */}
                                {(user.student_profile.medical_conditions || user.student_profile.allergies) && (
                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Heart className="h-4 w-4" />
                                            Informacion Medica
                                        </p>
                                        {user.student_profile.medical_conditions && (
                                            <div className="mb-2">
                                                <p className="text-sm text-gray-500">Condiciones Medicas</p>
                                                <p className="font-medium">{user.student_profile.medical_conditions}</p>
                                            </div>
                                        )}
                                        {user.student_profile.allergies && (
                                            <div>
                                                <p className="text-sm text-gray-500">Alergias</p>
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
                                        <p className="text-sm text-gray-500">Estado</p>
                                        <Badge variant={user.teacher_profile.is_active ? 'default' : 'destructive'}>
                                            {user.teacher_profile.is_active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>
                                    {user.teacher_profile.experience_years !== null && (
                                        <div>
                                            <p className="text-sm text-gray-500">Experiencia</p>
                                            <p className="font-medium">{user.teacher_profile.experience_years} anos</p>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Instrumentos que domina</p>
                                    <p className="font-medium">{user.teacher_profile.instruments_played}</p>
                                </div>
                                {user.teacher_profile.specialization && (
                                    <div>
                                        <p className="text-sm text-gray-500">Especializacion</p>
                                        <p className="font-medium">{user.teacher_profile.specialization}</p>
                                    </div>
                                )}
                                {user.teacher_profile.music_schools && (
                                    <div>
                                        <p className="text-sm text-gray-500">Formacion Musical</p>
                                        <p className="font-medium">{user.teacher_profile.music_schools}</p>
                                    </div>
                                )}
                                {user.teacher_profile.bio && (
                                    <div>
                                        <p className="text-sm text-gray-500">Biografia</p>
                                        <p className="font-medium text-sm">{user.teacher_profile.bio}</p>
                                    </div>
                                )}
                                {user.teacher_profile.hourly_rate !== null && (
                                    <div>
                                        <p className="text-sm text-gray-500">Tarifa por Hora</p>
                                        <p className="font-medium">${user.teacher_profile.hourly_rate.toLocaleString('es-CO')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Relaciones Familiares */}
                    {(user.parent || user.dependents.length > 0) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Relaciones Familiares
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {user.parent && (
                                    <div>
                                        <p className="text-sm text-gray-500">Responsable/Tutor</p>
                                        <Link href={route('usuarios.show', user.parent.id)} className="text-blue-600 hover:underline font-medium">
                                            {user.parent.name}
                                        </Link>
                                        {user.parent.email && (
                                            <p className="text-sm text-gray-500">{user.parent.email}</p>
                                        )}
                                    </div>
                                )}
                                {user.dependents.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-500 mb-2">Dependientes ({user.dependents.length})</p>
                                        <div className="space-y-2">
                                            {user.dependents.map((dep) => (
                                                <div key={dep.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <div>
                                                        <Link href={route('usuarios.show', dep.id)} className="text-blue-600 hover:underline font-medium">
                                                            {dep.name}
                                                        </Link>
                                                        {dep.email && (
                                                            <p className="text-sm text-gray-500">{dep.email}</p>
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
                                        <div key={enrollment.id} className="p-4 border rounded-lg bg-gray-50">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{enrollment.program_name || 'Programa sin nombre'}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        Inscrito el {enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString('es-ES') : 'N/A'}
                                                        {enrollment.enrolled_level && ` - Nivel ${enrollment.enrolled_level}`}
                                                    </p>
                                                </div>
                                                <Badge variant={
                                                    enrollment.status === 'active' ? 'default' :
                                                    enrollment.status === 'waiting' ? 'secondary' :
                                                    enrollment.status === 'completed' ? 'outline' : 'destructive'
                                                }>
                                                    {enrollment.status === 'active' ? 'Activo' :
                                                     enrollment.status === 'waiting' ? 'En espera' :
                                                     enrollment.status === 'completed' ? 'Completado' :
                                                     enrollment.status === 'cancelled' ? 'Cancelado' :
                                                     enrollment.status === 'suspended' ? 'Suspendido' : enrollment.status}
                                                </Badge>
                                            </div>

                                            {/* Autorizaciones */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                                {/* Compromiso de Pago */}
                                                <div className="flex items-start gap-3 p-3 rounded-lg bg-white">
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
                                                <div className="flex items-start gap-3 p-3 rounded-lg bg-white">
                                                    {enrollment.parental_authorization_signed ? (
                                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">Autorizacion Parental</p>
                                                        {enrollment.parental_authorization_signed ? (
                                                            <>
                                                                <p className="text-sm text-green-600">
                                                                    Firmado {enrollment.parental_authorization_date && `el ${enrollment.parental_authorization_date}`}
                                                                </p>
                                                                {enrollment.parent_guardian_name && (
                                                                    <p className="text-sm text-gray-500">
                                                                        Por: {enrollment.parent_guardian_name}
                                                                    </p>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-gray-400">No aplica (adulto)</p>
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
                                    <p className="text-sm text-gray-500">Fecha de Registro</p>
                                    <p className="font-medium">{formatDate(user.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ultima Actualizacion</p>
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

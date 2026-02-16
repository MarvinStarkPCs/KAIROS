import { useForm, Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, User, GraduationCap, Music, Phone, MapPin, Heart } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';

interface Role {
    id: number;
    name: string;
    assigned: boolean;
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

interface UserData {
    id: number;
    name: string;
    last_name: string | null;
    email: string | null;
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
    student_profile: StudentProfile | null;
    teacher_profile: TeacherProfile | null;
}

interface EditProps {
    user: UserData;
    roles: Role[];
    hasStudentRole: boolean;
    hasTeacherRole: boolean;
}

export default function UsersEdit({ user, roles, hasStudentRole, hasTeacherRole }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        roles: roles.filter(r => r.assigned).map(r => r.id),
        // Datos personales
        document_type: user.document_type || '',
        document_number: user.document_number || '',
        birth_date: user.birth_date || '',
        birth_place: user.birth_place || '',
        gender: user.gender || '',
        // Contacto
        phone: user.phone || '',
        mobile: user.mobile || '',
        address: user.address || '',
        neighborhood: user.neighborhood || '',
        city: user.city || '',
        department: user.department || '',
        // Perfil de estudiante
        student_profile: user.student_profile ? {
            modality: user.student_profile.modality || '',
            desired_instrument: user.student_profile.desired_instrument || '',
            plays_instrument: user.student_profile.plays_instrument || false,
            instruments_played: user.student_profile.instruments_played || '',
            has_music_studies: user.student_profile.has_music_studies || false,
            music_schools: user.student_profile.music_schools || '',
            current_level: user.student_profile.current_level || 1,
            emergency_contact_name: user.student_profile.emergency_contact_name || '',
            emergency_contact_phone: user.student_profile.emergency_contact_phone || '',
            medical_conditions: user.student_profile.medical_conditions || '',
            allergies: user.student_profile.allergies || '',
        } : null,
        // Perfil de profesor
        teacher_profile: user.teacher_profile ? {
            instruments_played: user.teacher_profile.instruments_played || '',
            music_schools: user.teacher_profile.music_schools || '',
            experience_years: user.teacher_profile.experience_years || 0,
            bio: user.teacher_profile.bio || '',
            specialization: user.teacher_profile.specialization || '',
            hourly_rate: user.teacher_profile.hourly_rate || 0,
            is_active: user.teacher_profile.is_active ?? true,
        } : null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('usuarios.update', user.id));
    };

    const toggleRole = (id: number) => {
        setData('roles',
            data.roles.includes(id)
                ? data.roles.filter(r => r !== id)
                : [...data.roles, id]
        );
    };

    type BreadcrumbItem = { title: string; href: string };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: route('programas_academicos.index') },
        { title: 'Usuarios', href: route('usuarios.index') },
        { title: `Editar: ${user.name}`, href: route('usuarios.edit', user.id) },
    ];

    const isStudentRoleSelected = roles.find(r => r.name === 'Estudiante' && data.roles.includes(r.id));
    const isTeacherRoleSelected = roles.find(r => r.name === 'Profesor' && data.roles.includes(r.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Usuario: ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-background">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('usuarios.index')}>
                            <Button variant="ghost" size="sm">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
                            <p className="text-muted-foreground">
                                Actualiza los datos de <strong>{user.name}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Datos Basicos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Datos Basicos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Nombre *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="last_name">Apellido</Label>
                                        <Input
                                            id="last_name"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="document_type">Tipo Doc.</Label>
                                        <Select value={data.document_type} onValueChange={(v) => setData('document_type', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CC">CC</SelectItem>
                                                <SelectItem value="TI">TI</SelectItem>
                                                <SelectItem value="CE">CE</SelectItem>
                                                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="document_number">Numero Doc.</Label>
                                        <Input
                                            id="document_number"
                                            value={data.document_number}
                                            onChange={(e) => setData('document_number', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="birth_date">Fecha Nac.</Label>
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            value={data.birth_date}
                                            onChange={(e) => setData('birth_date', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="gender">Genero</Label>
                                        <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="M">Masculino</SelectItem>
                                                <SelectItem value="F">Femenino</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="password">Nueva Contrasena</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Dejar vacio para mantener"
                                    />
                                </div>

                                {data.password && (
                                    <div>
                                        <Label htmlFor="password_confirmation">Confirmar Contrasena</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contacto */}
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
                                        <Label htmlFor="phone">Telefono</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="mobile">Celular</Label>
                                        <Input
                                            id="mobile"
                                            value={data.mobile}
                                            onChange={(e) => setData('mobile', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="address">Direccion</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="neighborhood">Barrio</Label>
                                    <Input
                                        id="neighborhood"
                                        value={data.neighborhood}
                                        onChange={(e) => setData('neighborhood', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="city">Ciudad</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="department">Departamento</Label>
                                        <Input
                                            id="department"
                                            value={data.department}
                                            onChange={(e) => setData('department', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Roles */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Roles</CardTitle>
                                <CardDescription>Asigna los roles del usuario</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={data.roles.includes(role.id)}
                                            onCheckedChange={() => toggleRole(role.id)}
                                        />
                                        <Label htmlFor={`role-${role.id}`} className="cursor-pointer">
                                            {role.name}
                                        </Label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Perfil de Estudiante */}
                        {(hasStudentRole || isStudentRoleSelected) && data.student_profile && (
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
                                            <Label>Modalidad</Label>
                                            <Select
                                                value={data.student_profile.modality || ''}
                                                onValueChange={(v) => setData('student_profile', { ...data.student_profile!, modality: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Linaje Kids">Linaje Kids</SelectItem>
                                                    <SelectItem value="Linaje Teens">Linaje Teens</SelectItem>
                                                    <SelectItem value="Linaje Big">Linaje Big</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Nivel Actual</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={data.student_profile.current_level || 1}
                                                onChange={(e) => setData('student_profile', { ...data.student_profile!, current_level: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Instrumento Deseado</Label>
                                        <Input
                                            value={data.student_profile.desired_instrument || ''}
                                            onChange={(e) => setData('student_profile', { ...data.student_profile!, desired_instrument: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={data.student_profile.plays_instrument}
                                            onCheckedChange={(v) => setData('student_profile', { ...data.student_profile!, plays_instrument: v })}
                                        />
                                        <Label>Toca algun instrumento</Label>
                                    </div>

                                    {data.student_profile.plays_instrument && (
                                        <div>
                                            <Label>Instrumentos que toca</Label>
                                            <Input
                                                value={data.student_profile.instruments_played || ''}
                                                onChange={(e) => setData('student_profile', { ...data.student_profile!, instruments_played: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={data.student_profile.has_music_studies}
                                            onCheckedChange={(v) => setData('student_profile', { ...data.student_profile!, has_music_studies: v })}
                                        />
                                        <Label>Tiene estudios musicales previos</Label>
                                    </div>

                                    {data.student_profile.has_music_studies && (
                                        <div>
                                            <Label>Escuelas/Academias</Label>
                                            <Input
                                                value={data.student_profile.music_schools || ''}
                                                onChange={(e) => setData('student_profile', { ...data.student_profile!, music_schools: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="pt-4 border-t">
                                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                                            <Heart className="h-4 w-4" />
                                            Contacto de Emergencia
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Nombre</Label>
                                                <Input
                                                    value={data.student_profile.emergency_contact_name || ''}
                                                    onChange={(e) => setData('student_profile', { ...data.student_profile!, emergency_contact_name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label>Telefono</Label>
                                                <Input
                                                    value={data.student_profile.emergency_contact_phone || ''}
                                                    onChange={(e) => setData('student_profile', { ...data.student_profile!, emergency_contact_phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Condiciones Medicas</Label>
                                        <Textarea
                                            value={data.student_profile.medical_conditions || ''}
                                            onChange={(e) => setData('student_profile', { ...data.student_profile!, medical_conditions: e.target.value })}
                                            placeholder="Describir condiciones medicas relevantes..."
                                        />
                                    </div>

                                    <div>
                                        <Label>Alergias</Label>
                                        <Textarea
                                            value={data.student_profile.allergies || ''}
                                            onChange={(e) => setData('student_profile', { ...data.student_profile!, allergies: e.target.value })}
                                            placeholder="Listar alergias conocidas..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Perfil de Profesor */}
                        {(hasTeacherRole || isTeacherRoleSelected) && data.teacher_profile && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Music className="h-5 w-5" />
                                        Perfil de Profesor
                                    </CardTitle>
                                    <CardDescription>Informacion profesional</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={data.teacher_profile.is_active}
                                            onCheckedChange={(v) => setData('teacher_profile', { ...data.teacher_profile!, is_active: v })}
                                        />
                                        <Label>Profesor Activo</Label>
                                    </div>

                                    <div>
                                        <Label>Instrumentos que domina *</Label>
                                        <Input
                                            value={data.teacher_profile.instruments_played}
                                            onChange={(e) => setData('teacher_profile', { ...data.teacher_profile!, instruments_played: e.target.value })}
                                            placeholder="Piano, Guitarra, Violin..."
                                        />
                                    </div>

                                    <div>
                                        <Label>Especializacion</Label>
                                        <Input
                                            value={data.teacher_profile.specialization || ''}
                                            onChange={(e) => setData('teacher_profile', { ...data.teacher_profile!, specialization: e.target.value })}
                                            placeholder="Piano Clasico, Jazz, etc."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Anos de Experiencia</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={50}
                                                value={data.teacher_profile.experience_years || 0}
                                                onChange={(e) => setData('teacher_profile', { ...data.teacher_profile!, experience_years: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Tarifa por Hora ($)</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={data.teacher_profile.hourly_rate || 0}
                                                onChange={(e) => setData('teacher_profile', { ...data.teacher_profile!, hourly_rate: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Formacion Musical</Label>
                                        <Input
                                            value={data.teacher_profile.music_schools || ''}
                                            onChange={(e) => setData('teacher_profile', { ...data.teacher_profile!, music_schools: e.target.value })}
                                            placeholder="Conservatorio, Universidad, etc."
                                        />
                                    </div>

                                    <div>
                                        <Label>Biografia</Label>
                                        <Textarea
                                            value={data.teacher_profile.bio || ''}
                                            onChange={(e) => setData('teacher_profile', { ...data.teacher_profile!, bio: e.target.value })}
                                            placeholder="Breve descripcion profesional..."
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Link href={route('usuarios.index')}>
                            <Button variant="outline">Cancelar</Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[#7a9b3c] hover:bg-[#6a8a2c]"
                        >
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

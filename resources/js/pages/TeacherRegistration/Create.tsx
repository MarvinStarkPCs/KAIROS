import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, ChevronRight, User, MapPin, Music2, Lock, CheckCircle, GraduationCap, Eye, EyeOff } from 'lucide-react';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/toaster';

// Tipos
type DocumentType = 'CC' | 'TI' | 'CE' | 'Pasaporte';
type Gender = 'M' | 'F';

interface TeacherFormData {
    // Datos personales
    name: string;
    last_name: string;
    email: string;
    document_type: DocumentType | '';
    document_number: string;
    birth_date: string;
    gender: Gender | '';
    phone: string;
    mobile: string;
    // Ubicación
    address: string;
    neighborhood: string;
    city: string;
    department: string;
    // Información musical
    instruments_played: string;
    music_schools: string;
    experience_years: string;
    bio: string;
    // Credenciales
    password: string;
    password_confirmation: string;
}

const DOCUMENT_TYPES: Record<DocumentType, string> = {
    'CC': 'Cedula de Ciudadania',
    'TI': 'Tarjeta de Identidad',
    'CE': 'Cedula de Extranjeria',
    'Pasaporte': 'Pasaporte'
};

const GENDERS: Record<Gender, string> = {
    'M': 'Masculino',
    'F': 'Femenino'
};

const COLOMBIAN_DEPARTMENTS = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlantico', 'Bolivar', 'Boyaca',
    'Caldas', 'Caqueta', 'Casanare', 'Cauca', 'Cesar', 'Choco',
    'Cordoba', 'Cundinamarca', 'Guainia', 'Guaviare', 'Huila', 'La Guajira',
    'Magdalena', 'Meta', 'Narino', 'Norte de Santander', 'Putumayo', 'Quindio',
    'Risaralda', 'San Andres y Providencia', 'Santander', 'Sucre', 'Tolima',
    'Valle del Cauca', 'Vaupes', 'Vichada'
];

const TOTAL_STEPS = 4;

export default function Create() {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const { data, setData, post, processing, errors } = useForm<TeacherFormData>({
        name: '',
        last_name: '',
        email: '',
        document_type: '',
        document_number: '',
        birth_date: '',
        gender: '',
        phone: '',
        mobile: '',
        address: '',
        neighborhood: '',
        city: '',
        department: '',
        instruments_played: '',
        music_schools: '',
        experience_years: '',
        bio: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/registro-profesor');
    };

    const nextStep = () => {
        if (step < TOTAL_STEPS) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const isStepValid = (stepNumber: number): boolean => {
        switch (stepNumber) {
            case 1:
                return !!(
                    data.name &&
                    data.last_name &&
                    data.email &&
                    data.document_type &&
                    data.document_number &&
                    data.birth_date &&
                    data.gender &&
                    data.mobile
                );
            case 2:
                return !!(
                    data.address &&
                    data.city &&
                    data.department
                );
            case 3:
                return !!data.instruments_played;
            case 4:
                return !!(
                    data.password &&
                    data.password_confirmation &&
                    data.password === data.password_confirmation &&
                    data.password.length >= 8
                );
            default:
                return false;
        }
    };

    const getStepTitle = (stepNumber: number): string => {
        switch (stepNumber) {
            case 1: return 'Datos Personales';
            case 2: return 'Ubicacion';
            case 3: return 'Informacion Musical';
            case 4: return 'Credenciales';
            default: return '';
        }
    };

    const getStepIcon = (stepNumber: number) => {
        switch (stepNumber) {
            case 1: return <User className="w-5 h-5" />;
            case 2: return <MapPin className="w-5 h-5" />;
            case 3: return <Music2 className="w-5 h-5" />;
            case 4: return <Lock className="w-5 h-5" />;
            default: return null;
        }
    };

    return (
        <>
            <Head title="Registro de Profesor" />
            <Toaster />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-8 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <GraduationCap className="w-10 h-10" />
                            <h1 className="text-3xl font-bold">Registro de Profesor</h1>
                        </div>
                        <p className="text-amber-100 text-lg">
                            Unete a nuestro equipo de profesores y comparte tu pasion por la musica
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-8">
                        {[1, 2, 3, 4].map((stepNumber) => (
                            <div key={stepNumber} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                                            step === stepNumber
                                                ? "bg-amber-600 text-white shadow-lg scale-110"
                                                : step > stepNumber
                                                    ? "bg-green-500 text-white"
                                                    : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {step > stepNumber ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            getStepIcon(stepNumber)
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-xs mt-2 font-medium text-center",
                                        step === stepNumber ? "text-amber-600" : "text-muted-foreground"
                                    )}>
                                        {getStepTitle(stepNumber)}
                                    </span>
                                </div>
                                {stepNumber < TOTAL_STEPS && (
                                    <div className={cn(
                                        "flex-1 h-1 mx-2",
                                        step > stepNumber ? "bg-green-500" : "bg-muted"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <Card className="shadow-xl border-0">
                            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
                                <CardTitle className="flex items-center gap-2">
                                    {getStepIcon(step)}
                                    Paso {step}: {getStepTitle(step)}
                                </CardTitle>
                                <CardDescription className="text-amber-100">
                                    {step === 1 && "Ingresa tu informacion personal basica"}
                                    {step === 2 && "Indica tu ubicacion de residencia"}
                                    {step === 3 && "Cuentanos sobre tu experiencia musical"}
                                    {step === 4 && "Crea tus credenciales de acceso"}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-6">
                                {/* Step 1: Datos Personales */}
                                {step === 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="name">Nombres *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Ej: Juan Carlos"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div>
                                            <Label htmlFor="last_name">Apellidos *</Label>
                                            <Input
                                                id="last_name"
                                                value={data.last_name}
                                                onChange={(e) => setData('last_name', e.target.value)}
                                                placeholder="Ej: Perez Garcia"
                                                className={errors.last_name ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.last_name} />
                                        </div>

                                        <div>
                                            <Label htmlFor="email">Correo Electronico *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="correo@ejemplo.com"
                                                className={errors.email ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div>
                                            <Label>Tipo de Documento *</Label>
                                            <Select
                                                value={data.document_type}
                                                onValueChange={(value) => setData('document_type', value as DocumentType)}
                                            >
                                                <SelectTrigger className={errors.document_type ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Seleccione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.document_type} />
                                        </div>

                                        <div>
                                            <Label htmlFor="document_number">Numero de Documento *</Label>
                                            <Input
                                                id="document_number"
                                                value={data.document_number}
                                                onChange={(e) => setData('document_number', e.target.value)}
                                                placeholder="Ej: 1234567890"
                                                className={errors.document_number ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.document_number} />
                                        </div>

                                        <div>
                                            <Label htmlFor="birth_date">Fecha de Nacimiento *</Label>
                                            <Input
                                                id="birth_date"
                                                type="date"
                                                value={data.birth_date}
                                                onChange={(e) => setData('birth_date', e.target.value)}
                                                className={errors.birth_date ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.birth_date} />
                                        </div>

                                        <div>
                                            <Label>Genero *</Label>
                                            <RadioGroup
                                                value={data.gender}
                                                onValueChange={(value) => setData('gender', value as Gender)}
                                                className="flex gap-4 mt-2"
                                            >
                                                {Object.entries(GENDERS).map(([key, label]) => (
                                                    <div key={key} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={key} id={`gender_${key}`} />
                                                        <Label htmlFor={`gender_${key}`}>{label}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                            <InputError message={errors.gender} />
                                        </div>

                                        <div>
                                            <Label htmlFor="phone">Telefono Fijo</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="Ej: 6012345678"
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.phone} />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label htmlFor="mobile">Celular *</Label>
                                            <Input
                                                id="mobile"
                                                value={data.mobile}
                                                onChange={(e) => setData('mobile', e.target.value)}
                                                placeholder="Ej: 3001234567"
                                                className={errors.mobile ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.mobile} />
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Ubicación */}
                                {step === 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <Label htmlFor="address">Direccion *</Label>
                                            <Input
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                placeholder="Ej: Calle 123 # 45-67"
                                                className={errors.address ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.address} />
                                        </div>

                                        <div>
                                            <Label htmlFor="neighborhood">Barrio</Label>
                                            <Input
                                                id="neighborhood"
                                                value={data.neighborhood}
                                                onChange={(e) => setData('neighborhood', e.target.value)}
                                                placeholder="Ej: Centro"
                                                className={errors.neighborhood ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.neighborhood} />
                                        </div>

                                        <div>
                                            <Label htmlFor="city">Ciudad *</Label>
                                            <Input
                                                id="city"
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                placeholder="Ej: Bogota"
                                                className={errors.city ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.city} />
                                        </div>

                                        <div className="md:col-span-2">
                                            <Label>Departamento *</Label>
                                            <Select
                                                value={data.department}
                                                onValueChange={(value) => setData('department', value)}
                                            >
                                                <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Seleccione un departamento" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {COLOMBIAN_DEPARTMENTS.map((dept) => (
                                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.department} />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Información Musical */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <div>
                                            <Label htmlFor="instruments_played">Instrumentos que dominas *</Label>
                                            <Textarea
                                                id="instruments_played"
                                                value={data.instruments_played}
                                                onChange={(e) => setData('instruments_played', e.target.value)}
                                                placeholder="Ej: Piano (avanzado), Guitarra (intermedio), Violin (basico)"
                                                rows={3}
                                                className={errors.instruments_played ? 'border-red-500' : ''}
                                            />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Indica los instrumentos y tu nivel de dominio en cada uno
                                            </p>
                                            <InputError message={errors.instruments_played} />
                                        </div>

                                        <div>
                                            <Label htmlFor="music_schools">Formacion Musical</Label>
                                            <Textarea
                                                id="music_schools"
                                                value={data.music_schools}
                                                onChange={(e) => setData('music_schools', e.target.value)}
                                                placeholder="Ej: Conservatorio de Musica (2015-2019), Curso de Teoria Musical (2020)"
                                                rows={3}
                                                className={errors.music_schools ? 'border-red-500' : ''}
                                            />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Indica donde has estudiado musica formalmente (opcional)
                                            </p>
                                            <InputError message={errors.music_schools} />
                                        </div>

                                        <div>
                                            <Label htmlFor="experience_years">Anos de Experiencia</Label>
                                            <Input
                                                id="experience_years"
                                                type="number"
                                                min="0"
                                                max="50"
                                                value={data.experience_years}
                                                onChange={(e) => setData('experience_years', e.target.value)}
                                                placeholder="Ej: 5"
                                                className={errors.experience_years ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.experience_years} />
                                        </div>

                                        <div>
                                            <Label htmlFor="bio">Sobre ti</Label>
                                            <Textarea
                                                id="bio"
                                                value={data.bio}
                                                onChange={(e) => setData('bio', e.target.value)}
                                                placeholder="Cuentanos un poco sobre ti, tu experiencia como musico y como profesor..."
                                                rows={4}
                                                className={errors.bio ? 'border-red-500' : ''}
                                            />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Esta informacion puede ser visible para los estudiantes (opcional)
                                            </p>
                                            <InputError message={errors.bio} />
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Credenciales */}
                                {step === 4 && (
                                    <div className="space-y-6">
                                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                                            <h3 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Crea tu contrasena</h3>
                                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                                Tu contrasena debe tener al menos 8 caracteres. Te recomendamos usar una combinacion de letras, numeros y caracteres especiales.
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="password">Contrasena *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="Minimo 8 caracteres"
                                                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <InputError message={errors.password} />
                                        </div>

                                        <div>
                                            <Label htmlFor="password_confirmation">Confirmar Contrasena *</Label>
                                            <div className="relative">
                                                <Input
                                                    id="password_confirmation"
                                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    placeholder="Repite tu contrasena"
                                                    className={errors.password_confirmation ? 'border-red-500 pr-10' : 'pr-10'}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                                                >
                                                    {showPasswordConfirmation ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <InputError message={errors.password_confirmation} />
                                            {data.password && data.password_confirmation && data.password !== data.password_confirmation && (
                                                <p className="text-sm text-red-500 mt-1">Las contrasenas no coinciden</p>
                                            )}
                                        </div>

                                        {/* Resumen de datos */}
                                        <div className="bg-muted rounded-lg p-4 mt-6">
                                            <h3 className="font-medium text-foreground mb-3">Resumen de tu registro</h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="text-muted-foreground">Nombre:</div>
                                                <div className="font-medium">{data.name} {data.last_name}</div>
                                                <div className="text-muted-foreground">Email:</div>
                                                <div className="font-medium">{data.email}</div>
                                                <div className="text-muted-foreground">Documento:</div>
                                                <div className="font-medium">{data.document_type} {data.document_number}</div>
                                                <div className="text-muted-foreground">Ciudad:</div>
                                                <div className="font-medium">{data.city}, {data.department}</div>
                                                <div className="text-muted-foreground">Instrumentos:</div>
                                                <div className="font-medium">{data.instruments_played}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8 pt-6 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={step === 1}
                                        className="flex items-center gap-2"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Anterior
                                    </Button>

                                    {step < TOTAL_STEPS ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!isStepValid(step)}
                                            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700"
                                        >
                                            Siguiente
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={processing || !isStepValid(step)}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                        >
                                            {processing ? (
                                                <>
                                                    <span className="animate-spin">...</span>
                                                    Registrando...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    Completar Registro
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </form>

                    {/* Info adicional */}
                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>
                            Ya tienes una cuenta?{' '}
                            <a href="/login" className="text-amber-600 hover:text-amber-700 dark:hover:text-amber-300 font-medium">
                                Inicia sesion aqui
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

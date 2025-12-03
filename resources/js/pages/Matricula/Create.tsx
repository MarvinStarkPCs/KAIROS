import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, CheckCircle, Plus, Trash2, User, AlertCircle, Check } from 'lucide-react';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

interface Schedule {
    id: number;
    days_of_week: string;
    start_time: string;
    end_time: string;
    professor: {
        id: number;
        name: string;
    };
    enrolled_count: number;
    available_slots: number;
    has_capacity: boolean;
}

interface AcademicProgram {
    id: number;
    name: string;
    description: string;
    schedules: Schedule[];
}

interface Props {
    programs: AcademicProgram[];
}

interface Estudiante {
    name: string;
    last_name: string;
    email: string;
    document_type: 'CC' | 'TI' | 'CE' | 'Pasaporte';
    document_number: string;
    birth_place: string;
    birth_date: string;
    gender: 'M' | 'F';
    datos_musicales: {
        plays_instrument: boolean;
        instruments_played: string;
        has_music_studies: boolean;
        music_schools: string;
        desired_instrument: string;
        modality: '' | 'Linaje Kids' | 'Linaje Teens' | 'Linaje Big';
        current_level: number;
    };
    program_id: string;
    schedule_id: string;
}

export default function Create({ programs }: Props) {
    const [step, setStep] = useState(1);
    const totalSteps = 4; // Reducido de 6 a 4 pasos
    const [currentEstudianteIndex, setCurrentEstudianteIndex] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        // Datos del responsable
        responsable: {
            name: '',
            last_name: '',
            email: '',
            password: '',
            password_confirmation: '',
            document_type: 'CC' as 'CC' | 'TI' | 'CE' | 'Pasaporte',
            document_number: '',
            birth_place: '',
            birth_date: '',
            gender: 'M' as 'M' | 'F',
            address: '',
            neighborhood: '',
            phone: '',
            mobile: '',
            city: '',
            department: '',
            // Datos musicales para adultos
            plays_instrument: false,
            instruments_played: '',
            has_music_studies: false,
            music_schools: '',
            desired_instrument: '',
            modality: '' as '' | 'Linaje Kids' | 'Linaje Teens' | 'Linaje Big',
            current_level: 1,
            program_id: '',
            schedule_id: '',
        },
        // ¿Es menor de edad?
        is_minor: false,
        // Array de estudiantes (para múltiples hijos)
        estudiantes: [] as Estudiante[],
        // Autorizaciones
        parental_authorization: false,
        payment_commitment: false,
    });

    // Funciones para manejar estudiantes
    const crearNuevoEstudiante = (): Estudiante => ({
        name: '',
        last_name: '',
        email: '',
        document_type: 'TI',
        document_number: '',
        birth_place: '',
        birth_date: '',
        gender: 'M',
        datos_musicales: {
            plays_instrument: false,
            instruments_played: '',
            has_music_studies: false,
            music_schools: '',
            desired_instrument: '',
            modality: '',
            current_level: 1,
        },
        program_id: '',
        schedule_id: '',
    });

    const agregarEstudiante = () => {
        setData('estudiantes', [...data.estudiantes, crearNuevoEstudiante()]);
        setCurrentEstudianteIndex(data.estudiantes.length);
    };

    const eliminarEstudiante = (index: number) => {
        const nuevosEstudiantes = data.estudiantes.filter((_, i) => i !== index);
        setData('estudiantes', nuevosEstudiantes);
        if (currentEstudianteIndex >= nuevosEstudiantes.length) {
            setCurrentEstudianteIndex(Math.max(0, nuevosEstudiantes.length - 1));
        }
    };

    const actualizarEstudiante = (index: number, campo: string, valor: any) => {
        const nuevosEstudiantes = [...data.estudiantes];
        const campos = campo.split('.');

        if (campos.length === 2 && campos[0] === 'datos_musicales') {
            nuevosEstudiantes[index] = {
                ...nuevosEstudiantes[index],
                datos_musicales: {
                    ...nuevosEstudiantes[index].datos_musicales,
                    [campos[1]]: valor,
                },
            };
        } else {
            nuevosEstudiantes[index] = {
                ...nuevosEstudiantes[index],
                [campo]: valor,
            };
        }

        setData('estudiantes', nuevosEstudiantes);
    };

    // Validar si un paso está completo
    const isStepValid = (stepNumber: number): boolean => {
        switch (stepNumber) {
            case 1: // Datos del responsable
                return !!(
                    data.responsable.name &&
                    data.responsable.last_name &&
                    data.responsable.email &&
                    data.responsable.password &&
                    data.responsable.password_confirmation &&
                    data.responsable.document_number &&
                    data.responsable.birth_date &&
                    data.responsable.mobile
                );
            case 2: // Datos de localización
                return !!(
                    data.responsable.address &&
                    data.responsable.city &&
                    data.responsable.department
                );
            case 3: // Datos de estudiantes o datos musicales del adulto
                if (!data.is_minor) {
                    // Para adultos, validar datos musicales y programa
                    return !!(
                        data.responsable.desired_instrument &&
                        data.responsable.modality &&
                        data.responsable.program_id
                    );
                }
                // Para menores, validar estudiantes
                if (data.estudiantes.length === 0) return false;
                return data.estudiantes.every(est =>
                    est.name &&
                    est.last_name &&
                    est.document_number &&
                    est.birth_date &&
                    est.datos_musicales.desired_instrument &&
                    est.datos_musicales.modality &&
                    est.program_id
                );
            case 4: // Autorizaciones
                if (data.is_minor) {
                    return data.parental_authorization && data.payment_commitment;
                }
                return data.payment_commitment;
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (step < totalSteps) {
            // Scroll suave al top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            // Scroll suave al top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setStep(step - 1);
        }
    };

    // Ir directamente a un paso específico
    const goToStep = (targetStep: number) => {
        if (targetStep >= 1 && targetStep <= totalSteps) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setStep(targetStep);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Preparar los datos para enviar - solo incluir campos necesarios según el tipo de matrícula
        const submitData: any = {
            responsable: data.responsable,
            is_minor: data.is_minor,
            payment_commitment: data.payment_commitment,
        };

        // Solo incluir estudiantes y autorización parental si es menor de edad
        if (data.is_minor) {
            submitData.estudiantes = data.estudiantes;
            submitData.parental_authorization = data.parental_authorization;
        }

        console.log('Enviando formulario con datos:', submitData);

        // Usar router.post directamente con los datos preparados
        router.post('/matricula', submitData, {
            onError: (errors) => {
                console.log('Errores de validación:', errors);
                // Scroll al top para ver los errores
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onSuccess: () => {
                console.log('Matrícula completada exitosamente');
            },
        });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos del Responsable</CardTitle>
                            <CardDescription>
                                Ingrese los datos de la persona responsable de la matrícula
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="responsable_name">Nombre *</Label>
                                    <Input
                                        id="responsable_name"
                                        value={data.responsable.name}
                                        onChange={(e) => setData('responsable', { ...data.responsable, name: e.target.value })}
                                        placeholder="Nombre"
                                    />
                                    <InputError message={errors['responsable.name']} />
                                </div>
                                <div>
                                    <Label htmlFor="responsable_last_name">Apellidos *</Label>
                                    <Input
                                        id="responsable_last_name"
                                        value={data.responsable.last_name}
                                        onChange={(e) => setData('responsable', { ...data.responsable, last_name: e.target.value })}
                                        placeholder="Apellidos"
                                    />
                                    <InputError message={errors['responsable.last_name']} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="responsable_document_type">Tipo de Documento *</Label>
                                    <Select
                                        value={data.responsable.document_type}
                                        onValueChange={(value: 'CC' | 'TI' | 'CE' | 'Pasaporte') =>
                                            setData('responsable', { ...data.responsable, document_type: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CC">C.C</SelectItem>
                                            <SelectItem value="TI">T.I</SelectItem>
                                            <SelectItem value="CE">C.E</SelectItem>
                                            <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors['responsable.document_type']} />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="responsable_document_number">Número de Documento *</Label>
                                    <Input
                                        id="responsable_document_number"
                                        value={data.responsable.document_number}
                                        onChange={(e) =>
                                            setData('responsable', { ...data.responsable, document_number: e.target.value })
                                        }
                                        placeholder="Número de documento"
                                    />
                                    <InputError message={errors['responsable.document_number']} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="responsable_birth_place">Lugar de Nacimiento</Label>
                                    <Input
                                        id="responsable_birth_place"
                                        value={data.responsable.birth_place}
                                        onChange={(e) =>
                                            setData('responsable', { ...data.responsable, birth_place: e.target.value })
                                        }
                                        placeholder="Ciudad de nacimiento"
                                    />
                                    <InputError message={errors['responsable.birth_place']} />
                                </div>
                                <div>
                                    <Label htmlFor="responsable_birth_date">Fecha de Nacimiento *</Label>
                                    <Input
                                        id="responsable_birth_date"
                                        type="date"
                                        value={data.responsable.birth_date}
                                        onChange={(e) =>
                                            setData('responsable', { ...data.responsable, birth_date: e.target.value })
                                        }
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    <InputError message={errors['responsable.birth_date']} />
                                </div>
                            </div>

                            <div>
                                <Label>Género *</Label>
                                <RadioGroup
                                    value={data.responsable.gender}
                                    onValueChange={(value: 'M' | 'F') =>
                                        setData('responsable', { ...data.responsable, gender: value })
                                    }
                                    className="flex gap-4 mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="M" id="gender_m" />
                                        <Label htmlFor="gender_m">Masculino</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="F" id="gender_f" />
                                        <Label htmlFor="gender_f">Femenino</Label>
                                    </div>
                                </RadioGroup>
                                <InputError message={errors['responsable.gender']} />
                            </div>

                            <div>
                                <Label htmlFor="responsable_email">Correo Electrónico *</Label>
                                <Input
                                    id="responsable_email"
                                    type="email"
                                    value={data.responsable.email}
                                    onChange={(e) => setData('responsable', { ...data.responsable, email: e.target.value })}
                                    placeholder="correo@ejemplo.com"
                                />
                                <InputError message={errors['responsable.email']} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="responsable_phone">Teléfono Fijo</Label>
                                    <Input
                                        id="responsable_phone"
                                        value={data.responsable.phone}
                                        onChange={(e) => setData('responsable', { ...data.responsable, phone: e.target.value })}
                                        placeholder="607 123 4567"
                                    />
                                    <InputError message={errors['responsable.phone']} />
                                </div>
                                <div>
                                    <Label htmlFor="responsable_mobile">Celular *</Label>
                                    <Input
                                        id="responsable_mobile"
                                        value={data.responsable.mobile}
                                        onChange={(e) => setData('responsable', { ...data.responsable, mobile: e.target.value })}
                                        placeholder="300 123 4567"
                                    />
                                    <InputError message={errors['responsable.mobile']} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="responsable_password">Contraseña *</Label>
                                    <Input
                                        id="responsable_password"
                                        type="password"
                                        value={data.responsable.password}
                                        onChange={(e) => setData('responsable', { ...data.responsable, password: e.target.value })}
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                    <InputError message={errors['responsable.password']} />
                                </div>
                                <div>
                                    <Label htmlFor="responsable_password_confirmation">Confirmar Contraseña *</Label>
                                    <Input
                                        id="responsable_password_confirmation"
                                        type="password"
                                        value={data.responsable.password_confirmation}
                                        onChange={(e) =>
                                            setData('responsable', { ...data.responsable, password_confirmation: e.target.value })
                                        }
                                        placeholder="Repita la contraseña"
                                    />
                                    <InputError message={errors['responsable.password_confirmation']} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 2:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos de Localización</CardTitle>
                            <CardDescription>Ingrese la dirección de residencia del responsable</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="responsable_address">Dirección *</Label>
                                    <Input
                                        id="responsable_address"
                                        value={data.responsable.address}
                                        onChange={(e) => setData('responsable', { ...data.responsable, address: e.target.value })}
                                        placeholder="Calle 123 #45-67"
                                    />
                                    <InputError message={errors['responsable.address']} />
                                </div>
                                <div>
                                    <Label htmlFor="responsable_neighborhood">Barrio</Label>
                                    <Input
                                        id="responsable_neighborhood"
                                        value={data.responsable.neighborhood}
                                        onChange={(e) =>
                                            setData('responsable', { ...data.responsable, neighborhood: e.target.value })
                                        }
                                        placeholder="Nombre del barrio"
                                    />
                                    <InputError message={errors['responsable.neighborhood']} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="responsable_city">Ciudad *</Label>
                                    <Input
                                        id="responsable_city"
                                        value={data.responsable.city}
                                        onChange={(e) => setData('responsable', { ...data.responsable, city: e.target.value })}
                                        placeholder="Ej: Ocaña, Cúcuta, Bogotá"
                                    />
                                    <InputError message={errors['responsable.city']} />
                                </div>
                                <div>
                                    <Label htmlFor="responsable_department">Departamento *</Label>
                                    <Select
                                        value={data.responsable.department}
                                        onValueChange={(value) =>
                                            setData('responsable', { ...data.responsable, department: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione departamento" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Norte de Santander">Norte de Santander</SelectItem>
                                            <SelectItem value="Santander">Santander</SelectItem>
                                            <SelectItem value="Cundinamarca">Cundinamarca</SelectItem>
                                            <SelectItem value="Antioquia">Antioquia</SelectItem>
                                            <SelectItem value="Valle del Cauca">Valle del Cauca</SelectItem>
                                            <SelectItem value="Atlántico">Atlántico</SelectItem>
                                            <SelectItem value="Bolívar">Bolívar</SelectItem>
                                            <SelectItem value="Boyacá">Boyacá</SelectItem>
                                            <SelectItem value="Caldas">Caldas</SelectItem>
                                            <SelectItem value="Cesar">Cesar</SelectItem>
                                            <SelectItem value="Córdoba">Córdoba</SelectItem>
                                            <SelectItem value="Huila">Huila</SelectItem>
                                            <SelectItem value="Magdalena">Magdalena</SelectItem>
                                            <SelectItem value="Meta">Meta</SelectItem>
                                            <SelectItem value="Nariño">Nariño</SelectItem>
                                            <SelectItem value="Quindío">Quindío</SelectItem>
                                            <SelectItem value="Risaralda">Risaralda</SelectItem>
                                            <SelectItem value="Tolima">Tolima</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors['responsable.department']} />
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <Label className="text-lg font-semibold">¿La matrícula es para un menor de edad?</Label>
                                <p className="text-sm text-gray-600 mt-2 mb-4">
                                    Si la matrícula es para uno o más menores de edad, deberá ingresar los datos de cada estudiante
                                    en el siguiente paso.
                                </p>
                                <RadioGroup
                                    value={data.is_minor ? 'yes' : 'no'}
                                    onValueChange={(value) => {
                                        const esMinor = value === 'yes';

                                        // Si selecciona que sí es menor y no hay estudiantes, agregar uno automáticamente
                                        if (esMinor && data.estudiantes.length === 0) {
                                            setData({
                                                ...data,
                                                is_minor: true,
                                                estudiantes: [crearNuevoEstudiante()],
                                            });
                                            setCurrentEstudianteIndex(0);
                                        } else {
                                            setData('is_minor', esMinor);
                                        }
                                    }}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="is_minor_no" />
                                        <Label htmlFor="is_minor_no">No, soy yo quien estudiará</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="is_minor_yes" />
                                        <Label htmlFor="is_minor_yes">Sí, es para uno o más menores</Label>
                                    </div>
                                </RadioGroup>
                                <InputError message={errors['is_minor']} />
                            </div>
                        </CardContent>
                    </Card>
                );

            case 3:
                // Si no es menor, mostrar formulario de datos musicales del adulto
                if (!data.is_minor) {
                    return (
                        <Card>
                            <CardHeader>
                                <CardTitle>Datos Musicales y Programa</CardTitle>
                                <CardDescription>
                                    Completa tu información musical y selecciona el programa al que deseas inscribirte
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Datos Musicales del Adulto */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Experiencia Musical</h3>

                                    <div>
                                        <Label>¿Ejecutas algún instrumento?</Label>
                                        <RadioGroup
                                            value={data.responsable.plays_instrument ? 'yes' : 'no'}
                                            onValueChange={(value) =>
                                                setData('responsable', { ...data.responsable, plays_instrument: value === 'yes' })
                                            }
                                            className="flex gap-4 mt-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="yes" id="adult_plays_yes" />
                                                <Label htmlFor="adult_plays_yes">Sí</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="no" id="adult_plays_no" />
                                                <Label htmlFor="adult_plays_no">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {data.responsable.plays_instrument && (
                                        <div>
                                            <Label>Indique cuál o cuáles instrumentos</Label>
                                            <Textarea
                                                value={data.responsable.instruments_played || ''}
                                                onChange={(e) =>
                                                    setData('responsable', { ...data.responsable, instruments_played: e.target.value })
                                                }
                                                placeholder="Ej: Piano, Guitarra, Canto"
                                                rows={2}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <Label>¿Tienes estudios formales de música?</Label>
                                        <RadioGroup
                                            value={data.responsable.has_music_studies ? 'yes' : 'no'}
                                            onValueChange={(value) =>
                                                setData('responsable', { ...data.responsable, has_music_studies: value === 'yes' })
                                            }
                                            className="flex gap-4 mt-2"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="yes" id="adult_studies_yes" />
                                                <Label htmlFor="adult_studies_yes">Sí</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="no" id="adult_studies_no" />
                                                <Label htmlFor="adult_studies_no">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {data.responsable.has_music_studies && (
                                        <div>
                                            <Label>Nombre(s) de escuela(s)</Label>
                                            <Textarea
                                                value={data.responsable.music_schools || ''}
                                                onChange={(e) =>
                                                    setData('responsable', { ...data.responsable, music_schools: e.target.value })
                                                }
                                                placeholder="Ej: Conservatorio Nacional"
                                                rows={2}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <Label>Instrumento que deseas estudiar *</Label>
                                        <Input
                                            value={data.responsable.desired_instrument || ''}
                                            onChange={(e) =>
                                                setData('responsable', { ...data.responsable, desired_instrument: e.target.value })
                                            }
                                            placeholder="Ej: Piano, Guitarra, Canto"
                                        />
                                        <InputError message={errors['responsable.desired_instrument']} />
                                    </div>

                                    <div>
                                        <Label>Modalidad *</Label>
                                        <Select
                                            value={data.responsable.modality}
                                            onValueChange={(value: 'Linaje Kids' | 'Linaje Teens' | 'Linaje Big') =>
                                                setData('responsable', { ...data.responsable, modality: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione una modalidad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Linaje Big">Linaje Big (18+ años)</SelectItem>
                                                <SelectItem value="Linaje Teens">Linaje Teens (10-17 años)</SelectItem>
                                                <SelectItem value="Linaje Kids">Linaje Kids (4-9 años)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors['responsable.modality']} />
                                    </div>

                                    <div>
                                        <Label>Nivel a inscribirse *</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={data.responsable.current_level || 1}
                                            onChange={(e) =>
                                                setData('responsable', { ...data.responsable, current_level: parseInt(e.target.value) || 1 })
                                            }
                                        />
                                        <p className="text-xs text-gray-600 mt-1">
                                            Si eres principiante, deja el nivel en 1
                                        </p>
                                        <InputError message={errors['responsable.current_level']} />
                                    </div>
                                </div>

                                {/* Selección de Programa */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg border-b pb-2">Programa Académico</h3>

                                    <div>
                                        <Label>Programa Académico *</Label>
                                        <Select
                                            value={data.responsable.program_id}
                                            onValueChange={(value) =>
                                                setData('responsable', { ...data.responsable, program_id: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione un programa" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {programs.map((program) => (
                                                    <SelectItem key={program.id} value={program.id.toString()}>
                                                        {program.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors['responsable.program_id']} />
                                    </div>

                                    {data.responsable.program_id && (
                                        <>
                                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                <h4 className="font-semibold mb-2">
                                                    {programs.find((p) => p.id.toString() === data.responsable.program_id)?.name}
                                                </h4>
                                                <p className="text-sm text-gray-700">
                                                    {programs.find((p) => p.id.toString() === data.responsable.program_id)?.description}
                                                </p>
                                            </div>

                                            {/* Horarios */}
                                            {programs.find((p) => p.id.toString() === data.responsable.program_id)?.schedules &&
                                                programs.find((p) => p.id.toString() === data.responsable.program_id)!.schedules.length > 0 && (
                                                    <div>
                                                        <Label>Horario (Opcional)</Label>
                                                        <p className="text-xs text-gray-600 mb-2">
                                                            Selecciona un horario si deseas inscribirte en una clase específica
                                                        </p>
                                                        <Select
                                                            value={data.responsable.schedule_id || undefined}
                                                            onValueChange={(value) =>
                                                                setData('responsable', { ...data.responsable, schedule_id: value || '' })
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccione un horario (opcional)" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {programs
                                                                    .find((p) => p.id.toString() === data.responsable.program_id)!
                                                                    .schedules.filter((s) => s.has_capacity)
                                                                    .map((schedule) => (
                                                                        <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                                                            {schedule.days_of_week} | {schedule.start_time} - {schedule.end_time} | Prof. {schedule.professor.name} | Cupos: {schedule.available_slots}
                                                                        </SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                }

                const estudianteActual = data.estudiantes[currentEstudianteIndex];

                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos de los Estudiantes</CardTitle>
                            <CardDescription>
                                Ingrese los datos de cada estudiante menor de edad que desea matricular
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Pestañas de estudiantes - Mejoradas */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-gray-700">
                                        {data.estudiantes.length === 1
                                            ? '1 Estudiante'
                                            : `${data.estudiantes.length} Estudiantes`}
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={agregarEstudiante}
                                        className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Agregar Hijo/a
                                    </Button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {data.estudiantes.map((est, index) => {
                                        const isComplete = est.name && est.last_name && est.document_number && est.program_id;
                                        const isCurrent = currentEstudianteIndex === index;

                                        return (
                                            <div
                                                key={index}
                                                className={cn(
                                                    'relative flex items-center gap-2 rounded-lg border-2 transition-all',
                                                    isCurrent
                                                        ? 'border-amber-500 bg-amber-50 shadow-md'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                )}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentEstudianteIndex(index)}
                                                    className="flex items-center gap-2 px-4 py-2 flex-1"
                                                >
                                                    <div
                                                        className={cn(
                                                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                                                            isCurrent
                                                                ? 'bg-amber-600 text-white'
                                                                : isComplete
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        )}
                                                    >
                                                        {isComplete && !isCurrent ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            <User className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <p
                                                            className={cn(
                                                                'text-sm font-medium',
                                                                isCurrent ? 'text-amber-900' : 'text-gray-700'
                                                            )}
                                                        >
                                                            {est.name || `Estudiante ${index + 1}`}
                                                        </p>
                                                        {est.program_id && (
                                                            <p className="text-xs text-gray-500">
                                                                {programs.find((p) => p.id.toString() === est.program_id)?.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>

                                                {data.estudiantes.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarEstudiante(index)}
                                                        className="h-full px-3 border-l-2 border-gray-200 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                                                        title="Eliminar estudiante"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {estudianteActual && (
                                <div className="space-y-6">
                                    {/* Datos Personales */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b pb-2">Datos Personales</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Nombre *</Label>
                                                <Input
                                                    value={estudianteActual.name}
                                                    onChange={(e) =>
                                                        actualizarEstudiante(currentEstudianteIndex, 'name', e.target.value)
                                                    }
                                                    placeholder="Nombre"
                                                />
                                                <InputError message={errors[`estudiantes.${currentEstudianteIndex}.name`]} />
                                            </div>
                                            <div>
                                                <Label>Apellidos *</Label>
                                                <Input
                                                    value={estudianteActual.last_name}
                                                    onChange={(e) =>
                                                        actualizarEstudiante(currentEstudianteIndex, 'last_name', e.target.value)
                                                    }
                                                    placeholder="Apellidos"
                                                />
                                                <InputError message={errors[`estudiantes.${currentEstudianteIndex}.last_name`]} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <Label>Tipo de Documento *</Label>
                                                <Select
                                                    value={estudianteActual.document_type}
                                                    onValueChange={(value: 'CC' | 'TI' | 'CE' | 'Pasaporte') =>
                                                        actualizarEstudiante(currentEstudianteIndex, 'document_type', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="CC">C.C</SelectItem>
                                                        <SelectItem value="TI">T.I</SelectItem>
                                                        <SelectItem value="CE">C.E</SelectItem>
                                                        <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={errors[`estudiantes.${currentEstudianteIndex}.document_type`]}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label>Número de Documento *</Label>
                                                <Input
                                                    value={estudianteActual.document_number}
                                                    onChange={(e) =>
                                                        actualizarEstudiante(currentEstudianteIndex, 'document_number', e.target.value)
                                                    }
                                                    placeholder="Número de documento"
                                                />
                                                <InputError
                                                    message={errors[`estudiantes.${currentEstudianteIndex}.document_number`]}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Lugar de Nacimiento</Label>
                                                <Input
                                                    value={estudianteActual.birth_place}
                                                    onChange={(e) =>
                                                        actualizarEstudiante(currentEstudianteIndex, 'birth_place', e.target.value)
                                                    }
                                                    placeholder="Ciudad de nacimiento"
                                                />
                                                <InputError message={errors[`estudiantes.${currentEstudianteIndex}.birth_place`]} />
                                            </div>
                                            <div>
                                                <Label>Fecha de Nacimiento *</Label>
                                                <Input
                                                    type="date"
                                                    value={estudianteActual.birth_date}
                                                    onChange={(e) =>
                                                        actualizarEstudiante(currentEstudianteIndex, 'birth_date', e.target.value)
                                                    }
                                                    max={new Date().toISOString().split('T')[0]}
                                                />
                                                <InputError message={errors[`estudiantes.${currentEstudianteIndex}.birth_date`]} />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Género *</Label>
                                            <RadioGroup
                                                value={estudianteActual.gender}
                                                onValueChange={(value: 'M' | 'F') =>
                                                    actualizarEstudiante(currentEstudianteIndex, 'gender', value)
                                                }
                                                className="flex gap-4 mt-2"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="M" id={`gender_m_${currentEstudianteIndex}`} />
                                                    <Label htmlFor={`gender_m_${currentEstudianteIndex}`}>Masculino</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="F" id={`gender_f_${currentEstudianteIndex}`} />
                                                    <Label htmlFor={`gender_f_${currentEstudianteIndex}`}>Femenino</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div>
                                            <Label>Correo Electrónico del Estudiante (Opcional)</Label>
                                            <Input
                                                type="email"
                                                value={estudianteActual.email}
                                                onChange={(e) =>
                                                    actualizarEstudiante(currentEstudianteIndex, 'email', e.target.value)
                                                }
                                                placeholder="correo@ejemplo.com"
                                            />
                                            <InputError message={errors[`estudiantes.${currentEstudianteIndex}.email`]} />
                                            <p className="text-xs text-gray-600 mt-1">
                                                Si el estudiante tiene correo, podrá acceder para ver su avance
                                            </p>
                                        </div>
                                    </div>

                                    {/* Datos Musicales */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b pb-2">Datos Musicales</h3>

                                        <div>
                                            <Label>¿Ejecuta algún instrumento?</Label>
                                            <RadioGroup
                                                value={estudianteActual.datos_musicales.plays_instrument ? 'yes' : 'no'}
                                                onValueChange={(value) =>
                                                    actualizarEstudiante(
                                                        currentEstudianteIndex,
                                                        'datos_musicales.plays_instrument',
                                                        value === 'yes'
                                                    )
                                                }
                                                className="flex gap-4 mt-2"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id={`plays_yes_${currentEstudianteIndex}`} />
                                                    <Label htmlFor={`plays_yes_${currentEstudianteIndex}`}>Sí</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id={`plays_no_${currentEstudianteIndex}`} />
                                                    <Label htmlFor={`plays_no_${currentEstudianteIndex}`}>No</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {estudianteActual.datos_musicales.plays_instrument && (
                                            <div>
                                                <Label>Indique cuál o cuáles instrumentos</Label>
                                                <Textarea
                                                    value={estudianteActual.datos_musicales.instruments_played}
                                                    onChange={(e) =>
                                                        actualizarEstudiante(
                                                            currentEstudianteIndex,
                                                            'datos_musicales.instruments_played',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Ej: Piano, Guitarra, Canto"
                                                    rows={2}
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <Label>¿Tiene estudios formales de música?</Label>
                                            <RadioGroup
                                                value={estudianteActual.datos_musicales.has_music_studies ? 'yes' : 'no'}
                                                onValueChange={(value) =>
                                                    actualizarEstudiante(
                                                        currentEstudianteIndex,
                                                        'datos_musicales.has_music_studies',
                                                        value === 'yes'
                                                    )
                                                }
                                                className="flex gap-4 mt-2"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="yes" id={`studies_yes_${currentEstudianteIndex}`} />
                                                    <Label htmlFor={`studies_yes_${currentEstudianteIndex}`}>Sí</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="no" id={`studies_no_${currentEstudianteIndex}`} />
                                                    <Label htmlFor={`studies_no_${currentEstudianteIndex}`}>No</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {estudianteActual.datos_musicales.has_music_studies && (
                                            <div>
                                                <Label>Nombre(s) de escuela(s)</Label>
                                                <Textarea
                                                    value={estudianteActual.datos_musicales.music_schools}
                                                    onChange={(e) =>
                                                        actualizarEstudiante(
                                                            currentEstudianteIndex,
                                                            'datos_musicales.music_schools',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Ej: Conservatorio Nacional"
                                                    rows={2}
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <Label>Instrumento que desea estudiar *</Label>
                                            <Input
                                                value={estudianteActual.datos_musicales.desired_instrument}
                                                onChange={(e) =>
                                                    actualizarEstudiante(
                                                        currentEstudianteIndex,
                                                        'datos_musicales.desired_instrument',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Ej: Piano, Guitarra, Canto"
                                            />
                                            <InputError
                                                message={errors[`estudiantes.${currentEstudianteIndex}.datos_musicales.desired_instrument`]}
                                            />
                                        </div>

                                        <div>
                                            <Label>Modalidad según edad *</Label>
                                            <Select
                                                value={estudianteActual.datos_musicales.modality}
                                                onValueChange={(value: 'Linaje Kids' | 'Linaje Teens' | 'Linaje Big') =>
                                                    actualizarEstudiante(currentEstudianteIndex, 'datos_musicales.modality', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione una modalidad" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Linaje Kids">Linaje Kids (4-9 años)</SelectItem>
                                                    <SelectItem value="Linaje Teens">Linaje Teens (10-17 años)</SelectItem>
                                                    <SelectItem value="Linaje Big">Linaje Big (18+ años)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors[`estudiantes.${currentEstudianteIndex}.datos_musicales.modality`]}
                                            />
                                        </div>

                                        <div>
                                            <Label>Nivel a inscribirse *</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={estudianteActual.datos_musicales.current_level}
                                                onChange={(e) =>
                                                    actualizarEstudiante(
                                                        currentEstudianteIndex,
                                                        'datos_musicales.current_level',
                                                        parseInt(e.target.value) || 1
                                                    )
                                                }
                                            />
                                            <p className="text-xs text-gray-600 mt-1">
                                                Si es principiante, deja el nivel en 1
                                            </p>
                                            <InputError message={errors[`estudiantes.${currentEstudianteIndex}.datos_musicales.current_level`]} />
                                        </div>
                                    </div>

                                    {/* Selección de Programa */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg border-b pb-2">Programa Académico</h3>

                                        <div>
                                            <Label>Programa Académico *</Label>
                                            <Select
                                                value={estudianteActual.program_id}
                                                onValueChange={(value) =>
                                                    actualizarEstudiante(currentEstudianteIndex, 'program_id', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un programa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {programs.map((program) => (
                                                        <SelectItem key={program.id} value={program.id.toString()}>
                                                            {program.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors[`estudiantes.${currentEstudianteIndex}.program_id`]} />
                                        </div>

                                        {estudianteActual.program_id && (
                                            <>
                                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <h4 className="font-semibold mb-2">
                                                        {programs.find((p) => p.id.toString() === estudianteActual.program_id)?.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-700">
                                                        {
                                                            programs.find((p) => p.id.toString() === estudianteActual.program_id)
                                                                ?.description
                                                        }
                                                    </p>
                                                </div>

                                                {/* Horarios */}
                                                {programs.find((p) => p.id.toString() === estudianteActual.program_id)?.schedules &&
                                                    programs.find((p) => p.id.toString() === estudianteActual.program_id)!.schedules
                                                        .length > 0 && (
                                                        <div>
                                                            <Label>Horario (Opcional)</Label>
                                                            <p className="text-xs text-gray-600 mb-2">
                                                                Selecciona un horario si deseas inscribirte en una clase específica
                                                            </p>
                                                            <Select
                                                                value={estudianteActual.schedule_id || undefined}
                                                                onValueChange={(value) =>
                                                                    actualizarEstudiante(currentEstudianteIndex, 'schedule_id', value || '')
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Seleccione un horario (opcional)" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {programs
                                                                        .find((p) => p.id.toString() === estudianteActual.program_id)!
                                                                        .schedules.filter((s) => s.has_capacity)
                                                                        .map((schedule) => (
                                                                            <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                                                                {schedule.days_of_week} | {schedule.start_time} -{' '}
                                                                                {schedule.end_time} | Prof. {schedule.professor.name} | Cupos:{' '}
                                                                                {schedule.available_slots}
                                                                            </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );

            case 4:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Autorizaciones y Compromiso</CardTitle>
                            <CardDescription>Lea y acepte los términos antes de completar la matrícula</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {data.is_minor && (
                                <div className="p-4 border rounded-lg space-y-3">
                                    <h4 className="font-semibold">Autorización para Menores de Edad</h4>
                                    <p className="text-sm text-gray-700">
                                        Por medio de la presente doy la autorización a {data.estudiantes.length > 1 ? 'mis hijos' : 'mi hijo(a)'}
                                        {' '}para que {data.estudiantes.length > 1 ? 'estudien y desarrollen' : 'estudie y desarrolle'} en la Academia de
                                        formación Musical y Espiritual LINAJE. Estoy de acuerdo en la completa aplicación del
                                        reglamento de la academia.
                                    </p>

                                    {/* Lista de estudiantes a matricular */}
                                    <div className="mt-3 space-y-2">
                                        <p className="text-sm font-semibold">Estudiantes a matricular:</p>
                                        {data.estudiantes.map((est, index) => (
                                            <div key={index} className="p-3 bg-gray-50 rounded text-sm">
                                                <p>
                                                    <strong>{est.name} {est.last_name}</strong>
                                                </p>
                                                <p className="text-gray-600">
                                                    Programa: {programs.find((p) => p.id.toString() === est.program_id)?.name || 'No seleccionado'}
                                                </p>
                                                <p className="text-gray-600">Modalidad: {est.datos_musicales.modality}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center space-x-2 pt-2">
                                        <Checkbox
                                            id="parental_authorization"
                                            checked={data.parental_authorization}
                                            onCheckedChange={(checked) => setData('parental_authorization', checked as boolean)}
                                        />
                                        <Label htmlFor="parental_authorization" className="text-sm font-medium">
                                            Acepto y autorizo como responsable legal
                                        </Label>
                                    </div>
                                    {errors.parental_authorization && (
                                        <p className="text-sm text-red-600">{errors.parental_authorization}</p>
                                    )}
                                </div>
                            )}

                            <div className="p-4 border rounded-lg space-y-3">
                                <h4 className="font-semibold">Compromiso de Pago</h4>
                                <p className="text-sm text-gray-700">
                                    La Academia de formación Musical y Espiritual LINAJE, desea tener constancia del compromiso
                                    de pago que hace usted como {data.is_minor ? 'padre, madre o encargado de los estudiantes menores de edad' : 'estudiante inscrito'}. Este compromiso se
                                    extiende desde que el estudiante es aceptado hasta que el mismo termina el programa escogido
                                    o decide no continuar con sus estudios en la Academia.
                                </p>
                                <p className="text-sm text-gray-700">
                                    Mediante este documento usted deja constado todo lo que involucra en los Pagos de
                                    Inscripciones y Matrículas. Entiéndase que en caso de que una de las partes no cumpla con
                                    dicho acuerdo, es usted quien tiene la responsabilidad final de los pagos con la Academia.
                                </p>

                                {data.is_minor && data.estudiantes.length > 0 && (
                                    <div className="pt-2 space-y-2">
                                        <p className="text-sm font-semibold">Resumen de matrículas:</p>
                                        {data.estudiantes.map((est, index) => (
                                            <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                                                <p>
                                                    <strong>{est.name} {est.last_name}</strong> - {est.datos_musicales.modality} -{' '}
                                                    {programs.find((p) => p.id.toString() === est.program_id)?.name}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="payment_commitment"
                                        checked={data.payment_commitment}
                                        onCheckedChange={(checked) => setData('payment_commitment', checked as boolean)}
                                    />
                                    <Label htmlFor="payment_commitment" className="text-sm font-medium">
                                        Acepto el compromiso de pago para {data.is_minor ? 'todos los estudiantes' : 'la matrícula'}
                                    </Label>
                                </div>
                                {errors.payment_commitment && (
                                    <p className="text-sm text-red-600">{errors.payment_commitment}</p>
                                )}
                            </div>

                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                                <p className="text-lg font-semibold text-green-900">¡Todo listo!</p>
                                <p className="text-sm text-green-700 mt-1">
                                    Haz clic en "Completar Matrícula" para finalizar el proceso
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Head title="Matrícula - Academia Linaje" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Formato de Ingreso</h1>
                        <p className="text-gray-600">Academia de Formación Musical y Espiritual LINAJE</p>
                    </div>

                    {/* Progress Bar - Mejorado */}
                    <div className="mb-8">
                        {/* Barra de progreso visual */}
                        <div className="flex justify-between mb-4">
                            {[1, 2, 3, 4].map((s) => {
                                const isComplete = s < step || (s === step && isStepValid(s));
                                const isCurrent = s === step;
                                const isPast = s < step;

                                return (
                                    <div key={s} className="flex-1 flex items-center">
                                        <div className="relative flex flex-col items-center flex-1">
                                            {/* Círculo del paso */}
                                            <button
                                                type="button"
                                                onClick={() => goToStep(s)}
                                                disabled={s > step}
                                                className={cn(
                                                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 relative z-10',
                                                    isCurrent && 'ring-4 ring-amber-200 scale-110',
                                                    isPast && 'bg-green-600 text-white hover:bg-green-700',
                                                    isCurrent && isComplete && 'bg-amber-600 text-white',
                                                    isCurrent && !isComplete && 'bg-amber-400 text-white',
                                                    !isCurrent && !isPast && 'bg-gray-200 text-gray-500',
                                                    s <= step && 'cursor-pointer',
                                                    s > step && 'cursor-not-allowed'
                                                )}
                                            >
                                                {isPast ? (
                                                    <Check className="h-5 w-5" />
                                                ) : (
                                                    <span>{s}</span>
                                                )}
                                            </button>

                                            {/* Etiqueta del paso */}
                                            <span
                                                className={cn(
                                                    'text-xs mt-2 text-center font-medium transition-colors',
                                                    isCurrent ? 'text-amber-600' : 'text-gray-500'
                                                )}
                                            >
                                                {s === 1 && 'Responsable'}
                                                {s === 2 && 'Ubicación'}
                                                {s === 3 && 'Estudiantes'}
                                                {s === 4 && 'Finalizar'}
                                            </span>
                                        </div>

                                        {/* Línea conectora */}
                                        {s < 4 && (
                                            <div
                                                className={cn(
                                                    'flex-1 h-1 mx-2 rounded transition-all duration-300',
                                                    s < step ? 'bg-green-600' : 'bg-gray-200'
                                                )}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Indicador de progreso */}
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">
                                Paso {step} de {totalSteps}
                                {isStepValid(step) && (
                                    <span className="ml-2 text-green-600 inline-flex items-center gap-1">
                                        <Check className="h-4 w-4" />
                                        Completado
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit}>
                        {/* Mostrar errores globales */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h4 className="font-semibold text-red-900 mb-2">Hay errores en el formulario:</h4>
                                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                    {Object.entries(errors).map(([key, value]) => (
                                        <li key={key}>
                                            {key}: {value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {renderStep()}

                        {/* Navigation Buttons - Mejorados */}
                        <div className="flex justify-between items-center mt-6 gap-4">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    onClick={prevStep}
                                    variant="outline"
                                    size="lg"
                                    className="gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Anterior
                                </Button>
                            )}

                            {/* Espaciador cuando no hay botón anterior */}
                            {step === 1 && <div />}

                            {step < totalSteps && (
                                <div className="ml-auto flex flex-col items-end gap-2">
                                    {!isStepValid(step) && (
                                        <p className="text-sm text-amber-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            Completa los campos requeridos
                                        </p>
                                    )}
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!isStepValid(step)}
                                        size="lg"
                                        className="gap-2"
                                    >
                                        Siguiente
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {step === totalSteps && (
                                <div className="ml-auto flex flex-col items-end gap-2">
                                    {!isStepValid(step) && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            Debes aceptar los compromisos
                                        </p>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={processing || !isStepValid(step)}
                                        size="lg"
                                        className="bg-green-600 hover:bg-green-700 gap-2 min-w-[200px]"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-5 w-5" />
                                                Completar Matrícula
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import InputError from '@/components/input-error';

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

export default function Create({ programs }: Props) {
    const [step, setStep] = useState(1);
    const totalSteps = 6;

    const { data, setData, post, processing, errors } = useForm({
        // Datos del responsable
        responsable: {
            name: '',
            last_name: '',
            email: '',
            password: '',
            password_confirmation: '',
            document_type: 'CC' as 'CC' | 'TI',
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
        },
        // ¿Es menor de edad?
        is_minor: false,
        // Datos del estudiante (si es menor)
        estudiante: {
            name: '',
            last_name: '',
            email: '',
            document_type: 'TI' as 'CC' | 'TI',
            document_number: '',
            birth_place: '',
            birth_date: '',
            gender: 'M' as 'M' | 'F',
        },
        // Datos musicales
        datos_musicales: {
            plays_instrument: false,
            instruments_played: '',
            has_music_studies: false,
            music_schools: '',
            desired_instrument: '',
            modality: '' as '' | 'Linaje Kids' | 'Linaje Teens' | 'Linaje Big',
            current_level: 1,
        },
        // Programa
        program_id: '',
        schedule_id: '',
        // Autorizaciones
        parental_authorization: false,
        payment_commitment: false,
    });

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        console.log('Enviando formulario con datos:', data);
        post('/matricula', {
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
                                        onValueChange={(value: 'CC' | 'TI') =>
                                            setData('responsable', { ...data.responsable, document_type: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TI">T.I</SelectItem>
                                            <SelectItem value="CC">C.C</SelectItem>
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
                                        placeholder="Ciudad o Municipio"
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="responsable_phone">Teléfono</Label>
                                    <Input
                                        id="responsable_phone"
                                        value={data.responsable.phone}
                                        onChange={(e) => setData('responsable', { ...data.responsable, phone: e.target.value })}
                                        placeholder="601 234 5678"
                                    />
                                    <InputError message={errors['responsable.phone']} />
                                </div>
                                <div>
                                    <Label htmlFor="responsable_city">Ciudad *</Label>
                                    <Input
                                        id="responsable_city"
                                        value={data.responsable.city}
                                        onChange={(e) => setData('responsable', { ...data.responsable, city: e.target.value })}
                                        placeholder="Ciudad"
                                    />
                                    <InputError message={errors['responsable.city']} />
                                </div>
                                <div>
                                    <Label htmlFor="responsable_department">Departamento *</Label>
                                    <Input
                                        id="responsable_department"
                                        value={data.responsable.department}
                                        onChange={(e) =>
                                            setData('responsable', { ...data.responsable, department: e.target.value })
                                        }
                                        placeholder="Departamento"
                                    />
                                    <InputError message={errors['responsable.department']} />
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <Label className="text-lg font-semibold">¿La matrícula es para un menor de edad?</Label>
                                <p className="text-sm text-gray-600 mt-2 mb-4">
                                    Si la matrícula es para un menor de edad, deberá ingresar los datos del estudiante en el
                                    siguiente paso.
                                </p>
                                <RadioGroup
                                    value={data.is_minor ? 'yes' : 'no'}
                                    onValueChange={(value) => setData('is_minor', value === 'yes')}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="is_minor_no" />
                                        <Label htmlFor="is_minor_no">No, soy yo quien estudiará</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="is_minor_yes" />
                                        <Label htmlFor="is_minor_yes">Sí, es para un menor de edad</Label>
                                    </div>
                                </RadioGroup>
                                <InputError message={errors['is_minor']} />
                            </div>
                        </CardContent>
                    </Card>
                );

            case 3:
                if (!data.is_minor) {
                    // Si no es menor, saltar este paso
                    nextStep();
                    return null;
                }
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos del Estudiante</CardTitle>
                            <CardDescription>Ingrese los datos del estudiante menor de edad</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="estudiante_name">Nombre del Estudiante *</Label>
                                    <Input
                                        id="estudiante_name"
                                        value={data.estudiante.name}
                                        onChange={(e) => setData('estudiante', { ...data.estudiante, name: e.target.value })}
                                        placeholder="Nombre"
                                    />
                                    <InputError message={errors['estudiante.name']} />
                                </div>
                                <div>
                                    <Label htmlFor="estudiante_last_name">Apellidos *</Label>
                                    <Input
                                        id="estudiante_last_name"
                                        value={data.estudiante.last_name}
                                        onChange={(e) => setData('estudiante', { ...data.estudiante, last_name: e.target.value })}
                                        placeholder="Apellidos"
                                    />
                                    <InputError message={errors['estudiante.last_name']} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="estudiante_document_type">Tipo de Documento *</Label>
                                    <Select
                                        value={data.estudiante.document_type}
                                        onValueChange={(value: 'CC' | 'TI') =>
                                            setData('estudiante', { ...data.estudiante, document_type: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TI">T.I</SelectItem>
                                            <SelectItem value="CC">C.C</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors['estudiante.document_type']} />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="estudiante_document_number">Número de Documento *</Label>
                                    <Input
                                        id="estudiante_document_number"
                                        value={data.estudiante.document_number}
                                        onChange={(e) =>
                                            setData('estudiante', { ...data.estudiante, document_number: e.target.value })
                                        }
                                        placeholder="Número de documento"
                                    />
                                    <InputError message={errors['estudiante.document_number']} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="estudiante_birth_place">Lugar de Nacimiento</Label>
                                    <Input
                                        id="estudiante_birth_place"
                                        value={data.estudiante.birth_place}
                                        onChange={(e) => setData('estudiante', { ...data.estudiante, birth_place: e.target.value })}
                                        placeholder="Ciudad o Municipio"
                                    />
                                    <InputError message={errors['estudiante.birth_place']} />
                                </div>
                                <div>
                                    <Label htmlFor="estudiante_birth_date">Fecha de Nacimiento *</Label>
                                    <Input
                                        id="estudiante_birth_date"
                                        type="date"
                                        value={data.estudiante.birth_date}
                                        onChange={(e) => setData('estudiante', { ...data.estudiante, birth_date: e.target.value })}
                                    />
                                    <InputError message={errors['estudiante.birth_date']} />
                                </div>
                            </div>

                            <div>
                                <Label>Género *</Label>
                                <RadioGroup
                                    value={data.estudiante.gender}
                                    onValueChange={(value: 'M' | 'F') =>
                                        setData('estudiante', { ...data.estudiante, gender: value })
                                    }
                                    className="flex gap-4 mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="M" id="estudiante_gender_m" />
                                        <Label htmlFor="estudiante_gender_m">Masculino</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="F" id="estudiante_gender_f" />
                                        <Label htmlFor="estudiante_gender_f">Femenino</Label>
                                    </div>
                                </RadioGroup>
                                <InputError message={errors['estudiante.gender']} />
                            </div>

                            <div>
                                <Label htmlFor="estudiante_email">Correo Electrónico del Estudiante (Opcional)</Label>
                                <Input
                                    id="estudiante_email"
                                    type="email"
                                    value={data.estudiante.email}
                                    onChange={(e) => setData('estudiante', { ...data.estudiante, email: e.target.value })}
                                    placeholder="correo@ejemplo.com"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    Si el estudiante tiene correo, podrá acceder para ver su avance. Los pagos y facturas siempre
                                    se enviarán al correo del responsable.
                                </p>
                                <InputError message={errors['estudiante.email']} />
                            </div>
                        </CardContent>
                    </Card>
                );

            case 4:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Datos Musicales</CardTitle>
                            <CardDescription>
                                Información sobre experiencia musical {data.is_minor ? 'del estudiante' : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>¿Ejecuta algún instrumento? (Considere Voz/Canto como instrumento)</Label>
                                <RadioGroup
                                    value={data.datos_musicales.plays_instrument ? 'yes' : 'no'}
                                    onValueChange={(value) =>
                                        setData('datos_musicales', {
                                            ...data.datos_musicales,
                                            plays_instrument: value === 'yes',
                                        })
                                    }
                                    className="flex gap-4 mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="plays_yes" />
                                        <Label htmlFor="plays_yes">Sí</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="plays_no" />
                                        <Label htmlFor="plays_no">No</Label>
                                    </div>
                                </RadioGroup>
                                <InputError message={errors['datos_musicales.plays_instrument']} />
                            </div>

                            {data.datos_musicales.plays_instrument && (
                                <div>
                                    <Label htmlFor="instruments_played">Indique cuál o cuáles instrumentos</Label>
                                    <Textarea
                                        id="instruments_played"
                                        value={data.datos_musicales.instruments_played}
                                        onChange={(e) =>
                                            setData('datos_musicales', {
                                                ...data.datos_musicales,
                                                instruments_played: e.target.value,
                                            })
                                        }
                                        placeholder="Ej: Piano, Guitarra, Canto"
                                        rows={2}
                                    />
                                    <InputError message={errors['datos_musicales.instruments_played']} />
                                </div>
                            )}

                            <div>
                                <Label>¿Tiene estudios formales de música?</Label>
                                <RadioGroup
                                    value={data.datos_musicales.has_music_studies ? 'yes' : 'no'}
                                    onValueChange={(value) =>
                                        setData('datos_musicales', {
                                            ...data.datos_musicales,
                                            has_music_studies: value === 'yes',
                                        })
                                    }
                                    className="flex gap-4 mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id="studies_yes" />
                                        <Label htmlFor="studies_yes">Sí</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="studies_no" />
                                        <Label htmlFor="studies_no">No</Label>
                                    </div>
                                </RadioGroup>
                                <InputError message={errors['datos_musicales.has_music_studies']} />
                            </div>

                            {data.datos_musicales.has_music_studies && (
                                <div>
                                    <Label htmlFor="music_schools">Nombre(s) de escuela(s) de estudios musicales</Label>
                                    <Textarea
                                        id="music_schools"
                                        value={data.datos_musicales.music_schools}
                                        onChange={(e) =>
                                            setData('datos_musicales', {
                                                ...data.datos_musicales,
                                                music_schools: e.target.value,
                                            })
                                        }
                                        placeholder="Ej: Conservatorio Nacional, Academia XYZ"
                                        rows={2}
                                    />
                                    <InputError message={errors['datos_musicales.music_schools']} />
                                </div>
                            )}

                            <div>
                                <Label htmlFor="desired_instrument">Instrumento que desea estudiar *</Label>
                                <Input
                                    id="desired_instrument"
                                    value={data.datos_musicales.desired_instrument}
                                    onChange={(e) =>
                                        setData('datos_musicales', {
                                            ...data.datos_musicales,
                                            desired_instrument: e.target.value,
                                        })
                                    }
                                    placeholder="Ej: Piano, Guitarra, Canto, Batería, Bajo"
                                />
                                <InputError message={errors['datos_musicales.desired_instrument']} />
                            </div>

                            <div>
                                <Label htmlFor="modality">Modalidad según edad *</Label>
                                <Select
                                    value={data.datos_musicales.modality}
                                    onValueChange={(value: 'Linaje Kids' | 'Linaje Teens' | 'Linaje Big') =>
                                        setData('datos_musicales', { ...data.datos_musicales, modality: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione una modalidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Linaje Kids">Linaje Kids - Niños (4 - 9 años)</SelectItem>
                                        <SelectItem value="Linaje Teens">Linaje Teens - Adolescentes (10 - 17 años)</SelectItem>
                                        <SelectItem value="Linaje Big">Linaje Big - Mayores de 18 años</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors['datos_musicales.modality']} />
                            </div>

                            <div>
                                <Label htmlFor="current_level">Nivel a inscribirse *</Label>
                                <Input
                                    id="current_level"
                                    type="number"
                                    min="1"
                                    value={data.datos_musicales.current_level}
                                    onChange={(e) =>
                                        setData('datos_musicales', {
                                            ...data.datos_musicales,
                                            current_level: parseInt(e.target.value) || 1,
                                        })
                                    }
                                    placeholder="Ej: 1"
                                />
                                <InputError message={errors['datos_musicales.current_level']} />
                            </div>
                        </CardContent>
                    </Card>
                );

            case 5:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Selección de Programa</CardTitle>
                            <CardDescription>Elija el programa académico al que desea inscribirse</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="program">Programa Académico *</Label>
                                <Select value={data.program_id} onValueChange={(value) => setData('program_id', value)}>
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
                                {errors.program_id && <p className="text-sm text-red-600 mt-1">{errors.program_id}</p>}
                            </div>

                            {data.program_id && (
                                <>
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <h4 className="font-semibold mb-2">
                                            {programs.find((p) => p.id.toString() === data.program_id)?.name}
                                        </h4>
                                        <p className="text-sm text-gray-700">
                                            {programs.find((p) => p.id.toString() === data.program_id)?.description}
                                        </p>
                                    </div>

                                    {/* Horarios Disponibles */}
                                    {programs.find((p) => p.id.toString() === data.program_id)?.schedules &&
                                        programs.find((p) => p.id.toString() === data.program_id)!.schedules.length > 0 && (
                                            <div>
                                                <Label htmlFor="schedule">Horario (Opcional)</Label>
                                                <p className="text-xs text-gray-600 mb-2">
                                                    Selecciona un horario si deseas inscribirte en una clase específica
                                                </p>
                                                <Select
                                                    value={data.schedule_id || undefined}
                                                    onValueChange={(value) => setData('schedule_id', value || '')}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione un horario (opcional)" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {programs
                                                            .find((p) => p.id.toString() === data.program_id)!
                                                            .schedules.filter((s) => s.has_capacity)
                                                            .map((schedule) => (
                                                                <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                                                    {schedule.days_of_week} | {schedule.start_time} - {schedule.end_time} |{' '}
                                                                    Prof. {schedule.professor.name} | Cupos: {schedule.available_slots}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors['schedule_id']} />
                                                {data.schedule_id && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setData('schedule_id', '')}
                                                        className="text-xs text-gray-600 hover:text-gray-900"
                                                    >
                                                        Limpiar selección
                                                    </Button>
                                                )}

                                                {/* Mostrar horarios sin cupos */}
                                                {programs
                                                    .find((p) => p.id.toString() === data.program_id)!
                                                    .schedules.filter((s) => !s.has_capacity).length > 0 && (
                                                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <p className="text-xs text-red-800 font-semibold mb-1">
                                                            Horarios sin cupos disponibles:
                                                        </p>
                                                        {programs
                                                            .find((p) => p.id.toString() === data.program_id)!
                                                            .schedules.filter((s) => !s.has_capacity)
                                                            .map((schedule) => (
                                                                <p key={schedule.id} className="text-xs text-red-700">
                                                                    • {schedule.days_of_week} {schedule.start_time} - {schedule.end_time} (Prof.{' '}
                                                                    {schedule.professor.name})
                                                                </p>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                );

            case 6:
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
                                        Por medio de la presente doy la autorización a mi hijo(a){' '}
                                        <strong>
                                            {data.estudiante.name} {data.estudiante.last_name}
                                        </strong>{' '}
                                        para que estudie y desarrolle en el programa de{' '}
                                        <strong>{programs.find((p) => p.id.toString() === data.program_id)?.name}</strong> bajo
                                        la modalidad de <strong>{data.datos_musicales.modality}</strong> en la Academia de
                                        formación Musical y Espiritual LINAJE. Estoy de acuerdo en la completa aplicación del
                                        reglamento de la academia.
                                    </p>
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
                                    de pago que hace usted como {data.is_minor ? 'padre, madre o encargado del estudiante menor de edad' : 'estudiante inscrito'}. Este compromiso se
                                    extiende desde que el estudiante es aceptado hasta que el mismo termina el programa escogido
                                    o decide no continuar con sus estudios en la Academia.
                                </p>
                                <p className="text-sm text-gray-700">
                                    Mediante este documento usted deja constado todo lo que involucra en los Pagos de
                                    Inscripciones y Matrículas. Entiéndase que en caso de que una de las partes no cumpla con
                                    dicho acuerdo, es usted quien tiene la responsabilidad final de los pagos con la Academia.
                                </p>
                                <div className="pt-2 space-y-2">
                                    <p className="text-sm">
                                        <strong>Nombre del Estudiante:</strong>{' '}
                                        {data.is_minor
                                            ? `${data.estudiante.name} ${data.estudiante.last_name}`
                                            : `${data.responsable.name} ${data.responsable.last_name}`}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Modalidad:</strong> {data.datos_musicales.modality}
                                    </p>
                                    <p className="text-sm">
                                        <strong>Programa:</strong>{' '}
                                        {programs.find((p) => p.id.toString() === data.program_id)?.name}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="payment_commitment"
                                        checked={data.payment_commitment}
                                        onCheckedChange={(checked) => setData('payment_commitment', checked as boolean)}
                                    />
                                    <Label htmlFor="payment_commitment" className="text-sm font-medium">
                                        Acepto el compromiso de pago
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

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            {[1, 2, 3, 4, 5, 6].map((s) => (
                                <div
                                    key={s}
                                    className={`flex-1 h-2 mx-1 rounded-full ${
                                        s <= step ? 'bg-amber-600' : 'bg-gray-200'
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="text-center text-sm text-gray-600">
                            Paso {step} de {totalSteps}
                        </p>
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

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            {step > 1 && (
                                <Button type="button" onClick={prevStep} variant="outline">
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Anterior
                                </Button>
                            )}

                            {step < totalSteps && (
                                <Button type="button" onClick={nextStep} className="ml-auto">
                                    Siguiente
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            )}

                            {step === totalSteps && (
                                <Button
                                    type="submit"
                                    disabled={processing || !data.payment_commitment || (data.is_minor && !data.parental_authorization)}
                                    className="ml-auto bg-green-600 hover:bg-green-700"
                                >
                                    {processing ? 'Procesando...' : 'Completar Matrícula'}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

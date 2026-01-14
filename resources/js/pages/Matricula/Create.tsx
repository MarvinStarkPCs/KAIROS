import { Head, useForm, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, CheckCircle, Plus, Trash2, User, AlertCircle, Check, Music2, GraduationCap, MapPin, FileText, Sparkles } from 'lucide-react';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/toaster';
import {
    CreateProps,
    MatriculaFormData,
    Student,
    Gender,
    StudyModality,
    DOCUMENT_TYPES,
    GENDERS,
    MODALITIES,
    TOTAL_STEPS
} from '@/types/matricula';
import { useStudentManagement } from '@/hooks/useStudentManagement';
import { isStepValid, getStepTitle } from '@/utils/matricula-validation';
import { DocumentTypeSelect } from '@/components/matricula/DocumentTypeSelect';
import { GenderRadioGroup } from '@/components/matricula/GenderRadioGroup';
import { ModalitySelect } from '@/components/matricula/ModalitySelect';
import { FormField } from '@/components/matricula/FormField';

export default function Create({ programs }: CreateProps) {
    const [step, setStep] = useState(1);
    const { props } = usePage();

    // Debug: Monitorear mensajes flash
    useEffect(() => {
        console.log('📬 Props flash:', props.flash);
        if (props.flash?.error) {
            console.log('🔴 ERROR FLASH RECIBIDO:', props.flash.error);
        }
        if (props.flash?.success) {
            console.log('✅ SUCCESS FLASH RECIBIDO:', props.flash.success);
        }
    }, [props.flash]);

    const studentManagement = useStudentManagement();
    const {
        students,
        currentIndex: currentEstudianteIndex,
        setCurrentIndex: setCurrentEstudianteIndex,
        createNewStudent: crearNuevoEstudiante,
        addStudent: agregarEstudiante,
        removeStudent: eliminarEstudiante,
        updateStudent: actualizarEstudiante,
        setStudentsData
    } = studentManagement;

    const { data, setData, post, processing, errors } = useForm<MatriculaFormData>({
        // Datos del responsable
        responsable: {
            name: '',
            last_name: '',
            email: '',
            password: '',
            password_confirmation: '',
            document_type: 'CC',
            document_number: '',
            birth_place: '',
            birth_date: '',
            gender: 'M',
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
            modality: '',
            current_level: 1,
            program_id: '',
            schedule_id: '',
        },
        // ¿Es menor de edad?
        is_minor: false,
        // Array de estudiantes (para múltiples hijos)
        estudiantes: students,
        // Autorizaciones
        parental_authorization: false,
        payment_commitment: false,
    });

    // Debug: Monitorear cambios en errors
    useEffect(() => {
        console.log('🔍 Errors actualizados:', errors);
        console.log('🔍 Cantidad de errores:', Object.keys(errors).length);

        if (Object.keys(errors).length > 0) {
            console.log('🔍 Primer error:', Object.entries(errors)[0]);
        }
    }, [errors]);

    // Sincronizar estudiantes con el hook cuando cambian
    const handleAddStudent = () => {
        const newStudents = agregarEstudiante();
        setData('estudiantes', newStudents);
    };

    const handleRemoveStudent = (index: number) => {
        const newStudents = eliminarEstudiante(index);
        setData('estudiantes', newStudents);
    };

    const handleUpdateStudent = (index: number, field: string, value: any) => {
        const newStudents = actualizarEstudiante(index, field, value);
        setData('estudiantes', newStudents);
    };

    // Validar si un paso está completo
    const validateStep = (stepNumber: number): boolean => {
        return isStepValid(stepNumber, data);
    };

    const nextStep = () => {
        if (step < TOTAL_STEPS) {
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
        if (targetStep >= 1 && targetStep <= TOTAL_STEPS) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setStep(targetStep);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        console.log('Enviando formulario con datos:', data);

        // Usar el método post del hook con transform para preparar los datos
        post('/matricula', {
            preserveScroll: true,
            preserveState: true, // Preservar estado para mantener datos del formulario en caso de error
            transform: (data) => {
                // Preparar los datos para enviar - solo incluir campos necesarios según el tipo de matrícula
                const submitData: any = {
                    responsable: data.responsable,
                    is_minor: data.is_minor,
                    payment_commitment: data.payment_commitment,
                };

                console.log('🔍 Valor de is_minor antes del transform:', data.is_minor, typeof data.is_minor);

                // Solo incluir estudiantes y autorización parental si es menor de edad
                if (data.is_minor) {
                    submitData.estudiantes = data.estudiantes;
                    submitData.parental_authorization = data.parental_authorization;
                    console.log('✅ Incluyendo estudiantes:', submitData.estudiantes.length);
                } else {
                    // Para adultos, asegurar que estudiantes NO se envíe
                    // El responsable es quien estudia, no hay estudiantes menores
                    console.log('❌ NO incluyendo estudiantes (adulto)');
                }

                console.log('📦 Datos finales a enviar:', submitData);
                console.log('📦 ¿Tiene campo estudiantes?', 'estudiantes' in submitData);

                return submitData;
            },
            onError: (errors) => {
                console.log('❌ onError callback ejecutado');
                console.log('❌ Errores recibidos:', errors);
                console.log('❌ Cantidad de errores:', Object.keys(errors).length);
                console.log('❌ Lista de campos con error:', Object.keys(errors));

                // Mostrar cada error en consola
                Object.entries(errors).forEach(([key, value]) => {
                    console.log(`  - ${key}: ${value}`);
                });

                // Scroll al top para ver los errores
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Regresar al primer paso si hay errores
                setStep(1);
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
                    <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <User className="h-5 w-5 text-amber-700" />
                                </div>
                                <CardTitle className="text-xl sm:text-2xl">Datos del Responsable</CardTitle>
                            </div>
                            <CardDescription className="text-sm sm:text-base">
                                Ingrese los datos de la persona responsable de la matrícula
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-5 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="responsable_name">Nombre *</Label>
                                    <Input
                                        id="responsable_name"
                                        value={data.responsable.name}
                                        onChange={(e) => setData('responsable', { ...data.responsable, name: e.target.value })}
                                        placeholder="Nombre"
                                        aria-invalid={!!errors['responsable.name']}
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
                                        aria-invalid={!!errors['responsable.last_name']}
                                    />
                                    <InputError message={errors['responsable.last_name']} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DocumentTypeSelect
                                    value={data.responsable.document_type}
                                    onChange={(value) =>
                                        setData('responsable', { ...data.responsable, document_type: value })
                                    }
                                    error={errors['responsable.document_type']}
                                />
                                <div className="md:col-span-2">
                                    <Label htmlFor="responsable_document_number">Número de Documento *</Label>
                                    <Input
                                        id="responsable_document_number"
                                        value={data.responsable.document_number}
                                        onChange={(e) =>
                                            setData('responsable', { ...data.responsable, document_number: e.target.value })
                                        }
                                        placeholder="Número de documento"
                                        aria-invalid={!!errors['responsable.document_number']}
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
                                        aria-invalid={!!errors['responsable.birth_place']}
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
                                        aria-invalid={!!errors['responsable.birth_date']}
                                    />
                                    <InputError message={errors['responsable.birth_date']} />
                                </div>
                            </div>

                            <div>
                                <Label>Género *</Label>
                                <RadioGroup
                                    value={data.responsable.gender}
                                    onValueChange={(value) =>
                                        setData('responsable', { ...data.responsable, gender: value as Gender })
                                    }
                                    className="flex gap-4 mt-2"
                                >
                                    {Object.entries(GENDERS).map(([value, label]) => (
                                        <div key={value} className="flex items-center space-x-2">
                                            <RadioGroupItem value={value} id={`gender_${value}`} />
                                            <Label htmlFor={`gender_${value}`}>{label}</Label>
                                        </div>
                                    ))}
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
                                    aria-invalid={!!errors['responsable.email']}
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
                                        aria-invalid={!!errors['responsable.phone']}
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
                                        aria-invalid={!!errors['responsable.mobile']}
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
                                        aria-invalid={!!errors['responsable.password']}
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
                                        aria-invalid={!!errors['responsable.password_confirmation']}
                                    />
                                    <InputError message={errors['responsable.password_confirmation']} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 2:
                return (
                    <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <MapPin className="h-5 w-5 text-amber-700" />
                                </div>
                                <CardTitle className="text-xl sm:text-2xl">Datos de Localización</CardTitle>
                            </div>
                            <CardDescription className="text-sm sm:text-base">
                                Ingrese la dirección de residencia del responsable
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-5 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="responsable_address">Dirección *</Label>
                                    <Input
                                        id="responsable_address"
                                        value={data.responsable.address}
                                        onChange={(e) => setData('responsable', { ...data.responsable, address: e.target.value })}
                                        placeholder="Calle 123 #45-67"
                                        aria-invalid={!!errors['responsable.address']}
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
                                        aria-invalid={!!errors['responsable.neighborhood']}
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
                                        aria-invalid={!!errors['responsable.city']}
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
                                        if (esMinor && students.length === 0) {
                                            const newStudent = crearNuevoEstudiante();
                                            setStudentsData([newStudent]);
                                            setData({
                                                ...data,
                                                is_minor: true,
                                                estudiantes: [newStudent],
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
                        <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <Music2 className="h-5 w-5 text-amber-700" />
                                    </div>
                                    <CardTitle className="text-xl sm:text-2xl">Datos Musicales y Programa</CardTitle>
                                </div>
                                <CardDescription className="text-sm sm:text-base">
                                    Completa tu información musical y selecciona el programa demo al que deseas asistir
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
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
                                            onValueChange={(value) =>
                                                setData('responsable', { ...data.responsable, modality: value as StudyModality })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccione una modalidad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(MODALITIES)
                                                    .filter(([key]) => key !== '')
                                                    .map(([value, label]) => (
                                                        <SelectItem key={value} value={value}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
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

                                            {/* Horarios - Solo mostrar si hay horarios con capacidad */}
                                            {(() => {
                                                const selectedProgram = programs.find((p) => p.id.toString() === data.responsable.program_id);
                                                const availableSchedules = selectedProgram?.schedules?.filter((s) => s.has_capacity) || [];

                                                return availableSchedules.length > 0 && (
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
                                                                {availableSchedules.map((schedule) => (
                                                                    <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                                                        {schedule.days_of_week} | {schedule.start_time} - {schedule.end_time} | Prof. {schedule.professor.name} | Cupos: {schedule.available_slots}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                );
                                            })()}
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                }

                const estudianteActual = data.estudiantes[currentEstudianteIndex];

                return (
                    <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Music2 className="h-5 w-5 text-amber-700" />
                                </div>
                                <CardTitle className="text-xl sm:text-2xl">Datos de los Estudiantes</CardTitle>
                            </div>
                            <CardDescription className="text-sm sm:text-base">
                                Ingrese los datos de cada estudiante menor de edad para la clase demo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
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
                                        onClick={handleAddStudent}
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
                                                        onClick={() => handleRemoveStudent(index)}
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
                                                        handleUpdateStudent(currentEstudianteIndex, 'name', e.target.value)
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
                                                        handleUpdateStudent(currentEstudianteIndex, 'last_name', e.target.value)
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
                                                    onValueChange={(value) =>
                                                        handleUpdateStudent(currentEstudianteIndex, 'document_type', value)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(DOCUMENT_TYPES).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
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
                                                        handleUpdateStudent(currentEstudianteIndex, 'document_number', e.target.value)
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
                                                        handleUpdateStudent(currentEstudianteIndex, 'birth_place', e.target.value)
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
                                                        handleUpdateStudent(currentEstudianteIndex, 'birth_date', e.target.value)
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
                                                onValueChange={(value) =>
                                                    handleUpdateStudent(currentEstudianteIndex, 'gender', value)
                                                }
                                                className="flex gap-4 mt-2"
                                            >
                                                {Object.entries(GENDERS).map(([value, label]) => (
                                                    <div key={value} className="flex items-center space-x-2">
                                                        <RadioGroupItem
                                                            value={value}
                                                            id={`gender_${value}_${currentEstudianteIndex}`}
                                                        />
                                                        <Label htmlFor={`gender_${value}_${currentEstudianteIndex}`}>
                                                            {label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        <div>
                                            <Label>Correo Electrónico del Estudiante (Opcional)</Label>
                                            <Input
                                                type="email"
                                                value={estudianteActual.email}
                                                onChange={(e) =>
                                                    handleUpdateStudent(currentEstudianteIndex, 'email', e.target.value)
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
                                                    handleUpdateStudent(
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
                                                        handleUpdateStudent(
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
                                                    handleUpdateStudent(
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
                                                        handleUpdateStudent(
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
                                                    handleUpdateStudent(
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
                                                onValueChange={(value) =>
                                                    handleUpdateStudent(currentEstudianteIndex, 'datos_musicales.modality', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione una modalidad" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(MODALITIES)
                                                        .filter(([key]) => key !== '')
                                                        .map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
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
                                                    handleUpdateStudent(
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
                                                    handleUpdateStudent(currentEstudianteIndex, 'program_id', value)
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

                                                {/* Horarios - Solo mostrar si hay horarios con capacidad */}
                                                {(() => {
                                                    const selectedProgram = programs.find((p) => p.id.toString() === estudianteActual.program_id);
                                                    const availableSchedules = selectedProgram?.schedules?.filter((s) => s.has_capacity) || [];

                                                    return availableSchedules.length > 0 && (
                                                        <div>
                                                            <Label>Horario (Opcional)</Label>
                                                            <p className="text-xs text-gray-600 mb-2">
                                                                Selecciona un horario si deseas inscribirte en una clase específica
                                                            </p>
                                                            <Select
                                                                value={estudianteActual.schedule_id || undefined}
                                                                onValueChange={(value) =>
                                                                    handleUpdateStudent(currentEstudianteIndex, 'schedule_id', value || '')
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Seleccione un horario (opcional)" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {availableSchedules.map((schedule) => (
                                                                        <SelectItem key={schedule.id} value={schedule.id.toString()}>
                                                                            {schedule.days_of_week} | {schedule.start_time} -{' '}
                                                                            {schedule.end_time} | Prof. {schedule.professor.name} | Cupos:{' '}
                                                                            {schedule.available_slots}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    );
                                                })()}
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
                    <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FileText className="h-5 w-5 text-green-700" />
                                </div>
                                <CardTitle className="text-xl sm:text-2xl">Autorizaciones y Compromiso</CardTitle>
                            </div>
                            <CardDescription className="text-sm sm:text-base">
                                Lea y acepte los términos antes de completar la inscripción a la clase demo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
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

    // Debug en render
    console.log('🎨 Renderizando con errores:', Object.keys(errors).length, errors);

    return (
        <>
            <Head title="Matrícula - Academia Linaje" />
            <Toaster />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-8 sm:py-12 px-3 sm:px-4 lg:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Header - Mejorado con animaciones e iconos */}
                    <div className="text-center mb-6 sm:mb-10 animate-fade-in">
                        <div className="relative inline-block mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                            <Music2 className="relative h-14 w-14 sm:h-16 sm:w-16 text-amber-600 mx-auto animate-bounce-once" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent mb-3">
                            Clase Demo - Inscripción
                        </h1>
                        <p className="text-base sm:text-lg text-gray-700 font-medium mb-2">
                            Academia de Formación Musical y Espiritual LINAJE
                        </p>
                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                            Completa el formulario para registrarte en nuestra clase demo gratuita
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                <span className="hidden sm:inline">Experiencia única</span>
                                <span className="sm:hidden">Único</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <GraduationCap className="h-4 w-4 text-amber-500" />
                                <span className="hidden sm:inline">Profesores expertos</span>
                                <span className="sm:hidden">Expertos</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="h-4 w-4 text-amber-500" />
                                <span>Gratis</span>
                            </div>
                        </div>
                    </div>

                    {/* Banner de errores */}
                    {Object.keys(errors).length > 0 && (
                        <Card className="mb-6 border-red-200 bg-red-50">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-red-900 mb-1">
                                            Por favor revisa la información del formulario
                                        </h3>
                                        <p className="text-sm text-red-700 mb-3">
                                            Se encontraron {Object.keys(errors).length} {Object.keys(errors).length === 1 ? 'error' : 'errores'} que deben ser corregidos:
                                        </p>
                                        <div className="bg-white rounded-lg p-3 border border-red-200">
                                            <ul className="space-y-1.5">
                                                {Object.entries(errors).slice(0, 8).map(([key, message]) => (
                                                    <li key={key} className="flex items-start gap-2 text-sm text-gray-700">
                                                        <span className="text-red-500 mt-0.5">•</span>
                                                        <span>{message as string}</span>
                                                    </li>
                                                ))}
                                                {Object.keys(errors).length > 8 && (
                                                    <li className="text-sm text-red-600 font-medium mt-2 pl-4">
                                                        ... y {Object.keys(errors).length - 8} {Object.keys(errors).length - 8 === 1 ? 'error más' : 'errores más'}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                        <p className="text-xs text-red-600 mt-3 flex items-center gap-1">
                                            <Check className="h-3 w-3" />
                                            Los campos con errores están marcados en rojo debajo
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Progress Bar - Mejorado y Responsive */}
                    <div className="mb-6 sm:mb-10 animate-fade-in">
                        {/* Progress Percentage Bar */}
                        <div className="mb-6 bg-white rounded-full p-1 shadow-inner">
                            <div
                                className="h-2 sm:h-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Step Indicators - Mobile Optimized */}
                        <div className="hidden sm:flex justify-between mb-6">
                            {[
                                { num: 1, label: 'Responsable', icon: User },
                                { num: 2, label: 'Ubicación', icon: MapPin },
                                { num: 3, label: 'Estudiantes', icon: Music2 },
                                { num: 4, label: 'Finalizar', icon: FileText }
                            ].map((s, index) => {
                                const isComplete = s.num < step;
                                const isCurrent = s.num === step;
                                const isPast = s.num < step;
                                const Icon = s.icon;

                                return (
                                    <div key={s.num} className="flex-1 flex items-center">
                                        <div className="relative flex flex-col items-center flex-1">
                                            {/* Circle with icon */}
                                            <button
                                                type="button"
                                                onClick={() => goToStep(s.num)}
                                                disabled={s.num > step}
                                                className={cn(
                                                    'w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center font-semibold transition-all duration-300 relative z-10 group',
                                                    isCurrent && 'ring-4 ring-amber-300 scale-110 shadow-lg',
                                                    isPast && 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:scale-105 hover:shadow-xl',
                                                    isCurrent && 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg',
                                                    !isCurrent && !isPast && 'bg-gray-200 text-gray-400',
                                                    s.num <= step && 'cursor-pointer hover:scale-105',
                                                    s.num > step && 'cursor-not-allowed opacity-50'
                                                )}
                                            >
                                                {isPast ? (
                                                    <Check className="h-5 w-5 lg:h-6 lg:w-6 animate-scale-in" />
                                                ) : (
                                                    <Icon className={cn(
                                                        "h-5 w-5 lg:h-6 lg:w-6 transition-transform",
                                                        isCurrent && "animate-bounce-once"
                                                    )} />
                                                )}
                                            </button>

                                            {/* Label */}
                                            <span
                                                className={cn(
                                                    'text-xs lg:text-sm mt-2 text-center font-medium transition-all duration-300 px-2',
                                                    isCurrent && 'text-amber-700 font-bold scale-110',
                                                    isPast && 'text-green-700 font-semibold',
                                                    !isCurrent && !isPast && 'text-gray-500'
                                                )}
                                            >
                                                {s.label}
                                            </span>
                                        </div>

                                        {/* Connecting line */}
                                        {index < 3 && (
                                            <div className="relative flex-1 mx-2 lg:mx-3 h-1">
                                                <div className="absolute inset-0 bg-gray-200 rounded"></div>
                                                <div
                                                    className={cn(
                                                        'absolute inset-y-0 left-0 rounded transition-all duration-500 ease-out',
                                                        s.num < step ? 'bg-gradient-to-r from-green-500 to-green-600 w-full step-line-fill' : 'w-0'
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mobile Step Indicator */}
                        <div className="sm:hidden flex items-center justify-between bg-white rounded-lg p-4 shadow-md">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg"
                                )}>
                                    {step === 1 && <User className="h-6 w-6" />}
                                    {step === 2 && <MapPin className="h-6 w-6" />}
                                    {step === 3 && <Music2 className="h-6 w-6" />}
                                    {step === 4 && <FileText className="h-6 w-6" />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        Paso {step} de {TOTAL_STEPS}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {step === 1 && 'Datos del Responsable'}
                                        {step === 2 && 'Ubicación y Tipo'}
                                        {step === 3 && 'Datos de Estudiantes'}
                                        {step === 4 && 'Finalizar Inscripción'}
                                    </p>
                                </div>
                            </div>
                            {validateStep(step) && (
                                <Check className="h-6 w-6 text-green-600 animate-scale-in" />
                            )}
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="animate-fade-in">
                        <div className="animate-slide-right">
                            {renderStep()}
                        </div>

                        {/* Navigation Buttons - Mejorados y Responsive */}
                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 sm:mt-8 gap-3 sm:gap-4 animate-fade-in">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    onClick={prevStep}
                                    variant="outline"
                                    size="lg"
                                    className="gap-2 group hover:scale-105 transition-all duration-200 hover:border-amber-500 hover:text-amber-700 order-2 sm:order-1 w-full sm:w-auto"
                                >
                                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
                                    <span className="hidden sm:inline">Anterior</span>
                                    <span className="sm:hidden">Volver</span>
                                </Button>
                            )}

                            {/* Espaciador cuando no hay botón anterior en desktop */}
                            {step === 1 && <div className="hidden sm:block" />}

                            {step < TOTAL_STEPS && (
                                <div className="ml-auto flex flex-col items-end gap-2 order-1 sm:order-2 w-full sm:w-auto">
                                    {!validateStep(step) && (
                                        <p className="text-xs sm:text-sm text-amber-700 flex items-center gap-1.5 bg-amber-50 px-3 py-2 rounded-lg animate-shake-error">
                                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                            <span className="text-left">Completa los campos requeridos para continuar</span>
                                        </p>
                                    )}
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!validateStep(step)}
                                        size="lg"
                                        className={cn(
                                            "gap-2 group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto min-w-[140px]",
                                            validateStep(step) && "button-pulse"
                                        )}
                                    >
                                        <span>Siguiente</span>
                                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            )}

                            {step === TOTAL_STEPS && (
                                <div className="ml-auto flex flex-col items-end gap-2 order-1 sm:order-2 w-full sm:w-auto">
                                    {!validateStep(step) && (
                                        <p className="text-xs sm:text-sm text-red-700 flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg animate-shake-error">
                                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                            <span className="text-left">Debes aceptar los compromisos para finalizar</span>
                                        </p>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={processing || !validateStep(step)}
                                        size="lg"
                                        className={cn(
                                            "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 gap-2 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto sm:min-w-[220px]",
                                            validateStep(step) && !processing && "animate-pulse"
                                        )}
                                    >
                                        {processing ? (
                                            <>
                                                <div className="h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full loading-spinner" />
                                                <span className="hidden sm:inline">Procesando...</span>
                                                <span className="sm:hidden">Enviando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-5 w-5" />
                                                <span className="hidden sm:inline">Completar Matrícula</span>
                                                <span className="sm:hidden">Finalizar</span>
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

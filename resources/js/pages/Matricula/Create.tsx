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
import { ChevronLeft, ChevronRight, CheckCircle, Plus, Trash2, User, AlertCircle, Check, Music2, GraduationCap, MapPin, FileText, Sparkles, CreditCard, Banknote } from 'lucide-react';
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

export default function Create({ programs, paymentMethods, modalityPrices, discountInfo }: CreateProps) {
    const onlineEnabled = paymentMethods?.online ?? true;
    const manualEnabled = paymentMethods?.manual ?? true;
    const discountMinStudents = discountInfo?.min_students ?? 2;
    const discountPercentage = discountInfo?.percentage ?? 0;

    // Función para formatear precio
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Obtener precio según modalidad seleccionada
    const getModalityPrice = (modality: string) => {
        if (!modalityPrices || !modality || modality === '') return null;
        return modalityPrices[modality as keyof typeof modalityPrices] ?? null;
    };
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
        updateStudentField,
        updateMusicalData,
        setStudentsData
    } = studentManagement;

    const { data, setData, post, processing, errors } = useForm<MatriculaFormData>({
        // Datos del responsable
        responsable: {
            name: '',
            last_name: '',
            email: '',
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
            modality: 'Linaje Big',
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
        // Método de pago: 'online' (pasarela) o 'manual' (efectivo/transferencia)
        payment_method: (onlineEnabled ? 'online' : 'manual') as 'online' | 'manual',
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
        let newStudents: Student[];
        if (field.startsWith('datos_musicales.')) {
            const musicalField = field.replace('datos_musicales.', '') as keyof Student['datos_musicales'];
            newStudents = updateMusicalData(index, musicalField, value);
        } else {
            newStudents = updateStudentField(index, field as keyof Student, value);
        }
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
                    payment_method: data.payment_method,
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
                        <CardHeader className="bg-gradient-to-r from-amber-50 dark:from-amber-950/30 to-orange-50 dark:to-orange-950/30 border-b">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <User className="h-5 w-5 text-amber-700 dark:text-amber-300" />
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

                        </CardContent>
                    </Card>
                );

            case 2:
                return (
                    <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                        <CardHeader className="bg-gradient-to-r from-amber-50 dark:from-amber-950/30 to-orange-50 dark:to-orange-950/30 border-b">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <MapPin className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                                </div>
                                <CardTitle className="text-xl sm:text-2xl">Datos de Localización</CardTitle>
                            </div>
                            <CardDescription className="text-sm sm:text-base">
                                Ingrese la dirección de residencia del responsable
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-5 pt-6">
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
                                <p className="text-sm text-muted-foreground mt-2 mb-4">
                                    Si la matrícula es para uno o más menores de edad, deberá ingresar los datos de cada estudiante
                                    en el siguiente paso.
                                </p>
                                <RadioGroup
                                    value={data.is_minor ? 'yes' : 'no'}
                                    onValueChange={(value) => {
                                        const esMinor = value === 'yes';

                                        // Siempre resetear campos musicales/programa del responsable adulto
                                        const responsableReset = {
                                            ...data.responsable,
                                            plays_instrument: false,
                                            instruments_played: '',
                                            has_music_studies: false,
                                            music_schools: '',
                                            modality: esMinor ? '' : 'Linaje Big',
                                            program_id: '',
                                            schedule_id: '',
                                        };

                                        if (esMinor) {
                                            // Cambiar a menor: limpiar datos musicales del adulto,
                                            // conservar estudiantes ya ingresados o crear uno nuevo
                                            if (students.length === 0) {
                                                const newStudent = crearNuevoEstudiante();
                                                setStudentsData([newStudent]);
                                                setCurrentEstudianteIndex(0);
                                                setData({
                                                    ...data,
                                                    is_minor: true,
                                                    responsable: responsableReset,
                                                    estudiantes: [newStudent],
                                                    parental_authorization: false,
                                                    payment_commitment: false,
                                                });
                                            } else {
                                                setCurrentEstudianteIndex(0);
                                                setData({
                                                    ...data,
                                                    is_minor: true,
                                                    responsable: responsableReset,
                                                    parental_authorization: false,
                                                    payment_commitment: false,
                                                });
                                            }
                                        } else {
                                            // Cambiar a adulto: limpiar estudiantes y datos musicales
                                            setStudentsData([]);
                                            setCurrentEstudianteIndex(0);
                                            setData({
                                                ...data,
                                                is_minor: false,
                                                responsable: responsableReset,
                                                estudiantes: [],
                                                parental_authorization: false,
                                                payment_commitment: false,
                                            });
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
                            <CardHeader className="bg-gradient-to-r from-amber-50 dark:from-amber-950/30 to-orange-50 dark:to-orange-950/30 border-b">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                        <Music2 className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                                    </div>
                                    <CardTitle className="text-xl sm:text-2xl">Datos Musicales y Programa</CardTitle>
                                </div>
                                <CardDescription className="text-sm sm:text-base">
                                    Completa tu información musical y selecciona el programa al que deseas inscribirte
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
                                        <Label>Modalidad</Label>
                                        <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
                                            <p className="font-medium text-green-800 dark:text-green-200">Linaje Big (18+ años)</p>
                                            {getModalityPrice('Linaje Big') && (
                                                <p className="text-sm text-primary font-medium mt-1">
                                                    Valor de matrícula: {formatPrice(getModalityPrice('Linaje Big')!)}
                                                </p>
                                            )}
                                        </div>
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
                                            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                <h4 className="font-semibold mb-2">
                                                    {programs.find((p) => p.id.toString() === data.responsable.program_id)?.name}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
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
                                                        <p className="text-xs text-muted-foreground mb-2">
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
                                                                        {schedule.days_of_week} | {schedule.start_time} - {schedule.end_time} | Prof. {schedule.professor?.name ?? 'Sin asignar'} | Cupos: {schedule.available_slots}
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
                        <CardHeader className="bg-gradient-to-r from-amber-50 dark:from-amber-950/30 to-orange-50 dark:to-orange-950/30 border-b">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <Music2 className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                                </div>
                                <CardTitle className="text-xl sm:text-2xl">Datos de los Estudiantes</CardTitle>
                            </div>
                            <CardDescription className="text-sm sm:text-base">
                                Ingrese los datos de cada estudiante menor de edad
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Pestañas de estudiantes - Mejoradas */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-muted-foreground">
                                        {data.estudiantes.length === 1
                                            ? '1 Estudiante'
                                            : `${data.estudiantes.length} Estudiantes`}
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddStudent}
                                        className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
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
                                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-md'
                                                        : 'border-border bg-card hover:border-input'
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
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                : 'bg-muted text-muted-foreground'
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
                                                                isCurrent ? 'text-amber-900 dark:text-amber-100' : 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {est.name || `Estudiante ${index + 1}`}
                                                        </p>
                                                        {est.program_id && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {programs.find((p) => p.id.toString() === est.program_id)?.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>

                                                {data.estudiantes.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveStudent(index)}
                                                        className="h-full px-3 border-l-2 border-border text-red-600 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
                                            <p className="text-xs text-muted-foreground mt-1">
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
                                                    <SelectItem value="Linaje Kids">Linaje Kids (4-9 años)</SelectItem>
                                                    <SelectItem value="Linaje Teens">Linaje Teens (10-17 años)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {estudianteActual.datos_musicales.modality && getModalityPrice(estudianteActual.datos_musicales.modality) && (
                                                <p className="text-sm text-primary font-medium mt-1">
                                                    Valor de matrícula: {formatPrice(getModalityPrice(estudianteActual.datos_musicales.modality)!)}
                                                </p>
                                            )}
                                            <InputError
                                                message={errors[`estudiantes.${currentEstudianteIndex}.datos_musicales.modality`]}
                                            />
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
                                                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                    <h4 className="font-semibold mb-2">
                                                        {programs.find((p) => p.id.toString() === estudianteActual.program_id)?.name}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
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
                                                            <p className="text-xs text-muted-foreground mb-2">
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
                                                                            {schedule.end_time} | Prof. {schedule.professor?.name ?? 'Sin asignar'} | Cupos:{' '}
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
                        <CardHeader className="bg-gradient-to-r from-green-50 dark:from-green-950/30 to-emerald-50 dark:to-emerald-950/30 border-b">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <FileText className="h-5 w-5 text-green-700 dark:text-green-300" />
                                </div>
                                <CardTitle className="text-xl sm:text-2xl">Autorizaciones y Compromiso</CardTitle>
                            </div>
                            <CardDescription className="text-sm sm:text-base">
                                Lea y acepte los términos antes de completar la matrícula
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {data.is_minor && (
                                <div className="p-4 border rounded-lg space-y-3">
                                    <h4 className="font-semibold">Autorización para Menores de Edad</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Por medio de la presente doy la autorización a {data.estudiantes.length > 1 ? 'mis hijos' : 'mi hijo(a)'}
                                        {' '}para que {data.estudiantes.length > 1 ? 'estudien y desarrollen' : 'estudie y desarrolle'} en la Academia de
                                        formación Musical y Espiritual LINAJE. Estoy de acuerdo en la completa aplicación del
                                        reglamento de la academia.
                                    </p>

                                    {/* Lista de estudiantes a matricular */}
                                    <div className="mt-3 space-y-2">
                                        <p className="text-sm font-semibold">Estudiantes a matricular:</p>
                                        {data.estudiantes.map((est, index) => (
                                            <div key={index} className="p-3 bg-muted rounded text-sm">
                                                <p>
                                                    <strong>{est.name} {est.last_name}</strong>
                                                </p>
                                                <p className="text-muted-foreground">
                                                    Programa: {programs.find((p) => p.id.toString() === est.program_id)?.name || 'No seleccionado'}
                                                </p>
                                                <p className="text-muted-foreground">Modalidad: {est.datos_musicales.modality}</p>
                                                {est.datos_musicales.modality && getModalityPrice(est.datos_musicales.modality) && (
                                                    <p className="text-primary font-medium">
                                                        Valor: {formatPrice(getModalityPrice(est.datos_musicales.modality)!)}
                                                    </p>
                                                )}
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
                                <p className="text-sm text-muted-foreground">
                                    La Academia de formación Musical y Espiritual LINAJE, desea tener constancia del compromiso
                                    de pago que hace usted como {data.is_minor ? 'padre, madre o encargado de los estudiantes menores de edad' : 'estudiante inscrito'}. Este compromiso se
                                    extiende desde que el estudiante es aceptado hasta que el mismo termina el programa escogido
                                    o decide no continuar con sus estudios en la Academia.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Mediante este documento usted deja constado todo lo que involucra en los Pagos de
                                    Matrículas. Entiéndase que en caso de que una de las partes no cumpla con
                                    dicho acuerdo, es usted quien tiene la responsabilidad final de los pagos con la Academia.
                                </p>

                                {data.is_minor && data.estudiantes.length > 0 && (() => {
                                    const getPrimerApellido = (lastName: string) =>
                                        lastName.trim().split(/\s+/)[0].toLowerCase();
                                    const primerApellidos = data.estudiantes.map(e => getPrimerApellido(e.last_name));
                                    const esMismaFamilia =
                                        data.estudiantes.length >= discountMinStudents &&
                                        primerApellidos[0] !== '' &&
                                        primerApellidos.every(ap => ap === primerApellidos[0]);
                                    const hasDiscount = discountPercentage > 0 && esMismaFamilia;
                                    return (
                                        <div className="pt-2 space-y-2">
                                            <p className="text-sm font-semibold">Resumen de matrículas:</p>
                                            {data.estudiantes.map((est, index) => {
                                                const price = getModalityPrice(est.datos_musicales.modality);
                                                const discountAmount = hasDiscount && price ? Math.round(price * (discountPercentage / 100)) : 0;
                                                const finalPrice = price ? price - discountAmount : null;
                                                return (
                                                    <div key={index} className="text-sm p-2 bg-muted rounded">
                                                        <div className="flex items-center justify-between">
                                                            <p>
                                                                <strong>{est.name} {est.last_name}</strong> - {est.datos_musicales.modality} -{' '}
                                                                {programs.find((p) => p.id.toString() === est.program_id)?.name}
                                                            </p>
                                                            {finalPrice !== null && (
                                                                <div className="text-right">
                                                                    {hasDiscount ? (
                                                                        <>
                                                                            <span className="line-through text-muted-foreground text-xs mr-1">
                                                                                {formatPrice(price!)}
                                                                            </span>
                                                                            <span className="font-semibold text-green-700 dark:text-green-300">
                                                                                {formatPrice(finalPrice)}
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="font-semibold">
                                                                            {formatPrice(finalPrice)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {hasDiscount && (
                                                <div className="p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
                                                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                                    <span>
                                                        <strong>{discountPercentage}% de descuento familiar</strong> aplicado por matricular {data.estudiantes.length} hermanos
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {!data.is_minor && (() => {
                                    const price = getModalityPrice(data.responsable.modality);
                                    return price !== null ? (
                                        <div className="pt-2 space-y-2">
                                            <p className="text-sm font-semibold">Resumen de matrícula:</p>
                                            <div className="text-sm p-2 bg-muted rounded flex items-center justify-between">
                                                <p>
                                                    <strong>{data.responsable.name} {data.responsable.last_name}</strong> - {data.responsable.modality} -{' '}
                                                    {programs.find((p) => p.id.toString() === data.responsable.program_id)?.name}
                                                </p>
                                                <span className="font-semibold">{formatPrice(price)}</span>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}

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

                            {/* Método de Pago */}
                            <div className="p-4 border rounded-lg space-y-4">
                                <h4 className="font-semibold">Método de Pago</h4>
                                <p className="text-sm text-muted-foreground">
                                    Selecciona cómo deseas realizar el pago de la matrícula:
                                </p>

                                <div className={cn("grid gap-4", onlineEnabled && manualEnabled ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                                    {/* Opción Pago en Línea */}
                                    {onlineEnabled && (
                                    <div
                                        onClick={() => setData('payment_method', 'online')}
                                        className={cn(
                                            "p-4 border-2 rounded-lg cursor-pointer transition-all duration-200",
                                            data.payment_method === 'online'
                                                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-md"
                                                : "border-border hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={cn(
                                                "p-2 rounded-full",
                                                data.payment_method === 'online' ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                                            )}>
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <span className="font-semibold">Pago en Línea</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Paga de forma segura con tarjeta de crédito, débito o PSE a través de nuestra pasarela de pagos.
                                        </p>
                                    </div>
                                    )}

                                    {/* Opción Pago Manual */}
                                    {manualEnabled && (
                                    <div
                                        onClick={() => setData('payment_method', 'manual')}
                                        className={cn(
                                            "p-4 border-2 rounded-lg cursor-pointer transition-all duration-200",
                                            data.payment_method === 'manual'
                                                ? "border-green-500 bg-green-50 dark:bg-green-950/30 shadow-md"
                                                : "border-border hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={cn(
                                                "p-2 rounded-full",
                                                data.payment_method === 'manual' ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                                            )}>
                                                <Banknote className="h-5 w-5" />
                                            </div>
                                            <span className="font-semibold">Pago Manual</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Realiza el pago en efectivo o por transferencia bancaria. Un asesor se comunicará contigo.
                                        </p>
                                    </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-center">
                                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                                <p className="text-lg font-semibold text-green-900 dark:text-green-100">¡Todo listo!</p>
                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                    {data.payment_method === 'online'
                                        ? 'Haz clic en "Completar Matrícula" para proceder al pago en línea'
                                        : 'Haz clic en "Completar Matrícula" para registrar tu inscripción'
                                    }
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
            <Head title="Matrícula" />
            <Toaster />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-8 sm:py-12 px-3 sm:px-4 lg:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Banner de errores */}
                    {Object.keys(errors).length > 0 && (
                        <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                            <AlertCircle className="h-5 w-5 text-red-600" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-semibold text-red-900 dark:text-red-100 mb-1">
                                            Por favor revisa la información del formulario
                                        </h3>
                                        <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                            Se encontraron {Object.keys(errors).length} {Object.keys(errors).length === 1 ? 'error' : 'errores'} que deben ser corregidos:
                                        </p>
                                        <div className="bg-card rounded-lg p-3 border border-red-200 dark:border-red-800">
                                            <ul className="space-y-1.5">
                                                {Object.entries(errors).slice(0, 8).map(([key, message]) => (
                                                    <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
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
                        <div className="mb-6 bg-card rounded-full p-1 shadow-inner">
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
                                                    !isCurrent && !isPast && 'bg-muted text-muted-foreground',
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
                                                    isCurrent && 'text-amber-700 dark:text-amber-300 font-bold scale-110',
                                                    isPast && 'text-green-700 dark:text-green-300 font-semibold',
                                                    !isCurrent && !isPast && 'text-muted-foreground'
                                                )}
                                            >
                                                {s.label}
                                            </span>
                                        </div>

                                        {/* Connecting line */}
                                        {index < 3 && (
                                            <div className="relative flex-1 mx-2 lg:mx-3 h-1">
                                                <div className="absolute inset-0 bg-muted rounded"></div>
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
                        <div className="sm:hidden flex items-center justify-between bg-card rounded-lg p-4 shadow-md">
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
                                    <p className="text-sm font-semibold text-foreground">
                                        Paso {step} de {TOTAL_STEPS}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {step === 1 && 'Datos del Responsable'}
                                        {step === 2 && 'Ubicación y Tipo'}
                                        {step === 3 && 'Datos de Estudiantes'}
                                        {step === 4 && 'Finalizar Matrícula'}
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
                                    className="gap-2 group hover:scale-105 transition-all duration-200 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300 order-2 sm:order-1 w-full sm:w-auto"
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
                                        <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg animate-shake-error">
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
                                        <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg animate-shake-error">
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

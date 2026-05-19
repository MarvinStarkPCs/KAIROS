import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle, User, AlertCircle, Check, Music2, MapPin, FileText, CreditCard, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/toaster';
import {
    CreateProps,
    MatriculaFormData,
    Responsable,
    Student,
    TOTAL_STEPS
} from '@/types/matricula';
import { useStudentManagement } from '@/hooks/useStudentManagement';
import { isStepValid } from '@/utils/matricula-validation';
import { Step1ResponsableForm } from './Create/steps/Step1ResponsableForm';
import { Step2LocationForm } from './Create/steps/Step2LocationForm';
import { Step3AdultMusicalForm } from './Create/steps/Step3AdultMusicalForm';
import { Step3MinorStudentsForm } from './Create/steps/Step3MinorStudentsForm';
import { Step4AuthorizationsForm } from './Create/steps/Step4AuthorizationsForm';

export default function Create({ programs, paymentMethods, modalityPrices, discountInfo }: CreateProps) {
    const onlineEnabled = paymentMethods?.online ?? true;
    const manualEnabled = paymentMethods?.manual ?? true;
    const discountMinStudents = discountInfo?.min_students ?? 2;
    const discountPercentage = discountInfo?.percentage ?? 0;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getModalityPrice = (modality: string) => {
        if (!modalityPrices || !modality || modality === '') return null;
        return modalityPrices[modality as keyof typeof modalityPrices] ?? null;
    };

    const [step, setStep] = useState(1);

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
            plays_instrument: false,
            instruments_played: '',
            has_music_studies: false,
            music_schools: '',
            modality: 'Linaje Big',
            program_id: '',
            schedule_id: '',
        },
        is_minor: false,
        estudiantes: students,
        parental_authorization: false,
        payment_commitment: false,
        payment_method: (onlineEnabled ? 'online' : 'manual') as 'online' | 'manual',
    });

    const handleAddStudent = () => {
        const newStudents = agregarEstudiante();
        setData('estudiantes', newStudents);
    };

    const handleRemoveStudent = (index: number) => {
        const newStudents = eliminarEstudiante(index);
        setData('estudiantes', newStudents);
    };

    const handleUpdateStudent = (index: number, field: string, value: string | number | boolean) => {
        let newStudents: Student[];
        if (field.startsWith('datos_musicales.')) {
            const musicalField = field.replace('datos_musicales.', '') as keyof Student['datos_musicales'];
            newStudents = updateMusicalData(index, musicalField, value);
        } else {
            newStudents = updateStudentField(index, field as keyof Student, value);
        }
        setData('estudiantes', newStudents);
    };

    const handleResponsableChange = <K extends keyof Responsable>(field: K, value: Responsable[K]) => {
        setData('responsable', { ...data.responsable, [field]: value });
    };

    const handleIsMinorChange = (isMinor: boolean) => {
        const responsableReset = {
            ...data.responsable,
            plays_instrument: false,
            instruments_played: '',
            has_music_studies: false,
            music_schools: '',
            modality: isMinor ? '' : 'Linaje Big',
            program_id: '',
            schedule_id: '',
        };

        if (isMinor) {
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
    };

    const validateStep = (stepNumber: number): boolean => {
        return isStepValid(stepNumber, data);
    };

    const nextStep = () => {
        if (step < TOTAL_STEPS) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setStep(step - 1);
        }
    };

    const goToStep = (targetStep: number) => {
        if (targetStep >= 1 && targetStep <= TOTAL_STEPS) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setStep(targetStep);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post('/matricula', {
            preserveScroll: true,
            preserveState: true,
            transform: (data) => {
                const submitData: Partial<MatriculaFormData> & { payment_method: string } = {
                    responsable: data.responsable,
                    is_minor: data.is_minor,
                    payment_commitment: data.payment_commitment,
                    payment_method: data.payment_method,
                };

                if (data.is_minor) {
                    submitData.estudiantes = data.estudiantes;
                    submitData.parental_authorization = data.parental_authorization;
                }

                return submitData;
            },
            onError: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setStep(1);
            },
        });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Step1ResponsableForm
                        data={data.responsable}
                        errors={errors}
                        onChange={handleResponsableChange}
                    />
                );

            case 2:
                return (
                    <Step2LocationForm
                        data={data.responsable}
                        isMinor={data.is_minor}
                        errors={errors}
                        onChange={handleResponsableChange}
                        onIsMinorChange={handleIsMinorChange}
                    />
                );

            case 3:
                if (!data.is_minor) {
                    return (
                        <Step3AdultMusicalForm
                            data={data.responsable}
                            programs={programs}
                            errors={errors}
                            onChange={handleResponsableChange}
                            getModalityPrice={getModalityPrice}
                            formatPrice={formatPrice}
                        />
                    );
                }
                return (
                    <Step3MinorStudentsForm
                        students={data.estudiantes}
                        currentIndex={currentEstudianteIndex}
                        programs={programs}
                        errors={errors}
                        onCurrentIndexChange={setCurrentEstudianteIndex}
                        onAddStudent={handleAddStudent}
                        onRemoveStudent={handleRemoveStudent}
                        onUpdateStudent={handleUpdateStudent}
                    />
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <Step4AuthorizationsForm
                            isMinor={data.is_minor}
                            parentalAuthorization={data.parental_authorization}
                            paymentCommitment={data.payment_commitment}
                            errors={errors}
                            onParentalAuthorizationChange={(v) => setData('parental_authorization', v)}
                            onPaymentCommitmentChange={(v) => setData('payment_commitment', v)}
                            students={data.estudiantes}
                            programs={programs}
                            getModalityPrice={getModalityPrice}
                            formatPrice={formatPrice}
                        />
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen y Método de Pago</CardTitle>
                                <CardDescription>
                                    Revisa tu selección y elige cómo deseas pagar
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Resumen de matrículas - menores */}
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
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold">Resumen de matrículas:</p>
                                            {data.estudiantes.map((est, index) => {
                                                const price = getModalityPrice(est.datos_musicales.modality);
                                                const discountAmount = hasDiscount && price ? Math.round(price * (discountPercentage / 100)) : 0;
                                                const finalPrice = price ? price - discountAmount : null;
                                                return (
                                                    <div key={index} className="text-sm p-2 bg-muted rounded">
                                                        <div className="flex items-center justify-between">
                                                            <p>
                                                                <strong>{est.name} {est.last_name}</strong> — {est.datos_musicales.modality} —{' '}
                                                                {programs.find(p => p.id.toString() === est.program_id)?.name ?? 'Sin programa'}
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
                                                                        <span className="font-semibold">{formatPrice(finalPrice)}</span>
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

                                {/* Resumen de matrícula - adulto */}
                                {!data.is_minor && (() => {
                                    const price = getModalityPrice(data.responsable.modality);
                                    return price !== null ? (
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold">Resumen de matrícula:</p>
                                            <div className="text-sm p-2 bg-muted rounded flex items-center justify-between">
                                                <p>
                                                    <strong>{data.responsable.name} {data.responsable.last_name}</strong> — {data.responsable.modality} —{' '}
                                                    {programs.find(p => p.id.toString() === data.responsable.program_id)?.name}
                                                </p>
                                                <span className="font-semibold">{formatPrice(price)}</span>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}

                                {/* Método de Pago */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Método de Pago</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona cómo deseas realizar el pago de la matrícula:
                                    </p>
                                    <div className={cn('grid gap-4', onlineEnabled && manualEnabled ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1')}>
                                        {onlineEnabled && (
                                            <div
                                                onClick={() => setData('payment_method', 'online')}
                                                className={cn(
                                                    'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                                                    data.payment_method === 'online'
                                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-md'
                                                        : 'border-border hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50'
                                                )}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={cn('p-2 rounded-full', data.payment_method === 'online' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground')}>
                                                        <CreditCard className="h-5 w-5" />
                                                    </div>
                                                    <span className="font-semibold">Pago en Línea</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Paga de forma segura con tarjeta de crédito, débito o PSE a través de nuestra pasarela de pagos.
                                                </p>
                                            </div>
                                        )}
                                        {manualEnabled && (
                                            <div
                                                onClick={() => setData('payment_method', 'manual')}
                                                className={cn(
                                                    'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200',
                                                    data.payment_method === 'manual'
                                                        ? 'border-green-500 bg-green-50 dark:bg-green-950/30 shadow-md'
                                                        : 'border-border hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50'
                                                )}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={cn('p-2 rounded-full', data.payment_method === 'manual' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground')}>
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

                                {/* Todo listo */}
                                <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-center">
                                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                                    <p className="text-lg font-semibold text-green-900 dark:text-green-100">¡Todo listo!</p>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                        {data.payment_method === 'online'
                                            ? 'Haz clic en "Completar Matrícula" para proceder al pago en línea'
                                            : 'Haz clic en "Completar Matrícula" para registrar tu inscripción'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

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

                    {/* Progress Bar */}
                    <div className="mb-6 sm:mb-10 animate-fade-in">
                        <div className="mb-6 bg-card rounded-full p-1 shadow-inner">
                            <div
                                className="h-2 sm:h-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Step Indicators */}
                        <div className="hidden sm:flex justify-between mb-6">
                            {[
                                { num: 1, label: 'Responsable', icon: User },
                                { num: 2, label: 'Ubicación', icon: MapPin },
                                { num: 3, label: 'Estudiantes', icon: Music2 },
                                { num: 4, label: 'Finalizar', icon: FileText }
                            ].map((s, index) => {
                                const isCurrent = s.num === step;
                                const isPast = s.num < step;
                                const Icon = s.icon;

                                return (
                                    <div key={s.num} className="flex-1 flex items-center">
                                        <div className="relative flex flex-col items-center flex-1">
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

                        {/* Navigation Buttons */}
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

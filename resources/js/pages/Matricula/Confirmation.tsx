import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, Home, Mail, Banknote, Phone } from 'lucide-react';
import { Toaster } from '@/components/toaster';

interface Payment {
    id: number;
    concept: string;
    amount: number;
    status: string;
    student: {
        id: number;
        name: string;
        last_name: string;
        email: string;
    };
    program: {
        id: number;
        name: string;
    };
}

interface ConfirmationProps {
    payment: Payment | null;
    status: string;
    transactionId: string | null;
    message?: string;
}

export default function Confirmation({ payment, status, transactionId, message }: ConfirmationProps) {
    const isApproved = status === 'APPROVED';
    const isPending = status === 'PENDING';
    const isDeclined = status === 'DECLINED' || status === 'ERROR';
    const isManual = status === 'MANUAL';

    return (
        <>
            <Head title={isApproved ? 'Pago Exitoso' : 'Estado del Pago'} />
            <Toaster />

            <div className="min-h-screen bg-gradient-to-b from-muted to-background dark:from-neutral-950 dark:to-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Status Icon */}
                    <div className="text-center mb-8">
                        {isApproved && (
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                        )}
                        {isPending && (
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
                                <Clock className="h-12 w-12 text-yellow-600" />
                            </div>
                        )}
                        {isDeclined && (
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                                <XCircle className="h-12 w-12 text-red-600" />
                            </div>
                        )}
                        {isManual && (
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                                <Banknote className="h-12 w-12 text-amber-600" />
                            </div>
                        )}

                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            {isApproved && '¡Pago Exitoso!'}
                            {isPending && 'Pago Pendiente'}
                            {isDeclined && 'Pago No Procesado'}
                            {isManual && '¡Matrícula Registrada!'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isApproved && 'Tu matrícula ha sido completada exitosamente'}
                            {isPending && 'Tu pago está siendo procesado'}
                            {isDeclined && 'No pudimos procesar tu pago'}
                            {isManual && 'Tu inscripción ha sido registrada exitosamente'}
                        </p>
                    </div>

                    {/* Payment Details */}
                    {payment && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Detalles de la Transacción</CardTitle>
                            <CardDescription>
                                Información de tu pago
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {transactionId && (
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">ID de Transacción:</span>
                                <span className="font-mono text-sm">{transactionId}</span>
                            </div>
                            )}
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Estudiante:</span>
                                <span className="font-medium">
                                    {payment.student.name} {payment.student.last_name}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Programa:</span>
                                <span className="font-medium">{payment.program.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Concepto:</span>
                                <span className="font-medium">{payment.concept}</span>
                            </div>
                            <div className="flex justify-between py-3 bg-muted px-4 rounded-lg">
                                <span className="text-lg font-semibold">Monto:</span>
                                <span className="text-2xl font-bold text-primary">
                                    ${payment.amount.toLocaleString('es-CO')} COP
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-muted-foreground">Estado:</span>
                                <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                                    isApproved ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                                    isPending ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                                    isManual ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200' :
                                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                }`}>
                                    {isApproved && 'Aprobado'}
                                    {isPending && 'Pendiente'}
                                    {isManual && 'Pago Manual Pendiente'}
                                    {isDeclined && 'Rechazado'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    )}

                    {/* Success Message */}
                    {isApproved && payment && (
                        <Card className="mb-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                            Confirmación Enviada
                                        </h3>
                                        <p className="text-sm text-green-800 dark:text-green-200">
                                            Hemos enviado un correo de confirmación a{' '}
                                            <strong>{payment.student.email}</strong> con todos los detalles
                                            de tu matrícula y próximos pagos.
                                        </p>
                                        <p className="text-sm text-green-800 dark:text-green-200 mt-2">
                                            Si pagaste con tarjeta, se han configurado los cobros mensuales
                                            automáticos. Recibirás una notificación antes de cada cobro.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pending Message */}
                    {isPending && payment && (
                        <Card className="mb-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/30">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                            Pago en Proceso
                                        </h3>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            Tu pago está siendo verificado. Esto puede tomar algunos minutos.
                                            Te notificaremos a <strong>{payment.student.email}</strong> cuando
                                            se confirme.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Error Message */}
                    {isDeclined && (
                        <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                                            No se pudo procesar el pago
                                        </h3>
                                        <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                                            Por favor verifica:
                                        </p>
                                        <ul className="text-sm text-red-800 dark:text-red-200 list-disc list-inside space-y-1">
                                            <li>Que los datos de la tarjeta sean correctos</li>
                                            <li>Que tengas fondos suficientes</li>
                                            <li>Que tu tarjeta permita compras en línea</li>
                                        </ul>
                                        <p className="text-sm text-red-800 dark:text-red-200 mt-3">
                                            Puedes intentar nuevamente o contactarnos para ayuda.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Manual Payment Message */}
                    {isManual && (
                        <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Banknote className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                            Matrícula Registrada - Pago Pendiente
                                        </h3>
                                        <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                                            {message || 'Tu matrícula ha sido registrada exitosamente.'}
                                        </p>
                                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                                            Acércate a nuestras instalaciones para realizar el pago por transferencia bancaria o en efectivo.
                                        </p>
                                        <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                                            Te hemos enviado un correo con los detalles de tu matrícula.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" variant={isApproved ? 'default' : 'outline'}>
                            <Link href="/">
                                <Home className="h-4 w-4 mr-2" />
                                Volver al Inicio
                            </Link>
                        </Button>
                        {isDeclined && payment && (
                            <Button asChild size="lg">
                                <Link href={`/matricula/checkout/${payment.id}`}>
                                    Intentar Nuevamente
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Support */}
                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>
                            ¿Necesitas ayuda?{' '}
                            <a href="mailto:soporte@academialinaje.com" className="text-primary hover:underline">
                                Contáctanos
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

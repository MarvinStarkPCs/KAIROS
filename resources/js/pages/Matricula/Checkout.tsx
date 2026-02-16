import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/toaster';
import { CreditCard, Banknote, ShieldCheck, Clock, Phone } from 'lucide-react';
import WompiWidget from '@/components/WompiWidget';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Payment {
    id: number;
    concept: string;
    amount: number;
    wompi_reference: string;
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

interface WompiConfig {
    public_key: string;
    integrity_signature: string | null;
}

interface PaymentMethods {
    online: boolean;
    manual: boolean;
}

interface CheckoutProps {
    payment: Payment;
    wompi_config: WompiConfig;
    paymentMethods?: PaymentMethods;
}

export default function Checkout({ payment, wompi_config, paymentMethods }: CheckoutProps) {
    const onlineEnabled = paymentMethods?.online ?? true;
    const manualEnabled = paymentMethods?.manual ?? true;

    // Si solo hay un método, seleccionarlo automáticamente
    const defaultMethod = onlineEnabled && !manualEnabled ? 'online'
        : !onlineEnabled && manualEnabled ? 'manual'
        : null;

    const [selectedMethod, setSelectedMethod] = useState<'online' | 'manual' | null>(defaultMethod);
    const [submitting, setSubmitting] = useState(false);

    const customerName = `${payment.student.name} ${payment.student.last_name}`;
    const customerEmail = payment.student.email || 'noreply@academialinaje.com';
    const amountInCents = Math.round(payment.amount * 100);

    const handleManualPayment = () => {
        setSubmitting(true);
        router.post(`/matricula/checkout/${payment.id}/manual`, {}, {
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <>
            <Head title="Pagar Matrícula" />
            <Toaster />

            <div className="min-h-screen bg-gradient-to-b from-muted to-background dark:from-neutral-950 dark:to-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Completar Matrícula
                        </h1>
                        <p className="text-muted-foreground">
                            Solo falta un paso para completar tu matrícula
                        </p>
                    </div>

                    {/* Resumen de Pago */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Resumen de Pago</CardTitle>
                            <CardDescription>
                                Revisa los detalles de tu matrícula
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Estudiante:</span>
                                <span className="font-medium">{customerName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Programa:</span>
                                <span className="font-medium">{payment.program.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Concepto:</span>
                                <span className="font-medium">{payment.concept}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-muted-foreground">Correo:</span>
                                <span className="font-medium text-sm">{customerEmail}</span>
                            </div>
                            <div className="flex justify-between py-3 bg-primary/5 px-4 rounded-lg">
                                <span className="text-lg font-semibold">Total a pagar:</span>
                                <span className="text-2xl font-bold text-primary">
                                    ${payment.amount.toLocaleString('es-CO')} COP
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selección de Método de Pago */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Elige tu método de pago</CardTitle>
                            <CardDescription>
                                Selecciona cómo deseas realizar el pago de tu matrícula
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={cn("grid gap-4", onlineEnabled && manualEnabled ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 max-w-md mx-auto")}>
                                {/* Opción Pago en Línea */}
                                {onlineEnabled && <div
                                    onClick={() => setSelectedMethod('online')}
                                    className={cn(
                                        "p-5 border-2 rounded-xl cursor-pointer transition-all duration-200",
                                        selectedMethod === 'online'
                                            ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-md ring-1 ring-amber-500/20"
                                            : "border-border hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={cn(
                                            "p-2.5 rounded-full",
                                            selectedMethod === 'online' ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                                        )}>
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-foreground">Pago en Línea</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Paga de forma segura con tarjeta de crédito, débito, PSE o Nequi.
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                        <span>Pago seguro con Wompi</span>
                                    </div>
                                </div>}

                                {/* Opción Pago Manual */}
                                {manualEnabled && <div
                                    onClick={() => setSelectedMethod('manual')}
                                    className={cn(
                                        "p-5 border-2 rounded-xl cursor-pointer transition-all duration-200",
                                        selectedMethod === 'manual'
                                            ? "border-green-500 bg-green-50 dark:bg-green-950/30 shadow-md ring-1 ring-green-500/20"
                                            : "border-border hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={cn(
                                            "p-2.5 rounded-full",
                                            selectedMethod === 'manual' ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                                        )}>
                                            <Banknote className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-foreground">Pago Manual</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Paga por transferencia bancaria o en efectivo. Un asesor te contactará.
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5" />
                                        <span>Te contactaremos para coordinar</span>
                                    </div>
                                </div>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contenido según método seleccionado */}
                    {selectedMethod === 'online' && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Proceder al Pago</CardTitle>
                                <CardDescription>
                                    Completa tu pago de forma segura con Wompi
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <WompiWidget
                                    publicKey={wompi_config.public_key}
                                    amountInCents={amountInCents}
                                    reference={payment.wompi_reference}
                                    currency="COP"
                                    redirectUrl={window.location.origin + '/matricula/confirmacion'}
                                    customerEmail={customerEmail}
                                    customerName={customerName}
                                    integritySignature={wompi_config.integrity_signature}
                                />
                            </CardContent>
                            <div className="px-6 pb-6">
                                <p className="text-sm text-muted-foreground text-center">Métodos aceptados</p>
                                <div className="flex justify-center gap-3 items-center mt-2 opacity-60">
                                    <div className="text-xs font-semibold bg-card px-3 py-1 rounded border">VISA</div>
                                    <div className="text-xs font-semibold bg-card px-3 py-1 rounded border">MASTERCARD</div>
                                    <div className="text-xs font-semibold bg-card px-3 py-1 rounded border">PSE</div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {selectedMethod === 'manual' && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Pago Manual</CardTitle>
                                <CardDescription>
                                    Confirma tu matrícula y un asesor se comunicará contigo
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <Clock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                                ¿Cómo funciona?
                                            </p>
                                            <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1 list-disc list-inside">
                                                <li>Tu matrícula quedará registrada como pendiente de pago</li>
                                                <li>Un asesor te contactará para coordinar el pago</li>
                                                <li>Podrás pagar por transferencia bancaria o en efectivo</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleManualPayment}
                                    disabled={submitting}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    size="lg"
                                >
                                    {submitting ? 'Procesando...' : 'Confirmar Pago Manual'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Ayuda */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p>
                            ¿Tienes problemas con el pago?{' '}
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

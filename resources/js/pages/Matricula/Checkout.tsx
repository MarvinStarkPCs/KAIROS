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

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Completar Matrícula
                        </h1>
                        <p className="text-gray-600">
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
                                <span className="text-gray-600">Estudiante:</span>
                                <span className="font-medium">{customerName}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Programa:</span>
                                <span className="font-medium">{payment.program.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Concepto:</span>
                                <span className="font-medium">{payment.concept}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Correo:</span>
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
                                            ? "border-amber-500 bg-amber-50 shadow-md ring-1 ring-amber-500/20"
                                            : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={cn(
                                            "p-2.5 rounded-full",
                                            selectedMethod === 'online' ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"
                                        )}>
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-gray-900">Pago en Línea</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Paga de forma segura con tarjeta de crédito, débito, PSE o Nequi.
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
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
                                            ? "border-green-500 bg-green-50 shadow-md ring-1 ring-green-500/20"
                                            : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                                    )}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={cn(
                                            "p-2.5 rounded-full",
                                            selectedMethod === 'manual' ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
                                        )}>
                                            <Banknote className="h-5 w-5" />
                                        </div>
                                        <span className="font-semibold text-gray-900">Pago Manual</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Paga por transferencia bancaria o en efectivo. Un asesor te contactará.
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
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
                                <p className="text-sm text-gray-500 text-center">Métodos aceptados</p>
                                <div className="flex justify-center gap-3 items-center mt-2 opacity-60">
                                    <div className="text-xs font-semibold bg-white px-3 py-1 rounded border">VISA</div>
                                    <div className="text-xs font-semibold bg-white px-3 py-1 rounded border">MASTERCARD</div>
                                    <div className="text-xs font-semibold bg-white px-3 py-1 rounded border">PSE</div>
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
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <Clock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-green-900">
                                                ¿Cómo funciona?
                                            </p>
                                            <ul className="text-sm text-green-700 mt-2 space-y-1 list-disc list-inside">
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
                    <div className="mt-6 text-center text-sm text-gray-500">
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

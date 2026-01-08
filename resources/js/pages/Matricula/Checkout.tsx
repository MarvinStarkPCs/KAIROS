import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/toaster';
import { CheckCircle } from 'lucide-react';
import WompiWidget from '@/components/WompiWidget';

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

interface CheckoutProps {
    payment: Payment;
    wompi_config: WompiConfig;
}

export default function Checkout({ payment, wompi_config }: CheckoutProps) {
    console.log('Wompi Config:', wompi_config);
    const customerName = `${payment.student.name} ${payment.student.last_name}`;
    const customerEmail = payment.student.email || 'noreply@academialinaje.com';
    const amountInCents = Math.round(payment.amount * 100);

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

                    {/* Información de Pago Recurrente */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        Pagos Mensuales Automáticos
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Al proceder con el pago, configurarás una suscripción mensual automática.
                                        Tu tarjeta se cargará cada mes sin necesidad de realizar el pago manualmente.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Widget de Wompi */}
                    <Card>
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
                    </Card>

                    {/* Métodos de Pago Aceptados */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 mb-3">Métodos de pago aceptados</p>
                        <div className="flex justify-center gap-4 items-center opacity-60">
                            <div className="text-xs font-semibold bg-white px-3 py-1 rounded border">VISA</div>
                            <div className="text-xs font-semibold bg-white px-3 py-1 rounded border">MASTERCARD</div>
                            <div className="text-xs font-semibold bg-white px-3 py-1 rounded border">PSE</div>
                        </div>
                    </div>

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

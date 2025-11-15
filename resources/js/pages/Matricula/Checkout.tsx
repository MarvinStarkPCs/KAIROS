import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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

interface CheckoutProps {
    payment: Payment;
    wompiPublicKey: string;
    redirectUrl: string;
    amountInCents: number;
    integritySignature: string | null;
}

declare global {
    interface Window {
        WidgetCheckout?: any;
    }
}

export default function Checkout({ payment, wompiPublicKey, redirectUrl, amountInCents, integritySignature }: CheckoutProps) {
    useEffect(() => {
        // Validar que tenemos los datos necesarios
        if (!payment.wompi_reference) {
            console.error('Error: wompi_reference no está presente en el pago', payment);
            return;
        }

        // Cargar el script de Wompi
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.async = true;
        script.setAttribute('data-render', 'button');
        script.setAttribute('data-public-key', wompiPublicKey);
        script.setAttribute('data-currency', 'COP');
        script.setAttribute('data-amount-in-cents', amountInCents.toString());
        script.setAttribute('data-reference', payment.wompi_reference);

        // Solo agregar firma si existe (no requerida en modo test)
        if (integritySignature) {
            script.setAttribute('data-signature:integrity', integritySignature);
        }

        script.setAttribute('data-redirect-url', redirectUrl);

        // Información del cliente
        script.setAttribute('data-customer-data:email', payment.student.email);
        script.setAttribute('data-customer-data:full-name', `${payment.student.name} ${payment.student.last_name}`);

        // Solo tarjeta de crédito/débito
        script.setAttribute('data-acceptance-token', 'true');
        script.setAttribute('data-payment-methods-enabled', 'CARD');

        script.onload = () => {
            console.log('Wompi widget cargado');
            // Auto-abrir el modal después de que se cargue
            const interval = setInterval(() => {
                // Intentar múltiples selectores para encontrar el botón
                let wompiButton = document.querySelector('form[action*="checkout.wompi"] button') as HTMLButtonElement;

                if (!wompiButton) {
                    wompiButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
                }

                if (!wompiButton) {
                    wompiButton = document.querySelector('#wompi-widget button') as HTMLButtonElement;
                }

                if (!wompiButton) {
                    wompiButton = document.querySelector('[class*="wompi"] button') as HTMLButtonElement;
                }

                if (wompiButton) {
                    clearInterval(interval);
                    console.log('Botón de Wompi encontrado:', wompiButton);
                    console.log('Haciendo click automático...');

                    // Intentar hacer click de múltiples formas
                    wompiButton.click();

                    // Backup: disparar evento click manualmente
                    setTimeout(() => {
                        const clickEvent = new MouseEvent('click', {
                            view: window,
                            bubbles: true,
                            cancelable: true
                        });
                        wompiButton.dispatchEvent(clickEvent);
                    }, 100);
                }
            }, 200);

            // Timeout de seguridad
            setTimeout(() => {
                clearInterval(interval);
                console.log('Timeout alcanzado, intentando una última vez...');
                const anyButton = document.querySelector('#wompi-widget button') as HTMLButtonElement;
                if (anyButton) {
                    anyButton.click();
                }
            }, 3000);
        };

        const container = document.getElementById('wompi-widget');
        if (container) {
            container.appendChild(script);
        }

        return () => {
            if (container && script.parentNode === container) {
                container.removeChild(script);
            }
        };
    }, [payment, wompiPublicKey, redirectUrl, amountInCents, integritySignature]);

    const responsibleEmail = payment.student.email;

    return (
        <>
            <Head title="Pagar Matrícula" />

            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Completar Matrícula
                        </h1>
                        <p className="text-gray-600">
                            Solo falta un paso para completar tu matrícula
                        </p>
                    </div>

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
                                <span className="font-medium">
                                    {payment.student.name} {payment.student.last_name}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Programa:</span>
                                <span className="font-medium">{payment.program.name}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Concepto:</span>
                                <span className="font-medium">{payment.concept}</span>
                            </div>
                            <div className="flex justify-between py-3 bg-gray-50 px-4 rounded-lg">
                                <span className="text-lg font-semibold">Total a pagar:</span>
                                <span className="text-2xl font-bold text-primary">
                                    ${payment.amount.toLocaleString('es-CO')} COP
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pago con Tarjeta</CardTitle>
                            <CardDescription>
                                Ingresa los datos de tu tarjeta de crédito o débito
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>💳 Pago Automático con Tarjeta:</strong> Al registrar tu tarjeta de crédito o débito,
                                    se configurarán cobros mensuales automáticos. Tu tarjeta se cargará automáticamente cada mes
                                    sin necesidad de realizar el pago manualmente.
                                </p>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-700">
                                    <strong>Correo de notificaciones:</strong> {responsibleEmail}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Recibirás la confirmación de pago y facturas en este correo
                                </p>
                            </div>

                            {/* Widget de Wompi - El modal se abrirá automáticamente */}
                            <div id="wompi-widget" className="flex justify-center">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Abriendo pasarela de pago...</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t">
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    <span>Pago seguro procesado por Wompi</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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

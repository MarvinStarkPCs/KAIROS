import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, CreditCard, Users, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/toaster';

interface PaymentData {
    id: number;
    concept: string;
    amount: number;
    amountInCents: number;
    wompi_reference: string;
    integritySignature: string;
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

interface CheckoutMultipleProps {
    payments: PaymentData[];
    totalAmount: number;
    wompiPublicKey: string;
    redirectUrl: string;
}

declare global {
    interface Window {
        WidgetCheckout?: any;
    }
}

export default function CheckoutMultiple({ payments, totalAmount, wompiPublicKey, redirectUrl }: CheckoutMultipleProps) {
    const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0);
    const [completedPayments, setCompletedPayments] = useState<number[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const currentPayment = payments[currentPaymentIndex];

    useEffect(() => {
        if (!currentPayment || completedPayments.includes(currentPayment.id)) {
            return;
        }

        // Limpiar script anterior si existe
        const existingScript = document.querySelector('script[src*="checkout.wompi"]');
        if (existingScript) {
            existingScript.remove();
        }

        const container = document.getElementById('wompi-widget');
        if (container) {
            container.innerHTML = '';
        }

        // Cargar el script de Wompi para el pago actual
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.async = true;
        script.setAttribute('data-render', 'button');
        script.setAttribute('data-public-key', wompiPublicKey);
        script.setAttribute('data-currency', 'COP');
        script.setAttribute('data-amount-in-cents', currentPayment.amountInCents.toString());
        script.setAttribute('data-reference', currentPayment.wompi_reference);

        if (currentPayment.integritySignature) {
            script.setAttribute('data-signature:integrity', currentPayment.integritySignature);
        }

        script.setAttribute('data-redirect-url', redirectUrl);
        script.setAttribute('data-customer-data:email', currentPayment.student.email);
        script.setAttribute('data-customer-data:full-name', `${currentPayment.student.name} ${currentPayment.student.last_name}`);
        script.setAttribute('data-acceptance-token', 'true');
        script.setAttribute('data-payment-methods-enabled', 'CARD');

        script.onload = () => {
            setIsProcessing(false);
            console.log('Wompi widget cargado para:', currentPayment.student.name);

            // Auto-abrir el modal
            const interval = setInterval(() => {
                const wompiButton = document.querySelector('form[action*="checkout.wompi"] button') as HTMLButtonElement;
                if (wompiButton) {
                    clearInterval(interval);
                    setTimeout(() => wompiButton.click(), 500);
                }
            }, 200);

            setTimeout(() => clearInterval(interval), 3000);
        };

        if (container) {
            container.appendChild(script);
        }

        return () => {
            if (container && script.parentNode === container) {
                container.removeChild(script);
            }
        };
    }, [currentPaymentIndex, currentPayment, wompiPublicKey, redirectUrl, completedPayments]);

    const handleNextPayment = () => {
        // Marcar el pago actual como procesado
        if (currentPayment && !completedPayments.includes(currentPayment.id)) {
            setCompletedPayments(prev => [...prev, currentPayment.id]);
        }

        if (currentPaymentIndex < payments.length - 1) {
            setIsProcessing(true);
            setCurrentPaymentIndex(currentPaymentIndex + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSkipPayment = () => {
        // Marcar como saltado (también se considera procesado para evitar re-render)
        handleNextPayment();
    };

    const progress = ((currentPaymentIndex + 1) / payments.length) * 100;

    return (
        <>
            <Head title="Pagar Matrículas" />
            <Toaster />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header con progreso */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">¡Matrículas Creadas Exitosamente!</h1>
                        <p className="text-gray-600">
                            Procede con el pago de cada matrícula para completar el proceso
                        </p>

                        {/* Barra de progreso */}
                        <div className="mt-6 max-w-md mx-auto">
                            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Pago {currentPaymentIndex + 1} de {payments.length}</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Lista de pagos */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Estudiantes ({payments.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {payments.map((payment, index) => {
                                        const isCurrent = index === currentPaymentIndex;
                                        const isCompleted = completedPayments.includes(payment.id);

                                        return (
                                            <div
                                                key={payment.id}
                                                className={cn(
                                                    'p-4 rounded-lg border-2 transition-all',
                                                    isCurrent && 'border-amber-500 bg-amber-50 shadow-md',
                                                    isCompleted && 'border-green-500 bg-green-50',
                                                    !isCurrent && !isCompleted && 'border-gray-200 bg-white'
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {isCompleted && (
                                                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                            )}
                                                            {isCurrent && !isCompleted && (
                                                                <div className="h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin flex-shrink-0" />
                                                            )}
                                                            <p className="font-semibold text-sm truncate">
                                                                {payment.student.name} {payment.student.last_name}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-gray-600 truncate">{payment.program.name}</p>
                                                        <p className="text-sm font-bold text-gray-900 mt-1">
                                                            ${payment.amount.toLocaleString('es-CO')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Total */}
                                    <div className="pt-4 border-t-2 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-700">Total:</span>
                                            <span className="text-2xl font-bold text-amber-600">
                                                ${totalAmount.toLocaleString('es-CO')} COP
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Área de pago */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Resumen del pago actual */}
                            <Card>
                                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Pagar Matrícula {currentPaymentIndex + 1}
                                    </CardTitle>
                                    <CardDescription>
                                        {currentPayment.student.name} {currentPayment.student.last_name}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 mt-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Estudiante</p>
                                            <p className="font-semibold">
                                                {currentPayment.student.name} {currentPayment.student.last_name}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600 mb-1">Programa</p>
                                            <p className="font-semibold">{currentPayment.program.name}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white text-center">
                                        <p className="text-sm opacity-90 mb-1">Monto a Pagar</p>
                                        <p className="text-4xl font-bold">
                                            ${currentPayment.amount.toLocaleString('es-CO')}
                                        </p>
                                        <p className="text-sm opacity-90 mt-1">COP</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Widget de pago */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Método de Pago</CardTitle>
                                    <CardDescription>Paga de forma segura con tarjeta de crédito o débito</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-blue-800">
                                            <strong>💳 Cobro Automático Mensual:</strong> Al registrar tu tarjeta, se configurarán
                                            pagos automáticos mensuales para todas las matrículas.
                                        </p>
                                    </div>

                                    <div id="wompi-widget" className="flex justify-center py-8">
                                        {isProcessing ? (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Cargando pasarela de pago...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Abriendo pasarela de pago...</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Botones de acción */}
                                    {currentPaymentIndex < payments.length - 1 && (
                                        <div className="mt-6 pt-6 border-t space-y-3">
                                            <p className="text-sm text-gray-600 text-center">
                                                ¿Prefieres pagar este después?
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleSkipPayment}
                                                className="w-full"
                                            >
                                                Saltar y pagar siguiente estudiante
                                            </Button>
                                        </div>
                                    )}

                                    <div className="mt-8 pt-6 border-t">
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span>Pago seguro procesado por Wompi</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Información adicional */}
                            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-green-900 mb-2">¿Qué pasa después del pago?</h4>
                                            <ul className="text-sm text-green-800 space-y-1">
                                                <li>✓ Recibirás confirmación por email</li>
                                                <li>✓ Se activarán las matrículas pagadas</li>
                                                <li>✓ Podrás acceder al panel de estudiante</li>
                                                <li>✓ Los pagos mensuales se procesarán automáticamente</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>
                            ¿Tienes problemas con el pago?{' '}
                            <a href="mailto:soporte@academialinaje.com" className="text-amber-600 hover:underline font-medium">
                                Contáctanos
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

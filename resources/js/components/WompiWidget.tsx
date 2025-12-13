import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface WompiWidgetProps {
    publicKey: string;
    amountInCents: number;
    reference: string;
    currency?: string;
    redirectUrl: string;
    customerEmail: string;
    customerName: string;
    integritySignature?: string | null;
}

// Declarar el tipo global para WidgetCheckout
declare global {
    interface Window {
        WidgetCheckout: any;
    }
}

export default function WompiWidget({
    publicKey,
    amountInCents,
    reference,
    currency = 'COP',
    redirectUrl,
    customerEmail,
    customerName,
    integritySignature = null,
}: WompiWidgetProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const checkoutRef = useRef<any>(null);

    const validateEmail = (email: string): string => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('⚠️ Email inválido detectado:', email);
            return 'noreply@academialinaje.com';
        }
        return email;
    };

    const validEmail = validateEmail(customerEmail);

    // Cargar el script de Wompi
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.async = true;

        script.onload = () => {
            console.log('✅ Script de Wompi cargado');
            initializeWidget();
        };

        script.onerror = () => {
            console.error('❌ Error al cargar el script de Wompi');
            setIsLoading(false);
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup: remover el script cuando el componente se desmonte
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    // Inicializar el widget de Wompi
    const initializeWidget = () => {
        if (!window.WidgetCheckout) {
            console.error('❌ WidgetCheckout no está disponible');
            setIsLoading(false);
            return;
        }

        try {
            const config: any = {
                currency: currency,
                amountInCents: amountInCents,
                reference: reference,
                publicKey: publicKey,
                redirectUrl: redirectUrl,
                customerData: {
                    email: validEmail,
                    fullName: customerName,
                },
            };

            // Solo agregar signature si existe (no en modo test)
            if (integritySignature) {
                config.signature = {
                    integrity: integritySignature,
                };
            }

            console.log('🔧 Configurando widget con:', config);

            checkoutRef.current = new window.WidgetCheckout(config);
            setIsLoading(false);
            console.log('✅ Widget inicializado correctamente');
        } catch (error) {
            console.error('❌ Error al inicializar el widget:', error);
            setIsLoading(false);
        }
    };

    const handlePayment = () => {
        if (!checkoutRef.current) {
            console.error('❌ El widget no está inicializado');
            return;
        }

        setIsProcessing(true);
        console.log('🚀 Abriendo widget de Wompi...');

        try {
            checkoutRef.current.open((result: any) => {
                console.log('✅ Resultado del pago:', result);
                setIsProcessing(false);

                if (result && result.transaction && result.transaction.id) {
                    console.log('💳 ID de transacción:', result.transaction.id);
                    // El redirect se maneja automáticamente por Wompi
                }
            });
        } catch (error) {
            console.error('❌ Error al abrir el widget:', error);
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full">
            {/* Información del pago */}
            <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Pago Seguro con Wompi
                        </h3>
                        <p className="text-sm text-gray-600">
                            Selecciona tu método de pago preferido
                        </p>
                    </div>
                    <div className="pt-2">
                        <p className="text-2xl font-bold text-green-700">
                            ${(amountInCents / 100).toLocaleString('es-CO')} COP
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Referencia: {reference}
                        </p>
                    </div>
                </div>
            </div>

            {/* Botón de pago */}
            <div className="flex justify-center">
                <Button
                    onClick={handlePayment}
                    size="lg"
                    disabled={isLoading || isProcessing}
                    className="w-full max-w-md text-lg h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Cargando pasarela de pago...
                        </>
                    ) : isProcessing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <CreditCard className="mr-2 h-5 w-5" />
                            Pagar ${(amountInCents / 100).toLocaleString('es-CO')} COP
                        </>
                    )}
                </Button>
            </div>

            {/* Instrucciones */}
            <div className="mt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                                Instrucciones de pago
                            </p>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li>• Haz clic en el botón "Pagar"</li>
                                <li>• Se abrirá una ventana segura de Wompi</li>
                                <li>• Elige tu método de pago (tarjeta, PSE, Nequi, etc.)</li>
                                <li>• Completa la información requerida</li>
                                <li>• Al finalizar, recibirás confirmación de tu pago</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

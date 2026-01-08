import { useEffect, useRef } from 'react';

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

export default function WompiWidget({
    publicKey,
    amountInCents,
    reference,
    currency = 'COP',
    redirectUrl,
    customerEmail,
    customerName,
    integritySignature,
}: WompiWidgetProps) {
    const formRef = useRef<HTMLFormElement>(null);

    /**
     * Validar email con expresión regular
     */
    const validateEmail = (email: string): string => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('⚠️ Email inválido detectado:', email);
            return 'noreply@academialinaje.com';
        }
        return email;
    };

    const validEmail = validateEmail(customerEmail);

    // Detectar modo test/producción desde la public key
    const isTestMode = publicKey.startsWith('pub_test_');

    useEffect(() => {
         console.log('🔄 Datos actualizados:', {
        publicKey,
        amountInCents,
        reference,
        currency,
        redirectUrl,
        customerEmail,
        customerName,
        integritySignature,
    });
    if (!formRef.current) return;

        /**
         * Inicializar el widget embebido de Wompi
         *
         * IMPORTANTE: Según la documentación oficial de Wompi:
         *
         * 1. El widget embebido NO requiere acceptance_token como atributo data-*
         *    - El acceptance_token solo se usa en llamadas API directas (POST /transactions)
         *    - El widget maneja internamente el proceso de checkout
         *
         * 2. La firma de integridad (data-signature:integrity) es OPCIONAL en modo test
         *    - En producción (pub_prod_*) es altamente recomendada
         *    - En test (pub_test_*) puede omitirse sin problemas
         *
         * 3. Atributos obligatorios del widget:
         *    - data-render="button"
         *    - data-public-key
         *    - data-currency
         *    - data-amount-in-cents
         *    - data-reference
         *
         * Referencias:
         * - https://docs.wompi.co/en/docs/colombia/widget-checkout-web/
         * - https://docs.wompi.co/en/docs/colombia/tokens-de-aceptacion/
         */

        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';

        // Atributos obligatorios
        script.setAttribute('data-render', 'button');
        script.setAttribute('data-public-key', publicKey);
        script.setAttribute('data-currency', currency);
        script.setAttribute('data-amount-in-cents', amountInCents.toString());
        script.setAttribute('data-reference', reference);

        // Atributos opcionales pero recomendados
        script.setAttribute('data-redirect-url', redirectUrl);
        script.setAttribute('data-customer-data:email', validEmail);
        script.setAttribute('data-customer-data:full-name', customerName);

        // Firma de integridad: solo en producción
        // En modo test es opcional y puede causar problemas si no está bien configurada
        if (integritySignature && !isTestMode) {
            script.setAttribute('data-signature:integrity', integritySignature);
            console.log('🔐 Modo PRODUCCIÓN - Firma de integridad incluida');
        } else if (isTestMode) {
            console.log('🧪 Modo TEST - Sin firma de integridad (opcional en sandbox)');
        }

        formRef.current.appendChild(script);

        // Abrir automáticamente el widget después de que se renderice
        script.onload = () => {
            console.log('✅ Script de Wompi cargado exitosamente');

            // Esperar a que el botón se renderice y hacer click automático
            setTimeout(() => {
                const wompiButton = formRef.current?.querySelector('button');
                if (wompiButton) {
                    console.log('🚀 Abriendo widget de pago automáticamente...');
                    wompiButton.click();
                } else {
                    console.warn('⚠️ No se encontró el botón de Wompi');
                }
            }, 1000);
        };

        script.onerror = () => {
            console.error('❌ Error al cargar el script de Wompi');
        };

        // Cleanup: remover el script cuando el componente se desmonte
        return () => {
            const currentForm = formRef.current;
            if (currentForm) {
                const scriptElement = currentForm.querySelector('script[src="https://checkout.wompi.co/widget.js"]');
                if (scriptElement) {
                    currentForm.removeChild(scriptElement);
                }
            }
        };
    }, [publicKey, amountInCents, reference, currency, redirectUrl, validEmail, customerName, integritySignature, isTestMode]);

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
                            Haz clic en el botón de abajo para continuar
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

            {/* Botón original de Wompi usando el widget incrustado */}
            <div className="flex justify-center mb-6">
                <form ref={formRef}>
                    {/* El script de Wompi se inyecta aquí via useEffect */}
                </form>
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
                                <li>• Haz clic en el botón "Pagar con Wompi"</li>
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

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import type { FormErrors } from '@/types/matricula';
import { FileText, AlertCircle } from 'lucide-react';

export interface Step4AuthorizationsFormProps {
    isMinor: boolean;
    parentalAuthorization: boolean;
    paymentCommitment: boolean;
    errors: FormErrors;
    onParentalAuthorizationChange: (value: boolean) => void;
    onPaymentCommitmentChange: (value: boolean) => void;
}

/**
 * Paso 4: Autorizaciones y compromisos
 * Muestra autorizaciones parentales (si es menor) y compromiso de pago
 */
export function Step4AuthorizationsForm({
    isMinor,
    parentalAuthorization,
    paymentCommitment,
    errors,
    onParentalAuthorizationChange,
    onPaymentCommitmentChange
}: Step4AuthorizationsFormProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Autorizaciones y Compromisos</CardTitle>
                <CardDescription>
                    Lea y acepte las siguientes declaraciones para continuar
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Autorización Parental - Solo si es menor */}
                {isMinor && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-amber-700">
                            <FileText className="h-5 w-5" />
                            <h3 className="font-semibold">Autorización Parental</h3>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <div className="flex items-start gap-3">
                                <Checkbox
                                    id="parental_authorization"
                                    checked={parentalAuthorization}
                                    onCheckedChange={(checked) =>
                                        onParentalAuthorizationChange(checked === true)
                                    }
                                />
                                <div className="flex-1">
                                    <Label
                                        htmlFor="parental_authorization"
                                        className="cursor-pointer font-normal"
                                    >
                                        <span className="font-medium">Yo, como padre/madre/tutor legal,</span>{' '}
                                        autorizo la matrícula del/los menor(es) de edad en el programa
                                        académico musical. Declaro que la información proporcionada es
                                        verídica y me comprometo a cumplir con las normas y políticas de la
                                        institución. *
                                    </Label>
                                </div>
                            </div>
                            {errors.parental_authorization && (
                                <InputError message={errors.parental_authorization} className="mt-2" />
                            )}
                        </div>
                    </div>
                )}

                {/* Compromiso de Pago - Siempre */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-700">
                        <FileText className="h-5 w-5" />
                        <h3 className="font-semibold">Compromiso de Pago</h3>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="payment_commitment"
                                checked={paymentCommitment}
                                onCheckedChange={(checked) =>
                                    onPaymentCommitmentChange(checked === true)
                                }
                            />
                            <div className="flex-1">
                                <Label
                                    htmlFor="payment_commitment"
                                    className="cursor-pointer font-normal"
                                >
                                    <span className="font-medium">Acepto y me comprometo</span> a realizar
                                    el pago correspondiente a la matrícula y las mensualidades del programa
                                    según los términos establecidos por la institución. Entiendo que el
                                    incumplimiento de los pagos puede resultar en la suspensión del
                                    servicio educativo. *
                                </Label>
                            </div>
                        </div>
                        {errors.payment_commitment && (
                            <InputError message={errors.payment_commitment} className="mt-2" />
                        )}
                    </div>
                </div>

                {/* Mensaje informativo */}
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <AlertCircle className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                        Al completar este formulario, sus datos serán utilizados únicamente para fines
                        administrativos y académicos. La información personal será tratada de acuerdo con
                        nuestras políticas de privacidad.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import type { FormErrors, Student } from '@/types/matricula';
import { FileText } from 'lucide-react';

interface AcademicProgram {
    id: number;
    name: string;
}

export interface Step4AuthorizationsFormProps {
    isMinor: boolean;
    parentalAuthorization: boolean;
    paymentCommitment: boolean;
    errors: FormErrors;
    onParentalAuthorizationChange: (value: boolean) => void;
    onPaymentCommitmentChange: (value: boolean) => void;
    students?: Student[];
    programs?: AcademicProgram[];
    getModalityPrice?: (modality: string) => number | null;
    formatPrice?: (price: number) => string;
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
    onPaymentCommitmentChange,
    students = [],
    programs = [],
    getModalityPrice,
    formatPrice,
}: Step4AuthorizationsFormProps) {
    const getProgramName = (programId: string) =>
        programs.find((p) => p.id.toString() === programId)?.name ?? 'No seleccionado';

    const multipleStudents = students.length > 1;

    return (
        <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-b">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                        <FileText className="h-5 w-5 text-green-700 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl">Autorizaciones y Compromiso</CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base">
                    Lea y acepte los términos antes de completar la matrícula
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* Autorización Parental - Solo si es menor */}
                {isMinor && (
                    <div className="p-4 border rounded-lg space-y-3">
                        <h4 className="font-semibold">Autorización para Menores de Edad</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Por medio de la presente doy la autorización a{' '}
                            {multipleStudents ? 'mis hijos' : 'mi hijo(a)'}
                            {' '}para que{' '}
                            {multipleStudents ? 'estudien y desarrollen' : 'estudie y desarrolle'} en la
                            Academia de formación Musical y Espiritual LINAJE. Estoy de acuerdo en la
                            completa aplicación del reglamento de la academia.
                        </p>

                        {/* Lista de estudiantes a matricular */}
                        {students.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <p className="text-sm font-semibold">Estudiantes a matricular:</p>
                                {students.map((est, index) => {
                                    const price = getModalityPrice
                                        ? getModalityPrice(est.datos_musicales.modality)
                                        : null;
                                    return (
                                        <div
                                            key={index}
                                            className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded text-sm"
                                        >
                                            <p>
                                                <strong>{est.name} {est.last_name}</strong>
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Programa: {getProgramName(est.program_id)}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Modalidad: {est.datos_musicales.modality || 'No seleccionada'}
                                            </p>
                                            {price !== null && formatPrice && (
                                                <p className="text-primary font-medium">
                                                    Valor: {formatPrice(price)}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="parental_authorization"
                                checked={parentalAuthorization}
                                onCheckedChange={(checked) =>
                                    onParentalAuthorizationChange(checked === true)
                                }
                            />
                            <Label htmlFor="parental_authorization" className="text-sm font-medium cursor-pointer">
                                Acepto y autorizo como responsable legal
                            </Label>
                        </div>
                        {errors.parental_authorization && (
                            <InputError message={errors.parental_authorization} className="mt-1" />
                        )}
                    </div>
                )}

                {/* Compromiso de Pago - Siempre */}
                <div className="p-4 border rounded-lg space-y-3">
                    <h4 className="font-semibold">Compromiso de Pago</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        La Academia de formación Musical y Espiritual LINAJE, desea tener constancia del
                        compromiso de pago que hace usted como{' '}
                        {isMinor
                            ? 'padre, madre o encargado de los estudiantes menores de edad'
                            : 'estudiante inscrito'}
                        . Este compromiso se extiende desde que el estudiante es aceptado hasta que el mismo
                        termina el programa escogido o decide no continuar con sus estudios en la Academia.
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Mediante este documento usted deja constado todo lo que involucra en los Pagos de
                        Matrículas. Entiéndase que en caso de que una de las partes no cumpla con dicho
                        acuerdo, es usted quien tiene la responsabilidad final de los pagos con la Academia.
                    </p>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="payment_commitment"
                            checked={paymentCommitment}
                            onCheckedChange={(checked) =>
                                onPaymentCommitmentChange(checked === true)
                            }
                        />
                        <Label htmlFor="payment_commitment" className="text-sm font-medium cursor-pointer">
                            Acepto el compromiso de pago para{' '}
                            {isMinor ? 'todos los estudiantes' : 'la matrícula'}
                        </Label>
                    </div>
                    {errors.payment_commitment && (
                        <InputError message={errors.payment_commitment} className="mt-1" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { PersonalDataFields } from '@/components/matricula/forms/PersonalDataFields';
import type { Responsable, FormErrors } from '@/types/matricula';
import { Lock, Mail } from 'lucide-react';

export interface Step1ResponsableFormProps {
    data: Responsable;
    errors: FormErrors;
    onChange: <K extends keyof Responsable>(field: K, value: Responsable[K]) => void;
}

/**
 * Paso 1: Formulario de datos del responsable
 * Incluye datos personales, credenciales de acceso
 */
export function Step1ResponsableForm({ data, errors, onChange }: Step1ResponsableFormProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Datos del Responsable</CardTitle>
                <CardDescription>
                    Ingrese los datos de la persona responsable de la matrícula
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Datos Personales - Usando componente reutilizable */}
                <PersonalDataFields
                    namePrefix="responsable"
                    data={{
                        name: data.name,
                        last_name: data.last_name,
                        document_type: data.document_type,
                        document_number: data.document_number,
                        birth_place: data.birth_place,
                        birth_date: data.birth_date,
                        gender: data.gender,
                        email: data.email
                    }}
                    errors={{
                        name: errors['responsable.name'],
                        last_name: errors['responsable.last_name'],
                        document_type: errors['responsable.document_type'],
                        document_number: errors['responsable.document_number'],
                        birth_place: errors['responsable.birth_place'],
                        birth_date: errors['responsable.birth_date'],
                        gender: errors['responsable.gender'],
                        email: errors['responsable.email']
                    }}
                    onChange={(field, value) => onChange(field as keyof Responsable, value)}
                    includeEmail
                    emailRequired
                />

                {/* Separador */}
                <div className="border-t pt-6">
                    <div className="flex items-center gap-2 text-amber-700 mb-4">
                        <Lock className="h-5 w-5" />
                        <h3 className="font-semibold">Credenciales de Acceso</h3>
                    </div>

                    {/* Contraseña */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="responsable_password">Contraseña *</Label>
                            <Input
                                id="responsable_password"
                                type="password"
                                value={data.password}
                                onChange={(e) => onChange('password', e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                autoComplete="new-password"
                            />
                            <InputError message={errors['responsable.password']} />
                        </div>

                        <div>
                            <Label htmlFor="responsable_password_confirmation">
                                Confirmar Contraseña *
                            </Label>
                            <Input
                                id="responsable_password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => onChange('password_confirmation', e.target.value)}
                                placeholder="Repita la contraseña"
                                autoComplete="new-password"
                            />
                            <InputError message={errors['responsable.password_confirmation']} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

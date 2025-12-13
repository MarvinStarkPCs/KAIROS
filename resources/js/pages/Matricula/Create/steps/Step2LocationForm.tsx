import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ContactDataFields } from '@/components/matricula/forms/ContactDataFields';
import { DepartmentSelect } from '@/components/matricula/ui/DepartmentSelect';
import type { Responsable, FormErrors } from '@/types/matricula';
import { MapPin, Users } from 'lucide-react';

export interface Step2LocationFormProps {
    data: Responsable;
    isMinor: boolean;
    errors: FormErrors;
    onChange: <K extends keyof Responsable>(field: K, value: Responsable[K]) => void;
    onIsMinorChange: (value: boolean) => void;
}

/**
 * Paso 2: Formulario de ubicación y selección de tipo de matrícula
 * Incluye datos de contacto y la decisión si es para menor o adulto
 */
export function Step2LocationForm({
    data,
    isMinor,
    errors,
    onChange,
    onIsMinorChange
}: Step2LocationFormProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Datos de Ubicación</CardTitle>
                <CardDescription>
                    Ingrese los datos de contacto y ubicación
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Datos de Contacto - Usando componente reutilizable */}
                <div>
                    <div className="flex items-center gap-2 text-amber-700 mb-4">
                        <MapPin className="h-5 w-5" />
                        <h3 className="font-semibold">Información de Contacto</h3>
                    </div>

                    <ContactDataFields
                        namePrefix="responsable"
                        data={{
                            address: data.address,
                            neighborhood: data.neighborhood,
                            phone: data.phone,
                            mobile: data.mobile,
                            city: data.city,
                            department: data.department
                        }}
                        errors={{
                            address: errors['responsable.address'],
                            neighborhood: errors['responsable.neighborhood'],
                            phone: errors['responsable.phone'],
                            mobile: errors['responsable.mobile'],
                            city: errors['responsable.city'],
                            department: errors['responsable.department']
                        }}
                        onChange={(field, value) => onChange(field as keyof Responsable, value)}
                    >
                        {/* Custom department selector */}
                        <DepartmentSelect
                            department={data.department}
                            city={data.city}
                            onDepartmentChange={(value) => onChange('department', value)}
                            onCityChange={(value) => onChange('city', value)}
                            errors={{
                                department: errors['responsable.department'],
                                city: errors['responsable.city']
                            }}
                            namePrefix="responsable"
                        />
                    </ContactDataFields>
                </div>

                {/* Separador */}
                <div className="border-t pt-6">
                    <div className="flex items-center gap-2 text-amber-700 mb-4">
                        <Users className="h-5 w-5" />
                        <h3 className="font-semibold">Tipo de Matrícula</h3>
                    </div>

                    {/* ¿Es menor de edad? */}
                    <div className="space-y-2">
                        <Label>¿La matrícula es para un menor de edad? *</Label>
                        <RadioGroup
                            value={isMinor ? 'yes' : 'no'}
                            onValueChange={(value) => onIsMinorChange(value === 'yes')}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="is_minor_yes" />
                                <Label htmlFor="is_minor_yes" className="font-normal cursor-pointer">
                                    Sí, es para uno o más menores de edad
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="is_minor_no" />
                                <Label htmlFor="is_minor_no" className="font-normal cursor-pointer">
                                    No, la matrícula es para mí (adulto)
                                </Label>
                            </div>
                        </RadioGroup>
                        <p className="text-sm text-gray-600 mt-2">
                            {isMinor
                                ? 'Usted se registrará como padre/madre/tutor y podrá agregar uno o más estudiantes.'
                                : 'Usted se registrará como estudiante.'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

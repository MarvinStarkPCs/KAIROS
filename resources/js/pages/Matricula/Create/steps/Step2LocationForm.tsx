import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import InputError from '@/components/input-error';
import type { Responsable, FormErrors } from '@/types/matricula';
import { MapPin } from 'lucide-react';
import { COLOMBIAN_DEPARTMENTS } from '@/utils/matricula-constants';

export interface Step2LocationFormProps {
    data: Responsable;
    isMinor: boolean;
    errors: FormErrors;
    onChange: <K extends keyof Responsable>(field: K, value: Responsable[K]) => void;
    onIsMinorChange: (value: boolean) => void;
}

/**
 * Paso 2: Formulario de localización y tipo de matrícula
 */
export function Step2LocationForm({
    data,
    isMinor,
    errors,
    onChange,
    onIsMinorChange
}: Step2LocationFormProps) {
    return (
        <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                        <MapPin className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl">Datos de Localización</CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base">
                    Ingrese la dirección de residencia del responsable
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 pt-6">

                {/* Dirección + Barrio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="responsable_address">Dirección *</Label>
                        <Input
                            id="responsable_address"
                            value={data.address}
                            onChange={(e) => onChange('address', e.target.value)}
                            placeholder="Calle 123 #45-67"
                        />
                        <InputError message={errors['responsable.address']} />
                    </div>
                    <div>
                        <Label htmlFor="responsable_neighborhood">Barrio</Label>
                        <Input
                            id="responsable_neighborhood"
                            value={data.neighborhood}
                            onChange={(e) => onChange('neighborhood', e.target.value)}
                            placeholder="Nombre del barrio"
                        />
                        <InputError message={errors['responsable.neighborhood']} />
                    </div>
                </div>

                {/* Ciudad + Departamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="responsable_city">Ciudad *</Label>
                        <Input
                            id="responsable_city"
                            value={data.city}
                            onChange={(e) => onChange('city', e.target.value)}
                            placeholder="Ej: Ocaña, Cúcuta, Bogotá"
                        />
                        <InputError message={errors['responsable.city']} />
                    </div>
                    <div>
                        <Label htmlFor="responsable_department">Departamento *</Label>
                        <Select
                            value={data.department}
                            onValueChange={(value) => onChange('department', value)}
                        >
                            <SelectTrigger id="responsable_department">
                                <SelectValue placeholder="Seleccione departamento" />
                            </SelectTrigger>
                            <SelectContent>
                                {COLOMBIAN_DEPARTMENTS.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors['responsable.department']} />
                    </div>
                </div>

                {/* Celular */}
                <div>
                    <Label htmlFor="responsable_mobile">Celular *</Label>
                    <Input
                        id="responsable_mobile"
                        type="tel"
                        value={data.mobile}
                        onChange={(e) => onChange('mobile', e.target.value)}
                        placeholder="300 123 4567"
                    />
                    <InputError message={errors['responsable.mobile']} />
                </div>

                {/* ¿Es menor de edad? */}
                <div className="mt-6 pt-6 border-t">
                    <Label className="text-lg font-semibold">¿La matrícula es para un menor de edad?</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
                        Si la matrícula es para uno o más menores de edad, deberá ingresar los datos de cada
                        estudiante en el siguiente paso.
                    </p>
                    <RadioGroup
                        value={isMinor ? 'yes' : 'no'}
                        onValueChange={(value) => onIsMinorChange(value === 'yes')}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="is_minor_no" />
                            <Label htmlFor="is_minor_no" className="font-normal cursor-pointer">
                                No, soy yo quien estudiará
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="is_minor_yes" />
                            <Label htmlFor="is_minor_yes" className="font-normal cursor-pointer">
                                Sí, es para uno o más menores
                            </Label>
                        </div>
                    </RadioGroup>
                    <InputError message={errors['is_minor']} />
                </div>
            </CardContent>
        </Card>
    );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { PersonalDataFields } from '@/components/matricula/forms/PersonalDataFields';
import type { Responsable, FormErrors } from '@/types/matricula';
import { User } from 'lucide-react';

export interface Step1ResponsableFormProps {
    data: Responsable;
    errors: FormErrors;
    onChange: <K extends keyof Responsable>(field: K, value: Responsable[K]) => void;
}

/**
 * Paso 1: Formulario de datos del responsable
 * Datos personales + teléfonos
 */
export function Step1ResponsableForm({ data, errors, onChange }: Step1ResponsableFormProps) {
    return (
        <Card className="border-2 shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                        <User className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl">Datos del Responsable</CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base">
                    Ingrese los datos de la persona responsable de la matrícula
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5 pt-6">
                {/* Datos Personales */}
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

            </CardContent>
        </Card>
    );
}

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { DocumentTypeSelect } from '../DocumentTypeSelect';
import { GenderRadioGroup } from '../GenderRadioGroup';
import type { DocumentType, Gender } from '@/types/matricula';

export interface PersonalDataFieldsProps {
    namePrefix?: string;
    data: {
        name: string;
        last_name: string;
        document_type: DocumentType;
        document_number: string;
        birth_place: string;
        birth_date: string;
        gender: Gender;
        email?: string;
    };
    errors?: {
        name?: string;
        last_name?: string;
        document_type?: string;
        document_number?: string;
        birth_place?: string;
        birth_date?: string;
        gender?: string;
        email?: string;
    };
    onChange: (field: string, value: string) => void;
    includeEmail?: boolean;
    emailRequired?: boolean;
}

/**
 * Componente reutilizable para campos de datos personales
 * Usado en formulario de responsable y estudiantes
 */
export function PersonalDataFields({
    namePrefix = '',
    data,
    errors = {},
    onChange,
    includeEmail = false,
    emailRequired = false
}: PersonalDataFieldsProps) {
    const getFieldName = (field: string) => namePrefix ? `${namePrefix}.${field}` : field;

    return (
        <div className="space-y-4">
            {/* Nombres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={getFieldName('name')}>
                        Nombre(s) *
                    </Label>
                    <Input
                        id={getFieldName('name')}
                        type="text"
                        value={data.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        placeholder="Juan"
                        autoComplete="given-name"
                    />
                    {errors.name && <InputError message={errors.name} />}
                </div>

                <div>
                    <Label htmlFor={getFieldName('last_name')}>
                        Apellido(s) *
                    </Label>
                    <Input
                        id={getFieldName('last_name')}
                        type="text"
                        value={data.last_name}
                        onChange={(e) => onChange('last_name', e.target.value)}
                        placeholder="Pérez"
                        autoComplete="family-name"
                    />
                    {errors.last_name && <InputError message={errors.last_name} />}
                </div>
            </div>

            {/* Email (opcional) */}
            {includeEmail && (
                <div>
                    <Label htmlFor={getFieldName('email')}>
                        Correo Electrónico {emailRequired && '*'}
                    </Label>
                    <Input
                        id={getFieldName('email')}
                        type="email"
                        value={data.email || ''}
                        onChange={(e) => onChange('email', e.target.value)}
                        placeholder="correo@ejemplo.com"
                        autoComplete="email"
                    />
                    {errors.email && <InputError message={errors.email} />}
                </div>
            )}

            {/* Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocumentTypeSelect
                    value={data.document_type}
                    onChange={(value) => onChange('document_type', value)}
                    error={errors.document_type}
                />

                <div>
                    <Label htmlFor={getFieldName('document_number')}>
                        Número de Documento *
                    </Label>
                    <Input
                        id={getFieldName('document_number')}
                        type="text"
                        value={data.document_number}
                        onChange={(e) => onChange('document_number', e.target.value)}
                        placeholder="1234567890"
                    />
                    {errors.document_number && <InputError message={errors.document_number} />}
                </div>
            </div>

            {/* Nacimiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={getFieldName('birth_place')}>
                        Lugar de Nacimiento *
                    </Label>
                    <Input
                        id={getFieldName('birth_place')}
                        type="text"
                        value={data.birth_place}
                        onChange={(e) => onChange('birth_place', e.target.value)}
                        placeholder="Cúcuta"
                    />
                    {errors.birth_place && <InputError message={errors.birth_place} />}
                </div>

                <div>
                    <Label htmlFor={getFieldName('birth_date')}>
                        Fecha de Nacimiento *
                    </Label>
                    <Input
                        id={getFieldName('birth_date')}
                        type="date"
                        value={data.birth_date}
                        onChange={(e) => onChange('birth_date', e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                    {errors.birth_date && <InputError message={errors.birth_date} />}
                </div>
            </div>

            {/* Género */}
            <GenderRadioGroup
                value={data.gender}
                onChange={(value) => onChange('gender', value)}
                error={errors.gender}
            />
        </div>
    );
}

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';

export interface ContactDataFieldsProps {
    namePrefix?: string;
    data: {
        address: string;
        neighborhood: string;
        phone: string;
        mobile: string;
        city: string;
        department: string;
    };
    errors?: {
        address?: string;
        neighborhood?: string;
        phone?: string;
        mobile?: string;
        city?: string;
        department?: string;
    };
    onChange: (field: string, value: string) => void;
    children?: React.ReactNode; // Para permitir custom department selector
}

/**
 * Componente reutilizable para campos de datos de contacto
 */
export function ContactDataFields({
    namePrefix = '',
    data,
    errors = {},
    onChange,
    children
}: ContactDataFieldsProps) {
    const getFieldName = (field: string) => namePrefix ? `${namePrefix}.${field}` : field;

    return (
        <div className="space-y-4">
            {/* Dirección */}
            <div>
                <Label htmlFor={getFieldName('address')}>
                    Dirección *
                </Label>
                <Input
                    id={getFieldName('address')}
                    type="text"
                    value={data.address}
                    onChange={(e) => onChange('address', e.target.value)}
                    placeholder="Calle 12 # 34-56"
                    autoComplete="street-address"
                />
                {errors.address && <InputError message={errors.address} />}
            </div>

            {/* Barrio */}
            <div>
                <Label htmlFor={getFieldName('neighborhood')}>
                    Barrio *
                </Label>
                <Input
                    id={getFieldName('neighborhood')}
                    type="text"
                    value={data.neighborhood}
                    onChange={(e) => onChange('neighborhood', e.target.value)}
                    placeholder="Centro"
                />
                {errors.neighborhood && <InputError message={errors.neighborhood} />}
            </div>

            {/* Teléfonos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor={getFieldName('phone')}>
                        Teléfono Fijo *
                    </Label>
                    <Input
                        id={getFieldName('phone')}
                        type="tel"
                        value={data.phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                        placeholder="5701234"
                        autoComplete="tel-local"
                    />
                    {errors.phone && <InputError message={errors.phone} />}
                </div>

                <div>
                    <Label htmlFor={getFieldName('mobile')}>
                        Celular *
                    </Label>
                    <Input
                        id={getFieldName('mobile')}
                        type="tel"
                        value={data.mobile}
                        onChange={(e) => onChange('mobile', e.target.value)}
                        placeholder="3001234567"
                        autoComplete="tel-national"
                    />
                    {errors.mobile && <InputError message={errors.mobile} />}
                </div>
            </div>

            {/* Ubicación - Si se pasa children (department selector custom), lo usa */}
            {children || (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor={getFieldName('department')}>
                            Departamento *
                        </Label>
                        <Input
                            id={getFieldName('department')}
                            type="text"
                            value={data.department}
                            onChange={(e) => onChange('department', e.target.value)}
                            placeholder="Norte de Santander"
                        />
                        {errors.department && <InputError message={errors.department} />}
                    </div>

                    <div>
                        <Label htmlFor={getFieldName('city')}>
                            Ciudad *
                        </Label>
                        <Input
                            id={getFieldName('city')}
                            type="text"
                            value={data.city}
                            onChange={(e) => onChange('city', e.target.value)}
                            placeholder="Cúcuta"
                        />
                        {errors.city && <InputError message={errors.city} />}
                    </div>
                </div>
            )}
        </div>
    );
}

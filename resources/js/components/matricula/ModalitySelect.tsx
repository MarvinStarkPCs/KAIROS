import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { MODALITIES } from '@/types/matricula';

interface ModalitySelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
}

export function ModalitySelect({
    label = 'Modalidad',
    value,
    onChange,
    error,
    required = true,
    placeholder = 'Seleccione una modalidad'
}: ModalitySelectProps) {
    return (
        <div>
            <Label>{label} {required && '*'}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(MODALITIES)
                        .filter(([key]) => key !== '')
                        .map(([key, displayValue]) => (
                            <SelectItem key={key} value={key}>
                                {displayValue}
                            </SelectItem>
                        ))}
                </SelectContent>
            </Select>
            {error && <InputError message={error} />}
        </div>
    );
}
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { DOCUMENT_TYPES } from '@/types/matricula';

interface DocumentTypeSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
}

export function DocumentTypeSelect({
    label = 'Tipo de Documento',
    value,
    onChange,
    error,
    required = true
}: DocumentTypeSelectProps) {
    return (
        <div>
            <Label>{label} {required && '*'}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(DOCUMENT_TYPES).map(([key, displayValue]) => (
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
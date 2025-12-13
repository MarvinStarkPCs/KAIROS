import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import InputError from '@/components/input-error';
import { GENDERS } from '@/types/matricula';

interface GenderRadioGroupProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    namePrefix?: string;
}

export function GenderRadioGroup({
    label = 'Género',
    value,
    onChange,
    error,
    required = true,
    namePrefix = 'gender'
}: GenderRadioGroupProps) {
    return (
        <div>
            <Label>{label} {required && '*'}</Label>
            <RadioGroup
                value={value}
                onValueChange={onChange}
                className="flex gap-4 mt-2"
            >
                {Object.entries(GENDERS).map(([key, displayValue]) => (
                    <div key={key} className="flex items-center space-x-2">
                        <RadioGroupItem
                            value={key}
                            id={`${namePrefix}_${key}`}
                        />
                        <Label htmlFor={`${namePrefix}_${key}`}>
                            {displayValue}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
            {error && <InputError message={error} />}
        </div>
    );
}
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';

interface FormFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'email' | 'password' | 'date' | 'textarea';
    placeholder?: string;
    error?: string;
    required?: boolean;
    autoComplete?: string;
}

export function FormField({
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder,
    error,
    required = false,
    autoComplete
}: FormFieldProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    return (
        <div>
            <Label htmlFor={name}>
                {label} {required && '*'}
            </Label>
            {type === 'textarea' ? (
                <Textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                />
            ) : (
                <Input
                    id={name}
                    name={name}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                />
            )}
            {error && <InputError message={error} />}
        </div>
    );
}
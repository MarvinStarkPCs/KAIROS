import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { MODALITIES } from '@/types/matricula';
import { calculateAge, getModalityForBirthDate } from '@/utils/matricula-helpers';
import { Sparkles } from 'lucide-react';
import { useEffect } from 'react';

interface ModalitySelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    excludeBig?: boolean; // Para menores: oculta Linaje Big
    birthDate?: string;   // Si viene, la modalidad se asigna sola segun la edad
    getModalityPrice?: (modality: string) => number | null; // Para mostrar el cobro
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);

export function ModalitySelect({
    label = 'Modalidad',
    value,
    onChange,
    error,
    required = true,
    placeholder = 'Seleccione una modalidad',
    excludeBig = false,
    birthDate,
    getModalityPrice,
}: ModalitySelectProps) {
    // Con fecha de nacimiento la modalidad deja de elegirse a mano.
    const autoModality = birthDate ? getModalityForBirthDate(birthDate) : '';
    const isAutomatic = !!birthDate;

    useEffect(() => {
        if (isAutomatic && autoModality !== value) {
            onChange(autoModality);
        }
        // onChange cambia en cada render del padre, por eso no va en las dependencias.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAutomatic, autoModality, value]);

    if (isAutomatic) {
        const age = calculateAge(birthDate);
        const price = autoModality && getModalityPrice ? getModalityPrice(autoModality) : null;

        return (
            <div>
                <Label>{label}</Label>
                <div className="mt-1 rounded-lg border border-border bg-muted/40 px-4 py-3">
                    {autoModality ? (
                        <>
                            <div className="flex flex-wrap items-center gap-2">
                                <Sparkles className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                <span className="font-semibold">
                                    {MODALITIES[autoModality as keyof typeof MODALITIES]}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Asignada automáticamente según la edad ({age} años).
                            </p>
                            {price !== null && price !== undefined && (
                                <p className="mt-2 text-sm">
                                    <span className="text-muted-foreground">Valor de la matrícula: </span>
                                    <span className="font-semibold text-green-700 dark:text-green-400">
                                        {formatPrice(price)}
                                    </span>
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {age > 0
                                ? `La edad registrada (${age} años) no corresponde a ninguna modalidad.`
                                : 'Ingrese la fecha de nacimiento para asignar la modalidad.'}
                        </p>
                    )}
                </div>
                {error && <InputError message={error} />}
            </div>
        );
    }

    return (
        <div>
            <Label>{label} {required && '*'}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(MODALITIES)
                        .filter(([key]) => key !== '' && !(excludeBig && key === 'Linaje Big'))
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

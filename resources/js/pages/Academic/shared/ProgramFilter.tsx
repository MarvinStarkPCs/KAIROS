import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { ProgramOption } from './types';

interface Props {
    programs: ProgramOption[];
    value: number | null;
    onChange: (programId: number | null) => void;
    className?: string;
}

/** Selector de programa compartido por las vistas del panel académico. */
export default function ProgramFilter({
    programs,
    value,
    onChange,
    className,
}: Props) {
    return (
        <Select
            value={value ? value.toString() : 'all'}
            onValueChange={(next) =>
                onChange(next === 'all' ? null : Number(next))
            }
        >
            <SelectTrigger className={className ?? 'w-[240px]'}>
                <SelectValue placeholder="Todos los programas" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todos los programas</SelectItem>
                {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                        {program.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

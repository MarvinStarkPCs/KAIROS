import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { COLOMBIAN_DEPARTMENTS } from '@/utils/matricula-constants';

export interface DepartmentSelectProps {
    department: string;
    city: string;
    onDepartmentChange: (value: string) => void;
    onCityChange: (value: string) => void;
    errors?: {
        department?: string;
        city?: string;
    };
    namePrefix?: string;
}

/**
 * Selector de departamento y ciudad con lista de departamentos de Colombia
 */
export function DepartmentSelect({
    department,
    city,
    onDepartmentChange,
    onCityChange,
    errors = {},
    namePrefix = ''
}: DepartmentSelectProps) {
    const getDepartmentFieldName = () => namePrefix ? `${namePrefix}.department` : 'department';
    const getCityFieldName = () => namePrefix ? `${namePrefix}.city` : 'city';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Selector de Departamento */}
            <div>
                <Label htmlFor={getDepartmentFieldName()}>
                    Departamento *
                </Label>
                <Select value={department} onValueChange={onDepartmentChange}>
                    <SelectTrigger id={getDepartmentFieldName()}>
                        <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                        {COLOMBIAN_DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                                {dept}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.department && <InputError message={errors.department} />}
            </div>

            {/* Input de Ciudad */}
            <div>
                <Label htmlFor={getCityFieldName()}>
                    Ciudad *
                </Label>
                <Input
                    id={getCityFieldName()}
                    type="text"
                    value={city}
                    onChange={(e) => onCityChange(e.target.value)}
                    placeholder="Cúcuta"
                />
                {errors.city && <InputError message={errors.city} />}
            </div>
        </div>
    );
}

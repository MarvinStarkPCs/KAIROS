import { Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { FilterOption } from '../types';

interface Props {
    search: string;
    status: string;
    programId: string;
    professorId: string;
    dateFrom: string;
    dateTo: string;
    showFilters: boolean;
    hasActiveFilters: boolean;
    programs: FilterOption[];
    professors: FilterOption[];
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onProgramChange: (value: string) => void;
    onProfessorChange: (value: string) => void;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    onToggleFilters: () => void;
    onClearFilters: () => void;
}

export default function FiltersPanel({
    search,
    status,
    programId,
    professorId,
    dateFrom,
    dateTo,
    showFilters,
    hasActiveFilters,
    programs,
    professors,
    onSearchChange,
    onStatusChange,
    onProgramChange,
    onProfessorChange,
    onDateFromChange,
    onDateToChange,
    onToggleFilters,
    onClearFilters,
}: Props) {
    return (
        <div className="bg-card rounded-lg shadow-sm mb-6 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Buscar por nombre o email del estudiante..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={showFilters ? 'default' : 'outline'}
                        onClick={onToggleFilters}
                        className="flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                        {hasActiveFilters && (
                            <Badge className="bg-red-500 text-white ml-1">!</Badge>
                        )}
                    </Button>
                    {hasActiveFilters && (
                        <Button variant="ghost" onClick={onClearFilters}>
                            Limpiar
                        </Button>
                    )}
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
                        <Select value={status} onValueChange={onStatusChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los estados" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los estados</SelectItem>
                                <SelectItem value="present">Presente</SelectItem>
                                <SelectItem value="late">Tarde</SelectItem>
                                <SelectItem value="absent">Ausente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Programa</label>
                        <Select value={programId} onValueChange={onProgramChange}>
                            <SelectTrigger>
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
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Profesor</label>
                        <Select value={professorId} onValueChange={onProfessorChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los profesores" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los profesores</SelectItem>
                                {professors.map((professor) => (
                                    <SelectItem key={professor.id} value={professor.id.toString()}>
                                        {professor.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Desde</label>
                        <Input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => onDateFromChange(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Hasta</label>
                        <Input
                            type="date"
                            value={dateTo}
                            onChange={(e) => onDateToChange(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

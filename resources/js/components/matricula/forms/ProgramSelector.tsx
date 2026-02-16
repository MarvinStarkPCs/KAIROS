import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import type { AcademicProgram } from '@/types/matricula';
import { formatTimeRange } from '@/lib/format';
import { Clock, Users } from 'lucide-react';

export interface ProgramSelectorProps {
    programs: AcademicProgram[];
    selectedProgramId: string;
    selectedScheduleId: string;
    onProgramChange: (programId: string) => void;
    onScheduleChange: (scheduleId: string) => void;
    errors?: {
        program_id?: string;
        schedule_id?: string;
    };
    showScheduleAsOptional?: boolean;
}

/**
 * Componente reutilizable para seleccionar programa académico y horario
 */
export function ProgramSelector({
    programs,
    selectedProgramId,
    selectedScheduleId,
    onProgramChange,
    onScheduleChange,
    errors = {},
    showScheduleAsOptional = true
}: ProgramSelectorProps) {
    const selectedProgram = programs.find(p => p.id.toString() === selectedProgramId);
    const availableSchedules = selectedProgram?.schedules || [];

    return (
        <div className="space-y-4">
            {/* Selector de Programa */}
            <div>
                <Label>Programa Académico *</Label>
                <Select value={selectedProgramId} onValueChange={onProgramChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione un programa" />
                    </SelectTrigger>
                    <SelectContent>
                        {programs.map((program) => (
                            <SelectItem key={program.id} value={program.id.toString()}>
                                {program.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.program_id && <InputError message={errors.program_id} />}
            </div>

            {/* Descripción del programa */}
            {selectedProgram && (
                <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                    <p>{selectedProgram.description}</p>
                </div>
            )}

            {/* Selector de Horario */}
            {selectedProgramId && availableSchedules.length > 0 && (
                <div>
                    <Label>
                        Horario {showScheduleAsOptional && '(Opcional)'}
                        {!showScheduleAsOptional && ' *'}
                    </Label>
                    <Select
                        value={selectedScheduleId}
                        onValueChange={onScheduleChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccione un horario" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableSchedules.map((schedule) => (
                                <SelectItem
                                    key={schedule.id}
                                    value={schedule.id.toString()}
                                    disabled={!schedule.has_capacity}
                                >
                                    <div className="flex items-center justify-between gap-4 w-full">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{schedule.days_of_week}</span>
                                            <span className="text-muted-foreground">
                                                {formatTimeRange(schedule.start_time, schedule.end_time)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                {schedule.enrolled_count}/{schedule.max_students}
                                            </span>
                                            {schedule.has_capacity ? (
                                                <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                                                    Disponible
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                                                    Lleno
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.schedule_id && <InputError message={errors.schedule_id} />}

                    {/* Info del profesor */}
                    {selectedScheduleId && (
                        <p className="text-sm text-muted-foreground mt-2">
                            Profesor: {availableSchedules.find(s => s.id.toString() === selectedScheduleId)?.professor.name}
                        </p>
                    )}
                </div>
            )}

            {/* Mensaje si no hay horarios */}
            {selectedProgramId && availableSchedules.length === 0 && (
                <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md">
                    No hay horarios disponibles para este programa actualmente.
                </div>
            )}
        </div>
    );
}

import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Enrollment, SelectedProgram, ProgramPayment } from '../types';

interface Props {
    enrollments: Enrollment[];
    selectedProgramId: number | null;
    selectedProgram: SelectedProgram | null;
    programPayments: ProgramPayment[];
    onProgramChange: (programId: string) => void;
    onOpenPayments: () => void;
}

export default function GradesHeader({
    enrollments,
    selectedProgramId,
    selectedProgram,
    programPayments,
    onProgramChange,
    onOpenPayments,
}: Props) {
    const pendingCount = programPayments.filter(
        (p) => p.status === 'pending' || p.status === 'overdue',
    ).length;

    return (
        <div className="flex flex-col gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mis Calificaciones</h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                    Revisa tu progreso y calificaciones por programa
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="w-full sm:w-64">
                    <Select
                        value={selectedProgramId?.toString() || ''}
                        onValueChange={onProgramChange}
                    >
                        <SelectTrigger className="text-sm sm:text-base">
                            <SelectValue placeholder="Selecciona un programa" />
                        </SelectTrigger>
                        <SelectContent>
                            {enrollments.map((enrollment) => (
                                <SelectItem
                                    key={enrollment.program_id}
                                    value={enrollment.program_id.toString()}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: enrollment.program_color }}
                                        />
                                        <span className="truncate">{enrollment.program_name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedProgram && (
                    <Button
                        variant="outline"
                        onClick={onOpenPayments}
                        className="flex items-center gap-2"
                    >
                        <CreditCard className="h-4 w-4" />
                        Ver Pagos
                        {pendingCount > 0 && (
                            <span className="ml-1 rounded-full bg-orange-500 text-white text-xs px-1.5 py-0.5 leading-none">
                                {pendingCount}
                            </span>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}

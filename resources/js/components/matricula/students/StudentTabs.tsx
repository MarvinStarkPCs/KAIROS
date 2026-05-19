import { Button } from '@/components/ui/button';
import { Trash2, Check, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Student } from '@/types/matricula';

export interface StudentTabsProps {
    students: Student[];
    currentIndex: number;
    onTabChange: (index: number) => void;
    onAddStudent: () => void;
    onRemoveStudent: (index: number) => void;
    validateStudent: (student: Student) => boolean;
    maxStudents?: number;
    programs?: { id: number; name: string }[];
}

/**
 * Componente de tabs para navegar entre estudiantes
 * Diseño original: tarjetas con borde, nombre y programa visible
 */
export function StudentTabs({
    students,
    currentIndex,
    onTabChange,
    onAddStudent,
    onRemoveStudent,
    validateStudent,
    maxStudents = 10,
    programs = [],
}: StudentTabsProps) {
    const canAddMore = students.length < maxStudents;

    const getProgramName = (programId: string) =>
        programs.find((p) => p.id.toString() === programId)?.name ?? null;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {students.length === 1 ? '1 Estudiante' : `${students.length} Estudiantes`}
                </h3>
                {canAddMore && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAddStudent}
                        className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                    >
                        <Plus className="h-4 w-4" />
                        Agregar Hijo/a
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {students.map((student, index) => {
                    const isComplete = validateStudent(student);
                    const isCurrent = currentIndex === index;
                    const programName = getProgramName(student.program_id);

                    return (
                        <div
                            key={index}
                            className={cn(
                                'relative flex items-center gap-2 rounded-lg border-2 transition-all',
                                isCurrent
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 shadow-md'
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-card hover:border-gray-300 dark:hover:border-gray-600'
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => onTabChange(index)}
                                className="flex items-center gap-2 px-4 py-2 flex-1"
                            >
                                <div
                                    className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0',
                                        isCurrent
                                            ? 'bg-amber-600 text-white'
                                            : isComplete
                                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    )}
                                >
                                    {isComplete && !isCurrent ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <User className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <p
                                        className={cn(
                                            'text-sm font-medium',
                                            isCurrent
                                                ? 'text-amber-900 dark:text-amber-100'
                                                : 'text-gray-700 dark:text-gray-300'
                                        )}
                                    >
                                        {student.name || `Estudiante ${index + 1}`}
                                    </p>
                                    {programName && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {programName}
                                        </p>
                                    )}
                                </div>
                            </button>

                            {students.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveStudent(index)}
                                    className="h-full px-3 border-l-2 border-gray-200 dark:border-gray-700 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors rounded-r-lg"
                                    title="Eliminar estudiante"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Student } from '@/types/matricula';
import { formatStudentName } from '@/utils/matricula-helpers';

export interface StudentTabsProps {
    students: Student[];
    currentIndex: number;
    onTabChange: (index: number) => void;
    onAddStudent: () => void;
    onRemoveStudent: (index: number) => void;
    validateStudent: (student: Student) => boolean;
    maxStudents?: number;
}

/**
 * Componente de tabs para navegar entre estudiantes
 * Muestra el estado de validación de cada estudiante
 */
export function StudentTabs({
    students,
    currentIndex,
    onTabChange,
    onAddStudent,
    onRemoveStudent,
    validateStudent,
    maxStudents = 10
}: StudentTabsProps) {
    const canAddMore = students.length < maxStudents;

    return (
        <div className="space-y-4">
            {/* Tabs de estudiantes */}
            <div className="flex flex-wrap gap-2">
                {students.map((student, index) => {
                    const isValid = validateStudent(student);
                    const isActive = index === currentIndex;
                    const name = student.name || `Estudiante ${index + 1}`;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "relative group",
                                isActive && "ring-2 ring-amber-500 rounded-lg"
                            )}
                        >
                            <button
                                onClick={() => onTabChange(index)}
                                className={cn(
                                    "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
                                    isActive
                                        ? "bg-amber-500 text-white"
                                        : "bg-muted text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <span className="truncate max-w-[120px]">{name}</span>
                                {isValid ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                )}
                            </button>

                            {/* Botón de eliminar (solo si hay más de 1) */}
                            {students.length > 1 && (
                                <button
                                    onClick={() => onRemoveStudent(index)}
                                    className={cn(
                                        "absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1",
                                        "opacity-0 group-hover:opacity-100 transition-opacity",
                                        "hover:bg-red-600"
                                    )}
                                    aria-label={`Eliminar ${name}`}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Botón agregar estudiante */}
                {canAddMore && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onAddStudent}
                        className="border-dashed border-2 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Agregar Estudiante
                    </Button>
                )}
            </div>

            {/* Contador y límite */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>
                    Estudiante {currentIndex + 1} de {students.length}
                </p>
                <p>
                    Máximo: {maxStudents} estudiantes
                </p>
            </div>

            {/* Resumen de validación */}
            <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">
                        {students.filter(validateStudent).length} completos
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-muted-foreground">
                        {students.filter(s => !validateStudent(s)).length} incompletos
                    </span>
                </div>
            </div>
        </div>
    );
}

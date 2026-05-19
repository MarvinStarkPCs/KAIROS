import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Student } from '../types';

interface Props {
    students: Student[];
    onViewStudent: (student: Student) => void;
}

export default function StudentsTab({ students, onViewStudent }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Lista de Estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
                {students.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No hay estudiantes inscritos en este grupo
                    </div>
                ) : (
                    <div className="space-y-3">
                        {students.map((student) => (
                            <div
                                key={student.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted cursor-pointer"
                                onClick={() => onViewStudent(student)}
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h4 className="font-semibold text-foreground">{student.name}</h4>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            {student.document_number && (
                                                <span className="font-medium text-muted-foreground">
                                                    {student.document_type}: {student.document_number}
                                                </span>
                                            )}
                                            <span>{student.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                            {student.progress_stats.progress_percentage}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">Avance</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                            {student.progress_stats.average_grade}%
                                        </div>
                                        <div className="text-xs text-muted-foreground">Promedio</div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

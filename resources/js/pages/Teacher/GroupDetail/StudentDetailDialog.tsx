import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { getStatusIcon, getStatusBadge, formatDate } from './helpers';
import type { Student, ClassDate } from './types';

interface Props {
    student: Student | null;
    pastDates: ClassDate[];
    onClose: () => void;
}

export default function StudentDetailDialog({ student, pastDates, onClose }: Props) {
    return (
        <Dialog open={!!student} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{student?.name}</DialogTitle>
                    <DialogDescription>
                        {student?.document_number && (
                            <span className="font-medium text-muted-foreground mr-3">
                                {student.document_type}: {student.document_number}
                            </span>
                        )}
                        {student?.email}
                    </DialogDescription>
                </DialogHeader>

                {student && (
                    <div className="space-y-6">
                        {/* Attendance summary */}
                        <div>
                            <h4 className="font-semibold mb-3">Resumen de Asistencia</h4>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{student.attendance_stats.present}</div>
                                    <div className="text-xs text-green-700 dark:text-green-300">Presente</div>
                                </div>
                                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">{student.attendance_stats.late}</div>
                                    <div className="text-xs text-yellow-700 dark:text-yellow-300">Tarde</div>
                                </div>
                                <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">{student.attendance_stats.absent}</div>
                                    <div className="text-xs text-red-700 dark:text-red-300">Ausente</div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance history */}
                        <div>
                            <h4 className="font-semibold mb-3">Historial de Asistencias</h4>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {pastDates.map((classDate) => {
                                    const attendance = student.attendance_by_date[classDate.date];
                                    return (
                                        <div key={classDate.date} className="p-3 border rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {getStatusIcon(attendance?.status || '')}
                                                    <div>
                                                        <div className="font-medium">{classDate.day_name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatDate(classDate.date)}
                                                        </div>
                                                    </div>
                                                </div>
                                                {getStatusBadge(attendance?.status || '')}
                                            </div>
                                            {attendance?.notes && (
                                                <div className="mt-2 ml-7 text-sm text-muted-foreground bg-muted rounded p-2">
                                                    <span className="font-medium">Nota: </span>
                                                    {attendance.notes}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Academic progress */}
                        <div>
                            <h4 className="font-semibold mb-3">Avance Académico</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                    <div className="text-sm text-blue-600">Progreso</div>
                                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                                        {student.progress_stats.progress_percentage}%
                                    </div>
                                    <div className="text-xs text-blue-600">
                                        {student.progress_stats.evaluated_activities} de {student.progress_stats.total_activities} actividades
                                    </div>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                    <div className="text-sm text-green-600">Promedio</div>
                                    <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                                        {student.progress_stats.average_grade}%
                                    </div>
                                    <div className="text-xs text-green-600">Calificación general</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

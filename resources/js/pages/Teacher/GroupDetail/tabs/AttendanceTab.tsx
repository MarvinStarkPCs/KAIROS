import { Calendar, CheckCircle, AlertCircle, XCircle, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { formatDate } from '../helpers';
import type { Student, ClassDate } from '../types';

interface Props {
    students: Student[];
    pastDates: ClassDate[];
    futureDates: ClassDate[];
    selectedDate: string | null;
    selectedStudents: Record<number, string>;
    studentNotes: Record<number, string>;
    onSelectDate: (date: string) => void;
    onAttendanceChange: (studentId: number, status: string) => void;
    onNotesChange: (studentId: number, notes: string) => void;
    onSubmit: () => void;
    onViewStudent: (student: Student) => void;
}

export default function AttendanceTab({
    students,
    pastDates,
    futureDates,
    selectedDate,
    selectedStudents,
    studentNotes,
    onSelectDate,
    onAttendanceChange,
    onNotesChange,
    onSubmit,
    onViewStudent,
}: Props) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Date list */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="text-lg">Fechas de Clase</CardTitle>
                    <CardDescription>Selecciona una fecha para marcar asistencia</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto">
                    {pastDates.length === 0 && futureDates.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No hay fechas de clase configuradas
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {pastDates.map((classDate) => (
                                <div
                                    key={classDate.date}
                                    onClick={() => onSelectDate(classDate.date)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                        selectedDate === classDate.date
                                            ? 'border-[#7a9b3c] bg-[#7a9b3c]/10'
                                            : 'hover:bg-muted'
                                    } ${classDate.is_today ? 'border-blue-500 border-2' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium flex items-center gap-2">
                                                {classDate.day_name}
                                                {classDate.is_today && (
                                                    <Badge className="bg-blue-500 text-xs">Hoy</Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {formatDate(classDate.date)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {classDate.marked_count > 0 ? (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <span className="text-green-600">{classDate.present_count}P</span>
                                                    <span className="text-yellow-600">{classDate.late_count}T</span>
                                                    <span className="text-red-600">{classDate.absent_count}A</span>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-xs">Sin marcar</Badge>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                {classDate.marked_count}/{classDate.total_students}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {futureDates.length > 0 && (
                                <>
                                    <div className="text-xs text-muted-foreground uppercase mt-4 mb-2">
                                        Próximas clases
                                    </div>
                                    {futureDates.map((classDate) => (
                                        <div
                                            key={classDate.date}
                                            className="p-3 rounded-lg border bg-muted opacity-60"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">{classDate.day_name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatDate(classDate.date)}
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs">Próxima</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Attendance form */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg">
                        {selectedDate ? `Asistencia - ${formatDate(selectedDate)}` : 'Marcar Asistencia'}
                    </CardTitle>
                    <CardDescription>
                        {selectedDate
                            ? 'Marca la asistencia de cada estudiante'
                            : 'Selecciona una fecha de la lista para marcar asistencia'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!selectedDate ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Selecciona una fecha de clase para marcar asistencia</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No hay estudiantes inscritos
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                                {students.map((student) => {
                                    const currentStatus = selectedStudents[student.id] || student.attendance_by_date[selectedDate]?.status;
                                    const currentNotes = studentNotes[student.id] ?? student.attendance_by_date[selectedDate]?.notes ?? '';
                                    const showNotesField = currentStatus === 'late' || currentStatus === 'absent';

                                    return (
                                        <div key={student.id} className="p-3 border rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onViewStudent(student)}
                                                        className="p-1"
                                                    >
                                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                                    </Button>
                                                    <div>
                                                        <h4 className="font-medium text-foreground">{student.name}</h4>
                                                        {student.document_number && (
                                                            <span className="text-xs font-medium text-muted-foreground">
                                                                {student.document_type}: {student.document_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant={currentStatus === 'present' ? 'default' : 'outline'}
                                                        onClick={() => onAttendanceChange(student.id, 'present')}
                                                        className={`px-2 ${currentStatus === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                        title="Presente"
                                                    >
                                                        <Icon iconNode={CheckCircle} className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={currentStatus === 'late' ? 'default' : 'outline'}
                                                        onClick={() => onAttendanceChange(student.id, 'late')}
                                                        className={`px-2 ${currentStatus === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                                                        title="Tarde"
                                                    >
                                                        <Icon iconNode={AlertCircle} className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={currentStatus === 'absent' ? 'default' : 'outline'}
                                                        onClick={() => onAttendanceChange(student.id, 'absent')}
                                                        className={`px-2 ${currentStatus === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                                                        title="Ausente"
                                                    >
                                                        <Icon iconNode={XCircle} className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {showNotesField && (
                                                <div className="mt-2 ml-10">
                                                    <input
                                                        type="text"
                                                        placeholder={
                                                            currentStatus === 'late'
                                                                ? 'Justificación de tardanza (ej: tráfico, cita médica...)'
                                                                : 'Razón de la ausencia...'
                                                        }
                                                        value={currentNotes}
                                                        onChange={(e) => onNotesChange(student.id, e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a9b3c] focus:border-transparent"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <Button
                                onClick={onSubmit}
                                className="w-full bg-[#7a9b3c] hover:bg-[#6a8a2c]"
                                disabled={Object.keys(selectedStudents).length === 0}
                            >
                                Guardar Asistencia
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Users,
    Clock,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    GraduationCap,
    ChevronRight,
    Eye,
    ClipboardCheck
} from 'lucide-react';
import { Icon } from '@/components/icon';
import { useState } from 'react';

interface Program {
    id: number;
    name: string;
    color: string;
}

interface Schedule {
    id: number;
    program: Program;
    days_of_week: string;
    start_time: string;
    end_time: string;
    location: string;
    start_date: string;
    end_date: string;
}

interface AttendanceStats {
    total: number;
    marked: number;
    present: number;
    late: number;
    absent: number;
    percentage: number;
}

interface ProgressStats {
    evaluated_activities: number;
    total_activities: number;
    progress_percentage: number;
    average_grade: number;
}

interface AttendanceRecord {
    status: string;
    notes: string | null;
}

interface Student {
    id: number;
    name: string;
    email: string;
    enrollment_date: string;
    attendance_stats: AttendanceStats;
    progress_stats: ProgressStats;
    attendance_by_date: Record<string, AttendanceRecord>;
}

interface EvaluationCriteria {
    id: number;
    name: string;
    description: string;
    max_points: number;
    order: number;
}

interface Activity {
    id: number;
    name: string;
    description: string;
    weight: number;
    order: number;
    status: string;
    study_plan: {
        module_name: string;
    };
    evaluation_criteria: EvaluationCriteria[];
}

interface ClassDate {
    date: string;
    day_name: string;
    is_past: boolean;
    is_today: boolean;
    total_students: number;
    marked_count: number;
    present_count: number;
    late_count: number;
    absent_count: number;
}

interface Props {
    schedule: Schedule;
    students: Student[];
    activities: Activity[];
    classDates: ClassDate[];
}

export default function GroupDetail({ schedule, students, activities, classDates }: Props) {
    const [selectedStudents, setSelectedStudents] = useState<Record<number, string>>({});
    const [studentNotes, setStudentNotes] = useState<Record<number, string>>({});
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showStudentDetail, setShowStudentDetail] = useState<Student | null>(null);

    // Inicializar asistencias cuando se selecciona una fecha
    const handleSelectDate = (date: string) => {
        setSelectedDate(date);
        // Cargar asistencias existentes para esta fecha
        const existingAttendances: Record<number, string> = {};
        const existingNotes: Record<number, string> = {};
        students.forEach(student => {
            if (student.attendance_by_date[date]) {
                existingAttendances[student.id] = student.attendance_by_date[date].status;
                existingNotes[student.id] = student.attendance_by_date[date].notes || '';
            }
        });
        setSelectedStudents(existingAttendances);
        setStudentNotes(existingNotes);
    };

    const handleAttendanceChange = (studentId: number, status: string) => {
        setSelectedStudents(prev => ({
            ...prev,
            [studentId]: status
        }));
        // Limpiar notas si cambia a presente
        if (status === 'present') {
            setStudentNotes(prev => ({
                ...prev,
                [studentId]: ''
            }));
        }
    };

    const handleNotesChange = (studentId: number, notes: string) => {
        setStudentNotes(prev => ({
            ...prev,
            [studentId]: notes
        }));
    };

    const handleSubmitAttendance = () => {
        if (!selectedDate) return;

        const attendances = Object.entries(selectedStudents).map(([studentId, status]) => ({
            student_id: parseInt(studentId),
            status: status,
            notes: studentNotes[parseInt(studentId)] || ''
        }));

        if (attendances.length === 0) {
            alert('Debes marcar al menos un estudiante');
            return;
        }

        router.post(`/profesor/grupo/${schedule.id}/asistencia`, {
            class_date: selectedDate,
            attendances: attendances
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'late':
                return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'absent':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
                return <Badge className="bg-green-500">Presente</Badge>;
            case 'late':
                return <Badge className="bg-yellow-500">Tarde</Badge>;
            case 'absent':
                return <Badge variant="destructive">Ausente</Badge>;
            default:
                return <Badge variant="outline">Sin marcar</Badge>;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Separar fechas pasadas y futuras
    const pastDates = classDates.filter(d => d.is_past || d.is_today);
    const futureDates = classDates.filter(d => !d.is_past && !d.is_today);

    return (
        <AppLayout
            variant="sidebar"
            title={`${schedule.program.name} - Portal Profesor`}
        >
            <Head title={`${schedule.program.name} - Portal Profesor`} />

            <div className="px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {schedule.program.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                <Badge
                                    style={{ backgroundColor: schedule.program.color }}
                                    className="text-white"
                                >
                                    {schedule.days_of_week}
                                </Badge>
                                <span className="flex items-center">
                                    <Icon iconNode={Clock} className="w-4 h-4 mr-1" />
                                    {schedule.start_time} - {schedule.end_time}
                                </span>
                                {schedule.location && (
                                    <span className="flex items-center">
                                        <Icon iconNode={MapPin} className="w-4 h-4 mr-1" />
                                        {schedule.location}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Link href="/profesor/mis-grupos">
                            <Button variant="outline">Volver</Button>
                        </Link>
                    </div>
                </div>

                <Tabs defaultValue="attendance" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="attendance">
                            <Icon iconNode={ClipboardCheck} className="w-4 h-4 mr-2" />
                            Asistencia
                        </TabsTrigger>
                        <TabsTrigger value="students">
                            <Icon iconNode={Users} className="w-4 h-4 mr-2" />
                            Estudiantes ({students.length})
                        </TabsTrigger>
                        <TabsTrigger value="activities">
                            <Icon iconNode={GraduationCap} className="w-4 h-4 mr-2" />
                            Actividades ({activities.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Attendance by Date */}
                    <TabsContent value="attendance">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Lista de fechas */}
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle className="text-lg">Fechas de Clase</CardTitle>
                                    <CardDescription>
                                        Selecciona una fecha para marcar asistencia
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="max-h-[500px] overflow-y-auto">
                                    {pastDates.length === 0 && futureDates.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No hay fechas de clase configuradas
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {pastDates.map((classDate) => (
                                                <div
                                                    key={classDate.date}
                                                    onClick={() => handleSelectDate(classDate.date)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                                        selectedDate === classDate.date
                                                            ? 'border-[#7a9b3c] bg-[#7a9b3c]/10'
                                                            : 'hover:bg-gray-50'
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
                                                            <div className="text-sm text-gray-500">
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
                                                                <Badge variant="outline" className="text-xs">
                                                                    Sin marcar
                                                                </Badge>
                                                            )}
                                                            <div className="text-xs text-gray-400">
                                                                {classDate.marked_count}/{classDate.total_students}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {futureDates.length > 0 && (
                                                <>
                                                    <div className="text-xs text-gray-400 uppercase mt-4 mb-2">
                                                        Próximas clases
                                                    </div>
                                                    {futureDates.map((classDate) => (
                                                        <div
                                                            key={classDate.date}
                                                            className="p-3 rounded-lg border bg-gray-50 opacity-60"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-medium">{classDate.day_name}</div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {formatDate(classDate.date)}
                                                                    </div>
                                                                </div>
                                                                <Badge variant="outline" className="text-xs">
                                                                    Próxima
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Formulario de asistencia */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        {selectedDate
                                            ? `Asistencia - ${formatDate(selectedDate)}`
                                            : 'Marcar Asistencia'
                                        }
                                    </CardTitle>
                                    <CardDescription>
                                        {selectedDate
                                            ? 'Marca la asistencia de cada estudiante'
                                            : 'Selecciona una fecha de la lista para marcar asistencia'
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!selectedDate ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>Selecciona una fecha de clase para marcar asistencia</p>
                                        </div>
                                    ) : students.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
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
                                                        <div
                                                            key={student.id}
                                                            className="p-3 border rounded-lg"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setShowStudentDetail(student)}
                                                                        className="p-1"
                                                                    >
                                                                        <Eye className="w-4 h-4 text-gray-400" />
                                                                    </Button>
                                                                    <div>
                                                                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                                                                        <p className="text-xs text-gray-500">{student.email}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        variant={currentStatus === 'present' ? 'default' : 'outline'}
                                                                        onClick={() => handleAttendanceChange(student.id, 'present')}
                                                                        className={`px-2 ${currentStatus === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                                                        title="Presente"
                                                                    >
                                                                        <Icon iconNode={CheckCircle} className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant={currentStatus === 'late' ? 'default' : 'outline'}
                                                                        onClick={() => handleAttendanceChange(student.id, 'late')}
                                                                        className={`px-2 ${currentStatus === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                                                                        title="Tarde"
                                                                    >
                                                                        <Icon iconNode={AlertCircle} className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant={currentStatus === 'absent' ? 'default' : 'outline'}
                                                                        onClick={() => handleAttendanceChange(student.id, 'absent')}
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
                                                                                ? "Justificación de tardanza (ej: tráfico, cita médica...)"
                                                                                : "Razón de la ausencia..."
                                                                        }
                                                                        value={currentNotes}
                                                                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a9b3c] focus:border-transparent"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <Button
                                                onClick={handleSubmitAttendance}
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
                    </TabsContent>

                    {/* Tab: Students List */}
                    <TabsContent value="students">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lista de Estudiantes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {students.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay estudiantes inscritos en este grupo
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {students.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                                onClick={() => setShowStudentDetail(student)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                                        <p className="text-sm text-gray-600">{student.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-green-700">
                                                            {student.progress_stats.progress_percentage}%
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Avance
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-700">
                                                            {student.progress_stats.average_grade}%
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            Promedio
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Activities */}
                    <TabsContent value="activities">
                        <Card>
                            <CardHeader>
                                <CardTitle>Actividades para Evaluar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {activities.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay actividades configuradas para este programa
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {activities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="p-4 border rounded-lg hover:bg-gray-50"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Badge variant="outline">{activity.study_plan.module_name}</Badge>
                                                            <Badge variant="secondary">Peso: {activity.weight}%</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Criterios de Evaluación:</h5>
                                                    <ul className="space-y-1">
                                                        {activity.evaluation_criteria.map((criteria) => (
                                                            <li key={criteria.id} className="text-sm text-gray-600 flex items-center">
                                                                <span className="w-2 h-2 bg-[#7a9b3c] rounded-full mr-2"></span>
                                                                {criteria.name} ({criteria.max_points} puntos)
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <Link href={`/profesor/grupo/${schedule.id}/actividad/${activity.id}/evaluar`}>
                                                    <Button className="w-full bg-[#7a9b3c] hover:bg-[#6a8a2c]">
                                                        Evaluar Estudiantes
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de detalle del estudiante */}
            <Dialog open={!!showStudentDetail} onOpenChange={() => setShowStudentDetail(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{showStudentDetail?.name}</DialogTitle>
                        <DialogDescription>{showStudentDetail?.email}</DialogDescription>
                    </DialogHeader>
                    {showStudentDetail && (
                        <div className="space-y-6">
                            {/* Resumen de asistencia */}
                            <div>
                                <h4 className="font-semibold mb-3">Resumen de Asistencia</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{showStudentDetail.attendance_stats.present}</div>
                                        <div className="text-xs text-green-700">Presente</div>
                                    </div>
                                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-600">{showStudentDetail.attendance_stats.late}</div>
                                        <div className="text-xs text-yellow-700">Tarde</div>
                                    </div>
                                    <div className="text-center p-3 bg-red-50 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">{showStudentDetail.attendance_stats.absent}</div>
                                        <div className="text-xs text-red-700">Ausente</div>
                                    </div>
                                </div>
                            </div>

                            {/* Historial de asistencias */}
                            <div>
                                <h4 className="font-semibold mb-3">Historial de Asistencias</h4>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {pastDates.map((classDate) => {
                                        const attendance = showStudentDetail.attendance_by_date[classDate.date];
                                        return (
                                            <div
                                                key={classDate.date}
                                                className="p-3 border rounded-lg"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {getStatusIcon(attendance?.status || '')}
                                                        <div>
                                                            <div className="font-medium">{classDate.day_name}</div>
                                                            <div className="text-sm text-gray-500">{formatDate(classDate.date)}</div>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(attendance?.status || '')}
                                                </div>
                                                {attendance?.notes && (
                                                    <div className="mt-2 ml-7 text-sm text-gray-600 bg-gray-50 rounded p-2">
                                                        <span className="font-medium">Nota: </span>
                                                        {attendance.notes}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Avance académico */}
                            <div>
                                <h4 className="font-semibold mb-3">Avance Académico</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-sm text-blue-600">Progreso</div>
                                        <div className="text-3xl font-bold text-blue-700">
                                            {showStudentDetail.progress_stats.progress_percentage}%
                                        </div>
                                        <div className="text-xs text-blue-600">
                                            {showStudentDetail.progress_stats.evaluated_activities} de {showStudentDetail.progress_stats.total_activities} actividades
                                        </div>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="text-sm text-green-600">Promedio</div>
                                        <div className="text-3xl font-bold text-green-700">
                                            {showStudentDetail.progress_stats.average_grade}%
                                        </div>
                                        <div className="text-xs text-green-600">
                                            Calificación general
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

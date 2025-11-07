import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users,
    Clock,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    GraduationCap
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
    day_of_week: string;
    start_time: string;
    end_time: string;
    location: string;
    start_date: string;
    end_date: string;
}

interface AttendanceStats {
    total: number;
    present: number;
    late: number;
    absent: number;
    percentage: number;
}

interface Student {
    id: number;
    name: string;
    email: string;
    enrollment_date: string;
    attendance_stats: AttendanceStats;
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

interface Props {
    schedule: Schedule;
    students: Student[];
    activities: Activity[];
}

const dayNames: Record<string, string> = {
    'monday': 'Lunes',
    'tuesday': 'Martes',
    'wednesday': 'Miércoles',
    'thursday': 'Jueves',
    'friday': 'Viernes',
    'saturday': 'Sábado',
    'sunday': 'Domingo',
};

export default function GroupDetail({ schedule, students, activities }: Props) {
    const [selectedStudents, setSelectedStudents] = useState<Record<number, string>>({});
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    const handleAttendanceChange = (studentId: number, status: string) => {
        setSelectedStudents(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSubmitAttendance = () => {
        const attendances = Object.entries(selectedStudents).map(([studentId, status]) => ({
            student_id: parseInt(studentId),
            status: status,
            notes: ''
        }));

        if (attendances.length === 0) {
            alert('Debes marcar al menos un estudiante');
            return;
        }

        router.post(`/profesor/grupo/${schedule.id}/asistencia`, {
            class_date: attendanceDate,
            attendances: attendances
        });
    };

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
                            <div className="flex items-center gap-4 text-gray-600">
                                <Badge
                                    style={{ backgroundColor: schedule.program.color }}
                                    className="text-white"
                                >
                                    {dayNames[schedule.day_of_week] || schedule.day_of_week}
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

                <Tabs defaultValue="students" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="students">
                            <Icon iconNode={Users} className="w-4 h-4 mr-2" />
                            Estudiantes ({students.length})
                        </TabsTrigger>
                        <TabsTrigger value="attendance">
                            <Icon iconNode={CheckCircle} className="w-4 h-4 mr-2" />
                            Marcar Asistencia
                        </TabsTrigger>
                        <TabsTrigger value="activities">
                            <Icon iconNode={GraduationCap} className="w-4 h-4 mr-2" />
                            Actividades ({activities.length})
                        </TabsTrigger>
                    </TabsList>

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
                                    <div className="space-y-4">
                                        {students.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                            >
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                                    <p className="text-sm text-gray-600">{student.email}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Inscrito: {new Date(student.enrollment_date).toLocaleDateString('es-ES')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {student.attendance_stats.percentage}%
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        {student.attendance_stats.present}P / {student.attendance_stats.late}T / {student.attendance_stats.absent}A
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        de {student.attendance_stats.total} clases
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Mark Attendance */}
                    <TabsContent value="attendance">
                        <Card>
                            <CardHeader>
                                <CardTitle>Marcar Asistencia del Día</CardTitle>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Clase
                                    </label>
                                    <input
                                        type="date"
                                        value={attendanceDate}
                                        onChange={(e) => setAttendanceDate(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a9b3c]"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                {students.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay estudiantes para marcar asistencia
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4 mb-6">
                                            {students.map((student) => (
                                                <div
                                                    key={student.id}
                                                    className="flex items-center justify-between p-4 border rounded-lg"
                                                >
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{student.name}</h4>
                                                        <p className="text-sm text-gray-600">{student.email}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant={selectedStudents[student.id] === 'present' ? 'default' : 'outline'}
                                                            onClick={() => handleAttendanceChange(student.id, 'present')}
                                                            className={selectedStudents[student.id] === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                        >
                                                            <Icon iconNode={CheckCircle} className="w-4 h-4 mr-1" />
                                                            Presente
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={selectedStudents[student.id] === 'late' ? 'default' : 'outline'}
                                                            onClick={() => handleAttendanceChange(student.id, 'late')}
                                                            className={selectedStudents[student.id] === 'late' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                                                        >
                                                            <Icon iconNode={AlertCircle} className="w-4 h-4 mr-1" />
                                                            Tarde
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant={selectedStudents[student.id] === 'absent' ? 'default' : 'outline'}
                                                            onClick={() => handleAttendanceChange(student.id, 'absent')}
                                                            className={selectedStudents[student.id] === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                                                        >
                                                            <Icon iconNode={XCircle} className="w-4 h-4 mr-1" />
                                                            Ausente
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
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
        </AppLayout>
    );
}

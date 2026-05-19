import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Users, GraduationCap, ClipboardCheck } from 'lucide-react';
import { Icon } from '@/components/icon';
import { useState, useMemo } from 'react';
import AttendanceTab from './GroupDetail/tabs/AttendanceTab';
import StudentsTab from './GroupDetail/tabs/StudentsTab';
import ActivitiesTab from './GroupDetail/tabs/ActivitiesTab';
import StudentDetailDialog from './GroupDetail/StudentDetailDialog';
import type { GroupDetailProps, Student } from './GroupDetail/types';

export default function GroupDetail({ schedule, students, activities, classDates }: GroupDetailProps) {
    const [selectedStudents, setSelectedStudents] = useState<Record<number, string>>({});
    const [studentNotes, setStudentNotes] = useState<Record<number, string>>({});
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showStudentDetail, setShowStudentDetail] = useState<Student | null>(null);

    const activitiesByModule = useMemo(() => {
        const grouped: Record<string, {
            moduleName: string;
            description: string | null;
            hours: number;
            level: number;
            activities: typeof activities;
            isFullyEvaluated: boolean;
        }> = {};

        activities.forEach((activity) => {
            const key = activity.study_plan.module_name;
            if (!grouped[key]) {
                grouped[key] = {
                    moduleName: activity.study_plan.module_name,
                    description: activity.study_plan.description,
                    hours: activity.study_plan.hours ?? 0,
                    level: activity.study_plan.level ?? 0,
                    activities: [],
                    isFullyEvaluated: true,
                };
            }
            grouped[key].activities.push(activity);
            if (!activity.is_fully_evaluated) {
                grouped[key].isFullyEvaluated = false;
            }
        });

        const sorted = Object.values(grouped).sort(
            (a, b) => a.level - b.level || a.moduleName.localeCompare(b.moduleName)
        );

        return sorted.map((group, index) => {
            let isLocked = false;
            if (index > 0) {
                for (let i = 0; i < index; i++) {
                    if (!sorted[i].isFullyEvaluated) {
                        isLocked = true;
                        break;
                    }
                }
            }
            return { ...group, isLocked };
        });
    }, [activities]);

    const pastDates = classDates.filter((d) => d.is_past || d.is_today);
    const futureDates = classDates.filter((d) => !d.is_past && !d.is_today);

    const handleSelectDate = (date: string) => {
        setSelectedDate(date);
        const existingAttendances: Record<number, string> = {};
        const existingNotes: Record<number, string> = {};
        students.forEach((student) => {
            if (student.attendance_by_date[date]) {
                existingAttendances[student.id] = student.attendance_by_date[date].status;
                existingNotes[student.id] = student.attendance_by_date[date].notes || '';
            }
        });
        setSelectedStudents(existingAttendances);
        setStudentNotes(existingNotes);
    };

    const handleAttendanceChange = (studentId: number, status: string) => {
        setSelectedStudents((prev) => ({ ...prev, [studentId]: status }));
        if (status === 'present') {
            setStudentNotes((prev) => ({ ...prev, [studentId]: '' }));
        }
    };

    const handleNotesChange = (studentId: number, notes: string) => {
        setStudentNotes((prev) => ({ ...prev, [studentId]: notes }));
    };

    const handleSubmitAttendance = () => {
        if (!selectedDate) return;
        const attendances = Object.entries(selectedStudents).map(([studentId, status]) => ({
            student_id: parseInt(studentId),
            status,
            notes: studentNotes[parseInt(studentId)] || '',
        }));
        if (attendances.length === 0) {
            alert('Debes marcar al menos un estudiante');
            return;
        }
        router.post(`/profesor/grupo/${schedule.id}/asistencia`, {
            class_date: selectedDate,
            attendances,
        });
    };

    return (
        <AppLayout variant="sidebar" title={`${schedule.program.name} - Portal Profesor`}>
            <Head title={`${schedule.program.name} - Portal Profesor`} />

            <div className="px-6 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                {schedule.program.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                <Badge style={{ backgroundColor: schedule.program.color }} className="text-white">
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

                    <TabsContent value="attendance">
                        <AttendanceTab
                            students={students}
                            pastDates={pastDates}
                            futureDates={futureDates}
                            selectedDate={selectedDate}
                            selectedStudents={selectedStudents}
                            studentNotes={studentNotes}
                            onSelectDate={handleSelectDate}
                            onAttendanceChange={handleAttendanceChange}
                            onNotesChange={handleNotesChange}
                            onSubmit={handleSubmitAttendance}
                            onViewStudent={setShowStudentDetail}
                        />
                    </TabsContent>

                    <TabsContent value="students">
                        <StudentsTab students={students} onViewStudent={setShowStudentDetail} />
                    </TabsContent>

                    <TabsContent value="activities">
                        <ActivitiesTab activitiesByModule={activitiesByModule} scheduleId={schedule.id} />
                    </TabsContent>
                </Tabs>
            </div>

            <StudentDetailDialog
                student={showStudentDetail}
                pastDates={pastDates}
                onClose={() => setShowStudentDetail(null)}
            />
        </AppLayout>
    );
}

import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GraduationCap, Save, ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { Icon } from '@/components/icon';
import { useState } from 'react';

interface Schedule {
    id: number;
    program: {
        name: string;
        color: string;
    };
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
    study_plan: {
        module_name: string;
    };
    evaluation_criteria: EvaluationCriteria[];
}

interface ExistingEvaluation {
    id: number;
    evaluation_criteria_id: number;
    points_earned: number;
    feedback: string;
}

interface AttendanceStats {
    total: number;
    present: number;
    late: number;
    absent: number;
}

interface Student {
    id: number;
    name: string;
    email: string;
    existing_evaluations: ExistingEvaluation[];
    has_attendance: boolean;
    attendance_stats: AttendanceStats;
}

interface Props {
    schedule: Schedule;
    activity: Activity;
    students: Student[];
}

interface CriteriaScore {
    evaluation_criteria_id: number;
    points_earned: number;
}

interface StudentEvaluation {
    student_id: number;
    criteria: CriteriaScore[];
    feedback: string;
}

export default function EvaluateActivity({ schedule, activity, students }: Props) {
    const [evaluationDate, setEvaluationDate] = useState(new Date().toISOString().split('T')[0]);
    const [evaluations, setEvaluations] = useState<Record<number, StudentEvaluation>>(() => {
        // Initialize with existing evaluations if any
        const initial: Record<number, StudentEvaluation> = {};
        students.forEach(student => {
            initial[student.id] = {
                student_id: student.id,
                criteria: activity.evaluation_criteria.map(criteria => {
                    const existing = student.existing_evaluations.find(
                        e => e.evaluation_criteria_id === criteria.id
                    );
                    return {
                        evaluation_criteria_id: criteria.id,
                        points_earned: existing?.points_earned || 0
                    };
                }),
                feedback: student.existing_evaluations[0]?.feedback || ''
            };
        });
        return initial;
    });

    const handleCriteriaChange = (studentId: number, criteriaId: number, value: string) => {
        const points = parseFloat(value) || 0;
        setEvaluations(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                criteria: prev[studentId].criteria.map(c =>
                    c.evaluation_criteria_id === criteriaId
                        ? { ...c, points_earned: points }
                        : c
                )
            }
        }));
    };

    const handleFeedbackChange = (studentId: number, feedback: string) => {
        setEvaluations(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                feedback
            }
        }));
    };

    const calculateTotal = (studentId: number): number => {
        return evaluations[studentId]?.criteria.reduce((sum, c) => sum + c.points_earned, 0) || 0;
    };

    const calculateMaxTotal = (): number => {
        return activity.evaluation_criteria.reduce((sum, c) => sum + c.max_points, 0);
    };

    const handleSubmit = () => {
        // Filtrar solo estudiantes que tienen asistencia registrada
        const studentsWithAttendance = students.filter(s => s.has_attendance);

        if (studentsWithAttendance.length === 0) {
            alert('No hay estudiantes con asistencia registrada para evaluar. Primero debe marcar asistencia.');
            return;
        }

        const evaluationsArray = studentsWithAttendance.map(student => evaluations[student.id]);

        router.post(
            `/profesor/grupo/${schedule.id}/actividad/${activity.id}/evaluaciones`,
            {
                evaluation_date: evaluationDate,
                evaluations: evaluationsArray
            }
        );
    };

    // Contar estudiantes con y sin asistencia
    const studentsWithAttendance = students.filter(s => s.has_attendance).length;
    const studentsWithoutAttendance = students.filter(s => !s.has_attendance).length;

    return (
        <AppLayout
            variant="sidebar"
            title={`Evaluar: ${activity.name} - Portal Profesor`}
        >
            <Head title={`Evaluar: ${activity.name} - Portal Profesor`} />

            <div className="px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Evaluar Actividad
                            </h1>
                            <p className="text-gray-600">{schedule.program.name}</p>
                        </div>
                        <Link href={`/profesor/grupo/${schedule.id}`}>
                            <Button variant="outline">
                                <Icon iconNode={ArrowLeft} className="w-4 h-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Activity Info */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl mb-2">{activity.name}</CardTitle>
                                <p className="text-gray-600 mb-3">{activity.description}</p>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{activity.study_plan.module_name}</Badge>
                                    <Badge variant="secondary">Peso: {activity.weight}%</Badge>
                                    <Badge variant="secondary">
                                        Puntaje Total: {calculateMaxTotal()} puntos
                                    </Badge>
                                </div>
                            </div>
                            <Icon iconNode={GraduationCap} className="w-12 h-12 text-[#7a9b3c]" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <Label htmlFor="evaluation_date">Fecha de Evaluación</Label>
                            <Input
                                id="evaluation_date"
                                type="date"
                                value={evaluationDate}
                                onChange={(e) => setEvaluationDate(e.target.value)}
                                className="max-w-xs"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Warning */}
                {studentsWithoutAttendance > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-800">Estudiantes sin asistencia registrada</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    {studentsWithoutAttendance} estudiante(s) no tienen asistencia registrada y no pueden ser evaluados.
                                    {studentsWithAttendance > 0 && ` Solo se evaluarán ${studentsWithAttendance} estudiante(s) con asistencia.`}
                                </p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Vaya a la pestaña "Marcar Asistencia" para registrar la asistencia antes de evaluar.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Students Evaluation */}
                <div className="space-y-6">
                    {students.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-gray-500">
                                No hay estudiantes para evaluar
                            </CardContent>
                        </Card>
                    ) : (
                        students.map((student) => (
                            <Card key={student.id} className={!student.has_attendance ? 'border-yellow-300 bg-yellow-50/50' : ''}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <CardTitle>{student.name}</CardTitle>
                                                {student.has_attendance ? (
                                                    <Badge className="bg-green-500">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Asistencia registrada
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive">
                                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                                        Sin asistencia
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{student.email}</p>
                                            {student.has_attendance && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Asistencia: {student.attendance_stats.present}P / {student.attendance_stats.late}T / {student.attendance_stats.absent}A
                                                    ({student.attendance_stats.total} clases)
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-3xl font-bold ${!student.has_attendance ? 'text-gray-400' : 'text-gray-900'}`}>
                                                {calculateTotal(student.id)}/{calculateMaxTotal()}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {calculateMaxTotal() > 0
                                                    ? Math.round((calculateTotal(student.id) / calculateMaxTotal()) * 100)
                                                    : 0}%
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {!student.has_attendance ? (
                                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
                                            <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                            <p className="text-yellow-800 font-medium">
                                                No se puede evaluar a este estudiante
                                            </p>
                                            <p className="text-yellow-700 text-sm mt-1">
                                                Primero debe registrar al menos una asistencia para este estudiante.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Criteria Scores */}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">Criterios de Evaluación</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {activity.evaluation_criteria.map((criteria) => (
                                                        <div key={criteria.id} className="space-y-2">
                                                            <Label htmlFor={`student-${student.id}-criteria-${criteria.id}`}>
                                                                {criteria.name}
                                                                <span className="text-gray-500 ml-2 text-sm">
                                                                    (Max: {criteria.max_points} pts)
                                                                </span>
                                                            </Label>
                                                            <Input
                                                                id={`student-${student.id}-criteria-${criteria.id}`}
                                                                type="number"
                                                                min="0"
                                                                max={criteria.max_points}
                                                                step="0.5"
                                                                value={
                                                                    evaluations[student.id]?.criteria.find(
                                                                        c => c.evaluation_criteria_id === criteria.id
                                                                    )?.points_earned || 0
                                                                }
                                                                onChange={(e) =>
                                                                    handleCriteriaChange(student.id, criteria.id, e.target.value)
                                                                }
                                                            />
                                                            {criteria.description && (
                                                                <p className="text-xs text-gray-500">{criteria.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Feedback */}
                                            <div>
                                                <Label htmlFor={`feedback-${student.id}`}>
                                                    Retroalimentación (opcional)
                                                </Label>
                                                <Textarea
                                                    id={`feedback-${student.id}`}
                                                    placeholder="Escribe comentarios o sugerencias para el estudiante..."
                                                    value={evaluations[student.id]?.feedback || ''}
                                                    onChange={(e) => handleFeedbackChange(student.id, e.target.value)}
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Submit Button */}
                {students.length > 0 && (
                    <div className="mt-8 flex gap-4">
                        <Button
                            onClick={handleSubmit}
                            className="flex-1 bg-[#7a9b3c] hover:bg-[#6a8a2c] text-lg py-6 disabled:bg-gray-400"
                            disabled={studentsWithAttendance === 0}
                        >
                            <Icon iconNode={Save} className="w-5 h-5 mr-2" />
                            {studentsWithAttendance === 0
                                ? 'No hay estudiantes para evaluar'
                                : `Guardar Evaluaciones (${studentsWithAttendance} estudiante${studentsWithAttendance !== 1 ? 's' : ''})`
                            }
                        </Button>
                        <Link href={`/profesor/grupo/${schedule.id}`} className="flex-shrink-0">
                            <Button variant="outline" className="text-lg py-6">
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

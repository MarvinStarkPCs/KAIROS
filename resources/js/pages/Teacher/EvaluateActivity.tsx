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
    document_type: string | null;
    document_number: string | null;
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
                        points_earned: Number(existing?.points_earned ?? 0)
                    };
                }),
                feedback: student.existing_evaluations[0]?.feedback || ''
            };
        });
        return initial;
    });

    const handleCriteriaChange = (studentId: number, criteriaId: number, value: string) => {
        const points = parseFloat(value) || 0;
        const maxPoints = activity.evaluation_criteria.find(c => c.id === criteriaId)?.max_points ?? 0;
        const clampedPoints = Math.min(Math.max(points, 0), maxPoints);
        setEvaluations(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                criteria: prev[studentId].criteria.map(c =>
                    c.evaluation_criteria_id === criteriaId
                        ? { ...c, points_earned: clampedPoints }
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
        const criteria = evaluations[studentId]?.criteria;
        if (!criteria || criteria.length === 0) return 0;
        return criteria.reduce((sum, c) => sum + Number(c.points_earned || 0), 0);
    };

    const calculateMaxTotal = (): number => {
        if (!activity.evaluation_criteria || activity.evaluation_criteria.length === 0) return 0;
        return activity.evaluation_criteria.reduce((sum, c) => sum + Number(c.max_points || 0), 0);
    };

    const getPercentage = (studentId: number): number => {
        const max = calculateMaxTotal();
        const total = calculateTotal(studentId);
        return max > 0 ? Math.round((total / max) * 100) : 0;
    };

    const getScoreColor = (percentage: number): string => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-blue-600';
        if (percentage >= 40) return 'text-amber-600';
        return 'text-red-600';
    };

    const getScoreRingColor = (percentage: number): string => {
        if (percentage >= 80) return 'stroke-green-500';
        if (percentage >= 60) return 'stroke-blue-500';
        if (percentage >= 40) return 'stroke-amber-500';
        return 'stroke-red-500';
    };

    const getScoreBgColor = (percentage: number): string => {
        if (percentage >= 80) return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
        if (percentage >= 60) return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
        if (percentage >= 40) return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800';
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    };

    const getScoreLabel = (percentage: number): string => {
        if (percentage >= 90) return 'Excelente';
        if (percentage >= 80) return 'Muy bien';
        if (percentage >= 70) return 'Bien';
        if (percentage >= 60) return 'Aceptable';
        if (percentage >= 40) return 'Insuficiente';
        return 'Bajo';
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
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                Evaluar Actividad
                            </h1>
                            <p className="text-muted-foreground">{schedule.program.name}</p>
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
                                <p className="text-muted-foreground mb-3">{activity.description}</p>
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
                    <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Estudiantes sin asistencia registrada</h4>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                    {studentsWithoutAttendance} estudiante(s) no tienen asistencia registrada y no pueden ser evaluados.
                                    {studentsWithAttendance > 0 && ` Solo se evaluarán ${studentsWithAttendance} estudiante(s) con asistencia.`}
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
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
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No hay estudiantes para evaluar
                            </CardContent>
                        </Card>
                    ) : (
                        students.map((student) => {
                            const percentage = getPercentage(student.id);
                            const total = calculateTotal(student.id);
                            const maxTotal = calculateMaxTotal();
                            return (
                            <div key={student.id}>
                                {/* Score summary - sticky bar above the card */}
                                {student.has_attendance && (
                                    <div className={`sticky top-0 z-20 flex items-center justify-between rounded-t-lg border border-b-0 px-4 py-2 shadow-md ${getScoreBgColor(percentage)}`}>
                                        <div className="flex items-center gap-3">
                                            {/* Mini circular progress */}
                                            <div className="relative h-11 w-11 flex-shrink-0">
                                                <svg className="h-11 w-11 -rotate-90" viewBox="0 0 48 48">
                                                    <circle cx="24" cy="24" r="20" fill="none" className="stroke-muted" strokeWidth="4" />
                                                    <circle
                                                        cx="24" cy="24" r="20" fill="none"
                                                        className={`transition-all duration-500 ${getScoreRingColor(percentage)}`}
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                        strokeDasharray={`${(percentage / 100) * 125.7} 125.7`}
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className={`text-xs font-bold ${getScoreColor(percentage)}`}>
                                                        {percentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className={`text-base font-bold ${getScoreColor(percentage)}`}>
                                                    {total} / {maxTotal} pts
                                                </div>
                                                <div className={`text-xs font-medium ${getScoreColor(percentage)}`}>
                                                    {getScoreLabel(percentage)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">{student.name}</span>
                                            {/* Progress bar */}
                                            <div className="hidden sm:block w-32">
                                                <div className="h-3 w-full overflow-hidden rounded-full bg-white/60">
                                                    <div
                                                        className={`h-full transition-all duration-500 rounded-full ${
                                                            percentage >= 80 ? 'bg-green-500' :
                                                            percentage >= 60 ? 'bg-blue-500' :
                                                            percentage >= 40 ? 'bg-amber-500' :
                                                            'bg-red-500'
                                                        }`}
                                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <Card className={`${!student.has_attendance ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50' : 'rounded-t-none'}`}>
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
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                {student.document_number && (
                                                    <span className="font-medium text-muted-foreground">
                                                        {student.document_type}: {student.document_number}
                                                    </span>
                                                )}
                                                <span>{student.email}</span>
                                            </div>
                                            {student.has_attendance && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Asistencia: {student.attendance_stats.present}P / {student.attendance_stats.late}T / {student.attendance_stats.absent}A
                                                    ({student.attendance_stats.total} clases)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {!student.has_attendance ? (
                                        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 text-center">
                                            <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                                            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                                                No se puede evaluar a este estudiante
                                            </p>
                                            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                                                Primero debe registrar al menos una asistencia para este estudiante.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Criteria Scores */}
                                            <div>
                                                <h4 className="font-semibold text-foreground mb-3">Criterios de Evaluación</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {activity.evaluation_criteria.map((criteria) => {
                                                        const earned = Number(evaluations[student.id]?.criteria.find(
                                                            c => c.evaluation_criteria_id === criteria.id
                                                        )?.points_earned ?? 0);
                                                        const maxPts = Number(criteria.max_points || 0);
                                                        const pct = maxPts > 0 ? Math.round((earned / maxPts) * 100) : 0;
                                                        return (
                                                            <div key={criteria.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <Label htmlFor={`student-${student.id}-criteria-${criteria.id}`} className="text-sm font-medium">
                                                                        {criteria.name}
                                                                    </Label>
                                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                                        pct >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                                                        pct >= 60 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                                                                        pct >= 40 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                                                                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                                    }`}>
                                                                        {pct}%
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <Input
                                                                        id={`student-${student.id}-criteria-${criteria.id}`}
                                                                        type="number"
                                                                        min="0"
                                                                        max={criteria.max_points}
                                                                        step="0.5"
                                                                        value={earned}
                                                                        onChange={(e) =>
                                                                            handleCriteriaChange(student.id, criteria.id, e.target.value)
                                                                        }
                                                                        className="w-24 text-center"
                                                                    />
                                                                    <span className="text-sm text-muted-foreground">/</span>
                                                                    <span className="text-sm font-medium text-muted-foreground">{criteria.max_points} pts</span>
                                                                    <div className="flex-1">
                                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                                            <div
                                                                                className={`h-full transition-all duration-300 rounded-full ${
                                                                                    pct >= 80 ? 'bg-green-500' :
                                                                                    pct >= 60 ? 'bg-blue-500' :
                                                                                    pct >= 40 ? 'bg-amber-500' :
                                                                                    'bg-red-500'
                                                                                }`}
                                                                                style={{ width: `${Math.min(pct, 100)}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {criteria.description && (
                                                                    <p className="text-xs text-muted-foreground">{criteria.description}</p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
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
                            </div>
                        );
                        })
                    )}
                </div>

                {/* Submit Button */}
                {students.length > 0 && (
                    <div className="mt-8 flex gap-4">
                        <Button
                            onClick={handleSubmit}
                            className="flex-1 bg-[#7a9b3c] hover:bg-[#6a8a2c] text-lg py-6 disabled:opacity-50"
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

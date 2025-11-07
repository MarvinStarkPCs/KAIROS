import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GraduationCap, Save, ArrowLeft } from 'lucide-react';
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

interface Student {
    id: number;
    name: string;
    email: string;
    existing_evaluations: ExistingEvaluation[];
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
        const evaluationsArray = Object.values(evaluations);

        router.post(
            `/profesor/grupo/${schedule.id}/actividad/${activity.id}/evaluaciones`,
            {
                evaluation_date: evaluationDate,
                evaluations: evaluationsArray
            }
        );
    };

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
                            <Card key={student.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>{student.name}</CardTitle>
                                            <p className="text-sm text-gray-600">{student.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-gray-900">
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
                            className="flex-1 bg-[#7a9b3c] hover:bg-[#6a8a2c] text-lg py-6"
                        >
                            <Icon iconNode={Save} className="w-5 h-5 mr-2" />
                            Guardar Evaluaciones
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

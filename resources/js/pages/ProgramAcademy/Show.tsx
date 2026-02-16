import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Plus, Book, ListChecks, Award, Trash2, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProgramAcademyController from '@/actions/App/Http/Controllers/program_academy';
import StudyPlanController from '@/actions/App/Http/Controllers/StudyPlanController';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { SharedData } from '@/types';
import StudyPlanDialog from '@/components/StudyPlanDialog';
import ActivityDialog from '@/components/ActivityDialog';
import EvaluationCriteriaDialog from '@/components/EvaluationCriteriaDialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EvaluationCriteria {
    id: number;
    name: string;
    description: string | null;
    max_points: number;
    order: number;
}

interface Activity {
    id: number;
    name: string;
    description: string | null;
    order: number;
    weight: number;
    status: 'active' | 'inactive';
    evaluation_criteria: EvaluationCriteria[];
}

interface StudyPlan {
    id: number;
    module_name: string;
    description: string | null;
    hours: number;
    level: number;
    activities: Activity[];
}

interface Program {
    id: number;
    name: string;
    description: string | null;
    duration_months: number;
    status: 'active' | 'inactive';
    created_at: string;
}

interface ShowProps {
    program: Program;
    studyPlans: StudyPlan[];
}

export default function Show({ program, studyPlans }: ShowProps) {
    const { auth } = usePage<SharedData>().props;
    const permissions = auth?.permissions ?? [];

    // Permission check helper
    const can = (permission: string) => permissions.includes(permission);

    // State for StudyPlan dialog
    const [studyPlanDialog, setStudyPlanDialog] = useState<{
        open: boolean;
        studyPlan?: StudyPlan;
    }>({ open: false });

    // State for Activity dialog
    const [activityDialog, setActivityDialog] = useState<{
        open: boolean;
        studyPlanId?: number;
        activity?: Activity;
        nextOrder?: number;
        currentTotalWeight?: number;
    }>({ open: false });

    // Helper function to calculate total weight of activities in a study plan
    const calculateTotalWeight = (activities: Activity[], excludeActivityId?: number): number => {
        return activities
            .filter(a => a.id !== excludeActivityId)
            .reduce((sum, activity) => sum + (Number(activity.weight) || 0), 0);
    };

    // Helper function to get weight status
    const getWeightStatus = (totalWeight: number) => {
        const weight = Number(totalWeight) || 0;
        if (weight === 100) {
            return { status: 'complete', color: 'green', message: 'Completo' };
        } else if (weight > 100) {
            return { status: 'over', color: 'red', message: `Excede por ${(weight - 100).toFixed(1)}%` };
        } else {
            return { status: 'incomplete', color: 'amber', message: `Faltan ${(100 - weight).toFixed(1)}%` };
        }
    };

    // State for EvaluationCriteria dialog
    const [criteriaDialog, setCriteriaDialog] = useState<{
        open: boolean;
        activityId?: number;
        criteria?: EvaluationCriteria;
        nextOrder?: number;
    }>({ open: false });

    // State for delete confirmations
    const [deleteStudyPlan, setDeleteStudyPlan] = useState<{
        open: boolean;
        studyPlan?: StudyPlan;
    }>({ open: false });

    const [deleteActivity, setDeleteActivity] = useState<{
        open: boolean;
        activity?: Activity;
    }>({ open: false });

    const [deleteCriteria, setDeleteCriteria] = useState<{
        open: boolean;
        criteria?: EvaluationCriteria;
    }>({ open: false });

    // Delete handlers
    const handleDeleteStudyPlan = () => {
        if (deleteStudyPlan.studyPlan) {
            router.delete(StudyPlanController.destroy(deleteStudyPlan.studyPlan.id).url, {
                preserveScroll: true,
                onSuccess: () => setDeleteStudyPlan({ open: false }),
            });
        }
    };

    const handleDeleteActivity = () => {
        if (deleteActivity.activity) {
            router.delete(StudyPlanController.destroyActivity(deleteActivity.activity.id).url, {
                preserveScroll: true,
                onSuccess: () => setDeleteActivity({ open: false }),
            });
        }
    };

    const handleDeleteCriteria = () => {
        if (deleteCriteria.criteria) {
            router.delete(StudyPlanController.destroyCriteria(deleteCriteria.criteria.id).url, {
                preserveScroll: true,
                onSuccess: () => setDeleteCriteria({ open: false }),
            });
        }
    };

    return (
        <AppLayout>
            <Head title={`${program.name} - Plan de Estudios`} />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <Link
                        href={ProgramAcademyController.index().url}
                        className="mb-3 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Volver a programas
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{program.name}</h1>
                            {program.description && (
                                <p className="mt-2 text-muted-foreground">{program.description}</p>
                            )}
                            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{program.duration_months} meses</span>
                                <span>•</span>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        program.status === 'active'
                                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {program.status === 'active' ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>

                        <Link href={ProgramAcademyController.edit({ program: program.id }).url}>
                            <Button variant="outline">Editar Programa</Button>
                        </Link>
                    </div>
                </div>

                {/* Study Plans Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-foreground">Plan de Estudios</h2>
                        <Button onClick={() => setStudyPlanDialog({ open: true })}>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Módulo
                        </Button>
                    </div>

                    {/* Info Alert about Points and Percentages */}
                    <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800 dark:text-blue-200">Sistema de Evaluación: Puntos y Porcentajes</AlertTitle>
                        <AlertDescription className="text-blue-700 dark:text-blue-300">
                            <div className="mt-2 grid gap-3 text-sm md:grid-cols-2">
                                <div className="rounded-md bg-white/60 p-3">
                                    <strong className="text-blue-900 dark:text-blue-100">Peso de Actividades (%):</strong>
                                    <ul className="mt-1 list-disc pl-4 text-xs">
                                        <li>Cada actividad tiene un peso porcentual dentro del módulo</li>
                                        <li>La suma de todos los pesos debe ser <strong>100%</strong></li>
                                        <li>Ejemplo: Tarea 30% + Examen 40% + Proyecto 30% = 100%</li>
                                    </ul>
                                </div>
                                <div className="rounded-md bg-white/60 p-3">
                                    <strong className="text-blue-900 dark:text-blue-100">Puntos de Criterios:</strong>
                                    <ul className="mt-1 list-disc pl-4 text-xs">
                                        <li>Cada criterio tiene una puntuación máxima (ej: 10 pts)</li>
                                        <li>El estudiante recibe puntos según su desempeño</li>
                                        <li>La nota se calcula: (obtenidos / máximo) × peso de actividad</li>
                                    </ul>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {studyPlans.length > 0 ? (
                        <div className="space-y-4">
                            {studyPlans.map((studyPlan, index) => (
                                <div
                                    key={studyPlan.id}
                                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                                >
                                    {/* Study Plan Header */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                                <Book className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground">
                                                    Módulo {index + 1}: {studyPlan.module_name}
                                                </h3>
                                                {studyPlan.description && (
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {studyPlan.description}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>{studyPlan.hours} horas</span>
                                                    <span>•</span>
                                                    <span>Nivel {studyPlan.level}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setStudyPlanDialog({ open: true, studyPlan })
                                                }
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setActivityDialog({
                                                        open: true,
                                                        studyPlanId: studyPlan.id,
                                                        nextOrder: studyPlan.activities.length,
                                                        currentTotalWeight: calculateTotalWeight(studyPlan.activities),
                                                    })
                                                }
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            {can('eliminar_plan_estudio') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                                                    onClick={() =>
                                                        setDeleteStudyPlan({ open: true, studyPlan })
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Activities */}
                                    {studyPlan.activities.length > 0 ? (
                                        <div className="ml-14 space-y-3">
                                            {/* Weight Progress Indicator */}
                                            {(() => {
                                                const totalWeight = Number(calculateTotalWeight(studyPlan.activities)) || 0;
                                                const weightStatus = getWeightStatus(totalWeight);
                                                return (
                                                    <div className="rounded-lg border border-border bg-muted p-3">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <h4 className="text-sm font-semibold text-muted-foreground">Actividades:</h4>
                                                            <div className="flex items-center gap-2">
                                                                {weightStatus.status === 'complete' ? (
                                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <AlertTriangle className={`h-4 w-4 ${weightStatus.status === 'over' ? 'text-red-600' : 'text-amber-600'}`} />
                                                                )}
                                                                <span className={`text-sm font-medium ${
                                                                    weightStatus.status === 'complete' ? 'text-green-700 dark:text-green-300' :
                                                                    weightStatus.status === 'over' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'
                                                                }`}>
                                                                    {totalWeight.toFixed(1)}% de 100% — {weightStatus.message}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {/* Progress Bar */}
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className={`h-full transition-all duration-300 ${
                                                                    weightStatus.status === 'complete' ? 'bg-green-500' :
                                                                    weightStatus.status === 'over' ? 'bg-red-500' : 'bg-amber-500'
                                                                }`}
                                                                style={{ width: `${Math.min(totalWeight, 100)}%` }}
                                                            />
                                                        </div>
                                                        {weightStatus.status !== 'complete' && (
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {weightStatus.status === 'over'
                                                                    ? 'La suma de pesos excede el 100%. Ajusta los pesos de las actividades.'
                                                                    : 'La suma de pesos debe ser exactamente 100% para que las calificaciones se calculen correctamente.'}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            {studyPlan.activities.map((activity) => (
                                                <div
                                                    key={activity.id}
                                                    className="rounded-lg border border-border bg-muted p-4"
                                                >
                                                    {/* Activity Header */}
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                                                                <ListChecks className="h-4 w-4 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-medium text-foreground">
                                                                    {activity.name}
                                                                </h5>
                                                                {activity.description && (
                                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                                        {activity.description}
                                                                    </p>
                                                                )}
                                                                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                                                    <span>Peso: {activity.weight}%</span>
                                                                    <span>•</span>
                                                                    <span
                                                                        className={`rounded-full px-2 py-0.5 ${
                                                                            activity.status === 'active'
                                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                                                : 'bg-muted text-muted-foreground'
                                                                        }`}
                                                                    >
                                                                        {activity.status === 'active'
                                                                            ? 'Activa'
                                                                            : 'Inactiva'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setActivityDialog({
                                                                        open: true,
                                                                        studyPlanId: studyPlan.id,
                                                                        activity,
                                                                        currentTotalWeight: calculateTotalWeight(studyPlan.activities, activity.id),
                                                                    })
                                                                }
                                                            >
                                                                Editar
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    setCriteriaDialog({
                                                                        open: true,
                                                                        activityId: activity.id,
                                                                        nextOrder: activity.evaluation_criteria.length,
                                                                    })
                                                                }
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                            {can('eliminar_actividad') && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                                                                    onClick={() =>
                                                                        setDeleteActivity({ open: true, activity })
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Evaluation Criteria */}
                                                    {activity.evaluation_criteria.length > 0 && (
                                                        <div className="ml-11 space-y-2">
                                                            <h6 className="text-xs font-semibold text-muted-foreground">
                                                                Criterios de Evaluación:
                                                            </h6>
                                                            {activity.evaluation_criteria.map((criteria) => (
                                                                <div
                                                                    key={criteria.id}
                                                                    className="flex items-center justify-between rounded-md border border-border bg-card p-3"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Award className="h-4 w-4 text-amber-600" />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-foreground">
                                                                                {criteria.name}
                                                                            </p>
                                                                            {criteria.description && (
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    {criteria.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-medium text-muted-foreground">
                                                                            {criteria.max_points} pts
                                                                        </span>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() =>
                                                                                setCriteriaDialog({
                                                                                    open: true,
                                                                                    activityId: activity.id,
                                                                                    criteria,
                                                                                })
                                                                            }
                                                                        >
                                                                            Editar
                                                                        </Button>
                                                                        {can('eliminar_criterio_evaluacion') && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                                                                                onClick={() =>
                                                                                    setDeleteCriteria({ open: true, criteria })
                                                                                }
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="ml-14 rounded-lg border-2 border-dashed border-border bg-muted p-6 text-center">
                                            <p className="text-sm text-muted-foreground">
                                                No hay actividades en este módulo
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3"
                                                onClick={() =>
                                                    setActivityDialog({
                                                        open: true,
                                                        studyPlanId: studyPlan.id,
                                                        nextOrder: 0,
                                                        currentTotalWeight: 0,
                                                    })
                                                }
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Agregar Primera Actividad
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border-2 border-dashed border-border bg-card p-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Book className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-foreground">
                                No hay módulos en este programa
                            </h3>
                            <p className="mb-6 text-muted-foreground">
                                Comienza agregando el primer módulo al plan de estudios
                            </p>
                            <Button onClick={() => setStudyPlanDialog({ open: true })}>
                                <Plus className="mr-2 h-5 w-5" />
                                Agregar Primer Módulo
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <StudyPlanDialog
                open={studyPlanDialog.open}
                onOpenChange={(open) => setStudyPlanDialog({ open, studyPlan: undefined })}
                programId={program.id}
                studyPlan={studyPlanDialog.studyPlan}
            />

            {activityDialog.studyPlanId && (
                <ActivityDialog
                    open={activityDialog.open}
                    onOpenChange={(open) =>
                        setActivityDialog({ open, studyPlanId: undefined, activity: undefined, currentTotalWeight: undefined })
                    }
                    studyPlanId={activityDialog.studyPlanId}
                    activity={activityDialog.activity}
                    nextOrder={activityDialog.nextOrder}
                    currentTotalWeight={activityDialog.currentTotalWeight}
                />
            )}

            {criteriaDialog.activityId && (
                <EvaluationCriteriaDialog
                    open={criteriaDialog.open}
                    onOpenChange={(open) =>
                        setCriteriaDialog({ open, activityId: undefined, criteria: undefined })
                    }
                    activityId={criteriaDialog.activityId}
                    criteria={criteriaDialog.criteria}
                    nextOrder={criteriaDialog.nextOrder}
                />
            )}

            {/* Delete Confirmation Dialogs */}
            <AlertDialog
                open={deleteStudyPlan.open}
                onOpenChange={(open) => setDeleteStudyPlan({ open, studyPlan: undefined })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Módulo</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas eliminar el módulo &quot;{deleteStudyPlan.studyPlan?.module_name}&quot;?
                            Esta acción eliminará también todas las actividades y criterios de evaluación asociados.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteStudyPlan}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={deleteActivity.open}
                onOpenChange={(open) => setDeleteActivity({ open, activity: undefined })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Actividad</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas eliminar la actividad &quot;{deleteActivity.activity?.name}&quot;?
                            Esta acción eliminará también todos los criterios de evaluación asociados.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteActivity}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={deleteCriteria.open}
                onOpenChange={(open) => setDeleteCriteria({ open, criteria: undefined })}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Eliminar Criterio de Evaluación</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas eliminar el criterio &quot;{deleteCriteria.criteria?.name}&quot;?
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCriteria}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

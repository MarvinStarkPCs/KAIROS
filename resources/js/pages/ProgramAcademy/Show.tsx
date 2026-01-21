import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Plus, Book, ListChecks, Award, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProgramAcademyController from '@/actions/App/Http/Controllers/program_academy';
import StudyPlanController from '@/actions/App/Http/Controllers/StudyPlanController';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
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
    }>({ open: false });

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
                        className="mb-3 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Volver a programas
                    </Link>

                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{program.name}</h1>
                            {program.description && (
                                <p className="mt-2 text-gray-600">{program.description}</p>
                            )}
                            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                                <span>{program.duration_months} meses</span>
                                <span>•</span>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        program.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
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
                        <h2 className="text-2xl font-bold text-gray-900">Plan de Estudios</h2>
                        <Button onClick={() => setStudyPlanDialog({ open: true })}>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Módulo
                        </Button>
                    </div>

                    {studyPlans.length > 0 ? (
                        <div className="space-y-4">
                            {studyPlans.map((studyPlan, index) => (
                                <div
                                    key={studyPlan.id}
                                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                                >
                                    {/* Study Plan Header */}
                                    <div className="mb-4 flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                                <Book className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Módulo {index + 1}: {studyPlan.module_name}
                                                </h3>
                                                {studyPlan.description && (
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        {studyPlan.description}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
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
                                                    })
                                                }
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() =>
                                                    setDeleteStudyPlan({ open: true, studyPlan })
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Activities */}
                                    {studyPlan.activities.length > 0 ? (
                                        <div className="ml-14 space-y-3">
                                            <h4 className="text-sm font-semibold text-gray-700">Actividades:</h4>
                                            {studyPlan.activities.map((activity) => (
                                                <div
                                                    key={activity.id}
                                                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                                >
                                                    {/* Activity Header */}
                                                    <div className="mb-3 flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100">
                                                                <ListChecks className="h-4 w-4 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-medium text-gray-900">
                                                                    {activity.name}
                                                                </h5>
                                                                {activity.description && (
                                                                    <p className="mt-1 text-sm text-gray-600">
                                                                        {activity.description}
                                                                    </p>
                                                                )}
                                                                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                                                    <span>Peso: {activity.weight}%</span>
                                                                    <span>•</span>
                                                                    <span
                                                                        className={`rounded-full px-2 py-0.5 ${
                                                                            activity.status === 'active'
                                                                                ? 'bg-green-100 text-green-700'
                                                                                : 'bg-gray-200 text-gray-700'
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
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                onClick={() =>
                                                                    setDeleteActivity({ open: true, activity })
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Evaluation Criteria */}
                                                    {activity.evaluation_criteria.length > 0 && (
                                                        <div className="ml-11 space-y-2">
                                                            <h6 className="text-xs font-semibold text-gray-600">
                                                                Criterios de Evaluación:
                                                            </h6>
                                                            {activity.evaluation_criteria.map((criteria) => (
                                                                <div
                                                                    key={criteria.id}
                                                                    className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Award className="h-4 w-4 text-amber-600" />
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-900">
                                                                                {criteria.name}
                                                                            </p>
                                                                            {criteria.description && (
                                                                                <p className="text-xs text-gray-600">
                                                                                    {criteria.description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-sm font-medium text-gray-700">
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
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                            onClick={() =>
                                                                                setDeleteCriteria({ open: true, criteria })
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="ml-14 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                                            <p className="text-sm text-gray-600">
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
                        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Book className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                No hay módulos en este programa
                            </h3>
                            <p className="mb-6 text-gray-600">
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
                        setActivityDialog({ open, studyPlanId: undefined, activity: undefined })
                    }
                    studyPlanId={activityDialog.studyPlanId}
                    activity={activityDialog.activity}
                    nextOrder={activityDialog.nextOrder}
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

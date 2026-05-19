import { Link } from '@inertiajs/react';
import { CheckCircle, AlertCircle, Book, ListChecks, Award, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ModuleGroup } from '../types';

interface Props {
    activitiesByModule: ModuleGroup[];
    scheduleId: number;
}

export default function ActivitiesTab({ activitiesByModule, scheduleId }: Props) {
    if (activitiesByModule.length === 0) {
        return (
            <div className="rounded-xl border-2 border-dashed border-input bg-card p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Book className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                    No hay actividades configuradas
                </h3>
                <p className="text-muted-foreground">
                    Este programa aún no tiene actividades para evaluar.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {activitiesByModule.map((group, groupIndex) => (
                <div
                    key={group.moduleName}
                    className={`rounded-xl border bg-card shadow-sm ${
                        group.isLocked ? 'border-input opacity-75' : 'border-border'
                    }`}
                >
                    <div className="p-6 pb-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                    group.isLocked ? 'bg-muted' : 'bg-blue-100 dark:bg-blue-900/30'
                                }`}>
                                    {group.isLocked
                                        ? <Lock className="h-5 w-5 text-muted-foreground" />
                                        : <Book className="h-5 w-5 text-blue-600" />
                                    }
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">
                                        Módulo {groupIndex + 1}: {group.moduleName}
                                    </h3>
                                    {group.description && (
                                        <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
                                    )}
                                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                        {group.hours > 0 && <span>{group.hours} horas</span>}
                                        {group.hours > 0 && <span>•</span>}
                                        <span>Nivel {group.level}</span>
                                        <span>•</span>
                                        <span>{group.activities.length} {group.activities.length === 1 ? 'actividad' : 'actividades'}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                {group.isFullyEvaluated ? (
                                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Completado
                                    </Badge>
                                ) : group.isLocked ? (
                                    <Badge variant="outline" className="text-muted-foreground border-input">
                                        <Lock className="w-3 h-3 mr-1" />
                                        Bloqueado
                                    </Badge>
                                ) : (
                                    <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                        Pendiente
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {group.isLocked && (
                            <div className="mt-4 flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    Debes completar la evaluación de todos los estudiantes en los módulos anteriores antes de poder evaluar este módulo.
                                </p>
                            </div>
                        )}
                    </div>

                    {!group.isLocked && (
                        <div className="px-6 pb-6">
                            <div className="ml-14 space-y-3">
                                {group.activities.map((activity) => (
                                    <div key={activity.id} className="rounded-lg border border-border bg-muted p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                                                    <ListChecks className="h-4 w-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h5 className="font-medium text-foreground">{activity.name}</h5>
                                                    {activity.description && (
                                                        <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>
                                                    )}
                                                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span>Peso: {activity.weight}%</span>
                                                        <span>•</span>
                                                        <span className={`rounded-full px-2 py-0.5 ${
                                                            activity.is_fully_evaluated
                                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                                : activity.evaluated_count > 0
                                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                                    : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                            {activity.is_fully_evaluated
                                                                ? 'Evaluado'
                                                                : activity.evaluated_count > 0
                                                                    ? `${activity.evaluated_count}/${activity.total_students} evaluados`
                                                                    : 'Sin evaluar'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {activity.evaluation_criteria.length > 0 && (
                                            <div className="ml-11 space-y-2 mb-3">
                                                <h6 className="text-xs font-semibold text-muted-foreground">
                                                    Criterios de Evaluación:
                                                </h6>
                                                {activity.evaluation_criteria.map((criteria) => (
                                                    <div
                                                        key={criteria.id}
                                                        className="flex items-center gap-2 rounded-md border border-border bg-card p-2"
                                                    >
                                                        <Award className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                                        <span className="text-sm text-foreground flex-1">{criteria.name}</span>
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            {criteria.max_points} pts
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="ml-11">
                                            <Link href={`/profesor/grupo/${scheduleId}/actividad/${activity.id}/evaluar`}>
                                                <Button className="w-full bg-[#7a9b3c] hover:bg-[#6a8a2c]">
                                                    {activity.is_fully_evaluated ? 'Ver / Editar Evaluación' : 'Evaluar Estudiantes'}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

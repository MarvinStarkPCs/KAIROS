import { BookOpen, CheckCircle, Clock, Star, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { getScoreColor, getScoreBadge } from '../helpers';
import type { Module } from '../types';

interface Props {
    modules: Module[];
}

export default function ModulesAccordion({ modules }: Props) {
    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Módulos y Calificaciones</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                    Desglose de tu progreso por módulo y actividad
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
                {modules.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm sm:text-base">Este programa aún no tiene módulos configurados</p>
                    </div>
                ) : (
                    <Accordion type="multiple" className="w-full">
                        {modules.map((module) => (
                            <AccordionItem key={module.id} value={`module-${module.id}`}>
                                <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                                    <div className="flex items-center justify-between w-full pr-2 sm:pr-4 gap-2">
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm flex-shrink-0">
                                                {module.level}
                                            </div>
                                            <div className="text-left min-w-0 flex-1">
                                                <p className="font-semibold text-sm sm:text-base truncate">{module.name}</p>
                                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                                    {module.hours}h • {module.progress.evaluated}/{module.progress.total}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                            {module.progress.average_score !== null && (
                                                <div className="text-right hidden sm:block">
                                                    <p className={`font-bold text-sm ${getScoreColor(module.progress.average_score)}`}>
                                                        {module.progress.average_score}%
                                                    </p>
                                                </div>
                                            )}
                                            <div className="w-12 sm:w-20">
                                                <Progress value={module.progress.percentage} className="h-2" />
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pl-4 sm:pl-11 space-y-3 pt-2">
                                        {module.description && (
                                            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                                                {module.description}
                                            </p>
                                        )}

                                        {module.activities.length === 0 ? (
                                            <p className="text-xs sm:text-sm text-muted-foreground py-4 text-center">
                                                No hay actividades en este módulo
                                            </p>
                                        ) : (
                                            module.activities.map((activity) => (
                                                <div
                                                    key={activity.id}
                                                    className={`p-3 sm:p-4 rounded-lg border ${
                                                        activity.is_evaluated ? 'bg-card' : 'bg-muted'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div className="flex items-start gap-2 min-w-0 flex-1">
                                                            {activity.is_evaluated ? (
                                                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                            ) : (
                                                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="font-medium text-sm sm:text-base">{activity.name}</h4>
                                                                {activity.description && (
                                                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                                                        {activity.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            {activity.is_evaluated ? (
                                                                <>
                                                                    <p className={`text-base sm:text-lg font-bold ${getScoreColor(activity.percentage)}`}>
                                                                        {activity.percentage}%
                                                                    </p>
                                                                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                                                                        {activity.points_earned}/{activity.total_max_points} pts
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <Badge variant="outline" className="text-[10px] sm:text-xs">
                                                                    Pendiente
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground mt-2">
                                                        <span className="flex items-center gap-1">
                                                            <Star className="h-3 w-3" />
                                                            Peso: {activity.weight}%
                                                        </span>
                                                        {activity.evaluation_date && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {new Date(activity.evaluation_date).toLocaleDateString('es-ES')}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {activity.is_evaluated && activity.criteria_evaluations.length > 0 && (
                                                        <div className="mt-3 pt-3 border-t">
                                                            <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">
                                                                Desglose por criterio:
                                                            </p>
                                                            <div className="space-y-1">
                                                                {activity.criteria_evaluations.map((criteria, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="flex items-center justify-between text-xs sm:text-sm"
                                                                    >
                                                                        <span className="text-muted-foreground truncate flex-1 mr-2">
                                                                            {criteria.criteria_name}
                                                                        </span>
                                                                        <span className="font-medium flex-shrink-0">
                                                                            {criteria.points_earned}/{criteria.max_points}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activity.feedback && (
                                                        <div className="mt-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                                            <div className="flex items-start gap-2">
                                                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[10px] sm:text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                                                                        Comentario del profesor:
                                                                    </p>
                                                                    <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                                                                        {activity.feedback}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </CardContent>
        </Card>
    );
}

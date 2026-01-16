import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    GraduationCap,
    BookOpen,
    Award,
    TrendingUp,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronLeft,
    Star,
    FileText,
} from 'lucide-react';

interface Enrollment {
    id: number;
    program_id: number;
    program_name: string;
    program_color: string;
    status: string;
}

interface CriteriaEvaluation {
    criteria_name: string;
    max_points: number;
    points_earned: number;
}

interface Activity {
    id: number;
    name: string;
    description: string | null;
    weight: number;
    total_max_points: number;
    points_earned: number;
    percentage: number | null;
    is_evaluated: boolean;
    evaluation_date: string | null;
    feedback: string | null;
    criteria_evaluations: CriteriaEvaluation[];
}

interface ModuleProgress {
    evaluated: number;
    total: number;
    percentage: number;
    average_score: number | null;
}

interface Module {
    id: number;
    name: string;
    description: string | null;
    level: number;
    hours: number;
    activities: Activity[];
    progress: ModuleProgress;
}

interface SelectedProgram {
    id: number;
    name: string;
    description: string | null;
    color: string;
}

interface ProgramStats {
    total_modules: number;
    total_activities: number;
    evaluated_activities: number;
    overall_progress: number;
    overall_average: number | null;
}

interface Props {
    enrollments: Enrollment[];
    selectedProgramId: number | null;
    selectedProgram: SelectedProgram | null;
    modules: Module[];
    programStats: ProgramStats | null;
}

export default function Grades({
    enrollments,
    selectedProgramId,
    selectedProgram,
    modules,
    programStats,
}: Props) {
    const handleProgramChange = (programId: string) => {
        router.get(`/estudiante/calificaciones/${programId}`);
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return 'text-gray-400';
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBadge = (score: number | null) => {
        if (score === null) return <Badge variant="outline">Pendiente</Badge>;
        if (score >= 80) return <Badge className="bg-green-500">Excelente</Badge>;
        if (score >= 60) return <Badge className="bg-yellow-500">Aprobado</Badge>;
        return <Badge variant="destructive">Necesita mejorar</Badge>;
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        if (percentage > 0) return 'bg-red-500';
        return 'bg-gray-300';
    };

    return (
        <AppLayout>
            <Head title="Mis Calificaciones" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/estudiante/mi-portal">
                                <Button variant="ghost" size="sm" className="gap-1">
                                    <ChevronLeft className="h-4 w-4" />
                                    Volver
                                </Button>
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Mis Calificaciones</h1>
                        <p className="text-muted-foreground mt-1">
                            Revisa tu progreso y calificaciones por programa
                        </p>
                    </div>

                    {/* Program Selector */}
                    <div className="w-full sm:w-64">
                        <Select
                            value={selectedProgramId?.toString() || ''}
                            onValueChange={handleProgramChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un programa" />
                            </SelectTrigger>
                            <SelectContent>
                                {enrollments.map((enrollment) => (
                                    <SelectItem
                                        key={enrollment.program_id}
                                        value={enrollment.program_id.toString()}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: enrollment.program_color }}
                                            />
                                            {enrollment.program_name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {!selectedProgram ? (
                    /* No program selected */
                    <Card>
                        <CardContent className="py-12 text-center">
                            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">
                                Selecciona un programa
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Elige uno de tus programas académicos para ver tus calificaciones
                                y progreso detallado.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Program Header */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: selectedProgram.color }}
                                    />
                                    <div>
                                        <CardTitle>{selectedProgram.name}</CardTitle>
                                        {selectedProgram.description && (
                                            <CardDescription className="mt-1">
                                                {selectedProgram.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Stats Cards */}
                        {programStats && (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Progreso General
                                        </CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {programStats.overall_progress}%
                                        </div>
                                        <Progress
                                            value={programStats.overall_progress}
                                            className="mt-2 h-2"
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Promedio General
                                        </CardTitle>
                                        <Award className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${getScoreColor(programStats.overall_average)}`}>
                                            {programStats.overall_average !== null
                                                ? `${programStats.overall_average}%`
                                                : 'N/A'}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {getScoreBadge(programStats.overall_average)}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Módulos
                                        </CardTitle>
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {programStats.total_modules}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            módulos en el programa
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Actividades Evaluadas
                                        </CardTitle>
                                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {programStats.evaluated_activities}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                /{programStats.total_activities}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            actividades completadas
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Modules with Activities */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Módulos y Calificaciones</CardTitle>
                                <CardDescription>
                                    Desglose de tu progreso por módulo y actividad
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {modules.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>Este programa aún no tiene módulos configurados</p>
                                    </div>
                                ) : (
                                    <Accordion type="multiple" className="w-full">
                                        {modules.map((module) => (
                                            <AccordionItem key={module.id} value={`module-${module.id}`}>
                                                <AccordionTrigger className="hover:no-underline">
                                                    <div className="flex items-center justify-between w-full pr-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                                {module.level}
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-semibold">{module.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {module.hours} horas • {module.progress.evaluated}/{module.progress.total} actividades
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {module.progress.average_score !== null && (
                                                                <div className="text-right">
                                                                    <p className={`font-bold ${getScoreColor(module.progress.average_score)}`}>
                                                                        {module.progress.average_score}%
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        promedio
                                                                    </p>
                                                                </div>
                                                            )}
                                                            <div className="w-20">
                                                                <Progress
                                                                    value={module.progress.percentage}
                                                                    className="h-2"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="pl-11 space-y-3 pt-2">
                                                        {module.description && (
                                                            <p className="text-sm text-muted-foreground mb-4">
                                                                {module.description}
                                                            </p>
                                                        )}

                                                        {module.activities.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground py-4 text-center">
                                                                No hay actividades en este módulo
                                                            </p>
                                                        ) : (
                                                            module.activities.map((activity) => (
                                                                <div
                                                                    key={activity.id}
                                                                    className={`p-4 rounded-lg border ${
                                                                        activity.is_evaluated
                                                                            ? 'bg-white'
                                                                            : 'bg-gray-50'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div className="flex items-start gap-2">
                                                                            {activity.is_evaluated ? (
                                                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                                                            ) : (
                                                                                <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                                                                            )}
                                                                            <div>
                                                                                <h4 className="font-medium">
                                                                                    {activity.name}
                                                                                </h4>
                                                                                {activity.description && (
                                                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                                                        {activity.description}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            {activity.is_evaluated ? (
                                                                                <>
                                                                                    <p className={`text-lg font-bold ${getScoreColor(activity.percentage)}`}>
                                                                                        {activity.percentage}%
                                                                                    </p>
                                                                                    <p className="text-xs text-muted-foreground">
                                                                                        {activity.points_earned}/{activity.total_max_points} pts
                                                                                    </p>
                                                                                </>
                                                                            ) : (
                                                                                <Badge variant="outline">
                                                                                    Pendiente
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Activity Details */}
                                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
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

                                                                    {/* Criteria Breakdown */}
                                                                    {activity.is_evaluated && activity.criteria_evaluations.length > 0 && (
                                                                        <div className="mt-3 pt-3 border-t">
                                                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                                                Desglose por criterio:
                                                                            </p>
                                                                            <div className="space-y-1">
                                                                                {activity.criteria_evaluations.map((criteria, idx) => (
                                                                                    <div
                                                                                        key={idx}
                                                                                        className="flex items-center justify-between text-sm"
                                                                                    >
                                                                                        <span className="text-muted-foreground">
                                                                                            {criteria.criteria_name}
                                                                                        </span>
                                                                                        <span className="font-medium">
                                                                                            {criteria.points_earned}/{criteria.max_points}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Feedback */}
                                                                    {activity.feedback && (
                                                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                                            <div className="flex items-start gap-2">
                                                                                <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
                                                                                <div>
                                                                                    <p className="text-xs font-medium text-blue-900 mb-1">
                                                                                        Comentario del profesor:
                                                                                    </p>
                                                                                    <p className="text-sm text-blue-800">
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
                    </>
                )}
            </div>
        </AppLayout>
    );
}

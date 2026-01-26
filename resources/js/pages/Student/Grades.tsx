import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    Star,
    FileText,
    XCircle,
    ClipboardCheck,
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

interface AttendanceStats {
    total_classes: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    percentage: number;
}

interface RecentAttendance {
    id: number;
    class_date: string;
    status: 'present' | 'late' | 'absent' | 'excused';
    notes: string | null;
    program_name: string;
    program_color: string;
    schedule_day: string | null;
    schedule_time: string | null;
}

interface Props {
    enrollments: Enrollment[];
    selectedProgramId: number | null;
    selectedProgram: SelectedProgram | null;
    modules: Module[];
    programStats: ProgramStats | null;
    attendanceStats: AttendanceStats;
    recentAttendances: RecentAttendance[];
}

export default function Grades({
    enrollments,
    selectedProgramId,
    selectedProgram,
    modules,
    programStats,
    attendanceStats,
    recentAttendances,
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

    const getAttendanceIcon = (status: string) => {
        switch (status) {
            case 'present':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'late':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            case 'absent':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'excused':
                return <Clock className="h-4 w-4 text-blue-500" />;
            default:
                return null;
        }
    };

    const getAttendanceBadge = (status: string) => {
        switch (status) {
            case 'present':
                return <Badge className="bg-green-500 text-[10px] sm:text-xs">Presente</Badge>;
            case 'late':
                return <Badge className="bg-yellow-500 text-[10px] sm:text-xs">Tarde</Badge>;
            case 'absent':
                return <Badge variant="destructive" className="text-[10px] sm:text-xs">Ausente</Badge>;
            case 'excused':
                return <Badge className="bg-blue-500 text-[10px] sm:text-xs">Excusado</Badge>;
            default:
                return <Badge variant="outline" className="text-[10px] sm:text-xs">{status}</Badge>;
        }
    };

    const dayNames: Record<string, string> = {
        'monday': 'Lunes',
        'tuesday': 'Martes',
        'wednesday': 'Miércoles',
        'thursday': 'Jueves',
        'friday': 'Viernes',
        'saturday': 'Sábado',
        'sunday': 'Domingo',
    };

    return (
        <AppLayout>
            <Head title="Mis Calificaciones" />

            <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Calificaciones</h1>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                            Revisa tu progreso y calificaciones por programa
                        </p>
                    </div>

                    {/* Program Selector */}
                    <div className="w-full sm:w-64">
                        <Select
                            value={selectedProgramId?.toString() || ''}
                            onValueChange={handleProgramChange}
                        >
                            <SelectTrigger className="text-sm sm:text-base">
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
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: enrollment.program_color }}
                                            />
                                            <span className="truncate">{enrollment.program_name}</span>
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
                        <CardContent className="py-8 sm:py-12 text-center">
                            <GraduationCap className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-base sm:text-lg font-semibold mb-2">
                                Selecciona un programa
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
                                Elige uno de tus programas académicos para ver tus calificaciones
                                y progreso detallado.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Program Header */}
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div
                                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: selectedProgram.color }}
                                    />
                                    <div className="min-w-0">
                                        <CardTitle className="text-base sm:text-lg truncate">{selectedProgram.name}</CardTitle>
                                        {selectedProgram.description && (
                                            <CardDescription className="mt-1 text-xs sm:text-sm line-clamp-2">
                                                {selectedProgram.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Stats Cards */}
                        {programStats && (
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                                        <CardTitle className="text-xs sm:text-sm font-medium">
                                            Progreso
                                        </CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground hidden sm:block" />
                                    </CardHeader>
                                    <CardContent className="p-3 sm:p-6 pt-0">
                                        <div className="text-xl sm:text-2xl font-bold">
                                            {programStats.overall_progress}%
                                        </div>
                                        <Progress
                                            value={programStats.overall_progress}
                                            className="mt-2 h-2"
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                                        <CardTitle className="text-xs sm:text-sm font-medium">
                                            Promedio
                                        </CardTitle>
                                        <Award className="h-4 w-4 text-muted-foreground hidden sm:block" />
                                    </CardHeader>
                                    <CardContent className="p-3 sm:p-6 pt-0">
                                        <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(programStats.overall_average)}`}>
                                            {programStats.overall_average !== null
                                                ? `${programStats.overall_average}%`
                                                : 'N/A'}
                                        </div>
                                        <div className="mt-1">
                                            {getScoreBadge(programStats.overall_average)}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                                        <CardTitle className="text-xs sm:text-sm font-medium">
                                            Módulos
                                        </CardTitle>
                                        <BookOpen className="h-4 w-4 text-muted-foreground hidden sm:block" />
                                    </CardHeader>
                                    <CardContent className="p-3 sm:p-6 pt-0">
                                        <div className="text-xl sm:text-2xl font-bold">
                                            {programStats.total_modules}
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                                            en el programa
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                                        <CardTitle className="text-xs sm:text-sm font-medium">
                                            Evaluadas
                                        </CardTitle>
                                        <CheckCircle className="h-4 w-4 text-muted-foreground hidden sm:block" />
                                    </CardHeader>
                                    <CardContent className="p-3 sm:p-6 pt-0">
                                        <div className="text-xl sm:text-2xl font-bold">
                                            {programStats.evaluated_activities}
                                            <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                                                /{programStats.total_activities}
                                            </span>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                                            actividades
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Modules with Activities */}
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
                                                                <Progress
                                                                    value={module.progress.percentage}
                                                                    className="h-2"
                                                                />
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
                                                                        activity.is_evaluated
                                                                            ? 'bg-white'
                                                                            : 'bg-gray-50'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                                        <div className="flex items-start gap-2 min-w-0 flex-1">
                                                                            {activity.is_evaluated ? (
                                                                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                                            ) : (
                                                                                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                                                            )}
                                                                            <div className="min-w-0 flex-1">
                                                                                <h4 className="font-medium text-sm sm:text-base">
                                                                                    {activity.name}
                                                                                </h4>
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

                                                                    {/* Activity Details */}
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

                                                                    {/* Criteria Breakdown */}
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

                                                                    {/* Feedback */}
                                                                    {activity.feedback && (
                                                                        <div className="mt-3 p-2 sm:p-3 bg-blue-50 rounded-lg">
                                                                            <div className="flex items-start gap-2">
                                                                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                                                <div className="min-w-0 flex-1">
                                                                                    <p className="text-[10px] sm:text-xs font-medium text-blue-900 mb-1">
                                                                                        Comentario del profesor:
                                                                                    </p>
                                                                                    <p className="text-xs sm:text-sm text-blue-800">
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

                {/* Attendance Section - Always visible */}
                <Card>
                    <CardHeader className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                                    <ClipboardCheck className="h-5 w-5" />
                                    Mi Asistencia
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Registro de asistencia a clases
                                </CardDescription>
                            </div>
                            <div className="text-left sm:text-right">
                                <div className={`text-2xl font-bold ${
                                    attendanceStats.percentage >= 80 ? 'text-green-600' :
                                    attendanceStats.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                    {attendanceStats.percentage}%
                                </div>
                                <p className="text-xs text-muted-foreground">Asistencia general</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                        {/* Attendance Summary */}
                        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
                            <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                                <div className="text-lg sm:text-xl font-bold text-green-600">{attendanceStats.present}</div>
                                <div className="text-[10px] sm:text-xs text-green-700">Presente</div>
                            </div>
                            <div className="text-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
                                <div className="text-lg sm:text-xl font-bold text-yellow-600">{attendanceStats.late}</div>
                                <div className="text-[10px] sm:text-xs text-yellow-700">Tarde</div>
                            </div>
                            <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
                                <div className="text-lg sm:text-xl font-bold text-red-600">{attendanceStats.absent}</div>
                                <div className="text-[10px] sm:text-xs text-red-700">Ausente</div>
                            </div>
                            <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                                <div className="text-lg sm:text-xl font-bold text-blue-600">{attendanceStats.excused}</div>
                                <div className="text-[10px] sm:text-xs text-blue-700">Excusado</div>
                            </div>
                        </div>

                        {/* Recent Attendances List */}
                        <h4 className="font-semibold text-sm mb-3">Últimos registros</h4>
                        {recentAttendances.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No hay registros de asistencia aún</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {recentAttendances.map((attendance) => (
                                    <div
                                        key={attendance.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            {getAttendanceIcon(attendance.status)}
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-sm truncate">{attendance.program_name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {attendance.schedule_day && dayNames[attendance.schedule_day]}
                                                    {attendance.schedule_time && ` - ${attendance.schedule_time}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            {getAttendanceBadge(attendance.status)}
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(attendance.class_date).toLocaleDateString('es-ES')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    Users,
    GraduationCap,
    TrendingUp,
    Award,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    CreditCard,
    Eye,
    ClipboardCheck,
    User,
} from 'lucide-react';

interface AttendanceStats {
    total_classes: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    percentage: number;
}

interface ProgramSummary {
    total_modules: number;
    total_activities: number;
    evaluated_activities: number;
    overall_progress: number;
    overall_average: number | null;
}

interface ChildEnrollment {
    id: number;
    program_id: number;
    program_name: string;
    program_color: string;
    status: string;
    enrollment_date: string;
    stats: ProgramSummary;
}

interface Child {
    id: number;
    name: string;
    last_name: string | null;
    document_type: string;
    document_number: string;
    birth_date: string;
    age: number;
    enrollments: ChildEnrollment[];
    attendance: AttendanceStats;
    pending_payments: number;
}

interface Props {
    children: Child[];
}

export default function Dashboard({ children }: Props) {
    const getScoreColor = (score: number | null) => {
        if (score === null) return 'text-gray-400';
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBadge = (score: number | null) => {
        if (score === null) return <Badge variant="outline">Sin evaluar</Badge>;
        if (score >= 80) return <Badge className="bg-green-500">Excelente</Badge>;
        if (score >= 60) return <Badge className="bg-yellow-500">Aprobado</Badge>;
        return <Badge variant="destructive">Necesita mejorar</Badge>;
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Activo';
            case 'waiting': return 'En espera';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500';
            case 'waiting': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <AppLayout>
            <Head title="Mis Hijos" />

            <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
                {/* Header */}
                <div className="text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 justify-center sm:justify-start">
                        <Users className="h-7 w-7 sm:h-8 sm:w-8" />
                        Mis Hijos
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Seguimiento académico de tus hijos matriculados
                    </p>
                </div>

                {children.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 sm:py-12 text-center">
                            <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-base sm:text-lg font-semibold mb-2">
                                No tienes hijos registrados
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
                                Cuando matricules a tus hijos, aquí podrás ver su avance académico,
                                calificaciones y asistencia.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {children.map((child) => (
                            <Card key={child.id} className="overflow-hidden">
                                {/* Child Header */}
                                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 text-amber-700">
                                                <User className="h-5 w-5 sm:h-6 sm:w-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg sm:text-xl">
                                                    {child.name} {child.last_name ?? ''}
                                                </CardTitle>
                                                <CardDescription className="text-xs sm:text-sm">
                                                    {child.document_type} {child.document_number}
                                                    {child.age && ` • ${child.age} años`}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {child.pending_payments > 0 && (
                                                <Badge variant="destructive" className="flex items-center gap-1">
                                                    <CreditCard className="h-3 w-3" />
                                                    {child.pending_payments} pago{child.pending_payments > 1 ? 's' : ''} pendiente{child.pending_payments > 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6 space-y-4">
                                    {/* Enrollments / Programs */}
                                    {child.enrollments.length === 0 ? (
                                        <div className="text-center py-4 text-muted-foreground text-sm">
                                            <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            No tiene matrículas activas
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                                                Programas Matriculados
                                            </h4>
                                            {child.enrollments.map((enrollment) => (
                                                <div
                                                    key={enrollment.id}
                                                    className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                        {/* Program Info */}
                                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                                            <div
                                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                                style={{ backgroundColor: enrollment.program_color }}
                                                            />
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <p className="font-semibold text-sm sm:text-base truncate">
                                                                        {enrollment.program_name}
                                                                    </p>
                                                                    <Badge className={`${getStatusColor(enrollment.status)} text-[10px] sm:text-xs`}>
                                                                        {getStatusLabel(enrollment.status)}
                                                                    </Badge>
                                                                </div>
                                                                {enrollment.enrollment_date && (
                                                                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                                                                        Matriculado: {new Date(enrollment.enrollment_date).toLocaleDateString('es-ES')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Stats */}
                                                        <div className="flex items-center gap-4 sm:gap-6">
                                                            {/* Progress */}
                                                            <div className="text-center">
                                                                <div className="flex items-center gap-1">
                                                                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">Progreso</span>
                                                                </div>
                                                                <p className="text-sm sm:text-base font-bold">
                                                                    {enrollment.stats.overall_progress}%
                                                                </p>
                                                                <Progress
                                                                    value={enrollment.stats.overall_progress}
                                                                    className="h-1.5 w-16 sm:w-20 mt-0.5"
                                                                />
                                                            </div>

                                                            {/* Average */}
                                                            <div className="text-center">
                                                                <div className="flex items-center gap-1">
                                                                    <Award className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">Promedio</span>
                                                                </div>
                                                                <p className={`text-sm sm:text-base font-bold ${getScoreColor(enrollment.stats.overall_average)}`}>
                                                                    {enrollment.stats.overall_average !== null
                                                                        ? `${enrollment.stats.overall_average}%`
                                                                        : 'N/A'}
                                                                </p>
                                                                <div className="mt-0.5">
                                                                    {getScoreBadge(enrollment.stats.overall_average)}
                                                                </div>
                                                            </div>

                                                            {/* Activities */}
                                                            <div className="text-center hidden sm:block">
                                                                <div className="flex items-center gap-1">
                                                                    <CheckCircle className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">Evaluadas</span>
                                                                </div>
                                                                <p className="text-sm font-bold">
                                                                    {enrollment.stats.evaluated_activities}
                                                                    <span className="text-xs font-normal text-muted-foreground">
                                                                        /{enrollment.stats.total_activities}
                                                                    </span>
                                                                </p>
                                                            </div>

                                                            {/* View Button */}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    router.visit(
                                                                        `/padre/hijo/${child.id}/calificaciones/${enrollment.program_id}`,
                                                                    )
                                                                }
                                                            >
                                                                <Eye className="h-4 w-4 sm:mr-1" />
                                                                <span className="hidden sm:inline">Ver Calificaciones</span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Attendance Summary */}
                                    {child.attendance.total_classes > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                                <ClipboardCheck className="h-4 w-4" />
                                                Asistencia General
                                            </h4>
                                            <div className="grid grid-cols-5 gap-2">
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <div className={`text-lg font-bold ${
                                                        child.attendance.percentage >= 80 ? 'text-green-600' :
                                                        child.attendance.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                        {child.attendance.percentage}%
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">Total</div>
                                                </div>
                                                <div className="text-center p-2 bg-green-50 rounded-lg">
                                                    <div className="text-lg font-bold text-green-600 flex items-center justify-center gap-0.5">
                                                        <CheckCircle className="h-3 w-3" />
                                                        {child.attendance.present}
                                                    </div>
                                                    <div className="text-[10px] text-green-700">Presente</div>
                                                </div>
                                                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                                                    <div className="text-lg font-bold text-yellow-600 flex items-center justify-center gap-0.5">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {child.attendance.late}
                                                    </div>
                                                    <div className="text-[10px] text-yellow-700">Tarde</div>
                                                </div>
                                                <div className="text-center p-2 bg-red-50 rounded-lg">
                                                    <div className="text-lg font-bold text-red-600 flex items-center justify-center gap-0.5">
                                                        <XCircle className="h-3 w-3" />
                                                        {child.attendance.absent}
                                                    </div>
                                                    <div className="text-[10px] text-red-700">Ausente</div>
                                                </div>
                                                <div className="text-center p-2 bg-blue-50 rounded-lg">
                                                    <div className="text-lg font-bold text-blue-600 flex items-center justify-center gap-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        {child.attendance.excused}
                                                    </div>
                                                    <div className="text-[10px] text-blue-700">Excusado</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

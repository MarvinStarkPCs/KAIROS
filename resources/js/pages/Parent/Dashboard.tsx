import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
    Smartphone,
    LinkIcon,
    Unlink,
} from 'lucide-react';

interface Payment {
    id: number;
    concept: string;
    amount: number;
    status: string;
    due_date: string | null;
    paid_at: string | null;
    program_name: string | null;
    program_color: string;
    payment_method: string | null;
}

function formatCOP(amount: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

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
    payments: Payment[];
}

interface NequiInfo {
    phone: string | null;
    active: boolean;
    payment_source_id: string | null;
}

interface Props {
    children: Child[];
    nequi: NequiInfo;
}

export default function Dashboard({ children, nequi }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({ phone: nequi.phone ?? '' });
    const [paymentsModal, setPaymentsModal] = useState<Child | null>(null);

    const handleLink = (e: React.FormEvent) => {
        e.preventDefault();
        post('/padre/nequi/vincular', { preserveScroll: true, onSuccess: () => reset() });
    };

    const handleUnlink = () => {
        router.delete('/padre/nequi/desvincular', { preserveScroll: true });
    };
    const getScoreColor = (score: number | null) => {
        if (score === null) return 'text-muted-foreground';
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 justify-center sm:justify-start">
                        <Users className="h-7 w-7 sm:h-8 sm:w-8" />
                        Mis Hijos
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        Seguimiento académico de tus hijos matriculados
                    </p>
                </div>

                {/* Nequi automático */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Smartphone className="h-4 w-4 text-pink-500" />
                            Pagos automáticos con Nequi
                        </CardTitle>
                        <CardDescription>
                            Vincula tu cuenta Nequi y autoriza solo una vez. Desde ese momento los pagos
                            mensuales de tus hijos se cobran automáticamente sin que debas aprobar cada mes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {nequi.phone && nequi.active ? (
                            /* Activo: débito automático sin push */
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{nequi.phone}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Cobros automáticos activos — se debitará sin necesidad de aprobar cada mes
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={handleUnlink}
                                >
                                    <Unlink className="mr-1.5 h-3.5 w-3.5" />
                                    Desvincular
                                </Button>
                            </div>
                        ) : nequi.phone && nequi.payment_source_id ? (
                            /* Vinculado pero pendiente de autorización */
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{nequi.phone}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Pendiente de autorización — abre tu app Nequi y acepta la notificación
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={handleUnlink}
                                >
                                    <Unlink className="mr-1.5 h-3.5 w-3.5" />
                                    Cancelar
                                </Button>
                            </div>
                        ) : (
                            /* Sin vincular */
                            <form onSubmit={handleLink} className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor="nequi-phone">Número Nequi (celular)</Label>
                                    <Input
                                        id="nequi-phone"
                                        type="tel"
                                        placeholder="3001234567"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        maxLength={10}
                                        className="max-w-xs"
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-destructive">{errors.phone}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Solo autorizas una vez. Después los cobros mensuales son automáticos.
                                    </p>
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" disabled={processing} className="bg-pink-600 hover:bg-pink-700 text-white">
                                        <LinkIcon className="mr-2 h-4 w-4" />
                                        {processing ? 'Vinculando...' : 'Vincular Nequi'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

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
                                <CardHeader className="bg-gradient-to-r from-amber-50 dark:from-amber-950/30 to-orange-50 dark:to-orange-950/30 p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
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
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {child.pending_payments > 0 && (
                                                <Badge variant="destructive" className="flex items-center gap-1">
                                                    <CreditCard className="h-3 w-3" />
                                                    {child.pending_payments} pago{child.pending_payments > 1 ? 's' : ''} pendiente{child.pending_payments > 1 ? 's' : ''}
                                                </Badge>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setPaymentsModal(child)}
                                                className="text-xs h-7"
                                            >
                                                <CreditCard className="h-3.5 w-3.5 mr-1" />
                                                Ver pagos
                                            </Button>
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
                                                    className="border rounded-lg p-3 sm:p-4 hover:bg-muted transition-colors"
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
                                                <div className="text-center p-2 bg-muted rounded-lg">
                                                    <div className={`text-lg font-bold ${
                                                        child.attendance.percentage >= 80 ? 'text-green-600' :
                                                        child.attendance.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>
                                                        {child.attendance.percentage}%
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground">Total</div>
                                                </div>
                                                <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                                                    <div className="text-lg font-bold text-green-600 flex items-center justify-center gap-0.5">
                                                        <CheckCircle className="h-3 w-3" />
                                                        {child.attendance.present}
                                                    </div>
                                                    <div className="text-[10px] text-green-700 dark:text-green-300">Presente</div>
                                                </div>
                                                <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                                                    <div className="text-lg font-bold text-yellow-600 flex items-center justify-center gap-0.5">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {child.attendance.late}
                                                    </div>
                                                    <div className="text-[10px] text-yellow-700 dark:text-yellow-300">Tarde</div>
                                                </div>
                                                <div className="text-center p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
                                                    <div className="text-lg font-bold text-red-600 flex items-center justify-center gap-0.5">
                                                        <XCircle className="h-3 w-3" />
                                                        {child.attendance.absent}
                                                    </div>
                                                    <div className="text-[10px] text-red-700 dark:text-red-300">Ausente</div>
                                                </div>
                                                <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                                    <div className="text-lg font-bold text-blue-600 flex items-center justify-center gap-0.5">
                                                        <Clock className="h-3 w-3" />
                                                        {child.attendance.excused}
                                                    </div>
                                                    <div className="text-[10px] text-blue-700 dark:text-blue-300">Excusado</div>
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

            {/* Modal de pagos */}
            <Dialog open={!!paymentsModal} onOpenChange={(open) => !open && setPaymentsModal(null)}>
                <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <CreditCard className="h-4 w-4 shrink-0" />
                            {paymentsModal?.name} {paymentsModal?.last_name ?? ''}
                        </DialogTitle>
                    </DialogHeader>

                    {paymentsModal && (() => {
                        const pending = paymentsModal.payments.filter(p => p.status === 'pending' || p.status === 'overdue');
                        const paid    = paymentsModal.payments.filter(p => p.status === 'completed' || p.status === 'approved');

                        return (
                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                                {pending.length === 0 && paid.length === 0 && (
                                    <div className="py-8 text-center text-muted-foreground text-sm">
                                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                        Sin registros de pago
                                    </div>
                                )}

                                {pending.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Pendientes ({pending.length})
                                        </p>
                                        {pending.map(p => (
                                            <div key={p.id} className="rounded-lg border p-3 space-y-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-medium leading-tight">{p.concept}</p>
                                                    <Badge variant={p.status === 'overdue' ? 'destructive' : 'secondary'} className="text-xs shrink-0">
                                                        {p.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-muted-foreground">
                                                        {p.program_name}
                                                        {p.due_date && ` · Vence ${new Date(p.due_date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}`}
                                                    </p>
                                                    <p className="text-sm font-bold">{formatCOP(p.amount)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {paid.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Historial ({paid.length})
                                        </p>
                                        {paid.map(p => (
                                            <div key={p.id} className="rounded-lg border p-3 space-y-1 opacity-70">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-medium leading-tight">{p.concept}</p>
                                                    <Badge variant="outline" className="text-xs text-green-600 border-green-300 shrink-0">
                                                        Pagado
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-muted-foreground">
                                                        {p.paid_at && new Date(p.paid_at + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        {p.payment_method === 'nequi' && <span className="ml-1 text-pink-500">· Nequi</span>}
                                                    </p>
                                                    <p className="text-sm font-bold">{formatCOP(p.amount)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

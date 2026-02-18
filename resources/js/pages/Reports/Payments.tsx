import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    DollarSign,
    Clock,
    AlertTriangle,
    CreditCard,
    Download,
    Search,
    BarChart3,
    TrendingUp,
    CalendarDays,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';

// === INTERFACES ===
interface SummaryData {
    total_recaudado: number;
    total_pendiente: number;
    pagos_vencidos_count: number;
    pagos_vencidos_amount: number;
    total_pagos: number;
    pagos_completados: number;
    pagos_pendientes: number;
    pagos_cancelados: number;
}

interface MonthlyRevenueItem {
    month: string;
    total: number;
}

interface StatusDistributionItem {
    status: string;
    label: string;
    count: number;
    total: number;
}

interface RevenueByProgramItem {
    program_name: string;
    total: number;
    count: number;
}

interface PaymentMethodItem {
    method: string;
    label: string;
    count: number;
    total: number;
}

interface RevenueByModalityItem {
    modality: string;
    total: number;
    count: number;
}

interface ReportPayment {
    id: number;
    student: { id: number; name: string; last_name: string | null };
    program?: { id: number; name: string };
    concept: string;
    modality?: string;
    amount: number;
    paid_amount: number;
    remaining_amount: number;
    status: 'pending' | 'completed' | 'overdue' | 'cancelled';
    payment_method?: string;
    due_date: string;
    payment_date?: string;
    created_at: string;
}

interface Props {
    summary: SummaryData;
    monthlyRevenue: MonthlyRevenueItem[];
    statusDistribution: StatusDistributionItem[];
    revenueByProgram: RevenueByProgramItem[];
    paymentMethodBreakdown: PaymentMethodItem[];
    revenueByModality: RevenueByModalityItem[];
    recentPayments: ReportPayment[];
    overduePayments: ReportPayment[];
    filters: {
        start_date: string;
        end_date: string;
    };
}

// === CONSTANTS ===
const STATUS_COLORS: Record<string, string> = {
    completed: '#22c55e',
    pending: '#eab308',
    overdue: '#ef4444',
    cancelled: '#94a3b8',
};

const STATUS_LABELS: Record<string, string> = {
    completed: 'Completado',
    pending: 'Pendiente',
    overdue: 'Vencido',
    cancelled: 'Cancelado',
};

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const MODALITY_LABELS: Record<string, string> = {
    'Linaje Kids': 'Linaje Kids (4-9 años)',
    'Linaje Teens': 'Linaje Teens (10-17 años)',
    'Linaje Big': 'Linaje Big (18+ años)',
};

const MODALITY_COLORS: Record<string, string> = {
    'Linaje Kids': '#f59e0b',
    'Linaje Teens': '#3b82f6',
    'Linaje Big': '#22c55e',
};

// === HELPERS ===
const formatCurrency = (value: number) =>
    '$' + value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date + 'T00:00:00').toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const getDaysOverdue = (dueDate: string): number => {
    const due = new Date(dueDate + 'T00:00:00');
    const now = new Date();
    const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
};

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
            <p className="text-sm font-medium text-foreground">{label}</p>
            {payload.map((item: any, i: number) => (
                <p key={i} className="text-sm text-muted-foreground">
                    {formatCurrency(Number(item.value))}
                </p>
            ))}
        </div>
    );
};

const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0];
    return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
            <p className="text-sm font-medium text-foreground">{data.name}</p>
            <p className="text-sm text-muted-foreground">{formatCurrency(Number(data.value))}</p>
            <p className="text-xs text-muted-foreground">{data.payload.count} pagos</p>
        </div>
    );
};

// === STATUS BADGE ===
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        completed: {
            label: 'Completado',
            className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        },
        pending: {
            label: 'Pendiente',
            className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        },
        overdue: {
            label: 'Vencido',
            className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        },
        cancelled: {
            label: 'Cancelado',
            className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        },
    };

    const { label, className } = config[status] || { label: status, className: '' };
    return <Badge className={className}>{label}</Badge>;
}

// === MAIN COMPONENT ===
export default function PaymentReports({
    summary,
    monthlyRevenue,
    statusDistribution,
    revenueByProgram,
    paymentMethodBreakdown,
    revenueByModality,
    recentPayments,
    overduePayments,
    filters,
}: Props) {
    const [dateRange, setDateRange] = useState({
        start_date: filters.start_date,
        end_date: filters.end_date,
    });

    const applyFilter = () => {
        router.get('/reportes/pagos', dateRange, { preserveState: true, preserveScroll: true });
    };

    const setQuickRange = (start: Date, end: Date) => {
        const fmt = (d: Date) => d.toISOString().split('T')[0];
        const newRange = { start_date: fmt(start), end_date: fmt(end) };
        setDateRange(newRange);
        router.get('/reportes/pagos', newRange, { preserveState: true, preserveScroll: true });
    };

    const setThisMonth = () => {
        const now = new Date();
        setQuickRange(new Date(now.getFullYear(), now.getMonth(), 1), now);
    };

    const setLastQuarter = () => {
        const now = new Date();
        setQuickRange(new Date(now.getFullYear(), now.getMonth() - 3, 1), now);
    };

    const setThisYear = () => {
        const now = new Date();
        setQuickRange(new Date(now.getFullYear(), 0, 1), now);
    };

    const exportUrl = `/reportes/pagos/export?start_date=${filters.start_date}&end_date=${filters.end_date}`;

    return (
        <AppLayout>
            <Head title="Reportes de Pagos" />

            <div className="space-y-6">
                {/* === HEADER === */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Reportes de Pagos</h1>
                        <p className="mt-1 text-muted-foreground">
                            Resumen financiero y estadísticas de pagos
                        </p>
                    </div>
                    <a href={exportUrl}>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar CSV
                        </Button>
                    </a>
                </div>

                {/* === DATE RANGE FILTER === */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={setThisMonth}>
                                    <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                                    Este mes
                                </Button>
                                <Button variant="outline" size="sm" onClick={setLastQuarter}>
                                    Último trimestre
                                </Button>
                                <Button variant="outline" size="sm" onClick={setThisYear}>
                                    Este año
                                </Button>
                            </div>
                            <div className="flex items-end gap-3">
                                <div>
                                    <Label htmlFor="start_date" className="text-xs">
                                        Desde
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={dateRange.start_date}
                                        onChange={(e) =>
                                            setDateRange((prev) => ({ ...prev, start_date: e.target.value }))
                                        }
                                        className="w-40"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="end_date" className="text-xs">
                                        Hasta
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={dateRange.end_date}
                                        onChange={(e) =>
                                            setDateRange((prev) => ({ ...prev, end_date: e.target.value }))
                                        }
                                        className="w-40"
                                    />
                                </div>
                                <Button onClick={applyFilter}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Filtrar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* === KPI SUMMARY CARDS === */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Recaudado */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Recaudado</p>
                                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(summary.total_recaudado)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.pagos_completados} pagos completados
                                    </p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Pendiente */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Pendiente</p>
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {formatCurrency(summary.total_pendiente)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.pagos_pendientes} pagos pendientes
                                    </p>
                                </div>
                                <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
                                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pagos Vencidos */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pagos Vencidos</p>
                                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {formatCurrency(summary.pagos_vencidos_amount)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.pagos_vencidos_count} pagos vencidos
                                    </p>
                                </div>
                                <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total de Pagos */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total de Pagos</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {summary.total_pagos}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {summary.pagos_cancelados} cancelados
                                    </p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* === CHARTS === */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Monthly Revenue Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                Ingresos Mensuales
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {monthlyRevenue.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <BarChart3 className="mb-4 h-12 w-12 opacity-50" />
                                    <p>No hay datos de ingresos para este periodo</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={monthlyRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                            className="fill-muted-foreground"
                                        />
                                        <YAxis
                                            tickFormatter={(v) =>
                                                v >= 1000000
                                                    ? `$${(v / 1000000).toFixed(1)}M`
                                                    : `$${(v / 1000).toFixed(0)}k`
                                            }
                                            tick={{ fontSize: 12 }}
                                            className="fill-muted-foreground"
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Status Distribution Donut Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                Distribución por Estado
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {statusDistribution.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <BarChart3 className="mb-4 h-12 w-12 opacity-50" />
                                    <p>No hay datos para este periodo</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            dataKey="count"
                                            nameKey="label"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                        >
                                            {statusDistribution.map((entry) => (
                                                <Cell
                                                    key={entry.status}
                                                    fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Revenue by Program Horizontal Bar Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                Ingresos por Programa
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {revenueByProgram.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <BarChart3 className="mb-4 h-12 w-12 opacity-50" />
                                    <p>No hay datos por programa para este periodo</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={Math.max(200, revenueByProgram.length * 50)}>
                                    <BarChart data={revenueByProgram} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                        <XAxis
                                            type="number"
                                            tickFormatter={(v) =>
                                                v >= 1000000
                                                    ? `$${(v / 1000000).toFixed(1)}M`
                                                    : `$${(v / 1000).toFixed(0)}k`
                                            }
                                            tick={{ fontSize: 12 }}
                                            className="fill-muted-foreground"
                                        />
                                        <YAxis
                                            dataKey="program_name"
                                            type="category"
                                            width={150}
                                            tick={{ fontSize: 12 }}
                                            className="fill-muted-foreground"
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Method Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                Métodos de Pago
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {paymentMethodBreakdown.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <CreditCard className="mb-4 h-12 w-12 opacity-50" />
                                    <p>No hay datos de métodos de pago para este periodo</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={paymentMethodBreakdown}
                                            dataKey="total"
                                            nameKey="label"
                                            outerRadius={100}
                                            paddingAngle={2}
                                        >
                                            {paymentMethodBreakdown.map((_, index) => (
                                                <Cell
                                                    key={index}
                                                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* === TABBED TABLES === */}
                <Tabs defaultValue="recent">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="recent">Pagos Recientes</TabsTrigger>
                        <TabsTrigger value="overdue">
                            Vencidos
                            {overduePayments.length > 0 && (
                                <Badge variant="destructive" className="ml-2 text-xs">
                                    {overduePayments.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="by-program">Por Programa</TabsTrigger>
                        <TabsTrigger value="by-modality">Por Modalidad</TabsTrigger>
                    </TabsList>

                    {/* Recent Payments Tab */}
                    <TabsContent value="recent">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Últimos 20 Pagos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentPayments.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No hay pagos en este periodo
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                                        Estudiante
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                                        Programa
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                                        Concepto
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                                                        Monto
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                                                        Pagado
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">
                                                        Estado
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                                        Fecha
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {recentPayments.map((payment) => (
                                                    <tr key={payment.id} className="hover:bg-muted/50">
                                                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                                                            {payment.student.name}{' '}
                                                            {payment.student.last_name || ''}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                                            {payment.program?.name || '—'}
                                                        </td>
                                                        <td className="max-w-[200px] truncate px-4 py-3 text-sm text-muted-foreground">
                                                            {payment.concept}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                                                            {formatCurrency(payment.amount)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                            {formatCurrency(payment.paid_amount)}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <StatusBadge status={payment.status} />
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                                            {formatDate(payment.created_at?.split('T')[0] || '')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Overdue Payments Tab */}
                    <TabsContent value="overdue">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Pagos Vencidos</CardTitle>
                                    {overduePayments.length > 0 && (
                                        <a
                                            href={`/reportes/pagos/export?start_date=${filters.start_date}&end_date=${filters.end_date}&type=overdue`}
                                        >
                                            <Button variant="outline" size="sm">
                                                <Download className="mr-2 h-3.5 w-3.5" />
                                                Exportar vencidos
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {overduePayments.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-green-600 dark:text-green-400">
                                            ¡No hay pagos vencidos! 🎉
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                                        Estudiante
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                                        Programa
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                                        Concepto
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                                                        Monto Pendiente
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                                        Fecha Vencimiento
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-muted-foreground">
                                                        Días Vencido
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {overduePayments.map((payment) => {
                                                    const days = getDaysOverdue(payment.due_date);
                                                    return (
                                                        <tr
                                                            key={payment.id}
                                                            className="hover:bg-muted/50"
                                                        >
                                                            <td className="px-4 py-3 text-sm font-medium text-foreground">
                                                                {payment.student.name}{' '}
                                                                {payment.student.last_name || ''}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                                {payment.program?.name || '—'}
                                                            </td>
                                                            <td className="max-w-[200px] truncate px-4 py-3 text-sm text-muted-foreground">
                                                                {payment.concept}
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-sm font-bold text-red-600 dark:text-red-400">
                                                                {formatCurrency(payment.remaining_amount)}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-muted-foreground">
                                                                {formatDate(payment.due_date)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <Badge
                                                                    className={
                                                                        days > 30
                                                                            ? 'bg-red-600 text-white'
                                                                            : days > 15
                                                                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                                    }
                                                                >
                                                                    {days} días
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Revenue by Program Tab */}
                    <TabsContent value="by-program">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Ingresos por Programa</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {revenueByProgram.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No hay datos por programa para este periodo
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                                        Programa
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                                                        Total Recaudado
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                                                        Cantidad de Pagos
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                                                        Promedio por Pago
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {revenueByProgram.map((item, index) => (
                                                    <tr key={index} className="hover:bg-muted/50">
                                                        <td className="px-4 py-3 text-sm font-medium text-foreground">
                                                            {item.program_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                                                            {formatCurrency(item.total)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                            {item.count}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                            {formatCurrency(
                                                                item.count > 0 ? item.total / item.count : 0,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Total row */}
                                                <tr className="bg-muted/50 font-bold">
                                                    <td className="px-4 py-3 text-sm text-foreground">Total</td>
                                                    <td className="px-4 py-3 text-right text-sm text-green-600 dark:text-green-400">
                                                        {formatCurrency(
                                                            revenueByProgram.reduce((sum, i) => sum + i.total, 0),
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-foreground">
                                                        {revenueByProgram.reduce((sum, i) => sum + i.count, 0)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                        —
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Revenue by Modality Tab */}
                    <TabsContent value="by-modality">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Ingresos por Modalidad</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {revenueByModality.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        No hay datos por modalidad para este periodo
                                    </p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                                        Modalidad
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                                                        Total Recaudado
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                                                        Cantidad de Pagos
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                                                        Promedio por Pago
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {revenueByModality.map((item, index) => (
                                                    <tr key={index} className="hover:bg-muted/50">
                                                        <td className="px-4 py-3 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="h-3 w-3 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            MODALITY_COLORS[item.modality] ||
                                                                            '#94a3b8',
                                                                    }}
                                                                />
                                                                <span className="font-medium text-foreground">
                                                                    {MODALITY_LABELS[item.modality] ||
                                                                        item.modality}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                                                            {formatCurrency(item.total)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                            {item.count}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                            {formatCurrency(
                                                                item.count > 0 ? item.total / item.count : 0,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {/* Total row */}
                                                <tr className="bg-muted/50 font-bold">
                                                    <td className="px-4 py-3 text-sm text-foreground">Total</td>
                                                    <td className="px-4 py-3 text-right text-sm text-green-600 dark:text-green-400">
                                                        {formatCurrency(
                                                            revenueByModality.reduce((sum, i) => sum + i.total, 0),
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-foreground">
                                                        {revenueByModality.reduce((sum, i) => sum + i.count, 0)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                        —
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

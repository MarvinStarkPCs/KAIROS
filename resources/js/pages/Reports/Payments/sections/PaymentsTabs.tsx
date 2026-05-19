import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrencyShort } from '@/lib/format';
import StatusBadge from '../StatusBadge';
import { formatDate, getDaysOverdue } from '../helpers';
import { MODALITY_LABELS, MODALITY_COLORS } from '../constants';
import type { ReportPayment, RevenueByProgramItem, RevenueByModalityItem, DateRange } from '../types';

interface Props {
    recentPayments: ReportPayment[];
    overduePayments: ReportPayment[];
    revenueByProgram: RevenueByProgramItem[];
    revenueByModality: RevenueByModalityItem[];
    filters: DateRange;
}

const TH = ({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) => (
    <th className={`px-4 py-3 text-${align} text-xs font-medium uppercase text-muted-foreground`}>
        {children}
    </th>
);

export default function PaymentsTabs({
    recentPayments,
    overduePayments,
    revenueByProgram,
    revenueByModality,
    filters,
}: Props) {
    const overdueExportUrl = `/reportes/pagos/export?start_date=${filters.start_date}&end_date=${filters.end_date}&type=overdue`;

    return (
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

            {/* Recent Payments */}
            <TabsContent value="recent">
                <Card>
                    <CardHeader><CardTitle className="text-base">Últimos 20 Pagos</CardTitle></CardHeader>
                    <CardContent>
                        {recentPayments.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">No hay pagos en este periodo</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <TH>Estudiante</TH>
                                            <TH>Programa</TH>
                                            <TH>Concepto</TH>
                                            <TH align="right">Monto</TH>
                                            <TH align="right">Pagado</TH>
                                            <TH align="center">Estado</TH>
                                            <TH>Fecha</TH>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recentPayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-muted/50">
                                                <td className="px-4 py-3 text-sm font-medium text-foreground">
                                                    {payment.student.name} {payment.student.last_name || ''}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {payment.program?.name || '—'}
                                                </td>
                                                <td className="max-w-[200px] truncate px-4 py-3 text-sm text-muted-foreground">
                                                    {payment.concept}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                                                    {formatCurrencyShort(payment.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                    {formatCurrencyShort(payment.paid_amount)}
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

            {/* Overdue Payments */}
            <TabsContent value="overdue">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Pagos Vencidos</CardTitle>
                            {overduePayments.length > 0 && (
                                <a href={overdueExportUrl}>
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
                                <p className="text-green-600 dark:text-green-400">¡No hay pagos vencidos! 🎉</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <TH>Estudiante</TH>
                                            <TH>Programa</TH>
                                            <TH>Concepto</TH>
                                            <TH align="right">Monto Pendiente</TH>
                                            <TH>Fecha Vencimiento</TH>
                                            <TH align="center">Días Vencido</TH>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {overduePayments.map((payment) => {
                                            const days = getDaysOverdue(payment.due_date);
                                            return (
                                                <tr key={payment.id} className="hover:bg-muted/50">
                                                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                                                        {payment.student.name} {payment.student.last_name || ''}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {payment.program?.name || '—'}
                                                    </td>
                                                    <td className="max-w-[200px] truncate px-4 py-3 text-sm text-muted-foreground">
                                                        {payment.concept}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600 dark:text-red-400">
                                                        {formatCurrencyShort(payment.remaining_amount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {formatDate(payment.due_date)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Badge className={
                                                            days > 30
                                                                ? 'bg-red-600 text-white'
                                                                : days > 15
                                                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }>
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

            {/* By Program */}
            <TabsContent value="by-program">
                <Card>
                    <CardHeader><CardTitle className="text-base">Ingresos por Programa</CardTitle></CardHeader>
                    <CardContent>
                        {revenueByProgram.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">No hay datos por programa para este periodo</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <TH>Programa</TH>
                                            <TH align="right">Total Recaudado</TH>
                                            <TH align="right">Cantidad de Pagos</TH>
                                            <TH align="right">Promedio por Pago</TH>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {revenueByProgram.map((item, index) => (
                                            <tr key={index} className="hover:bg-muted/50">
                                                <td className="px-4 py-3 text-sm font-medium text-foreground">{item.program_name}</td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                                                    {formatCurrencyShort(item.total)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">{item.count}</td>
                                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                    {formatCurrencyShort(item.count > 0 ? item.total / item.count : 0)}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-muted/50 font-bold">
                                            <td className="px-4 py-3 text-sm text-foreground">Total</td>
                                            <td className="px-4 py-3 text-right text-sm text-green-600 dark:text-green-400">
                                                {formatCurrencyShort(revenueByProgram.reduce((s, i) => s + i.total, 0))}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-foreground">
                                                {revenueByProgram.reduce((s, i) => s + i.count, 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-muted-foreground">—</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* By Modality */}
            <TabsContent value="by-modality">
                <Card>
                    <CardHeader><CardTitle className="text-base">Ingresos por Modalidad</CardTitle></CardHeader>
                    <CardContent>
                        {revenueByModality.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">No hay datos por modalidad para este periodo</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <TH>Modalidad</TH>
                                            <TH align="right">Total Recaudado</TH>
                                            <TH align="right">Cantidad de Pagos</TH>
                                            <TH align="right">Promedio por Pago</TH>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {revenueByModality.map((item, index) => (
                                            <tr key={index} className="hover:bg-muted/50">
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: MODALITY_COLORS[item.modality] || '#94a3b8' }}
                                                        />
                                                        <span className="font-medium text-foreground">
                                                            {MODALITY_LABELS[item.modality] || item.modality}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                                                    {formatCurrencyShort(item.total)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">{item.count}</td>
                                                <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                                                    {formatCurrencyShort(item.count > 0 ? item.total / item.count : 0)}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-muted/50 font-bold">
                                            <td className="px-4 py-3 text-sm text-foreground">Total</td>
                                            <td className="px-4 py-3 text-right text-sm text-green-600 dark:text-green-400">
                                                {formatCurrencyShort(revenueByModality.reduce((s, i) => s + i.total, 0))}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-foreground">
                                                {revenueByModality.reduce((s, i) => s + i.count, 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-muted-foreground">—</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}

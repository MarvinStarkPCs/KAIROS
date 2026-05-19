import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, getPaymentStatusBadge } from '../helpers';
import type { PaymentSummary, RecentPayment } from '../types';

interface Props {
    summary: PaymentSummary;
    recentPayments: RecentPayment[];
}

export default function PaymentSummaryCard({ summary, recentPayments }: Props) {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Resumen de Pagos
                </CardTitle>
                <CardDescription>Estado financiero del estudiante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4 text-center">
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summary.total}</p>
                        <p className="text-sm text-blue-600">Total Pagos</p>
                    </div>
                    <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-4 text-center">
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">{formatCurrency(summary.paid_amount)}</p>
                        <p className="text-sm text-green-600">Pagado</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{summary.pending}</p>
                        <p className="text-sm text-yellow-600">Pendientes</p>
                    </div>
                    {summary.overdue > 0 ? (
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-4 text-center">
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.overdue}</p>
                            <p className="text-sm text-red-600">Vencidos</p>
                        </div>
                    ) : (
                        <div className="rounded-lg bg-muted p-4 text-center">
                            <p className="text-2xl font-bold text-muted-foreground">{formatCurrency(summary.pending_amount)}</p>
                            <p className="text-sm text-muted-foreground">Por Pagar</p>
                        </div>
                    )}
                </div>

                {recentPayments.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3">Ultimos Pagos</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted">
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Concepto</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Programa</th>
                                        <th className="px-4 py-2 text-right font-medium text-muted-foreground">Monto</th>
                                        <th className="px-4 py-2 text-left font-medium text-muted-foreground">Vencimiento</th>
                                        <th className="px-4 py-2 text-center font-medium text-muted-foreground">Cuota</th>
                                        <th className="px-4 py-2 text-center font-medium text-muted-foreground">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {recentPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-muted transition-colors">
                                            <td className="px-4 py-2 font-medium">{payment.concept || '-'}</td>
                                            <td className="px-4 py-2 text-muted-foreground">{payment.program_name || '-'}</td>
                                            <td className="px-4 py-2 text-right font-medium">{formatCurrency(payment.amount)}</td>
                                            <td className="px-4 py-2 text-muted-foreground">
                                                {payment.due_date ? new Date(payment.due_date).toLocaleDateString('es-ES') : '-'}
                                            </td>
                                            <td className="px-4 py-2 text-center text-muted-foreground">
                                                {payment.installment_number && payment.total_installments
                                                    ? `${payment.installment_number}/${payment.total_installments}`
                                                    : '-'
                                                }
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                {getPaymentStatusBadge(payment.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

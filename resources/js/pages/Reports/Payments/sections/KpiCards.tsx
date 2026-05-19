import { DollarSign, Clock, AlertTriangle, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyShort } from '@/lib/format';
import type { SummaryData } from '../types';

interface Props {
    summary: SummaryData;
}

export default function KpiCards({ summary }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Recaudado</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrencyShort(summary.total_recaudado)}
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

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Pendiente</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {formatCurrencyShort(summary.total_pendiente)}
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

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pagos Vencidos</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {formatCurrencyShort(summary.pagos_vencidos_amount)}
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
    );
}

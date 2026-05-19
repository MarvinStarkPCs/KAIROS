export interface TooltipPayloadItem {
    value: number;
    name: string;
    payload: { count: number; [key: string]: unknown };
}

export interface ChartTooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
}

export interface SummaryData {
    total_recaudado: number;
    total_pendiente: number;
    pagos_vencidos_count: number;
    pagos_vencidos_amount: number;
    total_pagos: number;
    pagos_completados: number;
    pagos_pendientes: number;
    pagos_cancelados: number;
}

export interface MonthlyRevenueItem {
    month: string;
    total: number;
}

export interface StatusDistributionItem {
    status: string;
    label: string;
    count: number;
    total: number;
}

export interface RevenueByProgramItem {
    program_name: string;
    total: number;
    count: number;
}

export interface PaymentMethodItem {
    method: string;
    label: string;
    count: number;
    total: number;
}

export interface RevenueByModalityItem {
    modality: string;
    total: number;
    count: number;
}

export interface ReportPayment {
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

export interface DateRange {
    start_date: string;
    end_date: string;
}

export interface PaymentReportsProps {
    summary: SummaryData;
    monthlyRevenue: MonthlyRevenueItem[];
    statusDistribution: StatusDistributionItem[];
    revenueByProgram: RevenueByProgramItem[];
    paymentMethodBreakdown: PaymentMethodItem[];
    revenueByModality: RevenueByModalityItem[];
    recentPayments: ReportPayment[];
    overduePayments: ReportPayment[];
    filters: DateRange;
}

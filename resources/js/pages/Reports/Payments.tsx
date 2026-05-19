import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

import type { PaymentReportsProps, DateRange } from './Payments/types';
import ReportHeader from './Payments/sections/ReportHeader';
import DateRangeFilter from './Payments/sections/DateRangeFilter';
import KpiCards from './Payments/sections/KpiCards';
import ChartsSection from './Payments/sections/ChartsSection';
import PaymentsTabs from './Payments/sections/PaymentsTabs';

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
}: PaymentReportsProps) {
    const [dateRange, setDateRange] = useState<DateRange>({
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

    const now = new Date();

    const exportUrl = `/reportes/pagos/export?start_date=${filters.start_date}&end_date=${filters.end_date}`;

    return (
        <AppLayout>
            <Head title="Reportes de Pagos" />

            <div className="space-y-6">
                <ReportHeader exportUrl={exportUrl} />

                <DateRangeFilter
                    dateRange={dateRange}
                    onDateChange={(field, value) => setDateRange((prev) => ({ ...prev, [field]: value }))}
                    onApply={applyFilter}
                    onThisMonth={() => setQuickRange(new Date(now.getFullYear(), now.getMonth(), 1), now)}
                    onLastQuarter={() => setQuickRange(new Date(now.getFullYear(), now.getMonth() - 3, 1), now)}
                    onThisYear={() => setQuickRange(new Date(now.getFullYear(), 0, 1), now)}
                />

                <KpiCards summary={summary} />

                <ChartsSection
                    monthlyRevenue={monthlyRevenue}
                    statusDistribution={statusDistribution}
                    revenueByProgram={revenueByProgram}
                    paymentMethodBreakdown={paymentMethodBreakdown}
                />

                <PaymentsTabs
                    recentPayments={recentPayments}
                    overduePayments={overduePayments}
                    revenueByProgram={revenueByProgram}
                    revenueByModality={revenueByModality}
                    filters={filters}
                />
            </div>
        </AppLayout>
    );
}

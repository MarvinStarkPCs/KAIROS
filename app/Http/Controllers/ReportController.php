<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\AcademicProgram;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display payment reports with KPIs, charts, and tables
     */
    public function payments(Request $request)
    {
        $startDate = $request->filled('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->startOfYear();
        $endDate = $request->filled('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : Carbon::now()->endOfDay();

        // Base query scoped by creation date
        $paymentsInRange = Payment::whereBetween('created_at', [$startDate, $endDate]);

        // === KPI SUMMARY ===
        $summary = [
            'total_recaudado' => (float) Payment::whereBetween('payment_date', [$startDate, $endDate])
                ->where('status', 'completed')
                ->sum('paid_amount'),
            'total_pendiente' => (float) (clone $paymentsInRange)
                ->whereIn('status', ['pending', 'overdue'])
                ->sum('remaining_amount'),
            'pagos_vencidos_count' => (clone $paymentsInRange)
                ->where('status', 'overdue')
                ->count(),
            'pagos_vencidos_amount' => (float) (clone $paymentsInRange)
                ->where('status', 'overdue')
                ->sum('remaining_amount'),
            'total_pagos' => (clone $paymentsInRange)->count(),
            'pagos_completados' => (clone $paymentsInRange)->where('status', 'completed')->count(),
            'pagos_pendientes' => (clone $paymentsInRange)->where('status', 'pending')->count(),
            'pagos_cancelados' => (clone $paymentsInRange)->where('status', 'cancelled')->count(),
        ];

        // === MONTHLY REVENUE (bar chart) ===
        $monthlyRevenue = Payment::where('status', 'completed')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->selectRaw("DATE_FORMAT(payment_date, '%Y-%m') as month, SUM(paid_amount) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($item) => [
                'month' => Carbon::parse($item->month . '-01')->translatedFormat('M Y'),
                'total' => (float) $item->total,
            ]);

        // === STATUS DISTRIBUTION (pie chart) ===
        $statusDistribution = (clone $paymentsInRange)
            ->selectRaw("status, COUNT(*) as count, SUM(amount) as total")
            ->groupBy('status')
            ->get()
            ->map(fn ($item) => [
                'status' => $item->status,
                'label' => match ($item->status) {
                    'completed' => 'Completado',
                    'pending' => 'Pendiente',
                    'overdue' => 'Vencido',
                    'cancelled' => 'Cancelado',
                    default => $item->status,
                },
                'count' => (int) $item->count,
                'total' => (float) $item->total,
            ]);

        // === REVENUE BY PROGRAM (horizontal bar chart) ===
        $revenueByProgram = Payment::where('payments.status', 'completed')
            ->whereBetween('payments.payment_date', [$startDate, $endDate])
            ->whereNotNull('payments.program_id')
            ->join('academic_programs', 'payments.program_id', '=', 'academic_programs.id')
            ->selectRaw("academic_programs.name as program_name, SUM(payments.paid_amount) as total, COUNT(*) as count")
            ->groupBy('academic_programs.name')
            ->orderByDesc('total')
            ->get();

        // === PAYMENT METHOD BREAKDOWN (pie chart) ===
        $paymentMethodBreakdown = Payment::where('status', 'completed')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->whereNotNull('payment_method')
            ->selectRaw("payment_method, COUNT(*) as count, SUM(paid_amount) as total")
            ->groupBy('payment_method')
            ->get()
            ->map(fn ($item) => [
                'method' => $item->payment_method,
                'label' => match ($item->payment_method) {
                    'cash', 'Efectivo' => 'Efectivo',
                    'transfer', 'Transferencia' => 'Transferencia',
                    'credit_card', 'Tarjeta de Crédito' => 'Tarjeta de Crédito',
                    'manual', 'Manual' => 'Manual',
                    'CARD' => 'Tarjeta',
                    'BANCOLOMBIA_TRANSFER' => 'Bancolombia',
                    'NEQUI' => 'Nequi',
                    'PSE' => 'PSE',
                    default => ucfirst($item->payment_method),
                },
                'count' => (int) $item->count,
                'total' => (float) $item->total,
            ]);

        // === REVENUE BY MODALITY ===
        $revenueByModality = Payment::where('status', 'completed')
            ->whereBetween('payment_date', [$startDate, $endDate])
            ->whereNotNull('modality')
            ->selectRaw("modality, SUM(paid_amount) as total, COUNT(*) as count")
            ->groupBy('modality')
            ->get();

        // === RECENT PAYMENTS (table - last 20) ===
        $recentPayments = Payment::with(['student', 'program'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        // === OVERDUE PAYMENTS (table - always show all current overdue) ===
        $overduePayments = Payment::with(['student', 'program'])
            ->where('status', 'overdue')
            ->orderBy('due_date')
            ->limit(50)
            ->get();

        return Inertia::render('Reports/Payments', [
            'summary' => $summary,
            'monthlyRevenue' => $monthlyRevenue,
            'statusDistribution' => $statusDistribution,
            'revenueByProgram' => $revenueByProgram,
            'paymentMethodBreakdown' => $paymentMethodBreakdown,
            'revenueByModality' => $revenueByModality,
            'recentPayments' => $recentPayments,
            'overduePayments' => $overduePayments,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Export payments report as CSV
     */
    public function exportPayments(Request $request)
    {
        $startDate = $request->filled('start_date')
            ? Carbon::parse($request->start_date)->startOfDay()
            : Carbon::now()->startOfYear();
        $endDate = $request->filled('end_date')
            ? Carbon::parse($request->end_date)->endOfDay()
            : Carbon::now()->endOfDay();

        $type = $request->get('type', 'all');

        $payments = Payment::with(['student', 'program'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->when($type === 'overdue', fn ($q) => $q->where('status', 'overdue'))
            ->orderByDesc('created_at')
            ->get();

        $filename = "reporte_pagos_{$startDate->format('Y-m-d')}_{$endDate->format('Y-m-d')}.csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename={$filename}",
        ];

        $callback = function () use ($payments) {
            $file = fopen('php://output', 'w');
            // BOM for Excel UTF-8 compatibility
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($file, ['ID', 'Estudiante', 'Programa', 'Concepto', 'Modalidad', 'Monto', 'Pagado', 'Pendiente', 'Estado', 'Método de Pago', 'Fecha Vencimiento', 'Fecha Pago']);

            foreach ($payments as $p) {
                $statusLabel = match ($p->status) {
                    'completed' => 'Completado',
                    'pending' => 'Pendiente',
                    'overdue' => 'Vencido',
                    'cancelled' => 'Cancelado',
                    default => $p->status,
                };

                fputcsv($file, [
                    $p->id,
                    trim(($p->student->name ?? '') . ' ' . ($p->student->last_name ?? '')),
                    $p->program->name ?? 'N/A',
                    $p->concept,
                    $p->modality ?? 'N/A',
                    $p->amount,
                    $p->paid_amount,
                    $p->remaining_amount,
                    $statusLabel,
                    $p->payment_method ?? 'N/A',
                    $p->due_date,
                    $p->payment_date ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}

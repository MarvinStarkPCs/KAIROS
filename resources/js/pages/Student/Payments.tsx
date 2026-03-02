import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    DollarSign,
    Calendar,
    Banknote,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ── Tipos ──────────────────────────────────────────────────────────────────

interface Transaction {
    id: number;
    amount: number;
    payment_method: string | null;
    notes: string | null;
    created_at: string;
}

interface Payment {
    id: number;
    concept: string;
    payment_type: 'single' | 'installment' | 'partial';
    amount: number;
    paid_amount: number;
    remaining_amount: number;
    pending_balance: number;
    status: 'pending' | 'completed' | 'overdue' | 'cancelled';
    due_date: string | null;
    payment_date: string | null;
    payment_method: string | null;
    program_name: string | null;
    program_color: string;
    has_transactions: boolean;
    transactions: Transaction[];
}

interface Summary {
    total_pendiente: number;
    total_pagado: number;
    pagos_vencidos: number;
}

interface Props {
    payments: Payment[];
    summary: Summary;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    '$' + (value ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDate = (date: string | null) => {
    if (!date) return '—';
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
};

const PAYMENT_METHODS: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    credit_card: 'Tarjeta de crédito',
    online: 'Pago en línea',
};

const STATUS_MAP = {
    pending:   { label: 'Pendiente',   icon: Clock,          bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    completed: { label: 'Completado',  icon: CheckCircle,    bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-400'   },
    overdue:   { label: 'Vencido',     icon: AlertCircle,    bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-400'       },
    cancelled: { label: 'Cancelado',   icon: XCircle,        bg: 'bg-muted',                             text: 'text-muted-foreground'                },
};

// ── Componente principal ───────────────────────────────────────────────────

export default function StudentPayments({ payments, summary }: Props) {
    const [expanded, setExpanded] = useState<number | null>(null);

    const toggle = (id: number) => setExpanded(prev => prev === id ? null : id);

    return (
        <AppLayout>
            <Head title="Mis Pagos" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Mis Pagos</h1>
                    <p className="mt-1 text-muted-foreground">Consulta el estado de tus mensualidades y abonos</p>
                </div>

                {/* Resumen */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/30 p-2">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Saldo pendiente</p>
                                <p className="text-xl font-bold text-yellow-600">{formatCurrency(summary.total_pendiente)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total pagado</p>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(summary.total_pagado)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Pagos vencidos</p>
                                <p className="text-xl font-bold text-red-600">{summary.pagos_vencidos}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de pagos */}
                {payments.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
                        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/40" />
                        <p className="mt-4 text-lg font-semibold text-foreground">No tienes pagos registrados</p>
                        <p className="mt-1 text-sm text-muted-foreground">Cuando se registren tus mensualidades aparecerán aquí.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {payments.map((payment) => {
                            const statusInfo = STATUS_MAP[payment.status] ?? STATUS_MAP.pending;
                            const StatusIcon = statusInfo.icon;
                            const progress = payment.amount > 0
                                ? Math.min(Math.round((payment.paid_amount / payment.amount) * 100), 100)
                                : 0;
                            const isExpanded = expanded === payment.id;

                            return (
                                <div
                                    key={payment.id}
                                    className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
                                >
                                    {/* Barra de color del programa */}
                                    <div
                                        className="h-1 w-full"
                                        style={{ backgroundColor: payment.program_color }}
                                    />

                                    <div className="p-5">
                                        {/* Cabecera del pago */}
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-base font-semibold text-foreground">
                                                    {payment.concept}
                                                </p>
                                                {payment.program_name && (
                                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                                        {payment.program_name}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                                                statusInfo.bg, statusInfo.text
                                            )}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        {/* Montos */}
                                        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                                            <div className="rounded-lg bg-muted p-2">
                                                <p className="text-xs text-muted-foreground">Total</p>
                                                <p className="font-bold text-foreground">{formatCurrency(payment.amount)}</p>
                                            </div>
                                            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-2">
                                                <p className="text-xs text-muted-foreground">Pagado</p>
                                                <p className="font-bold text-green-600">{formatCurrency(payment.paid_amount)}</p>
                                            </div>
                                            <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-2">
                                                <p className="text-xs text-muted-foreground">Pendiente</p>
                                                <p className="font-bold text-orange-600">{formatCurrency(payment.pending_balance)}</p>
                                            </div>
                                        </div>

                                        {/* Barra de progreso */}
                                        {payment.status !== 'cancelled' && (
                                            <div className="mt-3">
                                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                    <span>Progreso</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-muted">
                                                    <div
                                                        className={cn(
                                                            'h-2 rounded-full transition-all',
                                                            payment.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                                        )}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Fechas */}
                                        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                                            {payment.due_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    Vence: {formatDate(payment.due_date)}
                                                </span>
                                            )}
                                            {payment.payment_date && (
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                                    Pagado: {formatDate(payment.payment_date)}
                                                </span>
                                            )}
                                            {payment.payment_method && (
                                                <span className="flex items-center gap-1">
                                                    <Banknote className="h-3.5 w-3.5" />
                                                    {PAYMENT_METHODS[payment.payment_method] ?? payment.payment_method}
                                                </span>
                                            )}
                                        </div>

                                        {/* Abonos desplegables */}
                                        {payment.has_transactions && (
                                            <div className="mt-3 border-t border-border pt-3">
                                                <button
                                                    onClick={() => toggle(payment.id)}
                                                    className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors"
                                                >
                                                    <span className="flex items-center gap-1.5">
                                                        <DollarSign className="h-4 w-4" />
                                                        {payment.transactions.length} abono{payment.transactions.length !== 1 ? 's' : ''} registrado{payment.transactions.length !== 1 ? 's' : ''}
                                                    </span>
                                                    {isExpanded
                                                        ? <ChevronUp className="h-4 w-4" />
                                                        : <ChevronDown className="h-4 w-4" />}
                                                </button>

                                                {isExpanded && (
                                                    <div className="mt-3 space-y-2">
                                                        {payment.transactions.map((tx) => (
                                                            <div
                                                                key={tx.id}
                                                                className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm"
                                                            >
                                                                <div>
                                                                    <p className="font-medium text-foreground">
                                                                        {formatCurrency(tx.amount)}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {formatDate(tx.created_at)}
                                                                        {tx.payment_method && ` · ${PAYMENT_METHODS[tx.payment_method] ?? tx.payment_method}`}
                                                                    </p>
                                                                </div>
                                                                {tx.notes && (
                                                                    <p className="text-xs text-muted-foreground max-w-[40%] text-right truncate">
                                                                        {tx.notes}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

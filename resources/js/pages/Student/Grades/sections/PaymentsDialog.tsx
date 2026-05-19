import { CreditCard, Calendar, CheckCircle, Banknote, ChevronDown, ChevronUp } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatCurrencyShort, formatDateShort } from '@/lib/format';
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../constants';
import type { ProgramPayment, SelectedProgram } from '../types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedProgram: SelectedProgram | null;
    programPayments: ProgramPayment[];
    expandedPayment: number | null;
    onExpandedChange: (id: number | null) => void;
}

export default function PaymentsDialog({
    open,
    onOpenChange,
    selectedProgram,
    programPayments,
    expandedPayment,
    onExpandedChange,
}: Props) {
    const pendingTotal = programPayments
        .filter((p) => p.status === 'pending' || p.status === 'overdue')
        .reduce((sum, p) => sum + p.pending_balance, 0);
    const paidTotal = programPayments.reduce((sum, p) => sum + p.paid_amount, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Pagos — {selectedProgram?.name}
                    </DialogTitle>
                </DialogHeader>

                {programPayments.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                        <CreditCard className="mx-auto h-10 w-10 opacity-40 mb-3" />
                        <p className="text-sm">No hay pagos registrados para este programa.</p>
                    </div>
                ) : (
                    <div className="space-y-3 mt-2">
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">Total pagado</p>
                                <p className="font-bold text-green-600">{formatCurrencyShort(paidTotal)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Saldo pendiente</p>
                                <p className="font-bold text-orange-600">{formatCurrencyShort(pendingTotal)}</p>
                            </div>
                        </div>

                        {programPayments.map((payment) => {
                            const statusInfo = PAYMENT_STATUS[payment.status] ?? PAYMENT_STATUS.pending;
                            const StatusIcon = statusInfo.icon;
                            const progress = payment.amount > 0
                                ? Math.min(Math.round((payment.paid_amount / payment.amount) * 100), 100)
                                : 0;
                            const isExpanded = expandedPayment === payment.id;

                            return (
                                <div key={payment.id} className="rounded-lg border border-border overflow-hidden">
                                    <div className="p-3 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-semibold text-foreground leading-tight">
                                                {payment.concept}
                                            </p>
                                            <span className={cn(
                                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium flex-shrink-0',
                                                statusInfo.bg, statusInfo.text
                                            )}>
                                                <StatusIcon className="h-3 w-3" />
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                                            <div className="rounded bg-muted p-1.5">
                                                <p className="text-muted-foreground text-[10px]">Total</p>
                                                <p className="font-bold">{formatCurrencyShort(payment.amount)}</p>
                                            </div>
                                            <div className="rounded bg-green-50 dark:bg-green-900/20 p-1.5">
                                                <p className="text-muted-foreground text-[10px]">Pagado</p>
                                                <p className="font-bold text-green-600">{formatCurrencyShort(payment.paid_amount)}</p>
                                            </div>
                                            <div className="rounded bg-orange-50 dark:bg-orange-900/20 p-1.5">
                                                <p className="text-muted-foreground text-[10px]">Pendiente</p>
                                                <p className="font-bold text-orange-600">{formatCurrencyShort(payment.pending_balance)}</p>
                                            </div>
                                        </div>

                                        {payment.status !== 'cancelled' && (
                                            <div>
                                                <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                                                    <span>Progreso</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-muted">
                                                    <div
                                                        className={cn(
                                                            'h-1.5 rounded-full transition-all',
                                                            payment.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                                                        )}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
                                            {payment.due_date && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Vence: {formatDateShort(payment.due_date)}
                                                </span>
                                            )}
                                            {payment.payment_date && (
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    Pagado: {formatDateShort(payment.payment_date)}
                                                </span>
                                            )}
                                            {payment.payment_method && (
                                                <span className="flex items-center gap-1">
                                                    <Banknote className="h-3 w-3" />
                                                    {PAYMENT_METHODS[payment.payment_method] ?? payment.payment_method}
                                                </span>
                                            )}
                                        </div>

                                        {payment.has_transactions && (
                                            <div className="border-t border-border pt-2">
                                                <button
                                                    onClick={() => onExpandedChange(isExpanded ? null : payment.id)}
                                                    className="flex w-full items-center justify-between text-xs font-medium text-foreground hover:text-primary transition-colors"
                                                >
                                                    <span className="flex items-center gap-1">
                                                        <Banknote className="h-3.5 w-3.5" />
                                                        {payment.transactions.length} abono{payment.transactions.length !== 1 ? 's' : ''} registrado{payment.transactions.length !== 1 ? 's' : ''}
                                                    </span>
                                                    {isExpanded
                                                        ? <ChevronUp className="h-3.5 w-3.5" />
                                                        : <ChevronDown className="h-3.5 w-3.5" />}
                                                </button>

                                                {isExpanded && (
                                                    <div className="mt-2 space-y-1.5">
                                                        {payment.transactions.map((tx) => (
                                                            <div
                                                                key={tx.id}
                                                                className="flex items-center justify-between rounded bg-muted px-2.5 py-1.5 text-xs"
                                                            >
                                                                <div>
                                                                    <p className="font-medium">{formatCurrencyShort(tx.amount)}</p>
                                                                    <p className="text-muted-foreground text-[10px]">
                                                                        {formatDateShort(tx.created_at)}
                                                                        {tx.payment_method && ` · ${PAYMENT_METHODS[tx.payment_method] ?? tx.payment_method}`}
                                                                    </p>
                                                                </div>
                                                                {tx.notes && (
                                                                    <p className="text-muted-foreground text-[10px] max-w-[45%] text-right truncate">
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
            </DialogContent>
        </Dialog>
    );
}

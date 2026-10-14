import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { router, useForm } from '@inertiajs/react';
import { CalendarDays, CircleDollarSign, Plus, Undo2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export type MonthPaymentStatus = 'pending' | 'overdue' | 'completed' | 'cancelled';

export interface MonthPayment {
    id: number;
    kind: 'mensualidad' | 'matricula';
    status: MonthPaymentStatus;
    amount: number;
    paid_amount: number;
    pending_balance: number;
    revert_blocker: string | null;
}

export interface PaymentMonth {
    month: string;
    label: string;
    has_payment: boolean;
    before_enrollment: boolean;
    is_current: boolean;
    payments: MonthPayment[];
}

interface Props {
    enrollmentId: number;
    year: number;
    years: number[];
    months: PaymentMonth[];
    canRevert: boolean;
    canRegister: boolean;
}

const STATUS: Record<MonthPaymentStatus, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
    overdue: { label: 'Vencido', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    completed: { label: 'Pagado', className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    cancelled: { label: 'Cancelado', className: 'bg-muted text-muted-foreground' },
};

// Mismos métodos que la pantalla de Pagos.
const PAYMENT_METHODS: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    credit_card: 'Tarjeta de Crédito',
    manual: 'Manual',
};

export function MonthlyPaymentsCard({ enrollmentId, year, years, months, canRevert, canRegister }: Props) {
    const [busyMonth, setBusyMonth] = useState<string | null>(null);
    const [toRevert, setToRevert] = useState<{ payment: MonthPayment; label: string } | null>(null);

    const [toPay, setToPay] = useState<{ payment: MonthPayment; label: string } | null>(null);
    const payForm = useForm({ amount: '', payment_method: 'cash', notes: '' });

    const withoutCharge = months.filter((m) => !m.has_payment).length;

    const openPay = (payment: MonthPayment, label: string) => {
        payForm.clearErrors();
        payForm.setData({ amount: String(payment.pending_balance), payment_method: 'cash', notes: '' });
        setToPay({ payment, label });
    };

    const submitPay: FormEventHandler = (e) => {
        e.preventDefault();
        if (!toPay) return;
        payForm.post(`/pagos/${toPay.payment.id}/add-transaction`, {
            preserveScroll: true,
            onSuccess: () => setToPay(null),
        });
    };

    const changeYear = (value: string) => {
        router.get(
            `/matriculas/${enrollmentId}/edit`,
            { anio: value },
            { preserveState: true, preserveScroll: true, only: ['paymentMonths', 'paymentYear'] },
        );
    };

    const generate = (month: string) => {
        setBusyMonth(month);
        router.post(
            `/matriculas/${enrollmentId}/generate-payment-month`,
            { month },
            { preserveScroll: true, onFinish: () => setBusyMonth(null) },
        );
    };

    const confirmRevert = () => {
        if (!toRevert) return;
        router.delete(`/matriculas/${enrollmentId}/pagos/${toRevert.payment.id}`, {
            preserveScroll: true,
            onFinish: () => setToRevert(null),
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
                <div className="space-y-1.5">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarDays className="h-4 w-4" />
                        Mensualidades por mes
                        {withoutCharge > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {withoutCharge} sin cobro
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        Genera el cobro de cualquier mes, registra su pago o revierte uno generado que aún no tenga pagos.
                    </CardDescription>
                </div>
                <Select value={String(year)} onValueChange={changeYear}>
                    <SelectTrigger className="w-28" aria-label="Año">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {months.map((m) => (
                        <div
                            key={m.month}
                            className={cn(
                                'flex flex-col gap-2 rounded-lg border p-3',
                                m.is_current && 'border-primary/50 ring-1 ring-primary/20',
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium capitalize">{m.label}</span>
                                {m.is_current && <span className="text-xs text-muted-foreground">Mes actual</span>}
                            </div>

                            {m.payments.map((p) => (
                                <div key={p.id} className="flex flex-col gap-1.5 rounded-md bg-muted/40 p-2 text-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className={cn('rounded px-1.5 py-0.5 text-xs font-medium', STATUS[p.status].className)}>
                                            {STATUS[p.status].label}
                                        </span>
                                        <span className="tabular-nums">{formatCurrency(p.amount)}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {p.kind === 'matricula' ? 'Pago de matrícula' : 'Mensualidad'}
                                        {p.paid_amount > 0 && p.status !== 'completed' && ` · abonado ${formatCurrency(p.paid_amount)}`}
                                    </span>
                                    {canRegister && (p.status === 'pending' || p.status === 'overdue') && p.pending_balance > 0 && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-7 justify-start px-2"
                                            onClick={() => openPay(p, `${m.label} ${year}`)}
                                        >
                                            <CircleDollarSign className="mr-1.5 h-3.5 w-3.5" />
                                            Registrar pago
                                        </Button>
                                    )}
                                    {canRevert && p.kind === 'mensualidad' && (p.status === 'pending' || p.status === 'overdue') && (
                                        p.revert_blocker ? (
                                            <span className="text-xs text-muted-foreground">No se puede revertir: {p.revert_blocker}</span>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 justify-start px-2 text-destructive hover:text-destructive"
                                                onClick={() => setToRevert({ payment: p, label: `${m.label} ${year}` })}
                                            >
                                                <Undo2 className="mr-1.5 h-3.5 w-3.5" />
                                                Revertir
                                            </Button>
                                        )
                                    )}
                                </div>
                            ))}

                            {!m.has_payment && (
                                <div className="mt-auto flex flex-col gap-1.5">
                                    <span className="text-xs text-muted-foreground">
                                        Sin cobro{m.before_enrollment && ' · antes de la matrícula'}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={busyMonth !== null}
                                        onClick={() => generate(m.month)}
                                    >
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                                        {busyMonth === m.month ? 'Generando…' : 'Generar cobro'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>

            <Dialog open={toPay !== null} onOpenChange={(open) => !open && setToPay(null)}>
                <DialogContent>
                    <form onSubmit={submitPay} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>
                                Registrar pago de <span className="capitalize">{toPay?.label}</span>
                            </DialogTitle>
                            <DialogDescription>
                                Saldo pendiente: {toPay ? formatCurrency(toPay.payment.pending_balance) : ''}. Si el monto cubre el
                                saldo, el pago queda como pagado y se envía el comprobante al acudiente.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-1">
                            <Label htmlFor="pay-amount">Monto</Label>
                            <Input
                                id="pay-amount"
                                type="number"
                                min="0.01"
                                step="0.01"
                                max={toPay?.payment.pending_balance}
                                value={payForm.data.amount}
                                onChange={(e) => payForm.setData('amount', e.target.value)}
                            />
                            {payForm.errors.amount && <p className="text-sm text-destructive">{payForm.errors.amount}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="pay-method">Método de pago</Label>
                            <Select value={payForm.data.payment_method} onValueChange={(v) => payForm.setData('payment_method', v)}>
                                <SelectTrigger id="pay-method">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {payForm.errors.payment_method && (
                                <p className="text-sm text-destructive">{payForm.errors.payment_method}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="pay-notes">Notas</Label>
                            <Input
                                id="pay-notes"
                                value={payForm.data.notes}
                                onChange={(e) => payForm.setData('notes', e.target.value)}
                                placeholder="Opcional"
                            />
                            {payForm.errors.notes && <p className="text-sm text-destructive">{payForm.errors.notes}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setToPay(null)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={payForm.processing}>
                                {payForm.processing ? 'Guardando…' : 'Registrar pago'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={toRevert !== null} onOpenChange={(open) => !open && setToRevert(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revertir la mensualidad de <span className="capitalize">{toRevert?.label}</span></AlertDialogTitle>
                        <AlertDialogDescription>
                            Se eliminará el cobro de {toRevert ? formatCurrency(toRevert.payment.amount) : ''} y el mes quedará
                            sin cobro, como antes de generarlo. El registro de auditoría guarda quién lo revirtió.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRevert} className="bg-destructive text-white hover:bg-destructive/90">
                            Revertir cobro
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

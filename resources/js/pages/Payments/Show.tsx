import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit, DollarSign, Receipt, CheckCircle, Clock, XCircle, User, BookOpen, Calendar, FileText, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';

interface PaymentTransaction {
    id: number;
    amount: number;
    payment_method: string;
    reference_number?: string;
    notes?: string;
    created_at: string;
    recorded_by?: { id: number; name: string };
}

interface Payment {
    id: number;
    student: { id: number; name: string; last_name?: string; document_number?: string; email?: string };
    program?: { id: number; name: string };
    enrollment?: { id: number; status: string };
    recorded_by?: { id: number; name: string };
    concept: string;
    payment_type: 'single' | 'installment' | 'partial';
    amount: number;
    original_amount?: number;
    paid_amount: number;
    remaining_amount?: number;
    pending_balance: number;
    due_date: string;
    payment_date?: string;
    status: 'pending' | 'completed' | 'overdue' | 'cancelled';
    payment_method?: string;
    reference_number?: string;
    notes?: string;
    wompi_reference?: string;
    wompi_transaction_id?: string;
    transactions?: PaymentTransaction[];
    created_at: string;
}

interface Props {
    payment: Payment;
    canEditAbonos: boolean;
}

const PAYMENT_METHODS: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    credit_card: 'Tarjeta de Crédito',
    manual: 'Manual',
};

const STATUS_MAP: Record<string, { bg: string; text: string; label: string; icon: typeof CheckCircle }> = {
    completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Completado', icon: CheckCircle },
    pending:   { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pendiente', icon: Clock },
    overdue:   { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Vencido', icon: XCircle },
    cancelled: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Cancelado', icon: XCircle },
};

const PAYMENT_TYPE_MAP: Record<string, string> = {
    single: 'Pago Único',
    partial: 'Abonos Parciales',
    installment: 'Cuotas',
};

export default function PaymentShow({ payment, canEditAbonos }: Props) {
    const totalAmount    = payment.original_amount ?? payment.amount ?? 0;
    const paidAmount     = payment.paid_amount ?? 0;
    const pendingBalance = payment.pending_balance ?? (payment.remaining_amount ?? totalAmount) ?? 0;
    const progressPercent = totalAmount > 0 ? Math.min((paidAmount / totalAmount) * 100, 100) : 0;
    const statusInfo     = STATUS_MAP[payment.status] ?? STATUS_MAP.pending;
    const StatusIcon     = statusInfo.icon;

    const [editingTx, setEditingTx]   = useState<PaymentTransaction | null>(null);
    const [maxAmount, setMaxAmount]   = useState<number>(0);
    const [showAddAbono, setShowAddAbono] = useState(false);

    // Form para EDITAR abono existente
    const { data, setData, put, processing, errors, reset } = useForm({
        amount:         '',
        payment_method: '',
        notes:          '',
    });

    // Form para AGREGAR nuevo abono
    const {
        data: addData,
        setData: setAddData,
        post: postAbono,
        processing: addProcessing,
        errors: addErrors,
        reset: resetAdd,
    } = useForm({
        amount:         '',
        payment_method: 'cash',
        notes:          '',
    });

    const openAddAbono = () => {
        resetAdd();
        setShowAddAbono(true);
    };

    const submitAddAbono = (e: React.FormEvent) => {
        e.preventDefault();
        postAbono(`/pagos/${payment.id}/transaction`, {
            onSuccess: () => {
                setShowAddAbono(false);
                resetAdd();
            },
        });
    };

    const openEdit = (tx: PaymentTransaction) => {
        // Máximo = total del pago menos lo que abonaron los OTROS abonos
        const otherTotal = (payment.transactions ?? [])
            .filter(t => t.id !== tx.id)
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const max = Number(payment.amount) - otherTotal;
        setMaxAmount(max);
        setEditingTx(tx);
        setData({
            amount:         String(tx.amount),
            payment_method: tx.payment_method,
            notes:          tx.notes ?? '',
        });
    };

    const closeEdit = () => {
        setEditingTx(null);
        reset();
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTx) return;
        put(`/pagos/${payment.id}/transaction/${editingTx.id}`, {
            onSuccess: closeEdit,
        });
    };

    return (
        <AppLayout>
            <Head title={`Pago #${payment.id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/pagos" className="mb-2 flex items-center text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Volver a pagos
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Detalle de Pago #{payment.id}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {payment.status !== 'completed' && payment.status !== 'cancelled' && (
                            <Button onClick={openAddAbono} variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Registrar Abono
                            </Button>
                        )}
                        <Link href={`/pagos/${payment.id}/edit`}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Resumen Financiero
                        </h2>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                            <StatusIcon className="h-4 w-4" />
                            {statusInfo.label}
                        </span>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progreso de pago</span>
                            <span className="font-medium text-foreground">{progressPercent.toFixed(0)}%</span>
                        </div>
                        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className={`h-full rounded-full transition-all ${payment.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                            <div className="rounded-lg bg-muted p-3">
                                <div className="text-sm text-muted-foreground">Total</div>
                                <div className="text-lg font-bold text-foreground">${totalAmount.toLocaleString('es-CO')}</div>
                            </div>
                            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
                                <div className="text-sm text-muted-foreground">Pagado</div>
                                <div className="text-lg font-bold text-green-600">${paidAmount.toLocaleString('es-CO')}</div>
                            </div>
                            <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-3">
                                <div className="text-sm text-muted-foreground">Pendiente</div>
                                <div className="text-lg font-bold text-orange-600">${pendingBalance.toLocaleString('es-CO')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                            <User className="h-4 w-4" />
                            Estudiante
                        </h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground">Nombre</div>
                                <div className="font-medium text-foreground">{payment.student.name} {payment.student.last_name ?? ''}</div>
                            </div>
                            {payment.student.document_number && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Documento</div>
                                    <div className="font-medium text-foreground">{payment.student.document_number}</div>
                                </div>
                            )}
                            {payment.student.email && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Email</div>
                                    <div className="font-medium text-foreground">{payment.student.email}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            Detalles del Pago
                        </h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground">Concepto</div>
                                <div className="font-medium text-foreground">{payment.concept}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Tipo</div>
                                <div className="font-medium text-foreground">{PAYMENT_TYPE_MAP[payment.payment_type] ?? payment.payment_type}</div>
                            </div>
                            {payment.payment_method && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Método de Pago</div>
                                    <div className="font-medium text-foreground">{PAYMENT_METHODS[payment.payment_method] ?? payment.payment_method}</div>
                                </div>
                            )}
                            {payment.reference_number && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Referencia</div>
                                    <div className="font-medium text-foreground">{payment.reference_number}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            Programa y Matrícula
                        </h3>
                        <div className="mt-4 space-y-3">
                            {payment.program && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Programa</div>
                                    <div className="font-medium text-foreground">{payment.program.name}</div>
                                </div>
                            )}
                            {payment.enrollment && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Estado Matrícula</div>
                                    <div className="font-medium text-foreground capitalize">{payment.enrollment.status}</div>
                                </div>
                            )}
                            {payment.wompi_reference && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Referencia Wompi</div>
                                    <div className="font-mono text-sm text-foreground">{payment.wompi_reference}</div>
                                </div>
                            )}
                            {payment.wompi_transaction_id && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Transacción Wompi</div>
                                    <div className="font-mono text-sm text-foreground">{payment.wompi_transaction_id}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Fechas
                        </h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="text-sm text-muted-foreground">Fecha de Vencimiento</div>
                                <div className="font-medium text-foreground">{new Date(payment.due_date).toLocaleDateString('es-CO')}</div>
                            </div>
                            {payment.payment_date && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Fecha de Pago</div>
                                    <div className="font-medium text-foreground">{new Date(payment.payment_date).toLocaleDateString('es-CO')}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm text-muted-foreground">Fecha de Registro</div>
                                <div className="font-medium text-foreground">{new Date(payment.created_at).toLocaleDateString('es-CO')}</div>
                            </div>
                            {payment.recorded_by && (
                                <div>
                                    <div className="text-sm text-muted-foreground">Registrado por</div>
                                    <div className="font-medium text-foreground">{payment.recorded_by.name}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {payment.notes && (
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground">Notas</h3>
                        <p className="mt-2 text-muted-foreground">{payment.notes}</p>
                    </div>
                )}

                {/* Historial de Abonos */}
                {payment.transactions && payment.transactions.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                            <Receipt className="h-5 w-5 text-purple-600" />
                            Historial de Abonos ({payment.transactions.length})
                        </h2>
                        <div className="mt-4 overflow-hidden rounded-lg border border-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Monto</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Método</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Referencia</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Registrado por</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Notas</th>
                                        {canEditAbonos && (
                                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Acciones</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {payment.transactions.map((tx, index) => (
                                        <tr key={tx.id} className="hover:bg-muted">
                                            <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(tx.created_at).toLocaleDateString('es-CO')}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-300">
                                                ${Number(tx.amount).toLocaleString('es-CO')}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {PAYMENT_METHODS[tx.payment_method] ?? tx.payment_method}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {tx.reference_number || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {tx.recorded_by?.name || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {tx.notes || '—'}
                                            </td>
                                            {canEditAbonos && (
                                                <td className="px-4 py-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEdit(tx)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Pencil className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal registrar nuevo abono */}
            <Dialog open={showAddAbono} onOpenChange={setShowAddAbono}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Registrar Abono</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitAddAbono} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="add-amount">
                                Monto{' '}
                                <span className="text-xs text-muted-foreground">
                                    (máx. ${pendingBalance.toLocaleString('es-CO')})
                                </span>
                            </Label>
                            <Input
                                id="add-amount"
                                type="number"
                                min="0.01"
                                max={pendingBalance}
                                step="0.01"
                                value={addData.amount}
                                onChange={e => setAddData('amount', e.target.value)}
                                placeholder="0.00"
                            />
                            {addErrors.amount && <p className="text-sm text-destructive">{addErrors.amount}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="add-method">Método de pago</Label>
                            <Select value={addData.payment_method} onValueChange={v => setAddData('payment_method', v)}>
                                <SelectTrigger id="add-method">
                                    <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {addErrors.payment_method && <p className="text-sm text-destructive">{addErrors.payment_method}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="add-notes">Notas</Label>
                            <Input
                                id="add-notes"
                                value={addData.notes}
                                onChange={e => setAddData('notes', e.target.value)}
                                placeholder="Opcional"
                            />
                            {addErrors.notes && <p className="text-sm text-destructive">{addErrors.notes}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowAddAbono(false)}>Cancelar</Button>
                            <Button type="submit" disabled={addProcessing}>
                                {addProcessing ? 'Guardando...' : 'Registrar abono'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal editar abono */}
            <Dialog open={!!editingTx} onOpenChange={closeEdit}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Abono #{editingTx?.id}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitEdit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="amount">
                                Monto{' '}
                                <span className="text-xs text-muted-foreground">
                                    (máx. ${maxAmount.toLocaleString('es-CO')})
                                </span>
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0.01"
                                max={maxAmount}
                                step="0.01"
                                value={data.amount}
                                onChange={e => setData('amount', e.target.value)}
                            />
                            {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="payment_method">Método de pago</Label>
                            <Select value={data.payment_method} onValueChange={v => setData('payment_method', v)}>
                                <SelectTrigger id="payment_method">
                                    <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(PAYMENT_METHODS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.payment_method && <p className="text-sm text-destructive">{errors.payment_method}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="notes">Notas</Label>
                            <Input
                                id="notes"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                placeholder="Opcional"
                            />
                            {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeEdit}>Cancelar</Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

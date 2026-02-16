import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Search, Check, Plus, DollarSign, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { useState } from 'react';

interface Enrollment {
    id: number;
    student_id: number;
    student_name: string;
    student_email: string;
    program_id: number;
    program_name: string;
}

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
    id?: number;
    student_id: number;
    program_id?: number;
    enrollment_id?: number;
    concept: string;
    payment_type: 'single' | 'partial';
    amount: number;
    original_amount?: number;
    paid_amount?: number;
    remaining_amount?: number;
    pending_balance?: number;
    due_date: string;
    status: 'pending' | 'completed' | 'overdue' | 'cancelled';
    payment_method?: string;
    reference_number?: string;
    notes?: string;
    transactions?: PaymentTransaction[];
}

interface Props {
    payment?: Payment;
    enrollments: Enrollment[];
}

const PAYMENT_METHODS: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    credit_card: 'Tarjeta de Crédito',
};

export default function PaymentForm({ payment, enrollments }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(
        payment?.enrollment_id
            ? enrollments.find((e) => e.id === payment.enrollment_id) || null
            : null
    );

    const [showAbonoForm, setShowAbonoForm] = useState(false);
    const [abonoData, setAbonoData] = useState({
        amount: '',
        payment_method: 'cash',
        notes: '',
    });
    const [abonoProcessing, setAbonoProcessing] = useState(false);

    const { data, setData, post, put, processing, errors } = useForm({
        student_id: payment?.student_id || '',
        program_id: payment?.program_id || '',
        enrollment_id: payment?.enrollment_id || '',
        concept: payment?.concept || '',
        payment_type: payment?.payment_type || 'single',
        amount: payment?.amount || '',
        due_date: payment?.due_date || '',
        status: payment?.status || 'pending',
        payment_method: payment?.payment_method || '',
        reference_number: payment?.reference_number || '',
        notes: payment?.notes || '',
    });

    const handleEnrollmentSelect = (enrollment: Enrollment) => {
        setSelectedEnrollment(enrollment);
        setSearchTerm('');
        setData({
            ...data,
            student_id: enrollment.student_id,
            program_id: enrollment.program_id,
            enrollment_id: enrollment.id,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (payment?.id) {
            put(`/pagos/${payment.id}`);
        } else {
            post('/pagos');
        }
    };

    const handleAbonoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!payment?.id) return;

        setAbonoProcessing(true);
        router.post(`/pagos/${payment.id}/add-transaction`, abonoData, {
            onSuccess: () => {
                setAbonoData({ amount: '', payment_method: 'cash', notes: '' });
                setShowAbonoForm(false);
                setAbonoProcessing(false);
            },
            onError: () => {
                setAbonoProcessing(false);
            },
        });
    };

    const filteredEnrollments = enrollments.filter((enrollment) =>
        enrollment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.program_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isEditing = !!payment?.id;
    // Usar 'amount' (con descuento aplicado) como total a pagar, no 'original_amount' (sin descuento)
    const totalAmount = payment?.amount ?? 0;
    const paidAmount = payment?.paid_amount ?? 0;
    const pendingBalance = payment?.pending_balance ?? payment?.remaining_amount ?? totalAmount;
    const progressPercent = totalAmount > 0 ? Math.min((paidAmount / totalAmount) * 100, 100) : 0;
    const canAddAbono = isEditing && payment?.status !== 'completed' && payment?.status !== 'cancelled' && pendingBalance > 0;

    return (
        <AppLayout>
            <Head title={payment ? 'Editar Pago' : 'Registrar Pago'} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/pagos" className="mb-2 flex items-center text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Volver a pagos
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">
                            {payment ? 'Editar Pago' : 'Registrar Pago'}
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Selecciona un estudiante inscrito para registrar el pago
                        </p>
                    </div>
                </div>

                {/* Abono Section - Only when editing a pending payment */}
                {canAddAbono && (
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Sistema de Abonos
                        </h2>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Progreso de pago</span>
                                <span className="font-medium text-foreground">{progressPercent.toFixed(0)}%</span>
                            </div>
                            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-green-500 transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="mt-2 grid grid-cols-3 gap-4 text-center text-sm">
                                <div>
                                    <div className="text-muted-foreground">Total</div>
                                    <div className="font-semibold text-foreground">${totalAmount.toLocaleString('es-CO')}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Pagado</div>
                                    <div className="font-semibold text-green-600">${paidAmount.toLocaleString('es-CO')}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Pendiente</div>
                                    <div className="font-semibold text-orange-600">${pendingBalance.toLocaleString('es-CO')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction History */}
                        <div className="mt-6">
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <Receipt className="h-4 w-4" />
                                Historial de Abonos
                            </h3>
                            {payment.transactions && payment.transactions.length > 0 ? (
                                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Fecha</th>
                                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Monto</th>
                                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Método</th>
                                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Referencia</th>
                                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Notas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {payment.transactions.map((tx) => (
                                                <tr key={tx.id}>
                                                    <td className="px-4 py-2 text-muted-foreground">
                                                        {new Date(tx.created_at).toLocaleDateString('es-CO')}
                                                    </td>
                                                    <td className="px-4 py-2 font-medium text-green-700 dark:text-green-300">
                                                        ${Number(tx.amount).toLocaleString('es-CO')}
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground">
                                                        {PAYMENT_METHODS[tx.payment_method] ?? tx.payment_method}
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground">
                                                        {tx.reference_number || '—'}
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground">
                                                        {tx.notes || '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="mt-3 text-sm text-muted-foreground">No hay abonos registrados aún.</p>
                            )}
                        </div>

                        {/* Add Abono */}
                        {!showAbonoForm ? (
                            <Button
                                type="button"
                                onClick={() => setShowAbonoForm(true)}
                                className="mt-4"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Abono
                            </Button>
                        ) : (
                            <form onSubmit={handleAbonoSubmit} className="mt-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4">
                                <h4 className="mb-3 font-medium text-green-900 dark:text-green-100">Nuevo Abono</h4>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div>
                                        <Label htmlFor="abono_amount">Monto *</Label>
                                        <Input
                                            id="abono_amount"
                                            type="number"
                                            step="1"
                                            min="1"
                                            max={pendingBalance}
                                            value={abonoData.amount}
                                            onChange={(e) => setAbonoData({ ...abonoData, amount: e.target.value })}
                                            placeholder={`Máx: $${pendingBalance.toLocaleString('es-CO')}`}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="abono_method">Método de Pago *</Label>
                                        <select
                                            id="abono_method"
                                            value={abonoData.payment_method}
                                            onChange={(e) => setAbonoData({ ...abonoData, payment_method: e.target.value })}
                                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                                            required
                                        >
                                            <option value="cash">Efectivo</option>
                                            <option value="transfer">Transferencia</option>
                                            <option value="credit_card">Tarjeta de Crédito</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="abono_notes">Notas</Label>
                                        <Input
                                            id="abono_notes"
                                            type="text"
                                            value={abonoData.notes}
                                            onChange={(e) => setAbonoData({ ...abonoData, notes: e.target.value })}
                                            placeholder="Observaciones"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button type="submit" disabled={abonoProcessing}>
                                        {abonoProcessing ? 'Registrando...' : 'Registrar Abono'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowAbonoForm(false)}>
                                        Cancelar
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Completed payment summary */}
                {isEditing && payment?.status === 'completed' && payment.transactions && payment.transactions.length > 0 && (
                    <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-green-800 dark:text-green-200">
                            <Check className="h-5 w-5" />
                            Pago Completado
                        </h2>
                        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                            Total pagado: ${paidAmount.toLocaleString('es-CO')} en {payment.transactions.length} abono(s)
                        </p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Buscador de Estudiante */}
                        <div className="md:col-span-2">
                            <Label htmlFor="student-search">Buscar Estudiante Inscrito *</Label>
                            <div className="relative mt-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="student-search"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar por nombre, email o programa..."
                                        className="pl-10"
                                    />
                                </div>

                                {/* Dropdown de resultados */}
                                {searchTerm && (
                                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card shadow-lg">
                                        {filteredEnrollments.length > 0 ? (
                                            filteredEnrollments.map((enrollment) => (
                                                <button
                                                    key={enrollment.id}
                                                    type="button"
                                                    onClick={() => handleEnrollmentSelect(enrollment)}
                                                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-muted"
                                                >
                                                    <div className="flex-1">
                                                        <div className="font-medium text-foreground">
                                                            {enrollment.student_name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {enrollment.student_email}
                                                        </div>
                                                        <div className="mt-1 inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                                                            {enrollment.program_name}
                                                        </div>
                                                    </div>
                                                    {selectedEnrollment?.id === enrollment.id && (
                                                        <Check className="h-5 w-5 text-green-600" />
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-muted-foreground">
                                                No se encontraron estudiantes inscritos
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Estudiante seleccionado */}
                                {selectedEnrollment && !searchTerm && (
                                    <div className="mt-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium text-green-900 dark:text-green-100">
                                                        {selectedEnrollment.student_name}
                                                    </span>
                                                </div>
                                                <div className="ml-6 mt-1 text-sm text-green-700 dark:text-green-300">
                                                    Programa: {selectedEnrollment.program_name}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedEnrollment(null);
                                                    setData({
                                                        ...data,
                                                        student_id: '',
                                                        program_id: '',
                                                        enrollment_id: '',
                                                    });
                                                }}
                                                className="text-sm text-green-700 dark:text-green-300 hover:text-green-900 dark:text-green-100"
                                            >
                                                Cambiar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <InputError message={errors.student_id || errors.enrollment_id} />
                        </div>

                        {/* Concepto */}
                        <div className="md:col-span-2">
                            <Label htmlFor="concept">Concepto del Pago *</Label>
                            <Input
                                id="concept"
                                type="text"
                                value={data.concept}
                                onChange={(e) => setData('concept', e.target.value)}
                                placeholder="Ej: Mensualidad Enero 2025"
                                required
                            />
                            <InputError message={errors.concept} />
                        </div>

                        {/* Tipo de Pago - Solo al crear */}
                        {!isEditing && (
                            <div>
                                <Label htmlFor="payment_type">Tipo de Pago *</Label>
                                <select
                                    id="payment_type"
                                    value={data.payment_type}
                                    onChange={(e) => setData('payment_type', e.target.value as 'single' | 'partial')}
                                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                                >
                                    <option value="single">Pago Único</option>
                                    <option value="partial">Permite Abonos Parciales</option>
                                </select>
                                <InputError message={errors.payment_type} />
                            </div>
                        )}

                        {/* Monto */}
                        <div>
                            <Label htmlFor="amount">Monto *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                            <InputError message={errors.amount} />
                        </div>

                        {/* Fecha de Vencimiento - Solo al crear */}
                        {!isEditing && (
                            <div>
                                <Label htmlFor="due_date">Fecha de Vencimiento *</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={data.due_date}
                                    onChange={(e) => setData('due_date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.due_date} />
                            </div>
                        )}

                        {/* Estado */}
                        <div>
                            <Label htmlFor="status">Estado *</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as Payment['status'])}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                            >
                                <option value="pending">Pendiente</option>
                                <option value="completed">Completado</option>
                                <option value="overdue">Vencido</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                            <InputError message={errors.status} />
                        </div>

                        {/* Método de Pago y Referencia - Solo si está completado */}
                        {data.status === 'completed' && (
                            <>
                                <div>
                                    <Label htmlFor="payment_method">Método de Pago</Label>
                                    <select
                                        id="payment_method"
                                        value={data.payment_method}
                                        onChange={(e) => setData('payment_method', e.target.value)}
                                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="cash">Efectivo</option>
                                        <option value="transfer">Transferencia</option>
                                        <option value="credit_card">Tarjeta de Crédito</option>
                                    </select>
                                    <InputError message={errors.payment_method} />
                                </div>

                                <div>
                                    <Label htmlFor="reference_number">Número de Referencia</Label>
                                    <Input
                                        id="reference_number"
                                        type="text"
                                        value={data.reference_number}
                                        onChange={(e) => setData('reference_number', e.target.value)}
                                        placeholder="Número de comprobante"
                                    />
                                    <InputError message={errors.reference_number} />
                                </div>
                            </>
                        )}

                        {/* Notas */}
                        <div className="md:col-span-2">
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Observaciones adicionales..."
                                rows={3}
                            />
                            <InputError message={errors.notes} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <Link href="/pagos">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing || (!isEditing && !selectedEnrollment)}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Guardando...' : payment ? 'Actualizar Pago' : 'Registrar Pago'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, DollarSign, Receipt, CheckCircle, Clock, XCircle, User, BookOpen, Calendar, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

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
}

const PAYMENT_METHODS: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    credit_card: 'Tarjeta de Crédito',
    manual: 'Manual',
};

const STATUS_MAP: Record<string, { bg: string; text: string; label: string; icon: typeof CheckCircle }> = {
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado', icon: CheckCircle },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente', icon: Clock },
    overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vencido', icon: XCircle },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelado', icon: XCircle },
};

const PAYMENT_TYPE_MAP: Record<string, string> = {
    single: 'Pago Único',
    partial: 'Abonos Parciales',
    installment: 'Cuotas',
};

export default function PaymentShow({ payment }: Props) {
    const totalAmount = payment.original_amount ?? payment.amount;
    const paidAmount = payment.paid_amount ?? 0;
    const pendingBalance = payment.pending_balance ?? (payment.remaining_amount ?? totalAmount);
    const progressPercent = totalAmount > 0 ? Math.min((paidAmount / totalAmount) * 100, 100) : 0;
    const statusInfo = STATUS_MAP[payment.status] ?? STATUS_MAP.pending;
    const StatusIcon = statusInfo.icon;

    return (
        <AppLayout>
            <Head title={`Pago #${payment.id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/pagos" className="mb-2 flex items-center text-sm text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Volver a pagos
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Detalle de Pago #{payment.id}</h1>
                    </div>
                    <Link href={`/pagos/${payment.id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    </Link>
                </div>

                {/* Progress Bar */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
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
                            <span className="text-gray-600">Progreso de pago</span>
                            <span className="font-medium text-gray-900">{progressPercent.toFixed(0)}%</span>
                        </div>
                        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                                className={`h-full rounded-full transition-all ${payment.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                            <div className="rounded-lg bg-gray-50 p-3">
                                <div className="text-sm text-gray-500">Total</div>
                                <div className="text-lg font-bold text-gray-900">${totalAmount.toLocaleString('es-CO')}</div>
                            </div>
                            <div className="rounded-lg bg-green-50 p-3">
                                <div className="text-sm text-gray-500">Pagado</div>
                                <div className="text-lg font-bold text-green-600">${paidAmount.toLocaleString('es-CO')}</div>
                            </div>
                            <div className="rounded-lg bg-orange-50 p-3">
                                <div className="text-sm text-gray-500">Pendiente</div>
                                <div className="text-lg font-bold text-orange-600">${pendingBalance.toLocaleString('es-CO')}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Estudiante */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
                            <User className="h-4 w-4" />
                            Estudiante
                        </h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="text-sm text-gray-500">Nombre</div>
                                <div className="font-medium text-gray-900">
                                    {payment.student.name} {payment.student.last_name ?? ''}
                                </div>
                            </div>
                            {payment.student.document_number && (
                                <div>
                                    <div className="text-sm text-gray-500">Documento</div>
                                    <div className="font-medium text-gray-900">{payment.student.document_number}</div>
                                </div>
                            )}
                            {payment.student.email && (
                                <div>
                                    <div className="text-sm text-gray-500">Email</div>
                                    <div className="font-medium text-gray-900">{payment.student.email}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalles del Pago */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
                            <FileText className="h-4 w-4" />
                            Detalles del Pago
                        </h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="text-sm text-gray-500">Concepto</div>
                                <div className="font-medium text-gray-900">{payment.concept}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Tipo</div>
                                <div className="font-medium text-gray-900">{PAYMENT_TYPE_MAP[payment.payment_type] ?? payment.payment_type}</div>
                            </div>
                            {payment.payment_method && (
                                <div>
                                    <div className="text-sm text-gray-500">Método de Pago</div>
                                    <div className="font-medium text-gray-900">{PAYMENT_METHODS[payment.payment_method] ?? payment.payment_method}</div>
                                </div>
                            )}
                            {payment.reference_number && (
                                <div>
                                    <div className="text-sm text-gray-500">Referencia</div>
                                    <div className="font-medium text-gray-900">{payment.reference_number}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Programa y Matrícula */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
                            <BookOpen className="h-4 w-4" />
                            Programa y Matrícula
                        </h3>
                        <div className="mt-4 space-y-3">
                            {payment.program && (
                                <div>
                                    <div className="text-sm text-gray-500">Programa</div>
                                    <div className="font-medium text-gray-900">{payment.program.name}</div>
                                </div>
                            )}
                            {payment.enrollment && (
                                <div>
                                    <div className="text-sm text-gray-500">Estado Matrícula</div>
                                    <div className="font-medium text-gray-900 capitalize">{payment.enrollment.status}</div>
                                </div>
                            )}
                            {payment.wompi_reference && (
                                <div>
                                    <div className="text-sm text-gray-500">Referencia Wompi</div>
                                    <div className="font-mono text-sm text-gray-900">{payment.wompi_reference}</div>
                                </div>
                            )}
                            {payment.wompi_transaction_id && (
                                <div>
                                    <div className="text-sm text-gray-500">Transacción Wompi</div>
                                    <div className="font-mono text-sm text-gray-900">{payment.wompi_transaction_id}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-gray-500">
                            <Calendar className="h-4 w-4" />
                            Fechas
                        </h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <div className="text-sm text-gray-500">Fecha de Vencimiento</div>
                                <div className="font-medium text-gray-900">{new Date(payment.due_date).toLocaleDateString('es-CO')}</div>
                            </div>
                            {payment.payment_date && (
                                <div>
                                    <div className="text-sm text-gray-500">Fecha de Pago</div>
                                    <div className="font-medium text-gray-900">{new Date(payment.payment_date).toLocaleDateString('es-CO')}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm text-gray-500">Fecha de Registro</div>
                                <div className="font-medium text-gray-900">{new Date(payment.created_at).toLocaleDateString('es-CO')}</div>
                            </div>
                            {payment.recorded_by && (
                                <div>
                                    <div className="text-sm text-gray-500">Registrado por</div>
                                    <div className="font-medium text-gray-900">{payment.recorded_by.name}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notas */}
                {payment.notes && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold uppercase text-gray-500">Notas</h3>
                        <p className="mt-2 text-gray-700">{payment.notes}</p>
                    </div>
                )}

                {/* Historial de Abonos */}
                {payment.transactions && payment.transactions.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <Receipt className="h-5 w-5 text-purple-600" />
                            Historial de Abonos ({payment.transactions.length})
                        </h2>
                        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Monto</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Método</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Referencia</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Registrado por</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">Notas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {payment.transactions.map((tx, index) => (
                                        <tr key={tx.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {new Date(tx.created_at).toLocaleDateString('es-CO')}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-green-700">
                                                ${Number(tx.amount).toLocaleString('es-CO')}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {PAYMENT_METHODS[tx.payment_method] ?? tx.payment_method}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {tx.reference_number || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {tx.recorded_by?.name || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {tx.notes || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

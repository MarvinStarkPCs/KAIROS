import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Filter, Eye, Edit, Trash2, DollarSign, CheckCircle, Clock, XCircle, CreditCard, List as ListIcon, RefreshCw, Settings, BarChart3, ChevronLeft, ChevronRight, LayoutGrid, Table2, Calendar, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { cn } from '@/lib/utils';
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

interface Payment {
    id: number;
    student: { id: number; name: string; last_name: string | null; document_number: string | null };
    program?: { id: number; name: string };
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
    has_transactions: boolean;
    installment_number?: number;
    total_installments?: number;
    wompi_transaction_id?: string;
    wompi_reference?: string;
}

interface Program {
    id: number;
    name: string;
}

interface Props {
    payments: {
        data: Payment[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        per_page: number;
    };
    programs: Program[];
    filters: {
        status?: string;
        search?: string;
        program_id?: number;
        date_from?: string;
        date_to?: string;
        per_page?: number;
    };
}

const PAYMENT_METHODS: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    credit_card: 'Tarjeta de crédito',
    online: 'Pago en línea',
};

const STATUS_MAP = {
    pending:   { label: 'Pendiente',  icon: Clock,        bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    completed: { label: 'Completado', icon: CheckCircle,  bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-400'   },
    overdue:   { label: 'Vencido',    icon: XCircle,      bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-400'       },
    cancelled: { label: 'Cancelado',  icon: XCircle,      bg: 'bg-muted',                             text: 'text-muted-foreground'                },
};

const formatCurrency = (value: number) =>
    '$' + (value ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const formatDate = (date: string | null | undefined) => {
    if (!date) return '—';
    const plain = date.includes('T') ? date.split('T')[0] : date;
    const [y, m, d] = plain.split('-');
    return `${d}/${m}/${y}`;
};

export default function PaymentsList({ payments, programs, filters }: Props) {
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; paymentId: number | null }>({
        open: false,
        paymentId: null,
    });
    const [view, setView] = useState<'table' | 'grid'>('table');

    const [localFilters, setLocalFilters] = useState({
        status: filters.status || '',
        search: filters.search || '',
        program_id: filters.program_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        per_page: filters.per_page || 20,
    });

    const handlePerPageChange = (value: number) => {
        setLocalFilters(prev => ({ ...prev, per_page: value }));
        router.get('/pagos', { ...filters, per_page: value, page: 1 }, { preserveState: true, preserveScroll: true });
    };

    const handleFilter = () => {
        router.get('/pagos', localFilters, { preserveState: true });
    };

    const handleClearFilters = () => {
        setLocalFilters({ status: '', search: '', program_id: '', date_from: '', date_to: '' });
        router.get('/pagos');
    };

    const handlePageChange = (page: number) => {
        router.get('/pagos', { ...filters, page }, { preserveState: true, preserveScroll: true });
    };

    const handleDelete = () => {
        if (deleteDialog.paymentId) {
            router.delete(`/pagos/${deleteDialog.paymentId}`, {
                onSuccess: () => {
                    setDeleteDialog({ open: false, paymentId: null });
                },
            });
        }
    };

    const handleCheckWompi = (paymentId: number) => {
        router.post(`/pagos/${paymentId}/check-wompi`, {}, {
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Completado', icon: CheckCircle },
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'Pendiente', icon: Clock },
            overdue: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Vencido', icon: XCircle },
            cancelled: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Cancelado', icon: XCircle },
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    return (
        <AppLayout>
            <Head title="Pagos" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Pagos</h1>
                        <p className="mt-2 text-muted-foreground">Gestiona mensualidades, cuotas y abonos</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* View toggle */}
                        <div className="flex rounded-lg border border-border overflow-hidden">
                            <button
                                onClick={() => setView('table')}
                                className={cn('px-3 py-2 text-sm flex items-center gap-1.5 transition-colors', view === 'table' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted')}
                            >
                                <Table2 className="h-4 w-4" />
                                Tabla
                            </button>
                            <button
                                onClick={() => setView('grid')}
                                className={cn('px-3 py-2 text-sm flex items-center gap-1.5 transition-colors', view === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                                Tarjetas
                            </button>
                        </div>
                        <Link href="/reportes/pagos">
                            <Button variant="outline" className="flex items-center space-x-2">
                                <BarChart3 className="h-5 w-5" />
                                <span>Reportes</span>
                            </Button>
                        </Link>
                        <Link href="/pagos/settings">
                            <Button variant="outline" className="flex items-center space-x-2">
                                <Settings className="h-5 w-5" />
                                <span>Configuración</span>
                            </Button>
                        </Link>
                        <Link href="/pagos/create">
                            <Button className="flex items-center space-x-2">
                                <Plus className="h-5 w-5" />
                                <span>Registrar Pago</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
                        <div>
                            <Label htmlFor="status">Estado</Label>
                            <select
                                id="status"
                                value={localFilters.status}
                                onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                            >
                                <option value="">Todos</option>
                                <option value="pending">Pendiente</option>
                                <option value="completed">Completado</option>
                                <option value="overdue">Vencido</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="search">Estudiante</Label>
                            <Input
                                id="search"
                                type="text"
                                value={localFilters.search}
                                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                placeholder="Nombre o documento..."
                                className="mt-1"
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            />
                        </div>
                        <div>
                            <Label htmlFor="program">Programa</Label>
                            <select
                                id="program"
                                value={localFilters.program_id}
                                onChange={(e) => setLocalFilters({ ...localFilters, program_id: Number(e.target.value) || '' })}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                            >
                                <option value="">Todos</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Vencimiento desde</Label>
                            <Input
                                type="date"
                                value={localFilters.date_from}
                                onChange={(e) => setLocalFilters({ ...localFilters, date_from: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Vencimiento hasta</Label>
                            <Input
                                type="date"
                                value={localFilters.date_to}
                                onChange={(e) => setLocalFilters({ ...localFilters, date_to: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <Button onClick={handleFilter}>
                            <Search className="mr-2 h-4 w-4" />
                            Filtrar
                        </Button>
                        <Button variant="outline" onClick={handleClearFilters}>
                            Limpiar
                        </Button>
                    </div>
                </div>

                {/* Grid view */}
                {view === 'grid' && (
                    <div className="space-y-3">
                        {payments.data.length === 0 ? (
                            <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
                                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/40" />
                                <p className="mt-4 text-lg font-semibold text-foreground">No se encontraron pagos</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {payments.data.map((payment) => {
                                    const statusInfo = STATUS_MAP[payment.status] ?? STATUS_MAP.pending;
                                    const StatusIcon = statusInfo.icon;
                                    const progress = payment.amount > 0
                                        ? Math.min(Math.round((payment.paid_amount / payment.amount) * 100), 100)
                                        : 0;

                                    return (
                                        <div key={payment.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                                            {payment.program && (
                                                <div className="h-1 w-full bg-primary/40" />
                                            )}
                                            <div className="p-4 space-y-3">
                                                {/* Header */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-foreground truncate">{payment.student.name} {payment.student.last_name || ''}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{payment.concept}</p>
                                                        {payment.program && (
                                                            <p className="text-xs text-muted-foreground">{payment.program.name}</p>
                                                        )}
                                                    </div>
                                                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium shrink-0', statusInfo.bg, statusInfo.text)}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusInfo.label}
                                                    </span>
                                                </div>

                                                {/* Amounts */}
                                                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                    <div className="rounded-lg bg-muted p-2">
                                                        <p className="text-muted-foreground">Total</p>
                                                        <p className="font-bold text-foreground">{formatCurrency(payment.amount)}</p>
                                                    </div>
                                                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-2">
                                                        <p className="text-muted-foreground">Pagado</p>
                                                        <p className="font-bold text-green-600">{formatCurrency(payment.paid_amount)}</p>
                                                    </div>
                                                    <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-2">
                                                        <p className="text-muted-foreground">Pendiente</p>
                                                        <p className="font-bold text-orange-600">{formatCurrency(payment.pending_balance)}</p>
                                                    </div>
                                                </div>

                                                {/* Progress */}
                                                {payment.status !== 'cancelled' && (
                                                    <div>
                                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                            <span>Progreso</span><span>{progress}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full rounded-full bg-muted">
                                                            <div
                                                                className={cn('h-1.5 rounded-full', payment.status === 'completed' ? 'bg-green-500' : 'bg-blue-500')}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dates */}
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                    {payment.due_date && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Vence: {formatDate(payment.due_date)}
                                                        </span>
                                                    )}
                                                    {payment.payment_method && (
                                                        <span className="flex items-center gap-1">
                                                            <Banknote className="h-3 w-3" />
                                                            {PAYMENT_METHODS[payment.payment_method] ?? payment.payment_method}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center justify-end gap-1 border-t border-border pt-2">
                                                    {payment.wompi_transaction_id && payment.status === 'pending' && (
                                                        <Button variant="outline" size="sm" onClick={() => handleCheckWompi(payment.id)} title="Verificar Wompi">
                                                            <RefreshCw className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                    <Link href={`/pagos/${payment.id}`}>
                                                        <Button variant="outline" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                                                    </Link>
                                                    <Link href={`/pagos/${payment.id}/edit`}>
                                                        <Button variant="outline" size="sm"><Edit className="h-3.5 w-3.5" /></Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline" size="sm"
                                                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        onClick={() => setDeleteDialog({ open: true, paymentId: payment.id })}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Grid Pagination */}
                        {payments.total > 0 && (
                            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-6 py-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">
                                        Mostrando <strong>{payments.from ?? 0}</strong>–<strong>{payments.to ?? 0}</strong> de <strong>{payments.total}</strong> pagos
                                    </span>
                                    <select
                                        value={localFilters.per_page}
                                        onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                        className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                                    >
                                        {[10, 20, 30, 100].map(n => <option key={n} value={n}>{n} por página</option>)}
                                    </select>
                                </div>
                                {payments.last_page > 1 && (
                                    <div className="flex items-center gap-1">
                                        <Button variant="outline" size="sm" disabled={payments.current_page === 1} onClick={() => handlePageChange(payments.current_page - 1)}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        {Array.from({ length: payments.last_page }, (_, i) => i + 1)
                                            .filter(p => p === 1 || p === payments.last_page || Math.abs(p - payments.current_page) <= 2)
                                            .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                                                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
                                                acc.push(p);
                                                return acc;
                                            }, [])
                                            .map((item, idx) =>
                                                item === 'ellipsis' ? (
                                                    <span key={`e-${idx}`} className="px-2 text-muted-foreground">…</span>
                                                ) : (
                                                    <Button key={item} variant={item === payments.current_page ? 'default' : 'outline'} size="sm" className="min-w-9" onClick={() => handlePageChange(item as number)}>
                                                        {item}
                                                    </Button>
                                                )
                                            )}
                                        <Button variant="outline" size="sm" disabled={payments.current_page === payments.last_page} onClick={() => handlePageChange(payments.current_page + 1)}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Table */}
                {view === 'table' && (
                <div className="rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border px-6 py-3 text-sm text-muted-foreground">
                        <span>
                            Mostrando <strong>{payments.from ?? 0}</strong>–<strong>{payments.to ?? 0}</strong> de <strong>{payments.total}</strong> pagos
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-border bg-muted">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                        Estudiante
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                        Concepto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                        Tipo/Progreso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                        Monto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                        Vencimiento
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {payments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                            No se encontraron pagos
                                        </td>
                                    </tr>
                                ) : (
                                    payments.data.map((payment) => {
                                        const statusBadge = getStatusBadge(payment.status);
                                        const StatusIcon = statusBadge.icon;
                                        const paymentProgress = payment.original_amount
                                            ? (payment.paid_amount / payment.original_amount) * 100
                                            : 0;

                                        return (
                                            <tr key={payment.id} className="hover:bg-muted/50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">
                                                        {payment.student.name} {payment.student.last_name || ''}
                                                    </div>
                                                    {payment.student.document_number && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Doc: {payment.student.document_number}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-foreground">{payment.concept}</div>
                                                    {payment.program && (
                                                        <div className="text-xs text-muted-foreground">{payment.program.name}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {payment.payment_type === 'installment' && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
                                                            <ListIcon className="h-3 w-3" />
                                                            Cuota {payment.installment_number}/{payment.total_installments}
                                                        </span>
                                                    )}
                                                    {payment.payment_type === 'partial' && payment.has_transactions && (
                                                        <div className="space-y-1">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-400">
                                                                <CreditCard className="h-3 w-3" />
                                                                Con abonos
                                                            </span>
                                                            <div className="w-32">
                                                                <div className="h-2 rounded-full bg-muted">
                                                                    <div
                                                                        className="h-2 rounded-full bg-purple-600"
                                                                        style={{ width: `${paymentProgress}%` }}
                                                                    />
                                                                </div>
                                                                <div className="mt-0.5 text-xs text-muted-foreground">
                                                                    {paymentProgress.toFixed(0)}% pagado
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {payment.payment_type === 'single' && (
                                                        <span className="text-xs text-muted-foreground">Pago único</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 font-semibold text-foreground">
                                                        <DollarSign className="h-4 w-4" />
                                                        {(payment.amount ?? 0).toLocaleString('es-CO')}
                                                    </div>
                                                    {(payment.pending_balance ?? 0) > 0 && payment.status !== 'completed' && (
                                                        <div className="text-xs text-orange-600 dark:text-orange-400">
                                                            Pendiente: ${(payment.pending_balance ?? 0).toLocaleString('es-CO')}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {formatDate(payment.due_date)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                                                    >
                                                        <StatusIcon className="h-3 w-3" />
                                                        {statusBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {payment.wompi_transaction_id && payment.status === 'pending' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                onClick={() => handleCheckWompi(payment.id)}
                                                                title="Verificar estado en Wompi"
                                                            >
                                                                <RefreshCw className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Link href={`/pagos/${payment.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/pagos/${payment.id}/edit`}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            onClick={() => setDeleteDialog({ open: true, paymentId: payment.id })}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {payments.total > 0 && (
                        <div className="flex items-center justify-between border-t border-border px-6 py-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">
                                    Página <strong>{payments.current_page}</strong> de <strong>{payments.last_page}</strong>
                                </span>
                                <select
                                    value={localFilters.per_page}
                                    onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                    className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                                >
                                    {[10, 20, 30, 100].map(n => <option key={n} value={n}>{n} por página</option>)}
                                </select>
                            </div>
                            {payments.last_page > 1 && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={payments.current_page === 1}
                                    onClick={() => handlePageChange(payments.current_page - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: payments.last_page }, (_, i) => i + 1)
                                    .filter((page) => {
                                        const cur = payments.current_page;
                                        return page === 1 || page === payments.last_page || Math.abs(page - cur) <= 2;
                                    })
                                    .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                                        if (idx > 0 && page - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                                        acc.push(page);
                                        return acc;
                                    }, [])
                                    .map((item, idx) =>
                                        item === 'ellipsis' ? (
                                            <span key={`e-${idx}`} className="px-2 text-muted-foreground">…</span>
                                        ) : (
                                            <Button
                                                key={item}
                                                variant={item === payments.current_page ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => handlePageChange(item as number)}
                                                className="min-w-9"
                                            >
                                                {item}
                                            </Button>
                                        )
                                    )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={payments.current_page === payments.last_page}
                                    onClick={() => handlePageChange(payments.current_page + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                            )}
                        </div>
                    )}
                </div>
                )}
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El pago será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

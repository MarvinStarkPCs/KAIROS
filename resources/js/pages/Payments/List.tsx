import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Filter, Eye, Edit, Trash2, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
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
    student: { id: number; name: string };
    program?: { id: number; name: string };
    concept: string;
    amount: number;
    due_date: string;
    payment_date?: string;
    status: 'pending' | 'completed' | 'overdue' | 'cancelled';
    payment_method?: string;
    reference_number?: string;
}

interface Student {
    id: number;
    name: string;
}

interface Program {
    id: number;
    name: string;
}

interface Props {
    payments: {
        data: Payment[];
        links: any;
        meta: any;
    };
    students: Student[];
    programs: Program[];
    filters: {
        status?: string;
        student_id?: number;
        program_id?: number;
    };
}

export default function PaymentsList({ payments, students, programs, filters }: Props) {
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; paymentId: number | null }>({
        open: false,
        paymentId: null,
    });

    const [localFilters, setLocalFilters] = useState({
        status: filters.status || '',
        student_id: filters.student_id || '',
        program_id: filters.program_id || '',
    });

    const handleFilter = () => {
        router.get('/pagos/list', localFilters, { preserveState: true });
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

    const getStatusBadge = (status: string) => {
        const badges = {
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado', icon: CheckCircle },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente', icon: Clock },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Vencido', icon: XCircle },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelado', icon: XCircle },
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    return (
        <AppLayout>
            <Head title="Lista de Pagos" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
                        <p className="mt-2 text-gray-600">Gestiona los pagos de estudiantes</p>
                    </div>
                    <Link href="/pagos/create">
                        <Button className="flex items-center space-x-2">
                            <Plus className="h-5 w-5" />
                            <span>Registrar Pago</span>
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <Label htmlFor="status">Estado</Label>
                            <select
                                id="status"
                                value={localFilters.status}
                                onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                            >
                                <option value="">Todos</option>
                                <option value="pending">Pendiente</option>
                                <option value="completed">Completado</option>
                                <option value="overdue">Vencido</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="student">Estudiante</Label>
                            <select
                                id="student"
                                value={localFilters.student_id}
                                onChange={(e) => setLocalFilters({ ...localFilters, student_id: Number(e.target.value) || '' })}
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                            >
                                <option value="">Todos</option>
                                {students.map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="program">Programa</Label>
                            <select
                                id="program"
                                value={localFilters.program_id}
                                onChange={(e) => setLocalFilters({ ...localFilters, program_id: Number(e.target.value) || '' })}
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                            >
                                <option value="">Todos</option>
                                {programs.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleFilter} className="w-full">
                                <Search className="mr-2 h-4 w-4" />
                                Filtrar
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                                        Estudiante
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                                        Concepto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                                        Programa
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                                        Monto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                                        Vencimiento
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-700">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-700">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {payments.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            No se encontraron pagos
                                        </td>
                                    </tr>
                                ) : (
                                    payments.data.map((payment) => {
                                        const statusBadge = getStatusBadge(payment.status);
                                        const StatusIcon = statusBadge.icon;

                                        return (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{payment.student.name}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{payment.concept}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {payment.program?.name || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 font-semibold text-gray-900">
                                                        <DollarSign className="h-4 w-4" />
                                                        {payment.amount.toLocaleString('es-CO')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {new Date(payment.due_date).toLocaleDateString('es-CO')}
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
                                                            className="text-red-600 hover:bg-red-50"
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
                </div>
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

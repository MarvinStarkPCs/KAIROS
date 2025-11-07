import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Search, Check } from 'lucide-react';
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

interface Payment {
    id?: number;
    student_id: number;
    program_id?: number;
    enrollment_id?: number;
    concept: string;
    payment_type: 'single' | 'partial';
    amount: number;
    due_date: string;
    status: 'pending' | 'completed' | 'overdue' | 'cancelled';
    payment_method?: string;
    reference_number?: string;
    notes?: string;
}

interface Props {
    payment?: Payment;
    enrollments: Enrollment[];
}

export default function PaymentForm({ payment, enrollments }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(
        payment?.enrollment_id
            ? enrollments.find((e) => e.id === payment.enrollment_id) || null
            : null
    );

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

    const filteredEnrollments = enrollments.filter((enrollment) =>
        enrollment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.program_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title={payment ? 'Editar Pago' : 'Registrar Pago'} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/pagos" className="mb-2 flex items-center text-sm text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Volver a pagos
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {payment ? 'Editar Pago' : 'Registrar Pago'}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Selecciona un estudiante inscrito para registrar el pago
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Buscador de Estudiante */}
                        <div className="md:col-span-2">
                            <Label htmlFor="student-search">Buscar Estudiante Inscrito *</Label>
                            <div className="relative mt-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
                                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                                        {filteredEnrollments.length > 0 ? (
                                            filteredEnrollments.map((enrollment) => (
                                                <button
                                                    key={enrollment.id}
                                                    type="button"
                                                    onClick={() => handleEnrollmentSelect(enrollment)}
                                                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50"
                                                >
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">
                                                            {enrollment.student_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {enrollment.student_email}
                                                        </div>
                                                        <div className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                            {enrollment.program_name}
                                                        </div>
                                                    </div>
                                                    {selectedEnrollment?.id === enrollment.id && (
                                                        <Check className="h-5 w-5 text-green-600" />
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-500">
                                                No se encontraron estudiantes inscritos
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Estudiante seleccionado */}
                                {selectedEnrollment && !searchTerm && (
                                    <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium text-green-900">
                                                        {selectedEnrollment.student_name}
                                                    </span>
                                                </div>
                                                <div className="ml-6 mt-1 text-sm text-green-700">
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
                                                className="text-sm text-green-700 hover:text-green-900"
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

                        {/* Tipo de Pago */}
                        <div>
                            <Label htmlFor="payment_type">Tipo de Pago *</Label>
                            <select
                                id="payment_type"
                                value={data.payment_type}
                                onChange={(e) => setData('payment_type', e.target.value as 'single' | 'partial')}
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                            >
                                <option value="single">Pago Único</option>
                                <option value="partial">Permite Abonos Parciales</option>
                            </select>
                            <InputError message={errors.payment_type} />
                        </div>

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

                        {/* Fecha de Vencimiento */}
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

                        {/* Estado */}
                        <div>
                            <Label htmlFor="status">Estado *</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as Payment['status'])}
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
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
                                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
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
                        <Button type="submit" disabled={processing || !selectedEnrollment}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Guardando...' : payment ? 'Actualizar Pago' : 'Registrar Pago'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

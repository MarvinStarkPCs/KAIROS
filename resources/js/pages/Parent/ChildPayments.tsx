import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, CheckCircle, Clock, AlertCircle, Smartphone } from 'lucide-react';

interface Payment {
    id: number;
    concept: string;
    amount: number;
    status: string;
    due_date: string | null;
    paid_at: string | null;
    program_name: string | null;
    program_color: string;
    payment_method: string | null;
}

interface Props {
    child: { id: number; name: string };
    payments: Payment[];
    nequi_active: boolean;
}

const statusLabel: Record<string, string> = {
    pending: 'Pendiente',
    overdue: 'Vencido',
    approved: 'Aprobado',
    completed: 'Pagado',
    cancelled: 'Cancelado',
};

const statusVariant: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    pending: 'secondary',
    overdue: 'destructive',
    approved: 'default',
    completed: 'default',
    cancelled: 'outline',
};

const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock className="h-3.5 w-3.5 mr-1" />,
    overdue: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
    approved: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
    completed: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
};

function formatCOP(amount: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
}

export default function ChildPayments({ child, payments, nequi_active }: Props) {
    const pending = payments.filter(p => p.status === 'pending' || p.status === 'overdue');
    const paid    = payments.filter(p => p.status === 'completed' || p.status === 'approved');

    return (
        <AppLayout>
            <Head title={`Pagos — ${child.name}`} />

            <div className="space-y-6 px-2 sm:px-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.visit('/padre/dashboard')}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Volver
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Pagos de {child.name}
                        </h1>
                        {nequi_active && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Smartphone className="h-3 w-3 text-pink-500" />
                                Cobro automático Nequi activo
                            </p>
                        )}
                    </div>
                </div>

                {/* Pendientes / Vencidos */}
                {pending.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                                Pagos pendientes ({pending.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {pending.map(p => (
                                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.program_color }} />
                                        <div>
                                            <p className="font-medium text-sm">{p.concept}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {p.program_name && <span>{p.program_name} · </span>}
                                                {p.due_date && <span>Vence: {new Date(p.due_date + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{formatCOP(p.amount)}</span>
                                        <Badge variant={statusVariant[p.status] ?? 'outline'} className="flex items-center text-xs">
                                            {statusIcon[p.status]}
                                            {statusLabel[p.status] ?? p.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {pending.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-500" />
                            <p className="font-medium">Sin pagos pendientes</p>
                            <p className="text-sm">Todos los pagos están al día</p>
                        </CardContent>
                    </Card>
                )}

                {/* Pagados */}
                {paid.length > 0 && (
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
                                Historial de pagos ({paid.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {paid.map(p => (
                                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 opacity-70">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.program_color }} />
                                        <div>
                                            <p className="font-medium text-sm">{p.concept}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {p.program_name && <span>{p.program_name} · </span>}
                                                {p.paid_at && <span>Pagado: {new Date(p.paid_at + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                                {p.payment_method === 'nequi' && <span className="ml-1 text-pink-500">· Nequi</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{formatCOP(p.amount)}</span>
                                        <Badge variant="outline" className="flex items-center text-xs text-green-600 border-green-200">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            {statusLabel[p.status] ?? p.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

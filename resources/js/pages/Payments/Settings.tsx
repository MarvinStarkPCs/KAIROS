import { type BreadcrumbItem } from '@/types';
import { useForm, Head } from '@inertiajs/react';
import { DollarSign } from 'lucide-react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { settings } from '@/routes/pagos';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración de Pagos',
        href: settings().url,
    },
];

interface PaymentSetting {
    id: number;
    monthly_amount: string;
    is_active: boolean;
}

export default function PaymentSettings({
    paymentSetting,
}: {
    paymentSetting: PaymentSetting | null;
}) {
    const { data, setData, patch, processing, errors } = useForm({
        monthly_amount: paymentSetting?.monthly_amount ?? '100000',
        is_active: paymentSetting?.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/pagos/settings', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Pagos" />

            <div className="px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <HeadingSmall
                        title="Configuración de Pagos"
                        description="Configura el monto mensual de las matrículas y otros parámetros de pagos"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        {(() => (
                            <>
                                <div className="rounded-lg border p-6 space-y-6">
                                    {/* Monthly Amount */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="monthly_amount">
                                            Monto de Pago Mensual (COP)
                                        </Label>
                                        <Input
                                            id="monthly_amount"
                                            type="number"
                                            min="1000"
                                            step="1000"
                                            className="mt-1 block w-full text-lg font-semibold"
                                            value={data.monthly_amount}
                                            onChange={(e) => setData('monthly_amount', e.target.value)}
                                            placeholder="100000"
                                            required
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Este es el monto que se cobrará mensualmente a los estudiantes por su matrícula.
                                            El valor se aplica a todas las nuevas matrículas.
                                        </p>
                                        <InputError
                                            className="mt-2"
                                            message={errors.monthly_amount}
                                        />
                                    </div>

                                    {/* Preview */}
                                    <div className="rounded-lg bg-muted p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">Vista Previa del Monto</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Así se mostrará en el checkout
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-primary">
                                                    ${Number(data.monthly_amount).toLocaleString('es-CO')} COP
                                                </p>
                                                <p className="text-xs text-muted-foreground">por mes</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Is Active */}
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active">
                                                Configuración activa
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Habilita esta configuración para aplicar el monto a nuevas matrículas
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button type="submit" disabled={processing}>
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        {processing
                                            ? 'Guardando...'
                                            : 'Guardar Configuración'}
                                    </Button>
                                </div>
                            </>
                        ))()}
                    </form>

                    {/* Info Section */}
                    <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
                        <HeadingSmall
                            title="Información Importante"
                            description="Ten en cuenta lo siguiente sobre la configuración de pagos"
                        />

                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            <li>
                                El monto configurado se aplicará a todas las <strong>nuevas matrículas</strong> que se realicen.
                            </li>
                            <li>
                                Los pagos ya existentes no se verán afectados por este cambio.
                            </li>
                            <li>
                                El monto debe ser igual o mayor a $1,000 COP.
                            </li>
                            <li>
                                Se recomienda configurar incrementos de $1,000 para facilitar los pagos.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

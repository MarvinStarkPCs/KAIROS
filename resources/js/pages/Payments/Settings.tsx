import { type BreadcrumbItem } from '@/types';
import { useForm, Head } from '@inertiajs/react';
import { DollarSign, CreditCard, Banknote, AlertTriangle, Users } from 'lucide-react';
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
    amount_linaje_kids: string;
    amount_linaje_teens: string;
    amount_linaje_big: string;
    is_active: boolean;
    enable_online_payment: boolean;
    enable_manual_payment: boolean;
}

const MODALITIES = [
    {
        key: 'amount_linaje_kids' as const,
        name: 'Linaje Kids',
        description: 'Niños de 4 a 9 años',
        color: 'amber',
    },
    {
        key: 'amount_linaje_teens' as const,
        name: 'Linaje Teens',
        description: 'Niños y adolescentes de 10 a 17 años',
        color: 'blue',
    },
    {
        key: 'amount_linaje_big' as const,
        name: 'Linaje Big',
        description: 'Adultos de 18 años en adelante',
        color: 'green',
    },
];

export default function PaymentSettings({
    paymentSetting,
}: {
    paymentSetting: PaymentSetting | null;
}) {
    const { data, setData, patch, processing, errors } = useForm({
        amount_linaje_kids: paymentSetting?.amount_linaje_kids ?? '100000',
        amount_linaje_teens: paymentSetting?.amount_linaje_teens ?? '100000',
        amount_linaje_big: paymentSetting?.amount_linaje_big ?? '100000',
        is_active: paymentSetting?.is_active ?? true,
        enable_online_payment: paymentSetting?.enable_online_payment ?? true,
        enable_manual_payment: paymentSetting?.enable_manual_payment ?? true,
    });

    // No permitir desactivar ambos métodos
    const handleToggleOnline = (checked: boolean) => {
        if (!checked && !data.enable_manual_payment) return;
        setData('enable_online_payment', checked);
    };

    const handleToggleManual = (checked: boolean) => {
        if (!checked && !data.enable_online_payment) return;
        setData('enable_manual_payment', checked);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/pagos/settings', {
            preserveScroll: true,
        });
    };

    const getColorClasses = (color: string, isActive: boolean) => {
        if (!isActive) return 'bg-gray-100 text-gray-400';
        switch (color) {
            case 'amber':
                return 'bg-amber-500 text-white';
            case 'blue':
                return 'bg-blue-500 text-white';
            case 'green':
                return 'bg-green-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getBorderClasses = (color: string) => {
        switch (color) {
            case 'amber':
                return 'border-amber-200 bg-amber-50/50';
            case 'blue':
                return 'border-blue-200 bg-blue-50/50';
            case 'green':
                return 'border-green-200 bg-green-50/50';
            default:
                return '';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Pagos" />

            <div className="px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <HeadingSmall
                        title="Configuración de Pagos"
                        description="Configura los montos de pago por modalidad y otros parámetros"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        {/* Montos por Modalidad */}
                        <div className="rounded-lg border p-6 space-y-6">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <h3 className="text-base font-semibold">Montos por Modalidad</h3>
                            </div>
                            <p className="text-sm text-muted-foreground -mt-4">
                                Configura el monto de pago para cada modalidad. Cada estudiante pagará según su grupo de edad.
                            </p>

                            <div className="grid gap-4">
                                {MODALITIES.map((modality) => (
                                    <div
                                        key={modality.key}
                                        className={`rounded-lg border p-4 ${getBorderClasses(modality.color)}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${getColorClasses(modality.color, true)}`}>
                                                    <Users className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <Label htmlFor={modality.key} className="text-base font-medium">
                                                        {modality.name}
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        {modality.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">$</span>
                                                    <Input
                                                        id={modality.key}
                                                        type="number"
                                                        min="1500"
                                                        step="1000"
                                                        className="w-36 text-right font-semibold"
                                                        value={data[modality.key]}
                                                        onChange={(e) => setData(modality.key, e.target.value)}
                                                        placeholder="100000"
                                                        required
                                                    />
                                                    <span className="text-sm text-muted-foreground">COP</span>
                                                </div>
                                                <InputError message={errors[modality.key]} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Vista Previa */}
                            <div className="rounded-lg bg-muted p-4 space-y-3">
                                <p className="text-sm font-medium">Vista Previa de Montos</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {MODALITIES.map((modality) => (
                                        <div key={modality.key} className="text-center">
                                            <p className="text-xs text-muted-foreground mb-1">{modality.name}</p>
                                            <p className="text-lg font-bold text-primary">
                                                ${Number(data[modality.key]).toLocaleString('es-CO')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Is Active */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">
                                        Configuración activa
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Habilita esta configuración para aplicar los montos a nuevas matrículas
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>
                        </div>

                        {/* Métodos de Pago */}
                        <div className="rounded-lg border p-6 space-y-4">
                            <div>
                                <h3 className="text-base font-semibold">Métodos de Pago</h3>
                                <p className="text-sm text-muted-foreground">
                                    Selecciona los métodos de pago disponibles para las matrículas. Debe haber al menos uno activo.
                                </p>
                            </div>

                            {/* Pago en Línea */}
                            <div className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                                data.enable_online_payment ? 'border-amber-300 bg-amber-50/50' : ''
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${
                                        data.enable_online_payment ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label htmlFor="enable_online_payment">
                                            Pago en Línea (Wompi)
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Tarjeta de crédito, débito, PSE, Nequi
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    id="enable_online_payment"
                                    checked={data.enable_online_payment}
                                    onCheckedChange={handleToggleOnline}
                                    disabled={data.enable_online_payment && !data.enable_manual_payment}
                                />
                            </div>

                            {/* Pago Manual */}
                            <div className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                                data.enable_manual_payment ? 'border-green-300 bg-green-50/50' : ''
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${
                                        data.enable_manual_payment ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                        <Banknote className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label htmlFor="enable_manual_payment">
                                            Pago Manual
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Transferencia bancaria o efectivo en instalaciones
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    id="enable_manual_payment"
                                    checked={data.enable_manual_payment}
                                    onCheckedChange={handleToggleManual}
                                    disabled={data.enable_manual_payment && !data.enable_online_payment}
                                />
                            </div>

                            {/* Advertencia si solo uno está activo */}
                            {(!data.enable_online_payment || !data.enable_manual_payment) && (
                                <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                    <span>
                                        Solo el método de <strong>{data.enable_online_payment ? 'pago en línea' : 'pago manual'}</strong> estará disponible para los estudiantes.
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button type="submit" disabled={processing}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                {processing
                                    ? 'Guardando...'
                                    : 'Guardar Configuración'}
                            </Button>
                        </div>
                    </form>

                    {/* Info Section */}
                    <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
                        <HeadingSmall
                            title="Información Importante"
                            description="Ten en cuenta lo siguiente sobre la configuración de pagos"
                        />

                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            <li>
                                <strong>Linaje Kids:</strong> Para niños de 4 a 9 años de edad.
                            </li>
                            <li>
                                <strong>Linaje Teens:</strong> Para niños y adolescentes de 10 a 17 años de edad.
                            </li>
                            <li>
                                <strong>Linaje Big:</strong> Para adultos de 18 años en adelante (se asigna automáticamente).
                            </li>
                            <li>
                                Los montos configurados se aplicarán a todas las <strong>nuevas matrículas</strong> según la modalidad seleccionada.
                            </li>
                            <li>
                                Los pagos ya existentes no se verán afectados por estos cambios.
                            </li>
                            <li>
                                El monto mínimo permitido es de $1,500 COP (requerido por Wompi).
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

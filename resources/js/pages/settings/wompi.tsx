import { type BreadcrumbItem } from '@/types';
import { useForm, Head } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/wompi';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración Wompi',
        href: edit().url,
    },
];

interface WompiSetting {
    id: number;
    environment: string;
    public_key: string;
    private_key: string | null;
    events_secret: string | null;
    integrity_secret: string | null;
    api_url: string;
    is_active: boolean;
}

export default function WompiSettings({
    wompiSetting,
}: {
    wompiSetting: WompiSetting | null;
}) {
    const { data, setData, patch, processing, errors } = useForm({
        environment: wompiSetting?.environment ?? 'test',
        public_key: wompiSetting?.public_key ?? '',
        private_key: '',
        events_secret: '',
        integrity_secret: '',
        api_url: wompiSetting?.api_url ?? 'https://sandbox.wompi.co/v1',
        is_active: wompiSetting?.is_active ?? false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/settings/wompi', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración Wompi" />

            <SettingsLayout>
                <div className="space-y-8">
                    <HeadingSmall
                        title="Pasarela de Pago Wompi"
                        description="Configura las credenciales de Wompi para procesar pagos en línea"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        {(() => (
                            <>
                                {/* Environment */}
                                <div className="grid gap-2">
                                    <Label htmlFor="environment">Ambiente</Label>
                                    <Select
                                        value={data.environment}
                                        onValueChange={(value) => {
                                            setData({
                                                ...data,
                                                environment: value,
                                                api_url: value === 'production'
                                                    ? 'https://production.wompi.co/v1'
                                                    : 'https://sandbox.wompi.co/v1',
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Seleccionar ambiente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="test">
                                                Pruebas (Sandbox)
                                            </SelectItem>
                                            <SelectItem value="production">
                                                Producción
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        className="mt-2"
                                        message={errors.environment}
                                    />
                                </div>

                                {/* Public Key */}
                                <div className="grid gap-2">
                                    <Label htmlFor="public_key">
                                        Llave Pública (Public Key)
                                    </Label>
                                    <Input
                                        id="public_key"
                                        name="public_key"
                                        type="text"
                                        className="mt-1 block w-full font-mono text-sm"
                                        value={data.public_key}
                                        onChange={(e) => setData('public_key', e.target.value)}
                                        placeholder="pub_test_..."
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        La llave pública se usa en el frontend
                                    </p>
                                    <InputError
                                        className="mt-2"
                                        message={errors.public_key}
                                    />
                                </div>

                                {/* Private Key */}
                                <div className="grid gap-2">
                                    <Label htmlFor="private_key">
                                        Llave Privada (Private Key)
                                    </Label>
                                    <Input
                                        id="private_key"
                                        name="private_key"
                                        type="password"
                                        className="mt-1 block w-full font-mono text-sm"
                                        value={data.private_key}
                                        onChange={(e) => setData('private_key', e.target.value)}
                                        placeholder="prv_test_... (dejar en blanco para mantener)"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {wompiSetting
                                            ? 'Deja en blanco para mantener la llave actual'
                                            : 'La llave privada se usa para operaciones del servidor'}
                                    </p>
                                    <InputError
                                        className="mt-2"
                                        message={errors.private_key}
                                    />
                                </div>

                                {/* Events Secret */}
                                <div className="grid gap-2">
                                    <Label htmlFor="events_secret">
                                        Secreto de Eventos (Events Secret)
                                    </Label>
                                    <Input
                                        id="events_secret"
                                        name="events_secret"
                                        type="password"
                                        className="mt-1 block w-full font-mono text-sm"
                                        value={data.events_secret}
                                        onChange={(e) => setData('events_secret', e.target.value)}
                                        placeholder="test_events_... (dejar en blanco para mantener)"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {wompiSetting
                                            ? 'Deja en blanco para mantener el secreto actual'
                                            : 'Se usa para validar webhooks de Wompi'}
                                    </p>
                                    <InputError
                                        className="mt-2"
                                        message={errors.events_secret}
                                    />
                                </div>

                                {/* Integrity Secret */}
                                <div className="grid gap-2">
                                    <Label htmlFor="integrity_secret">
                                        Secreto de Integridad (Integrity Secret)
                                    </Label>
                                    <Input
                                        id="integrity_secret"
                                        name="integrity_secret"
                                        type="password"
                                        className="mt-1 block w-full font-mono text-sm"
                                        value={data.integrity_secret}
                                        onChange={(e) => setData('integrity_secret', e.target.value)}
                                        placeholder="test_integrity_... (dejar en blanco para mantener)"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {wompiSetting
                                            ? 'Deja en blanco para mantener el secreto actual'
                                            : 'Se usa para generar firmas de integridad en el widget'}
                                    </p>
                                    <InputError
                                        className="mt-2"
                                        message={errors.integrity_secret}
                                    />
                                </div>

                                {/* API URL */}
                                <div className="grid gap-2">
                                    <Label htmlFor="api_url">URL de la API</Label>
                                    <Input
                                        id="api_url"
                                        name="api_url"
                                        type="url"
                                        className="mt-1 block w-full font-mono text-sm"
                                        value={data.api_url}
                                        onChange={(e) => setData('api_url', e.target.value)}
                                        placeholder="https://sandbox.wompi.co/v1"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Se actualiza automáticamente al cambiar el ambiente
                                    </p>
                                    <InputError
                                        className="mt-2"
                                        message={errors.api_url}
                                    />
                                </div>

                                {/* Is Active */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active">
                                            Configuración activa
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Habilita esta configuración para procesar pagos
                                        </p>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button type="submit" disabled={processing}>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        {processing
                                            ? 'Guardando...'
                                            : 'Guardar Configuración'}
                                    </Button>
                                </div>
                            </>
                        ))()}
                    </form>

                    {/* Help Section */}
                    <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
                        <HeadingSmall
                            title="¿Cómo obtener las credenciales?"
                            description="Sigue estos pasos para obtener tus claves de Wompi"
                        />

                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>
                                Inicia sesión en{' '}
                                <a
                                    href="https://comercios.sandbox.wompi.co/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    comercios.sandbox.wompi.co
                                </a>{' '}
                                (para pruebas)
                            </li>
                            <li>Ve a la sección "Developers" o "Desarrolladores"</li>
                            <li>Copia todas las claves y pégalas en los campos correspondientes</li>
                            <li>Guarda la configuración y actívala cuando estés listo</li>
                        </ol>

                        <div className="mt-4 rounded-md bg-blue-50 dark:bg-blue-950/20 p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Nota:</strong> Las claves de prueba empiezan con{' '}
                                <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">
                                    test_
                                </code>{' '}
                                y las de producción con{' '}
                                <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/40 rounded">
                                    prod_
                                </code>
                            </p>
                        </div>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

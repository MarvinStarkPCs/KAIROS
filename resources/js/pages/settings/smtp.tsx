import { type BreadcrumbItem } from '@/types';
import { useForm, Head, router } from '@inertiajs/react';
import { Mail, Send } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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
import { edit } from '@/routes/smtp';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración SMTP',
        href: edit().url,
    },
];

interface SmtpSetting {
    id: number;
    host: string;
    port: number;
    username: string | null;
    password: string | null;
    encryption: string | null;
    from_address: string;
    from_name: string;
    is_active: boolean;
}

export default function SmtpSettings({
    smtpSetting,
}: {
    smtpSetting: SmtpSetting | null;
}) {
    const [testEmail, setTestEmail] = useState('');
    const [isSendingTest, setIsSendingTest] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        host: smtpSetting?.host ?? '',
        port: smtpSetting?.port ?? 587,
        username: smtpSetting?.username ?? '',
        password: '',
        encryption: smtpSetting?.encryption ?? 'tls',
        from_address: smtpSetting?.from_address ?? '',
        from_name: smtpSetting?.from_name ?? '',
        is_active: smtpSetting?.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/settings/smtp', {
            preserveScroll: true,
        });
    };

    const handleTestEmail = () => {
        if (!testEmail) return;

        setIsSendingTest(true);
        router.post(
            '/settings/smtp/test',
            { email: testEmail },
            {
                onFinish: () => setIsSendingTest(false),
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración SMTP" />

            <SettingsLayout>
                <div className="space-y-8">
                    <HeadingSmall
                        title="Servidor SMTP"
                        description="Configura el servidor SMTP para enviar correos electrónicos desde la aplicación"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        {(() => (
                            <>
                                {/* Host */}
                                <div className="grid gap-2">
                                    <Label htmlFor="host">
                                        Host del servidor SMTP
                                    </Label>
                                    <Input
                                        id="host"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.host}
                                        onChange={(e) => setData('host', e.target.value)}
                                        placeholder="smtp.gmail.com"
                                        required
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.host}
                                    />
                                </div>

                                {/* Port and Encryption */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="port">Puerto</Label>
                                        <Input
                                            id="port"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.port}
                                            onChange={(e) => setData('port', parseInt(e.target.value))}
                                            placeholder="587"
                                            required
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.port}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="encryption">
                                            Encriptación
                                        </Label>
                                        <Select
                                            value={data.encryption}
                                            onValueChange={(value) => {
                                                setData('encryption', value === 'none' ? '' : value);
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Seleccionar encriptación" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tls">
                                                    TLS
                                                </SelectItem>
                                                <SelectItem value="ssl">
                                                    SSL
                                                </SelectItem>
                                                <SelectItem value="none">
                                                    Ninguna
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            className="mt-2"
                                            message={errors.encryption}
                                        />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="grid gap-2">
                                    <Label htmlFor="username">
                                        Usuario / Correo
                                    </Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="usuario@dominio.com"
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.username}
                                    />
                                </div>

                                {/* Password */}
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Deja en blanco para mantener la contraseña actual
                                    </p>
                                    <InputError
                                        className="mt-2"
                                        message={errors.password}
                                    />
                                </div>

                                {/* From Address */}
                                <div className="grid gap-2">
                                    <Label htmlFor="from_address">
                                        Correo de remitente
                                    </Label>
                                    <Input
                                        id="from_address"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.from_address}
                                        onChange={(e) => setData('from_address', e.target.value)}
                                        placeholder="noreply@dominio.com"
                                        required
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.from_address}
                                    />
                                </div>

                                {/* From Name */}
                                <div className="grid gap-2">
                                    <Label htmlFor="from_name">
                                        Nombre de remitente
                                    </Label>
                                    <Input
                                        id="from_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.from_name}
                                        onChange={(e) => setData('from_name', e.target.value)}
                                        placeholder="KAIROS"
                                        required
                                    />
                                    <InputError
                                        className="mt-2"
                                        message={errors.from_name}
                                    />
                                </div>

                                {/* Is Active */}
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="is_active">
                                            Configuración activa
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Habilita esta configuración para enviar correos
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
                                        <Mail className="mr-2 h-4 w-4" />
                                        {processing
                                            ? 'Guardando...'
                                            : 'Guardar Configuración'}
                                    </Button>
                                </div>
                            </>
                        ))()}
                    </form>

                    {/* Test Email Section */}
                    {smtpSetting && (
                        <div className="rounded-lg border p-6 space-y-4">
                            <HeadingSmall
                                title="Probar configuración"
                                description="Envía un correo de prueba para verificar que la configuración funciona correctamente"
                            />

                            <div className="flex gap-3">
                                <Input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    className="max-w-sm"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleTestEmail}
                                    disabled={!testEmail || isSendingTest}
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    {isSendingTest ? 'Enviando...' : 'Enviar Prueba'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

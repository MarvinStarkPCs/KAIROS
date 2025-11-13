import SmtpController from '@/actions/App/Http/Controllers/Settings/SmtpController';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, router } from '@inertiajs/react';
import { Mail, Send } from 'lucide-react';
import { useState } from 'react';

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

                    <Form
                        {...SmtpController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, errors, data, setData }) => (
                            <>
                                {/* Host */}
                                <div className="grid gap-2">
                                    <Label htmlFor="host">
                                        Host del servidor SMTP
                                    </Label>
                                    <Input
                                        id="host"
                                        name="host"
                                        type="text"
                                        className="mt-1 block w-full"
                                        defaultValue={smtpSetting?.host ?? ''}
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
                                            name="port"
                                            type="number"
                                            className="mt-1 block w-full"
                                            defaultValue={smtpSetting?.port ?? 587}
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
                                            name="encryption"
                                            defaultValue={
                                                smtpSetting?.encryption ?? 'tls'
                                            }
                                            onValueChange={(value) =>
                                                setData(
                                                    'encryption',
                                                    value === 'none' ? '' : value
                                                )
                                            }
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
                                        name="username"
                                        type="text"
                                        className="mt-1 block w-full"
                                        defaultValue={smtpSetting?.username ?? ''}
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
                                        name="password"
                                        type="password"
                                        className="mt-1 block w-full"
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
                                        name="from_address"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={smtpSetting?.from_address ?? ''}
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
                                        name="from_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        defaultValue={smtpSetting?.from_name ?? ''}
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
                                        name="is_active"
                                        defaultChecked={smtpSetting?.is_active ?? true}
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
                        )}
                    </Form>

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

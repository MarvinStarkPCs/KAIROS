import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { LockKeyhole, LockKeyholeOpen, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Acceso al sistema', href: '/settings/acceso' },
];

export default function AccesoSettings({ bloqueado }: { bloqueado: boolean }) {
    const [confirming, setConfirming] = useState(false);

    function toggleLock() {
        if (bloqueado) {
            router.post('/settings/acceso/desbloquear');
        } else {
            router.post('/settings/acceso/bloquear');
        }
        setConfirming(false);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Acceso al sistema" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Acceso al sistema"
                        description="Activa o desactiva el acceso de todos los usuarios. Solo tú (usuario administrador) podrás entrar mientras esté bloqueado."
                    />

                    <div
                        className={`rounded-xl border p-5 ${
                            bloqueado
                                ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
                                : 'border-border bg-muted/30'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`rounded-full p-3 ${
                                    bloqueado
                                        ? 'bg-amber-100 dark:bg-amber-900/40'
                                        : 'bg-background'
                                }`}
                            >
                                {bloqueado ? (
                                    <LockKeyhole className="h-6 w-6 text-amber-600" />
                                ) : (
                                    <LockKeyholeOpen className="h-6 w-6 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">
                                    {bloqueado
                                        ? 'Sistema bloqueado'
                                        : 'Sistema abierto'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {bloqueado
                                        ? 'Solo tú puedes acceder en este momento.'
                                        : 'Todos los usuarios con cuenta activa pueden entrar.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {!confirming ? (
                        <Button
                            variant={bloqueado ? 'outline' : 'destructive'}
                            onClick={() => setConfirming(true)}
                        >
                            {bloqueado ? (
                                <>
                                    <LockKeyholeOpen className="mr-2 h-4 w-4" />
                                    Restaurar acceso
                                </>
                            ) : (
                                <>
                                    <LockKeyhole className="mr-2 h-4 w-4" />
                                    Bloquear acceso
                                </>
                            )}
                        </Button>
                    ) : (
                        <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                            <div className="flex items-start gap-2 text-sm text-destructive">
                                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                    {bloqueado
                                        ? '¿Confirmas que quieres restaurar el acceso para todos los usuarios?'
                                        : 'Esto expulsará a todos los usuarios activos. ¿Confirmas?'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={bloqueado ? 'default' : 'destructive'}
                                    onClick={toggleLock}
                                >
                                    Confirmar
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setConfirming(false)}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

import { Head } from '@inertiajs/react';
import { ShieldOff } from 'lucide-react';

export default function SistemaBloqueado() {
    return (
        <>
            <Head title="Sistema no disponible" />
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="max-w-md text-center">
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-amber-100 p-4 dark:bg-amber-900/30">
                            <ShieldOff className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <h1 className="mb-2 text-2xl font-semibold text-foreground">
                        Sistema no disponible
                    </h1>
                    <p className="text-muted-foreground">
                        El administrador ha desactivado temporalmente el acceso al
                        sistema. Por favor intenta más tarde o comunícate con la
                        academia.
                    </p>
                </div>
            </div>
        </>
    );
}

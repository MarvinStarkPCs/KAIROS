import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useMemo } from 'react';

interface SettingsNavItem {
    title: string;
    href: string;
    adminOnly?: boolean;
}

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;

    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname;
    const isAdmin = auth.roles.includes('Administrador');

    const sidebarNavItems = useMemo((): SettingsNavItem[] => {
        const all: SettingsNavItem[] = [
            { title: 'Perfil',            href: '/settings/profile' },
            { title: 'Contraseña',        href: '/settings/password' },
            { title: 'Autenticación 2FA', href: '/settings/two-factor', adminOnly: true },
            { title: 'Apariencia',        href: '/settings/appearance', adminOnly: true },
            { title: 'Servidor SMTP',     href: '/settings/smtp',       adminOnly: true },
            { title: 'Pasarela Wompi',    href: '/settings/wompi',      adminOnly: true },
            { title: 'Manual',            href: '/settings/manual',     adminOnly: true },
        ];
        return isAdmin ? all : all.filter(item => !item.adminOnly);
    }, [isAdmin]);

    return (
        <div className="px-4 py-6">
            <Heading
                title="Configuración"
                description="Administra tu perfil y configuración de cuenta"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={item.href}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.href,
                                })}
                            >
                                <Link href={item.href}>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}

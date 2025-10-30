import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Users,
    CreditCard,
    Calendar,
    CheckSquare,
    MessageSquare,
    BarChart,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Programas Académicos',
        href: '/programas_academicos',
        icon: BookOpen,
    },
    {
        title: 'Estudiantes',
        href: '/students',
        icon: Users,
    },
    {
        title: 'Profesores',
        href: '/teachers',
        icon: Users,
    },
    {
        title: 'Horarios',
        href: '/horarios',
        icon: Calendar,
    },
    {
        title: 'Asistencia',
        href: '/attendance',
        icon: CheckSquare,
    },
    {
        title: 'Pagos',
        href: '/payments',
        icon: CreditCard,
    },
    {
        title: 'Comunicación',
        href: '/communication',
        icon: MessageSquare,
    },
    {
        title: 'Reportes',
        href: '/reports',
        icon: BarChart,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* 🔹 Logo */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* 🔹 Menú principal */}
            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            {/* 🔹 Footer con docs y usuario */}
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

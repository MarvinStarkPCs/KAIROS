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
    UserPlus,
    CreditCard,
    Calendar,
    CheckSquare,
    MessageSquare,
    BarChart,
} from 'lucide-react';
import AppLogo from './app-logo';
import ProgramAcademyController from '@/actions/App/Http/Controllers/program_academy';
import EnrollmentController from '@/actions/App/Http/Controllers/EnrollmentController';
import ScheduleController from '@/actions/App/Http/Controllers/ScheduleController';
import AttendanceController from '@/actions/App/Http/Controllers/AttendanceController';
import PaymentController from '@/actions/App/Http/Controllers/PaymentController';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Programas Académicos',
        href: ProgramAcademyController.index(),
        icon: BookOpen,
    },
    {
        title: 'Inscripciones',
        href: EnrollmentController.index(),
        icon: UserPlus,
    },
    {
        title: 'Horarios',
        href: ScheduleController.index(),
        icon: Calendar,
    },
    {
        title: 'Asistencia',
        href: AttendanceController.index(),
        icon: CheckSquare,
    },
    {
        title: 'Pagos',
        href: PaymentController.index(),
        icon: CreditCard,
    },
    // TODO: Implement Students management module
    // {
    //     title: 'Estudiantes',
    //     href: '/estudiantes',
    //     icon: Users,
    // },
    // TODO: Implement Teachers management module
    // {
    //     title: 'Profesores',
    //     href: '/profesores',
    //     icon: Users,
    // },
    // TODO: Implement Communication module
    // {
    //     title: 'Comunicación',
    //     href: '/comunicacion',
    //     icon: MessageSquare,
    // },
    // TODO: Implement Reports module
    // {
    //     title: 'Reportes',
    //     href: '/reportes',
    //     icon: BarChart,
    // },
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

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
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    Users,
    UserPlus,
    CreditCard,
    Calendar,
    CheckSquare,
    MessageSquare,
    BarChart,
    GraduationCap,
    Award,
    User,
} from 'lucide-react';
import AppLogo from './app-logo';
import ProgramAcademyController from '@/actions/App/Http/Controllers/program_academy';
import EnrollmentController from '@/actions/App/Http/Controllers/EnrollmentController';
import ScheduleController from '@/actions/App/Http/Controllers/ScheduleController';
import AttendanceController from '@/actions/App/Http/Controllers/AttendanceController';
import PaymentController from '@/actions/App/Http/Controllers/PaymentController';
import ReportController from '@/actions/App/Http/Controllers/ReportController';
import TeacherController from '@/actions/App/Http/Controllers/TeacherController';
import StudentController from '@/actions/App/Http/Controllers/StudentController';

const allNavItems: NavItem[] = [
    // Portal de Estudiantes
    {
        title: 'Mis Calificaciones',
        href: StudentController.grades(),
        icon: Award,
        role: 'Estudiante',
    },
    // Portal de Padres/Responsables
    {
        title: 'Mis Hijos',
        href: { url: '/padre/dashboard', method: 'get' },
        icon: Users,
        role: 'Padre/Madre',
    },
    // Portal de Profesores
    {
        title: 'Mis Grupos',
        href: TeacherController.myGroups(),
        icon: GraduationCap,
        permission: 'ver_mis_grupos',
    },
    // Módulos Administrativos
    {
        title: 'Programas Académicos',
        href: ProgramAcademyController.index(),
        icon: BookOpen,
        permission: 'ver_programas',
    },
    {
        title: 'Matrículas',
        href: EnrollmentController.index(),
        icon: UserPlus,
        permission: 'ver_inscripciones',
    },
    {
        title: 'Horarios',
        href: ScheduleController.index(),
        icon: Calendar,
        permission: 'ver_horarios',
    },
    {
        title: 'Asistencia',
        href: AttendanceController.index(),
        icon: CheckSquare,
        permission: 'ver_asistencia',
    },
    {
        title: 'Pagos',
        href: PaymentController.index(),
        icon: CreditCard,
        permission: 'ver_pagos',
    },
    {
        title: 'Reportes',
        href: ReportController.payments(),
        icon: BarChart,
        permission: 'ver_reportes',
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
    const { auth } = usePage<SharedData>().props;
    const userPermissions = auth?.permissions || [];
    const userRoles = auth?.roles || [];

    // Filter navigation items based on user permissions and roles
    const visibleNavItems = allNavItems.filter(item => {
        // Check role if specified
        if (item.role && !userRoles.includes(item.role)) {
            return false;
        }
        // Check permission if specified
        if (item.permission && !userPermissions.includes(item.permission)) {
            return false;
        }
        // If no role or permission required, or if checks passed
        return item.role || item.permission ? true : true;
    });

    // Determinar URL del logo según el rol del usuario
    const getHomeUrl = () => {
        if (userRoles.includes('Estudiante')) return StudentController.grades().url;
        if (userRoles.includes('Profesor')) return TeacherController.myGroups().url;
        if (userRoles.includes('Padre/Madre')) return '/padre/dashboard';
        return ProgramAcademyController.index().url;
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* 🔹 Logo */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={getHomeUrl()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* 🔹 Menú principal */}
            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            {/* 🔹 Footer con docs y usuario */}
            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

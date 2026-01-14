import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import * as programas_academicos from '@/routes/programas_academicos';
import * as inscripciones from '@/routes/inscripciones';
import * as pagos from '@/routes/pagos';
import * as horarios from '@/routes/horarios';
import * as asistencias from '@/routes/asistencias';
import * as roles from '@/routes/roles';
import * as usuarios from '@/routes/usuarios';
import * as audit from '@/routes/audit';
import * as profesor from '@/routes/profesor';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    permission?: string;
    submenu?: Array<{
        title: string;
        href: string;
        icon: React.ComponentType<{ className?: string }>;
        permission?: string;
    }>;
}

import { Link, usePage } from '@inertiajs/react';
import {
    CreditCard,
    Calendar,
    CheckSquare,
    MessageSquare,
    FileText,
    Menu,
    Music,
    Bell,
    Mail,
    ChevronDown,
    Search,
    Lock,
    Shield,
    UserCheck,
    BookOpen,
    ChevronUp,
    GraduationCap,
    Users
} from 'lucide-react';
import { useState } from 'react';

// Navegación principal personalizada para Academia Linaje
const allNavItems: NavItem[] = [
    {
        title: 'Mis Grupos',
        href: profesor.misGrupos().url,
        icon: GraduationCap,
        permission: 'ver_mis_grupos',
    },
    {
        title: 'Programas Académicos',
        href: programas_academicos.index().url,
        icon: BookOpen,
        permission: 'ver_programas',
    },
    {
        title: 'Inscripciones',
        href: inscripciones.index().url,
        icon: UserCheck,
        permission: 'ver_inscripciones',
    },
    {
        title: 'Demo Leads',
        href: '/admin/demo-leads',
        icon: Users,
    },
    {
        title: 'Pagos',
        href: pagos.index().url,
        icon: CreditCard,
        permission: 'ver_pagos',
    },
    {
        title: 'Horarios',
        href: horarios.index().url,
        icon: Calendar,
        permission: 'ver_horarios',
    },
    {
        title: 'Asistencia',
        href: asistencias.index().url,
        icon: CheckSquare,
        permission: 'ver_asistencia',
    },
    {
        title: 'Comunicación',
        href: '/comunicacion',
        icon: MessageSquare,
        permission: 'ver_comunicacion',
    },
    {
        title: 'Reportes',
        href: '/reportes',
        icon: FileText,
        permission: 'ver_reportes',
    },
    {
        title: 'Seguridad',
        href: '/seguridad',
        icon: Shield,
        permission: 'ver_roles',
        submenu: [
            {
                title: 'Roles y Permisos',
                href: roles.index().url,
                icon: Lock,
                permission: 'ver_roles',
            },
            {
                title: 'Usuarios',
                href: usuarios.index().url,
                icon: UserCheck,
                permission: 'ver_usuarios',
            },
            {
                title: 'Auditoría',
                href: audit.index().url,
                icon: FileText,
                permission: 'ver_auditoria',
            },
        ]
    },
];

const activeItemStyles = 'text-[#7a9b3c] border-b-2 border-[#7a9b3c]';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [isMenuOpen, setIsMenuOpen] = useState(true);

    // Simulación de notificaciones - reemplaza con tu lógica real
    const notificationCount = 3;

    // Mensajes no leídos desde el servidor
    const unreadMessagesCount = auth.unreadMessages || 0;

    // Filtrar items del menú según permisos del usuario
    const userPermissions = auth?.permissions || [];
    const mainNavItems = allNavItems.filter(item => {
        if (!item.permission) return true;
        const hasPermission = userPermissions.includes(item.permission);
        if (hasPermission && item.submenu) {
            // Filtrar submenu también
            item.submenu = item.submenu.filter(subitem =>
                !subitem.permission || userPermissions.includes(subitem.permission)
            );
        }
        return hasPermission;
    });

    return (
        <>
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex h-16 items-center justify-between px-6">
                    {/* Logo y título */}
                    <div className="flex items-center space-x-3">
                        <Link
                            href={dashboard()}
                            prefetch
                            className="flex items-center space-x-3"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#6b5544] text-white">
                                <Music className="h-7 w-7" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold text-gray-800">
                                    Academia linaje
                                </span>
                                <span className="text-xs text-gray-500">
                                    Sistema de Gestión Musical
                                </span>
                            </div>
                        </Link>

                        {/* Toggle Button - Al lado del logo */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors ml-2"
                            title={isMenuOpen ? "Ocultar menú" : "Mostrar menú"}
                        >
                            {isMenuOpen ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {/* Barra de búsqueda central */}
                    <div className="hidden flex-1 max-w-md mx-8 lg:block">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar estudiantes, profesores..."
                                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 pl-10 text-sm focus:border-[#7a9b3c] focus:outline-none focus:ring-1 focus:ring-[#7a9b3c]"
                            />
                            <Icon
                                iconNode={Search}
                                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Acciones de la derecha */}
                    <div className="flex items-center space-x-3">
                        {/* Botón Nuevo */}
                        <Button className="hidden bg-[#7a9b3c] hover:bg-[#6a8a2c] text-white lg:flex">
                            + Nuevo
                        </Button>

                        {/* Notificaciones */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-10 w-10"
                        >
                            <Bell className="h-5 w-5 text-gray-600" />
                            {notificationCount > 0 && (
                                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                                    {notificationCount}
                                </span>
                            )}
                        </Button>

                        {/* Mensajes */}
                        <Link href="/comunicacion">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative hidden h-10 w-10 lg:flex"
                            >
                                <Mail className="h-5 w-5 text-gray-600" />
                                {unreadMessagesCount > 0 && (
                                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                                        {unreadMessagesCount}
                                    </span>
                                )}
                            </Button>
                        </Link>

                        {/* Usuario */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center space-x-2 px-2 py-1 h-auto"
                                >
                                    <Avatar className="h-9 w-9 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-full bg-[#7a9b3c] text-white text-sm">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden flex-col items-start lg:flex">
                                        <span className="text-sm font-medium text-gray-800">
                                            {auth.user.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {auth.roles && auth.roles.length > 0 ? auth.roles[0] : 'Usuario'}
                                        </span>
                                    </div>
                                    <ChevronDown className="hidden h-4 w-4 text-gray-600 lg:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Menú móvil */}
                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="flex h-full w-64 flex-col bg-white"
                                >
                                    <SheetTitle className="sr-only">
                                        Menú de Navegación
                                    </SheetTitle>
                                    <SheetHeader className="flex items-start justify-start text-left">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6b5544] text-white">
                                                <Music className="h-6 w-6" />
                                            </div>
                                            <span className="font-semibold text-gray-800">
                                                Academia Linaje
                                            </span>
                                        </div>
                                    </SheetHeader>
                                    <div className="mt-6 flex flex-col space-y-1">
                                        {mainNavItems.map((item) => (
                                            <div key={item.title || 'home'}>
                                                {item.submenu ? (
                                                    <>
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                                                page.url === item.href
                                                                    ? "bg-[#7a9b3c]/10 text-[#7a9b3c]"
                                                                    : "text-gray-700 hover:bg-gray-100"
                                                            )}
                                                        >
                                                            {item.icon && (
                                                                <Icon
                                                                    iconNode={item.icon}
                                                                    className="h-5 w-5"
                                                                />
                                                            )}
                                                            <span>{item.title}</span>
                                                        </Link>
                                                        <div className="ml-6 space-y-1">
                                                            {item.submenu.map((subitem) => (
                                                                <Link
                                                                    key={subitem.title}
                                                                    href={subitem.href}
                                                                    className={cn(
                                                                        "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors",
                                                                        page.url === subitem.href
                                                                            ? "bg-[#7a9b3c]/10 text-[#7a9b3c]"
                                                                            : "text-gray-600 hover:bg-gray-100"
                                                                    )}
                                                                >
                                                                    {subitem.icon && (
                                                                        <Icon
                                                                            iconNode={subitem.icon}
                                                                            className="h-4 w-4"
                                                                        />
                                                                    )}
                                                                    <span>{subitem.title}</span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                                            page.url === item.href
                                                                ? "bg-[#7a9b3c]/10 text-[#7a9b3c]"
                                                                : "text-gray-700 hover:bg-gray-100"
                                                        )}
                                                    >
                                                        {item.icon && (
                                                            <Icon
                                                                iconNode={item.icon}
                                                                className="h-5 w-5"
                                                            />
                                                        )}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

                {/* Menú de navegación secundario */}
                {isMenuOpen && (
                    <div className="hidden border-t border-gray-200 bg-white lg:block">
                        <div className="mx-auto flex justify-center items-center px-6">
                            <NavigationMenu className="flex h-12 items-center">
                                <NavigationMenuList className="flex h-full items-stretch space-x-1">
                                    {mainNavItems.map((item, index) => (
                                        <NavigationMenuItem
                                            key={index}
                                            className="relative flex h-full items-center"
                                        >
                                            {item.submenu ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            className={cn(
                                                                "flex items-center space-x-2 px-4 h-full text-sm font-medium transition-colors border-b-2 border-transparent hover:text-gray-900",
                                                                page.url.startsWith(item.href)
                                                                    ? activeItemStyles
                                                                    : "text-gray-600"
                                                            )}
                                                        >
                                                            {item.icon && (
                                                                <Icon
                                                                    iconNode={item.icon}
                                                                    className="h-4 w-4 mr-2"
                                                                />
                                                            )}
                                                            <span>{item.title}</span>
                                                            {item.title && <ChevronDown className="h-4 w-4 ml-1" />}
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="w-48">
                                                        {item.submenu.map((subitem) => (
                                                            <Link
                                                                key={subitem.title}
                                                                href={subitem.href}
                                                                className={cn(
                                                                    "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 cursor-pointer",
                                                                    page.url === subitem.href
                                                                        ? "bg-[#7a9b3c]/10 text-[#7a9b3c]"
                                                                        : "text-gray-700"
                                                                )}
                                                            >
                                                                {subitem.icon && (
                                                                    <Icon
                                                                        iconNode={subitem.icon}
                                                                        className="h-4 w-4"
                                                                    />
                                                                )}
                                                                <span>{subitem.title}</span>
                                                            </Link>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center space-x-2 px-4 h-full text-sm font-medium transition-colors border-b-2 border-transparent",
                                                        page.url === item.href
                                                            ? activeItemStyles
                                                            : "text-gray-600 hover:text-gray-900"
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="h-4 w-4 mr-2"
                                                        />
                                                    )}
                                                    <span>{item.title}</span>
                                                </Link>
                                            )}
                                        </NavigationMenuItem>
                                    ))}
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    </div>
                )}
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-gray-200 bg-gray-50">
                    <div className="mx-auto flex h-10 w-full items-center justify-start px-6 text-gray-500">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
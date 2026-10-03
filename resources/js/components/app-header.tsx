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
import { useUnreadMessages } from '@/hooks/use-unread-messages';
import { cn } from '@/lib/utils';
import * as asistencias from '@/routes/asistencias';
import * as audit from '@/routes/audit';
import * as estudiante from '@/routes/estudiante';
import * as horarios from '@/routes/horarios';
import * as inscripciones from '@/routes/inscripciones';
import * as pagos from '@/routes/pagos';
import * as profesor from '@/routes/profesor';
import * as programas_academicos from '@/routes/programas_academicos';
import * as roles from '@/routes/roles';
import * as usuarios from '@/routes/usuarios';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    permission?: string;
    role?: string;
    superAdminOnly?: boolean;
    submenu?: Array<{
        title: string;
        href: string;
        icon: React.ComponentType<{ className?: string }>;
        permission?: string;
        superAdminOnly?: boolean;
    }>;
}

import { Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    Calendar,
    CheckSquare,
    ChevronDown,
    ChevronUp,
    CreditCard,
    FileText,
    GraduationCap,
    LineChart,
    Loader2,
    Lock,
    Mail,
    Menu,
    MessageSquare,
    ScrollText,
    Search,
    Shield,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SearchResult {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
}

// Navegación principal personalizada para Academia Linaje
const allNavItems: NavItem[] = [
    // Portal de Estudiantes
    {
        title: 'Mis Calificaciones',
        href: estudiante.calificaciones().url,
        icon: Award,
        role: 'Estudiante',
    },
    // Portal de Profesores
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
        title: 'Matrículas',
        href: inscripciones.index().url,
        icon: UserCheck,
        permission: 'ver_inscripciones',
    },
    {
        title: 'Demo Leads',
        href: '/admin/demo-leads',
        icon: Users,
        permission: 'ver_demo_leads',
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
        title: 'Académico',
        href: '/academico',
        icon: LineChart,
        permission: 'ver_panel_academico',
        submenu: [
            {
                title: 'Visión General',
                href: '/academico',
                icon: LineChart,
                permission: 'ver_panel_academico',
            },
            {
                title: 'Progreso de Estudiantes',
                href: '/academico/estudiantes',
                icon: Users,
                permission: 'ver_panel_academico',
            },
            {
                title: 'Avance de Profesores',
                href: '/academico/profesores',
                icon: GraduationCap,
                permission: 'ver_panel_academico',
            },
        ],
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
            {
                title: 'Logs del Sistema',
                href: '/logs',
                icon: ScrollText,
                superAdminOnly: true,
            },
        ],
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

    // Estado de búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isAdmin =
        auth.roles?.includes('Administrador') ||
        auth.permissions?.includes('ver_usuarios');

    const performSearch = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(
                `/usuarios/search?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            }
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setShowResults(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(value), 300);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    const handleSelectUser = (userId: number) => {
        clearSearch();
        router.visit(`/usuarios/${userId}`);
    };

    // Cerrar resultados al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(e.target as Node)
            ) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getAvatarUrl = (avatar: string | null) => {
        if (!avatar) return undefined;
        return avatar.startsWith('http') ? avatar : `/storage/${avatar}`;
    };

    const unreadMessagesCount = useUnreadMessages();

    // Filtrar items del menú según permisos y roles del usuario
    const userPermissions = auth?.permissions || [];
    const userRoles = auth?.roles || [];
    const isSuperAdmin = auth?.user?.id === 1;
    const mainNavItems = allNavItems.filter((item) => {
        // Verificar rol si está especificado
        if (item.role && !userRoles.includes(item.role)) {
            return false;
        }
        // Verificar permiso si está especificado
        if (item.permission && !userPermissions.includes(item.permission)) {
            return false;
        }
        // Filtrar submenu si existe
        if (item.submenu) {
            item.submenu = item.submenu.filter((subitem) => {
                if (subitem.superAdminOnly && !isSuperAdmin) return false;
                return (
                    !subitem.permission ||
                    userPermissions.includes(subitem.permission)
                );
            });
        }
        return true;
    });

    return (
        <>
            <div className="border-b border-border bg-card">
                <div className="mx-auto flex h-14 items-center justify-between px-3 sm:h-16 sm:px-4 lg:h-18 lg:px-6">
                    {/* Logo y título */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <Link
                            href={programas_academicos.index().url}
                            prefetch
                            className="flex items-center"
                        >
                            <img
                                src="/logo_academia_black.png"
                                alt="Academia Linaje"
                                className="h-10 w-auto sm:h-12 lg:h-14 dark:hidden"
                            />
                            <img
                                src="/logo_academia_white.png"
                                alt="Academia Linaje"
                                className="hidden h-10 w-auto sm:h-12 lg:h-14 dark:block"
                            />
                        </Link>

                        {/* Toggle Button - Al lado del logo (solo desktop) */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="ml-2 hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
                            title={isMenuOpen ? 'Ocultar menú' : 'Mostrar menú'}
                        >
                            {isMenuOpen ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {/* Barra de búsqueda central - Solo para admin */}
                    {isAdmin && (
                        <div
                            className="mx-8 hidden max-w-md flex-1 lg:block"
                            ref={searchRef}
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    onFocus={() =>
                                        searchQuery.length >= 2 &&
                                        setShowResults(true)
                                    }
                                    placeholder="Buscar estudiantes, profesores..."
                                    className="w-full rounded-lg border border-input bg-muted px-4 py-2 pr-9 pl-10 text-sm focus:border-[#7a9b3c] focus:ring-1 focus:ring-[#7a9b3c] focus:outline-none"
                                />
                                {isSearching ? (
                                    <Loader2 className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                                ) : (
                                    <Icon
                                        iconNode={Search}
                                        className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                                    />
                                )}
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}

                                {/* Dropdown de resultados */}
                                {showResults && searchQuery.length >= 2 && (
                                    <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                                        {isSearching &&
                                        searchResults.length === 0 ? (
                                            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Buscando...
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((user) => (
                                                <button
                                                    key={user.id}
                                                    onClick={() =>
                                                        handleSelectUser(
                                                            user.id,
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted"
                                                >
                                                    <Avatar className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                                                        <AvatarImage
                                                            src={getAvatarUrl(
                                                                user.avatar,
                                                            )}
                                                            alt={user.name}
                                                        />
                                                        <AvatarFallback className="rounded-full bg-[#7a9b3c] text-xs text-white">
                                                            {getInitials(
                                                                user.name,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate text-sm font-medium text-foreground">
                                                            {user.name}
                                                        </div>
                                                        <div className="truncate text-xs text-muted-foreground">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                        {user.role}
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="py-6 text-center text-sm text-muted-foreground">
                                                No se encontraron usuarios
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Acciones de la derecha */}
                    <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                        {/* Mensajes */}
                        <Link href="/comunicacion">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative h-10 w-10"
                            >
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                {unreadMessagesCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
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
                                    className="flex h-auto items-center space-x-2 px-2 py-1"
                                >
                                    <Avatar className="h-9 w-9 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={
                                                auth.user.avatar
                                                    ? auth.user.avatar.startsWith(
                                                          'http',
                                                      )
                                                        ? auth.user.avatar
                                                        : `/storage/${auth.user.avatar}`
                                                    : undefined
                                            }
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-full bg-[#7a9b3c] text-sm text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden flex-col items-start lg:flex">
                                        <span className="text-sm font-medium text-foreground">
                                            {auth.user.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {auth.roles && auth.roles.length > 0
                                                ? auth.roles[0]
                                                : 'Usuario'}
                                        </span>
                                    </div>
                                    <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
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
                                        className="h-11 w-11 sm:h-10 sm:w-10"
                                    >
                                        <Menu className="h-6 w-6 sm:h-5 sm:w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="flex h-full w-[280px] flex-col bg-card p-0 sm:w-72"
                                >
                                    <SheetTitle className="sr-only">
                                        Menú de Navegación
                                    </SheetTitle>
                                    <SheetHeader className="flex items-start justify-start border-b p-4 text-left">
                                        <img
                                            src="/logo_academia_black.png"
                                            alt="Academia Linaje"
                                            className="h-10 w-auto dark:hidden"
                                        />
                                        <img
                                            src="/logo_academia_white.png"
                                            alt="Academia Linaje"
                                            className="hidden h-10 w-auto dark:block"
                                        />
                                    </SheetHeader>
                                    <div className="flex-1 overflow-y-auto px-3 py-4">
                                        <div className="flex flex-col space-y-1">
                                            {mainNavItems.map((item) => (
                                                <div key={item.title || 'home'}>
                                                    {item.submenu ? (
                                                        <>
                                                            <Link
                                                                href={item.href}
                                                                className={cn(
                                                                    'flex items-center space-x-3 rounded-lg px-4 py-3.5 text-base font-medium transition-colors active:bg-muted',
                                                                    page.url ===
                                                                        item.href
                                                                        ? 'bg-[#7a9b3c]/10 text-[#7a9b3c]'
                                                                        : 'text-muted-foreground hover:bg-muted',
                                                                )}
                                                            >
                                                                {item.icon && (
                                                                    <Icon
                                                                        iconNode={
                                                                            item.icon
                                                                        }
                                                                        className="h-5 w-5"
                                                                    />
                                                                )}
                                                                <span>
                                                                    {item.title}
                                                                </span>
                                                            </Link>
                                                            <div className="ml-6 space-y-1">
                                                                {item.submenu.map(
                                                                    (
                                                                        subitem,
                                                                    ) => (
                                                                        <Link
                                                                            key={
                                                                                subitem.title
                                                                            }
                                                                            href={
                                                                                subitem.href
                                                                            }
                                                                            className={cn(
                                                                                'flex items-center space-x-3 rounded-lg px-4 py-3 text-base transition-colors active:bg-muted',
                                                                                page.url ===
                                                                                    subitem.href
                                                                                    ? 'bg-[#7a9b3c]/10 text-[#7a9b3c]'
                                                                                    : 'text-muted-foreground hover:bg-muted',
                                                                            )}
                                                                        >
                                                                            {subitem.icon && (
                                                                                <Icon
                                                                                    iconNode={
                                                                                        subitem.icon
                                                                                    }
                                                                                    className="h-5 w-5"
                                                                                />
                                                                            )}
                                                                            <span>
                                                                                {
                                                                                    subitem.title
                                                                                }
                                                                            </span>
                                                                        </Link>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                'flex items-center space-x-3 rounded-lg px-4 py-3.5 text-base font-medium transition-colors active:bg-muted',
                                                                page.url ===
                                                                    item.href
                                                                    ? 'bg-[#7a9b3c]/10 text-[#7a9b3c]'
                                                                    : 'text-muted-foreground hover:bg-muted',
                                                            )}
                                                        >
                                                            {item.icon && (
                                                                <Icon
                                                                    iconNode={
                                                                        item.icon
                                                                    }
                                                                    className="h-5 w-5"
                                                                />
                                                            )}
                                                            <span>
                                                                {item.title}
                                                            </span>
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

                {/* Menú de navegación secundario */}
                {isMenuOpen && (
                    <div className="hidden border-t border-border bg-card lg:block">
                        <div className="mx-auto flex items-center justify-center px-6">
                            <NavigationMenu className="flex h-12 items-center">
                                <NavigationMenuList className="flex h-full items-stretch space-x-1">
                                    {mainNavItems.map((item, index) => (
                                        <NavigationMenuItem
                                            key={index}
                                            className="relative flex h-full items-center"
                                        >
                                            {item.submenu ? (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <button
                                                            className={cn(
                                                                'flex h-full items-center space-x-2 border-b-2 border-transparent px-4 text-sm font-medium transition-colors hover:text-foreground',
                                                                page.url.startsWith(
                                                                    item.href,
                                                                )
                                                                    ? activeItemStyles
                                                                    : 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {item.icon && (
                                                                <Icon
                                                                    iconNode={
                                                                        item.icon
                                                                    }
                                                                    className="mr-2 h-4 w-4"
                                                                />
                                                            )}
                                                            <span>
                                                                {item.title}
                                                            </span>
                                                            {item.title && (
                                                                <ChevronDown className="ml-1 h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align="start"
                                                        className="w-48"
                                                    >
                                                        {item.submenu.map(
                                                            (subitem) => (
                                                                <Link
                                                                    key={
                                                                        subitem.title
                                                                    }
                                                                    href={
                                                                        subitem.href
                                                                    }
                                                                    className={cn(
                                                                        'flex cursor-pointer items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted',
                                                                        page.url ===
                                                                            subitem.href
                                                                            ? 'bg-[#7a9b3c]/10 text-[#7a9b3c]'
                                                                            : 'text-muted-foreground',
                                                                    )}
                                                                >
                                                                    {subitem.icon && (
                                                                        <Icon
                                                                            iconNode={
                                                                                subitem.icon
                                                                            }
                                                                            className="h-4 w-4"
                                                                        />
                                                                    )}
                                                                    <span>
                                                                        {
                                                                            subitem.title
                                                                        }
                                                                    </span>
                                                                </Link>
                                                            ),
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        'flex h-full items-center space-x-2 border-b-2 border-transparent px-4 text-sm font-medium transition-colors',
                                                        page.url === item.href
                                                            ? activeItemStyles
                                                            : 'text-muted-foreground hover:text-foreground',
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <Icon
                                                            iconNode={item.icon}
                                                            className="mr-2 h-4 w-4"
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
                <div className="flex w-full border-b border-border bg-muted">
                    <div className="mx-auto flex h-10 w-full items-center justify-start px-6 text-muted-foreground">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}

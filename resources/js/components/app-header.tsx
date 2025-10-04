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
    NavigationMenuList
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
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    Home, 
    GraduationCap, 
    Users, 
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
    Search
} from 'lucide-react';


// Navegación principal personalizada para Academia Armonía
const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: Home,
    },
    {
        title: 'Estudiantes',
        href: '/estudiantes',
        icon: GraduationCap,
    },
    {
        title: 'Profesores',
        href: '/profesores',
        icon: Users,
    },
    {
        title: 'Pagos',
        href: '/pagos',
        icon: CreditCard,
    },
    {
        title: 'Horarios',
        href: '/horarios',
        icon: Calendar,
    },
    {
        title: 'Asistencia',
        href: '/asistencia',
        icon: CheckSquare,
    },
    {
        title: 'Comunicación',
        href: '/comunicacion',
        icon: MessageSquare,
    },
    {
        title: 'Reportes',
        href: '/reportes',
        icon: FileText,
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
    
    // Simulación de notificaciones - reemplaza con tu lógica real
    const notificationCount = 3;

    return (
        <>
            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex h-16 items-center justify-between px-6">
                    {/* Logo y título */}
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
                                Academia Armonía
                            </span>
                            <span className="text-xs text-gray-500">
                                Sistema de Gestión Musical
                            </span>
                        </div>
                    </Link>

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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden h-10 w-10 lg:flex"
                        >
                            <Mail className="h-5 w-5 text-gray-600" />
                        </Button>

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
                                            Administrador
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
                                                Academia Armonía
                                            </span>
                                        </div>
                                    </SheetHeader>
                                    <div className="mt-6 flex flex-col space-y-1">
                                        {mainNavItems.map((item) => (
                                            <Link
                                                key={item.title}
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
                                        ))}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

                {/* Menú de navegación secundario */}
                <div className="hidden border-t border-gray-200 bg-white lg:block">
                    <div className="mx-auto flex justify-center px-6">
                        <NavigationMenu className="flex h-12 items-center">
                            <NavigationMenuList className="flex h-full items-stretch space-x-1">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
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
                                                    className="h-4 w-4"
                                                />
                                            )}
                                            {item.title}
                                        </Link>
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                </div>
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
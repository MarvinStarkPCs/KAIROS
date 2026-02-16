import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    GraduationCap,
    Users,
    Clock,
    Plus,
    Edit,
    Trash2,
    Calendar,
    CheckCircle,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    Music,
    Music2,
    Music3,
    Music4,
    Piano,
    Guitar,
    Drum,
    Mic,
    Mic2,
    MicVocal,
    Radio,
    Headphones,
    Headset,
    Volume2,
    Volume1,
    AudioLines,
    AudioWaveform,
    ListMusic,
    Disc,
    Disc2,
    Disc3,
    DiscAlbum,
    PlayCircle,
    PauseCircle,
    SkipForward,
    Shuffle,
    Repeat,
    Speaker,
    Megaphone,
    Bell,
    BellRing,
    Waves,
    Activity,
    Airplay,
    Cast,
    Tv,
    Monitor,
    Smartphone,
    Tablet,
    Watch,
    Star,
    Heart,
    Award,
    Trophy,
    Medal,
    Crown,
    Sparkles,
    Zap,
    Flame,
    Sun,
    Moon,
    CloudSun,
    Rainbow,
    Palette,
    Brush,
    PenTool,
    Feather,
    BookOpen,
    School,
    Library,
    UserCircle,
    Baby,
    PersonStanding,
    Hand,
    ThumbsUp,
    Smile,
    PartyPopper,
    Gift,
    Cake,
    type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProgramAcademyController from '@/actions/App/Http/Controllers/program_academy';
import AppLayout from '@/layouts/app-layout';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Mapa de iconos
const ICON_MAP: Record<string, LucideIcon> = {
    music: Music,
    music2: Music2,
    music3: Music3,
    music4: Music4,
    listMusic: ListMusic,
    audioLines: AudioLines,
    audioWaveform: AudioWaveform,
    waves: Waves,
    activity: Activity,
    piano: Piano,
    guitar: Guitar,
    drum: Drum,
    mic: Mic,
    mic2: Mic2,
    micVocal: MicVocal,
    speaker: Speaker,
    megaphone: Megaphone,
    disc: Disc,
    disc2: Disc2,
    disc3: Disc3,
    discAlbum: DiscAlbum,
    playCircle: PlayCircle,
    pauseCircle: PauseCircle,
    skipForward: SkipForward,
    shuffle: Shuffle,
    repeat: Repeat,
    headphones: Headphones,
    headset: Headset,
    volume2: Volume2,
    volume1: Volume1,
    radio: Radio,
    airplay: Airplay,
    cast: Cast,
    graduationCap: GraduationCap,
    school: School,
    library: Library,
    bookOpen: BookOpen,
    award: Award,
    trophy: Trophy,
    medal: Medal,
    crown: Crown,
    users: Users,
    userCircle: UserCircle,
    baby: Baby,
    personStanding: PersonStanding,
    hand: Hand,
    thumbsUp: ThumbsUp,
    smile: Smile,
    palette: Palette,
    brush: Brush,
    penTool: PenTool,
    feather: Feather,
    sparkles: Sparkles,
    star: Star,
    heart: Heart,
    zap: Zap,
    flame: Flame,
    sun: Sun,
    moon: Moon,
    cloudSun: CloudSun,
    rainbow: Rainbow,
    bell: Bell,
    bellRing: BellRing,
    partyPopper: PartyPopper,
    gift: Gift,
    cake: Cake,
    tv: Tv,
    monitor: Monitor,
    smartphone: Smartphone,
    tablet: Tablet,
    watch: Watch,
};

const getIconComponent = (iconName: string | undefined | null): LucideIcon => {
    if (!iconName) return Music;
    return ICON_MAP[iconName] || Music;
};

interface Program {
    id: number;
    name: string;
    description: string | null;
    duration_months: number;
    status: 'active' | 'inactive';
    color: string;
    icon: string;
    active_students_count: number;
    schedules_count: number;
    active_schedules_count: number;
}

interface Stats {
    total_programs: number;
    active_programs: number;
    total_students: number;
    total_professors: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    programs: {
        data: Program[];
        current_page: number;
        last_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: PaginationLink[];
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    stats: Stats;
    filters?: {
        search?: string;
        status?: string;
    };
}

export default function Index({ programs, stats, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; programId: number | null }>({
        open: false,
        programId: null,
    });

    const programsList = programs?.data || [];
    const pagination = {
        currentPage: programs?.current_page || 1,
        lastPage: programs?.last_page || 1,
        total: programs?.total || 0,
        from: programs?.from,
        to: programs?.to,
        links: programs?.links || [],
        prevUrl: programs?.prev_page_url,
        nextUrl: programs?.next_page_url,
    };

    const handleSearch = () => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;

        router.get(ProgramAcademyController.index().url, params, {
            preserveState: true,
        });
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setStatusFilter(value);

        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (value) params.status = value;

        router.get(ProgramAcademyController.index().url, params, {
            preserveState: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        router.get(ProgramAcademyController.index().url);
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    const handleDelete = () => {
        if (deleteDialog.programId) {
            router.delete(ProgramAcademyController.destroy({ program: deleteDialog.programId }).url, {
                onSuccess: () => setDeleteDialog({ open: false, programId: null }),
            });
        }
    };

    const hasFilters = search || statusFilter;

    return (
        <AppLayout>
            <Head title="Programas Académicos" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Programas Académicos</h1>
                        <p className="mt-2 text-muted-foreground">Gestiona los programas y cursos de la academia</p>
                    </div>
                    <Button asChild>
                        <Link href={ProgramAcademyController.create().url}>
                            <Plus className="mr-2 h-5 w-5" />
                            Nuevo Programa
                        </Link>
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Programas</p>
                                <p className="text-3xl font-bold text-foreground">{stats?.total_programs || 0}</p>
                            </div>
                            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                                <GraduationCap className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Programas Activos</p>
                                <p className="text-3xl font-bold text-green-600">{stats?.active_programs || 0}</p>
                            </div>
                            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Estudiantes</p>
                                <p className="text-3xl font-bold text-blue-600">{stats?.total_students || 0}</p>
                            </div>
                            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl bg-card p-6 shadow-sm border border-border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Profesores</p>
                                <p className="text-3xl font-bold text-purple-600">{stats?.total_professors || 0}</p>
                            </div>
                            <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar programas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="h-10 rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos</option>
                            <option value="active">Activos</option>
                            <option value="inactive">Inactivos</option>
                        </select>
                        <Button onClick={handleSearch}>
                            <Search className="mr-2 h-4 w-4" />
                            Buscar
                        </Button>
                        {hasFilters && (
                            <Button variant="outline" onClick={clearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Limpiar
                            </Button>
                        )}
                    </div>
                    {pagination.total > 0 && (
                        <p className="mt-3 text-sm text-muted-foreground">
                            Mostrando {pagination.from} - {pagination.to} de {pagination.total} programas
                        </p>
                    )}
                </div>

                {/* Programs Grid */}
                {programsList.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {programsList.map((program) => {
                            const IconComponent = getIconComponent(program?.icon);
                            if (!program) return null;
                            return (
                                <div
                                    key={program.id}
                                    className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg"
                                >
                                    <div className="mb-4 flex items-start justify-between">
                                        <div
                                            className="flex h-12 w-12 items-center justify-center rounded-lg border-2"
                                            style={{
                                                backgroundColor: program.color ? `${program.color}20` : '#3B82F620',
                                                borderColor: program.color || '#3B82F6',
                                            }}
                                        >
                                            <IconComponent className="h-6 w-6" style={{ color: program.color || '#3B82F6' }} />
                                        </div>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                program.status === 'active'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}
                                        >
                                            {program.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-foreground">{program.name}</h3>
                                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                                        {program.description || 'Sin descripción'}
                                    </p>
                                    <div className="mb-4 space-y-2">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="mr-2 h-4 w-4" />
                                            <span>{program.duration_months || 0} meses</span>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Users className="mr-2 h-4 w-4" />
                                            <span>{program.active_students_count ?? 0} estudiantes</span>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            <span>{program.active_schedules_count ?? 0} horarios activos</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 border-t border-border pt-4">
                                        <Link href={ProgramAcademyController.show({ program: program.id }).url}>
                                            <Button size="sm" className="w-full">
                                                Ver Plan de Estudios
                                            </Button>
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={ProgramAcademyController.edit({ program: program.id }).url}
                                                className="flex-1"
                                            >
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Edit className="mr-1 h-4 w-4" />
                                                    Editar
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => setDeleteDialog({ open: true, programId: program.id })}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border-2 border-dashed border-input bg-background text-foreground p-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            {hasFilters ? <Search className="h-8 w-8 text-muted-foreground" /> : <GraduationCap className="h-8 w-8 text-muted-foreground" />}
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-foreground">
                            {hasFilters ? 'No se encontraron programas' : 'No hay programas académicos'}
                        </h3>
                        <p className="mb-6 text-muted-foreground">
                            {hasFilters ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer programa'}
                        </p>
                        {hasFilters ? (
                            <Button variant="outline" onClick={clearFilters}>
                                <X className="mr-2 h-5 w-5" />
                                Limpiar filtros
                            </Button>
                        ) : (
                            <Button asChild>
                                <Link href={ProgramAcademyController.create().url}>
                                    <Plus className="mr-2 h-5 w-5" />
                                    Crear Primer Programa
                                </Link>
                            </Button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pagination.lastPage > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(pagination.prevUrl)}
                            disabled={!pagination.prevUrl}
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" />
                            Anterior
                        </Button>
                        <span className="px-4 text-sm text-muted-foreground">
                            Página {pagination.currentPage} de {pagination.lastPage}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(pagination.nextUrl)}
                            disabled={!pagination.nextUrl}
                        >
                            Siguiente
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el programa académico.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import {
    Check,
    X,
    Clock,
    TrendingUp,
    Download,
    Search,
    Filter,
    Eye,
    AlertTriangle,
    Calendar,
    FileText,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PageProps } from '@/types';
import { useState, useEffect } from 'react';

interface Estudiante {
    id: number;
    nombre: string;
    email: string;
    avatar?: string;
}

interface Programa {
    id: number;
    nombre: string;
    color: string;
}

interface Profesor {
    id: number;
    nombre: string;
    avatar?: string;
}

interface Asistencia {
    id: number;
    fecha: string;
    fecha_formato: string;
    hora: string;
    estudiante: Estudiante;
    programa: Programa;
    profesor: Profesor;
    estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
    estado_original: string;
    notas: string | null;
    registrado_por: string;
    created_at: string;
}

interface PaginatedData {
    data: Asistencia[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Alerta {
    id: string;
    estudiante: {
        nombre: string;
        clase: string;
        avatar?: string;
    };
    tipo: 'critico' | 'atencion' | 'seguimiento';
    mensaje: string;
    acciones: string[];
}

interface FilterOption {
    id: number;
    name: string;
}

interface Props extends PageProps {
    asistenciaHoy: {
        total: number;
        presentes: number;
        porcentaje: string;
    };
    ausencias: number;
    tardanzas: number;
    promedioMensual: string;
    asistencias: PaginatedData;
    alertas: Alerta[];
    filters: {
        search: string | null;
        status: string | null;
        program_id: string | null;
        professor_id: string | null;
        date_from: string | null;
        date_to: string | null;
    };
    programs: FilterOption[];
    professors: FilterOption[];
}

export default function ControlAsistencia({
    asistenciaHoy = { total: 0, presentes: 0, porcentaje: '0%' },
    ausencias = 0,
    tardanzas = 0,
    promedioMensual = '0%',
    asistencias,
    alertas = [],
    filters,
    programs = [],
    professors = []
}: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [programId, setProgramId] = useState(filters?.program_id || '');
    const [professorId, setProfessorId] = useState(filters?.professor_id || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState<Asistencia | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                applyFilters({ search });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const applyFilters = (newFilters: Record<string, string | null> = {}) => {
        const params: Record<string, string> = {};

        const currentSearch = newFilters.search !== undefined ? newFilters.search : search;
        const currentStatus = newFilters.status !== undefined ? newFilters.status : status;
        const currentProgramId = newFilters.program_id !== undefined ? newFilters.program_id : programId;
        const currentProfessorId = newFilters.professor_id !== undefined ? newFilters.professor_id : professorId;
        const currentDateFrom = newFilters.date_from !== undefined ? newFilters.date_from : dateFrom;
        const currentDateTo = newFilters.date_to !== undefined ? newFilters.date_to : dateTo;

        if (currentSearch) params.search = currentSearch;
        if (currentStatus && currentStatus !== 'all') params.status = currentStatus;
        if (currentProgramId && currentProgramId !== 'all') params.program_id = currentProgramId;
        if (currentProfessorId && currentProfessorId !== 'all') params.professor_id = currentProfessorId;
        if (currentDateFrom) params.date_from = currentDateFrom;
        if (currentDateTo) params.date_to = currentDateTo;

        router.get('/asistencia', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setProgramId('');
        setProfessorId('');
        setDateFrom('');
        setDateTo('');
        router.get('/asistencia');
    };

    const goToPage = (page: number) => {
        const params: Record<string, string> = { page: page.toString() };
        if (search) params.search = search;
        if (status && status !== 'all') params.status = status;
        if (programId && programId !== 'all') params.program_id = programId;
        if (professorId && professorId !== 'all') params.professor_id = professorId;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        router.get('/asistencia', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'presente':
                return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: Check, label: 'Presente' };
            case 'ausente':
                return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: X, label: 'Ausente' };
            case 'tardanza':
                return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: Clock, label: 'Tarde' };
            case 'justificado':
                return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: FileText, label: 'Justificado' };
            default:
                return { bg: 'bg-muted', text: 'text-muted-foreground', icon: Clock, label: 'Pendiente' };
        }
    };

    const getAlertaTipo = (tipo: string) => {
        switch (tipo) {
            case 'critico':
                return { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' };
            case 'atencion':
                return { bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300', badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' };
            case 'seguimiento':
                return { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' };
            default:
                return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', badge: 'bg-muted text-foreground' };
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const hasActiveFilters = (status && status !== 'all') || (programId && programId !== 'all') || (professorId && professorId !== 'all') || dateFrom || dateTo;

    return (
        <AppLayout>
            <Head title="Control de Asistencia" />

            <Heading
                title="Control de Asistencia"
                description="Registro y seguimiento de asistencia estudiantil"
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Asistencia Hoy */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">Asistencia Hoy</span>
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">
                        {asistenciaHoy.presentes}/{asistenciaHoy.total}
                    </div>
                    <div className="text-xs text-green-600 font-medium mb-2">
                        {asistenciaHoy.porcentaje} de asistencia
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-green-500 h-full rounded-full transition-all duration-500"
                            style={{ width: asistenciaHoy.porcentaje }}
                        ></div>
                    </div>
                </div>

                {/* Ausencias */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">Ausencias</span>
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <X className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">{ausencias}</div>
                    <div className="text-xs text-muted-foreground">Sin justificar</div>
                    <div className="text-xs text-muted-foreground mt-1">Hoy</div>
                </div>

                {/* Tardanzas */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">Tardanzas</span>
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">{tardanzas}</div>
                    <div className="text-xs text-muted-foreground">Hoy</div>
                    <div className="text-xs text-muted-foreground mt-1">Estudiantes</div>
                </div>

                {/* Promedio Mensual */}
                <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">Promedio Mensual</span>
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-2">{promedioMensual}</div>
                    <div className="text-xs text-green-600 font-medium">Este mes</div>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-card rounded-lg shadow-sm mb-6 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Buscar por nombre o email del estudiante..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Botón de filtros */}
                    <div className="flex gap-2">
                        <Button
                            variant={showFilters ? 'default' : 'outline'}
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                            {hasActiveFilters && (
                                <Badge className="bg-red-500 text-white ml-1">!</Badge>
                            )}
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={clearFilters}>
                                Limpiar
                            </Button>
                        )}
                        <Button variant="outline" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Exportar
                        </Button>
                    </div>
                </div>

                {/* Panel de filtros expandible */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t">
                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
                            <Select
                                value={status}
                                onValueChange={(value) => {
                                    setStatus(value);
                                    applyFilters({ status: value });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los estados" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="present">Presente</SelectItem>
                                    <SelectItem value="late">Tarde</SelectItem>
                                    <SelectItem value="absent">Ausente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Programa */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Programa</label>
                            <Select
                                value={programId}
                                onValueChange={(value) => {
                                    setProgramId(value);
                                    applyFilters({ program_id: value });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los programas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los programas</SelectItem>
                                    {programs.map((program) => (
                                        <SelectItem key={program.id} value={program.id.toString()}>
                                            {program.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Profesor */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Profesor</label>
                            <Select
                                value={professorId}
                                onValueChange={(value) => {
                                    setProfessorId(value);
                                    applyFilters({ professor_id: value });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los profesores" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los profesores</SelectItem>
                                    {professors.map((professor) => (
                                        <SelectItem key={professor.id} value={professor.id.toString()}>
                                            {professor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Fecha desde */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Desde</label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => {
                                    setDateFrom(e.target.value);
                                    applyFilters({ date_from: e.target.value });
                                }}
                            />
                        </div>

                        {/* Fecha hasta */}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Hasta</label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => {
                                    setDateTo(e.target.value);
                                    applyFilters({ date_to: e.target.value });
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Tabla de Asistencia */}
            <div className="bg-card rounded-lg shadow-sm mb-6 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Historial de Asistencias</h2>
                    <div className="text-sm text-gray-300">
                        {asistencias?.total || 0} registros encontrados
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Estudiante
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Programa
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Profesor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Justificación
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {asistencias?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        No se encontraron registros de asistencia
                                    </td>
                                </tr>
                            ) : (
                                asistencias?.data?.map((asistencia) => {
                                    const estadoBadge = getEstadoBadge(asistencia.estado);
                                    const EstadoIcon = estadoBadge.icon;

                                    return (
                                        <tr key={asistencia.id} className="hover:bg-muted">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                                                    <div>
                                                        <div className="text-sm font-medium text-foreground">
                                                            {asistencia.fecha_formato}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {asistencia.hora}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Avatar className="h-9 w-9 mr-3">
                                                        <AvatarImage src={asistencia.estudiante.avatar} />
                                                        <AvatarFallback className="bg-[#7a9b3c] text-white text-xs">
                                                            {getInitials(asistencia.estudiante.nombre)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-sm font-medium text-foreground">
                                                            {asistencia.estudiante.nombre}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {asistencia.estudiante.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span
                                                        className="inline-block w-2 h-2 rounded-full mr-2"
                                                        style={{ backgroundColor: asistencia.programa.color }}
                                                    ></span>
                                                    <span className="text-sm text-foreground">
                                                        {asistencia.programa.nombre}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Avatar className="h-7 w-7 mr-2">
                                                        <AvatarImage src={asistencia.profesor.avatar} />
                                                        <AvatarFallback className="bg-gray-400 text-white text-xs">
                                                            {getInitials(asistencia.profesor.nombre)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-foreground">
                                                        {asistencia.profesor.nombre}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${estadoBadge.bg} ${estadoBadge.text}`}>
                                                    <EstadoIcon className="w-3 h-3 mr-1" />
                                                    {estadoBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {asistencia.notas ? (
                                                    <div className="max-w-xs">
                                                        <p className="text-sm text-muted-foreground truncate" title={asistencia.notas}>
                                                            {asistencia.notas}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setSelectedAttendance(asistencia)}
                                                >
                                                    <Eye className="w-4 h-4 text-blue-600" />
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {asistencias?.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {asistencias.from} a {asistencias.to} de {asistencias.total} registros
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(asistencias.current_page - 1)}
                                disabled={asistencias.current_page === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Página {asistencias.current_page} de {asistencias.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(asistencias.current_page + 1)}
                                disabled={asistencias.current_page === asistencias.last_page}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sección de Alertas */}
            {alertas.length > 0 && (
                <div className="bg-card rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-foreground">Estudiantes con Alertas</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {alertas.map((alerta) => {
                            const alertaTipo = getAlertaTipo(alerta.tipo);

                            return (
                                <div
                                    key={alerta.id}
                                    className={`rounded-lg p-4 border ${alertaTipo.bg} ${alertaTipo.border}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={alerta.estudiante.avatar} />
                                            <AvatarFallback className="bg-gray-400 text-white text-xs">
                                                {getInitials(alerta.estudiante.nombre)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-foreground">{alerta.estudiante.nombre}</h4>
                                                    <p className="text-xs text-muted-foreground">{alerta.estudiante.clase}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${alertaTipo.badge}`}>
                                                    {alerta.tipo === 'critico' ? 'Crítico' : alerta.tipo === 'atencion' ? 'Atención' : 'Seguimiento'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">{alerta.mensaje}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal de detalle de asistencia */}
            <Dialog open={!!selectedAttendance} onOpenChange={() => setSelectedAttendance(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Detalle de Asistencia</DialogTitle>
                        <DialogDescription>
                            Información completa del registro de asistencia
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAttendance && (
                        <div className="space-y-4">
                            {/* Estudiante */}
                            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-[#7a9b3c] text-white">
                                        {getInitials(selectedAttendance.estudiante.nombre)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-foreground">{selectedAttendance.estudiante.nombre}</h4>
                                    <p className="text-sm text-muted-foreground">{selectedAttendance.estudiante.email}</p>
                                </div>
                            </div>

                            {/* Detalles */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Fecha</label>
                                    <p className="font-medium">{selectedAttendance.fecha_formato}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Hora de clase</label>
                                    <p className="font-medium">{selectedAttendance.hora}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Programa</label>
                                    <p className="font-medium">{selectedAttendance.programa.nombre}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground uppercase">Profesor</label>
                                    <p className="font-medium">{selectedAttendance.profesor.nombre}</p>
                                </div>
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Estado</label>
                                <div className="mt-1">
                                    {(() => {
                                        const estadoBadge = getEstadoBadge(selectedAttendance.estado);
                                        const EstadoIcon = estadoBadge.icon;
                                        return (
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${estadoBadge.bg} ${estadoBadge.text}`}>
                                                <EstadoIcon className="w-4 h-4 mr-1" />
                                                {estadoBadge.label}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Justificación/Notas */}
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Justificación / Notas</label>
                                {selectedAttendance.notas ? (
                                    <div className="mt-1 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <p className="text-sm text-foreground">{selectedAttendance.notas}</p>
                                    </div>
                                ) : (
                                    <p className="mt-1 text-muted-foreground italic">Sin justificación registrada</p>
                                )}
                            </div>

                            {/* Info adicional */}
                            <div className="pt-3 border-t text-xs text-muted-foreground">
                                <p>Registrado por: {selectedAttendance.registrado_por}</p>
                                <p>Fecha de registro: {selectedAttendance.created_at}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

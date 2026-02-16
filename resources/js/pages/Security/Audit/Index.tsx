import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Search,
    X,
    Filter,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    FileText,
    Eye,
    Activity,
} from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Causer {
    id: number;
    name: string;
    email: string;
}

interface Subject {
    type: string;
    id: number;
    name: string;
}

interface Properties {
    attributes?: Record<string, unknown>;
    old?: Record<string, unknown>;
    [key: string]: unknown;
}

interface ActivityItem {
    id: number;
    description: string;
    causer: Causer | null;
    subject: Subject | null;
    properties: Properties;
    created_at: string;
}

interface Links {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

interface Meta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
}

interface Filters {
    start_date?: string;
    end_date?: string;
    user_id?: string;
    action?: string;
}

interface IndexProps {
    activities: {
        data: ActivityItem[];
        links: Links;
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    links?: Links;
    meta?: Meta;
    filters?: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inicio', href: route('programas_academicos.index') },
    { title: 'Auditoría', href: route('audit.index') },
];

function getSubjectLabel(type: string): string {
    const map: Record<string, string> = {
        'App\\Models\\User': 'Usuario',
        'App\\Models\\AcademicProgram': 'Programa',
        'App\\Models\\Enrollment': 'Matrícula',
        'App\\Models\\Payment': 'Pago',
        'App\\Models\\Schedule': 'Horario',
        'App\\Models\\Attendance': 'Asistencia',
        'App\\Models\\StudyPlan': 'Plan de Estudio',
        'App\\Models\\Activity': 'Actividad',
        'App\\Models\\Message': 'Mensaje',
        'App\\Models\\Conversation': 'Conversación',
        'App\\Models\\ParentGuardian': 'Acudiente',
        'App\\Models\\StudentProfile': 'Perfil Estudiante',
        'App\\Models\\TeacherProfile': 'Perfil Profesor',
        'App\\Models\\ScheduleEnrollment': 'Inscripción Horario',
        'App\\Models\\EvaluationCriteria': 'Criterio Evaluación',
        'App\\Models\\ActivityEvaluation': 'Evaluación',
        'App\\Models\\PaymentTransaction': 'Transacción',
        'App\\Models\\PaymentSetting': 'Config. Pago',
        'App\\Models\\WompiSetting': 'Config. Wompi',
        'App\\Models\\SmtpSetting': 'Config. SMTP',
        'App\\Models\\DemoRequest': 'Solicitud Demo',
        'App\\Models\\DemoLead': 'Demo Lead',
        'App\\Models\\StudentProgress': 'Progreso',
    };
    return map[type] || type.split('\\').pop() || 'Desconocido';
}

function getDescriptionBadge(description: string) {
    const map: Record<string, { label: string; className: string }> = {
        created: { label: 'Creado', className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' },
        updated: { label: 'Actualizado', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' },
        deleted: { label: 'Eliminado', className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' },
    };
    return map[description] || { label: description, className: 'bg-muted text-foreground' };
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function formatFieldName(key: string): string {
    const map: Record<string, string> = {
        name: 'Nombre',
        last_name: 'Apellido',
        email: 'Email',
        status: 'Estado',
        description: 'Descripción',
        monthly_fee: 'Cuota Mensual',
        amount: 'Monto',
        due_date: 'Fecha Vencimiento',
        payment_date: 'Fecha Pago',
        payment_method: 'Método Pago',
        enrolled_level: 'Nivel',
        enrollment_date: 'Fecha Matrícula',
        days_of_week: 'Días',
        start_time: 'Hora Inicio',
        end_time: 'Hora Fin',
        classroom: 'Salón',
        max_students: 'Cupos Máx.',
        class_date: 'Fecha Clase',
        notes: 'Notas',
        modality: 'Modalidad',
        concept: 'Concepto',
        reference_number: 'Referencia',
        is_active: 'Activo',
        module_name: 'Módulo',
        hours: 'Horas',
        level: 'Nivel',
        weight: 'Peso',
        order: 'Orden',
        points_earned: 'Puntos',
        feedback: 'Retroalimentación',
        color: 'Color',
        semester: 'Semestre',
        duration_months: 'Duración (meses)',
        progress: 'Progreso',
        remarks: 'Observaciones',
    };
    return map[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function AuditIndex({ activities, links, meta, filters }: IndexProps) {
    const [search, setSearch] = useState(filters?.action || '');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');
    const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

    const paginationMeta = meta || {
        current_page: activities.current_page,
        from: activities.from,
        last_page: activities.last_page,
        to: activities.to,
        total: activities.total,
        per_page: 50,
    };

    const paginationLinks = links || activities.links;

    const handleFilter = () => {
        router.get(route('audit.filter'), {
            action: search || undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setStartDate('');
        setEndDate('');
        router.get(route('audit.index'));
    };

    const hasFilters = search || startDate || endDate;

    const activityData = activities.data || activities;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Auditoría" />

            <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Registro de Auditoría
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Historial de cambios realizados en el sistema
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            <Activity className="mr-1 h-3.5 w-3.5" />
                            {paginationMeta.total} registros
                        </Badge>
                    </div>
                </div>

                {/* Filtros */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="h-4 w-4" />
                            Filtros
                        </CardTitle>
                        <CardDescription>
                            Filtra los registros por acción, fecha o usuario
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Buscar acción
                                </label>
                                <div className="relative">
                                    <Input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="created, updated, deleted..."
                                        className="pl-9"
                                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                    />
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Desde
                                </label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                    Hasta
                                </label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleFilter} size="sm">
                                    <Search className="mr-1 h-4 w-4" />
                                    Filtrar
                                </Button>
                                {hasFilters && (
                                    <Button
                                        onClick={clearFilters}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Limpiar
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabla */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Fecha</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead className="w-[120px]">Acción</TableHead>
                                    <TableHead>Entidad</TableHead>
                                    <TableHead>Elemento</TableHead>
                                    <TableHead className="w-[80px] text-center">Detalle</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.isArray(activityData) && activityData.length > 0 ? (
                                    activityData.map((activity) => {
                                        const badge = getDescriptionBadge(activity.description);
                                        return (
                                            <TableRow key={activity.id} className="hover:bg-muted">
                                                <TableCell className="text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                        {formatDate(activity.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {activity.causer ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-foreground">
                                                                    {activity.causer.name}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {activity.causer.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">
                                                            Sistema
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={badge.className}
                                                    >
                                                        {badge.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {activity.subject ? (
                                                        <Badge variant="outline" className="font-normal">
                                                            <FileText className="mr-1 h-3 w-3" />
                                                            {getSubjectLabel(activity.subject.type)}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm text-muted-foreground">
                                                        {activity.subject?.name || '—'}
                                                    </span>
                                                    {activity.subject?.id && (
                                                        <span className="ml-1 text-xs text-muted-foreground">
                                                            #{activity.subject.id}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() =>
                                                            setSelectedActivity(activity)
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="py-12 text-center"
                                        >
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Activity className="h-10 w-10" />
                                                <p className="text-sm font-medium">
                                                    No se encontraron registros
                                                </p>
                                                <p className="text-xs">
                                                    Intenta ajustar los filtros de búsqueda
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* Paginación */}
                    {paginationMeta.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">
                                Mostrando{' '}
                                <span className="font-medium">
                                    {paginationMeta.from}
                                </span>
                                {' '}a{' '}
                                <span className="font-medium">
                                    {paginationMeta.to}
                                </span>
                                {' '}de{' '}
                                <span className="font-medium">
                                    {paginationMeta.total}
                                </span>
                                {' '}registros
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!paginationLinks?.prev}
                                    onClick={() =>
                                        paginationLinks?.prev &&
                                        router.get(paginationLinks.prev)
                                    }
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Anterior
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Página {paginationMeta.current_page} de{' '}
                                    {paginationMeta.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!paginationLinks?.next}
                                    onClick={() =>
                                        paginationLinks?.next &&
                                        router.get(paginationLinks.next)
                                    }
                                >
                                    Siguiente
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Modal de detalle */}
            <Dialog
                open={!!selectedActivity}
                onOpenChange={() => setSelectedActivity(null)}
            >
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Detalle del Registro #{selectedActivity?.id}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedActivity && (
                        <div className="space-y-4">
                            {/* Info general */}
                            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Fecha
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {formatDate(selectedActivity.created_at)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Acción
                                    </p>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            getDescriptionBadge(
                                                selectedActivity.description,
                                            ).className
                                        }
                                    >
                                        {
                                            getDescriptionBadge(
                                                selectedActivity.description,
                                            ).label
                                        }
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Usuario
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {selectedActivity.causer?.name || 'Sistema'}
                                    </p>
                                    {selectedActivity.causer?.email && (
                                        <p className="text-xs text-muted-foreground">
                                            {selectedActivity.causer.email}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Entidad
                                    </p>
                                    <p className="text-sm text-foreground">
                                        {selectedActivity.subject
                                            ? `${getSubjectLabel(selectedActivity.subject.type)} #${selectedActivity.subject.id}`
                                            : '—'}
                                    </p>
                                    {selectedActivity.subject?.name && (
                                        <p className="text-xs text-muted-foreground">
                                            {selectedActivity.subject.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Cambios - Atributos nuevos */}
                            {selectedActivity.properties?.attributes && (
                                <div>
                                    <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                        {selectedActivity.properties?.old
                                            ? 'Valores Nuevos'
                                            : 'Valores'}
                                    </h4>
                                    <div className="overflow-hidden rounded-lg border">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-green-50 dark:bg-green-950/30">
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                                        Campo
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                                        Valor
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {Object.entries(
                                                    selectedActivity.properties
                                                        .attributes,
                                                ).map(([key, value]) => (
                                                    <tr
                                                        key={key}
                                                        className="hover:bg-muted"
                                                    >
                                                        <td className="px-3 py-2 font-medium text-muted-foreground">
                                                            {formatFieldName(key)}
                                                        </td>
                                                        <td className="px-3 py-2 text-muted-foreground">
                                                            {formatValue(value)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Cambios - Atributos anteriores */}
                            {selectedActivity.properties?.old && (
                                <div>
                                    <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                                        Valores Anteriores
                                    </h4>
                                    <div className="overflow-hidden rounded-lg border">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-orange-50 dark:bg-orange-950/30">
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                                        Campo
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                                                        Valor
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {Object.entries(
                                                    selectedActivity.properties.old,
                                                ).map(([key, value]) => (
                                                    <tr
                                                        key={key}
                                                        className="hover:bg-muted"
                                                    >
                                                        <td className="px-3 py-2 font-medium text-muted-foreground">
                                                            {formatFieldName(key)}
                                                        </td>
                                                        <td className="px-3 py-2 text-muted-foreground">
                                                            {formatValue(value)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Sin propiedades */}
                            {!selectedActivity.properties?.attributes &&
                                !selectedActivity.properties?.old && (
                                    <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                                        No hay detalles de cambios registrados
                                    </div>
                                )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

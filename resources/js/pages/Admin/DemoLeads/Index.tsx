import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, Trash2, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface DemoLead {
    id: number;
    name: string;
    email: string;
    phone: string;
    is_for_child: boolean;
    child_name: string | null;
    instrument: string;
    preferred_schedule: string | null;
    message: string | null;
    status: string;
    status_label: string;
    status_color: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedData {
    data: DemoLead[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Stats {
    total: number;
    pending: number;
    contacted: number;
    converted: number;
    rejected: number;
}

interface Filters {
    status: string | null;
    search: string | null;
    sort: string;
    direction: string;
}

interface Props {
    leads: PaginatedData;
    stats: Stats;
    filters: Filters;
}

export default function Index({ leads, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilter = () => {
        router.get('/admin/demo-leads', {
            search: search || undefined,
            status: status !== 'all' ? status : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('all');
        router.get('/admin/demo-leads');
    };

    const handleDelete = (lead: DemoLead) => {
        router.delete(`/admin/demo-leads/${lead.id}`, {
            preserveScroll: true,
        });
    };

    const getStatusStyle = (color: string): React.CSSProperties => {
        switch (color) {
            case 'yellow':
                return { backgroundColor: '#fef9c3', color: '#854d0e', borderColor: '#fde047' };
            case 'blue':
                return { backgroundColor: '#dbeafe', color: '#1e40af', borderColor: '#93c5fd' };
            case 'green':
                return { backgroundColor: '#dcfce7', color: '#166534', borderColor: '#86efac' };
            case 'red':
                return { backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' };
            default:
                return { backgroundColor: '#f3f4f6', color: '#374151', borderColor: '#d1d5db' };
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title="Gestión de Leads - Clases Demo" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Gestión de Leads</h1>
                    <p className="mt-2 text-muted-foreground">
                        Administra las solicitudes de clases demo
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                                    <p className="text-2xl font-bold">{stats.pending}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Contactados</p>
                                    <p className="text-2xl font-bold">{stats.contacted}</p>
                                </div>
                                <Clock className="h-8 w-8 text-blue-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Convertidos</p>
                                    <p className="text-2xl font-bold">{stats.converted}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-600">Rechazados</p>
                                    <p className="text-2xl font-bold">{stats.rejected}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-400" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filtros
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Buscar por nombre, email, teléfono..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="pending">Pendiente</SelectItem>
                                    <SelectItem value="contacted">Contactado</SelectItem>
                                    <SelectItem value="converted">Convertido</SelectItem>
                                    <SelectItem value="rejected">Rechazado</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleFilter}>
                                <Search className="mr-2 h-4 w-4" />
                                Buscar
                            </Button>
                            <Button variant="outline" onClick={handleClearFilters}>
                                Limpiar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Leads ({leads.total})</CardTitle>
                        <CardDescription>
                            Lista de todas las solicitudes de clases demo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Instrumento</TableHead>
                                    <TableHead>Horario Preferido</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            No se encontraron leads
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leads.data.map((lead) => (
                                        <TableRow key={lead.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{lead.name}</p>
                                                    {lead.is_for_child && lead.child_name && (
                                                        <p className="text-sm text-muted-foreground">Para: {lead.child_name}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p>{lead.email}</p>
                                                    <p className="text-muted-foreground">{lead.phone}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{lead.instrument}</TableCell>
                                            <TableCell>
                                                {lead.preferred_schedule ? (
                                                    <span className="text-sm">{lead.preferred_schedule}</span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">No especificado</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    style={getStatusStyle(lead.status_color)}
                                                    className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium"
                                                >
                                                    {lead.status_label}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(lead.created_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={`/admin/demo-leads/${lead.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Trash2 className="h-4 w-4 text-red-600" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Eliminar lead?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción no se puede deshacer. Se eliminará permanentemente el lead de {lead.name}.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(lead)}>
                                                                    Eliminar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {leads.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando {leads.data.length} de {leads.total} resultados
                                </p>
                                <div className="flex gap-2">
                                    {leads.links.map((link, index) => (
                                        link.url ? (
                                            <Button
                                                key={index}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => router.get(link.url!)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <Button key={index} variant="outline" size="sm" disabled>
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Button>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

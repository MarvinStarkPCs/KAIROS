import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Eye, Edit, Trash, Users, UserCheck, UserX, Clock } from 'lucide-react';
import { useState } from 'react';

type EnrollmentStatus = 'active' | 'waiting' | 'withdrawn';

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Program {
    id: number;
    name: string;
}

interface Enrollment {
    id: number;
    student_id: number;
    program_id: number;
    enrollment_date: string;
    status: EnrollmentStatus;
    created_at: string;
    updated_at: string;
    student: Student;
    program: Program;
}

interface PaginatedEnrollments {
    data: Enrollment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Stats {
    total_enrollments: number;
    active_enrollments: number;
    waiting_list: number;
    withdrawn: number;
}

interface Props {
    enrollments: PaginatedEnrollments;
    stats: Stats;
    programs: Program[];
    students: Student[];
    filters: {
        program_id?: string;
        status?: string;
        search?: string;
    };
}

export default function Index({ enrollments, stats, programs, students, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [programFilter, setProgramFilter] = useState(filters.program_id || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleFilter = () => {
        router.get(
            '/inscripciones',
            {
                search: search || undefined,
                program_id: programFilter !== 'all' ? programFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setProgramFilter('all');
        setStatusFilter('all');
        router.get('/inscripciones');
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar esta matrícula?')) {
            router.delete(`/matrículas/${id}`);
        }
    };

    const getStatusBadge = (status: EnrollmentStatus) => {
        const badges = {
            active: <Badge className="bg-green-500">Activo</Badge>,
            waiting: <Badge className="bg-yellow-500">En espera</Badge>,
            withdrawn: <Badge className="bg-gray-500">Retirado</Badge>,
        };
        return badges[status];
    };

    return (
        <AppLayout>
            <Head title="Matrículas" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Matrículas a Programas</h1>
                        <p className="text-muted-foreground">
                            Gestiona las matrículas de estudiantes a programas académicos
                        </p>
                    </div>
                    <Link href="/matrículas/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nueva Matrícula
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Matrículas</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_enrollments}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Activos</CardTitle>
                            <UserCheck className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_enrollments}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">En Espera</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.waiting_list}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Retirados</CardTitle>
                            <UserX className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.withdrawn}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <Input
                                    placeholder="Buscar estudiante..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>

                            <Select value={programFilter} onValueChange={setProgramFilter}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Programa" />
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

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="waiting">En espera</SelectItem>
                                    <SelectItem value="withdrawn">Retirado</SelectItem>
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
                        <CardTitle>
                            Matrículas ({enrollments.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Estudiante</TableHead>
                                    <TableHead>Programa</TableHead>
                                    <TableHead>Fecha Matrícula</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No se encontraron matrículas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    enrollments.data.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="font-medium">#{enrollment.id}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{enrollment.student.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {enrollment.student.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{enrollment.program.name}</TableCell>
                                            <TableCell>
                                                {new Date(enrollment.enrollment_date).toLocaleDateString('es-ES')}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/matrículas/${enrollment.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/matrículas/${enrollment.id}/edit`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(enrollment.id)}
                                                    >
                                                        <Trash className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {enrollments.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Página {enrollments.current_page} de {enrollments.last_page}
                                </div>
                                <div className="flex gap-2">
                                    {enrollments.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                router.get(`/matrículas?page=${enrollments.current_page - 1}`)
                                            }
                                        >
                                            Anterior
                                        </Button>
                                    )}
                                    {enrollments.current_page < enrollments.last_page && (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                router.get(`/matrículas?page=${enrollments.current_page + 1}`)
                                            }
                                        >
                                            Siguiente
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, Plus, Eye, Search, X, GraduationCap, Music } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Pagination } from '@/types';

interface UserRole {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    last_name: string | null;
    full_name: string;
    email: string | null;
    avatar?: string;
    document_type: string | null;
    document_number: string | null;
    mobile: string | null;
    roles: UserRole[];
    user_type: string;
    has_student_profile: boolean;
    has_teacher_profile: boolean;
    modality: string | null;
    created_at: string;
}

interface Filters {
    type: string;
    search: string;
}

interface IndexProps {
    users: Pagination<User>;
    filters: Filters;
}

export default function UsersIndex({ users, filters }: IndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: route('programas_academicos.index') },
        { title: 'Usuarios', href: route('usuarios.index') },
    ];

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        router.delete(route('usuarios.destroy', deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    const handleSearch = () => {
        router.get(route('usuarios.index'), {
            search: search,
            type: typeFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleTypeChange = (value: string) => {
        setTypeFilter(value);
        router.get(route('usuarios.index'), {
            search: search,
            type: value === 'all' ? '' : value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('');
        router.get(route('usuarios.index'));
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getUserTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Administrador': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
            'Profesor': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
            'Estudiante': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
            'Responsable': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
        };
        return colors[type] || 'bg-muted text-foreground';
    };

    const hasActiveFilters = search || typeFilter;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion de Usuarios" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-background">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Usuarios del Sistema</h1>
                        <p className="text-muted-foreground">
                            Gestiona los usuarios, sus roles y perfiles
                        </p>
                    </div>
                    <Link href={route('usuarios.create')}>
                        <Button className="bg-[#7a9b3c] hover:bg-[#6a8a2c]">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Usuario
                        </Button>
                    </Link>
                </div>

                {/* Filtros */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por nombre, email o documento..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={typeFilter || 'all'} onValueChange={handleTypeChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tipo de usuario" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="admin">Administradores</SelectItem>
                                        <SelectItem value="teacher">Profesores</SelectItem>
                                        <SelectItem value="student">Estudiantes</SelectItem>
                                        <SelectItem value="parent">Responsables</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleSearch} className="bg-[#7a9b3c] hover:bg-[#6a8a2c]">
                                <Search className="mr-2 h-4 w-4" />
                                Buscar
                            </Button>
                            {hasActiveFilters && (
                                <Button variant="outline" onClick={clearFilters}>
                                    <X className="mr-2 h-4 w-4" />
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Lista de Usuarios</CardTitle>
                        <CardDescription>
                            {users.total} usuario{users.total !== 1 ? 's' : ''} encontrado{users.total !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Documento</TableHead>
                                    <TableHead>Contacto</TableHead>
                                    <TableHead>Perfiles</TableHead>
                                    <TableHead>Registrado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length > 0 ? (
                                    users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 rounded-full bg-[#7a9b3c] flex items-center justify-center text-white text-sm font-semibold">
                                                        {user.full_name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.full_name}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email || 'Sin email'}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getUserTypeColor(user.user_type)}>
                                                    {user.user_type}
                                                </Badge>
                                                {user.modality && (
                                                    <p className="text-xs text-muted-foreground mt-1">{user.modality}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {user.document_number ? (
                                                    <div>
                                                        <p className="text-sm">{user.document_type}</p>
                                                        <p className="font-medium">{user.document_number}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {user.mobile || <span className="text-muted-foreground">-</span>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    {user.has_student_profile && (
                                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                                            <GraduationCap className="h-3 w-3 mr-1" />
                                                            Est.
                                                        </Badge>
                                                    )}
                                                    {user.has_teacher_profile && (
                                                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                                                            <Music className="h-3 w-3 mr-1" />
                                                            Prof.
                                                        </Badge>
                                                    )}
                                                    {!user.has_student_profile && !user.has_teacher_profile && (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {formatDate(user.created_at)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <Link href={route('usuarios.show', user.id)}>
                                                        <Button variant="ghost" size="sm" title="Ver detalles">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('usuarios.edit', user.id)}>
                                                        <Button variant="ghost" size="sm" title="Editar">
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteId(user.id)}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                            No se encontraron usuarios.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Paginacion */}
                        {users.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando {users.from} a {users.to} de {users.total} usuarios
                                </p>
                                <div className="flex gap-2">
                                    {users.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={link.active ? 'bg-[#7a9b3c]' : ''}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dialogo de confirmacion */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta seguro de que desea eliminar este usuario? Esta accion no se puede deshacer.
                    </AlertDialogDescription>
                    <div className="flex justify-end space-x-2 pt-4">
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

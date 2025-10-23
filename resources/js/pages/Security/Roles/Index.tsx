import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, Plus, Lock } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout'; // 👈 aquí está tu layout
import { type BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
    permissions: string[];
    users_count: number;
}

interface IndexProps {
    roles: Role[];
}

export default function RolesIndex({ roles }: IndexProps) {
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Roles y Permisos', href: route('roles.index') },
    ];

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        router.delete(route('roles.destroy', deleteId), {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteId(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y Permisos" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-[#f9f6f2]">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Roles y Permisos</h1>
                        <p className="text-gray-600">
                            Gestiona los roles y sus permisos asociados
                        </p>
                    </div>
                    <Link href={route('roles.create')}>
                        <Button className="bg-[#7a9b3c] hover:bg-[#6a8a2c]">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Rol
                        </Button>
                    </Link>
                </div>

                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Roles del Sistema</CardTitle>
                        <CardDescription>
                            {roles.length} rol{roles.length !== 1 ? 'es' : ''} registrado{roles.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre del Rol</TableHead>
                                    <TableHead>Permisos</TableHead>
                                    <TableHead className="text-center">Usuarios</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.length > 0 ? (
                                    roles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <Lock className="h-4 w-4 text-[#7a9b3c]" />
                                                    <span>{role.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.length > 0 ? (
                                                        role.permissions.slice(0, 3).map((perm) => (
                                                            <Badge key={perm} variant="secondary">
                                                                {perm}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Sin permisos
                                                        </span>
                                                    )}
                                                    {role.permissions.length > 3 && (
                                                        <Badge variant="outline">
                                                            +{role.permissions.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">
                                                    {role.users_count} usuario
                                                    {role.users_count !== 1 ? 's' : ''}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link href={route('roles.edit', role.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    {role.name !== 'Administrador' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeleteId(role.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                                            No hay roles registrados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Diálogo de confirmación */}
            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogTitle>Eliminar Rol</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer.
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

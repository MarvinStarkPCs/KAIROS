import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserPlus, MoreVertical, Eye, Pen, Trash2 } from 'lucide-react';
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

interface Dependent {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    document_type: string;
    document_number: string;
    birth_date: string;
    age: number;
    address: string | null;
    enrollments_count: number;
    pending_payments: number;
}

interface Props {
    dependents: Dependent[];
}

export default function Index({ dependents }: Props) {
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const handleDelete = () => {
        if (deleteId) {
            router.delete(`/dependientes/${deleteId}`, {
                onSuccess: () => setDeleteId(null),
            });
        }
    };

    return (
        <AppLayout variant="sidebar">
            <Head title="Mis Dependientes" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Mis Dependientes
                        </h1>
                        <p className="text-muted-foreground">
                            Gestiona la información de tus dependientes
                        </p>
                    </div>
                    <Button
                        onClick={() => router.visit('/dependientes/crear')}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Agregar Dependiente
                    </Button>
                </div>

                {dependents.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">
                                No tienes dependientes registrados
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Comienza agregando un dependiente para gestionar
                                sus matrículas y pagos.
                            </p>
                            <Button
                                className="mt-4"
                                onClick={() =>
                                    router.visit('/dependientes/crear')
                                }
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Agregar Dependiente
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Lista de Dependientes</CardTitle>
                            <CardDescription>
                                Aquí puedes ver y gestionar tus dependientes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Documento</TableHead>
                                        <TableHead>Edad</TableHead>
                                        <TableHead>Contacto</TableHead>
                                        <TableHead>Matrículas</TableHead>
                                        <TableHead>Pagos Pendientes</TableHead>
                                        <TableHead className="text-right">
                                            Acciones
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dependents.map((dependent) => (
                                        <TableRow key={dependent.id}>
                                            <TableCell className="font-medium">
                                                {dependent.name}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">
                                                        {dependent.document_type}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {
                                                            dependent.document_number
                                                        }
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {dependent.age} años
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {dependent.email && (
                                                        <div>
                                                            {dependent.email}
                                                        </div>
                                                    )}
                                                    {dependent.phone && (
                                                        <div className="text-muted-foreground">
                                                            {dependent.phone}
                                                        </div>
                                                    )}
                                                    {!dependent.email &&
                                                        !dependent.phone && (
                                                            <span className="text-muted-foreground">
                                                                Sin contacto
                                                            </span>
                                                        )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {
                                                        dependent.enrollments_count
                                                    }
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {dependent.pending_payments >
                                                0 ? (
                                                    <Badge variant="destructive">
                                                        {
                                                            dependent.pending_payments
                                                        }
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">
                                                        0
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                router.visit(
                                                                    `/dependientes/${dependent.id}`,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver Detalle
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                router.visit(
                                                                    `/dependientes/${dependent.id}/editar`,
                                                                )
                                                            }
                                                        >
                                                            <Pen className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() =>
                                                                setDeleteId(
                                                                    dependent.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará
                            permanentemente el dependiente del sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

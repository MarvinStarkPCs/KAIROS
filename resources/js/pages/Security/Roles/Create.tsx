import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import { ChevronLeft } from 'lucide-react';
interface Permission {
    id: number;
    name: string;
}

interface CreateProps {
    permissions: Permission[];
}

export default function RolesCreate({ permissions }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('roles.store'));
    };

    const togglePermission = (id: number) => {
        setData('permissions',
            data.permissions.includes(id)
                ? data.permissions.filter(p => p !== id)
                : [...data.permissions, id]
        );
    };

    const groupedPermissions = permissions.reduce((acc, perm) => {
        const module = perm.name.split('_')[0];
        if (!acc[module]) acc[module] = [];
        acc[module].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    const breadcrumbs = [
        { title: 'Seguridad', href: route('roles.index') },
        { title: 'Roles', href: route('roles.index') },
        { title: 'Crear', href: '' },
    ];

    return (
        <AppLayout
            breadcrumbs={breadcrumbs}
        >

            
            <Head title="Crear Rol" />

            <div className="space-y-6">
                <Link href={route('roles.index')}>
                    <Button variant="ghost" className="mb-4">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </Link>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Rol</h1>
                    <p className="text-muted-foreground">
                        Define el nombre y permisos del nuevo rol
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información del Rol */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Rol</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nombre del Rol *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ej: Editor, Moderador"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permisos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Permisos</CardTitle>
                            <CardDescription>
                                Selecciona los permisos que tendrá este rol
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(groupedPermissions).map(([module, perms]) => (
                                <div
                                    key={module}
                                    className="border p-4 rounded-lg bg-muted"
                                >
                                    <h3 className="font-semibold text-foreground mb-3 capitalize">
                                        {module}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {perms.map((perm) => (
                                            <div key={perm.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`perm-${perm.id}`}
                                                    checked={data.permissions.includes(perm.id)}
                                                    onCheckedChange={() => togglePermission(perm.id)}
                                                />
                                                <Label
                                                    htmlFor={`perm-${perm.id}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                >
                                                    {perm.name.replace(/_/g, ' ')}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3">
                        <Link href={route('roles.index')}>
                            <Button variant="outline">Cancelar</Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[#7a9b3c] hover:bg-[#6a8a2c]"
                        >
                            {processing ? 'Creando...' : 'Crear Rol'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

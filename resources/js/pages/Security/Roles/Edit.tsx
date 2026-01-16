import { useForm, Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Permission {
    id: number;
    name: string;
    assigned: boolean;
}

interface Role {
    id: number;
    name: string;
}

interface EditProps {
    role: Role;
    permissions: Permission[];
}

export default function RolesEdit({ role, permissions }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: permissions.filter(p => p.assigned).map(p => p.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('roles.update', role.id));
    };

    const togglePermission = (id: number) => {
        setData('permissions',
            data.permissions.includes(id)
                ? data.permissions.filter(p => p !== id)
                : [...data.permissions, id]
        );
    };

    // Agrupar permisos por módulo
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const module = perm.name.split('_')[0];
        if (!acc[module]) acc[module] = [];
        acc[module].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: route('programas_academicos.index') },
        { title: 'Roles y Permisos', href: route('roles.index') },
        { title: `Editar: ${role.name}`, href: route('roles.edit', role.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Rol: ${role.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-[#f9f6f2]">
                {/* Título y volver */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Editar Rol</h1>
                        <p className="text-gray-600">
                            Actualiza el nombre y los permisos del rol <strong>{role.name}</strong>
                        </p>
                    </div>
                    <Link href={route('roles.index')}>
                        <Button variant="ghost" className="flex items-center">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card: Información del rol */}
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Información del Rol</CardTitle>
                            <CardDescription>
                                Modifica el nombre si es necesario
                            </CardDescription>
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

                    {/* Card: Permisos */}
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Permisos</CardTitle>
                            <CardDescription>
                                Activa o desactiva los permisos de este rol
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(groupedPermissions).map(([module, perms]) => (
                                <div key={module}>
                                    <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                                        {module}
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                            {processing ? 'Actualizando...' : 'Actualizar Rol'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

import { useForm, Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';

interface Role {
    id: number;
    name: string;
    assigned: boolean;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface EditProps {
    user: User;
    roles: Role[];
}

export default function UsersEdit({ user, roles }: EditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        roles: roles.filter(r => r.assigned).map(r => r.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('usuarios.update', user.id));
    };

    const toggleRole = (id: number) => {
        setData('roles',
            data.roles.includes(id)
                ? data.roles.filter(r => r !== id)
                : [...data.roles, id]
        );
    };

    type BreadcrumbItem = { title: string; href: string };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Usuarios', href: route('usuarios.index') },
        { title: `Editar: ${user.name}`, href: route('usuarios.edit', user.id) },
    ];

    return (
        <>
                <AppLayout breadcrumbs={breadcrumbs}>

            <Head title={`Editar Usuario: ${user.name}`} />
            <div className="space-y-6">
                <Link href={route('usuarios.index')}>
                    <Button variant="ghost" className="mb-4">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </Link>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
                    <p className="text-muted-foreground">
                        Actualiza los datos del usuario: <strong>{user.name}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Usuario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="name">Nombre Completo *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password">Contraseña (dejar en blanco para mantener la actual)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Nueva contraseña"
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                                )}
                            </div>

                            {data.password && (
                                <div>
                                    <Label htmlFor="password_confirmation">Confirmar Contraseña *</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Repite la contraseña"
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-500 mt-1">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Roles</CardTitle>
                            <CardDescription>
                                Actualiza los roles de este usuario
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={data.roles.includes(role.id)}
                                        onCheckedChange={() => toggleRole(role.id)}
                                    />
                                    <Label
                                        htmlFor={`role-${role.id}`}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {role.name}
                                    </Label>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-3">
                        <Link href={route('usuarios.index')}>
                            <Button variant="outline">Cancelar</Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[#7a9b3c] hover:bg-[#6a8a2c]"
                        >
                            {processing ? 'Actualizando...' : 'Actualizar Usuario'}
                        </Button>
                    </div>
                </form>
            </div>

                    </AppLayout>

        </>
    );
}
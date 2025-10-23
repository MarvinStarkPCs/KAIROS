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
}

interface CreateProps {
    roles: Role[];
}

export default function UsersCreate({ roles }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as number[],
    });

    // Define breadcrumbs for AppLayout
    const breadcrumbs = [
        { title: 'Usuarios', href: route('usuarios.index') },
        { title: 'Crear Usuario', href: '' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('usuarios.store'));
    };

    const toggleRole = (id: number) => {
        setData('roles',
            data.roles.includes(id)
                ? data.roles.filter(r => r !== id)
                : [...data.roles, id]
        );
    };

    return (
        <>        <AppLayout breadcrumbs={breadcrumbs}>

            <Head title="Crear Usuario" />
            <div className="space-y-6">
                <Link href={route('usuarios.index')}>
                    <Button variant="ghost" className="mb-4">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                </Link>

                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Usuario</h1>
                    <p className="text-muted-foreground">
                        Define los datos básicos y roles del nuevo usuario
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
                                    placeholder="Ej: Juan Pérez"
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
                                    placeholder="correo@ejemplo.com"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password">Contraseña *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                    className={errors.password ? 'border-red-500' : ''}
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                                )}
                            </div>

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
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Roles</CardTitle>
                            <CardDescription>
                                Asigna los roles que tendrá este usuario
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
                            {errors.roles && (
                                <p className="text-sm text-red-500 mt-1">{errors.roles}</p>
                            )}
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
                            {processing ? 'Creando...' : 'Crear Usuario'}
                        </Button>
                    </div>
                </form>
            </div>
                    </AppLayout>

        </>
    );
}


import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { router } from '@inertiajs/react';
import InputError from '@/components/input-error';

interface Dependent {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    document_type: string;
    document_number: string;
    birth_date: string;
    address: string | null;
    has_account: boolean;
}

interface Props {
    dependent: Dependent;
}

export default function Edit({ dependent }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: dependent.name,
        email: dependent.email || '',
        phone: dependent.phone || '',
        document_type: dependent.document_type,
        document_number: dependent.document_number,
        birth_date: dependent.birth_date,
        address: dependent.address || '',
        update_password: false,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(`/dependientes/${dependent.id}`);
    };

    return (
        <AppLayout variant="sidebar">
            <Head title={`Editar - ${dependent.name}`} />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit('/dependientes')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Editar Dependiente
                        </h1>
                        <p className="text-muted-foreground">
                            Actualiza la información de {dependent.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Personal</CardTitle>
                                <CardDescription>
                                    Datos básicos del dependiente
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nombre Completo
                                        <span className="text-destructive">
                                            {' '}
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        placeholder="Ej: Juan Pérez García"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="document_type">
                                            Tipo de Documento
                                            <span className="text-destructive">
                                                {' '}
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={data.document_type}
                                            onValueChange={(value) =>
                                                setData('document_type', value)
                                            }
                                        >
                                            <SelectTrigger id="document_type">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="TI">
                                                    Tarjeta de Identidad
                                                </SelectItem>
                                                <SelectItem value="CC">
                                                    Cédula de Ciudadanía
                                                </SelectItem>
                                                <SelectItem value="CE">
                                                    Cédula de Extranjería
                                                </SelectItem>
                                                <SelectItem value="Pasaporte">
                                                    Pasaporte
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.document_type}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="document_number">
                                            Número de Documento
                                            <span className="text-destructive">
                                                {' '}
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="document_number"
                                            value={data.document_number}
                                            onChange={(e) =>
                                                setData(
                                                    'document_number',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ej: 1234567890"
                                        />
                                        <InputError
                                            message={errors.document_number}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">
                                        Fecha de Nacimiento
                                        <span className="text-destructive">
                                            {' '}
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) =>
                                            setData('birth_date', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.birth_date} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Información de Contacto</CardTitle>
                                <CardDescription>
                                    Datos para comunicación (opcional)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Teléfono</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                        placeholder="Ej: 3001234567"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Correo Electrónico
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="Ej: correo@ejemplo.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Dirección</Label>
                                    <Textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData('address', e.target.value)
                                        }
                                        placeholder="Ej: Calle 123 #45-67"
                                        rows={3}
                                    />
                                    <InputError message={errors.address} />
                                </div>
                            </CardContent>
                        </Card>

                        {dependent.has_account && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cambiar Contraseña</CardTitle>
                                    <CardDescription>
                                        Actualiza la contraseña de acceso al
                                        sistema
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="update_password"
                                            checked={data.update_password}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'update_password',
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="update_password"
                                            className="text-sm font-normal"
                                        >
                                            Actualizar contraseña
                                        </Label>
                                    </div>

                                    {data.update_password && (
                                        <div className="space-y-4 rounded-lg border p-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="password">
                                                    Nueva Contraseña
                                                    <span className="text-destructive">
                                                        {' '}
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={data.password}
                                                    onChange={(e) =>
                                                        setData(
                                                            'password',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Mínimo 8 caracteres"
                                                />
                                                <InputError
                                                    message={errors.password}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">
                                                    Confirmar Contraseña
                                                    <span className="text-destructive">
                                                        {' '}
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    value={
                                                        data.password_confirmation
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'password_confirmation',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Repite la contraseña"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    router.visit('/dependientes')
                                }
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

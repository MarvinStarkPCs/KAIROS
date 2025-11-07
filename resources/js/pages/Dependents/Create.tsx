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

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        document_type: 'TI',
        document_number: '',
        birth_date: '',
        address: '',
        create_account: false,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/dependientes');
    };

    return (
        <AppLayout variant="sidebar">
            <Head title="Agregar Dependiente" />

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
                            Agregar Dependiente
                        </h1>
                        <p className="text-muted-foreground">
                            Registra un nuevo dependiente bajo tu responsabilidad
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

                        <Card>
                            <CardHeader>
                                <CardTitle>Cuenta de Acceso</CardTitle>
                                <CardDescription>
                                    Opcionalmente crea una cuenta para que el
                                    dependiente pueda acceder al sistema
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="create_account"
                                        checked={data.create_account}
                                        onCheckedChange={(checked) =>
                                            setData(
                                                'create_account',
                                                checked as boolean,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="create_account"
                                        className="text-sm font-normal"
                                    >
                                        Crear cuenta de acceso al sistema
                                    </Label>
                                </div>

                                {data.create_account && (
                                    <div className="space-y-4 rounded-lg border p-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                Contraseña
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
                                Guardar Dependiente
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { useForm, Head, Link, usePage, router } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Camera, Trash2, User } from 'lucide-react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración de Perfil',
        href: edit().url,
    },
];

interface ProfileUser {
    id: number;
    name: string;
    last_name: string | null;
    email: string;
    avatar: string | null;
    document_type: string | null;
    document_number: string | null;
    birth_date: string | null;
    birth_place: string | null;
    gender: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    neighborhood: string | null;
    city: string | null;
    department: string | null;
    email_verified_at: string | null;
}

export default function Profile({
    mustVerifyEmail,
    status,
    user,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    user: ProfileUser;
}) {
    const { auth } = usePage<SharedData>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const isAdmin = auth.roles.includes('Administrador');

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: user.name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        avatar: null as File | null,
        document_type: user.document_type || '',
        document_number: user.document_number || '',
        birth_date: user.birth_date || '',
        birth_place: user.birth_place || '',
        gender: user.gender || '',
        phone: user.phone || '',
        mobile: user.mobile || '',
        address: user.address || '',
        neighborhood: user.neighborhood || '',
        city: user.city || '',
        department: user.department || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/settings/profile', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteAvatar = () => {
        router.delete('/settings/profile/avatar', {
            preserveScroll: true,
            onSuccess: () => {
                setAvatarPreview(null);
            },
        });
    };

    const getAvatarUrl = () => {
        if (avatarPreview) return avatarPreview;
        if (user.avatar) return `/storage/${user.avatar}`;
        return null;
    };

    const avatarUrl = getAvatarUrl();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de Perfil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Información del Perfil"
                        description="Actualiza tu información personal y foto de perfil"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-border">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt="Avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <User className="h-12 w-12 text-muted-foreground" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Foto de perfil</p>
                                <p className="text-xs text-muted-foreground">
                                    JPG, PNG, GIF o WEBP. Máximo 2MB.
                                </p>
                                {(user.avatar || avatarPreview) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive/90 h-auto p-0"
                                        onClick={handleDeleteAvatar}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Eliminar foto
                                    </Button>
                                )}
                                <InputError message={errors.avatar} />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="given-name"
                                    placeholder="Tu nombre"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Apellido</Label>
                                <Input
                                    id="last_name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    autoComplete="family-name"
                                    placeholder="Tu apellido"
                                />
                                <InputError message={errors.last_name} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Correo Electrónico *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="tu@email.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        {mustVerifyEmail && user.email_verified_at === null && (
                            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    Tu dirección de correo electrónico no está verificada.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="font-medium underline hover:no-underline"
                                    >
                                        Haz clic aquí para reenviar el correo de verificación.
                                    </Link>
                                </p>
                                {status === 'verification-link-sent' && (
                                    <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                        Se ha enviado un nuevo enlace de verificación.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Document Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="document_type">Tipo de Documento</Label>
                                <Select
                                    value={data.document_type}
                                    onValueChange={(value) => setData('document_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                        <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                        <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.document_type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="document_number">Número de Documento</Label>
                                <Input
                                    id="document_number"
                                    value={data.document_number}
                                    onChange={(e) => setData('document_number', e.target.value)}
                                    placeholder="1234567890"
                                />
                                <InputError message={errors.document_number} />
                            </div>
                        </div>

                        {/* Birth Info */}
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={data.birth_date}
                                    onChange={(e) => setData('birth_date', e.target.value)}
                                />
                                <InputError message={errors.birth_date} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="birth_place">Lugar de Nacimiento</Label>
                                <Input
                                    id="birth_place"
                                    value={data.birth_place}
                                    onChange={(e) => setData('birth_place', e.target.value)}
                                    placeholder="Ciudad, País"
                                />
                                <InputError message={errors.birth_place} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="gender">Género</Label>
                                <Select
                                    value={data.gender}
                                    onValueChange={(value) => setData('gender', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M">Masculino</SelectItem>
                                        <SelectItem value="F">Femenino</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.gender} />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono Fijo</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="(601) 123 4567"
                                />
                                <InputError message={errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="mobile">Celular</Label>
                                <Input
                                    id="mobile"
                                    type="tel"
                                    value={data.mobile}
                                    onChange={(e) => setData('mobile', e.target.value)}
                                    placeholder="300 123 4567"
                                />
                                <InputError message={errors.mobile} />
                            </div>
                        </div>

                        {/* Address Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Calle 123 # 45-67"
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="neighborhood">Barrio</Label>
                                <Input
                                    id="neighborhood"
                                    value={data.neighborhood}
                                    onChange={(e) => setData('neighborhood', e.target.value)}
                                    placeholder="Nombre del barrio"
                                />
                                <InputError message={errors.neighborhood} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="Bogotá"
                                />
                                <InputError message={errors.city} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="department">Departamento</Label>
                                <Input
                                    id="department"
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    placeholder="Cundinamarca"
                                />
                                <InputError message={errors.department} />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} data-test="update-profile-button">
                                Guardar cambios
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600">Guardado</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {isAdmin && <DeleteUser />}
            </SettingsLayout>
        </AppLayout>
    );
}

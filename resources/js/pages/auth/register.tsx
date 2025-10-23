import { Head, Form, Link } from '@inertiajs/react';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { LoaderCircle } from 'lucide-react';

export default function Register() {
    return (
        <>
            <Head title="Registrarse - Academia Linaje" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
                {/* Decorative elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-orange-300/30 blur-3xl"></div>
                </div>

                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="rounded-2xl bg-white p-8 shadow-2xl">
                        {/* Icon and Title */}
                        <div className="text-center mb-6">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                                <UserPlus className="h-7 w-7 text-amber-800" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Crear Cuenta
                            </h1>
                            <p className="text-sm text-gray-600">
                                Ingresa tus datos para crear tu cuenta
                            </p>
                        </div>

                        <Form
                            {...RegisteredUserController.store.form()}
                            resetOnSuccess={['password', 'password_confirmation']}
                            disableWhileProcessing
                        >
                            {({ processing, errors }) => (
                                <div className="space-y-6">
                                    {/* Name Field */}
                                    <div>
                                        <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre Completo
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="name"
                                                type="text"
                                                name="name"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="name"
                                                placeholder="Tu nombre completo"
                                                className={`w-full rounded-lg border ${
                                                    errors.name ? 'border-red-300' : 'border-gray-300'
                                                } pl-10 pr-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all`}
                                            />
                                        </div>
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Correo Electrónico
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                tabIndex={2}
                                                autoComplete="email"
                                                placeholder="tu@email.com"
                                                className={`w-full rounded-lg border ${
                                                    errors.email ? 'border-red-300' : 'border-gray-300'
                                                } pl-10 pr-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all`}
                                            />
                                        </div>
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>

                                    {/* Password Field */}
                                    <div>
                                        <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Contraseña
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={3}
                                                autoComplete="new-password"
                                                placeholder="••••••••"
                                                className={`w-full rounded-lg border ${
                                                    errors.password ? 'border-red-300' : 'border-gray-300'
                                                } pl-10 pr-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all`}
                                            />
                                        </div>
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div>
                                        <Label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirmar Contraseña
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                required
                                                tabIndex={4}
                                                autoComplete="new-password"
                                                placeholder="••••••••"
                                                className={`w-full rounded-lg border ${
                                                    errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                                } pl-10 pr-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all`}
                                            />
                                        </div>
                                        <InputError message={errors.password_confirmation} className="mt-2" />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        tabIndex={5}
                                        className="w-full rounded-lg bg-gradient-to-r from-amber-700 to-amber-900 px-6 py-3 font-semibold text-white shadow-lg hover:from-amber-800 hover:to-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        data-test="register-user-button"
                                    >
                                        {processing && (
                                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                        )}
                                        {processing ? 'Creando cuenta...' : 'Crear Cuenta'}
                                    </Button>
                                </div>
                            )}
                        </Form>

                        {/* Login Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                ¿Ya tienes cuenta?{' '}
                                <Link
                                    href={login()}
                                    tabIndex={6}
                                    className="font-medium text-amber-800 hover:text-amber-900"
                                >
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            ← Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
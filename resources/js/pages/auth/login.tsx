import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Login({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Iniciar Sesión - Academia Linaje" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
                {/* Decorative elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-orange-300/30 blur-3xl"></div>
                </div>

                <div className="w-full max-w-md">
                    {/* Login Card */}
                    <div className="rounded-2xl bg-white p-8 shadow-2xl">
                        {/* Logo */}
                        <div className="mb-6 flex justify-center">
                            <img
                                src="/logo_academia.png"
                                alt="Academia Linaje"
                                className="h-32 w-32 object-contain"
                            />
                        </div>

                        {status && (
                            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className={`w-full rounded-lg border ${
                                            errors.email ? 'border-red-300' : 'border-gray-300'
                                        } pl-10 pr-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all`}
                                        autoComplete="username"
                                        placeholder="tu@email.com"
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className={`w-full rounded-lg border ${
                                            errors.password ? 'border-red-300' : 'border-gray-300'
                                        } pl-10 pr-12 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all`}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-amber-800 focus:ring-amber-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">
                                        Recordarme
                                    </span>
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-amber-800 hover:text-amber-900 hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-gradient-to-r from-amber-700 to-amber-900 px-6 py-3 font-semibold text-white shadow-lg hover:from-amber-800 hover:to-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {processing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </button>
                        </form>
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
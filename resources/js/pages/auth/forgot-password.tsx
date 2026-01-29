import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, ArrowLeft, LoaderCircle } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Recuperar Contraseña - Academia Linaje" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center p-4">
                {/* Decorative elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-orange-300/30 blur-3xl"></div>
                </div>

                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="rounded-2xl bg-white p-8 shadow-2xl">
                        {/* Logo */}
                        <div className="mb-6 flex justify-center">
                            <img
                                src="/logo_academia.png"
                                alt="Academia Linaje"
                                className="h-24 w-24 object-contain"
                            />
                        </div>

                        {/* Title */}
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Recuperar Contraseña
                            </h1>
                            <p className="text-sm text-gray-600">
                                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                            </p>
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
                                        autoComplete="email"
                                        placeholder="tu@email.com"
                                        autoFocus
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-lg bg-gradient-to-r from-amber-700 to-amber-900 px-6 py-3 font-semibold text-white shadow-lg hover:from-amber-800 hover:to-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                            >
                                {processing && (
                                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                )}
                                {processing ? 'Enviando...' : 'Enviar enlace de recuperación'}
                            </button>
                        </form>
                    </div>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

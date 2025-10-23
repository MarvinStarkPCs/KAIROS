import { Head, Form, Link } from '@inertiajs/react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordResetLinkController from '@/actions/App/Http/Controllers/Auth/PasswordResetLinkController';
import { login } from '@/routes';
import { LoaderCircle } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
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
                        {/* Icon and Title */}
                        <div className="text-center mb-6">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                                <Mail className="h-7 w-7 text-amber-800" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                ¿Olvidaste tu Contraseña?
                            </h1>
                            <p className="text-sm text-gray-600">
                                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                            </p>
                        </div>

                        {/* Success Message */}
                        {status && (
                            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                                <div className="flex items-start space-x-3">
                                    <Send className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-800">{status}</p>
                                </div>
                            </div>
                        )}

                        <Form {...PasswordResetLinkController.store.form()}>
                            {({ processing, errors }) => (
                                <div className="space-y-6">
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
                                                autoComplete="off"
                                                autoFocus
                                                placeholder="tu@email.com"
                                                className={`w-full rounded-lg border ${
                                                    errors.email ? 'border-red-300' : 'border-gray-300'
                                                } pl-10 pr-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all`}
                                            />
                                        </div>
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full rounded-lg bg-gradient-to-r from-amber-700 to-amber-900 px-6 py-3 font-semibold text-white shadow-lg hover:from-amber-800 hover:to-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        data-test="email-password-reset-link-button"
                                    >
                                        {processing && (
                                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                        )}
                                        {processing ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                                    </Button>
                                </div>
                            )}
                        </Form>

                        {/* Back to Login */}
                        <div className="mt-6 text-center">
                            <Link
                                href={login()}
                                className="inline-flex items-center text-sm font-medium text-amber-800 hover:text-amber-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver a Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
import { Head } from '@inertiajs/react';
import { Lock, AlertCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';
import { store } from '@/routes/password/confirm';
import { LoaderCircle } from 'lucide-react';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirmar Contraseña - Academia Linaje" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
                {/* Decorative elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-orange-300/30 blur-3xl"></div>
                </div>

                <div className="w-full max-w-md">
                    {/* Card */}
                    <div className="rounded-2xl bg-card p-8 shadow-2xl">
                        {/* Icon and Title */}
                        <div className="text-center mb-6">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                                <Lock className="h-7 w-7 text-amber-800 dark:text-amber-200" />
                            </div>
                            <h1 className="text-2xl font-bold text-foreground mb-2">
                                Confirmar Contraseña
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Esta es un área segura de la aplicación. Por favor confirma tu contraseña antes de continuar.
                            </p>
                        </div>

                        {/* Alert Box */}
                        <div className="mb-6 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
                            <div className="flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    Por tu seguridad, necesitamos verificar tu identidad.
                                </p>
                            </div>
                        </div>

                        <Form {...store.form()} resetOnSuccess={['password']}>
                            {({ processing, errors }) => (
                                <div className="space-y-6">
                                    {/* Password Field */}
                                    <div>
                                        <Label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
                                            Contraseña
                                        </Label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Lock className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                placeholder="••••••••"
                                                autoComplete="current-password"
                                                autoFocus
                                                className={`w-full rounded-lg border ${
                                                    errors.password ? 'border-red-300 dark:border-red-700' : 'border-input'
                                                } pl-10 pr-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all`}
                                            />
                                        </div>
                                        <InputError message={errors.password} className="mt-2" />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full rounded-lg bg-gradient-to-r from-amber-700 to-amber-900 px-6 py-3 font-semibold text-white shadow-lg hover:from-amber-800 hover:to-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        data-test="confirm-password-button"
                                    >
                                        {processing && (
                                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                                        )}
                                        {processing ? 'Confirmando...' : 'Confirmar Contraseña'}
                                    </Button>
                                </div>
                            )}
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
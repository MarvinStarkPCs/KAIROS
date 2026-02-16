import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Toaster } from '@/components/toaster';

export default function TestErrors() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        console.log('Enviando formulario de prueba...');
        console.log('Datos:', data);

        post('/test-errors', {
            preserveScroll: true,
            preserveState: false,
            onError: (errors) => {
                console.log('❌ ERRORES RECIBIDOS:', errors);
            },
            onSuccess: () => {
                console.log('✅ FORMULARIO ENVIADO CORRECTAMENTE');
            },
        });
    };

    // Debug en consola
    console.log('🔍 Errores actuales:', errors);

    return (
        <>
            <Head title="Test de Errores de Inertia" />
            <Toaster />

            <div className="min-h-screen bg-muted py-12 px-4">
                <div className="max-w-md mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test de Errores de Inertia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {Object.keys(errors).length > 0 && (
                                <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded">
                                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                                        Se encontraron {Object.keys(errors).length} errores:
                                    </h3>
                                    <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                                        {Object.entries(errors).map(([key, message]) => (
                                            <li key={key}>{message}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Tu nombre"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="tu@email.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <Button type="submit" disabled={processing} className="w-full">
                                    {processing ? 'Enviando...' : 'Enviar'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded text-sm">
                        <h4 className="font-semibold mb-2">Instrucciones:</h4>
                        <ol className="list-decimal list-inside space-y-1">
                            <li>Intenta enviar el formulario vacío</li>
                            <li>Deberías ver errores arriba y debajo de cada campo</li>
                            <li>Abre la consola (F12) para ver logs detallados</li>
                            <li>Llena los campos correctamente y envía de nuevo</li>
                            <li>Deberías ver un toast de éxito</li>
                        </ol>
                    </div>
                </div>
            </div>
        </>
    );
}

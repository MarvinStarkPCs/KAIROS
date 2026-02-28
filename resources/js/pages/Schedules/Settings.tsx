import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Save, ShieldCheck, Users, Calendar } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface ScheduleSetting {
    validate_program_overlap: boolean;
    validate_professor_overlap: boolean;
}

interface SettingsProps {
    scheduleSetting: ScheduleSetting | null;
}

export default function ScheduleSettings({ scheduleSetting }: SettingsProps) {
    const { data, setData, patch, processing, errors } = useForm({
        validate_program_overlap: scheduleSetting?.validate_program_overlap ?? true,
        validate_professor_overlap: scheduleSetting?.validate_professor_overlap ?? true,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        patch('/horarios/settings');
    };

    return (
        <AppLayout>
            <Head title="Configuración de Horarios" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/horarios">
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Configuración de Horarios</h1>
                        <p className="mt-1 text-muted-foreground">
                            Activa o desactiva las validaciones al crear o editar horarios
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-2">
                                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle>Validaciones de solapamiento</CardTitle>
                                    <CardDescription>
                                        Controla si el sistema impide crear horarios con conflictos de tiempo
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Validación solapamiento de programa */}
                            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-2 mt-0.5">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="validate_program_overlap"
                                            className="text-sm font-semibold cursor-pointer"
                                        >
                                            Solapamiento de programa académico
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Impide que un programa académico tenga dos horarios activos
                                            en el mismo día y franja horaria.
                                        </p>
                                        {!data.validate_program_overlap && (
                                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                ⚠ Desactivado — se permiten horarios solapados para el mismo programa
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Switch
                                    id="validate_program_overlap"
                                    checked={data.validate_program_overlap}
                                    onCheckedChange={(checked) => setData('validate_program_overlap', checked)}
                                />
                            </div>
                            {errors.validate_program_overlap && (
                                <p className="text-sm text-destructive">{errors.validate_program_overlap}</p>
                            )}

                            {/* Validación solapamiento de profesor */}
                            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-2 mt-0.5">
                                        <Users className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="validate_professor_overlap"
                                            className="text-sm font-semibold cursor-pointer"
                                        >
                                            Solapamiento de profesor
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Impide asignar un profesor a un horario si ya tiene otra
                                            clase al mismo tiempo.
                                        </p>
                                        {!data.validate_professor_overlap && (
                                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                ⚠ Desactivado — un profesor puede tener clases simultáneas
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Switch
                                    id="validate_professor_overlap"
                                    checked={data.validate_professor_overlap}
                                    onCheckedChange={(checked) => setData('validate_professor_overlap', checked)}
                                />
                            </div>
                            {errors.validate_professor_overlap && (
                                <p className="text-sm text-destructive">{errors.validate_professor_overlap}</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

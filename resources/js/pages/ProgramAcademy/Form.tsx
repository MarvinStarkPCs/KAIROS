import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import ProgramAcademyController from '@/actions/App/Http/Controllers/program_academy';
import { FormEvent } from 'react';

interface Program {
    id: number;
    name: string;
    description: string | null;
    duration_months: number;
    status: 'active' | 'inactive';
    color: string;
}

interface FormProps {
    program?: Program;
}

export default function Form({ program }: FormProps) {
    const isEditing = !!program;

    const { data, setData, post, put, processing, errors } = useForm({
        name: program?.name || '',
        description: program?.description || '',
        duration_months: program?.duration_months || 1,
        status: program?.status || 'active',
        color: program?.color || '#3B82F6',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(ProgramAcademyController.update({ program: program.id }).url);
        } else {
            post(ProgramAcademyController.store().url);
        }
    };

    return (
        <AppLayout>
            <Head title={isEditing ? 'Editar Programa' : 'Nuevo Programa'} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={ProgramAcademyController.index().url}
                            className="mb-2 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Volver a programas
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditing ? 'Editar Programa Académico' : 'Nuevo Programa Académico'}
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {isEditing
                                ? 'Actualiza la información del programa'
                                : 'Completa los datos del nuevo programa'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <Label htmlFor="name">
                                Nombre del Programa <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej: Programa de Piano Avanzado"
                                className="mt-1"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe el programa académico..."
                                rows={4}
                                className="mt-1"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Duration */}
                        <div>
                            <Label htmlFor="duration_months">
                                Duración (meses) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="duration_months"
                                type="number"
                                min="1"
                                value={data.duration_months}
                                onChange={(e) => setData('duration_months', parseInt(e.target.value))}
                                className="mt-1"
                                placeholder="Ej: 12"
                            />
                            {errors.duration_months && (
                                <p className="mt-1 text-sm text-red-600">{errors.duration_months}</p>
                            )}
                            <p className="mt-1 text-sm text-gray-500">
                                Duración total del programa en meses
                            </p>
                        </div>

                        {/* Status */}
                        <div>
                            <Label htmlFor="status">
                                Estado <span className="text-red-500">*</span>
                            </Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </select>
                            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                        </div>

                        {/* Color */}
                        <div>
                            <Label htmlFor="color">
                                Color del Programa <span className="text-red-500">*</span>
                            </Label>
                            <div className="mt-1 flex items-center gap-4">
                                <Input
                                    id="color"
                                    type="color"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="h-12 w-20 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <Input
                                        type="text"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        placeholder="#3B82F6"
                                        pattern="^#[0-9A-Fa-f]{6}$"
                                        className="font-mono"
                                    />
                                </div>
                                <div
                                    className="h-12 w-24 rounded-md border-2 border-gray-300 shadow-sm"
                                    style={{ backgroundColor: data.color }}
                                />
                            </div>
                            {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
                            <p className="mt-1 text-sm text-gray-500">
                                Este color se usará para identificar el programa en el calendario de horarios
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
                            <Link href={ProgramAcademyController.index().url}>
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Guardando...' : isEditing ? 'Actualizar Programa' : 'Crear Programa'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

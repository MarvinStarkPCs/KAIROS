import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Activity {
    id: number;
    name: string;
    description: string | null;
    order: number;
    weight: number;
    status: 'active' | 'inactive';
}

interface ActivityDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studyPlanId: number;
    activity?: Activity;
    nextOrder?: number;
}

export default function ActivityDialog({
    open,
    onOpenChange,
    studyPlanId,
    activity,
    nextOrder = 0
}: ActivityDialogProps) {
    const isEditing = !!activity;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: activity?.name || '',
        description: activity?.description || '',
        order: activity?.order ?? nextOrder,
        weight: activity?.weight || 0,
        status: activity?.status || 'active' as 'active' | 'inactive',
    });

    useEffect(() => {
        if (activity) {
            setData({
                name: activity.name,
                description: activity.description || '',
                order: activity.order,
                weight: activity.weight,
                status: activity.status,
            });
        } else {
            reset();
            setData('order', nextOrder);
        }
    }, [activity, open, nextOrder]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(route('activities.update', activity.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post(route('activities.store', studyPlanId), {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Editar Actividad' : 'Agregar Actividad'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Actualiza la información de la actividad.'
                                : 'Agrega una nueva actividad al módulo del plan de estudios.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre de la Actividad *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej: Proyecto Final"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe la actividad y sus objetivos"
                                rows={3}
                                className={errors.description ? 'border-red-500' : ''}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="order">Orden *</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    min="0"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    className={errors.order ? 'border-red-500' : ''}
                                />
                                {errors.order && <p className="text-sm text-red-600">{errors.order}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="weight">Peso (%) *</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={data.weight}
                                    onChange={(e) => setData('weight', parseFloat(e.target.value) || 0)}
                                    className={errors.weight ? 'border-red-500' : ''}
                                />
                                {errors.weight && <p className="text-sm text-red-600">{errors.weight}</p>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Estado *</Label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="active">Activa</option>
                                <option value="inactive">Inactiva</option>
                            </select>
                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

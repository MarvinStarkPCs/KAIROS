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

interface EvaluationCriteria {
    id: number;
    name: string;
    description: string | null;
    max_points: number;
    order: number;
}

interface EvaluationCriteriaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activityId: number;
    criteria?: EvaluationCriteria;
    nextOrder?: number;
}

export default function EvaluationCriteriaDialog({
    open,
    onOpenChange,
    activityId,
    criteria,
    nextOrder = 0
}: EvaluationCriteriaDialogProps) {
    const isEditing = !!criteria;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: criteria?.name || '',
        description: criteria?.description || '',
        max_points: criteria?.max_points || 10,
        order: criteria?.order ?? nextOrder,
    });

    useEffect(() => {
        if (criteria) {
            setData({
                name: criteria.name,
                description: criteria.description || '',
                max_points: criteria.max_points,
                order: criteria.order,
            });
        } else {
            reset();
            setData('order', nextOrder);
        }
    }, [criteria, open, nextOrder]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(route('criteria.update', criteria.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post(route('criteria.store', activityId), {
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
                        <DialogTitle>
                            {isEditing ? 'Editar Criterio de Evaluación' : 'Agregar Criterio de Evaluación'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Actualiza la información del criterio de evaluación.'
                                : 'Agrega un nuevo criterio de evaluación a la actividad.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Criterio *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ej: Calidad del código"
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
                                placeholder="Describe qué se evaluará en este criterio"
                                rows={3}
                                className={errors.description ? 'border-red-500' : ''}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="max_points">Puntuación Máxima *</Label>
                                <Input
                                    id="max_points"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.max_points}
                                    onChange={(e) => setData('max_points', parseFloat(e.target.value) || 0)}
                                    className={errors.max_points ? 'border-red-500' : ''}
                                />
                                {errors.max_points && (
                                    <p className="text-sm text-red-600">{errors.max_points}</p>
                                )}
                            </div>

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

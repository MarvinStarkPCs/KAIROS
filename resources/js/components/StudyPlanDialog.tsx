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
import StudyPlanController from '@/actions/App/Http/Controllers/StudyPlanController';

interface StudyPlan {
    id: number;
    module_name: string;
    description: string | null;
    hours: number;
    level: number;
}

interface StudyPlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    programId: number;
    studyPlan?: StudyPlan;
}

export default function StudyPlanDialog({ open, onOpenChange, programId, studyPlan }: StudyPlanDialogProps) {
    const isEditing = !!studyPlan;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        module_name: studyPlan?.module_name || '',
        description: studyPlan?.description || '',
        hours: studyPlan?.hours || 1,
        level: studyPlan?.level || 1,
    });

    useEffect(() => {
        if (studyPlan) {
            setData({
                module_name: studyPlan.module_name,
                description: studyPlan.description || '',
                hours: studyPlan.hours,
                level: studyPlan.level,
            });
        } else {
            reset();
        }
    }, [studyPlan, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing) {
            put(StudyPlanController.update({ studyPlan: studyPlan.id }).url, {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post(StudyPlanController.store({ program: programId }).url, {
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
                        <DialogTitle>{isEditing ? 'Editar Módulo' : 'Agregar Módulo'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Actualiza la información del módulo del plan de estudios.'
                                : 'Agrega un nuevo módulo al plan de estudios del programa.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="module_name">Nombre del Módulo *</Label>
                            <Input
                                id="module_name"
                                value={data.module_name}
                                onChange={(e) => setData('module_name', e.target.value)}
                                placeholder="Ej: Introducción a la Programación"
                                className={errors.module_name ? 'border-red-500' : ''}
                            />
                            {errors.module_name && (
                                <p className="text-sm text-red-600">{errors.module_name}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe el contenido y objetivos del módulo"
                                rows={3}
                                className={errors.description ? 'border-red-500' : ''}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="hours">Horas *</Label>
                                <Input
                                    id="hours"
                                    type="number"
                                    min="1"
                                    value={data.hours}
                                    onChange={(e) => setData('hours', parseInt(e.target.value) || 1)}
                                    className={errors.hours ? 'border-red-500' : ''}
                                />
                                {errors.hours && <p className="text-sm text-red-600">{errors.hours}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="level">Nivel *</Label>
                                <Input
                                    id="level"
                                    type="number"
                                    min="1"
                                    value={data.level}
                                    onChange={(e) => setData('level', parseInt(e.target.value) || 1)}
                                    className={errors.level ? 'border-red-500' : ''}
                                />
                                {errors.level && <p className="text-sm text-red-600">{errors.level}</p>}
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

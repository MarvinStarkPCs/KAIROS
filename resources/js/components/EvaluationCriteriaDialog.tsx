import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import StudyPlanController from '@/actions/App/Http/Controllers/StudyPlanController';

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
            put(StudyPlanController.updateCriteria({ criteria: criteria.id }).url, {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post(StudyPlanController.storeCriteria({ activity: activityId }).url, {
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

                    <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                        <Info className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800 dark:text-amber-200">Sistema de Puntos</AlertTitle>
                        <AlertDescription className="text-amber-700 dark:text-amber-300">
                            <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
                                <li><strong>Puntuación Máxima:</strong> Es el número máximo de puntos que un estudiante puede obtener en este criterio.</li>
                                <li><strong>Cálculo de nota:</strong> La nota del criterio se calcula como: (puntos obtenidos / puntuación máxima) × 100.</li>
                                <li><strong>Ejemplo:</strong> Si el máximo es 10 pts y el estudiante obtiene 8 pts, su nota en este criterio será 80%.</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

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
                            <p className="text-xs text-muted-foreground">Puntos máximos a obtener</p>
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

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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle, CheckCircle2, Wand2 } from 'lucide-react';
import StudyPlanController from '@/actions/App/Http/Controllers/StudyPlanController';

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
    currentTotalWeight?: number;
}

export default function ActivityDialog({
    open,
    onOpenChange,
    studyPlanId,
    activity,
    nextOrder = 0,
    currentTotalWeight = 0
}: ActivityDialogProps) {
    const isEditing = !!activity;
    const normalizedTotalWeight = Number(currentTotalWeight) || 0;
    const remainingWeightAvailable = Math.max(0, 100 - normalizedTotalWeight);

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
            put(StudyPlanController.updateActivity({ activity: activity.id }).url, {
                preserveScroll: true,
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post(StudyPlanController.storeActivity({ studyPlan: studyPlanId }).url, {
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

                    {/* Weight Status Indicator */}
                    {(() => {
                        const activityWeight = Number(data.weight) || 0;
                        const projectedTotal = normalizedTotalWeight + activityWeight;
                        const isComplete = projectedTotal === 100;
                        const isOver = projectedTotal > 100;

                        return (
                            <div className="space-y-2">
                                {/* Current Module Status */}
                                <div className={`rounded-lg border p-3 ${
                                    isComplete ? 'border-green-200 bg-green-50' :
                                    isOver ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {isComplete ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            ) : isOver ? (
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                            ) : (
                                                <Info className="h-4 w-4 text-amber-600" />
                                            )}
                                            <span className={`text-sm font-medium ${
                                                isComplete ? 'text-green-800' :
                                                isOver ? 'text-red-800' : 'text-amber-800'
                                            }`}>
                                                Estado del módulo
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="rounded bg-white/60 p-2">
                                            <div className="font-semibold text-gray-700">{normalizedTotalWeight.toFixed(1)}%</div>
                                            <div className="text-gray-500">Asignado</div>
                                        </div>
                                        <div className="rounded bg-white/60 p-2">
                                            <div className={`font-semibold ${remainingWeightAvailable > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                                                {remainingWeightAvailable.toFixed(1)}%
                                            </div>
                                            <div className="text-gray-500">Disponible</div>
                                        </div>
                                        <div className="rounded bg-white/60 p-2">
                                            <div className={`font-semibold ${
                                                isComplete ? 'text-green-700' :
                                                isOver ? 'text-red-700' : 'text-gray-700'
                                            }`}>
                                                {projectedTotal.toFixed(1)}%
                                            </div>
                                            <div className="text-gray-500">Proyectado</div>
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                        <div className="flex h-full">
                                            <div
                                                className="bg-blue-400 transition-all duration-300"
                                                style={{ width: `${Math.min(normalizedTotalWeight, 100)}%` }}
                                            />
                                            <div
                                                className={`transition-all duration-300 ${
                                                    isOver ? 'bg-red-500' : 'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min(activityWeight, 100 - Math.min(normalizedTotalWeight, 100))}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                                        <span>Otras actividades: {normalizedTotalWeight.toFixed(1)}%</span>
                                        <span>Esta actividad: {activityWeight}%</span>
                                    </div>
                                </div>

                                {/* Warning/Success Messages */}
                                {isOver && (
                                    <Alert className="border-red-300 bg-red-50">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="text-red-700 text-xs">
                                            La suma total ({projectedTotal.toFixed(1)}%) excede el 100%.
                                            Reduce el peso a máximo <strong>{remainingWeightAvailable.toFixed(1)}%</strong>.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {isComplete && (
                                    <Alert className="border-green-300 bg-green-50">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertDescription className="text-green-700 text-xs">
                                            ¡Perfecto! La suma total es exactamente 100%.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        );
                    })()}

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

                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="weight">Peso (%) *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="weight"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', parseFloat(e.target.value) || 0)}
                                        className={`flex-1 ${errors.weight ? 'border-red-500' : ''}`}
                                    />
                                    {remainingWeightAvailable > 0 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="shrink-0 text-xs"
                                            onClick={() => setData('weight', Math.round(remainingWeightAvailable * 100) / 100)}
                                            title={`Usar peso restante: ${remainingWeightAvailable.toFixed(1)}%`}
                                        >
                                            <Wand2 className="mr-1 h-3 w-3" />
                                            {remainingWeightAvailable.toFixed(1)}%
                                        </Button>
                                    )}
                                </div>
                                {errors.weight && <p className="text-sm text-red-600">{errors.weight}</p>}
                                <p className="text-xs text-gray-500">
                                    % de la nota final del módulo
                                    {remainingWeightAvailable > 0 && data.weight === 0 && (
                                        <span className="ml-1 text-amber-600">
                                            (Haz clic en el botón para usar el restante)
                                        </span>
                                    )}
                                </p>
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

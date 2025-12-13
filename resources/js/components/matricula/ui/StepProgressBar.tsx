import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StepNumber } from '@/types/matricula';

export interface StepProgressBarProps {
    currentStep: StepNumber;
    totalSteps: number;
    steps: Array<{
        number: StepNumber;
        title: string;
        description?: string;
    }>;
    onStepClick?: (step: StepNumber) => void;
    allowStepNavigation?: boolean;
}

/**
 * Barra de progreso con indicadores de pasos
 */
export function StepProgressBar({
    currentStep,
    totalSteps,
    steps,
    onStepClick,
    allowStepNavigation = false
}: StepProgressBarProps) {
    const progress = (currentStep / totalSteps) * 100;

    const handleStepClick = (stepNumber: StepNumber) => {
        if (allowStepNavigation && onStepClick) {
            onStepClick(stepNumber);
        }
    };

    return (
        <div className="w-full">
            {/* Barra de progreso visual */}
            <div className="mb-8">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Indicadores de pasos */}
            <div className="flex justify-between relative">
                {/* Línea conectora */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
                <div
                    className="absolute top-5 left-0 h-0.5 bg-amber-500 -z-10 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                />

                {steps.map((step) => {
                    const isCompleted = step.number < currentStep;
                    const isCurrent = step.number === currentStep;
                    const isClickable = allowStepNavigation && onStepClick;

                    return (
                        <div
                            key={step.number}
                            className={cn(
                                "flex flex-col items-center",
                                isClickable && "cursor-pointer group"
                            )}
                            onClick={() => isClickable && handleStepClick(step.number)}
                        >
                            {/* Círculo del paso */}
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                                    isCompleted && "bg-amber-500 text-white",
                                    isCurrent && "bg-orange-500 text-white ring-4 ring-orange-100",
                                    !isCompleted && !isCurrent && "bg-gray-200 text-gray-500",
                                    isClickable && "group-hover:ring-2 group-hover:ring-amber-300"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    step.number
                                )}
                            </div>

                            {/* Título del paso */}
                            <div className="mt-2 text-center max-w-[120px]">
                                <p
                                    className={cn(
                                        "text-sm font-medium transition-colors",
                                        isCurrent && "text-orange-700",
                                        isCompleted && "text-amber-700",
                                        !isCompleted && !isCurrent && "text-gray-500"
                                    )}
                                >
                                    {step.title}
                                </p>
                                {step.description && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

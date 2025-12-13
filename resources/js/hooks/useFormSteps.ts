import { useState, useCallback } from 'react';
import type { StepNumber } from '@/types/matricula';

interface UseFormStepsProps {
    totalSteps: number;
    validateStep: (step: StepNumber) => boolean;
    onStepChange?: (step: StepNumber) => void;
}

interface UseFormStepsReturn {
    currentStep: StepNumber;
    canGoNext: boolean;
    canGoPrev: boolean;
    isFirstStep: boolean;
    isLastStep: boolean;
    goNext: () => void;
    goPrev: () => void;
    goToStep: (step: StepNumber) => void;
    progress: number;
}

/**
 * Hook para manejar la navegación entre pasos de un formulario multi-step
 */
export function useFormSteps({
    totalSteps,
    validateStep,
    onStepChange
}: UseFormStepsProps): UseFormStepsReturn {
    const [currentStep, setCurrentStep] = useState<StepNumber>(1);

    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;
    const canGoNext = validateStep(currentStep) && !isLastStep;
    const canGoPrev = !isFirstStep;
    const progress = (currentStep / totalSteps) * 100;

    const goNext = useCallback(() => {
        if (!canGoNext) return;

        const nextStep = (currentStep + 1) as StepNumber;
        setCurrentStep(nextStep);
        onStepChange?.(nextStep);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep, canGoNext, onStepChange]);

    const goPrev = useCallback(() => {
        if (!canGoPrev) return;

        const prevStep = (currentStep - 1) as StepNumber;
        setCurrentStep(prevStep);
        onStepChange?.(prevStep);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep, canGoPrev, onStepChange]);

    const goToStep = useCallback((step: StepNumber) => {
        if (step < 1 || step > totalSteps) return;

        setCurrentStep(step);
        onStepChange?.(step);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [totalSteps, onStepChange]);

    return {
        currentStep,
        canGoNext,
        canGoPrev,
        isFirstStep,
        isLastStep,
        goNext,
        goPrev,
        goToStep,
        progress
    };
}

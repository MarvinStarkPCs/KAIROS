import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorBannerProps {
    message: string;
    onDismiss?: () => void;
    className?: string;
}

/**
 * Banner para mostrar mensajes de error
 */
export function ErrorBanner({ message, onDismiss, className }: ErrorBannerProps) {
    return (
        <div
            className={cn(
                "bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3",
                className
            )}
            role="alert"
        >
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                    {message}
                </p>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    aria-label="Cerrar"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}

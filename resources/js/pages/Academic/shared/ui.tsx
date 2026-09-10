import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Un promedio por debajo de este valor marca al estudiante en riesgo. */
export const AT_RISK_THRESHOLD = 60;

export function gradeTone(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'text-muted-foreground';
    if (value >= 80) return 'text-green-600 dark:text-green-400';
    if (value >= AT_RISK_THRESHOLD)
        return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
}

function barTone(value: number): string {
    if (value >= 80) return 'bg-green-500';
    if (value >= AT_RISK_THRESHOLD) return 'bg-yellow-500';
    if (value > 0) return 'bg-red-500';
    return 'bg-muted-foreground/30';
}

interface ProgressBarProps {
    value: number | null;
    className?: string;
    showLabel?: boolean;
}

/** Barra de avance con color según el valor. */
export function ProgressBar({
    value,
    className,
    showLabel = true,
}: ProgressBarProps) {
    const safe = Math.max(0, Math.min(value ?? 0, 100));

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                    className={cn(
                        'h-full rounded-full transition-all',
                        barTone(safe),
                    )}
                    style={{ width: `${safe}%` }}
                />
            </div>
            {showLabel && (
                <span className="w-12 shrink-0 text-right text-xs font-medium text-muted-foreground tabular-nums">
                    {safe.toFixed(0)}%
                </span>
            )}
        </div>
    );
}

/** Nota promedio. Muestra un guion cuando todavía no hay calificaciones. */
export function GradeValue({
    value,
    className,
}: {
    value: number | null;
    className?: string;
}) {
    if (value === null) {
        return (
            <span className={cn('text-sm text-muted-foreground', className)}>
                Sin calificar
            </span>
        );
    }

    return (
        <span
            className={cn(
                'text-sm font-semibold tabular-nums',
                gradeTone(value),
                className,
            )}
        >
            {value.toFixed(1)}
        </span>
    );
}

const ENROLLMENT_LABELS: Record<string, string> = {
    active: 'Activa',
    waiting: 'En espera',
    suspended: 'Suspendida',
    withdrawn: 'Retirada',
};

const ENROLLMENT_TONES: Record<string, string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    waiting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    suspended:
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    withdrawn: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function EnrollmentBadge({ status }: { status: string }) {
    return (
        <Badge
            variant="secondary"
            className={cn('font-medium', ENROLLMENT_TONES[status] ?? '')}
        >
            {ENROLLMENT_LABELS[status] ?? status}
        </Badge>
    );
}

/** Punto de color del programa, para identificarlo de un vistazo en las tablas. */
export function ProgramDot({ color, name }: { color: string; name: string }) {
    return (
        <span className="inline-flex items-center gap-2">
            <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
            />
            <span className="truncate">{name}</span>
        </span>
    );
}

export function formatDateOrPending(date: string | null | undefined): string {
    if (!date) return 'Sin registros';

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'Sin registros';

    return parsed.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatPercent(
    value: number | null | undefined,
    fallback = 'Sin datos',
): string {
    if (value === null || value === undefined) return fallback;

    return `${value.toFixed(1)}%`;
}

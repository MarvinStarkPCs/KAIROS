import { formatCurrencyShort } from '@/lib/format';
import type { ChartTooltipProps } from './types';

export function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
            <p className="text-sm font-medium text-foreground">{label}</p>
            {payload.map((item, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                    {formatCurrencyShort(Number(item.value))}
                </p>
            ))}
        </div>
    );
}

export function CustomPieTooltip({ active, payload }: ChartTooltipProps) {
    if (!active || !payload?.length) return null;
    const data = payload[0];
    return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
            <p className="text-sm font-medium text-foreground">{data.name}</p>
            <p className="text-sm text-muted-foreground">{formatCurrencyShort(Number(data.value))}</p>
            <p className="text-xs text-muted-foreground">{data.payload.count} pagos</p>
        </div>
    );
}

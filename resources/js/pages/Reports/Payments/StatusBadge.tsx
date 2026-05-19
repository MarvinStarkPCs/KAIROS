import { Badge } from '@/components/ui/badge';

const config: Record<string, { label: string; className: string }> = {
    completed: { label: 'Completado', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    pending:   { label: 'Pendiente',  className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    overdue:   { label: 'Vencido',    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    cancelled: { label: 'Cancelado',  className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
};

export default function StatusBadge({ status }: { status: string }) {
    const { label, className } = config[status] ?? { label: status, className: '' };
    return <Badge className={className}>{label}</Badge>;
}

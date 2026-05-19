import { Badge } from '@/components/ui/badge';

type StatusKey =
    | 'active' | 'waiting' | 'suspended' | 'completed' | 'cancelled' | 'withdrawn' | 'graduated'
    | 'pending' | 'overdue'
    | 'present' | 'absent' | 'excused' | 'late'
    | 'enrolled' | 'dropped';

const STATUS_CONFIG: Record<StatusKey, { label: string; className: string }> = {
    // Enrollment
    active:    { label: 'Activo',      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    waiting:   { label: 'En espera',   className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    suspended: { label: 'Suspendido',  className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    withdrawn: { label: 'Retirado',    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
    graduated: { label: 'Graduado',    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    enrolled:  { label: 'Inscrito',    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    dropped:   { label: 'Retirado',    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
    // Payment
    pending:   { label: 'Pendiente',   className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    completed: { label: 'Completado',  className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    overdue:   { label: 'Vencido',     className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    cancelled: { label: 'Cancelado',   className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
    // Attendance
    present:   { label: 'Presente',    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    absent:    { label: 'Ausente',     className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    excused:   { label: 'Justificado', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    late:      { label: 'Tardanza',    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status as StatusKey];
    if (!config) return <Badge className={className}>{status}</Badge>;

    return (
        <Badge className={`${config.className} border-0${className ? ` ${className}` : ''}`}>
            {config.label}
        </Badge>
    );
}

import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrencyShort } from '@/lib/format';

export const formatTime = (time: string | null): string => {
    if (!time) return '';
    return time.substring(0, 5);
};

export const formatDateUser = (date: string | null): string =>
    date ? formatDate(date) : 'No especificada';

export const formatCurrency = (amount: number | null): string =>
    formatCurrencyShort(amount ?? 0);

export const getGenderLabel = (gender: string | null): string => {
    if (!gender) return 'No especificado';
    return gender === 'M' ? 'Masculino' : 'Femenino';
};

export const getDocumentTypeLabel = (type: string | null): string => {
    const types: Record<string, string> = {
        CC: 'Cedula de Ciudadania',
        TI: 'Tarjeta de Identidad',
        CE: 'Cedula de Extranjeria',
        Pasaporte: 'Pasaporte',
    };
    return type ? (types[type] ?? type) : 'No especificado';
};

export const getUserTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
        Administrador: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
        Profesor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
        Estudiante: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
        Responsable: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
    };
    return colors[type] ?? 'bg-muted text-foreground';
};

export const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
        active: { label: 'Activo', variant: 'default' },
        enrolled: { label: 'Inscrito', variant: 'default' },
        waiting: { label: 'En espera', variant: 'secondary' },
        completed: { label: 'Completado', variant: 'outline' },
        cancelled: { label: 'Cancelado', variant: 'destructive' },
        suspended: { label: 'Suspendido', variant: 'destructive' },
    };
    const s = map[status] ?? { label: status, variant: 'secondary' as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
};

export const getPaymentStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
        pending: { label: 'Pendiente', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' },
        completed: { label: 'Pagado', className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' },
        overdue: { label: 'Vencido', className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' },
        partial: { label: 'Parcial', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' },
    };
    const s = map[status] ?? { label: status, className: 'bg-muted text-foreground' };
    return <Badge className={s.className}>{s.label}</Badge>;
};

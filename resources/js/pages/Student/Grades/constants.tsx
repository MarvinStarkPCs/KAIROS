import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export const PAYMENT_METHODS: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    credit_card: 'Tarjeta de crédito',
    online: 'Pago en línea',
};

export const PAYMENT_STATUS = {
    pending:   { label: 'Pendiente',  icon: Clock,        bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    completed: { label: 'Completado', icon: CheckCircle,  bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-700 dark:text-green-400'   },
    overdue:   { label: 'Vencido',    icon: AlertCircle,  bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-700 dark:text-red-400'       },
    cancelled: { label: 'Cancelado',  icon: XCircle,      bg: 'bg-muted',                             text: 'text-muted-foreground'                },
};

export const DAY_NAMES: Record<string, string> = {
    monday:    'Lunes',
    tuesday:   'Martes',
    wednesday: 'Miércoles',
    thursday:  'Jueves',
    friday:    'Viernes',
    saturday:  'Sábado',
    sunday:    'Domingo',
};

import { Check, X, Clock, FileText } from 'lucide-react';

export const getEstadoBadge = (estado: string) => {
    switch (estado) {
        case 'presente':
            return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', icon: Check, label: 'Presente' };
        case 'ausente':
            return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', icon: X, label: 'Ausente' };
        case 'tardanza':
            return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', icon: Clock, label: 'Tarde' };
        case 'justificado':
            return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', icon: FileText, label: 'Justificado' };
        default:
            return { bg: 'bg-muted', text: 'text-muted-foreground', icon: Clock, label: 'Pendiente' };
    }
};

export const getAlertaTipo = (tipo: string) => {
    switch (tipo) {
        case 'critico':
            return {
                bg: 'bg-red-50 dark:bg-red-950/30',
                border: 'border-red-200 dark:border-red-800',
                text: 'text-red-700 dark:text-red-300',
                badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
            };
        case 'atencion':
            return {
                bg: 'bg-yellow-50 dark:bg-yellow-950/30',
                border: 'border-yellow-200 dark:border-yellow-800',
                text: 'text-yellow-700 dark:text-yellow-300',
                badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
            };
        case 'seguimiento':
            return {
                bg: 'bg-blue-50 dark:bg-blue-950/30',
                border: 'border-blue-200 dark:border-blue-800',
                text: 'text-blue-700 dark:text-blue-300',
                badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
            };
        default:
            return {
                bg: 'bg-muted',
                border: 'border-border',
                text: 'text-muted-foreground',
                badge: 'bg-muted text-foreground',
            };
    }
};

export const getAlertaLabel = (tipo: string): string => {
    switch (tipo) {
        case 'critico': return 'Crítico';
        case 'atencion': return 'Atención';
        default: return 'Seguimiento';
    }
};

export const getInitials = (name: string): string =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

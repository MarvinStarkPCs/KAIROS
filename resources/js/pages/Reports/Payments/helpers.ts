export const parseDate = (date: string): Date => {
    if (!date) return new Date(NaN);
    const plain = date.includes('T') ? date.split('T')[0] : date;
    return new Date(plain + 'T00:00:00');
};

export const formatDate = (date: string): string => {
    if (!date) return '—';
    const d = parseDate(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const getDaysOverdue = (dueDate: string): number => {
    const due = parseDate(dueDate);
    if (isNaN(due.getTime())) return 0;
    const diff = Math.floor((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
};

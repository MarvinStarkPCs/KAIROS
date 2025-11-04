/**
 * Utilidades para formatear fechas y horas
 */

/**
 * Formatea una hora en formato HH:MM a formato legible (12h con AM/PM)
 * @param time Hora en formato HH:MM (24h)
 * @returns Hora formateada (ej: "2:30 PM")
 */
export function formatTime(time: string): string {
    if (!time) return '';

    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Formatea un rango de tiempo
 * @param startTime Hora de inicio en formato HH:MM
 * @param endTime Hora de fin en formato HH:MM
 * @returns Rango formateado (ej: "9:00 AM - 11:00 AM")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return '';

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Formatea una fecha en formato ISO a formato legible en español
 * @param date Fecha en formato ISO (YYYY-MM-DD o timestamp)
 * @param options Opciones de formato
 * @returns Fecha formateada (ej: "15 de enero de 2025")
 */
export function formatDate(
    date: string | Date,
    options: {
        includeTime?: boolean;
        short?: boolean;
    } = {}
): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return '';

    const { includeTime = false, short = false } = options;

    if (short) {
        // Formato corto: 15/01/2025
        return dateObj.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }

    if (includeTime) {
        // Formato con hora: 15 de enero de 2025, 2:30 PM
        const dateStr = dateObj.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        const timeStr = dateObj.toLocaleTimeString('es-ES', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        return `${dateStr}, ${timeStr}`;
    }

    // Formato largo: 15 de enero de 2025
    return dateObj.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

/**
 * Formatea una fecha de forma relativa (hace X días, etc.)
 * @param date Fecha a formatear
 * @returns String relativo (ej: "hace 2 días")
 */
export function formatRelativeDate(date: string | Date): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    }
    if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    }

    const years = Math.floor(diffDays / 365);
    return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
}

import type { PageProps } from '@/types';

export interface Estudiante {
    id: number;
    nombre: string;
    email: string;
    avatar?: string;
}

export interface Programa {
    id: number;
    nombre: string;
    color: string;
}

export interface Profesor {
    id: number;
    nombre: string;
    avatar?: string;
}

export interface Asistencia {
    id: number;
    fecha: string;
    fecha_formato: string;
    hora: string;
    estudiante: Estudiante;
    programa: Programa;
    profesor: Profesor;
    estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
    estado_original: string;
    notas: string | null;
    registrado_por: string;
    created_at: string;
}

export interface PaginatedData {
    data: Asistencia[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface Alerta {
    id: string;
    estudiante: {
        nombre: string;
        clase: string;
        avatar?: string;
    };
    tipo: 'critico' | 'atencion' | 'seguimiento';
    mensaje: string;
    acciones: string[];
}

export interface FilterOption {
    id: number;
    name: string;
}

export interface AssistsFilters {
    search: string | null;
    status: string | null;
    program_id: string | null;
    professor_id: string | null;
    date_from: string | null;
    date_to: string | null;
}

export interface AssistsProps extends PageProps {
    asistenciaHoy: {
        total: number;
        presentes: number;
        porcentaje: string;
    };
    ausencias: number;
    tardanzas: number;
    promedioMensual: string;
    asistencias: PaginatedData;
    alertas: Alerta[];
    filters: AssistsFilters;
    programs: FilterOption[];
    professors: FilterOption[];
}

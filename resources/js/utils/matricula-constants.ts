/**
 * Constantes para el módulo de matrícula
 */

// Departamentos de Colombia
export const COLOMBIAN_DEPARTMENTS = [
    'Amazonas',
    'Antioquia',
    'Arauca',
    'Atlántico',
    'Bolívar',
    'Boyacá',
    'Caldas',
    'Caquetá',
    'Casanare',
    'Cauca',
    'Cesar',
    'Chocó',
    'Córdoba',
    'Cundinamarca',
    'Guainía',
    'Guaviare',
    'Huila',
    'La Guajira',
    'Magdalena',
    'Meta',
    'Nariño',
    'Norte de Santander',
    'Putumayo',
    'Quindío',
    'Risaralda',
    'San Andrés y Providencia',
    'Santander',
    'Sucre',
    'Tolima',
    'Valle del Cauca',
    'Vaupés',
    'Vichada'
] as const;

export type ColombianDepartment = typeof COLOMBIAN_DEPARTMENTS[number];

// Rangos de edad para modalidades
export const AGE_RANGES = {
    'Linaje Kids': { min: 6, max: 11 },
    'Linaje Teens': { min: 12, max: 17 },
    'Linaje Big': { min: 18, max: 999 }
} as const;

// Requisitos de contraseña
export const PASSWORD_MIN_LENGTH = 8;

// Límites de estudiantes
export const MAX_STUDENTS_PER_ENROLLMENT = 10;
export const MIN_STUDENTS_PER_ENROLLMENT = 1;

// Formato de documento
export const DOCUMENT_NUMBER_MIN_LENGTH = 6;
export const DOCUMENT_NUMBER_MAX_LENGTH = 15;

// Validación de teléfono
export const PHONE_MIN_LENGTH = 7;
export const PHONE_MAX_LENGTH = 15;

/**
 * Funciones helper para el módulo de matrícula
 */

import type { Student, StudyModality } from '@/types/matricula';
import { AGE_RANGES } from './matricula-constants';

/**
 * Calcula la edad a partir de una fecha de nacimiento
 */
export function calculateAge(birthDate: string): number {
    if (!birthDate) return 0;

    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // Ajustar edad si no ha cumplido años este año
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())
        ? age - 1
        : age;
}

/**
 * Formatea el nombre completo de un estudiante
 */
export function formatStudentName(student: Student | { name: string; last_name: string }): string {
    return `${student.name} ${student.last_name}`.trim();
}

/**
 * Obtiene el rango de edad en formato legible para una modalidad
 */
export function getModalityAgeRange(modality: StudyModality): string {
    if (!modality || modality === '') return '';

    const range = AGE_RANGES[modality as keyof typeof AGE_RANGES];
    if (!range) return '';

    if (range.max === 999) {
        return `${range.min}+ años`;
    }
    return `${range.min}-${range.max} años`;
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida formato de número de teléfono colombiano
 */
export function isValidPhoneNumber(phone: string): boolean {
    // Acepta números de 7-15 dígitos, con o sin espacios/guiones
    const phoneRegex = /^[\d\s\-]{7,15}$/;
    return phoneRegex.test(phone);
}

/**
 * Valida que la edad coincida con la modalidad seleccionada
 */
export function validateAgeForModality(birthDate: string, modality: StudyModality): boolean {
    if (!birthDate || !modality || modality === '') return true;

    const age = calculateAge(birthDate);
    const range = AGE_RANGES[modality as keyof typeof AGE_RANGES];

    if (!range) return true;

    return age >= range.min && age <= range.max;
}

/**
 * Limpia un número de documento (remueve espacios y caracteres especiales)
 */
export function cleanDocumentNumber(documentNumber: string): string {
    return documentNumber.replace(/[^\d]/g, '');
}

/**
 * Limpia un número de teléfono (remueve espacios y guiones)
 */
export function cleanPhoneNumber(phone: string): string {
    return phone.replace(/[\s\-]/g, '');
}

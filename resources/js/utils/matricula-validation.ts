import { MatriculaFormData, Student } from '@/types/matricula';

// Validar datos del responsable según el paso
export const validateResponsableStep = (
    step: number,
    data: MatriculaFormData['responsable']
): boolean => {
    switch (step) {
        case 1: // Datos personales básicos
            return !!(
                data.name &&
                data.last_name &&
                data.email &&
                data.document_type &&
                data.document_number &&
                // birth_place es opcional
                data.birth_date &&
                data.gender
            );
        case 2: // Datos de contacto
            return !!(
                data.address &&
                // neighborhood es opcional
                // phone es opcional
                data.mobile &&
                data.city &&
                data.department
            );
        default:
            return true;
    }
};

// Validar estudiante individual
export const validateStudent = (student: Student): boolean => {
    return !!(
        student.name &&
        student.last_name &&
        student.document_type &&
        student.document_number &&
        // birth_place es opcional
        student.birth_date &&
        student.gender &&
        student.datos_musicales.modality &&
        student.program_id
        // schedule_id es opcional
    );
};

// Validar todos los estudiantes
export const validateAllStudents = (students: Student[]): boolean => {
    if (students.length === 0) return false;
    return students.every(validateStudent);
};

// Validar datos musicales del adulto
// Nota: modality ya no se requiere porque los adultos son automáticamente "Linaje Big"
export const validateAdultMusicalData = (data: MatriculaFormData['responsable']): boolean => {
    return !!(
        data.program_id
        // schedule_id es opcional
        // modality es automático (Linaje Big) para adultos
    );
};

// Validar paso completo
export const isStepValid = (
    stepNumber: number,
    data: MatriculaFormData
): boolean => {
    switch (stepNumber) {
        case 1:
            return validateResponsableStep(1, data.responsable);
        case 2:
            return validateResponsableStep(2, data.responsable);
        case 3:
            // Si es adulto, validar datos musicales del responsable
            if (!data.is_minor) {
                return validateAdultMusicalData(data.responsable);
            }
            // Si es menor, validar estudiantes
            return validateAllStudents(data.estudiantes);
        case 4:
            // Validar autorizaciones
            // Para menores: ambas autorizaciones required
            // Para adultos: solo payment_commitment
            if (data.is_minor) {
                return data.parental_authorization && data.payment_commitment;
            }
            return data.payment_commitment;
        default:
            return true;
    }
};

// Obtener el título del paso
export const getStepTitle = (step: number, isMinor: boolean): string => {
    switch (step) {
        case 1:
            return 'Datos Personales';
        case 2:
            return 'Datos de Contacto';
        case 3:
            return isMinor ? 'Datos de los Estudiantes' : 'Datos Musicales';
        case 4:
            return 'Confirmación';
        default:
            return '';
    }
};

// Validar edad para modalidad
export const validateModalityAge = (birthDate: string, modality: string): boolean => {
    if (!birthDate || !modality) return true;

    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // Ajustar edad si no ha cumplido años este año
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())
        ? age - 1
        : age;

    switch (modality) {
        case 'Linaje Kids':
            return actualAge >= 6 && actualAge <= 11;
        case 'Linaje Teens':
            return actualAge >= 12 && actualAge <= 17;
        case 'Linaje Big':
            return actualAge >= 18;
        default:
            return true;
    }
};
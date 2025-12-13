// Tipos de documento disponibles
export type DocumentType = 'CC' | 'TI' | 'CE' | 'Pasaporte';

// Género
export type Gender = 'M' | 'F';

// Modalidades de estudio
export type StudyModality = '' | 'Linaje Kids' | 'Linaje Teens' | 'Linaje Big';

// Interfaz para datos musicales
export interface DatosMusicales {
    plays_instrument: boolean;
    instruments_played: string;
    has_music_studies: boolean;
    music_schools: string;
    desired_instrument: string;
    modality: StudyModality;
    current_level: number;
}

// Interfaz para estudiante
export interface Student {
    name: string;
    last_name: string;
    email: string;
    document_type: DocumentType;
    document_number: string;
    birth_place: string;
    birth_date: string;
    gender: Gender;
    datos_musicales: DatosMusicales;
    program_id: string;
    schedule_id: string;
}

// Interfaz para el responsable
export interface Responsable {
    name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    document_type: DocumentType;
    document_number: string;
    birth_place: string;
    birth_date: string;
    gender: Gender;
    address: string;
    neighborhood: string;
    phone: string;
    mobile: string;
    city: string;
    department: string;
    // Datos musicales para adultos
    plays_instrument: boolean;
    instruments_played: string;
    has_music_studies: boolean;
    music_schools: string;
    desired_instrument: string;
    modality: StudyModality;
    current_level: number;
    program_id: string;
    schedule_id: string;
}

// Interfaz para el formulario de matrícula
export interface MatriculaFormData {
    responsable: Responsable;
    is_minor: boolean;
    estudiantes: Student[];
    parental_authorization: boolean;
    payment_commitment: boolean;
}

// Interfaz para horarios
export interface Schedule {
    id: number;
    days_of_week: string;
    start_time: string;
    end_time: string;
    professor: {
        id: number;
        name: string;
    };
    enrolled_count: number;
    available_slots: number;
    has_capacity: boolean;
}

// Interfaz para programas académicos
export interface AcademicProgram {
    id: number;
    name: string;
    description: string;
    schedules: Schedule[];
}

// Props del componente Create
export interface CreateProps {
    programs: AcademicProgram[];
}

// Constantes
export const DOCUMENT_TYPES: Record<DocumentType, string> = {
    'CC': 'Cédula de Ciudadanía',
    'TI': 'Tarjeta de Identidad',
    'CE': 'Cédula de Extranjería',
    'Pasaporte': 'Pasaporte'
};

export const GENDERS: Record<Gender, string> = {
    'M': 'Masculino',
    'F': 'Femenino'
};

export const MODALITIES: Record<StudyModality, string> = {
    '': 'Seleccione una modalidad',
    'Linaje Kids': 'Linaje Kids (6-11 años)',
    'Linaje Teens': 'Linaje Teens (12-17 años)',
    'Linaje Big': 'Linaje Big (18+ años)'
};

export const TOTAL_STEPS = 4;

// Tipos adicionales para el sistema de pagos

export interface PaymentStudent {
    id: number;
    name: string;
    last_name: string;
    email: string;
}

export interface PaymentProgram {
    id: number;
    name: string;
}

export interface Payment {
    id: number;
    concept: string;
    amount: number;
    wompi_reference: string;
    status: 'pending' | 'completed' | 'cancelled';
    student: PaymentStudent;
    program: PaymentProgram;
}

export interface CheckoutProps {
    payment: Payment;
    wompiPublicKey: string;
    redirectUrl: string;
    amountInCents: number;
    integritySignature: string | null;
}

export interface CheckoutMultiplePayment extends Payment {
    amountInCents: number;
    integritySignature: string | null;
}

export interface CheckoutMultipleProps {
    payments: CheckoutMultiplePayment[];
    totalAmount: number;
    wompiPublicKey: string;
    redirectUrl: string;
}

// Tipos para validación de formularios

export type FormErrors = Partial<Record<string, string>>;

export interface ValidationResult {
    isValid: boolean;
    errors: FormErrors;
}

// Tipos para navegación de pasos

export type StepNumber = 1 | 2 | 3 | 4;

export interface StepConfig {
    number: StepNumber;
    title: string;
    description: string;
}

// Tipos para confirmación de pago

export type PaymentStatus = 'APPROVED' | 'PENDING' | 'DECLINED' | 'ERROR';

export interface ConfirmationProps {
    payment: Payment;
    status: PaymentStatus;
}
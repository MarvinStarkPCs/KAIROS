export interface Role {
    id: number;
    name: string;
}

export interface StudentProfile {
    id: number;
    modality: string | null;
    desired_instrument: string | null;
    plays_instrument: boolean;
    instruments_played: string | null;
    has_music_studies: boolean;
    music_schools: string | null;
    current_level: number | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    medical_conditions: string | null;
    allergies: string | null;
}

export interface TeacherProfile {
    id: number;
    instruments_played: string;
    music_schools: string | null;
    experience_years: number | null;
    bio: string | null;
    specialization: string | null;
    hourly_rate: number | null;
    is_active: boolean;
}

export interface Parent {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    document_type: string | null;
    document_number: string | null;
    address: string | null;
    neighborhood: string | null;
    city: string | null;
    department: string | null;
}

export interface ParentGuardianData {
    id: number;
    relationship_type: string | null;
    name: string;
    address: string | null;
    phone: string | null;
    has_signed_authorization: boolean;
    authorization_date: string | null;
}

export interface Enrollment {
    id: number;
    program_name: string | null;
    status: string;
    enrollment_date: string | null;
    enrolled_level: number | null;
    payment_commitment_signed: boolean;
    payment_commitment_date: string | null;
    parental_authorization_signed: boolean;
    parental_authorization_date: string | null;
    parent_guardian_name: string | null;
}

export interface TeachingSchedule {
    id: number;
    name: string | null;
    program_name: string | null;
    days_of_week: string | null;
    start_time: string | null;
    end_time: string | null;
    classroom: string | null;
    status: string | null;
    students_count: number;
    max_students: number | null;
}

export interface EnrolledSchedule {
    id: number;
    schedule_name: string | null;
    program_name: string | null;
    professor_name: string | null;
    days_of_week: string | null;
    start_time: string | null;
    end_time: string | null;
    classroom: string | null;
    status: string | null;
}

export interface PaymentSummary {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
    total_amount: number;
    paid_amount: number;
    pending_amount: number;
}

export interface RecentPayment {
    id: number;
    concept: string | null;
    program_name: string | null;
    amount: number;
    paid_amount: number;
    status: string;
    due_date: string | null;
    payment_date: string | null;
    installment_number: number | null;
    total_installments: number | null;
}

export interface DependentEnrollment {
    program_name: string | null;
    status: string;
    enrollment_date: string | null;
    enrolled_level: number | null;
}

export interface DependentStudentProfile {
    modality: string | null;
    desired_instrument: string | null;
    current_level: number | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    medical_conditions: string | null;
    allergies: string | null;
}

export interface DependentWithSummary {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    mobile: string | null;
    document_type: string | null;
    document_number: string | null;
    birth_date: string | null;
    gender: string | null;
    student_profile: DependentStudentProfile | null;
    enrollments: DependentEnrollment[];
    payments_pending: number;
    payments_pending_amount: number;
}

export interface UserData {
    id: number;
    name: string;
    last_name: string | null;
    full_name: string;
    email: string | null;
    avatar: string | null;
    document_type: string | null;
    document_number: string | null;
    birth_date: string | null;
    birth_place: string | null;
    gender: string | null;
    phone: string | null;
    mobile: string | null;
    address: string | null;
    neighborhood: string | null;
    city: string | null;
    department: string | null;
    parent_id: number | null;
    parent: Parent | null;
    parent_guardians: ParentGuardianData[];
    dependents: Parent[];
    dependents_with_summary: DependentWithSummary[];
    roles: Role[];
    user_type: string;
    student_profile: StudentProfile | null;
    teacher_profile: TeacherProfile | null;
    teaching_schedules: TeachingSchedule[];
    enrolled_schedules: EnrolledSchedule[];
    payment_summary: PaymentSummary;
    recent_payments: RecentPayment[];
    enrollments: Enrollment[];
    created_at: string;
    updated_at: string;
}

export interface ShowProps {
    user: UserData;
}

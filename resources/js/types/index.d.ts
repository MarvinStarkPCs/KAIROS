import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    permissions: string[];
    roles: string[];
    unreadMessages?: number;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission?: string;
    role?: string;
}

export interface FlashMessages {
    success?: string | null;
    error?: string | null;
    info?: string | null;
    warning?: string | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    flash: FlashMessages;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    last_name?: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    // Datos personales
    document_type?: 'CC' | 'TI' | 'CE' | 'Pasaporte';
    document_number?: string;
    birth_date?: string;
    birth_place?: string;
    gender?: 'M' | 'F';
    // Datos de contacto
    phone?: string;
    mobile?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
    department?: string;
    // Relación padre/tutor
    parent_id?: number;
    user_type?: 'guardian' | 'student' | 'both';
    // Relaciones con perfiles
    student_profile?: StudentProfile;
    teacher_profile?: TeacherProfile;
    // Timestamps
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface StudentProfile {
    id: number;
    user_id: number;
    modality?: 'Linaje Kids' | 'Linaje Teens' | 'Linaje Big';
    desired_instrument?: string;
    plays_instrument: boolean;
    instruments_played?: string;
    has_music_studies: boolean;
    music_schools?: string;
    current_level?: number;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    medical_conditions?: string;
    allergies?: string;
    created_at: string;
    updated_at: string;
}

export interface TeacherProfile {
    id: number;
    user_id: number;
    instruments_played: string;
    music_schools?: string;
    experience_years?: number;
    bio?: string;
    specialization?: string;
    hourly_rate?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PageProps {
    auth?: Auth;
    [key: string]: unknown;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Pagination<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

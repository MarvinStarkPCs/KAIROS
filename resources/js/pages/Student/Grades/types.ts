export interface Enrollment {
    id: number;
    program_id: number;
    program_name: string;
    program_color: string;
    status: string;
}

export interface CriteriaEvaluation {
    criteria_name: string;
    max_points: number;
    points_earned: number;
}

export interface Activity {
    id: number;
    name: string;
    description: string | null;
    weight: number;
    total_max_points: number;
    points_earned: number;
    percentage: number | null;
    is_evaluated: boolean;
    evaluation_date: string | null;
    feedback: string | null;
    criteria_evaluations: CriteriaEvaluation[];
}

export interface ModuleProgress {
    evaluated: number;
    total: number;
    percentage: number;
    average_score: number | null;
}

export interface Module {
    id: number;
    name: string;
    description: string | null;
    level: number;
    hours: number;
    activities: Activity[];
    progress: ModuleProgress;
}

export interface SelectedProgram {
    id: number;
    name: string;
    description: string | null;
    color: string;
}

export interface ProgramStats {
    total_modules: number;
    total_activities: number;
    evaluated_activities: number;
    overall_progress: number;
    overall_average: number | null;
}

export interface AttendanceStats {
    total_classes: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    percentage: number;
}

export interface RecentAttendance {
    id: number;
    class_date: string;
    status: 'present' | 'late' | 'absent' | 'excused';
    notes: string | null;
    program_name: string;
    program_color: string;
    schedule_day: string | null;
    schedule_time: string | null;
}

export interface StudentSchedule {
    id: number;
    name: string;
    days_of_week: string;
    start_time: string;
    end_time: string;
    classroom: string | null;
    professor_name: string | null;
    program_id: number;
    program_name: string;
    program_color: string;
}

export interface PaymentTransaction {
    id: number;
    amount: number;
    payment_method: string | null;
    notes: string | null;
    created_at: string;
}

export interface ProgramPayment {
    id: number;
    concept: string;
    amount: number;
    paid_amount: number;
    pending_balance: number;
    status: 'pending' | 'completed' | 'overdue' | 'cancelled';
    due_date: string | null;
    payment_date: string | null;
    payment_method: string | null;
    has_transactions: boolean;
    transactions: PaymentTransaction[];
}

export interface NequiInfo {
    phone: string | null;
    active: boolean;
    payment_source_id: string | null;
}

export interface GradesProps {
    enrollments: Enrollment[];
    schedules: StudentSchedule[];
    selectedProgramId: number | null;
    selectedProgram: SelectedProgram | null;
    modules: Module[];
    programStats: ProgramStats | null;
    attendanceStats: AttendanceStats;
    recentAttendances: RecentAttendance[];
    programPayments: ProgramPayment[];
    nequi?: NequiInfo;
}

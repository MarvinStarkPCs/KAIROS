export interface Program {
    id: number;
    name: string;
    color: string;
}

export interface Schedule {
    id: number;
    program: Program;
    days_of_week: string;
    start_time: string;
    end_time: string;
    location: string;
    start_date: string;
    end_date: string;
}

export interface AttendanceStats {
    total: number;
    marked: number;
    present: number;
    late: number;
    absent: number;
    percentage: number;
}

export interface ProgressStats {
    evaluated_activities: number;
    total_activities: number;
    progress_percentage: number;
    average_grade: number;
}

export interface AttendanceRecord {
    status: string;
    notes: string | null;
}

export interface Student {
    id: number;
    name: string;
    email: string;
    document_type: string | null;
    document_number: string | null;
    enrollment_date: string;
    attendance_stats: AttendanceStats;
    progress_stats: ProgressStats;
    attendance_by_date: Record<string, AttendanceRecord>;
}

export interface EvaluationCriteria {
    id: number;
    name: string;
    description: string;
    max_points: number;
    order: number;
}

export interface StudyPlanInfo {
    id: number;
    module_name: string;
    description: string | null;
    hours: number;
    level: number;
}

export interface Activity {
    id: number;
    name: string;
    description: string;
    weight: number;
    order: number;
    status: string;
    study_plan: StudyPlanInfo;
    evaluation_criteria: EvaluationCriteria[];
    evaluated_count: number;
    total_students: number;
    is_fully_evaluated: boolean;
}

export interface ClassDate {
    date: string;
    day_name: string;
    is_past: boolean;
    is_today: boolean;
    total_students: number;
    marked_count: number;
    present_count: number;
    late_count: number;
    absent_count: number;
}

export interface ModuleGroup {
    moduleName: string;
    description: string | null;
    hours: number;
    level: number;
    activities: Activity[];
    isFullyEvaluated: boolean;
    isLocked: boolean;
}

export interface GroupDetailProps {
    schedule: Schedule;
    students: Student[];
    activities: Activity[];
    classDates: ClassDate[];
}

export interface ProgramOption {
    id: number;
    name: string;
    color: string;
    status: string;
}

export interface AcademicFilters {
    program_id?: number | null;
    status?: string | null;
    search?: string | null;
    risk?: string | null;
}

/** Una fila de la tabla de progreso: un estudiante dentro de un programa. */
export interface StudentMetric {
    enrollment_id: number;
    enrollment_status: string;
    enrollment_date: string | null;
    student_id: number;
    student_name: string;
    student_email: string;
    program_id: number;
    program_name: string;
    program_color: string;
    total_activities: number;
    evaluated_activities: number;
    pending_activities: number;
    progress: number;
    average: number | null;
    passing: boolean | null;
    attendance_rate: number | null;
    attendance_records: number;
    last_evaluation: string | null;
}

export interface StudentsSummary {
    total: number;
    students: number;
    average_progress: number;
    average_grade: number | null;
    attendance_rate: number | null;
    at_risk: number;
    without_grades: number;
}

/** Cobertura de calificación de un grupo concreto. */
export interface TeacherGroup {
    schedule_id: number;
    schedule_name: string;
    teacher_id: number | null;
    teacher_name: string;
    teacher_email: string | null;
    program_id: number;
    program_name: string;
    program_color: string;
    students: number;
    activities: number;
    expected_evaluations: number;
    completed_evaluations: number;
    pending_evaluations: number;
    coverage: number | null;
    last_evaluation: string | null;
}

export interface TeacherMetric {
    teacher_id: number | null;
    teacher_name: string;
    teacher_email: string | null;
    groups_count: number;
    students: number;
    expected_evaluations: number;
    completed_evaluations: number;
    pending_evaluations: number;
    coverage: number | null;
    last_evaluation: string | null;
    groups: TeacherGroup[];
}

export interface TeachersSummary {
    teachers: number;
    groups: number;
    students: number;
    expected_evaluations: number;
    completed_evaluations: number;
    pending_evaluations: number;
    coverage: number | null;
    unassigned_groups: number;
}

export interface ProgramBreakdown {
    program_id: number;
    program_name: string;
    program_color: string;
    students: number;
    activities: number;
    progress: number;
    average: number | null;
    attendance_rate: number | null;
    evaluation_coverage: number | null;
    at_risk: number;
}

export interface OverviewSummary {
    active_students: number;
    enrollments: number;
    programs: number;
    teachers: number;
    average_grade: number | null;
    average_progress: number;
    attendance_rate: number | null;
    evaluation_coverage: number | null;
    pending_evaluations: number;
    at_risk_students: number;
    students_without_grades: number;
}

export interface OverviewData {
    summary: OverviewSummary;
    by_program: ProgramBreakdown[];
    grade_distribution: { range: string; students: number }[];
    evaluation_trend: { month: string; evaluations: number }[];
    at_risk: StudentMetric[];
    top_students: StudentMetric[];
    teachers_pending: TeacherMetric[];
}

/** Detalle académico de un estudiante. */
export interface CriteriaScore {
    name: string;
    max_points: number;
    points_earned: number;
}

export interface ActivityDetail {
    id: number;
    name: string;
    description: string | null;
    weight: number;
    total_max_points: number;
    points_earned: number | null;
    percentage: number | null;
    is_evaluated: boolean;
    evaluation_date: string | null;
    feedback: string | null;
    teacher_name: string | null;
    criteria: CriteriaScore[];
}

export interface ModuleDetail {
    id: number;
    name: string;
    description: string | null;
    level: number;
    hours: number;
    activities: ActivityDetail[];
    progress: {
        evaluated: number;
        total: number;
        percentage: number;
        average: number | null;
    };
}

export interface StudentDetailData {
    programs: { id: number; name: string; color: string; status: string }[];
    selected_program_id: number | null;
    modules: ModuleDetail[];
    summary: {
        total_modules: number;
        total_activities: number;
        evaluated_activities: number;
        progress: number;
        average: number | null;
        passed_activities: number;
        attendance_rate: number | null;
        attendance_records: number;
    } | null;
}

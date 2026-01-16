import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    GraduationCap,
    BookOpen,
    Award,
    TrendingUp,
    Calendar,
    ChevronRight,
    Star,
    Clock,
} from 'lucide-react';

interface ProgramProgress {
    enrollment_id: number;
    program_id: number;
    program_name: string;
    program_color: string;
    enrollment_date: string;
    status: string;
    progress_percentage: number;
    completed_activities: number;
    total_activities: number;
    average_score: number | null;
}

interface RecentEvaluation {
    id: number;
    activity_name: string;
    program_name: string;
    points_earned: number;
    max_points: number;
    percentage: number;
    feedback: string | null;
    evaluation_date: string;
    teacher_name: string;
}

interface Stats {
    total_programs: number;
    active_programs: number;
    total_evaluations: number;
    average_score: number | null;
}

interface Props {
    stats: Stats;
    programsProgress: ProgramProgress[];
    recentEvaluations: RecentEvaluation[];
}

export default function Dashboard({ stats, programsProgress, recentEvaluations }: Props) {
    const getScoreColor = (score: number | null) => {
        if (score === null) return 'text-gray-400';
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBadge = (score: number | null) => {
        if (score === null) return <Badge variant="outline">Sin evaluar</Badge>;
        if (score >= 80) return <Badge className="bg-green-500">Excelente</Badge>;
        if (score >= 60) return <Badge className="bg-yellow-500">Aprobado</Badge>;
        return <Badge variant="destructive">Necesita mejorar</Badge>;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500">Activo</Badge>;
            case 'waiting':
                return <Badge className="bg-yellow-500">En espera</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Mi Portal - Estudiante" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mi Portal Académico</h1>
                    <p className="text-muted-foreground mt-1">
                        Bienvenido a tu espacio de seguimiento académico
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Programas Activos</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.active_programs}</div>
                            <p className="text-xs text-muted-foreground">
                                de {stats.total_programs} programa(s) matriculado(s)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_evaluations}</div>
                            <p className="text-xs text-muted-foreground">
                                actividades evaluadas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${getScoreColor(stats.average_score)}`}>
                                {stats.average_score !== null ? `${stats.average_score}%` : 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.average_score !== null
                                    ? stats.average_score >= 60 ? 'Vas muy bien!' : 'Sigue esforzándote'
                                    : 'Sin evaluaciones aún'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {stats.average_score !== null ? (
                                <>
                                    {getScoreBadge(stats.average_score)}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        basado en tus evaluaciones
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">Sin datos aún</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Programs Progress - Takes 2 columns */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Mis Programas</CardTitle>
                                        <CardDescription>
                                            Progreso en tus programas académicos
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {programsProgress.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No tienes programas matriculados actualmente</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {programsProgress.map((program) => (
                                            <div
                                                key={program.enrollment_id}
                                                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: program.program_color }}
                                                        />
                                                        <div>
                                                            <h3 className="font-semibold">{program.program_name}</h3>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Calendar className="h-3 w-3" />
                                                                <span>
                                                                    Desde {new Date(program.enrollment_date).toLocaleDateString('es-ES')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusBadge(program.status)}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">
                                                            Progreso: {program.completed_activities} de {program.total_activities} actividades
                                                        </span>
                                                        <span className="font-medium">{program.progress_percentage}%</span>
                                                    </div>
                                                    <Progress value={program.progress_percentage} className="h-2" />

                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Star className="h-4 w-4 text-yellow-500" />
                                                            <span>
                                                                Promedio:{' '}
                                                                <span className={`font-semibold ${getScoreColor(program.average_score)}`}>
                                                                    {program.average_score !== null
                                                                        ? `${program.average_score}%`
                                                                        : 'Sin evaluar'}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <Link href={`/estudiante/calificaciones/${program.program_id}`}>
                                                            <Button variant="outline" size="sm">
                                                                Ver calificaciones
                                                                <ChevronRight className="h-4 w-4 ml-1" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Evaluations - Takes 1 column */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Últimas Evaluaciones</CardTitle>
                                <CardDescription>
                                    Tus evaluaciones más recientes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentEvaluations.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No tienes evaluaciones aún</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentEvaluations.map((evaluation) => (
                                            <div
                                                key={evaluation.id}
                                                className="p-3 border rounded-lg"
                                            >
                                                <div className="flex items-start justify-between mb-1">
                                                    <h4 className="font-medium text-sm line-clamp-1">
                                                        {evaluation.activity_name}
                                                    </h4>
                                                    <span className={`text-sm font-bold ${getScoreColor(evaluation.percentage)}`}>
                                                        {evaluation.percentage}%
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {evaluation.program_name}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(evaluation.evaluation_date).toLocaleDateString('es-ES')}
                                                    </div>
                                                    <span>
                                                        {evaluation.points_earned}/{evaluation.max_points} pts
                                                    </span>
                                                </div>
                                                {evaluation.feedback && (
                                                    <p className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                        "{evaluation.feedback}"
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

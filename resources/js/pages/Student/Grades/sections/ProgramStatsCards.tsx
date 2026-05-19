import { TrendingUp, Award, BookOpen, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getScoreColor, getScoreBadge } from '../helpers';
import type { ProgramStats } from '../types';

interface Props {
    stats: ProgramStats;
}

export default function ProgramStatsCards({ stats }: Props) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Progreso</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="text-xl sm:text-2xl font-bold">{stats.overall_progress}%</div>
                    <Progress value={stats.overall_progress} className="mt-2 h-2" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Promedio</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                    <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(stats.overall_average)}`}>
                        {stats.overall_average !== null ? `${stats.overall_average}%` : 'N/A'}
                    </div>
                    <div className="mt-1">{getScoreBadge(stats.overall_average)}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Módulos</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="text-xl sm:text-2xl font-bold">{stats.total_modules}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">en el programa</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-6 pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Evaluadas</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                    <div className="text-xl sm:text-2xl font-bold">
                        {stats.evaluated_activities}
                        <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                            /{stats.total_activities}
                        </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">actividades</p>
                </CardContent>
            </Card>
        </div>
    );
}

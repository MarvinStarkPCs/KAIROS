import { ClipboardCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAttendanceIcon, getAttendanceBadge } from '../helpers';
import { DAY_NAMES } from '../constants';
import type { AttendanceStats, RecentAttendance } from '../types';

interface Props {
    attendanceStats: AttendanceStats;
    recentAttendances: RecentAttendance[];
}

export default function AttendanceSection({ attendanceStats, recentAttendances }: Props) {
    const percentageColor =
        attendanceStats.percentage >= 80 ? 'text-green-600' :
        attendanceStats.percentage >= 60 ? 'text-yellow-600' : 'text-red-600';

    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5" />
                            Mi Asistencia
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            Registro de asistencia a clases
                        </CardDescription>
                    </div>
                    <div className="text-left sm:text-right">
                        <div className={`text-2xl font-bold ${percentageColor}`}>
                            {attendanceStats.percentage}%
                        </div>
                        <p className="text-xs text-muted-foreground">Asistencia general</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
                    <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <div className="text-lg sm:text-xl font-bold text-green-600">{attendanceStats.present}</div>
                        <div className="text-[10px] sm:text-xs text-green-700 dark:text-green-300">Presente</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                        <div className="text-lg sm:text-xl font-bold text-yellow-600">{attendanceStats.late}</div>
                        <div className="text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-300">Tarde</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <div className="text-lg sm:text-xl font-bold text-red-600">{attendanceStats.absent}</div>
                        <div className="text-[10px] sm:text-xs text-red-700 dark:text-red-300">Ausente</div>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="text-lg sm:text-xl font-bold text-blue-600">{attendanceStats.excused}</div>
                        <div className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300">Excusado</div>
                    </div>
                </div>

                <h4 className="font-semibold text-sm mb-3">Últimos registros</h4>
                {recentAttendances.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <ClipboardCheck className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No hay registros de asistencia aún</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentAttendances.map((attendance) => (
                            <div
                                key={attendance.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {getAttendanceIcon(attendance.status)}
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium text-sm truncate">{attendance.program_name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {attendance.schedule_day && DAY_NAMES[attendance.schedule_day]}
                                            {attendance.schedule_time && ` - ${attendance.schedule_time}`}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    {getAttendanceBadge(attendance.status)}
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {new Date(attendance.class_date).toLocaleDateString('es-ES')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

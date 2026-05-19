import { CalendarDays, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime, getStatusBadge } from '../helpers';
import type { TeachingSchedule } from '../types';

interface Props {
    schedules: TeachingSchedule[];
}

export default function TeachingSchedulesCard({ schedules }: Props) {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Horarios de Clase Asignados
                </CardTitle>
                <CardDescription>
                    {schedules.length} grupo{schedules.length !== 1 ? 's' : ''} asignado{schedules.length !== 1 ? 's' : ''}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Grupo</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Programa</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dias</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Horario</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aula</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estudiantes</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {schedules.map((schedule) => (
                                <tr key={schedule.id} className="hover:bg-muted transition-colors">
                                    <td className="px-4 py-3 font-medium">{schedule.name || `Grupo #${schedule.id}`}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{schedule.program_name || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className="capitalize text-muted-foreground">{schedule.days_of_week || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{schedule.classroom || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center gap-1 font-medium">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                            {schedule.students_count}{schedule.max_students ? `/${schedule.max_students}` : ''}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {getStatusBadge(schedule.status || 'active')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

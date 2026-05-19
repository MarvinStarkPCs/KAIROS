import { CalendarDays, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime, getStatusBadge } from '../helpers';
import type { EnrolledSchedule } from '../types';

interface Props {
    schedules: EnrolledSchedule[];
}

export default function EnrolledSchedulesCard({ schedules }: Props) {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Horarios Inscritos
                </CardTitle>
                <CardDescription>Clases en las que esta inscrito el estudiante</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Grupo</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Programa</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Profesor</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dias</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Horario</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Aula</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {schedules.map((es) => (
                                <tr key={es.id} className="hover:bg-muted transition-colors">
                                    <td className="px-4 py-3 font-medium">{es.schedule_name || '-'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{es.program_name || '-'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{es.professor_name || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className="capitalize text-muted-foreground">{es.days_of_week || '-'}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            {formatTime(es.start_time)} - {formatTime(es.end_time)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{es.classroom || '-'}</td>
                                    <td className="px-4 py-3 text-center">
                                        {getStatusBadge(es.status || 'enrolled')}
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

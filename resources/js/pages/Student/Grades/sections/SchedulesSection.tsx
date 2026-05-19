import { Calendar, Clock, MapPin, User, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StudentSchedule } from '../types';

interface Props {
    schedules: StudentSchedule[];
}

export default function SchedulesSection({ schedules }: Props) {
    return (
        <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Mis Horarios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {schedules.map((schedule) => (
                    <Card
                        key={schedule.id}
                        className="border-l-4"
                        style={{ borderLeftColor: schedule.program_color }}
                    >
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-sm sm:text-base truncate">
                                            {schedule.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <GraduationCap className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate">{schedule.program_name}</span>
                                        </p>
                                    </div>
                                    <Badge
                                        className="flex-shrink-0 text-[10px]"
                                        style={{ backgroundColor: schedule.program_color }}
                                    >
                                        {schedule.days_of_week}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {schedule.start_time} - {schedule.end_time}
                                    </span>
                                    {schedule.classroom && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {schedule.classroom}
                                        </span>
                                    )}
                                    {schedule.professor_name && (
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {schedule.professor_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

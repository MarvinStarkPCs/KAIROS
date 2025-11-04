import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { EventClickArg, EventContentArg } from '@fullcalendar/core';
import { router } from '@inertiajs/react';

interface ScheduleCalendarProps {
    filters?: {
        program_id?: number;
        professor_id?: number;
        status?: string;
        semester?: string;
    };
    onEventClick?: (scheduleId: number) => void;
    initialView?: 'timeGridWeek' | 'timeGridDay' | 'dayGridMonth' | 'listWeek';
}

interface ScheduleEvent {
    id: string;
    title: string;
    daysOfWeek: number[];
    startTime: string;
    endTime: string;
    startRecur: string;
    endRecur: string;
    extendedProps: {
        program: string;
        professor: string;
        classroom: string;
        semester: string;
        enrolled_count: number;
        max_students: number;
        available_slots: number;
        status: string;
    };
}

export function ScheduleCalendar({
    filters = {},
    onEventClick,
    initialView = 'timeGridWeek',
}: ScheduleCalendarProps) {
    const calendarRef = useRef<FullCalendar>(null);
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, [filters]);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.program_id) queryParams.append('program_id', filters.program_id.toString());
            if (filters.professor_id) queryParams.append('professor_id', filters.professor_id.toString());
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.semester) queryParams.append('semester', filters.semester);

            const response = await fetch(`/horarios-api/calendar-events?${queryParams}`);
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error loading calendar events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEventClick = (info: EventClickArg) => {
        info.jsEvent.preventDefault();
        const scheduleId = parseInt(info.event.id);

        if (onEventClick) {
            onEventClick(scheduleId);
        } else {
            // Por defecto, navegar a la página de detalles
            router.visit(`/horarios/${scheduleId}`);
        }
    };

    const renderEventContent = (eventInfo: EventContentArg) => {
        const { extendedProps } = eventInfo.event;
        const occupancyPercentage = (extendedProps.enrolled_count / extendedProps.max_students) * 100;

        // Color basado en ocupación
        let colorClass = 'bg-green-500';
        if (occupancyPercentage >= 100) {
            colorClass = 'bg-red-500';
        } else if (occupancyPercentage >= 80) {
            colorClass = 'bg-yellow-500';
        }

        return (
            <div className={`${colorClass} px-2 py-1 rounded text-white text-xs overflow-hidden h-full`}>
                <div className="font-semibold truncate">{eventInfo.event.title}</div>
                <div className="text-[10px] opacity-90 truncate">
                    {extendedProps.professor}
                </div>
                <div className="text-[10px] opacity-90">
                    {extendedProps.enrolled_count}/{extendedProps.max_students}
                </div>
                {extendedProps.classroom && (
                    <div className="text-[10px] opacity-75 truncate">
                        📍 {extendedProps.classroom}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            {loading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                    <div className="text-gray-600">Cargando calendario...</div>
                </div>
            )}
            <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView={initialView}
                locale={esLocale}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
                }}
                buttonText={{
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    list: 'Lista',
                }}
                events={events}
                eventClick={handleEventClick}
                eventContent={renderEventContent}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
                height="auto"
                expandRows={true}
                slotDuration="00:30:00"
                slotLabelInterval="01:00"
                slotLabelFormat={{
                    hour: 'numeric',
                    minute: '2-digit',
                    meridiem: false,
                    hour12: false,
                }}
                eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false,
                    hour12: false,
                }}
                nowIndicator={true}
                weekNumbers={false}
                weekends={true}
                dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
                businessHours={{
                    daysOfWeek: [1, 2, 3, 4, 5], // Lunes - Viernes
                    startTime: '08:00',
                    endTime: '18:00',
                }}
            />
        </div>
    );
}

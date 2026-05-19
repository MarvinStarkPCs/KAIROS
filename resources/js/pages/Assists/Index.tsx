import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { useState, useEffect } from 'react';
import StatsCards from './Index/sections/StatsCards';
import FiltersPanel from './Index/sections/FiltersPanel';
import AttendanceTable from './Index/sections/AttendanceTable';
import AlertsSection from './Index/sections/AlertsSection';
import AttendanceDetailDialog from './Index/sections/AttendanceDetailDialog';
import type { AssistsProps, Asistencia } from './Index/types';

export default function ControlAsistencia({
    asistenciaHoy = { total: 0, presentes: 0, porcentaje: '0%' },
    ausencias = 0,
    tardanzas = 0,
    promedioMensual = '0%',
    asistencias,
    alertas = [],
    filters,
    programs = [],
    professors = [],
}: AssistsProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [programId, setProgramId] = useState(filters?.program_id || '');
    const [professorId, setProfessorId] = useState(filters?.professor_id || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState<Asistencia | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                applyFilters({ search });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const applyFilters = (newFilters: Record<string, string | null> = {}) => {
        const params: Record<string, string> = {};
        const s = newFilters.search !== undefined ? newFilters.search : search;
        const st = newFilters.status !== undefined ? newFilters.status : status;
        const pid = newFilters.program_id !== undefined ? newFilters.program_id : programId;
        const prid = newFilters.professor_id !== undefined ? newFilters.professor_id : professorId;
        const df = newFilters.date_from !== undefined ? newFilters.date_from : dateFrom;
        const dt = newFilters.date_to !== undefined ? newFilters.date_to : dateTo;

        if (s) params.search = s;
        if (st && st !== 'all') params.status = st;
        if (pid && pid !== 'all') params.program_id = pid;
        if (prid && prid !== 'all') params.professor_id = prid;
        if (df) params.date_from = df;
        if (dt) params.date_to = dt;

        router.get('/asistencia', params, { preserveState: true, preserveScroll: true });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setProgramId('');
        setProfessorId('');
        setDateFrom('');
        setDateTo('');
        router.get('/asistencia');
    };

    const goToPage = (page: number) => {
        const params: Record<string, string> = { page: page.toString() };
        if (search) params.search = search;
        if (status && status !== 'all') params.status = status;
        if (programId && programId !== 'all') params.program_id = programId;
        if (professorId && professorId !== 'all') params.professor_id = professorId;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        router.get('/asistencia', params, { preserveState: true, preserveScroll: true });
    };

    const hasActiveFilters = Boolean(
        (status && status !== 'all') ||
        (programId && programId !== 'all') ||
        (professorId && professorId !== 'all') ||
        dateFrom ||
        dateTo
    );

    return (
        <AppLayout>
            <Head title="Control de Asistencia" />
            <Heading
                title="Control de Asistencia"
                description="Registro y seguimiento de asistencia estudiantil"
            />

            <StatsCards
                asistenciaHoy={asistenciaHoy}
                ausencias={ausencias}
                tardanzas={tardanzas}
                promedioMensual={promedioMensual}
            />

            <FiltersPanel
                search={search}
                status={status}
                programId={programId}
                professorId={professorId}
                dateFrom={dateFrom}
                dateTo={dateTo}
                showFilters={showFilters}
                hasActiveFilters={hasActiveFilters}
                programs={programs}
                professors={professors}
                onSearchChange={setSearch}
                onStatusChange={(value) => { setStatus(value); applyFilters({ status: value }); }}
                onProgramChange={(value) => { setProgramId(value); applyFilters({ program_id: value }); }}
                onProfessorChange={(value) => { setProfessorId(value); applyFilters({ professor_id: value }); }}
                onDateFromChange={(value) => { setDateFrom(value); applyFilters({ date_from: value }); }}
                onDateToChange={(value) => { setDateTo(value); applyFilters({ date_to: value }); }}
                onToggleFilters={() => setShowFilters((prev) => !prev)}
                onClearFilters={clearFilters}
            />

            <AttendanceTable
                asistencias={asistencias}
                onViewAttendance={setSelectedAttendance}
                onGoToPage={goToPage}
            />

            <AlertsSection alertas={alertas} />

            <AttendanceDetailDialog
                attendance={selectedAttendance}
                onClose={() => setSelectedAttendance(null)}
            />
        </AppLayout>
    );
}

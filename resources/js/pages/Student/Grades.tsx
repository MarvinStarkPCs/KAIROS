import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

import type { GradesProps } from './Grades/types';
import GradesHeader from './Grades/sections/GradesHeader';
import ProgramHeaderCard from './Grades/sections/ProgramHeaderCard';
import SchedulesSection from './Grades/sections/SchedulesSection';
import ProgramStatsCards from './Grades/sections/ProgramStatsCards';
import ModulesAccordion from './Grades/sections/ModulesAccordion';
import AttendanceSection from './Grades/sections/AttendanceSection';
import PaymentsDialog from './Grades/sections/PaymentsDialog';

export default function Grades({
    enrollments,
    schedules,
    selectedProgramId,
    selectedProgram,
    modules,
    programStats,
    attendanceStats,
    recentAttendances,
    programPayments,
}: GradesProps) {
    const programSchedules = selectedProgramId
        ? schedules.filter((s) => s.program_id === selectedProgramId)
        : [];

    const [paymentsOpen, setPaymentsOpen] = useState(false);
    const [expandedPayment, setExpandedPayment] = useState<number | null>(null);

    const handleProgramChange = (programId: string) => {
        router.get(`/estudiante/calificaciones/${programId}`);
    };

    return (
        <AppLayout>
            <Head title="Mis Calificaciones" />

            <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
                <GradesHeader
                    enrollments={enrollments}
                    selectedProgramId={selectedProgramId}
                    selectedProgram={selectedProgram}
                    programPayments={programPayments}
                    onProgramChange={handleProgramChange}
                    onOpenPayments={() => setPaymentsOpen(true)}
                />

                {!selectedProgram ? (
                    <Card>
                        <CardContent className="py-8 sm:py-12 text-center">
                            <GraduationCap className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-base sm:text-lg font-semibold mb-2">
                                Selecciona un programa
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base">
                                Elige uno de tus programas académicos para ver tus calificaciones
                                y progreso detallado.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <ProgramHeaderCard program={selectedProgram} />

                        {programSchedules.length > 0 && (
                            <SchedulesSection schedules={programSchedules} />
                        )}

                        {programStats && (
                            <ProgramStatsCards stats={programStats} />
                        )}

                        <ModulesAccordion modules={modules} />
                    </>
                )}

                <AttendanceSection
                    attendanceStats={attendanceStats}
                    recentAttendances={recentAttendances}
                />

                <PaymentsDialog
                    open={paymentsOpen}
                    onOpenChange={setPaymentsOpen}
                    selectedProgram={selectedProgram}
                    programPayments={programPayments}
                    expandedPayment={expandedPayment}
                    onExpandedChange={setExpandedPayment}
                />
            </div>
        </AppLayout>
    );
}

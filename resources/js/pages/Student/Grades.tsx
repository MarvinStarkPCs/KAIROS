import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { GraduationCap, Smartphone, CheckCircle, Clock, LinkIcon, Unlink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

import type { GradesProps } from './Grades/types';
import GradesHeader from './Grades/sections/GradesHeader';
import ProgramHeaderCard from './Grades/sections/ProgramHeaderCard';
import SchedulesSection from './Grades/sections/SchedulesSection';
import ProgramStatsCards from './Grades/sections/ProgramStatsCards';
import ModulesAccordion from './Grades/sections/ModulesAccordion';
import AttendanceSection from './Grades/sections/AttendanceSection';
import PaymentsDialog from './Grades/sections/PaymentsDialog';

const DEFAULT_NEQUI = { phone: null, active: false, payment_source_id: null };

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
    nequi = DEFAULT_NEQUI,
}: GradesProps) {
    const programSchedules = selectedProgramId
        ? schedules.filter((s) => s.program_id === selectedProgramId)
        : [];

    const [paymentsOpen, setPaymentsOpen] = useState(false);
    const [expandedPayment, setExpandedPayment] = useState<number | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({ phone: nequi.phone ?? '' });

    const handleProgramChange = (programId: string) => {
        router.get(`/estudiante/calificaciones/${programId}`);
    };

    const handleLink = (e: React.FormEvent) => {
        e.preventDefault();
        post('/estudiante/nequi/vincular', { preserveScroll: true, onSuccess: () => reset() });
    };

    const handleUnlink = () => {
        router.delete('/estudiante/nequi/desvincular', { preserveScroll: true });
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

                {/* Nequi automático */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Smartphone className="h-4 w-4 text-pink-500" />
                            Pagos automáticos con Nequi
                        </CardTitle>
                        <CardDescription>
                            Vincula tu cuenta Nequi y autoriza solo una vez. Desde ese momento tus mensualidades
                            se cobran automáticamente sin que tengas que hacer nada más.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {nequi.phone && nequi.active ? (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{nequi.phone}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Cobros automáticos activos — se debitará sin necesidad de aprobar cada mes
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleUnlink}>
                                    <Unlink className="mr-1.5 h-3.5 w-3.5" />
                                    Desvincular
                                </Button>
                            </div>
                        ) : nequi.phone && nequi.payment_source_id ? (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{nequi.phone}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Pendiente de autorización — abre tu app Nequi y acepta la notificación
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={handleUnlink}>
                                    <Unlink className="mr-1.5 h-3.5 w-3.5" />
                                    Cancelar
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleLink} className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor="nequi-phone-grades">Número Nequi (celular)</Label>
                                    <Input
                                        id="nequi-phone-grades"
                                        type="tel"
                                        placeholder="3001234567"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        maxLength={10}
                                        className="max-w-xs"
                                    />
                                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                                    <p className="text-xs text-muted-foreground">
                                        Solo autorizas una vez. Después los cobros mensuales son automáticos.
                                    </p>
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" disabled={processing} className="bg-pink-600 hover:bg-pink-700 text-white">
                                        <LinkIcon className="mr-2 h-4 w-4" />
                                        {processing ? 'Vinculando...' : 'Vincular Nequi'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

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

import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Users,
    Clock,
    Plus,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    UserCog,
    Eye,
    Edit,
    X,
    Filter,
    Grid,
    CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScheduleCalendar } from '@/components/ScheduleCalendar';
import AppLayout from '@/layouts/app-layout';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface AcademicProgram {
    id: number;
    name: string;
}

interface Professor {
    id: number;
    name: string;
    email: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Schedule {
    id: number;
    academic_program_id: number;
    academic_program: AcademicProgram;
    professor_id: number | null;
    professor: Professor | null;
    name: string;
    description: string | null;
    days_of_week: string;
    start_time: string;
    end_time: string;
    classroom: string | null;
    semester: string | null;
    max_students: number;
    status: 'active' | 'inactive' | 'completed';
    enrolled_count: number;
    available_slots: number;
    created_at: string;
    updated_at: string;
}

interface Stats {
    total_schedules: number;
    active_schedules: number;
    total_students_enrolled: number;
    total_available_slots: number;
}

interface SchedulesIndexProps {
    schedules: Schedule[];
    stats: Stats;
    allProfessors: Professor[];
    allStudents: Student[];
}

const diasSemana = [
    { nombre: 'Lunes', key: 'lunes' },
    { nombre: 'Martes', key: 'martes' },
    { nombre: 'Miércoles', key: 'miércoles' },
    { nombre: 'Jueves', key: 'jueves' },
    { nombre: 'Viernes', key: 'viernes' },
    { nombre: 'Sábado', key: 'sábado' },
];

export default function SchedulesIndex({ schedules, stats, allProfessors, allStudents }: SchedulesIndexProps) {
    const [currentWeek] = useState('Semana Actual');
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [selectedProfessor, setSelectedProfessor] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('calendar');
    const [showFilters, setShowFilters] = useState(false);

    // Filtros
    const [filterProgram, setFilterProgram] = useState<string>('');
    const [filterProfessor, setFilterProfessor] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('active');

    // Obtener programas únicos de los horarios
    const availablePrograms = Array.from(
        new Map(schedules.map(s => [s.academic_program.id, s.academic_program])).values()
    );

    // Reset selected values when sheet opens
    useEffect(() => {
        if (sheetOpen && selectedSchedule) {
            setSelectedStudent('');
            setSelectedProfessor(selectedSchedule.professor_id?.toString() || 'unassigned');
        }
    }, [sheetOpen, selectedSchedule]);

    // Agrupar horarios por hora de inicio
    const horariosAgrupados: Record<string, Schedule[]> = {};

    schedules.forEach((schedule) => {
        const hora = schedule.start_time;
        if (!horariosAgrupados[hora]) {
            horariosAgrupados[hora] = [];
        }
        horariosAgrupados[hora].push(schedule);
    });

    const horasOrdenadas = Object.keys(horariosAgrupados).sort();

    // Función para obtener color según ocupación
    const getOcupacionColor = (enrolled: number, max: number) => {
        const percentage = (enrolled / max) * 100;
        if (percentage >= 100) return 'bg-red-600';
        if (percentage >= 80) return 'bg-yellow-600';
        return 'bg-green-600';
    };

    const handleScheduleClick = (e: React.MouseEvent, schedule: Schedule) => {
        e.preventDefault();
        setSelectedSchedule(schedule);
        setSheetOpen(true);
    };

    const handleEnrollStudent = () => {
        if (!selectedSchedule || !selectedStudent) return;

        router.post(
            `/horarios/${selectedSchedule.id}/enroll`,
            { student_id: selectedStudent },
            {
                preserveScroll: true,
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    if (firstError) {
                        toast.error(firstError as string);
                    }
                },
            }
        );
    };

    const handleAssignProfessor = () => {
        if (!selectedSchedule) return;

        router.put(
            `/horarios/${selectedSchedule.id}`,
            {
                academic_program_id: selectedSchedule.academic_program_id,
                professor_id: selectedProfessor === 'unassigned' ? null : selectedProfessor,
                name: selectedSchedule.name,
                description: selectedSchedule.description,
                days_of_week: selectedSchedule.days_of_week,
                start_time: selectedSchedule.start_time,
                end_time: selectedSchedule.end_time,
                classroom: selectedSchedule.classroom,
                semester: selectedSchedule.semester,
                max_students: selectedSchedule.max_students,
                status: selectedSchedule.status,
            },
            {
                preserveScroll: true,
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    if (firstError) {
                        toast.error(firstError as string);
                    }
                },
            }
        );
    };

    return (
        <AppLayout>
            <Head title="Horarios" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Horarios</h1>
                        <p className="mt-2 text-gray-600">Gestiona los horarios y clases académicas</p>
                    </div>
                    <Link href="/horarios/create">
                        <Button className="flex items-center space-x-2">
                            <Plus className="h-5 w-5" />
                            <span>Nuevo Horario</span>
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Horarios</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total_schedules}</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3">
                                <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Horarios Activos</p>
                                <p className="text-3xl font-bold text-green-600">{stats.active_schedules}</p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Estudiantes Inscritos</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.total_students_enrolled}</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Cupos Disponibles</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.total_available_slots}</p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-3">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Toggle and Filters */}
                <div className="flex items-center justify-between gap-4">
                    <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'calendar')}>
                        <ToggleGroupItem value="calendar" aria-label="Vista de calendario">
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Calendario
                        </ToggleGroupItem>
                        <ToggleGroupItem value="grid" aria-label="Vista de cuadrícula">
                            <Grid className="mr-2 h-4 w-4" />
                            Cuadrícula
                        </ToggleGroupItem>
                    </ToggleGroup>

                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        Filtros
                        {(filterProgram || filterProfessor || filterStatus !== 'active') && (
                            <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                                {[filterProgram, filterProfessor, filterStatus !== 'active'].filter(Boolean).length}
                            </span>
                        )}
                    </Button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="filter-program">Programa</Label>
                                <Select value={filterProgram} onValueChange={setFilterProgram}>
                                    <SelectTrigger id="filter-program">
                                        <SelectValue placeholder="Todos los programas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availablePrograms.map((program) => (
                                            <SelectItem key={program.id} value={program.id.toString()}>
                                                {program.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="filter-professor">Profesor</Label>
                                <Select value={filterProfessor} onValueChange={setFilterProfessor}>
                                    <SelectTrigger id="filter-professor">
                                        <SelectValue placeholder="Todos los profesores" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allProfessors.map((professor) => (
                                            <SelectItem key={professor.id} value={professor.id.toString()}>
                                                {professor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="filter-status">Estado</Label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger id="filter-status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Activo</SelectItem>
                                        <SelectItem value="inactive">Inactivo</SelectItem>
                                        <SelectItem value="completed">Completado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {(filterProgram || filterProfessor || filterStatus !== 'active') && (
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setFilterProgram('');
                                        setFilterProfessor('');
                                        setFilterStatus('active');
                                    }}
                                >
                                    Limpiar filtros
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Calendar View */}
                {schedules.length > 0 && viewMode === 'calendar' && (
                    <ScheduleCalendar
                        filters={{
                            program_id: filterProgram ? parseInt(filterProgram) : undefined,
                            professor_id: filterProfessor ? parseInt(filterProfessor) : undefined,
                            status: filterStatus || undefined,
                        }}
                        onEventClick={(scheduleId) => {
                            const schedule = schedules.find(s => s.id === scheduleId);
                            if (schedule) {
                                setSelectedSchedule(schedule);
                                setSheetOpen(true);
                            }
                        }}
                    />
                )}

                {/* Grid View (Original) */}
                {schedules.length > 0 && viewMode === 'grid' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header del calendario */}
                        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Vista Semanal - {currentWeek}</h2>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Grid del calendario */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="p-4 text-left text-sm font-semibold text-gray-600 w-24 sticky left-0 bg-gray-50 z-10">
                                            Hora
                                        </th>
                                        {diasSemana.map((dia) => (
                                            <th key={dia.key} className="p-4 text-center border-l border-gray-200">
                                                <div className="font-semibold text-gray-800">{dia.nombre}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {horasOrdenadas.length > 0 ? (
                                        horasOrdenadas.map((hora) => (
                                            <tr key={hora} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-700 align-top sticky left-0 bg-white z-10">
                                                    {hora}
                                                </td>
                                                {diasSemana.map((dia) => {
                                                    const horarioDelDia = horariosAgrupados[hora]?.filter((h) =>
                                                        h.days_of_week.toLowerCase().includes(dia.key.toLowerCase())
                                                    );

                                                    return (
                                                        <td
                                                            key={dia.key}
                                                            className="p-2 align-top border-l border-gray-200"
                                                        >
                                                            {horarioDelDia?.map((horario) => (
                                                                <div
                                                                    key={horario.id}
                                                                    onClick={(e) => handleScheduleClick(e, horario)}
                                                                    className={`${getOcupacionColor(
                                                                        horario.enrolled_count,
                                                                        horario.max_students
                                                                    )} text-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-2`}
                                                                >
                                                                    <div className="font-semibold text-sm mb-1">
                                                                        {horario.name}
                                                                    </div>
                                                                    <div className="text-xs opacity-90 mb-1">
                                                                        {horario.academic_program.name}
                                                                    </div>
                                                                    {horario.classroom && (
                                                                        <div className="text-xs opacity-90 mb-1">
                                                                            📍 {horario.classroom}
                                                                        </div>
                                                                    )}
                                                                    <div className="text-xs opacity-90">
                                                                        {horario.start_time} - {horario.end_time}
                                                                    </div>
                                                                    <div className="text-xs opacity-90 mt-1 font-semibold">
                                                                        {horario.enrolled_count}/{horario.max_students}{' '}
                                                                        estudiantes
                                                                    </div>
                                                                    {horario.professor && (
                                                                        <div className="text-xs opacity-90 mt-1">
                                                                            👨‍🏫 {horario.professor.name}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">
                                                No hay horarios programados
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {schedules.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">No hay horarios</h3>
                        <p className="mb-6 text-gray-600">Comienza agregando tu primer horario de clases</p>
                        <Link href="/horarios/create">
                            <Button>
                                <Plus className="mr-2 h-5 w-5" />
                                Crear Primer Horario
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Quick Actions Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Acciones Rápidas
                        </SheetTitle>
                        <SheetDescription>Gestiona el horario de forma rápida</SheetDescription>
                    </SheetHeader>

                    {selectedSchedule && (
                        <div className="mt-6 space-y-6">
                            {/* Información del Horario */}
                            <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                                <h3 className="font-bold text-lg">{selectedSchedule.name}</h3>
                                <p className="text-sm text-gray-600">{selectedSchedule.academic_program.name}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span>
                                        🕐 {selectedSchedule.start_time} - {selectedSchedule.end_time}
                                    </span>
                                    {selectedSchedule.classroom && <span>📍 {selectedSchedule.classroom}</span>}
                                </div>
                                <div className="text-sm font-medium">
                                    Ocupación: {selectedSchedule.enrolled_count}/{selectedSchedule.max_students}{' '}
                                    estudiantes
                                </div>
                            </div>

                            {/* Inscribir Estudiante */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-semibold">Inscribir Estudiante</h4>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="student">Selecciona un estudiante</Label>
                                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                        <SelectTrigger id="student">
                                            <SelectValue placeholder="Selecciona..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {allStudents.length === 0 ? (
                                                <div className="p-2 text-sm text-gray-500">
                                                    No hay estudiantes disponibles
                                                </div>
                                            ) : (
                                                allStudents.map((student) => (
                                                    <SelectItem key={student.id} value={student.id.toString()}>
                                                        {student.name} - {student.email}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={handleEnrollStudent}
                                        disabled={!selectedStudent || selectedSchedule.available_slots === 0}
                                        className="w-full"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Inscribir
                                    </Button>
                                    {selectedSchedule.available_slots === 0 && (
                                        <p className="text-sm text-red-600">No hay cupos disponibles</p>
                                    )}
                                </div>
                            </div>

                            {/* Asignar Profesor */}
                            <div className="space-y-3 border-t pt-4">
                                <div className="flex items-center gap-2">
                                    <UserCog className="h-5 w-5 text-purple-600" />
                                    <h4 className="font-semibold">Asignar Profesor</h4>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="professor">Selecciona un profesor</Label>
                                    <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
                                        <SelectTrigger id="professor">
                                            <SelectValue placeholder="Sin asignar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Sin asignar</SelectItem>
                                            {allProfessors.map((professor) => (
                                                <SelectItem key={professor.id} value={professor.id.toString()}>
                                                    {professor.name} - {professor.email}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleAssignProfessor} className="w-full" variant="secondary">
                                        <UserCog className="mr-2 h-4 w-4" />
                                        Asignar Profesor
                                    </Button>
                                </div>
                            </div>

                            {/* Otras Acciones */}
                            <div className="space-y-2 border-t pt-4">
                                <Link href={`/horarios/${selectedSchedule.id}`}>
                                    <Button variant="outline" className="w-full">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Ver Detalle Completo
                                    </Button>
                                </Link>
                                <Link href={`/horarios/${selectedSchedule.id}/edit`}>
                                    <Button variant="outline" className="w-full">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar Horario
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </AppLayout>
    );
}

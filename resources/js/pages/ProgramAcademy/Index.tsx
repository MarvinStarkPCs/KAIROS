import { Head, Link, router } from '@inertiajs/react';
import { GraduationCap, Users, Clock, Plus, Edit, Trash2, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProgramAcademyController from '@/actions/App/Http/Controllers/program_academy';
import AppLayout from '@/layouts/app-layout';

import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Program {
    id: number;
    name: string;
    description: string | null;
    duration_months: number;
    status: 'active' | 'inactive';
    color: string;
    active_students_count: number;
    schedules_count: number;
    active_schedules_count: number;
    created_at: string;
}

interface Stats {
    total_programs: number;
    active_programs: number;
    total_students: number;
    total_professors: number;
}

interface ProgramasAcademicosProps {
    programs: Program[];
    stats: Stats;
}

export default function ProgramasAcademicos({ programs, stats }: ProgramasAcademicosProps) {
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; programId: number | null }>({
        open: false,
        programId: null,
    });

    const handleDelete = () => {
        if (deleteDialog.programId) {
            router.delete(ProgramAcademyController.destroy({ program: deleteDialog.programId }).url, {
                onSuccess: () => {
                    setDeleteDialog({ open: false, programId: null });
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Programas Académicos" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Programas Académicos</h1>
                        <p className="mt-2 text-gray-600">Gestiona los programas y cursos de la academia</p>
                    </div>
                    <Link href={ProgramAcademyController.create().url}>
                        <Button className="flex items-center space-x-2">
                            <Plus className="h-5 w-5" />
                            <span>Nuevo Programa</span>
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Programas</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total_programs}</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3">
                                <GraduationCap className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Programas Activos</p>
                                <p className="text-3xl font-bold text-green-600">{stats.active_programs}</p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.total_students}</p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Profesores</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.total_professors}</p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-3">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Programs Grid */}
                {programs.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {programs.map((program) => (
                            <div
                                key={program.id}
                                className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg"
                            >
                                {/* Header */}
                                <div className="mb-4 flex items-start justify-between">
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-lg border-2"
                                        style={{
                                            backgroundColor: `${program.color}20`,
                                            borderColor: program.color,
                                        }}
                                    >
                                        <GraduationCap className="h-6 w-6" style={{ color: program.color }} />
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                            program.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {program.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>

                                {/* Content */}
                                <h3 className="mb-2 text-xl font-bold text-gray-900">{program.name}</h3>
                                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                                    {program.description || 'Sin descripción'}
                                </p>

                                {/* Info */}
                                <div className="mb-4 space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="mr-2 h-4 w-4" />
                                        <span>{program.duration_months} meses</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Users className="mr-2 h-4 w-4" />
                                        <span>{program.active_students_count} estudiantes</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        <span>{program.active_schedules_count} horarios activos</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 border-t border-gray-200 pt-4">
                                    <Link href={ProgramAcademyController.show({ program: program.id }).url}>
                                        <Button size="sm" className="w-full">
                                            Ver Plan de Estudios
                                        </Button>
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={ProgramAcademyController.edit({ program: program.id }).url}
                                            className="flex-1"
                                        >
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Edit className="mr-1 h-4 w-4" />
                                                Editar
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() =>
                                                setDeleteDialog({ open: true, programId: program.id })
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <GraduationCap className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">
                            No hay programas académicos
                        </h3>
                        <p className="mb-6 text-gray-600">
                            Comienza agregando tu primer programa académico
                        </p>
                        <Link href={ProgramAcademyController.create().url}>
                            <Button>
                                <Plus className="mr-2 h-5 w-5" />
                                Crear Primer Programa
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el programa académico.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
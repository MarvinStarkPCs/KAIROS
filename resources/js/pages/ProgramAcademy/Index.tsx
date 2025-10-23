import { Head } from '@inertiajs/react';
import { Music, Users, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/app-header';

interface Program {
    id: number;
    name: string;
    description: string;
    duration: string;
    icon: string;
}

interface ProgramasAcademicosProps {
    programs: Program[];
}

export default function ProgramasAcademicos({ programs = [] }: ProgramasAcademicosProps) {
    // Datos de ejemplo - reemplazar con props reales
    const examplePrograms = programs.length > 0 ? programs : [
        {
            id: 1,
            name: 'Piano',
            description: 'Clases personalizadas desde nivel principiante hasta avanzado.',
            duration: 'Desde 1 hora/semana',
            icon: 'music'
        },
        {
            id: 2,
            name: 'Guitarra',
            description: 'Aprende guitarra clásica, acústica o eléctrica con expertos.',
            duration: 'Desde 1 hora/semana',
            icon: 'music'
        },
        {
            id: 3,
            name: 'Canto',
            description: 'Técnica vocal, repertorio y preparación escénica.',
            duration: 'Desde 1 hora/semana',
            icon: 'music'
        },
        {
            id: 4,
            name: 'Clases Grupales',
            description: 'Ensambles, coros y talleres de música en grupo.',
            duration: 'Consultar horarios',
            icon: 'users'
        }
    ];

    const getIcon = (iconType: string) => {
        switch (iconType) {
            case 'users':
                return Users;
            case 'music':
            default:
                return Music;
        }
    };

    return (
        <>
            <Head title="Programas Académicos - Academia Linaje" />
            
            <AppHeader />

            <div className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    {/* Header Section */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Programas Académicos
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Gestiona los programas y cursos de la academia
                            </p>
                        </div>
                        <Button
                            className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-amber-700 to-amber-900 px-6 py-3 font-semibold text-white shadow-lg hover:from-amber-800 hover:to-amber-950 transition-all"
                            onClick={() => {
                                // Aquí iría la lógica para abrir el modal o navegar a crear
                                console.log('Crear nuevo programa');
                            }}
                        >
                            <Plus className="h-5 w-5" />
                            <span>Nuevo Programa</span>
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-8 grid gap-6 md:grid-cols-4">
                        <div className="rounded-xl bg-white p-6 shadow-md border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Programas</p>
                                    <p className="text-3xl font-bold text-gray-900">{examplePrograms.length}</p>
                                </div>
                                <div className="rounded-full bg-amber-100 p-3">
                                    <Music className="h-6 w-6 text-amber-800" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-xl bg-white p-6 shadow-md border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Activos</p>
                                    <p className="text-3xl font-bold text-green-600">{examplePrograms.length}</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <Clock className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-md border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                                    <p className="text-3xl font-bold text-blue-600">324</p>
                                </div>
                                <div className="rounded-full bg-blue-100 p-3">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-md border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Profesores</p>
                                    <p className="text-3xl font-bold text-purple-600">18</p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Programs Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {examplePrograms.map((program) => {
                            const Icon = getIcon(program.icon);
                            return (
                                <div
                                    key={program.id}
                                    className="group rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-amber-300 hover:shadow-xl"
                                >
                                    {/* Icon */}
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                                        <Icon className="h-7 w-7" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="mb-2 text-xl font-bold text-gray-900">
                                        {program.name}
                                    </h3>
                                    <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                                        {program.description}
                                    </p>

                                    {/* Duration */}
                                    <div className="mb-4 flex items-center text-xs font-medium text-amber-800">
                                        <Clock className="mr-1 h-4 w-4" />
                                        {program.duration}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                            onClick={() => {
                                                console.log('Editar programa', program.id);
                                            }}
                                        >
                                            <Edit className="mr-1 h-4 w-4" />
                                            Editar
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => {
                                                console.log('Eliminar programa', program.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add New Card */}
                        <button
                            onClick={() => {
                                console.log('Crear nuevo programa');
                            }}
                            className="group flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-all hover:border-amber-400 hover:bg-amber-50"
                        >
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800 group-hover:bg-amber-200">
                                <Plus className="h-7 w-7" />
                            </div>
                            <p className="text-lg font-semibold text-gray-700 group-hover:text-amber-900">
                                Agregar Programa
                            </p>
                            <p className="mt-2 text-sm text-gray-500">
                                Crea un nuevo programa académico
                            </p>
                        </button>
                    </div>

                    {/* Empty State (mostrar si no hay programas) */}
                    {examplePrograms.length === 0 && (
                        <div className="rounded-xl bg-white p-12 text-center shadow-md">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Music className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                No hay programas académicos
                            </h3>
                            <p className="mb-6 text-gray-600">
                                Comienza agregando tu primer programa académico
                            </p>
                            <Button
                                className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-amber-700 to-amber-900 px-6 py-3 font-semibold text-white shadow-lg hover:from-amber-800 hover:to-amber-950"
                                onClick={() => {
                                    console.log('Crear primer programa');
                                }}
                            >
                                <Plus className="h-5 w-5" />
                                <span>Crear Primer Programa</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
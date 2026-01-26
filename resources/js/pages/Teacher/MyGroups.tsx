import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, MapPin, Calendar } from 'lucide-react';
import { Icon } from '@/components/icon';

interface Program {
    id: number;
    name: string;
    color: string;
}

interface Group {
    id: number;
    program: Program;
    days_of_week: string;
    start_time: string;
    end_time: string;
    classroom: string | null;
    total_students: number;
}

interface Props {
    groups: Group[];
}

export default function MyGroups({ groups }: Props) {
    // Función para formatear los días de la semana
    const formatDays = (daysStr: string) => {
        if (!daysStr) return 'Sin días asignados';

        const dayMap: Record<string, string> = {
            'lunes': 'Lun',
            'martes': 'Mar',
            'miércoles': 'Mié',
            'miercoles': 'Mié',
            'jueves': 'Jue',
            'viernes': 'Vie',
            'sábado': 'Sáb',
            'sabado': 'Sáb',
            'domingo': 'Dom',
        };

        const days = daysStr.split(',').map(d => d.trim().toLowerCase());
        return days.map(d => dayMap[d] || d).join(', ');
    };

    // Función para obtener los días completos
    const getFullDayNames = (daysStr: string) => {
        if (!daysStr) return [];

        const dayMap: Record<string, string> = {
            'lunes': 'Lunes',
            'martes': 'Martes',
            'miércoles': 'Miércoles',
            'miercoles': 'Miércoles',
            'jueves': 'Jueves',
            'viernes': 'Viernes',
            'sábado': 'Sábado',
            'sabado': 'Sábado',
            'domingo': 'Domingo',
        };

        const days = daysStr.split(',').map(d => d.trim().toLowerCase());
        return days.map(d => dayMap[d] || d);
    };

    return (
        <AppLayout
            variant="sidebar"
            title="Mis Grupos - Portal Profesor"
        >
            <Head title="Mis Grupos - Portal Profesor" />

            <div className="px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Grupos</h1>
                    <p className="text-gray-600">
                        Administra la asistencia y evaluaciones de tus grupos asignados
                    </p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total de Grupos</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{groups.length}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Icon iconNode={Users} className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total de Estudiantes</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {groups.reduce((sum, g) => sum + g.total_students, 0)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <Icon iconNode={Users} className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Programas Diferentes</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {new Set(groups.map(g => g.program.id)).size}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Icon iconNode={Calendar} className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Groups List */}
                {groups.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Icon iconNode={Users} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No tienes grupos asignados
                            </h3>
                            <p className="text-gray-600">
                                Contacta al administrador para que te asigne grupos
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {groups.map((group) => (
                            <Card key={group.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl mb-2">
                                                {group.program.name}
                                            </CardTitle>
                                            <div className="flex flex-wrap gap-1">
                                                {getFullDayNames(group.days_of_week).map((day, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        style={{ backgroundColor: group.program.color }}
                                                        className="text-white"
                                                    >
                                                        {day}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">
                                                {group.total_students}
                                            </div>
                                            <div className="text-sm text-gray-600">estudiantes</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center text-gray-700">
                                            <Icon iconNode={Calendar} className="w-4 h-4 mr-2 text-gray-500" />
                                            <span className="text-sm font-medium">
                                                {formatDays(group.days_of_week)}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-700">
                                            <Icon iconNode={Clock} className="w-4 h-4 mr-2 text-gray-500" />
                                            <span className="text-sm">
                                                {group.start_time} - {group.end_time}
                                            </span>
                                        </div>
                                        {group.classroom && (
                                            <div className="flex items-center text-gray-700">
                                                <Icon iconNode={MapPin} className="w-4 h-4 mr-2 text-gray-500" />
                                                <span className="text-sm">{group.classroom}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Link href={`/profesor/grupo/${group.id}`}>
                                        <Button className="w-full bg-[#7a9b3c] hover:bg-[#6a8a2c]">
                                            Ver Detalles
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

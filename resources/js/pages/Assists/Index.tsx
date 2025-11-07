import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import {
    Check,
    X,
    Clock,
    TrendingUp,
    Download,
    Edit,
    MessageSquare,
    Phone,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { PageProps } from '@/types';

interface Asistencia {
    id: number;
    hora: string;
    estudiante: {
        nombre: string;
        nivel: string;
        avatar?: string;
    };
    clase: string;
    tipoClase: string;
    profesor: {
        nombre: string;
        avatar?: string;
    };
    estado: 'presente' | 'ausente' | 'tardanza';
    horaLlegada?: string;
    acciones: string[];
}

interface Alerta {
    id: number;
    estudiante: {
        nombre: string;
        clase: string;
        avatar?: string;
    };
    tipo: 'critico' | 'atencion' | 'seguimiento';
    mensaje: string;
    acciones: string[];
}

interface Props extends PageProps {
    asistenciaHoy: {
        total: number;
        presentes: number;
        porcentaje: string;
    };
    ausencias: number;
    tardanzas: number;
    promedioMensual: string;
    asistencias: Asistencia[];
    alertas: Alerta[];
}

export default function ControlAsistencia({
    asistenciaHoy = { total: 26, presentes: 24, porcentaje: '92.3%' },
    ausencias = 2,
    tardanzas = 5,
    promedioMensual = '94.5%',
    asistencias = [],
    alertas = []
}: Props) {

    // Datos de ejemplo
    const asistenciasEjemplo: Asistencia[] = asistencias.length > 0 ? asistencias : [
        {
            id: 1,
            hora: '09:00 AM',
            estudiante: {
                nombre: 'Carlos Mendoza',
                nivel: 'Nivel: Intermedio',
                avatar: undefined
            },
            clase: 'Piano Individual',
            tipoClase: 'piano',
            profesor: {
                nombre: 'Ana García',
                avatar: undefined
            },
            estado: 'presente',
            horaLlegada: '08:59 AM',
            acciones: ['editar', 'contactar']
        },
        {
            id: 2,
            hora: '10:00 AM',
            estudiante: {
                nombre: 'Sofía Ramírez',
                nivel: 'Nivel: Principiante',
                avatar: undefined
            },
            clase: 'Guitarra Individual',
            tipoClase: 'guitarra',
            profesor: {
                nombre: 'Miguel Torres',
                avatar: undefined
            },
            estado: 'tardanza',
            horaLlegada: '10:15 AM',
            acciones: ['editar', 'alerta']
        },
        {
            id: 3,
            hora: '11:00 AM',
            estudiante: {
                nombre: 'Diego Herrera',
                nivel: 'Nivel: Avanzado',
                avatar: undefined
            },
            clase: 'Batería Individual',
            tipoClase: 'bateria',
            profesor: {
                nombre: 'Roberto Silva',
                avatar: undefined
            },
            estado: 'ausente',
            acciones: ['llamar', 'contactar']
        }
    ];

    const alertasEjemplo: Alerta[] = alertas.length > 0 ? alertas : [
        {
            id: 1,
            estudiante: {
                nombre: 'Diego Herrera',
                clase: 'Batería - Roberto Silva',
                avatar: undefined
            },
            tipo: 'critico',
            mensaje: '3 ausencias consecutivas sin justificar',
            acciones: ['contactar', 'historial']
        },
        {
            id: 2,
            estudiante: {
                nombre: 'Ana Martínez',
                clase: 'Piano - Carmen López',
                avatar: undefined
            },
            tipo: 'atencion',
            mensaje: 'Patrón de llegar tarde frecuente',
            acciones: ['padre', 'horario']
        },
        {
            id: 3,
            estudiante: {
                nombre: 'Pedro González',
                clase: 'Canto - Luis Morales',
                avatar: undefined
            },
            tipo: 'seguimiento',
            mensaje: 'Mejoría notable en asistencia',
            acciones: ['felicitar', 'seguimiento']
        }
    ];

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'presente':
                return { bg: 'bg-green-100', text: 'text-green-700', icon: Check, label: 'Presente' };
            case 'ausente':
                return { bg: 'bg-red-100', text: 'text-red-700', icon: X, label: 'Ausente' };
            case 'tardanza':
                return { bg: 'bg-orange-100', text: 'text-orange-700', icon: Clock, label: 'Tardanza' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: 'Pendiente' };
        }
    };

    const getAlertaTipo = (tipo: string) => {
        switch (tipo) {
            case 'critico':
                return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' };
            case 'atencion':
                return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' };
            case 'seguimiento':
                return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' };
            default:
                return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-800' };
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <AppLayout>
            <Head title="Control de Asistencia" />

            <Heading
                title="Control de Asistencia"
                description="Registro y seguimiento de asistencia estudiantil"
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Asistencia Hoy */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">Asistencia Hoy</span>
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            {asistenciaHoy.presentes}/{asistenciaHoy.total}
                        </div>
                        <div className="text-xs text-green-600 font-medium mb-2">
                            {asistenciaHoy.porcentaje} de asistencia
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-green-500 h-full rounded-full transition-all duration-500"
                                style={{ width: asistenciaHoy.porcentaje }}
                            ></div>
                        </div>
                    </div>

                {/* Ausencias */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">Ausencias</span>
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{ausencias}</div>
                    <div className="text-xs text-gray-500">Sin justificar</div>
                    <div className="text-xs text-gray-400 mt-1">Hoy</div>
                </div>

                {/* Tardanzas */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">Tardanzas</span>
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{tardanzas}</div>
                    <div className="text-xs text-gray-500">Hoy</div>
                    <div className="text-xs text-gray-400 mt-1">Estudiantes</div>
                </div>

                {/* Promedio Mensual */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">Promedio Mensual</span>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{promedioMensual}</div>
                    <div className="text-xs text-green-600 font-medium">Excelente</div>
                    <div className="text-xs text-gray-400 mt-1">Este mes</div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 mb-6 flex-wrap">
                <Button className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exportar Reporte
                </Button>
            </div>

            {/* Tabla de Asistencia */}
            <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Asistencia del Día</h2>
                    <div className="flex gap-2 items-center">
                        <select
                            aria-label="Filtrar clases"
                            title="Filtrar clases"
                            className="px-3 py-1.5 bg-gray-700 rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-white"
                            value="todas"
                        >
                            <option value="todas">Todas las clases</option>
                            <option value="presente">Presentes</option>
                            <option value="ausente">Ausentes</option>
                            <option value="tardanza">Tardanzas</option>
                        </select>
                        <Button
                            size="sm"
                            variant="secondary"
                        >
                            Exportar
                        </Button>
                    </div>
                </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Estudiante
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Clase
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Profesor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Hora Llegada
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {asistenciasEjemplo.map((asistencia) => {
                                    const estadoBadge = getEstadoBadge(asistencia.estado);
                                    const EstadoIcon = estadoBadge.icon;
                                    
                                    return (
                                        <tr key={asistencia.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {asistencia.hora}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Avatar className="h-9 w-9 mr-3">
                                                        <AvatarImage src={asistencia.estudiante.avatar} />
                                                        <AvatarFallback className="bg-[#7a9b3c] text-white text-xs">
                                                            {getInitials(asistencia.estudiante.nombre)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {asistencia.estudiante.nombre}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {asistencia.estudiante.nivel}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                                        asistencia.tipoClase === 'piano' ? 'bg-yellow-500' :
                                                        asistencia.tipoClase === 'guitarra' ? 'bg-amber-500' :
                                                        'bg-green-500'
                                                    }`}></span>
                                                    <span className="text-sm text-gray-900">{asistencia.clase}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Avatar className="h-7 w-7 mr-2">
                                                        <AvatarImage src={asistencia.profesor.avatar} />
                                                        <AvatarFallback className="bg-gray-400 text-white text-xs">
                                                            {getInitials(asistencia.profesor.nombre)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm text-gray-900">{asistencia.profesor.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${estadoBadge.bg} ${estadoBadge.text}`}>
                                                    <EstadoIcon className="w-3 h-3 mr-1" />
                                                    {estadoBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {asistencia.horaLlegada || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="w-4 h-4 text-blue-600" />
                                                    </Button>
                                                    {asistencia.estado === 'ausente' && (
                                                        <>
                                                            <Button size="sm" variant="ghost">
                                                                <Phone className="w-4 h-4 text-red-600" />
                                                            </Button>
                                                            <Button size="sm" variant="ghost">
                                                                <MessageSquare className="w-4 h-4 text-green-600" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {asistencia.estado === 'tardanza' && (
                                                        <Button size="sm" variant="ghost">
                                                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            {/* Sección inferior */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tendencia de Asistencia Semanal */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Tendencia de Asistencia Semanal</h3>
                    </div>
                    <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        Gráfico de tendencia semanal
                    </div>
                </div>

                {/* Estudiantes con Alertas */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Estudiantes con Alertas</h3>
                    </div>
                        <div className="space-y-3">
                            {alertasEjemplo.map((alerta) => {
                                const alertaTipo = getAlertaTipo(alerta.tipo);
                                
                                return (
                                    <div 
                                        key={alerta.id} 
                                        className={`rounded-lg p-4 border ${alertaTipo.bg} ${alertaTipo.border}`}
                                    >
                                        <div className="flex items-start gap-3 mb-2">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={alerta.estudiante.avatar} />
                                                <AvatarFallback className="bg-gray-400 text-white text-xs">
                                                    {getInitials(alerta.estudiante.nombre)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{alerta.estudiante.nombre}</h4>
                                                        <p className="text-xs text-gray-600">{alerta.estudiante.clase}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${alertaTipo.badge}`}>
                                                        {alerta.tipo.charAt(0).toUpperCase() + alerta.tipo.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 mt-2">{alerta.mensaje}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3">
                                            {alerta.tipo === 'critico' && (
                                                <>
                                                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs">
                                                        Contactar
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-xs">
                                                        Ver historial
                                                    </Button>
                                                </>
                                            )}
                                            {alerta.tipo === 'atencion' && (
                                                <>
                                                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-xs">
                                                        Hablar con padres
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-xs">
                                                        Ajustar horario
                                                    </Button>
                                                </>
                                            )}
                                            {alerta.tipo === 'seguimiento' && (
                                                <>
                                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
                                                        Felicitar
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-xs">
                                                        Continuar seguimiento
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
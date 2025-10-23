import { AppHeader } from '@/components/app-header';
import { type BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    Calendar, 
    Copy, 
    X, 
    ChevronLeft, 
    ChevronRight, 
    Filter, 
    Clock,
    Plus
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';

interface Evento {
    id: number;
    dia: string;
    nombre: string;
    detalle: string;
    subtitulo?: string;
    tipo?: string;
    color: string;
}

interface FilaHorario {
    hora: string;
    eventos: Evento[];
}

interface Reagendamiento {
    id: number;
    nombre: string;
    detalle: string;
    estado: string;
    colorEstado: string;
}

interface Estadistica {
    dia: string;
    ocupados: number;
    total: number;
    porcentaje: number;
    color: string;
}

interface Props {
    clases: FilaHorario[];
    reagendamientos: Reagendamiento[];
    estadisticas: Estadistica[];
    semanaActual?: string;
}

export default function HorariosGestion({ 
    clases = [], 
    reagendamientos = [], 
    estadisticas = [],
    semanaActual = '16 - 22 Septiembre 2024'
}: Props) {
    const [selectedDate, setSelectedDate] = useState('2024-09-16');
    const [currentWeek] = useState(semanaActual);
    const [selectedProfesor, setSelectedProfesor] = useState('all');
    const [selectedInstrumento, setSelectedInstrumento] = useState('all');
    const [selectedTipo, setSelectedTipo] = useState('all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Horarios', href: '/horarios' },
    ];

    const diasSemana = [
        { nombre: 'Lunes', fecha: '16 Sep' },
        { nombre: 'Martes', fecha: '17 Sep' },
        { nombre: 'Miércoles', fecha: '18 Sep' },
        { nombre: 'Jueves', fecha: '19 Sep' },
        { nombre: 'Viernes', fecha: '20 Sep' },
        { nombre: 'Sábado', fecha: '21 Sep' },
    ];

    // Datos de ejemplo
    const clasesEjemplo: FilaHorario[] = clases.length > 0 ? clases : [
        {
            hora: '09:00',
            eventos: [
                { id: 1, dia: 'Lunes', nombre: 'Carlos M.', detalle: 'Piano - Ana G.', tipo: 'Individual', color: 'bg-green-600' },
                { id: 2, dia: 'Miércoles', nombre: 'Sofía R.', detalle: 'Guitarra - Miguel T.', tipo: 'Individual', color: 'bg-blue-500' },
                { id: 3, dia: 'Viernes', nombre: 'Diego H.', detalle: 'Batería - Roberto S.', tipo: 'Individual', color: 'bg-purple-500' },
                { id: 4, dia: 'Sábado', nombre: 'Grupo Piano', detalle: '4 estudiantes', subtitulo: 'Ana G.', color: 'bg-orange-500' },
            ]
        },
        {
            hora: '10:00',
            eventos: [
                { id: 5, dia: 'Martes', nombre: 'Laura P.', detalle: 'Violín - Carmen L.', tipo: 'Individual', color: 'bg-emerald-500' },
                { id: 6, dia: 'Jueves', nombre: 'Masterclass', detalle: 'Canto - Luis M.', subtitulo: '8 estudiantes', color: 'bg-red-500' },
                { id: 7, dia: 'Sábado', nombre: 'Andrea M.', detalle: 'Piano - Ana G.', tipo: 'Individual', color: 'bg-indigo-500' },
            ]
        },
        {
            hora: '11:00',
            eventos: [
                { id: 8, dia: 'Lunes', nombre: 'Grupo Guitarra', detalle: '3 estudiantes', subtitulo: 'Miguel T.', color: 'bg-teal-500' },
                { id: 9, dia: 'Miércoles', nombre: 'María S.', detalle: 'Canto - Luis M.', tipo: 'Individual', color: 'bg-pink-500' },
                { id: 10, dia: 'Viernes', nombre: 'Roberto C.', detalle: 'Batería - Roberto S.', tipo: 'Individual', color: 'bg-orange-600' },
            ]
        }
    ];

    const reagendamientosEjemplo: Reagendamiento[] = reagendamientos.length > 0 ? reagendamientos : [
        {
            id: 1,
            nombre: 'Carlos Mendoza - Piano',
            detalle: 'Clase cancelada: Lunes 16 Sep, 9:00 AM',
            estado: 'Pendiente',
            colorEstado: 'bg-yellow-100 text-yellow-800'
        },
        {
            id: 2,
            nombre: 'Sofía Ramírez - Guitarra',
            detalle: 'Solicitud: Cambio de horario permanente',
            estado: 'Revisión',
            colorEstado: 'bg-blue-100 text-blue-800'
        }
    ];

    const estadisticasEjemplo: Estadistica[] = estadisticas.length > 0 ? estadisticas : [
        { dia: 'Lunes', ocupados: 8, total: 10, porcentaje: 80, color: 'bg-green-500' },
        { dia: 'Martes', ocupados: 6, total: 10, porcentaje: 60, color: 'bg-blue-500' },
        { dia: 'Sábado', ocupados: 12, total: 12, porcentaje: 100, color: 'bg-orange-500' },
    ];

    const handleFiltrar = () => {
        console.log('Filtrar', { selectedProfesor, selectedInstrumento, selectedTipo, selectedDate });
    };

    const handleLimpiar = () => {
        setSelectedProfesor('all');
        setSelectedInstrumento('all');
        setSelectedTipo('all');
        setSelectedDate('2024-09-16');
    };

    return (
        <>
            <AppHeader breadcrumbs={breadcrumbs} />

            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Horarios</h1>
                    <p className="text-gray-600">Programación de clases individuales y grupales</p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 mb-6 flex-wrap">
                    <Link href="/horarios/crear">
                        <Button className="flex items-center gap-2 bg-[#7a9b3c] hover:bg-[#6a8a2c]">
                            <Icon iconNode={Plus} className="w-4 h-4" />
                            Nueva Clase
                        </Button>
                    </Link>
                    <Button 
                        variant="outline"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    >
                        <Icon iconNode={Copy} className="w-4 h-4" />
                        Duplicar Semana
                    </Button>
                    <Link href="/horarios/semanal">
                        <Button 
                            variant="outline"
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                        >
                            <Icon iconNode={Calendar} className="w-4 h-4" />
                            Vista Semanal
                        </Button>
                    </Link>
                </div>

                {/* Filtros */}
                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select 
                            aria-label="Filtrar por profesor"
                            title="Filtrar por profesor"
                            value={selectedProfesor}
                            onChange={(e) => setSelectedProfesor(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#7a9b3c]"
                        >
                            <option value="all">Todos los profesores</option>
                            <option value="ana">Ana G.</option>
                            <option value="miguel">Miguel T.</option>
                            <option value="roberto">Roberto S.</option>
                        </select>
                        <select 
                            aria-label="Filtrar por instrumento"
                            title="Filtrar por instrumento"
                            value={selectedInstrumento}
                            onChange={(e) => setSelectedInstrumento(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#7a9b3c]"
                        >
                            <option value="all">Todos los instrumentos</option>
                            <option value="piano">Piano</option>
                            <option value="guitarra">Guitarra</option>
                            <option value="bateria">Batería</option>
                        </select>
                        <select 
                            aria-label="Filtrar por tipo de clase"
                            title="Filtrar por tipo de clase"
                            value={selectedTipo}
                            onChange={(e) => setSelectedTipo(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#7a9b3c]"
                        >
                            <option value="all">Tipo de clase</option>
                            <option value="individual">Individual</option>
                            <option value="grupal">Grupal</option>
                        </select>
                        <input 
                            type="date" 
                            aria-label="Fecha"
                            title="Fecha"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#7a9b3c]"
                        />
                    </div>
                    <div className="flex gap-2 mt-3">
                        <Button 
                            onClick={handleFiltrar}
                            className="flex items-center gap-2 bg-[#7a9b3c] hover:bg-[#6a8a2c]"
                        >
                            <Icon iconNode={Filter} className="w-4 h-4" />
                        </Button>
                        <Button 
                            onClick={handleLimpiar}
                            variant="outline"
                            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white border-gray-600"
                        >
                            <Icon iconNode={X} className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Calendario Semanal */}
                <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
                    {/* Header del calendario */}
                    <div className="bg-[#6b5544] text-white p-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Semana del {currentWeek}</h2>
                        <div className="flex gap-2">
                            <Button 
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-[#5a4433]"
                            >
                                <Icon iconNode={ChevronLeft} className="w-5 h-5" />
                            </Button>
                            <span className="px-4 py-2 bg-[#5a4433] rounded-lg">Septiembre 2024</span>
                            <Button 
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-[#5a4433]"
                            >
                                <Icon iconNode={ChevronRight} className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Grid del calendario */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600 w-24">Hora</th>
                                    {diasSemana.map((dia) => (
                                        <th key={dia.nombre} className="p-4 text-center">
                                            <div className="font-semibold text-gray-800">{dia.nombre}</div>
                                            <div className="text-sm text-gray-500">{dia.fecha}</div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {clasesEjemplo.map((fila, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-700 align-top">{fila.hora}</td>
                                        {diasSemana.map((dia) => {
                                            const evento = fila.eventos.find(e => e.dia === dia.nombre);
                                            return (
                                                <td key={dia.nombre} className="p-2 align-top">
                                                    {evento && (
                                                        <div className={`${evento.color} text-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
                                                            <div className="font-semibold text-sm mb-1">{evento.nombre}</div>
                                                            <div className="text-xs opacity-90">{evento.detalle}</div>
                                                            {evento.subtitulo && (
                                                                <div className="text-xs opacity-90 mt-1">{evento.subtitulo}</div>
                                                            )}
                                                            {evento.tipo && (
                                                                <div className="text-xs opacity-75 mt-1">{evento.tipo}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sección inferior con reagendamientos y estadísticas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Reagendamiento de Clases */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Icon iconNode={Clock} className="w-5 h-5 text-[#7a9b3c]" />
                            <h3 className="text-lg font-semibold text-gray-800">Reagendamiento de Clases</h3>
                        </div>
                        <div className="space-y-3">
                            {reagendamientosEjemplo.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-[#7a9b3c] transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-gray-800">{item.nombre}</h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.colorEstado}`}>
                                            {item.estado}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-3">{item.detalle}</p>
                                    <div className="flex gap-2">
                                        {item.id === 1 ? (
                                            <>
                                                <Button size="sm" className="bg-[#7a9b3c] hover:bg-[#6a8a2c]">
                                                    Reagendar
                                                </Button>
                                                <Button size="sm" variant="outline">
                                                    Notificar
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                    Aprobar
                                                </Button>
                                                <Button size="sm" className="bg-red-500 hover:bg-red-600">
                                                    Rechazar
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Estadísticas de Ocupación */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Icon iconNode={Clock} className="w-5 h-5 text-[#7a9b3c]" />
                            <h3 className="text-lg font-semibold text-gray-800">Estadísticas de Ocupación</h3>
                        </div>
                        <div className="space-y-4">
                            {estadisticasEjemplo.map((stat, idx) => (
                                <div key={idx} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-800">{stat.dia}</h4>
                                        <span className="text-2xl font-bold text-gray-800">{stat.porcentaje}%</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{stat.ocupados} de {stat.total} horarios</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className={`${stat.color} h-full rounded-full transition-all duration-500`}
                                            style={{ width: `${stat.porcentaje}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
           
            </div>
        </>
    );
}

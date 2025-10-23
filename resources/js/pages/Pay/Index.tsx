import { AppHeader } from '@/components/app-header';
import { Head } from '@inertiajs/react';
import { 
    DollarSign,
    AlertCircle,
    CreditCard,
    Plus,
    Link2,
    Receipt,
    Download,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type BreadcrumbItem } from '@/types';

interface MetodoPago {
    nombre: string;
    porcentaje: number;
    icon: string;
}

interface PasarelaIntegrada {
    nombre: string;
    logo: string;
    estado: 'activo' | 'configurar';
    color: string;
}

interface Transaccion {
    id: number;
    fecha: string;
    hora: string;
    estudiante: {
        nombre: string;
        tipo: string;
        avatar?: string;
    };
    concepto: string;
    metodo: string;
    metodoBadge: string;
    monto: number;
    estado: 'completado' | 'pendiente' | 'rechazado';
    acciones: string[];
}

interface Props {
    ingresosMes: {
        total: number;
        cambio: string;
        porcentaje: number;
        objetivo: number;
    };
    pagosPendientes: {
        total: number;
        estudiantes: number;
        vencidos: number;
        porVencer: number;
    };
    metodosPago: MetodoPago[];
    transacciones: Transaccion[];
}

export default function GestionPagos({ 
    ingresosMes = {
        total: 45280,
        cambio: '+8.2% vs mes anterior',
        porcentaje: 70,
        objetivo: 64000
    },
    pagosPendientes = {
        total: 12450,
        estudiantes: 23,
        vencidos: 4200,
        porVencer: 8250
    },
    metodosPago = [],
    transacciones = []
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pagos', href: '/pagos' },
    ];

    const metodosEjemplo: MetodoPago[] = metodosPago.length > 0 ? metodosPago : [
        { nombre: 'Tarjeta', porcentaje: 65, icon: 'card' },
        { nombre: 'Transferencia', porcentaje: 25, icon: 'transfer' },
        { nombre: 'Efectivo', porcentaje: 10, icon: 'cash' }
    ];

    const pasarelas: PasarelaIntegrada[] = [
        { nombre: 'Stripe', logo: 'stripe', estado: 'activo', color: 'bg-purple-600' },
        { nombre: 'PayPal', logo: 'paypal', estado: 'activo', color: 'bg-blue-600' },
        { nombre: 'PayU', logo: 'payu', estado: 'activo', color: 'bg-green-600' },
        { nombre: 'Wompi', logo: 'wompi', estado: 'configurar', color: 'bg-orange-600' },
    ];

    const transaccionesEjemplo: Transaccion[] = transacciones.length > 0 ? transacciones : [
        {
            id: 1,
            fecha: '16 Sep 2024',
            hora: '10:35 AM',
            estudiante: {
                nombre: 'Carlos Mendoza',
                tipo: 'Piano',
                avatar: undefined
            },
            concepto: 'Mensualidad Septiembre',
            metodo: 'Visa',
            metodoBadge: 'Visa ****4532',
            monto: 180.00,
            estado: 'completado',
            acciones: ['recibo', 'contactar']
        },
        {
            id: 2,
            fecha: '15 Sep 2024',
            hora: '3:45 PM',
            estudiante: {
                nombre: 'Sofía Ramírez',
                tipo: 'Guitarra',
                avatar: undefined
            },
            concepto: 'Inscripción',
            metodo: 'PayPal',
            metodoBadge: 'PayPal',
            monto: 50.00,
            estado: 'completado',
            acciones: ['recibo', 'contactar']
        },
        {
            id: 3,
            fecha: '14 Sep 2024',
            hora: '11:20 AM',
            estudiante: {
                nombre: 'Diego Herrera',
                tipo: 'Batería',
                avatar: undefined
            },
            concepto: 'Mensualidad Septiembre',
            metodo: 'Transferencia',
            metodoBadge: 'Transferencia',
            monto: 200.00,
            estado: 'pendiente',
            acciones: ['alerta', 'contactar']
        }
    ];

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'completado':
                return { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' };
            case 'pendiente':
                return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' };
            case 'rechazado':
                return { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazado' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Desconocido' };
        }
    };

    const getMetodoIcon = (metodo: string) => {
        if (metodo.includes('Visa') || metodo.includes('Tarjeta')) return '💳';
        if (metodo.includes('PayPal')) return '🅿️';
        if (metodo.includes('Transferencia')) return '🏦';
        return '💵';
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <>
            <Head title="Gestión de Pagos - Academia Linaje" />
            <AppHeader breadcrumbs={breadcrumbs} />

            <div className="min-h-screen bg-gray-50 px-6 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Pagos</h1>
                        <p className="text-gray-600">Control de mensualidades, inscripciones y facturación</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="flex items-center gap-2 bg-[#7a9b3c] hover:bg-[#6a8a2c]">
                            <Icon iconNode={Plus} className="w-4 h-4" />
                            Registrar Pago
                        </Button>
                        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                            <Icon iconNode={Receipt} className="w-4 h-4" />
                            Nueva Factura
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Ingresos del Mes */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">Ingresos del Mes</span>
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <Icon iconNode={DollarSign} className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            ${ingresosMes.total.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600 font-medium mb-3">
                            {ingresosMes.cambio}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2">
                            <div 
                                className="bg-green-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${ingresosMes.porcentaje}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                            70% del objetivo mensual
                        </div>
                    </div>

                    {/* Pagos Pendientes */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">Pagos Pendientes</span>
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Icon iconNode={AlertCircle} className="w-5 h-5 text-orange-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                            ${pagosPendientes.total.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                            {pagosPendientes.estudiantes} estudiantes
                        </div>
                        <div className="space-y-1 mt-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Vencidos</span>
                                <span className="text-red-600 font-semibold">${pagosPendientes.vencidos.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Por vencer (7 días)</span>
                                <span className="text-orange-600 font-semibold">${pagosPendientes.porVencer.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Métodos de Pago */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-600">Métodos de Pago</span>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Icon iconNode={CreditCard} className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {metodosEjemplo.map((metodo, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            metodo.icon === 'card' ? 'bg-blue-500' :
                                            metodo.icon === 'transfer' ? 'bg-green-500' :
                                            'bg-gray-500'
                                        }`}></div>
                                        <span className="text-sm text-gray-700">{metodo.nombre}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{metodo.porcentaje}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pasarelas de Pago Integradas */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Icon iconNode={Link2} className="w-5 h-5 text-[#7a9b3c]" />
                        <h3 className="text-lg font-semibold text-gray-800">Pasarelas de Pago Integradas</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {pasarelas.map((pasarela, idx) => (
                            <div 
                                key={idx}
                                className={`${pasarela.color} rounded-lg p-6 text-white relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer`}
                            >
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-3 text-3xl">
                                        {pasarela.nombre === 'Stripe' && '💳'}
                                        {pasarela.nombre === 'PayPal' && '🅿️'}
                                        {pasarela.nombre === 'PayU' && '💵'}
                                        {pasarela.nombre === 'Wompi' && '🛒'}
                                    </div>
                                    <h4 className="font-bold text-lg mb-2">{pasarela.nombre}</h4>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        pasarela.estado === 'activo' 
                                            ? 'bg-white/20' 
                                            : 'bg-white/30'
                                    }`}>
                                        {pasarela.estado === 'activo' ? 'Activo' : 'Configurar'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transacciones Recientes */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#6b5544] text-white p-4 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <Icon iconNode={Receipt} className="w-5 h-5" />
                            <h2 className="text-lg font-semibold">Transacciones Recientes</h2>
                        </div>
                        <div className="flex gap-2 items-center">
                            <select 
                                title="Filtrar transacciones"
                                aria-label="Filtrar transacciones"
                                className="px-3 py-1.5 bg-[#5a4433] rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-white"
                            >
                                <option>Todas</option>
                                <option>Completadas</option>
                                <option>Pendientes</option>
                            </select>
                            <Button 
                                size="sm"
                                className="bg-[#7a9b3c] hover:bg-[#6a8a2c]"
                            >
                                <Icon iconNode={Download} className="w-4 h-4 mr-1" />
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
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Estudiante
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Concepto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Método
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Monto
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transaccionesEjemplo.map((transaccion) => {
                                    const estadoBadge = getEstadoBadge(transaccion.estado);
                                    
                                    return (
                                        <tr key={transaccion.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{transaccion.fecha}</div>
                                                <div className="text-xs text-gray-500">{transaccion.hora}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Avatar className="h-9 w-9 mr-3">
                                                        <AvatarImage src={transaccion.estudiante.avatar} />
                                                        <AvatarFallback className="bg-[#7a9b3c] text-white text-xs">
                                                            {getInitials(transaccion.estudiante.nombre)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {transaccion.estudiante.nombre}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {transaccion.estudiante.tipo}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">{transaccion.concepto}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{getMetodoIcon(transaccion.metodo)}</span>
                                                    <span className="text-sm text-gray-900">{transaccion.metodoBadge}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ${transaccion.monto.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${estadoBadge.bg} ${estadoBadge.text}`}>
                                                    {estadoBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button size="sm" variant="ghost" title="Ver recibo">
                                                        <Icon iconNode={Receipt} className="w-4 h-4 text-blue-600" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" title="Contactar">
                                                        <Icon iconNode={MessageSquare} className="w-4 h-4 text-green-600" />
                                                    </Button>
                                                    {transaccion.estado === 'pendiente' && (
                                                        <Button size="sm" variant="ghost" title="Alerta">
                                                            <Icon iconNode={AlertCircle} className="w-4 h-4 text-orange-600" />
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
            </div>
        </>
    );
}
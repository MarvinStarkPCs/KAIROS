import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Users,
    DollarSign,
    Clock,
    BarChart2,
    UserPlus,
    CreditCard,
    CalendarPlus,
    Mail,
    FileText,
    Settings
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-[#f9f6f2]">
                {/* Título */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard Principal</h1>
                    <p className="text-gray-600">
                        Resumen general de la academia — Semana del 16 al 22 de Septiembre, 2024
                    </p>
                </div>

                {/* Tarjetas de estadísticas */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Estudiantes Activos"
                        value="247"
                        color="green"
                        icon={<Users className="text-green-600" />}
                        footer="+12 este mes"
                    />
                    <StatCard
                        title="Ingresos del Mes"
                        value="$45,280"
                        color="blue"
                        icon={<DollarSign className="text-blue-600" />}
                        footer="+8.2% vs mes anterior"
                    />
                    <StatCard
                        title="Clases Programadas"
                        value="156"
                        color="orange"
                        icon={<Clock className="text-orange-600" />}
                        footer="Esta semana"
                    />
                    <StatCard
                        title="Tasa de Asistencia"
                        value="94.5%"
                        color="purple"
                        icon={<BarChart2 className="text-purple-600" />}
                        footer="Excelente"
                    />
                </div>

                {/* Acciones rápidas */}
                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        ⚡ Acciones Rápidas
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <ActionButton color="green" icon={<UserPlus size={20} />} text="Nuevo Estudiante" />
                        <ActionButton color="blue" icon={<CreditCard size={20} />} text="Registrar Pago" />
                        <ActionButton color="orange" icon={<CalendarPlus size={20} />} text="Nueva Clase" />
                        <ActionButton color="purple" icon={<Mail size={20} />} text="Enviar Circular" />
                        <ActionButton color="red" icon={<FileText size={20} />} text="Generar Reporte" />
                        <ActionButton color="indigo" icon={<Settings size={20} />} text="Configuración" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/* 🧩 Componente de tarjeta estadística */
function StatCard({ title, value, color, icon, footer }) {
    return (
        <div
            className={`bg-white p-6 rounded-2xl shadow hover:shadow-lg border-l-4 border-${color}-500 transition`}
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{title}</h3>
                {icon}
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className={`text-sm text-${color}-600 mt-1`}>{footer}</p>
        </div>
    );
}

/* 🧩 Componente de botón de acción */
function ActionButton({ color, icon, text }) {
    return (
        <button
            className={`bg-${color}-600 hover:bg-${color}-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition`}
        >
            {icon} {text}
        </button>
    );
}

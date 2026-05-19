import { Check, X, Clock, TrendingUp } from 'lucide-react';

interface Props {
    asistenciaHoy: { total: number; presentes: number; porcentaje: string };
    ausencias: number;
    tardanzas: number;
    promedioMensual: string;
}

export default function StatsCards({ asistenciaHoy, ausencias, tardanzas, promedioMensual }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Asistencia Hoy</span>
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                    </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                    {asistenciaHoy.presentes}/{asistenciaHoy.total}
                </div>
                <div className="text-xs text-green-600 font-medium mb-2">
                    {asistenciaHoy.porcentaje} de asistencia
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-green-500 h-full rounded-full transition-all duration-500"
                        style={{ width: asistenciaHoy.porcentaje }}
                    />
                </div>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Ausencias</span>
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <X className="w-5 h-5 text-red-600" />
                    </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{ausencias}</div>
                <div className="text-xs text-muted-foreground">Sin justificar</div>
                <div className="text-xs text-muted-foreground mt-1">Hoy</div>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Tardanzas</span>
                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{tardanzas}</div>
                <div className="text-xs text-muted-foreground">Hoy</div>
                <div className="text-xs text-muted-foreground mt-1">Estudiantes</div>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-muted-foreground">Promedio Mensual</span>
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{promedioMensual}</div>
                <div className="text-xs text-green-600 font-medium">Este mes</div>
            </div>
        </div>
    );
}

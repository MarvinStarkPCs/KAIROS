import { AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAlertaTipo, getAlertaLabel, getInitials } from '../helpers';
import type { Alerta } from '../types';

interface Props {
    alertas: Alerta[];
}

export default function AlertsSection({ alertas }: Props) {
    if (alertas.length === 0) return null;

    return (
        <div className="bg-card rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-foreground">Estudiantes con Alertas</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {alertas.map((alerta) => {
                    const alertaTipo = getAlertaTipo(alerta.tipo);
                    return (
                        <div
                            key={alerta.id}
                            className={`rounded-lg p-4 border ${alertaTipo.bg} ${alertaTipo.border}`}
                        >
                            <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={alerta.estudiante.avatar} />
                                    <AvatarFallback className="bg-gray-400 text-white text-xs">
                                        {getInitials(alerta.estudiante.nombre)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-foreground">{alerta.estudiante.nombre}</h4>
                                            <p className="text-xs text-muted-foreground">{alerta.estudiante.clase}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${alertaTipo.badge}`}>
                                            {getAlertaLabel(alerta.tipo)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">{alerta.mensaje}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

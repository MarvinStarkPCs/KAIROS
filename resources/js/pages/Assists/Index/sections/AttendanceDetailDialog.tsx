import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getEstadoBadge, getInitials } from '../helpers';
import type { Asistencia } from '../types';

interface Props {
    attendance: Asistencia | null;
    onClose: () => void;
}

export default function AttendanceDetailDialog({ attendance, onClose }: Props) {
    return (
        <Dialog open={!!attendance} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Detalle de Asistencia</DialogTitle>
                    <DialogDescription>Información completa del registro de asistencia</DialogDescription>
                </DialogHeader>
                {attendance && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-[#7a9b3c] text-white">
                                    {getInitials(attendance.estudiante.nombre)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-semibold text-foreground">{attendance.estudiante.nombre}</h4>
                                <p className="text-sm text-muted-foreground">{attendance.estudiante.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Fecha</label>
                                <p className="font-medium">{attendance.fecha_formato}</p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Hora de clase</label>
                                <p className="font-medium">{attendance.hora}</p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Programa</label>
                                <p className="font-medium">{attendance.programa.nombre}</p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase">Profesor</label>
                                <p className="font-medium">{attendance.profesor.nombre}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground uppercase">Estado</label>
                            <div className="mt-1">
                                {(() => {
                                    const estadoBadge = getEstadoBadge(attendance.estado);
                                    const EstadoIcon = estadoBadge.icon;
                                    return (
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${estadoBadge.bg} ${estadoBadge.text}`}>
                                            <EstadoIcon className="w-4 h-4 mr-1" />
                                            {estadoBadge.label}
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground uppercase">Justificación / Notas</label>
                            {attendance.notas ? (
                                <div className="mt-1 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-sm text-foreground">{attendance.notas}</p>
                                </div>
                            ) : (
                                <p className="mt-1 text-muted-foreground italic">Sin justificación registrada</p>
                            )}
                        </div>

                        <div className="pt-3 border-t text-xs text-muted-foreground">
                            <p>Registrado por: {attendance.registrado_por}</p>
                            <p>Fecha de registro: {attendance.created_at}</p>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

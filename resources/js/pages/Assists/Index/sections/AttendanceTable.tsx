import { Calendar, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getEstadoBadge, getInitials } from '../helpers';
import type { PaginatedData, Asistencia } from '../types';

interface Props {
    asistencias: PaginatedData;
    onViewAttendance: (asistencia: Asistencia) => void;
    onGoToPage: (page: number) => void;
}

export default function AttendanceTable({ asistencias, onViewAttendance, onGoToPage }: Props) {
    return (
        <div className="bg-card rounded-lg shadow-sm mb-6 overflow-hidden">
            <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Historial de Asistencias</h2>
                <div className="text-sm text-gray-300">{asistencias?.total || 0} registros encontrados</div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            {['Fecha', 'Estudiante', 'Programa', 'Profesor', 'Estado', 'Justificación'].map((h) => (
                                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {h}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {asistencias?.data?.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                    No se encontraron registros de asistencia
                                </td>
                            </tr>
                        ) : (
                            asistencias?.data?.map((asistencia) => {
                                const estadoBadge = getEstadoBadge(asistencia.estado);
                                const EstadoIcon = estadoBadge.icon;
                                return (
                                    <tr key={asistencia.id} className="hover:bg-muted">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-foreground">{asistencia.fecha_formato}</div>
                                                    <div className="text-xs text-muted-foreground">{asistencia.hora}</div>
                                                </div>
                                            </div>
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
                                                    <div className="text-sm font-medium text-foreground">{asistencia.estudiante.nombre}</div>
                                                    <div className="text-xs text-muted-foreground">{asistencia.estudiante.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span
                                                    className="inline-block w-2 h-2 rounded-full mr-2"
                                                    style={{ backgroundColor: asistencia.programa.color }}
                                                />
                                                <span className="text-sm text-foreground">{asistencia.programa.nombre}</span>
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
                                                <span className="text-sm text-foreground">{asistencia.profesor.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${estadoBadge.bg} ${estadoBadge.text}`}>
                                                <EstadoIcon className="w-3 h-3 mr-1" />
                                                {estadoBadge.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {asistencia.notas ? (
                                                <p className="text-sm text-muted-foreground truncate max-w-xs" title={asistencia.notas}>
                                                    {asistencia.notas}
                                                </p>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Button size="sm" variant="ghost" onClick={() => onViewAttendance(asistencia)}>
                                                <Eye className="w-4 h-4 text-blue-600" />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {asistencias?.last_page > 1 && (
                <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {asistencias.from} a {asistencias.to} de {asistencias.total} registros
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGoToPage(asistencias.current_page - 1)}
                            disabled={asistencias.current_page === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Página {asistencias.current_page} de {asistencias.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onGoToPage(asistencias.current_page + 1)}
                            disabled={asistencias.current_page === asistencias.last_page}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

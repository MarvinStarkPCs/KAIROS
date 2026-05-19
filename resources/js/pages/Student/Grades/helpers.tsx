import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const getScoreColor = (score: number | null): string => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
};

export const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">Pendiente</Badge>;
    if (score >= 80) return <Badge className="bg-green-500">Excelente</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Aprobado</Badge>;
    return <Badge variant="destructive">Necesita mejorar</Badge>;
};

export const getAttendanceIcon = (status: string) => {
    switch (status) {
        case 'present':  return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'late':     return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        case 'absent':   return <XCircle className="h-4 w-4 text-red-500" />;
        case 'excused':  return <Clock className="h-4 w-4 text-blue-500" />;
        default:         return null;
    }
};

export const getAttendanceBadge = (status: string) => {
    switch (status) {
        case 'present':
            return <Badge className="bg-green-500 text-[10px] sm:text-xs">Presente</Badge>;
        case 'late':
            return <Badge className="bg-yellow-500 text-[10px] sm:text-xs">Tarde</Badge>;
        case 'absent':
            return <Badge variant="destructive" className="text-[10px] sm:text-xs">Ausente</Badge>;
        case 'excused':
            return <Badge className="bg-blue-500 text-[10px] sm:text-xs">Excusado</Badge>;
        default:
            return <Badge variant="outline" className="text-[10px] sm:text-xs">{status}</Badge>;
    }
};

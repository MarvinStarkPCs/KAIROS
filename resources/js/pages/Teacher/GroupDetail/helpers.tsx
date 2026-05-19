import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const getStatusIcon = (status: string) => {
    switch (status) {
        case 'present': return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'late':    return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        case 'absent':  return <XCircle className="w-4 h-4 text-red-500" />;
        default:        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
};

export const getStatusBadge = (status: string) => {
    switch (status) {
        case 'present': return <Badge className="bg-green-500">Presente</Badge>;
        case 'late':    return <Badge className="bg-yellow-500">Tarde</Badge>;
        case 'absent':  return <Badge variant="destructive">Ausente</Badge>;
        default:        return <Badge variant="outline">Sin marcar</Badge>;
    }
};

export const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
};

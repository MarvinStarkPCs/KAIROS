import { Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';

interface Props {
    createdAt: string;
    updatedAt: string;
}

export default function SystemInfoCard({ createdAt, updatedAt }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Informacion del Sistema
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                        <p className="font-medium">{formatDate(createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Ultima Actualizacion</p>
                        <p className="font-medium">{formatDate(updatedAt)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

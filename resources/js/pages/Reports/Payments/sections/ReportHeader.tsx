import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    exportUrl: string;
}

export default function ReportHeader({ exportUrl }: Props) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Reportes de Pagos</h1>
                <p className="mt-1 text-muted-foreground">
                    Resumen financiero y estadísticas de pagos
                </p>
            </div>
            <a href={exportUrl}>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar CSV
                </Button>
            </a>
        </div>
    );
}

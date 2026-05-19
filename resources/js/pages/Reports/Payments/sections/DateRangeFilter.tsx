import { CalendarDays, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DateRange } from '../types';

interface Props {
    dateRange: DateRange;
    onDateChange: (field: keyof DateRange, value: string) => void;
    onApply: () => void;
    onThisMonth: () => void;
    onLastQuarter: () => void;
    onThisYear: () => void;
}

export default function DateRangeFilter({
    dateRange,
    onDateChange,
    onApply,
    onThisMonth,
    onLastQuarter,
    onThisYear,
}: Props) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onThisMonth}>
                            <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                            Este mes
                        </Button>
                        <Button variant="outline" size="sm" onClick={onLastQuarter}>
                            Último trimestre
                        </Button>
                        <Button variant="outline" size="sm" onClick={onThisYear}>
                            Este año
                        </Button>
                    </div>
                    <div className="flex items-end gap-3">
                        <div>
                            <Label htmlFor="start_date" className="text-xs">Desde</Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={dateRange.start_date}
                                onChange={(e) => onDateChange('start_date', e.target.value)}
                                className="w-40"
                            />
                        </div>
                        <div>
                            <Label htmlFor="end_date" className="text-xs">Hasta</Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={dateRange.end_date}
                                onChange={(e) => onDateChange('end_date', e.target.value)}
                                className="w-40"
                            />
                        </div>
                        <Button onClick={onApply}>
                            <Search className="mr-2 h-4 w-4" />
                            Filtrar
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

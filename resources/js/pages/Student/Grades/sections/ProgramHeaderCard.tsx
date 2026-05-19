import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SelectedProgram } from '../types';

interface Props {
    program: SelectedProgram;
}

export default function ProgramHeaderCard({ program }: Props) {
    return (
        <Card>
            <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: program.color }}
                    />
                    <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{program.name}</CardTitle>
                        {program.description && (
                            <CardDescription className="mt-1 text-xs sm:text-sm line-clamp-2">
                                {program.description}
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}

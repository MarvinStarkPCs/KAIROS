import { Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { route } from 'ziggy-js';
import type { Parent } from '../types';

interface Props {
    dependents: Parent[];
}

export default function SimpleDependentsCard({ dependents }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Dependientes
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {dependents.map((dep) => (
                    <div key={dep.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                            <Link href={route('usuarios.show', dep.id)} className="text-blue-600 hover:underline font-medium">
                                {dep.name}
                            </Link>
                            {dep.email && (
                                <p className="text-sm text-muted-foreground">{dep.email}</p>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

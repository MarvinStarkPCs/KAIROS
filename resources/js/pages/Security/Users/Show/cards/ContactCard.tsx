import { Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserData } from '../types';

interface Props {
    user: UserData;
}

export default function ContactCard({ user }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contacto y Ubicacion
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Telefono</p>
                        <p className="font-medium">{user.phone || 'No especificado'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Celular</p>
                        <p className="font-medium">{user.mobile || 'No especificado'}</p>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Direccion</p>
                    <p className="font-medium">{user.address || 'No especificada'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Barrio</p>
                        <p className="font-medium">{user.neighborhood || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Ciudad</p>
                        <p className="font-medium">{user.city || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Departamento</p>
                        <p className="font-medium">{user.department || '-'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

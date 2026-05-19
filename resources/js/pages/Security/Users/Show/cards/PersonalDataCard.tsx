import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateUser, getGenderLabel, getDocumentTypeLabel } from '../helpers';
import type { UserData } from '../types';

interface Props {
    user: UserData;
}

export default function PersonalDataCard({ user }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Datos Personales
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Nombre Completo</p>
                        <p className="font-medium">{user.full_name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email || 'No tiene'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tipo de Documento</p>
                        <p className="font-medium">{getDocumentTypeLabel(user.document_type)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Numero de Documento</p>
                        <p className="font-medium">{user.document_number || 'No especificado'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                        <p className="font-medium">{formatDateUser(user.birth_date)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Genero</p>
                        <p className="font-medium">{getGenderLabel(user.gender)}</p>
                    </div>
                    {user.birth_place && (
                        <div className="col-span-2">
                            <p className="text-sm text-muted-foreground">Lugar de Nacimiento</p>
                            <p className="font-medium">{user.birth_place}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

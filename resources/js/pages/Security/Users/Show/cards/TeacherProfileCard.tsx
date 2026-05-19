import { Music } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '../helpers';
import type { TeacherProfile } from '../types';

interface Props {
    profile: TeacherProfile;
}

export default function TeacherProfileCard({ profile }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Perfil de Profesor
                </CardTitle>
                <CardDescription>Informacion profesional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge variant={profile.is_active ? 'default' : 'destructive'}>
                            {profile.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </div>
                    {profile.experience_years !== null && (
                        <div>
                            <p className="text-sm text-muted-foreground">Experiencia</p>
                            <p className="font-medium">{profile.experience_years} anos</p>
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">Instrumentos que domina</p>
                    <p className="font-medium">{profile.instruments_played}</p>
                </div>
                {profile.specialization && (
                    <div>
                        <p className="text-sm text-muted-foreground">Especializacion</p>
                        <p className="font-medium">{profile.specialization}</p>
                    </div>
                )}
                {profile.music_schools && (
                    <div>
                        <p className="text-sm text-muted-foreground">Formacion Musical</p>
                        <p className="font-medium">{profile.music_schools}</p>
                    </div>
                )}
                {profile.bio && (
                    <div>
                        <p className="text-sm text-muted-foreground">Biografia</p>
                        <p className="font-medium text-sm">{profile.bio}</p>
                    </div>
                )}
                {profile.hourly_rate !== null && (
                    <div>
                        <p className="text-sm text-muted-foreground">Tarifa por Hora</p>
                        <p className="font-medium">{formatCurrency(profile.hourly_rate)}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

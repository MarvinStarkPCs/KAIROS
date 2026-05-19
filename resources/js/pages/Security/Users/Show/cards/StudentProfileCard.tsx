import { GraduationCap, AlertCircle, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StudentProfile } from '../types';

interface Props {
    profile: StudentProfile;
}

export default function StudentProfileCard({ profile }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Perfil de Estudiante
                </CardTitle>
                <CardDescription>Informacion musical y academica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Modalidad</p>
                        <Badge variant="secondary">{profile.modality || 'No definida'}</Badge>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Nivel Actual</p>
                        <p className="font-medium">{profile.current_level || 1}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Instrumento Deseado</p>
                        <p className="font-medium">{profile.desired_instrument || 'No especificado'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Toca Instrumento</p>
                        <Badge variant={profile.plays_instrument ? 'default' : 'secondary'}>
                            {profile.plays_instrument ? 'Si' : 'No'}
                        </Badge>
                    </div>
                </div>

                {profile.instruments_played && (
                    <div>
                        <p className="text-sm text-muted-foreground">Instrumentos que toca</p>
                        <p className="font-medium">{profile.instruments_played}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Estudios Musicales</p>
                        <Badge variant={profile.has_music_studies ? 'default' : 'secondary'}>
                            {profile.has_music_studies ? 'Si' : 'No'}
                        </Badge>
                    </div>
                    {profile.music_schools && (
                        <div>
                            <p className="text-sm text-muted-foreground">Escuelas/Academias</p>
                            <p className="font-medium">{profile.music_schools}</p>
                        </div>
                    )}
                </div>

                {(profile.emergency_contact_name || profile.emergency_contact_phone) && (
                    <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Contacto de Emergencia
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Nombre</p>
                                <p className="font-medium">{profile.emergency_contact_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Telefono</p>
                                <p className="font-medium">{profile.emergency_contact_phone || '-'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {(profile.medical_conditions || profile.allergies) && (
                    <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Informacion Medica
                        </p>
                        {profile.medical_conditions && (
                            <div className="mb-2">
                                <p className="text-sm text-muted-foreground">Condiciones Medicas</p>
                                <p className="font-medium">{profile.medical_conditions}</p>
                            </div>
                        )}
                        {profile.allergies && (
                            <div>
                                <p className="text-sm text-muted-foreground">Alergias</p>
                                <p className="font-medium">{profile.allergies}</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

import { Link } from '@inertiajs/react';
import { Shield, Users, Mail, Phone, IdCard, MapPin, Heart, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { route } from 'ziggy-js';
import type { Parent, ParentGuardianData } from '../types';

interface Props {
    parent: Parent | null;
    guardians: ParentGuardianData[];
}

export default function GuardiansCard({ parent, guardians }: Props) {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Responsables y Acudientes
                </CardTitle>
                <CardDescription>Personas responsables del estudiante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {parent && (
                    <div className="rounded-lg border bg-card p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                                <Users className="h-5 w-5 text-orange-700 dark:text-orange-300" />
                            </div>
                            <div>
                                <Link href={route('usuarios.show', parent.id)} className="text-lg font-semibold text-blue-700 dark:text-blue-300 hover:underline">
                                    {parent.name}
                                </Link>
                                <p className="text-sm text-muted-foreground">Responsable Principal (cuenta del sistema)</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {parent.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium">{parent.email}</p>
                                    </div>
                                </div>
                            )}
                            {(parent.phone || parent.mobile) && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Teléfono</p>
                                        <p className="text-sm font-medium">{parent.mobile || parent.phone}</p>
                                    </div>
                                </div>
                            )}
                            {(parent.document_type || parent.document_number) && (
                                <div className="flex items-center gap-2">
                                    <IdCard className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Documento</p>
                                        <p className="text-sm font-medium">
                                            {parent.document_type && `${parent.document_type} `}{parent.document_number || '-'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {parent.address && (
                                <div className="flex items-center gap-2 md:col-span-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Dirección</p>
                                        <p className="text-sm font-medium">
                                            {parent.address}
                                            {parent.neighborhood && `, ${parent.neighborhood}`}
                                            {parent.city && ` - ${parent.city}`}
                                            {parent.department && `, ${parent.department}`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {guardians.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground">Acudientes Registrados en Matrícula</h4>
                        {guardians.map((pg) => (
                            <div key={pg.id} className="rounded-lg border bg-card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                            <Heart className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{pg.name}</p>
                                            <Badge variant="secondary" className="text-xs capitalize">
                                                {pg.relationship_type || 'Acudiente'}
                                            </Badge>
                                        </div>
                                    </div>
                                    {pg.has_signed_authorization ? (
                                        <div className="flex items-center gap-1 text-green-600">
                                            <CheckCircle className="h-4 w-4" />
                                            <span className="text-xs">Autorización firmada</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <XCircle className="h-4 w-4" />
                                            <span className="text-xs">Sin autorización</span>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                    {pg.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{pg.phone}</span>
                                        </div>
                                    )}
                                    {pg.address && (
                                        <div className="flex items-center gap-2 md:col-span-2">
                                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{pg.address}</span>
                                        </div>
                                    )}
                                    {pg.authorization_date && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-muted-foreground">Firmó el {pg.authorization_date}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

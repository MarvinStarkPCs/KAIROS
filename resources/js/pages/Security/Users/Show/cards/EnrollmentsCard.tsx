import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStatusBadge } from '../helpers';
import type { Enrollment } from '../types';

interface Props {
    enrollments: Enrollment[];
}

export default function EnrollmentsCard({ enrollments }: Props) {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Inscripciones y Autorizaciones
                </CardTitle>
                <CardDescription>
                    Programas en los que esta inscrito y estado de autorizaciones
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {enrollments.map((enrollment) => (
                        <div key={enrollment.id} className="p-4 border rounded-lg bg-muted">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-lg">{enrollment.program_name || 'Programa sin nombre'}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Inscrito el {enrollment.enrollment_date ? new Date(enrollment.enrollment_date).toLocaleDateString('es-ES') : 'N/A'}
                                        {enrollment.enrolled_level && ` - Nivel ${enrollment.enrolled_level}`}
                                    </p>
                                </div>
                                {getStatusBadge(enrollment.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
                                    {enrollment.payment_commitment_signed ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                    )}
                                    <div>
                                        <p className="font-medium">Compromiso de Pago</p>
                                        {enrollment.payment_commitment_signed ? (
                                            <p className="text-sm text-green-600">
                                                Firmado {enrollment.payment_commitment_date && `el ${enrollment.payment_commitment_date}`}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-red-500">No firmado</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 rounded-lg bg-card">
                                    {enrollment.parental_authorization_signed ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    )}
                                    <div>
                                        <p className="font-medium">Autorizacion Parental</p>
                                        {enrollment.parental_authorization_signed ? (
                                            <>
                                                <p className="text-sm text-green-600">
                                                    Firmado {enrollment.parental_authorization_date && `el ${enrollment.parental_authorization_date}`}
                                                </p>
                                                {enrollment.parent_guardian_name && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Por: {enrollment.parent_guardian_name}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No aplica (adulto)</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

import { Link } from '@inertiajs/react';
import { Users, GraduationCap, AlertCircle, Heart, School } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { route } from 'ziggy-js';
import { formatCurrency, formatDateUser, getGenderLabel, getStatusBadge } from '../helpers';
import type { DependentWithSummary } from '../types';

interface Props {
    dependents: DependentWithSummary[];
}

export default function DependentsWithSummaryCard({ dependents }: Props) {
    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Hijos / Dependientes
                </CardTitle>
                <CardDescription>
                    Información completa, inscripciones y pagos de cada dependiente
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {dependents.map((dep) => (
                        <div key={dep.id} className="rounded-lg border bg-card p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                        <GraduationCap className="h-5 w-5 text-green-700 dark:text-green-300" />
                                    </div>
                                    <div>
                                        <Link href={route('usuarios.show', dep.id)} className="text-lg font-semibold text-blue-700 dark:text-blue-300 hover:underline">
                                            {dep.name}
                                        </Link>
                                        {dep.email && (
                                            <p className="text-sm text-muted-foreground">{dep.email}</p>
                                        )}
                                    </div>
                                </div>
                                {dep.payments_pending > 0 && (
                                    <div className="text-right">
                                        <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                                            {dep.payments_pending} pago{dep.payments_pending !== 1 ? 's' : ''} pendiente{dep.payments_pending !== 1 ? 's' : ''}
                                        </Badge>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 font-medium">
                                            {formatCurrency(dep.payments_pending_amount)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-muted rounded-lg p-3">
                                {(dep.document_type || dep.document_number) && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Documento</p>
                                        <p className="font-medium">{dep.document_type && `${dep.document_type} `}{dep.document_number || '-'}</p>
                                    </div>
                                )}
                                {dep.birth_date && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Fecha de Nacimiento</p>
                                        <p className="font-medium">{formatDateUser(dep.birth_date)}</p>
                                    </div>
                                )}
                                {dep.gender && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Género</p>
                                        <p className="font-medium">{getGenderLabel(dep.gender)}</p>
                                    </div>
                                )}
                                {(dep.phone || dep.mobile) && (
                                    <div>
                                        <p className="text-xs text-muted-foreground">Teléfono</p>
                                        <p className="font-medium">{dep.mobile || dep.phone}</p>
                                    </div>
                                )}
                            </div>

                            {dep.student_profile && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    {dep.student_profile.desired_instrument && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Instrumento</p>
                                            <p className="font-medium">{dep.student_profile.desired_instrument}</p>
                                        </div>
                                    )}
                                    {dep.student_profile.modality && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Modalidad</p>
                                            <Badge variant="secondary">{dep.student_profile.modality}</Badge>
                                        </div>
                                    )}
                                    {dep.student_profile.current_level !== null && (
                                        <div>
                                            <p className="text-xs text-muted-foreground">Nivel</p>
                                            <p className="font-medium">{dep.student_profile.current_level}</p>
                                        </div>
                                    )}
                                    {(dep.student_profile.emergency_contact_name || dep.student_profile.emergency_contact_phone) && (
                                        <div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> Emergencia
                                            </p>
                                            <p className="font-medium">{dep.student_profile.emergency_contact_name || '-'}</p>
                                            {dep.student_profile.emergency_contact_phone && (
                                                <p className="text-xs text-muted-foreground">{dep.student_profile.emergency_contact_phone}</p>
                                            )}
                                        </div>
                                    )}
                                    {dep.student_profile.medical_conditions && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Heart className="h-3 w-3" /> Condiciones Médicas
                                            </p>
                                            <p className="font-medium text-sm">{dep.student_profile.medical_conditions}</p>
                                        </div>
                                    )}
                                    {dep.student_profile.allergies && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-muted-foreground">Alergias</p>
                                            <p className="font-medium text-sm">{dep.student_profile.allergies}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {dep.enrollments.length > 0 ? (
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-2">Inscripciones</p>
                                    <div className="space-y-2">
                                        {dep.enrollments.map((enr, idx) => (
                                            <div key={idx} className="flex items-center justify-between rounded-lg bg-muted px-4 py-2.5">
                                                <div className="flex items-center gap-2">
                                                    <School className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{enr.program_name || 'Sin programa'}</span>
                                                    {enr.enrolled_level && (
                                                        <span className="text-xs text-muted-foreground">Nivel {enr.enrolled_level}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {enr.enrollment_date && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(enr.enrollment_date).toLocaleDateString('es-ES')}
                                                        </span>
                                                    )}
                                                    {getStatusBadge(enr.status)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Sin inscripciones</p>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

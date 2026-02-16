import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Mail, Phone, Clock, Calendar, MessageSquare, FileText, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface DemoLead {
    id: number;
    name: string;
    email: string;
    phone: string;
    is_for_child: boolean;
    child_name: string | null;
    instrument: string;
    preferred_schedule: string | null;
    message: string | null;
    notes: string | null;
    status: string;
    status_label: string;
    status_color: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    lead: DemoLead;
}

export default function Show({ lead }: Props) {
    const { data: statusData, setData: setStatusData, patch: patchStatus, processing: processingStatus } = useForm({
        status: lead.status,
    });

    const { data: notesData, setData: setNotesData, patch: patchNotes, processing: processingNotes } = useForm({
        notes: lead.notes || '',
    });

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patchStatus(`/admin/demo-leads/${lead.id}/status`, {
            preserveScroll: true,
        });
    };

    const handleNotesUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patchNotes(`/admin/demo-leads/${lead.id}/notes`, {
            preserveScroll: true,
        });
    };

    const getStatusBadgeClass = (color: string) => {
        switch (color) {
            case 'yellow':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
            case 'blue':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
            case 'green':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
            case 'red':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
            default:
                return 'bg-muted text-foreground';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout>
            <Head title={`Lead: ${lead.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href="/admin/demo-leads"
                            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Volver a leads
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground">Detalle del Lead</h1>
                        <p className="mt-2 text-muted-foreground">
                            Información completa y gestión del lead
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Información Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Datos del Lead */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Información del Lead
                                    </CardTitle>
                                    <Badge className={getStatusBadgeClass(lead.status_color)}>
                                        {lead.status_label}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Nombre Completo</Label>
                                        <p className="text-base font-medium">{lead.name}</p>
                                    </div>

                                    {lead.is_for_child && lead.child_name && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Estudiante (Hijo/a)</Label>
                                            <p className="text-base font-medium">{lead.child_name}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                            <p className="text-base">{lead.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                                            <p className="text-base">{lead.phone}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Instrumento de Interés</Label>
                                        <p className="text-base font-medium text-amber-600">{lead.instrument}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Horario Preferido</Label>
                                            <p className="text-base">
                                                {lead.preferred_schedule || (
                                                    <span className="text-muted-foreground">No especificado</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Fecha de Solicitud</Label>
                                            <p className="text-base">{formatDate(lead.created_at)}</p>
                                        </div>
                                    </div>

                                    {lead.updated_at !== lead.created_at && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <Label className="text-sm font-medium text-muted-foreground">Última Actualización</Label>
                                                <p className="text-base">{formatDate(lead.updated_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {lead.message && (
                                    <div className="pt-4 border-t">
                                        <div className="flex items-start gap-2">
                                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
                                            <div className="flex-1">
                                                <Label className="text-sm font-medium text-muted-foreground">Mensaje del Cliente</Label>
                                                <p className="text-base text-muted-foreground mt-1 whitespace-pre-wrap">{lead.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Notas Internas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Notas Internas
                                </CardTitle>
                                <CardDescription>
                                    Agrega notas o comentarios sobre este lead (solo visible para administradores)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleNotesUpdate} className="space-y-4">
                                    <Textarea
                                        value={notesData.notes}
                                        onChange={(e) => setNotesData('notes', e.target.value)}
                                        placeholder="Escribe notas sobre este lead..."
                                        rows={6}
                                        className="resize-none"
                                    />
                                    <Button type="submit" disabled={processingNotes}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {processingNotes ? 'Guardando...' : 'Guardar Notas'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Gestión */}
                    <div className="space-y-6">
                        {/* Cambiar Estado */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Gestión del Lead</CardTitle>
                                <CardDescription>
                                    Actualiza el estado del lead según su progreso
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleStatusUpdate} className="space-y-4">
                                    <div>
                                        <Label>Estado Actual</Label>
                                        <Select
                                            value={statusData.status}
                                            onValueChange={(value) => setStatusData('status', value)}
                                        >
                                            <SelectTrigger className="mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                                        Pendiente
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="contacted">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                        Contactado
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="converted">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                        Convertido
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="rejected">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                                        Rechazado
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={processingStatus}>
                                        {processingStatus ? 'Actualizando...' : 'Actualizar Estado'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Guía de Estados */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Guía de Estados</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <div className="flex items-center gap-2 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                        Pendiente
                                    </div>
                                    <p className="text-muted-foreground text-xs mt-1 ml-4">
                                        Lead nuevo sin contactar
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        Contactado
                                    </div>
                                    <p className="text-muted-foreground text-xs mt-1 ml-4">
                                        Ya se contactó al lead
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        Convertido
                                    </div>
                                    <p className="text-muted-foreground text-xs mt-1 ml-4">
                                        Lead se inscribió en el programa
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        Rechazado
                                    </div>
                                    <p className="text-muted-foreground text-xs mt-1 ml-4">
                                        Lead no está interesado
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

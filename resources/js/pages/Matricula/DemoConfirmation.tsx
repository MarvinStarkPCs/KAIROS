import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Calendar, Music2, User, Mail, Phone, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DemoRequest {
    id: number;
    responsible_name: string;
    responsible_last_name: string;
    responsible_email: string;
    responsible_mobile: string;
    program: {
        name: string;
        description: string;
    };
    schedule?: {
        days_of_week: string;
        start_time: string;
        end_time: string;
    };
    is_minor: boolean;
    students_data?: Array<{
        name: string;
        last_name: string;
    }>;
}

interface Props {
    demoRequest: DemoRequest;
}

export default function DemoConfirmation({ demoRequest }: Props) {
    return (
        <>
            <Head title="Solicitud Enviada - Academia Linaje" />

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 sm:py-12 px-3 sm:px-4 lg:px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Success Icon Animation */}
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                            <div className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xl mx-auto animate-scale-in">
                                <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16" />
                            </div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                            ¡Solicitud Enviada!
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-700 mb-2">
                            Gracias por tu interés en nuestra clase demo
                        </p>
                        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                            Hemos recibido tu solicitud correctamente. Nuestro equipo se pondrá en contacto contigo pronto para coordinar tu clase demo gratuita.
                        </p>
                    </div>

                    {/* Request Details Card */}
                    <Card className="mb-6 shadow-xl border-2 animate-slide-right">
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            {/* Request Number */}
                            <div className="text-center pb-6 border-b">
                                <p className="text-sm text-gray-600 mb-1">Número de Solicitud</p>
                                <p className="text-2xl font-bold text-green-700">#{demoRequest.id.toString().padStart(6, '0')}</p>
                            </div>

                            {/* Responsible Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                                    <User className="h-5 w-5 text-green-600" />
                                    Datos del Responsable
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
                                    <div>
                                        <p className="text-sm text-gray-600">Nombre</p>
                                        <p className="font-medium text-gray-900">
                                            {demoRequest.responsible_name} {demoRequest.responsible_last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Mail className="h-3.5 w-3.5" />
                                            Email
                                        </p>
                                        <p className="font-medium text-gray-900 break-all">
                                            {demoRequest.responsible_email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5" />
                                            Teléfono
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            {demoRequest.responsible_mobile}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Program Info */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                                    <Music2 className="h-5 w-5 text-green-600" />
                                    Programa Solicitado
                                </h3>
                                <div className="pl-7">
                                    <p className="text-lg font-semibold text-gray-900 mb-1">
                                        {demoRequest.program.name}
                                    </p>
                                    {demoRequest.program.description && (
                                        <p className="text-sm text-gray-600">
                                            {demoRequest.program.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Schedule Info */}
                            {demoRequest.schedule && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900">
                                        <Calendar className="h-5 w-5 text-green-600" />
                                        Horario Preferido
                                    </h3>
                                    <div className="pl-7">
                                        <p className="font-medium text-gray-900">
                                            {demoRequest.schedule.days_of_week}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {demoRequest.schedule.start_time} - {demoRequest.schedule.end_time}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Students Info (if minor) */}
                            {demoRequest.is_minor && demoRequest.students_data && demoRequest.students_data.length > 0 && (
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-semibold text-lg text-gray-900">
                                        Estudiantes Registrados
                                    </h3>
                                    <div className="pl-7 space-y-2">
                                        {demoRequest.students_data.map((student, index) => (
                                            <p key={index} className="font-medium text-gray-900">
                                                • {student.name} {student.last_name}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Next Steps Card */}
                    <Card className="mb-6 border-2 border-green-200 bg-green-50 shadow-lg animate-slide-left">
                        <CardContent className="p-6 sm:p-8">
                            <h3 className="font-bold text-xl text-green-900 mb-4 flex items-center gap-2">
                                <ArrowRight className="h-5 w-5" />
                                ¿Qué sigue?
                            </h3>
                            <ul className="space-y-3 text-sm sm:text-base text-green-800">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
                                        1
                                    </span>
                                    <span>
                                        <strong>Revisaremos tu solicitud</strong> y verificaremos la disponibilidad del horario
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
                                        2
                                    </span>
                                    <span>
                                        <strong>Te contactaremos</strong> por email o teléfono en las próximas 24-48 horas
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
                                        3
                                    </span>
                                    <span>
                                        <strong>Coordinaremos</strong> la fecha y hora de tu clase demo gratuita
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
                                        4
                                    </span>
                                    <span>
                                        <strong>¡Disfruta!</strong> de tu primera clase totalmente gratis y sin compromiso
                                    </span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Contact Info */}
                    <Card className="mb-6 shadow-lg animate-fade-in">
                        <CardContent className="p-6 sm:p-8 text-center">
                            <p className="text-gray-700 mb-4">
                                Si tienes alguna pregunta o necesitas modificar tu solicitud, no dudes en contactarnos:
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
                                <a
                                    href={`mailto:info@academialinaje.com`}
                                    className="flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors"
                                >
                                    <Mail className="h-4 w-4" />
                                    info@academialinaje.com
                                </a>
                                <span className="hidden sm:inline text-gray-300">|</span>
                                <a
                                    href="tel:+573001234567"
                                    className="flex items-center gap-2 text-green-700 hover:text-green-800 font-medium transition-colors"
                                >
                                    <Phone className="h-4 w-4" />
                                    +57 (300) 123-4567
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Back Button */}
                    <div className="text-center animate-fade-in">
                        <Link href="/">
                            <Button
                                size="lg"
                                variant="outline"
                                className="gap-2 hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all duration-200"
                            >
                                <Home className="h-5 w-5" />
                                Volver al Inicio
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

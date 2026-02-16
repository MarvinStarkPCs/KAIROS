import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, GraduationCap, Mail, ArrowRight, LogIn } from 'lucide-react';

interface Teacher {
    id: number;
    name: string;
    last_name: string;
    email: string;
}

interface ConfirmationProps {
    teacher: Teacher;
}

export default function Confirmation({ teacher }: ConfirmationProps) {
    return (
        <>
            <Head title="Registro Exitoso" />

            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg shadow-2xl border-0 overflow-hidden">
                    {/* Header con animación */}
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-10">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/20 rounded-full p-4 animate-bounce">
                                <CheckCircle className="w-16 h-16" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold">
                            Registro Exitoso
                        </CardTitle>
                        <CardDescription className="text-green-100 text-lg mt-2">
                            Bienvenido al equipo de profesores
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8">
                        {/* Información del profesor */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 rounded-full p-3 mb-4">
                                <GraduationCap className="w-8 h-8 text-amber-600" />
                            </div>
                            <h2 className="text-2xl font-semibold text-foreground mb-2">
                                Hola, {teacher.name} {teacher.last_name}
                            </h2>
                            <p className="text-muted-foreground">
                                Tu cuenta de profesor ha sido creada correctamente.
                            </p>
                        </div>

                        {/* Detalles */}
                        <div className="bg-muted rounded-lg p-6 mb-8">
                            <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-amber-600" />
                                Informacion de tu cuenta
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Correo electronico:</span>
                                    <span className="font-medium text-foreground">{teacher.email}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Rol asignado:</span>
                                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-medium">
                                        Profesor
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Próximos pasos */}
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-3">Proximos pasos</h3>
                            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                                <li className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Inicia sesion con tu correo electronico y contrasena</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Completa tu perfil con informacion adicional</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Espera a que un administrador te asigne grupos de estudiantes</span>
                                </li>
                            </ul>
                        </div>

                        {/* Botón de acción */}
                        <div className="space-y-3">
                            <Link href="/login" className="block">
                                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 text-lg">
                                    <LogIn className="w-5 h-5 mr-2" />
                                    Iniciar Sesion
                                </Button>
                            </Link>
                            <Link href="/" className="block">
                                <Button variant="outline" className="w-full">
                                    Volver al Inicio
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

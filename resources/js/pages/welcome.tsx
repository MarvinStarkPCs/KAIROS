import { login } from '@/routes';
import * as programas_academicos from '@/routes/programas_academicos';
import { type SharedData } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { Music, Users, Award, MapPin, Phone, Mail, Clock, Star, CheckCircle, Gift, ArrowRight, Play } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Schedule {
    id: number;
    days_of_week: string;
    start_time: string;
    end_time: string;
    professor: {
        id: number;
        name: string;
    };
    available_slots: number;
    has_capacity: boolean;
}

interface DemoProgram {
    id: number;
    name: string;
    description: string;
    schedules?: Schedule[];
}

interface WelcomeProps extends SharedData {
    demoPrograms: DemoProgram[];
}

export default function Welcome() {
    const { auth, demoPrograms } = usePage<WelcomeProps>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        is_for_child: false,
        child_name: '',
        instrument: '',
        preferred_schedule: '',
        message: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/demo/solicitud', {
            onSuccess: () => reset(),
        });
    };

    const programs = [
        {
            icon: Music,
            title: 'Piano',
            description: 'Clases personalizadas desde nivel principiante hasta avanzado.',
            duration: 'Desde 1 hora/semana',
            students: '200+'
        },
        {
            icon: Music,
            title: 'Guitarra',
            description: 'Aprende guitarra clásica, acústica o eléctrica con expertos.',
            duration: 'Desde 1 hora/semana',
            students: '150+'
        },
        {
            icon: Music,
            title: 'Canto',
            description: 'Técnica vocal, repertorio y preparación escénica.',
            duration: 'Desde 1 hora/semana',
            students: '100+'
        },
        {
            icon: Users,
            title: 'Ensambles',
            description: 'Clases grupales, ensambles y talleres musicales.',
            duration: 'Consultar horarios',
            students: '80+'
        }
    ];

    const benefits = [
        'Profesores certificados con años de experiencia',
        'Metodología personalizada según tu nivel',
        'Instalaciones profesionales y equipadas',
        'Horarios flexibles adaptados a ti',
        'Recitales y presentaciones en vivo',
        'Material de estudio incluido'
    ];

    return (
        <>
            <Head title="Academia Linaje - Tu Primera Clase es GRATIS">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <img
                                    src="/logo_academia.png"
                                    alt="Academia Linaje"
                                    className="h-12 w-auto"
                                />
                            </div>
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={programas_academicos.index().url}
                                        className="rounded-lg bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-amber-800 transition-all hover:shadow-lg"
                                    >
                                        Mi Portal
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="hidden sm:block text-sm font-medium text-gray-700 hover:text-amber-800 transition-colors"
                                        >
                                            Acceso
                                        </Link>
                                        <a
                                            href="#clase-gratis"
                                            className="rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:from-amber-700 hover:to-amber-800"
                                        >
                                            Clase Gratis
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section with Free Class Highlight */}
                <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 py-16 sm:py-24 lg:py-32">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 -z-10 opacity-10">
                        <div className="absolute top-20 left-0 h-96 w-96 rounded-full bg-amber-500 blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500 blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        {/* Free Class Badge */}
                        <div className="flex justify-center mb-8">
                            <div className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-white shadow-xl animate-bounce-slow">
                                <Gift className="h-5 w-5" />
                                <span className="text-sm font-bold uppercase tracking-wide">¡Primera Clase Totalmente GRATIS!</span>
                            </div>
                        </div>

                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
                            <div className="space-y-8 text-center lg:text-left">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
                                    Despierta el
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                                        Músico que hay en ti
                                    </span>
                                </h1>

                                <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-xl mx-auto lg:mx-0">
                                    Aprende piano, guitarra, canto y más con profesores certificados.
                                    <span className="font-bold text-amber-800"> Tu primera clase es completamente gratis</span> para que
                                    conozcas nuestra metodología.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <a
                                        href="#clase-gratis"
                                        className="group flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-4 text-base font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:from-amber-700 hover:to-amber-800 transform hover:-translate-y-1"
                                    >
                                        Reserva tu Clase Gratis
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                    <a
                                        href="#programas"
                                        className="flex items-center justify-center rounded-xl border-2 border-amber-700 bg-white px-8 py-4 text-base font-semibold text-amber-900 hover:bg-amber-50 transition-all transform hover:-translate-y-1"
                                    >
                                        Ver Programas
                                    </a>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-amber-200">
                                    <div>
                                        <div className="text-3xl sm:text-4xl font-bold text-amber-800">500+</div>
                                        <div className="text-sm text-gray-600">Estudiantes Activos</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl sm:text-4xl font-bold text-amber-800">15+</div>
                                        <div className="text-sm text-gray-600">Profesores</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl sm:text-4xl font-bold text-amber-800">98%</div>
                                        <div className="text-sm text-gray-600">Satisfacción</div>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Image */}
                            <div className="relative">
                                <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-amber-300 to-orange-300 shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Music className="h-48 w-48 text-white opacity-30" />
                                    </div>
                                    {/* Play button overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer group">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl group-hover:scale-110 transition-transform">
                                            <Play className="h-10 w-10 text-amber-700 ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                                {/* Floating card */}
                                <div className="absolute -bottom-6 -right-6 rounded-2xl bg-white p-6 shadow-2xl max-w-xs">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                                            <Award className="h-8 w-8 text-amber-700" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">+10 años</div>
                                            <div className="text-xs text-gray-600">Formando músicos profesionales</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-20 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                ¿Por qué elegir Academia Linaje?
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Más que una academia, somos tu comunidad musical
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-all"
                                >
                                    <CheckCircle className="h-6 w-6 text-amber-700 flex-shrink-0 mt-1" />
                                    <span className="text-gray-800 font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Programs Section */}
                <section id="programas" className="py-20 bg-gradient-to-br from-gray-50 to-amber-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Nuestros Programas
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Encuentra el programa perfecto para ti
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {programs.map((program, index) => {
                                const Icon = program.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group rounded-2xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-amber-400 hover:shadow-2xl transform hover:-translate-y-2"
                                    >
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-800 group-hover:from-amber-600 group-hover:to-orange-600 group-hover:text-white transition-all">
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-bold text-gray-900">{program.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center text-amber-800 font-medium">
                                                <Clock className="h-4 w-4 mr-1" />
                                                {program.duration}
                                            </div>
                                            <div className="flex items-center text-gray-600 font-medium">
                                                <Users className="h-4 w-4 mr-1" />
                                                {program.students}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Free Class CTA Section */}
                <section id="clase-gratis" className="py-20 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
                        <div className="inline-flex items-center space-x-2 rounded-full bg-white/20 px-6 py-2 text-sm font-semibold mb-6">
                            <Gift className="h-5 w-5" />
                            <span>OFERTA ESPECIAL</span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl font-bold mb-6">
                            Empieza GRATIS Tu Viaje Musical
                        </h2>
                        <p className="text-xl mb-8 text-amber-50 max-w-3xl mx-auto">
                            Regístrate ahora y recibe tu primera clase completamente gratis.
                            Sin compromisos, sin cargos ocultos. Solo tú, tu instrumento y nuestros profesores expertos.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <a
                                href="#contacto"
                                className="group rounded-xl bg-white px-8 py-4 text-lg font-bold text-amber-700 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
                            >
                                Reservar Clase Gratis Ahora
                                <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-white/30">
                            <div>
                                <div className="text-3xl font-bold mb-2">✓ Sin Compromiso</div>
                                <div className="text-amber-100">Prueba sin obligación</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold mb-2">✓ Totalmente Gratis</div>
                                <div className="text-amber-100">Cero costo inicial</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold mb-2">✓ Profesional</div>
                                <div className="text-amber-100">Con profesor certificado</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-20 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Historias de Éxito
                            </h2>
                            <p className="text-lg text-gray-600">
                                Lo que dicen nuestros estudiantes
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-center space-x-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">"La clase gratis me convenció al instante. Los profesores son increíbles y las instalaciones de primera."</p>
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400"></div>
                                    <div>
                                        <div className="font-bold text-gray-900">María González</div>
                                        <div className="text-sm text-gray-600">Estudiante de Piano</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-center space-x-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">"Después de la primera clase gratis supe que este era el lugar perfecto para aprender. ¡Ya llevo 2 años!"</p>
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400"></div>
                                    <div>
                                        <div className="font-bold text-gray-900">Carlos Rodríguez</div>
                                        <div className="text-sm text-gray-600">Estudiante de Guitarra</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-center space-x-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">"La atención personalizada desde la primera clase gratuita hace toda la diferencia. Excelente metodología."</p>
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400"></div>
                                    <div>
                                        <div className="font-bold text-gray-900">Ana Martínez</div>
                                        <div className="text-sm text-gray-600">Estudiante de Canto</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contacto" className="py-20 bg-gradient-to-br from-gray-50 to-amber-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="grid gap-12 lg:grid-cols-2 items-start">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                                    Reserva Tu Clase Gratis
                                </h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    Completa el formulario y nos pondremos en contacto contigo para agendar tu primera clase gratuita
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-white shadow-sm">
                                        <MapPin className="h-6 w-6 text-amber-700 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Nuestra Ubicación</div>
                                            <div className="text-gray-600">Calle Principal #123, Ciudad</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-white shadow-sm">
                                        <Phone className="h-6 w-6 text-amber-700 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Llámanos</div>
                                            <div className="text-gray-600">+57 (123) 456-7890</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-white shadow-sm">
                                        <Mail className="h-6 w-6 text-amber-700 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Escríbenos</div>
                                            <div className="text-gray-600">info@academialinaje.com</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-white shadow-sm">
                                        <Clock className="h-6 w-6 text-amber-700 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Horario</div>
                                            <div className="text-gray-600">Lunes a Sábado: 8:00 AM - 8:00 PM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-white p-8 shadow-xl">
                                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300">
                                    <div className="flex items-center space-x-2 text-amber-900 mb-2">
                                        <Gift className="h-5 w-5" />
                                        <span className="font-bold">¡Clase Gratuita Incluida!</span>
                                    </div>
                                    <p className="text-sm text-amber-800">
                                        Reserva ahora y recibe tu primera clase sin ningún costo
                                    </p>
                                </div>

                                <form onSubmit={submit} className="space-y-4">
                                    {/* ¿Para quién es la clase? */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            ¿Para quién es la clase demo? *
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div
                                                onClick={() => setData('is_for_child', false)}
                                                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                                                    !data.is_for_child
                                                        ? 'border-amber-500 bg-amber-50 shadow-md'
                                                        : 'border-gray-200 bg-white hover:border-amber-300'
                                                }`}
                                            >
                                                {!data.is_for_child && (
                                                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <div className="text-center">
                                                    <Users className="h-8 w-8 mx-auto mb-2 text-amber-700" />
                                                    <p className="font-semibold text-gray-900">Para mí</p>
                                                    <p className="text-xs text-gray-600 mt-1">Quiero aprender</p>
                                                </div>
                                            </div>
                                            <div
                                                onClick={() => setData('is_for_child', true)}
                                                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                                                    data.is_for_child
                                                        ? 'border-amber-500 bg-amber-50 shadow-md'
                                                        : 'border-gray-200 bg-white hover:border-amber-300'
                                                }`}
                                            >
                                                {data.is_for_child && (
                                                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <div className="text-center">
                                                    <Users className="h-8 w-8 mx-auto mb-2 text-amber-700" />
                                                    <p className="font-semibold text-gray-900">Para mi hijo/a</p>
                                                    <p className="text-xs text-gray-600 mt-1">Para un menor</p>
                                                </div>
                                            </div>
                                        </div>
                                        {errors.is_for_child && <p className="mt-2 text-sm text-red-600">{errors.is_for_child}</p>}
                                    </div>

                                    {/* Nombre del niño/a si es para su hijo */}
                                    {data.is_for_child && (
                                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nombre del niño/a *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.child_name}
                                                onChange={(e) => setData('child_name', e.target.value)}
                                                placeholder="Nombre completo del niño/a"
                                                required={data.is_for_child}
                                                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                            />
                                            {errors.child_name && <p className="mt-1 text-sm text-red-600">{errors.child_name}</p>}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {data.is_for_child ? 'Tu nombre (padre/madre/tutor) *' : 'Nombre completo *'}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder={data.is_for_child ? 'Tu nombre' : 'Tu nombre completo'}
                                            required
                                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="tu@email.com"
                                            required
                                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Teléfono *
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+57 123 456 7890"
                                            required
                                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            ¿Qué clase demo te interesa? *
                                        </label>
                                        {demoPrograms.length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {demoPrograms.map((program) => (
                                                    <div
                                                        key={program.id}
                                                        onClick={() => {
                                                            setData('instrument', program.name);
                                                            // Limpiar horario cuando se cambia de programa
                                                            if (data.instrument !== program.name) {
                                                                setData('preferred_schedule', '');
                                                            }
                                                        }}
                                                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                                                            data.instrument === program.name
                                                                ? 'border-amber-500 bg-amber-50 shadow-md'
                                                                : 'border-gray-200 bg-white hover:border-amber-300'
                                                        }`}
                                                    >
                                                        {data.instrument === program.name && (
                                                            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white">
                                                                <CheckCircle className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-start space-x-3">
                                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100">
                                                                <Music className="h-5 w-5 text-amber-700" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-gray-900 truncate">{program.name}</h4>
                                                                {program.description && (
                                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                                        {program.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-center">
                                                <p className="text-sm text-amber-800">
                                                    No hay clases demo disponibles en este momento
                                                </p>
                                            </div>
                                        )}
                                        {/* Hidden input para validación HTML requerida */}
                                        <input
                                            type="hidden"
                                            value={data.instrument}
                                            required
                                        />
                                        {errors.instrument && <p className="mt-2 text-sm text-red-600">{errors.instrument}</p>}

                                        {/* Selector de horarios - Solo mostrar si hay horarios disponibles */}
                                        {data.instrument && (() => {
                                            const selectedProgram = demoPrograms.find(p => p.name === data.instrument);
                                            const availableSchedules = selectedProgram?.schedules?.filter(s => s.has_capacity) || [];

                                            return availableSchedules.length > 0 && (
                                                <div className="mt-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                                                    <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Horarios Disponibles (Opcional)
                                                    </h5>
                                                    <p className="text-xs text-blue-700 mb-3">
                                                        Selecciona un horario de tu preferencia o déjanos tu disponibilidad en el mensaje
                                                    </p>
                                                    <div className="space-y-2">
                                                        {availableSchedules.map((schedule) => (
                                                            <div
                                                                key={schedule.id}
                                                                onClick={() => setData('preferred_schedule', `${schedule.days_of_week} ${schedule.start_time}-${schedule.end_time}`)}
                                                                className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-sm ${
                                                                    data.preferred_schedule === `${schedule.days_of_week} ${schedule.start_time}-${schedule.end_time}`
                                                                        ? 'border-blue-500 bg-white shadow-sm'
                                                                        : 'border-blue-200 bg-white/50 hover:border-blue-300'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-gray-900">
                                                                            {schedule.days_of_week}
                                                                        </p>
                                                                        <p className="text-xs text-gray-600">
                                                                            {schedule.start_time} - {schedule.end_time}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            Prof. {schedule.professor?.name ?? 'Sin asignar'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                                                            {schedule.available_slots} {schedule.available_slots === 1 ? 'cupo' : 'cupos'}
                                                                        </span>
                                                                        {data.preferred_schedule === `${schedule.days_of_week} ${schedule.start_time}-${schedule.end_time}` && (
                                                                            <CheckCircle className="h-5 w-5 text-blue-600" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Info adicional sobre la clase demo */}
                                        <div className="mt-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4">
                                            <h5 className="font-semibold text-blue-900 mb-2 flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                ¿Qué incluye tu clase demo gratuita?
                                            </h5>
                                            <ul className="space-y-1 text-xs text-blue-800">
                                                <li className="flex items-start">
                                                    <span className="mr-2">•</span>
                                                    <span>Sesión individual de 45-60 minutos con un profesor certificado</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="mr-2">•</span>
                                                    <span>Evaluación personalizada de tu nivel actual</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="mr-2">•</span>
                                                    <span>Plan de estudio recomendado según tus objetivos</span>
                                                </li>
                                                <li className="flex items-start">
                                                    <span className="mr-2">•</span>
                                                    <span>Sin compromiso y totalmente gratis</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cuéntanos más sobre ti (opcional)
                                        </label>
                                        <textarea
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            placeholder="Ejemplo: Nunca he tocado un instrumento pero siempre quise aprender... / Toqué piano hace años y quiero retomar... / Tengo un nivel intermedio y busco perfeccionar mi técnica..."
                                            rows={4}
                                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                        ></textarea>
                                        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                                        <p className="mt-1 text-xs text-gray-500">
                                            Comparte tu nivel actual, objetivos o cualquier pregunta que tengas
                                        </p>
                                    </div>

                                    {/* Qué pasa después */}
                                    <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
                                        <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                                            <Clock className="h-4 w-4 mr-2" />
                                            ¿Qué pasa después de enviar?
                                        </h5>
                                        <ol className="space-y-2 text-xs text-green-800">
                                            <li className="flex items-start">
                                                <span className="font-bold mr-2 text-green-600">1.</span>
                                                <span>Nuestro equipo revisará tu solicitud en las próximas 24 horas</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="font-bold mr-2 text-green-600">2.</span>
                                                <span>Te contactaremos por WhatsApp o correo para coordinar fecha y hora</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="font-bold mr-2 text-green-600">3.</span>
                                                <span>Recibirás la confirmación con todos los detalles de tu clase demo</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="font-bold mr-2 text-green-600">4.</span>
                                                <span>¡Disfruta tu primera clase completamente gratis!</span>
                                            </li>
                                        </ol>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing || !data.instrument}
                                        className="group w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        <span className="flex items-center justify-center">
                                            {processing ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Enviando tu solicitud...
                                                </>
                                            ) : (
                                                <>
                                                    <Gift className="mr-2 h-5 w-5" />
                                                    Reservar Mi Clase Gratis
                                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </span>
                                    </button>
                                    {!data.instrument && (
                                        <p className="text-xs text-center text-amber-700 mt-2">
                                            Por favor selecciona una clase demo para continuar
                                        </p>
                                    )}
                                    <p className="text-xs text-center text-gray-500">
                                        Al enviar, aceptas nuestros términos y condiciones
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-6">
                                <img
                                    src="/logo_academia.png"
                                    alt="Academia Linaje"
                                    className="h-14 w-auto"
                                />
                            </div>
                            <p className="text-gray-300 mb-6 text-lg">
                                Formando músicos con excelencia y pasión desde hace más de 10 años
                            </p>
                            <div className="inline-flex items-center space-x-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold mb-8">
                                <Gift className="h-4 w-4" />
                                <span>Tu primera clase es GRATIS</span>
                            </div>
                            <div className="text-sm text-gray-400 border-t border-gray-700 pt-8">
                                © 2025 Academia Linaje. Todos los derechos reservados.
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}

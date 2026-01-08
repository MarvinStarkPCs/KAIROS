import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Music, Users, Award, MapPin, Phone, Mail, Clock, Star, CheckCircle, Gift, ArrowRight, Play } from 'lucide-react';

export default function Propuesta1() {
    const { auth } = usePage<SharedData>().props;

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
                            <div className="flex items-center space-x-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg">
                                    <Music className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-gray-900">Academia Linaje</span>
                                    <span className="text-xs text-amber-700 font-medium">Escuela de Música</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
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

                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre completo *
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Tu nombre"
                                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="tu@email.com"
                                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Teléfono *
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="+57 123 456 7890"
                                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ¿Qué instrumento te interesa? *
                                        </label>
                                        <select className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all">
                                            <option>Selecciona un instrumento</option>
                                            <option>Piano</option>
                                            <option>Guitarra</option>
                                            <option>Canto</option>
                                            <option>Otros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mensaje (opcional)
                                        </label>
                                        <textarea
                                            placeholder="Cuéntanos sobre tu experiencia musical..."
                                            rows={3}
                                            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 transition-all"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:from-amber-700 hover:to-amber-800"
                                    >
                                        Reservar Mi Clase Gratis
                                    </button>
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
                            <div className="flex items-center justify-center space-x-3 mb-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 shadow-lg">
                                    <Music className="h-7 w-7" />
                                </div>
                                <span className="text-2xl font-bold">Academia Linaje</span>
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

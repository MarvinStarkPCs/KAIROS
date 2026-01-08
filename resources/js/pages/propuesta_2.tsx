import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Music, Users, Award, MapPin, Phone, Mail, Clock, Star, Gift, Calendar, UserCheck, BookOpen, Trophy, Target, Sparkles } from 'lucide-react';

export default function Propuesta2() {
    const { auth } = usePage<SharedData>().props;

    const steps = [
        {
            icon: Calendar,
            title: 'Reserva tu Clase Gratis',
            description: 'Agenda tu primera clase sin compromiso y conoce nuestras instalaciones y profesores.'
        },
        {
            icon: UserCheck,
            title: 'Conoce a tu Profesor',
            description: 'Te asignaremos un profesor experto según tu nivel e intereses musicales.'
        },
        {
            icon: BookOpen,
            title: 'Inicia tu Aprendizaje',
            description: 'Comienza tu viaje musical con un plan personalizado diseñado para ti.'
        },
        {
            icon: Trophy,
            title: 'Alcanza tus Metas',
            description: 'Participa en recitales, conciertos y logra tus objetivos musicales.'
        }
    ];

    const features = [
        {
            icon: Target,
            title: 'Metodología Personalizada',
            description: 'Cada estudiante es único. Adaptamos nuestro método de enseñanza a tu ritmo y estilo de aprendizaje.'
        },
        {
            icon: Award,
            title: 'Profesores Certificados',
            description: 'Nuestro equipo cuenta con formación profesional y años de experiencia en enseñanza musical.'
        },
        {
            icon: Users,
            title: 'Comunidad Activa',
            description: 'Forma parte de una familia musical con eventos, conciertos y oportunidades de colaboración.'
        },
        {
            icon: Sparkles,
            title: 'Instalaciones Modernas',
            description: 'Salas equipadas con instrumentos de calidad y tecnología para una experiencia óptima.'
        }
    ];

    const programs = [
        { name: 'Piano', level: 'Todos los niveles', color: 'from-amber-400 to-orange-400' },
        { name: 'Guitarra', level: 'Clásica • Acústica • Eléctrica', color: 'from-orange-400 to-red-400' },
        { name: 'Canto', level: 'Técnica vocal y escénica', color: 'from-amber-500 to-yellow-400' },
        { name: 'Violín', level: 'Desde principiante', color: 'from-orange-500 to-amber-500' },
        { name: 'Batería', level: 'Ritmo y coordinación', color: 'from-red-400 to-orange-500' },
        { name: 'Ensambles', level: 'Práctica grupal', color: 'from-yellow-400 to-amber-400' }
    ];

    return (
        <>
            <Head title="Academia Linaje - Primera Clase Gratis">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        {/* Top bar with free class offer */}
                        <div className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 py-2 -mx-6 px-6 text-center">
                            <div className="flex items-center justify-center space-x-2 text-sm font-semibold text-amber-900">
                                <Gift className="h-4 w-4" />
                                <span>¡PROMOCIÓN ESPECIAL! Primera clase completamente GRATIS</span>
                                <a href="#registro" className="underline hover:text-amber-700">Reserva aquí →</a>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-amber-700 to-amber-800 text-white">
                                    <Music className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-gray-900">Academia Linaje</span>
                                    <span className="text-xs text-amber-700">Más de 500 estudiantes</span>
                                </div>
                            </div>
                            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                                <a href="#programas" className="text-gray-600 hover:text-amber-700 transition-colors">Programas</a>
                                <a href="#proceso" className="text-gray-600 hover:text-amber-700 transition-colors">Cómo Funciona</a>
                                <a href="#testimonios" className="text-gray-600 hover:text-amber-700 transition-colors">Testimonios</a>
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-lg bg-amber-700 px-5 py-2 text-white hover:bg-amber-800 transition-all"
                                    >
                                        Mi Portal
                                    </Link>
                                ) : (
                                    <>
                                        <Link href={login()} className="text-gray-600 hover:text-amber-700 transition-colors">
                                            Acceso
                                        </Link>
                                        <a
                                            href="#registro"
                                            className="rounded-lg bg-amber-700 px-5 py-2 text-white hover:bg-amber-800 transition-all"
                                        >
                                            Clase Gratis
                                        </a>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden py-20 sm:py-28 bg-gradient-to-b from-white via-amber-50/30 to-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center max-w-4xl mx-auto space-y-8">
                            <div className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-200 px-5 py-2 text-sm font-bold text-amber-900">
                                <Music className="h-4 w-4" />
                                <span>+10 AÑOS DE EXPERIENCIA EN EDUCACIÓN MUSICAL</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                                Tu Camino Musical
                                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600">
                                    Comienza con una Clase Gratis
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                Descubre tu potencial musical con profesores expertos en un ambiente profesional.
                                No importa tu edad o nivel, tenemos el programa perfecto para ti.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a
                                    href="#registro"
                                    className="group rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-10 py-4 text-lg font-bold text-white shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
                                >
                                    Reservar Clase Gratis
                                    <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </a>
                                <a
                                    href="#proceso"
                                    className="rounded-xl border-2 border-gray-300 bg-white px-10 py-4 text-lg font-semibold text-gray-700 hover:border-amber-600 hover:text-amber-700 transition-all"
                                >
                                    Conocer Más
                                </a>
                            </div>

                            {/* Trust indicators */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-12 border-t border-gray-200">
                                <div>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">500+</div>
                                    <div className="text-sm text-gray-600 mt-1">Estudiantes Felices</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">15+</div>
                                    <div className="text-sm text-gray-600 mt-1">Profesores Expertos</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">10+</div>
                                    <div className="text-sm text-gray-600 mt-1">Años de Experiencia</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">98%</div>
                                    <div className="text-sm text-gray-600 mt-1">Tasa de Satisfacción</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-20 left-10 h-64 w-64 bg-amber-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 h-64 w-64 bg-orange-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </section>

                {/* How It Works - Process Section */}
                <section id="proceso" className="py-20 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Tu Viaje Musical en 4 Pasos
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Comenzar es fácil y sin riesgo con nuestra clase de prueba gratuita
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div key={index} className="relative">
                                        <div className="text-center space-y-4">
                                            <div className="relative inline-flex items-center justify-center">
                                                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur-xl opacity-30"></div>
                                                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                                                    <Icon className="h-10 w-10" />
                                                </div>
                                                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                                            <p className="text-gray-600">{step.description}</p>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-amber-300 to-orange-300"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-12 text-center">
                            <a
                                href="#registro"
                                className="inline-flex items-center space-x-2 rounded-xl bg-amber-700 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-amber-800 transition-all transform hover:-translate-y-1"
                            >
                                <Gift className="h-5 w-5" />
                                <span>Comenzar con Clase Gratis</span>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Programs Section */}
                <section id="programas" className="py-20 bg-gradient-to-br from-gray-50 to-amber-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Explora Nuestros Programas
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Ofrecemos clases para todos los instrumentos, edades y niveles
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {programs.map((program, index) => (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                                    <div className="relative">
                                        <div className={`inline-flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br ${program.color} text-white mb-4 shadow-lg`}>
                                            <Music className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{program.name}</h3>
                                        <p className="text-gray-600 mb-4">{program.level}</p>
                                        <div className="flex items-center text-sm text-amber-700 font-semibold">
                                            <span>Primera clase gratis</span>
                                            <span className="ml-auto">→</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                ¿Por Qué Academia Linaje?
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                La excelencia musical es nuestro compromiso
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="text-center space-y-4">
                                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700">
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonios" className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                Historias de Nuestros Estudiantes
                            </h2>
                            <p className="text-lg text-gray-600">
                                Ellos empezaron con una clase gratis, ahora son músicos apasionados
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-2xl p-8 shadow-lg">
                                    <div className="flex items-center space-x-1 mb-4">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} className="h-5 w-5 fill-amber-500 text-amber-500" />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 mb-6 italic leading-relaxed">
                                        "La clase gratis me permitió conocer el nivel profesional de la academia. Ahora llevo un año estudiando y he avanzado más de lo que imaginé."
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500"></div>
                                        <div>
                                            <div className="font-bold text-gray-900">Estudiante #{i}</div>
                                            <div className="text-sm text-gray-600">Programa de Piano</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA + Registration Section */}
                <section id="registro" className="py-20 bg-white">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6">
                        <div className="rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 p-12 shadow-2xl text-white text-center">
                            <div className="inline-flex items-center space-x-2 rounded-full bg-white/20 px-6 py-2 text-sm font-bold mb-6">
                                <Gift className="h-5 w-5" />
                                <span>OFERTA POR TIEMPO LIMITADO</span>
                            </div>

                            <h2 className="text-3xl sm:text-5xl font-bold mb-6">
                                Reserva Tu Primera Clase
                                <span className="block mt-2">100% Gratis</span>
                            </h2>

                            <p className="text-xl text-amber-50 mb-8 max-w-2xl mx-auto">
                                Sin compromiso, sin costo. Conoce nuestros profesores, instalaciones y metodología antes de decidir.
                            </p>

                            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 text-left shadow-xl">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Solicita tu Clase Gratis</h3>
                                <form className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Nombre completo"
                                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Correo electrónico"
                                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Teléfono"
                                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100"
                                    />
                                    <select className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100">
                                        <option>Selecciona tu instrumento</option>
                                        <option>Piano</option>
                                        <option>Guitarra</option>
                                        <option>Canto</option>
                                        <option>Violín</option>
                                        <option>Batería</option>
                                        <option>Otro</option>
                                    </select>
                                    <button
                                        type="submit"
                                        className="w-full rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 font-bold text-white hover:from-amber-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
                                    >
                                        Reservar Ahora
                                    </button>
                                    <p className="text-xs text-center text-gray-500">
                                        Te contactaremos en menos de 24 horas
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Info Section */}
                <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-start space-x-4">
                                <MapPin className="h-6 w-6 text-amber-700 flex-shrink-0 mt-1" />
                                <div>
                                    <div className="font-bold text-gray-900 mb-1">Ubicación</div>
                                    <div className="text-sm text-gray-600">Calle Principal #123, Ciudad</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Phone className="h-6 w-6 text-amber-700 flex-shrink-0 mt-1" />
                                <div>
                                    <div className="font-bold text-gray-900 mb-1">Teléfono</div>
                                    <div className="text-sm text-gray-600">+57 (123) 456-7890</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Mail className="h-6 w-6 text-amber-700 flex-shrink-0 mt-1" />
                                <div>
                                    <div className="font-bold text-gray-900 mb-1">Email</div>
                                    <div className="text-sm text-gray-600">info@academialinaje.com</div>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Clock className="h-6 w-6 text-amber-700 flex-shrink-0 mt-1" />
                                <div>
                                    <div className="font-bold text-gray-900 mb-1">Horario</div>
                                    <div className="text-sm text-gray-600">Lun-Sáb: 8AM - 8PM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-gray-900 text-white py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-orange-600">
                                    <Music className="h-6 w-6" />
                                </div>
                                <span className="text-xl font-bold">Academia Linaje</span>
                            </div>
                            <p className="text-gray-400 text-center max-w-md">
                                Formando músicos excepcionales desde hace más de una década
                            </p>
                            <div className="flex items-center space-x-2 text-sm">
                                <Gift className="h-4 w-4 text-amber-500" />
                                <span className="text-amber-500 font-semibold">Primera clase gratis para nuevos estudiantes</span>
                            </div>
                            <div className="text-sm text-gray-500 border-t border-gray-800 pt-6 w-full text-center">
                                © 2025 Academia Linaje. Todos los derechos reservados.
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

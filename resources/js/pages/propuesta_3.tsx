import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Music, Users, Award, MapPin, Phone, Mail, Clock, Star, Gift, Sparkles, CheckCircle2, Heart, Headphones, BookOpen } from 'lucide-react';

export default function Propuesta3() {
    const { auth } = usePage<SharedData>().props;

    const instruments = [
        { name: 'Piano', description: 'Clásico y versátil', students: '200+' },
        { name: 'Guitarra', description: 'Acústica y eléctrica', students: '150+' },
        { name: 'Canto', description: 'Técnica y expresión', students: '100+' },
        { name: 'Violín', description: 'Elegancia sonora', students: '80+' },
        { name: 'Batería', description: 'Ritmo y energía', students: '60+' },
        { name: 'Bajo', description: 'Fundamento musical', students: '40+' },
    ];

    const values = [
        {
            icon: Heart,
            title: 'Pasión por la Música',
            description: 'Cada clase está diseñada para inspirar y desarrollar el amor por la música.'
        },
        {
            icon: Award,
            title: 'Excelencia Educativa',
            description: 'Profesores con títulos universitarios y experiencia profesional comprobada.'
        },
        {
            icon: Users,
            title: 'Atención Personalizada',
            description: 'Grupos reducidos y seguimiento individual para garantizar tu progreso.'
        },
        {
            icon: Sparkles,
            title: 'Ambiente Inspirador',
            description: 'Instalaciones diseñadas para estimular la creatividad y el aprendizaje.'
        }
    ];

    const benefits = [
        'Clases individuales o grupales',
        'Horarios flexibles de lunes a sábado',
        'Material didáctico incluido',
        'Acceso a salas de práctica',
        'Participación en recitales',
        'Certificados de nivel',
        'Comunidad musical activa',
        'Eventos y masterclasses'
    ];

    return (
        <>
            <Head title="Academia Linaje - Educación Musical de Excelencia">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-white">
                {/* Minimal Header */}
                <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="flex items-center justify-between h-20">
                            <Link href="/" className="flex items-center space-x-3 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white">
                                        <Music className="h-6 w-6" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-900">Academia Linaje</div>
                                    <div className="text-xs text-amber-700 font-medium">Educación Musical</div>
                                </div>
                            </Link>

                            <nav className="hidden md:flex items-center space-x-8">
                                <a href="#instrumentos" className="text-sm font-medium text-gray-600 hover:text-amber-700 transition-colors">
                                    Instrumentos
                                </a>
                                <a href="#nosotros" className="text-sm font-medium text-gray-600 hover:text-amber-700 transition-colors">
                                    Nosotros
                                </a>
                                <a href="#contacto" className="text-sm font-medium text-gray-600 hover:text-amber-700 transition-colors">
                                    Contacto
                                </a>
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-all"
                                    >
                                        Portal
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-sm font-medium text-gray-600 hover:text-amber-700 transition-colors"
                                        >
                                            Acceso
                                        </Link>
                                        <a
                                            href="#contacto"
                                            className="rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-2.5 text-sm font-medium text-white hover:from-amber-700 hover:to-orange-700 transition-all"
                                        >
                                            Comenzar
                                        </a>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Elegant Hero Section */}
                <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
                    {/* Subtle background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-white to-white"></div>

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="mx-auto max-w-4xl text-center space-y-10">
                            {/* Free Class Badge - Elegant */}
                            <div className="inline-flex items-center space-x-3 rounded-full border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-3 shadow-sm">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                                    <Gift className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                    Tu primera clase es nuestra invitación
                                </span>
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                                Donde la música
                                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                                    toma vida
                                </span>
                            </h1>

                            <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                                Una academia dedicada a formar músicos con excelencia,
                                <span className="font-semibold text-gray-900"> comenzando con una clase completamente gratis</span> para que descubras
                                si este es tu camino.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                <a
                                    href="#contacto"
                                    className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-10 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:from-amber-700 hover:to-orange-700"
                                >
                                    Solicitar Clase Gratis
                                    <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                                <a
                                    href="#instrumentos"
                                    className="inline-flex items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-10 py-4 text-lg font-semibold text-gray-700 hover:border-amber-600 hover:text-amber-700 transition-all"
                                >
                                    Explorar Programas
                                </a>
                            </div>

                            {/* Minimal Stats */}
                            <div className="flex items-center justify-center gap-12 pt-12 text-center">
                                <div className="space-y-1">
                                    <div className="text-4xl font-bold text-gray-900">10+</div>
                                    <div className="text-sm text-gray-600">Años</div>
                                </div>
                                <div className="h-12 w-px bg-gray-300"></div>
                                <div className="space-y-1">
                                    <div className="text-4xl font-bold text-gray-900">500+</div>
                                    <div className="text-sm text-gray-600">Estudiantes</div>
                                </div>
                                <div className="h-12 w-px bg-gray-300"></div>
                                <div className="space-y-1">
                                    <div className="text-4xl font-bold text-gray-900">15+</div>
                                    <div className="text-sm text-gray-600">Profesores</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Instruments Grid - Clean Design */}
                <section id="instrumentos" className="py-24 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16 max-w-3xl mx-auto">
                            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                                Encuentra tu instrumento
                            </h2>
                            <p className="text-lg text-gray-600">
                                Cada instrumento es un nuevo mundo por descubrir. Comienza tu exploración con una clase gratuita.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {instruments.map((instrument, index) => (
                                <div
                                    key={index}
                                    className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-8 transition-all hover:border-amber-500 hover:shadow-xl"
                                >
                                    <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 opacity-0 blur-2xl transition-opacity group-hover:opacity-100"></div>

                                    <div className="relative space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Music className="h-8 w-8 text-amber-700" />
                                            <span className="text-sm font-medium text-gray-500">{instrument.students}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{instrument.name}</h3>
                                            <p className="text-sm text-gray-600">{instrument.description}</p>
                                        </div>
                                        <div className="flex items-center text-sm font-medium text-amber-700 pt-2">
                                            <span>Primera clase gratis</span>
                                            <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values Section - Minimal */}
                <section id="nosotros" className="py-24 bg-gradient-to-b from-gray-50 to-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16 max-w-3xl mx-auto">
                            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                                Nuestro compromiso
                            </h2>
                            <p className="text-lg text-gray-600">
                                Más que enseñar música, cultivamos la pasión y el talento de cada estudiante
                            </p>
                        </div>

                        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                            {values.map((value, index) => {
                                const Icon = value.icon;
                                return (
                                    <div key={index} className="text-center space-y-4">
                                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
                                            <Icon className="h-8 w-8 text-amber-700" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{value.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 bg-white">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                                Todo incluido en tu membresía
                            </h2>
                            <p className="text-lg text-gray-600">
                                Después de tu clase gratuita, descubre todos los beneficios de ser parte de nuestra comunidad
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-md"
                                >
                                    <CheckCircle2 className="h-5 w-5 text-amber-700 flex-shrink-0" />
                                    <span className="text-sm font-medium text-gray-700">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Elegant CTA Section */}
                <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
                    {/* Subtle pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-amber-500 blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500 blur-3xl"></div>
                    </div>

                    <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-8">
                        <div className="inline-flex items-center space-x-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium backdrop-blur-sm">
                            <Headphones className="h-4 w-4" />
                            <span>Sin compromiso • Sin costos ocultos</span>
                        </div>

                        <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
                            Comienza tu historia musical
                            <span className="block mt-2 text-amber-400">con una clase gratis</span>
                        </h2>

                        <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            Queremos que experimentes nuestra metodología y conozcas a nuestros profesores antes de tomar cualquier decisión.
                            Por eso, tu primera clase es completamente gratuita.
                        </p>

                        <div className="pt-6">
                            <a
                                href="#contacto"
                                className="inline-flex items-center space-x-2 rounded-xl bg-white px-10 py-4 text-lg font-semibold text-gray-900 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                            >
                                <span>Agendar Clase Gratis</span>
                                <Gift className="h-5 w-5 text-amber-700" />
                            </a>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-8 pt-12 border-t border-white/20">
                            <div className="space-y-2">
                                <BookOpen className="h-8 w-8 text-amber-400 mx-auto" />
                                <div className="font-semibold">Primera Clase</div>
                                <div className="text-sm text-gray-400">100% Gratuita</div>
                            </div>
                            <div className="space-y-2">
                                <Users className="h-8 w-8 text-amber-400 mx-auto" />
                                <div className="font-semibold">Atención Personal</div>
                                <div className="text-sm text-gray-400">Profesor dedicado</div>
                            </div>
                            <div className="space-y-2">
                                <Award className="h-8 w-8 text-amber-400 mx-auto" />
                                <div className="font-semibold">Sin Compromiso</div>
                                <div className="text-sm text-gray-400">Decide después</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials - Minimal */}
                <section className="py-24 bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                                Voces de nuestra comunidad
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {['María G.', 'Carlos R.', 'Ana M.'].map((name, index) => (
                                <div key={index} className="rounded-2xl border-2 border-gray-200 bg-white p-8 space-y-6">
                                    <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">
                                        "La clase gratis me dio la confianza para dar el primer paso. Ahora no puedo imaginar mi vida sin música."
                                    </p>
                                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500"></div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{name}</div>
                                            <div className="text-sm text-gray-600">Estudiante</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Form - Clean */}
                <section id="contacto" className="py-24 bg-gradient-to-b from-gray-50 to-white">
                    <div className="mx-auto max-w-5xl px-4 sm:px-6">
                        <div className="grid gap-12 lg:grid-cols-5">
                            <div className="lg:col-span-2 space-y-6">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                    Hablemos de música
                                </h2>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Completa el formulario y nos pondremos en contacto para agendar tu clase gratuita en el horario que mejor te convenga.
                                </p>

                                <div className="space-y-4 pt-6">
                                    <div className="flex items-start space-x-3">
                                        <MapPin className="h-5 w-5 text-amber-700 mt-1 flex-shrink-0" />
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">Calle Principal #123</div>
                                            <div className="text-gray-600">Ciudad, Colombia</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Phone className="h-5 w-5 text-amber-700 mt-1 flex-shrink-0" />
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">+57 (123) 456-7890</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Mail className="h-5 w-5 text-amber-700 mt-1 flex-shrink-0" />
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">info@academialinaje.com</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Clock className="h-5 w-5 text-amber-700 mt-1 flex-shrink-0" />
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-900">Lunes a Sábado</div>
                                            <div className="text-gray-600">8:00 AM - 8:00 PM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-3">
                                <div className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-lg">
                                    <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4">
                                        <div className="flex items-center space-x-2 text-amber-900">
                                            <Gift className="h-5 w-5" />
                                            <span className="text-sm font-semibold">Solicita tu clase gratuita</span>
                                        </div>
                                    </div>

                                    <form className="space-y-5">
                                        <div className="grid sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nombre
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none transition-colors"
                                                    placeholder="Tu nombre"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Apellido
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none transition-colors"
                                                    placeholder="Tu apellido"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Correo electrónico
                                            </label>
                                            <input
                                                type="email"
                                                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none transition-colors"
                                                placeholder="correo@ejemplo.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none transition-colors"
                                                placeholder="+57 123 456 7890"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Instrumento de interés
                                            </label>
                                            <select className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none transition-colors">
                                                <option value="">Selecciona un instrumento</option>
                                                <option>Piano</option>
                                                <option>Guitarra</option>
                                                <option>Canto</option>
                                                <option>Violín</option>
                                                <option>Batería</option>
                                                <option>Bajo</option>
                                                <option>Otro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mensaje (opcional)
                                            </label>
                                            <textarea
                                                rows={3}
                                                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                                                placeholder="Cuéntanos sobre tu experiencia musical o dudas..."
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 font-semibold text-white hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                                        >
                                            Solicitar Clase Gratuita
                                        </button>
                                        <p className="text-xs text-center text-gray-500">
                                            Nos pondremos en contacto contigo en menos de 24 horas
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Minimal Footer */}
                <footer className="border-t border-gray-200 bg-white py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="flex flex-col items-center space-y-6">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 text-white">
                                    <Music className="h-5 w-5" />
                                </div>
                                <span className="text-lg font-bold text-gray-900">Academia Linaje</span>
                            </div>
                            <p className="text-sm text-gray-600 text-center max-w-md">
                                Transformando vidas a través de la educación musical desde 2014
                            </p>
                            <div className="flex items-center space-x-2 text-sm">
                                <Gift className="h-4 w-4 text-amber-700" />
                                <span className="text-amber-700 font-medium">Primera clase sin costo</span>
                            </div>
                            <div className="text-sm text-gray-500 pt-6 border-t border-gray-200 w-full text-center">
                                © 2025 Academia Linaje. Todos los derechos reservados.
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

import { dashboard, login,  } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Music, Users, Award, MapPin, Phone, Mail, Clock, Star } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const programs = [
        {
            icon: Music,
            title: 'Piano',
            description: 'Clases personalizadas desde nivel principiante hasta avanzado.',
            duration: 'Desde 1 hora/semana'
        },
        {
            icon: Music,
            title: 'Guitarra',
            description: 'Aprende guitarra clásica, acústica o eléctrica con expertos.',
            duration: 'Desde 1 hora/semana'
        },
        {
            icon: Music,
            title: 'Canto',
            description: 'Técnica vocal, repertorio y preparación escénica.',
            duration: 'Desde 1 hora/semana'
        },
        {
            icon: Users,
            title: 'Clases Grupales',
            description: 'Ensambles, coros y talleres de música en grupo.',
            duration: 'Consultar horarios'
        }
    ];

    const testimonials = [
        {
            name: 'María González',
            role: 'Estudiante de Piano',
            content: 'La mejor decisión fue inscribirme en Academia Linaje. Los profesores son excepcionales.',
            rating: 5
        },
        {
            name: 'Carlos Rodríguez',
            role: 'Padre de familia',
            content: 'Mi hijo ha progresado increíblemente. El ambiente es profesional y acogedor.',
            rating: 5
        },
        {
            name: 'Ana Martínez',
            role: 'Estudiante de Canto',
            content: 'Excelente metodología y atención personalizada. Totalmente recomendado.',
            rating: 5
        }
    ];

    return (
        <>
            <Head title="Academia Linaje - Escuela de Música">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            
            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
                    <div className="mx-auto max-w-7xl px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-700 to-amber-900 text-white shadow-lg">
                                    <Music className="h-7 w-7" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-gray-900">Academia Linaje</span>
                                    <span className="text-xs text-gray-600">Escuela de Música</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-amber-900 transition-all"
                                    >
                                        Mi Portal
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-sm font-medium text-gray-700 hover:text-amber-800 transition-colors"
                                        >
                                            Acceso
                                        </Link>
                                        <a
                                            href="#contacto"
                                            className="rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-amber-900 transition-all"
                                        >
                                            Inscríbete
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 py-20 lg:py-32">
                    <div className="absolute inset-0 -z-10 opacity-10">
                        <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-amber-400 blur-3xl"></div>
                        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-orange-400 blur-3xl"></div>
                    </div>
                    
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center space-x-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900">
                                    <Award className="h-4 w-4" />
                                    <span>Más de 10 años formando músicos</span>
                                </div>
                                
                                <h1 className="text-5xl font-bold leading-tight text-gray-900 lg:text-6xl">
                                    Descubre tu
                                    <span className="block text-amber-800">
                                        Talento Musical
                                    </span>
                                    en Academia Linaje
                                </h1>
                                
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    Clases de piano, guitarra, canto y más. Profesores certificados, 
                                    metodología personalizada y un espacio diseñado para que desarrolles 
                                    todo tu potencial artístico.
                                </p>
                                
                                <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                                    <a
                                        href="#programas"
                                        className="flex items-center justify-center rounded-lg bg-amber-800 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-amber-900 transition-all"
                                    >
                                        Ver Programas
                                    </a>
                                    <a
                                        href="#contacto"
                                        className="flex items-center justify-center rounded-lg border-2 border-amber-800 bg-white px-8 py-4 text-base font-semibold text-amber-900 hover:bg-amber-50 transition-all"
                                    >
                                        Agenda una Clase
                                    </a>
                                </div>

                                {/* Info rápida */}
                                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-amber-200">
                                    <div>
                                        <div className="text-3xl font-bold text-amber-900">500+</div>
                                        <div className="text-sm text-gray-600">Estudiantes</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-amber-900">15+</div>
                                        <div className="text-sm text-gray-600">Profesores</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-amber-900">10+</div>
                                        <div className="text-sm text-gray-600">Instrumentos</div>
                                    </div>
                                </div>
                            </div>

                            {/* Image placeholder */}
                            <div className="relative">
                                <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-200 to-orange-200 shadow-2xl overflow-hidden">
                                    <div className="flex h-full items-center justify-center">
                                        <Music className="h-48 w-48 text-amber-800 opacity-20" />
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 -left-6 rounded-xl bg-white p-6 shadow-xl">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                                            <Star className="h-6 w-6 text-amber-700" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">Calificación</div>
                                            <div className="flex items-center space-x-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Programas Section */}
                <section id="programas" className="py-20 bg-white">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Nuestros Programas
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Ofrecemos clases para todas las edades y niveles
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {programs.map((program, index) => {
                                const Icon = program.icon;
                                return (
                                    <div
                                        key={index}
                                        className="rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:border-amber-300 hover:shadow-xl"
                                    >
                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                                            <Icon className="h-7 w-7" />
                                        </div>
                                        <h3 className="mb-2 text-xl font-bold text-gray-900">{program.title}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                                        <div className="flex items-center text-xs text-amber-800 font-medium">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {program.duration}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Lo que Dicen Nuestros Estudiantes
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="rounded-xl bg-white p-6 shadow-lg">
                                    <div className="flex items-center space-x-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contacto" className="py-20 bg-white">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid gap-12 lg:grid-cols-2 items-center">
                            <div>
                                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                                    Visítanos o Contáctanos
                                </h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    Agenda una clase de prueba gratuita y conoce nuestras instalaciones
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <MapPin className="h-6 w-6 text-amber-800 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Dirección</div>
                                            <div className="text-gray-600">Calle Principal #123, Ciudad</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <Phone className="h-6 w-6 text-amber-800 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Teléfono</div>
                                            <div className="text-gray-600">+57 (123) 456-7890</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <Mail className="h-6 w-6 text-amber-800 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Email</div>
                                            <div className="text-gray-600">info@academialinaje.com</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <Clock className="h-6 w-6 text-amber-800 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Horario</div>
                                            <div className="text-gray-600">Lunes a Sábado: 8:00 AM - 8:00 PM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Solicita Información</h3>
                                <form className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Nombre completo"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Teléfono"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                                    />
                                    <textarea
                                        placeholder="Mensaje"
                                        rows={4}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                                    ></textarea>
                                    <button
                                        type="submit"
                                        className="w-full rounded-lg bg-amber-800 px-6 py-3 font-semibold text-white hover:bg-amber-900 transition-all"
                                    >
                                        Enviar Solicitud
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-gray-50 py-12">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-2 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-800 text-white">
                                    <Music className="h-6 w-6" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">Academia Linaje</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Formando músicos con excelencia y pasión
                            </p>
                            <div className="text-sm text-gray-500">
                                © 2024 Academia Linaje. Todos los derechos reservados.
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
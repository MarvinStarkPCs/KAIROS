import { login } from '@/routes';
import * as programas_academicos from '@/routes/programas_academicos';
import { type SharedData } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import {
    Music, Music2, Music3, Music4, ListMusic, AudioLines, AudioWaveform, Waves,
    Piano, Guitar, Drum, Mic, Mic2, MicVocal, Speaker, Megaphone,
    Disc, Disc2, Disc3, DiscAlbum, PlayCircle, Headphones, Headset,
    Volume2, Radio, GraduationCap, School, Library, BookOpen,
    Award, Trophy, Medal, Crown, Users, Baby, PersonStanding,
    Palette, Brush, Sparkles, Star, Heart, Zap, Flame,
    Sun, Moon, Rainbow, Bell, BellRing, PartyPopper,
    Gift, Cake, MapPin, Phone, Mail, Clock, CheckCircle, ArrowRight,
    ChevronLeft, ChevronRight,
    type LucideIcon,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

// Mapa de iconos para programas académicos
const ICON_MAP: Record<string, LucideIcon> = {
    music: Music, music2: Music2, music3: Music3, music4: Music4,
    listMusic: ListMusic, audioLines: AudioLines, audioWaveform: AudioWaveform, waves: Waves,
    piano: Piano, guitar: Guitar, drum: Drum,
    mic: Mic, mic2: Mic2, micVocal: MicVocal, speaker: Speaker, megaphone: Megaphone,
    disc: Disc, disc2: Disc2, disc3: Disc3, discAlbum: DiscAlbum, playCircle: PlayCircle,
    headphones: Headphones, headset: Headset, volume2: Volume2, radio: Radio,
    graduationCap: GraduationCap, school: School, library: Library, bookOpen: BookOpen,
    award: Award, trophy: Trophy, medal: Medal, crown: Crown,
    users: Users, baby: Baby, personStanding: PersonStanding,
    palette: Palette, brush: Brush, sparkles: Sparkles, star: Star,
    heart: Heart, zap: Zap, flame: Flame,
    sun: Sun, moon: Moon, rainbow: Rainbow,
    bell: Bell, bellRing: BellRing, partyPopper: PartyPopper,
    gift: Gift, cake: Cake,
};

const getIconComponent = (iconName: string | undefined | null): LucideIcon => {
    if (!iconName) return Music;
    return ICON_MAP[iconName] || Music;
};

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

interface AcademicProgramData {
    id: number;
    name: string;
    description: string | null;
    monthly_fee: string;
    icon: string | null;
    color: string | null;
}

interface WelcomeProps extends SharedData {
    demoPrograms: DemoProgram[];
    academicPrograms: AcademicProgramData[];
}

export default function Welcome() {
    const { auth, demoPrograms, academicPrograms } = usePage<WelcomeProps>().props;

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

    // Paginador de programas
    const PROGRAMS_PER_PAGE = 3;
    const [programPage, setProgramPage] = useState(0);
    const totalProgramPages = Math.ceil(academicPrograms.length / PROGRAMS_PER_PAGE);
    const paginatedPrograms = academicPrograms.slice(
        programPage * PROGRAMS_PER_PAGE,
        (programPage + 1) * PROGRAMS_PER_PAGE,
    );

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
            <Head title="Academia de Música en Las Llanadas | Primera Clase GRATIS">
                {/* SEO Meta Tags */}
                <meta name="description" content="Academia Linaje - Clases de piano, guitarra, canto y más en Las Llanadas. Profesores certificados, metodología personalizada. ¡Tu primera clase es totalmente GRATIS! Horario: Lunes a Sábado." />
                <meta name="keywords" content="academia de música, clases de piano, clases de guitarra, clases de canto, escuela de música Las Llanadas, academia musical, clases de música para niños, clases de música para adultos, Academia Linaje, clase gratis de música, aprender instrumento musical" />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="Academia Linaje" />
                <link rel="canonical" href="https://academialinaje.com" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://academialinaje.com" />
                <meta property="og:title" content="Academia Linaje | Clases de Música - Primera Clase GRATIS" />
                <meta property="og:description" content="Aprende piano, guitarra, canto y más con profesores certificados. Metodología personalizada según tu nivel. ¡Primera clase totalmente gratis!" />
                <meta property="og:image" content="https://academialinaje.com/logo_academia.png" />
                <meta property="og:locale" content="es_CO" />
                <meta property="og:site_name" content="Academia Linaje" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Academia Linaje | Clases de Música - Primera Clase GRATIS" />
                <meta name="twitter:description" content="Aprende piano, guitarra, canto y más con profesores certificados. ¡Tu primera clase es completamente gratis!" />
                <meta name="twitter:image" content="https://academialinaje.com/logo_academia.png" />

                {/* Geo Tags */}
                <meta name="geo.region" content="CO" />
                <meta name="geo.placename" content="Las Llanadas" />

                {/* JSON-LD Structured Data */}
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "MusicSchool",
                    "name": "Academia Linaje",
                    "description": "Academia de música con clases de piano, guitarra, canto y más. Profesores certificados con metodología personalizada.",
                    "url": "https://academialinaje.com",
                    "logo": "https://academialinaje.com/logo_academia.png",
                    "image": "https://academialinaje.com/logo_academia.png",
                    "telephone": "+573004218146",
                    "email": "Linajeacademia@gmail.com",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Calle 11 #25A - 15",
                        "addressLocality": "Las Llanadas",
                        "addressCountry": "CO"
                    },
                    "openingHoursSpecification": [
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                            "opens": "08:30",
                            "closes": "12:00"
                        },
                        {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                            "opens": "14:00",
                            "closes": "18:00"
                        }
                    ],
                    "sameAs": [
                        "https://wa.me/573004218146"
                    ],
                    "priceRange": "$$",
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.9",
                        "reviewCount": "500"
                    },
                    "hasOfferCatalog": {
                        "@type": "OfferCatalog",
                        "name": "Programas Musicales",
                        "itemListElement": [
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Course",
                                    "name": "Clase Demo Gratuita",
                                    "description": "Primera clase de música completamente gratis con profesor certificado"
                                },
                                "price": "0",
                                "priceCurrency": "COP"
                            }
                        ]
                    }
                })}</script>

                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-card">
                {/* Header */}
                <header role="banner" className="bg-card sticky top-0 z-50 shadow-md border-b-2 border-amber-600/40">
                    <nav aria-label="Navegación principal" className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
                        <div className="flex items-center justify-between">
                            <a href="/" className="flex items-center" aria-label="Academia Linaje - Inicio">
                                <img
                                    src="/logo_academia_black.png"
                                    alt="Academia Linaje - Escuela de Música en Las Llanadas"
                                    className="h-12 w-auto dark:hidden"
                                    width="150"
                                    height="48"
                                    fetchPriority="high"
                                    decoding="async"
                                />
                                <img
                                    src="/logo_academia_white.png"
                                    alt="Academia Linaje - Escuela de Música en Las Llanadas"
                                    className="h-12 w-auto hidden dark:block"
                                    width="150"
                                    height="48"
                                    fetchPriority="high"
                                    decoding="async"
                                />
                            </a>
                            <div className="flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href={programas_academicos.index().url}
                                        className="rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:from-amber-700 hover:to-amber-800 transition-all hover:shadow-lg"
                                    >
                                        Mi Portal
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="hidden sm:block text-sm font-medium text-amber-800 dark:text-amber-200 hover:text-amber-950 transition-colors"
                                        >
                                            Acceso
                                        </Link>
                                        <a
                                            href="#formulario-clase-gratis"
                                            className="rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:from-amber-700 hover:to-amber-800"
                                        >
                                            Clase Gratis
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>
                </header>

                <main>
                {/* Hero Section with Free Class Highlight */}
                <section aria-label="Bienvenida - Academia de Música" className="relative overflow-hidden bg-gradient-to-br from-amber-50 dark:from-amber-900/40 via-orange-50 dark:via-orange-900/40 to-amber-50 dark:to-amber-900/40 py-16 sm:py-24 lg:py-32">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 -z-10 opacity-10">
                        <div className="absolute top-20 left-0 h-96 w-96 rounded-full bg-amber-500 blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500 blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        {/* Free Class Badge → lleva al formulario */}
                        <div className="flex justify-center mb-8">
                            <a
                                href="#formulario-clase-gratis"
                                className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-white shadow-xl animate-bounce-slow hover:from-amber-700 hover:to-orange-700 hover:shadow-2xl transition-all cursor-pointer no-underline"
                            >
                                <Gift className="h-5 w-5" />
                                <span className="text-sm font-bold uppercase tracking-wide">¡Primera Clase Totalmente GRATIS!</span>
                                <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>

                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
                            <div className="space-y-8 text-center lg:text-left">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
                                    Despierta el
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                                        Músico que hay en ti
                                    </span>
                                </h1>

                                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                                    Aprende piano, guitarra, canto y más con profesores certificados.
                                    <span className="font-bold text-amber-800 dark:text-amber-200"> Tu primera clase es completamente gratis</span> para que
                                    conozcas nuestra metodología.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <a
                                        href="#formulario-clase-gratis"
                                        className="group flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-4 text-base font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:from-amber-700 hover:to-amber-800 transform hover:-translate-y-1"
                                    >
                                        Reserva tu Clase Gratis
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                    <a
                                        href="#programas"
                                        className="flex items-center justify-center rounded-xl border-2 border-amber-700 bg-card px-8 py-4 text-base font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-50 dark:hover:bg-amber-800/40 transition-all transform hover:-translate-y-1"
                                    >
                                        Ver Programas
                                    </a>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-amber-200 dark:border-amber-700">
                                    <div>
                                        <div className="text-3xl sm:text-4xl font-bold text-amber-800 dark:text-amber-200">500+</div>
                                        <div className="text-sm text-muted-foreground">Estudiantes Activos</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl sm:text-4xl font-bold text-amber-800 dark:text-amber-200">15+</div>
                                        <div className="text-sm text-muted-foreground">Profesores</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl sm:text-4xl font-bold text-amber-800 dark:text-amber-200">98%</div>
                                        <div className="text-sm text-muted-foreground">Satisfacción</div>
                                    </div>
                                </div>
                            </div>

                            {/* Hero Video */}
                            <div className="relative">
                                <div className="relative aspect-video rounded-3xl bg-gradient-to-br from-amber-300 to-orange-300 shadow-2xl overflow-hidden">
                                    <video
                                        className="absolute inset-0 w-full h-full object-cover"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        poster=""
                                        aria-label="Video promocional de Academia Linaje - Clases de música"
                                        title="Academia Linaje - Aprende música con nosotros"
                                    >
                                        <source src="/linaje.mp4" type="video/mp4" />
                                        Tu navegador no soporta el elemento de video.
                                    </video>
                                </div>
                                {/* Floating card */}
                                <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 rounded-xl sm:rounded-2xl bg-card p-3 sm:p-6 shadow-2xl">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="flex h-9 w-9 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-100 dark:from-amber-800/50 to-orange-100 dark:to-orange-800/50">
                                            <Award className="h-5 w-5 sm:h-8 sm:w-8 text-amber-700 dark:text-amber-300" />
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm font-semibold text-foreground">+10 años</div>
                                            <div className="text-[10px] sm:text-xs text-muted-foreground">Formando músicos profesionales</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section aria-label="Beneficios de Academia Linaje" className="py-20 bg-card">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                                ¿Por qué elegir Academia Linaje?
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Más que una academia, somos tu comunidad musical
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-4 p-6 rounded-xl bg-gradient-to-br from-amber-50 dark:from-amber-900/40 to-orange-50 dark:to-orange-900/40 hover:shadow-lg transition-all"
                                >
                                    <CheckCircle className="h-6 w-6 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-1" />
                                    <span className="text-foreground font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Programs Section */}
                <section id="programas" aria-label="Programas musicales disponibles" className="py-20 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/50 dark:to-orange-950/40">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                                Nuestros Programas
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Encuentra el programa perfecto para ti
                            </p>
                        </div>

                        {academicPrograms.length > 0 ? (
                            <>
                                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {paginatedPrograms.map((program) => {
                                        const IconComponent = getIconComponent(program.icon);
                                        const programColor = program.color || '#d97706';
                                        return (
                                            <a
                                                key={program.id}
                                                href="/matricula"
                                                className="group rounded-2xl border-2 border-border bg-card p-8 transition-all hover:shadow-2xl transform hover:-translate-y-2 block no-underline"
                                                style={{ '--program-color': programColor } as React.CSSProperties}
                                            >
                                                <div
                                                    className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl transition-all"
                                                    style={{
                                                        backgroundColor: `${programColor}15`,
                                                    }}
                                                >
                                                    <IconComponent
                                                        className="h-8 w-8 transition-all"
                                                        style={{ color: programColor }}
                                                    />
                                                </div>
                                                <h3 className="mb-2 text-xl font-bold text-foreground group-hover:text-amber-800 dark:hover:text-amber-200 transition-colors">{program.name}</h3>
                                                {program.description && (
                                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{program.description}</p>
                                                )}
                                                <div className="flex items-center font-semibold text-sm transition-transform group-hover:translate-x-1" style={{ color: programColor }}>
                                                    Matricúlate <ArrowRight className="h-4 w-4 ml-1" />
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>

                                {/* Paginador */}
                                {totalProgramPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-10">
                                        <button
                                            onClick={() => setProgramPage((p) => Math.max(0, p - 1))}
                                            disabled={programPage === 0}
                                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-300 dark:border-amber-700 bg-card text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-800/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <div className="flex items-center gap-2">
                                            {Array.from({ length: totalProgramPages }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setProgramPage(i)}
                                                    className={`h-3 w-3 rounded-full transition-all ${
                                                        i === programPage
                                                            ? 'bg-amber-600 scale-125'
                                                            : 'bg-amber-200 hover:bg-amber-400'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setProgramPage((p) => Math.min(totalProgramPages - 1, p + 1))}
                                            disabled={programPage === totalProgramPages - 1}
                                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-300 dark:border-amber-700 bg-card text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-800/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground">Próximamente más programas disponibles.</p>
                        )}
                    </div>
                </section>

                {/* Free Class CTA Section */}
                <section id="clase-gratis" aria-label="Clase gratis de música" className="py-20 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
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
                                href="#formulario-clase-gratis"
                                className="group rounded-xl bg-card px-8 py-4 text-lg font-bold text-amber-700 dark:text-amber-300 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
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
                <section aria-label="Testimonios de estudiantes" className="py-20 bg-card">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                                Historias de Éxito
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Lo que dicen nuestros estudiantes
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="rounded-2xl bg-gradient-to-br from-amber-50 dark:from-amber-900/40 to-orange-50 dark:to-orange-900/40 p-8 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-center space-x-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-6 italic">"La clase gratis me convenció al instante. Los profesores son increíbles y las instalaciones de primera."</p>
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400"></div>
                                    <div>
                                        <div className="font-bold text-foreground">María González</div>
                                        <div className="text-sm text-muted-foreground">Estudiante de Piano</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-gradient-to-br from-amber-50 dark:from-amber-900/40 to-orange-50 dark:to-orange-900/40 p-8 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-center space-x-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-6 italic">"Después de la primera clase gratis supe que este era el lugar perfecto para aprender. ¡Ya llevo 2 años!"</p>
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400"></div>
                                    <div>
                                        <div className="font-bold text-foreground">Carlos Rodríguez</div>
                                        <div className="text-sm text-muted-foreground">Estudiante de Guitarra</div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-gradient-to-br from-amber-50 dark:from-amber-900/40 to-orange-50 dark:to-orange-900/40 p-8 shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-center space-x-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground mb-6 italic">"La atención personalizada desde la primera clase gratuita hace toda la diferencia. Excelente metodología."</p>
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400"></div>
                                    <div>
                                        <div className="font-bold text-foreground">Ana Martínez</div>
                                        <div className="text-sm text-muted-foreground">Estudiante de Canto</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contacto" aria-label="Formulario de contacto y reserva de clase gratis" className="py-20 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/50 dark:to-orange-950/40">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="grid gap-12 lg:grid-cols-2 items-start">
                            <div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                                    Reserva Tu Clase Gratis
                                </h2>
                                <p className="text-lg text-muted-foreground mb-8">
                                    Completa el formulario y nos pondremos en contacto contigo para agendar tu primera clase gratuita
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-card shadow-sm">
                                        <MapPin className="h-6 w-6 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-foreground">Nuestra Ubicación</div>
                                            <div className="text-muted-foreground">Calle 11 #25A - 15, Barrio Las Llanadas</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-card shadow-sm">
                                        <Phone className="h-6 w-6 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-foreground">WhatsApp</div>
                                            <a href="https://wa.me/573004218146" target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-300 hover:underline">300 421 8146</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-card shadow-sm">
                                        <Mail className="h-6 w-6 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-foreground">Correo</div>
                                            <a href="mailto:Linajeacademia@gmail.com" className="text-amber-700 dark:text-amber-300 hover:underline">Linajeacademia@gmail.com</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4 p-4 rounded-xl bg-card shadow-sm">
                                        <Clock className="h-6 w-6 text-amber-700 dark:text-amber-300 flex-shrink-0 mt-1" />
                                        <div>
                                            <div className="font-semibold text-foreground">Horario de Atención</div>
                                            <div className="text-muted-foreground">Lunes a Sábado</div>
                                            <div className="text-muted-foreground text-sm">8:30 AM - 12:00 PM / 2:00 PM - 6:00 PM</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="formulario-clase-gratis" className="rounded-2xl bg-card p-8 shadow-xl scroll-mt-6">
                                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-100 dark:from-amber-800/50 to-orange-100 dark:to-orange-800/50 border-2 border-amber-300 dark:border-amber-700">
                                    <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-100 mb-2">
                                        <Gift className="h-5 w-5" />
                                        <span className="font-bold">¡Clase Gratuita Incluida!</span>
                                    </div>
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        Reserva ahora y recibe tu primera clase sin ningún costo
                                    </p>
                                </div>

                                <form onSubmit={submit} className="space-y-4">
                                    {/* ¿Para quién es la clase? */}
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-3">
                                            ¿Para quién es la clase demo? *
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div
                                                onClick={() => setData('is_for_child', false)}
                                                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                                                    !data.is_for_child
                                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/40 shadow-md'
                                                        : 'border-border bg-card hover:border-amber-300 dark:hover:border-amber-700'
                                                }`}
                                            >
                                                {!data.is_for_child && (
                                                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <div className="text-center">
                                                    <Users className="h-8 w-8 mx-auto mb-2 text-amber-700 dark:text-amber-300" />
                                                    <p className="font-semibold text-foreground">Para mí</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Quiero aprender</p>
                                                </div>
                                            </div>
                                            <div
                                                onClick={() => setData('is_for_child', true)}
                                                className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md ${
                                                    data.is_for_child
                                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/40 shadow-md'
                                                        : 'border-border bg-card hover:border-amber-300 dark:hover:border-amber-700'
                                                }`}
                                            >
                                                {data.is_for_child && (
                                                    <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </div>
                                                )}
                                                <div className="text-center">
                                                    <Users className="h-8 w-8 mx-auto mb-2 text-amber-700 dark:text-amber-300" />
                                                    <p className="font-semibold text-foreground">Para mi hijo/a</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Para un menor</p>
                                                </div>
                                            </div>
                                        </div>
                                        {errors.is_for_child && <p className="mt-2 text-sm text-red-600">{errors.is_for_child}</p>}
                                    </div>

                                    {/* Nombre del niño/a si es para su hijo */}
                                    {data.is_for_child && (
                                        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 p-4">
                                            <label className="block text-sm font-medium text-muted-foreground mb-2">
                                                Nombre del niño/a *
                                            </label>
                                            <input
                                                type="text"
                                                value={data.child_name}
                                                onChange={(e) => setData('child_name', e.target.value)}
                                                placeholder="Nombre completo del niño/a"
                                                required={data.is_for_child}
                                                className="w-full rounded-lg border-2 border-border px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-800/50 transition-all"
                                            />
                                            {errors.child_name && <p className="mt-1 text-sm text-red-600">{errors.child_name}</p>}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            {data.is_for_child ? 'Tu nombre (padre/madre/tutor) *' : 'Nombre completo *'}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder={data.is_for_child ? 'Tu nombre' : 'Tu nombre completo'}
                                            required
                                            className="w-full rounded-lg border-2 border-border px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-800/50 transition-all"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="tu@email.com"
                                            required
                                            className="w-full rounded-lg border-2 border-border px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-800/50 transition-all"
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Teléfono *
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+57 123 456 7890"
                                            required
                                            className="w-full rounded-lg border-2 border-border px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-800/50 transition-all"
                                        />
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-3">
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
                                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/40 shadow-md'
                                                                : 'border-border bg-card hover:border-amber-300 dark:hover:border-amber-700'
                                                        }`}
                                                    >
                                                        {data.instrument === program.name && (
                                                            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white">
                                                                <CheckCircle className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-start space-x-3">
                                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 dark:from-amber-800/50 to-orange-100 dark:to-orange-800/50">
                                                                <Music className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-foreground truncate">{program.name}</h4>
                                                                {program.description && (
                                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                        {program.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/40 p-4 text-center">
                                                <p className="text-sm text-amber-800 dark:text-amber-200">
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
                                                <div className="mt-4 rounded-lg border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/40 p-4">
                                                    <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                                                        <Clock className="h-4 w-4 mr-2" />
                                                        Horarios Disponibles (Opcional)
                                                    </h5>
                                                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                                                        Selecciona un horario de tu preferencia o déjanos tu disponibilidad en el mensaje
                                                    </p>
                                                    <div className="space-y-2">
                                                        {availableSchedules.map((schedule) => (
                                                            <div
                                                                key={schedule.id}
                                                                onClick={() => setData('preferred_schedule', `${schedule.days_of_week} ${schedule.start_time}-${schedule.end_time}`)}
                                                                className={`cursor-pointer rounded-lg border-2 p-3 transition-all hover:shadow-sm ${
                                                                    data.preferred_schedule === `${schedule.days_of_week} ${schedule.start_time}-${schedule.end_time}`
                                                                        ? 'border-blue-500 bg-card shadow-sm'
                                                                        : 'border-blue-200 dark:border-blue-700 bg-white/50 hover:border-blue-300 dark:hover:border-blue-700'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-semibold text-foreground">
                                                                            {schedule.days_of_week}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {schedule.start_time} - {schedule.end_time}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            Prof. {schedule.professor?.name ?? 'Sin asignar'}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
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
                                        <div className="mt-4 rounded-lg bg-gradient-to-r from-blue-50 dark:from-blue-900/40 to-indigo-50 dark:to-indigo-900/40 border border-blue-200 dark:border-blue-700 p-4">
                                            <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                ¿Qué incluye tu clase demo gratuita?
                                            </h5>
                                            <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
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
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Cuéntanos más sobre ti (opcional)
                                        </label>
                                        <textarea
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            placeholder="Ejemplo: Nunca he tocado un instrumento pero siempre quise aprender... / Toqué piano hace años y quiero retomar... / Tengo un nivel intermedio y busco perfeccionar mi técnica..."
                                            rows={4}
                                            className="w-full rounded-lg border-2 border-border px-4 py-3 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-800/50 transition-all"
                                        ></textarea>
                                        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Comparte tu nivel actual, objetivos o cualquier pregunta que tengas
                                        </p>
                                    </div>

                                    {/* Qué pasa después */}
                                    <div className="rounded-lg bg-gradient-to-r from-green-50 dark:from-green-900/40 to-emerald-50 dark:to-emerald-900/40 border border-green-200 dark:border-green-800 p-4">
                                        <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center">
                                            <Clock className="h-4 w-4 mr-2" />
                                            ¿Qué pasa después de enviar?
                                        </h5>
                                        <ol className="space-y-2 text-xs text-green-800 dark:text-green-200">
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
                                        <p className="text-xs text-center text-amber-700 dark:text-amber-300 mt-2">
                                            Por favor selecciona una clase demo para continuar
                                        </p>
                                    )}
                                    <p className="text-xs text-center text-muted-foreground">
                                        Al enviar, aceptas nuestros términos y condiciones
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                </main>

                {/* Footer */}
                <footer role="contentinfo" className="border-t border-amber-900/50 bg-gradient-to-br from-amber-950 via-orange-950 to-amber-950 text-white py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-6">
                                <img
                                    src="/logo_academia_white.png"
                                    alt="Academia Linaje - Escuela de Música"
                                    className="h-14 w-auto"
                                    width="175"
                                    height="56"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>
                            <p className="text-amber-200/80 mb-6 text-lg">
                                Formando músicos con excelencia y pasión desde hace más de 10 años
                            </p>

                            {/* Datos de contacto en footer para SEO */}
                            <div className="flex flex-wrap justify-center gap-6 text-sm text-amber-200/70 mb-6">
                                <a href="https://wa.me/573004218146" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                                    <Phone className="h-4 w-4" />
                                    300 421 8146
                                </a>
                                <a href="mailto:Linajeacademia@gmail.com" className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                                    <Mail className="h-4 w-4" />
                                    Linajeacademia@gmail.com
                                </a>
                                <span className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Calle 11 #25A - 15, Las Llanadas
                                </span>
                            </div>

                            <div className="inline-flex items-center space-x-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold mb-8">
                                <Gift className="h-4 w-4" />
                                <span>Tu primera clase es GRATIS</span>
                            </div>
                            <div className="text-sm text-amber-300/60 border-t border-amber-800/40 pt-8">
                                © 2026 Academia Linaje. Todos los derechos reservados.
                            </div>
                        </div>
                    </div>
                </footer>

                {/* Botón flotante de WhatsApp */}
                <a
                    href="https://wa.me/573004218146"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 hover:shadow-xl transition-all transform hover:scale-110"
                    aria-label="Contactar por WhatsApp"
                >
                    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                </a>
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

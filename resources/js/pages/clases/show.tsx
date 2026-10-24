import { Head } from '@inertiajs/react';
import { ArrowRight, Calendar, ChevronRight, Clock, Drum, Gift, Guitar, MapPin, Mic, MicVocal, Music, Phone, Piano, type LucideIcon } from 'lucide-react';

// Descripción, Open Graph y JSON-LD (Course, BreadcrumbList, FAQPage) los imprime el servidor:
// resources/views/partials/seo.blade.php con los datos de App\Support\Seo::forProgram().

const ICONS: Record<string, LucideIcon> = { piano: Piano, guitar: Guitar, drum: Drum, mic: Mic, micVocal: MicVocal };

interface Program {
    slug: string;
    label: string;
    description: string | null;
    is_demo: boolean;
    icon: string | null;
    color: string | null;
    schedules: { days: string; time: string }[];
}

interface Props {
    program: Program;
    otherPrograms: Pick<Program, 'slug' | 'label' | 'icon' | 'color'>[];
    faq: [string, string][];
    modalities: { name: string; ages: string; amount: number }[];
    discount: { min_students: number; percentage: number } | null;
    pageTitle: string;
    business: { street: string; neighborhood: string; locality: string; region: string; whatsapp: string };
}

const money = (value: number) => '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value);

export default function ClaseShow({ program, otherPrograms, faq, modalities, discount, pageTitle, business }: Props) {
    const Icon = ICONS[program.icon ?? ''] ?? Music;
    const color = program.color || '#d97706';
    const paragraphs = (program.description ?? '').split(/\n+/).filter(Boolean);
    const label = program.label.toLowerCase();

    return (
        <>
            <Head title={pageTitle} />

            <div className="min-h-screen bg-card">
                <header className="bg-card sticky top-0 z-50 shadow-md border-b-2 border-amber-600/40">
                    <nav aria-label="Navegación principal" className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
                        <a href="/" aria-label="Academia Linaje - Inicio">
                            <img src="/logo_academia_black.png" alt="Academia Linaje - Escuela de Música en Ocaña" className="h-12 w-auto dark:hidden" width="150" height="48" />
                            <img src="/logo_academia_white.png" alt="Academia Linaje - Escuela de Música en Ocaña" className="h-12 w-auto hidden dark:block" width="150" height="48" />
                        </a>
                        <a
                            href="/#formulario-clase-gratis"
                            className="rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:from-amber-700 hover:to-amber-800 transition-all"
                        >
                            Clase Gratis
                        </a>
                    </nav>
                </header>

                <main>
                    <section className="bg-gradient-to-br from-amber-50 dark:from-amber-900/40 via-orange-50 dark:via-orange-900/40 to-amber-50 dark:to-amber-900/40 py-14 sm:py-20">
                        <div className="mx-auto max-w-5xl px-4 sm:px-6">
                            <nav aria-label="Ruta de navegación" className="mb-8 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                                <a href="/" className="hover:underline">Inicio</a>
                                <ChevronRight className="h-4 w-4" />
                                <a href="/#programas" className="hover:underline">Programas</a>
                                <ChevronRight className="h-4 w-4" />
                                <span className="text-foreground">Clases de {program.label}</span>
                            </nav>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}20` }}>
                                    <Icon className="h-10 w-10" style={{ color }} />
                                </div>
                                <div>
                                    <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight text-foreground">
                                        Clases de {program.label} en Ocaña
                                    </h1>
                                    <p className="mt-3 text-lg text-muted-foreground">
                                        Para niños, jóvenes y adultos en Academia Linaje, barrio {business.neighborhood}.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <a
                                    href="/#formulario-clase-gratis"
                                    className="group flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-4 font-bold text-white shadow-xl hover:from-amber-700 hover:to-amber-800 transition-all"
                                >
                                    <Gift className="mr-2 h-5 w-5" />
                                    Reserva tu primera clase gratis
                                </a>
                                <a
                                    href="/matricula"
                                    className="flex items-center justify-center rounded-xl border-2 border-amber-700 bg-card px-8 py-4 font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-50 dark:hover:bg-amber-800/40 transition-all"
                                >
                                    Matricúlate en línea
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </section>

                    <section className="py-14">
                        <div className="mx-auto max-w-5xl px-4 sm:px-6 grid gap-10 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-4">
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    {program.is_demo ? `Tu primera clase de ${label}, gratis` : `Sobre el programa de ${label}`}
                                </h2>
                                {paragraphs.length > 0 ? (
                                    paragraphs.map((p, i) => (
                                        <p key={i} className="text-muted-foreground leading-relaxed">{p}</p>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground leading-relaxed">
                                        Aprende {label} con los profesores de Academia Linaje, en clases presenciales en Ocaña.
                                    </p>
                                )}
                            </div>

                            <aside className="space-y-4">
                                {modalities.length > 0 && (
                                    <div className="rounded-2xl border-2 border-border p-6">
                                        <h3 className="mb-3 font-semibold text-foreground">Mensualidad según la edad</h3>
                                        <ul className="space-y-3">
                                            {modalities.map((m) => (
                                                <li key={m.name} className="flex items-baseline justify-between gap-3">
                                                    <span>
                                                        <span className="block font-medium text-foreground">{m.name}</span>
                                                        <span className="text-xs text-muted-foreground">{m.ages}</span>
                                                    </span>
                                                    <span className="font-bold text-foreground whitespace-nowrap">{money(m.amount)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-3 text-xs text-muted-foreground">
                                            COP al mes · primera clase gratis
                                            {discount && ` · ${discount.percentage}% de descuento desde ${discount.min_students} estudiantes de la misma familia`}
                                        </p>
                                    </div>
                                )}

                                {program.schedules.length > 0 && (
                                    <div className="rounded-2xl border-2 border-border p-6">
                                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
                                            <Calendar className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                                            {program.is_demo ? 'Horarios de la clase gratis' : 'Horarios disponibles'}
                                        </h3>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            {program.schedules.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                                    <span>{s.days} · {s.time}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="rounded-2xl border-2 border-border p-6 space-y-3 text-sm">
                                    <div className="flex items-start gap-2 text-muted-foreground">
                                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700 dark:text-amber-300" />
                                        <span>{business.street}, {business.locality}, {business.region}</span>
                                    </div>
                                    <a href={business.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-amber-700 dark:text-amber-300 hover:underline">
                                        <Phone className="h-4 w-4" />
                                        WhatsApp 300 421 8146
                                    </a>
                                </div>
                            </aside>
                        </div>
                    </section>

                    {faq.length > 0 && (
                        <section className="py-14 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/50 dark:to-orange-950/40">
                            <div className="mx-auto max-w-3xl px-4 sm:px-6">
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
                                    Preguntas frecuentes sobre las clases de {label}
                                </h2>
                                <div className="space-y-3">
                                    {faq.map(([question, answer]) => (
                                        <details key={question} className="group rounded-xl border-2 border-border bg-card p-5">
                                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
                                                <h3 className="text-base">{question}</h3>
                                                <ChevronRight className="h-5 w-5 flex-shrink-0 text-amber-700 dark:text-amber-300 transition-transform group-open:rotate-90" />
                                            </summary>
                                            <p className="mt-3 text-muted-foreground">{answer}</p>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {otherPrograms.length > 0 && (
                        <section className="py-14">
                            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                                <h2 className="text-2xl font-bold text-foreground mb-6">Otras clases de música en Ocaña</h2>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {otherPrograms.map((p) => {
                                        const OtherIcon = ICONS[p.icon ?? ''] ?? Music;
                                        const otherColor = p.color || '#d97706';
                                        return (
                                            <a key={p.slug} href={`/clases/${p.slug}`} className="group flex items-center gap-4 rounded-xl border-2 border-border p-4 hover:shadow-lg transition-all">
                                                <OtherIcon className="h-6 w-6" style={{ color: otherColor }} />
                                                <span className="font-semibold text-foreground group-hover:text-amber-800 dark:group-hover:text-amber-200">Clases de {p.label}</span>
                                                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                <footer className="border-t border-amber-900/50 bg-gradient-to-br from-amber-950 via-orange-950 to-amber-950 text-amber-200/70 py-10 text-center text-sm">
                    <p className="mb-2 font-semibold text-amber-100">Academia Linaje · Academia de música en Ocaña</p>
                    <p>{business.street}, {business.locality}, {business.region}</p>
                    <p className="mt-6 text-amber-300/60">© {new Date().getFullYear()} Academia Linaje. Todos los derechos reservados.</p>
                </footer>

                <a
                    href={business.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all"
                    aria-label="Contactar por WhatsApp"
                >
                    <Phone className="h-7 w-7" />
                </a>
            </div>
        </>
    );
}

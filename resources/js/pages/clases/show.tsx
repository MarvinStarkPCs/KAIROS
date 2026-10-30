import {
    formatDays,
    formatTimeRange,
    SiteFonts,
    SiteFooter,
    SiteHeader,
    SiteStyles,
    useReveal,
    WhatsAppButton,
} from '@/components/public/linaje-site';
import { Head } from '@inertiajs/react';
import { ArrowRight, ChevronDown } from 'lucide-react';

// Descripción, Open Graph y JSON-LD (Course, BreadcrumbList, FAQPage) los imprime el servidor:
// resources/views/partials/seo.blade.php con los datos de App\Support\Seo::forProgram().

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
    business: {
        street: string;
        neighborhood: string;
        locality: string;
        region: string;
        whatsapp: string;
    };
}

type Block =
    | { type: 'p'; text: string }
    | { type: 'list'; intro: string; items: string[] };

const money = (value: number) =>
    '$' +
    new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value);

const WEEKDAYS = [
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
    'domingo',
];
const dayIndex = (day: string) => {
    const i = WEEKDAYS.indexOf(day.trim().toLowerCase());
    return i === -1 ? WEEKDAYS.length : i;
};

/** Horarios en orden de la semana y de la hora, con los días de cada uno también ordenados. */
const sortSchedules = (schedules: Program['schedules']) =>
    schedules
        .map((s) => {
            const days = s.days
                .split(',')
                .sort((a, b) => dayIndex(a) - dayIndex(b));
            return {
                days: formatDays(days.join(',')),
                time: formatTimeRange(s.time),
                first: dayIndex(days[0] ?? ''),
                start: s.time,
            };
        })
        .sort(
            (a, b) =>
                a.first - b.first ||
                a.days.localeCompare(b.days) ||
                a.start.localeCompare(b.start),
        );

/** Un párrafo que termina en ":" abre una lista con los párrafos que le siguen. */
const toBlocks = (description: string | null): Block[] => {
    const blocks: Block[] = [];
    (description ?? '')
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
            const last = blocks[blocks.length - 1];
            if (last?.type === 'list') last.items.push(line);
            else if (line.endsWith(':'))
                blocks.push({ type: 'list', intro: line, items: [] });
            else blocks.push({ type: 'p', text: line });
        });
    return blocks;
};

/**
 * El titular cabe en dos líneas también con nombres largos ("Teoría Musical y Armonía"):
 * el tamaño depende de su longitud y del ancho que tiene en cada punto de corte.
 */
const titleSize = (title: string) => {
    if (title.length <= 26)
        return 'text-[2.6rem] md:text-[4rem] lg:text-[clamp(4rem,6vw,5.5rem)]';
    if (title.length <= 36)
        return 'text-[2.2rem] md:text-[3.5rem] lg:text-[clamp(3.25rem,4.6vw,4.25rem)]';
    if (title.length <= 48)
        return 'text-[1.85rem] md:text-[2.9rem] lg:text-[clamp(2.75rem,3.8vw,3.6rem)]';
    return 'text-[1.6rem] md:text-[2.25rem] lg:text-[2.75rem]';
};

export default function ClaseShow({
    program,
    otherPrograms,
    faq,
    modalities,
    discount,
    pageTitle,
    business,
}: Props) {
    const rootRef = useReveal();
    const label = program.label.toLowerCase();
    const title = `Clases de ${program.label} en Ocaña`;
    const blocks = toBlocks(program.description);
    const schedules = sortSchedules(program.schedules);
    const bookHref = `/?clase=${program.slug}#formulario-clase-gratis`;
    const allPrograms = [program, ...otherPrograms].sort((a, b) =>
        a.label.localeCompare(b.label, 'es'),
    );

    return (
        <>
            <Head title={pageTitle} />
            <SiteFonts />

            <div
                ref={rootRef}
                className="linaje min-h-screen bg-[var(--ground)] text-[var(--ink)]"
            >
                <SiteHeader />

                <main id="contenido">
                    {/* Primera pantalla: qué es, para quién y cuánto cuesta */}
                    <section
                        aria-labelledby="clase-title"
                        className="pt-10 pb-24 sm:pt-14 sm:pb-32"
                    >
                        <div className="mx-auto max-w-7xl px-5 sm:px-8">
                            <nav
                                aria-label="Ruta de navegación"
                                className="text-base text-[var(--ink-2)]"
                            >
                                <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <li>
                                        <a href="/" className="nav-link">
                                            Inicio
                                        </a>
                                    </li>
                                    <li aria-hidden>/</li>
                                    <li>
                                        <a
                                            href="/#programas"
                                            className="nav-link"
                                        >
                                            Programas
                                        </a>
                                    </li>
                                    <li aria-hidden>/</li>
                                    <li
                                        aria-current="page"
                                        className="text-[var(--ink)]"
                                    >
                                        Clases de {program.label}
                                    </li>
                                </ol>
                            </nav>

                            <div className="mt-14 grid items-end gap-14 sm:mt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
                                <div>
                                    <h1
                                        id="clase-title"
                                        className={`hero-line ${titleSize(title)} leading-[0.95] font-semibold tracking-[-0.035em] text-balance [overflow-wrap:anywhere]`}
                                    >
                                        {title}
                                    </h1>
                                    <p className="hero-line hero-line-2 mt-7 max-w-xl text-lg leading-relaxed">
                                        Para niños, jóvenes y adultos en
                                        Academia Linaje, barrio{' '}
                                        {business.neighborhood}.{' '}
                                        <strong className="font-semibold">
                                            Tu primera clase es gratis.
                                        </strong>
                                    </p>
                                    <div className="hero-line hero-line-3 mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                                        <a
                                            href={bookHref}
                                            className="btn btn-gold btn-lg group"
                                        >
                                            Reserva tu clase gratis
                                            <ArrowRight
                                                className="btn-arrow h-5 w-5"
                                                aria-hidden
                                            />
                                        </a>
                                        <a
                                            href="/matricula"
                                            className="text-link text-base font-medium"
                                        >
                                            Matricúlate en línea
                                        </a>
                                    </div>
                                </div>

                                {modalities.length > 0 && (
                                    <div className="hero-line hero-line-4 rounded-3xl bg-[var(--paper)] p-7 sm:p-9">
                                        <h2 className="t-h3">Mensualidad</h2>
                                        <dl className="mt-6 flex flex-col gap-5">
                                            {modalities.map((m) => (
                                                <div
                                                    key={m.name}
                                                    className="flex items-baseline justify-between gap-4"
                                                >
                                                    <dt>
                                                        <span className="block text-lg font-semibold">
                                                            {m.name}
                                                        </span>
                                                        <span className="text-sm text-[var(--ink-2)]">
                                                            {m.ages}
                                                        </span>
                                                    </dt>
                                                    <dd className="t-h3 whitespace-nowrap tabular-nums">
                                                        {money(m.amount)}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                        <p className="mt-6 text-base leading-relaxed text-[var(--ink-2)]">
                                            Pesos colombianos al mes, según la
                                            edad. La primera clase es gratis
                                            {discount &&
                                                ` y hay ${discount.percentage}% de descuento desde ${discount.min_students} estudiantes de la misma familia`}
                                            .
                                        </p>
                                    </div>
                                )}
                            </div>

                            <img
                                src="/linaje-piano.webp"
                                alt="Piano vertical con una partitura abierta, iluminado por la luz de la tarde"
                                className="hero-line hero-line-4 mt-16 aspect-[16/9] w-full rounded-3xl object-cover sm:aspect-[21/9]"
                                width="1376"
                                height="768"
                                fetchPriority="high"
                                decoding="async"
                            />
                        </div>
                    </section>

                    {/* El programa */}
                    <section
                        aria-labelledby="programa-title"
                        className="bg-[var(--paper)] py-24 sm:py-36"
                    >
                        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
                            <h2
                                id="programa-title"
                                data-reveal
                                className="section-title lg:sticky lg:top-32 lg:self-start"
                            >
                                {program.is_demo
                                    ? 'Tu primera clase, gratis'
                                    : 'Sobre el programa'}
                            </h2>
                            <div
                                data-reveal
                                className="flex max-w-prose flex-col gap-5 text-lg leading-relaxed"
                            >
                                {blocks.length > 0 ? (
                                    blocks.map((block, i) =>
                                        block.type === 'p' ? (
                                            <p key={i}>{block.text}</p>
                                        ) : (
                                            <div key={i}>
                                                <p>{block.intro}</p>
                                                <ul className="mt-4 flex flex-col gap-3">
                                                    {block.items.map((item) => (
                                                        <li
                                                            key={item}
                                                            className="flex gap-3"
                                                        >
                                                            <span
                                                                aria-hidden
                                                                className="mt-[0.6em] h-2 w-2 shrink-0 rounded-full bg-[var(--gold)]"
                                                            />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <p>
                                        Aprende {label} con los profesores de
                                        Academia Linaje, en clases presenciales
                                        en Ocaña.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Horarios */}
                    <section
                        aria-labelledby="horarios-title"
                        className="bg-[var(--night)] py-24 text-[var(--on-night)] sm:py-36"
                    >
                        <div className="mx-auto max-w-7xl px-5 sm:px-8">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <h2
                                    id="horarios-title"
                                    data-reveal
                                    className="section-title"
                                >
                                    {program.is_demo
                                        ? 'Horarios de la clase gratis'
                                        : 'Horarios'}
                                </h2>
                                <p
                                    data-reveal
                                    className="max-w-md text-lg leading-relaxed"
                                >
                                    {schedules.length > 0
                                        ? '¿Ninguno te sirve? '
                                        : 'Pregúntanos por los horarios de este programa. '}
                                    <a
                                        href={business.whatsapp}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-link"
                                    >
                                        Escríbenos por WhatsApp
                                    </a>
                                    .
                                </p>
                            </div>
                            {schedules.length > 0 && (
                                <ul className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                                    {schedules.map((s, i) => (
                                        <li key={i} data-reveal>
                                            <span className="block text-lg font-semibold">
                                                {s.days}
                                            </span>
                                            <span className="mt-1 block text-lg text-[var(--on-night-2)] tabular-nums">
                                                {s.time}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p
                                data-reveal
                                className="mt-14 text-base text-[var(--on-night-2)]"
                            >
                                {business.street}, {business.locality},{' '}
                                {business.region}
                            </p>
                        </div>
                    </section>

                    {faq.length > 0 && (
                        <section
                            id="preguntas"
                            aria-labelledby="preguntas-title"
                            className="scroll-mt-18 py-24 sm:py-36"
                        >
                            <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
                                <div className="lg:sticky lg:top-32 lg:self-start">
                                    <h2
                                        id="preguntas-title"
                                        data-reveal
                                        className="section-title"
                                    >
                                        Preguntas frecuentes
                                    </h2>
                                    <p
                                        data-reveal
                                        className="mt-6 max-w-md text-lg leading-relaxed"
                                    >
                                        Sobre las clases de {label} en Academia
                                        Linaje.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {faq.map(([question, answer]) => (
                                        <details
                                            key={question}
                                            data-reveal
                                            className="faq group rounded-2xl bg-[var(--paper)] px-6 py-5"
                                        >
                                            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
                                                <h3 className="text-lg leading-snug font-semibold">
                                                    {question}
                                                </h3>
                                                <ChevronDown
                                                    className="faq-chevron h-5 w-5 shrink-0"
                                                    aria-hidden
                                                />
                                            </summary>
                                            <p className="faq-answer mt-3 max-w-prose text-lg leading-relaxed">
                                                {answer}
                                            </p>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {otherPrograms.length > 0 && (
                        <section
                            aria-labelledby="otras-title"
                            className="bg-[var(--paper)] py-24 sm:py-36"
                        >
                            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                                <h2
                                    id="otras-title"
                                    data-reveal
                                    className="section-title max-w-[14ch]"
                                >
                                    Otras clases de música en Ocaña
                                </h2>
                                <ul className="mt-14 grid gap-2 sm:grid-cols-2">
                                    {otherPrograms.map((p) => (
                                        <li key={p.slug} data-reveal>
                                            <a
                                                href={`/clases/${p.slug}`}
                                                className="program-row on-paper flex items-center justify-between gap-6 rounded-2xl bg-[var(--ground)] px-6 py-5"
                                            >
                                                <span className="program-link t-h3">
                                                    Clases de {p.label}
                                                </span>
                                                <span
                                                    className="row-arrow shrink-0"
                                                    aria-hidden
                                                >
                                                    <ArrowRight className="h-5 w-5" />
                                                </span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    )}
                </main>

                <SiteFooter programs={allPrograms} />
                <WhatsAppButton />
            </div>

            <SiteStyles />
        </>
    );
}

import {
    formatDays,
    formatTime,
    SiteFonts,
    SiteFooter,
    SiteHeader,
    SiteStyles,
    useReveal,
    WHATSAPP_URL,
    WhatsAppButton,
} from '@/components/public/linaje-site';
import { type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

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
    slug: string;
    label: string;
    icon: string | null;
    color: string | null;
}

/** [pregunta, respuesta] */
type FaqItem = [string, string];

interface WelcomeProps extends SharedData {
    demoPrograms: DemoProgram[];
    academicPrograms: AcademicProgramData[];
    faq: FaqItem[];
}

const benefits = [
    'Profesores certificados con años de experiencia',
    'Metodología personalizada según tu nivel',
    'Instalaciones profesionales y equipadas',
    'Horarios flexibles adaptados a ti',
    'Recitales y presentaciones en vivo',
    'Material de estudio incluido',
];

const stats = [
    ['500+', 'estudiantes activos'],
    ['15+', 'profesores'],
    ['98%', 'de satisfacción'],
    ['+10', 'años formando músicos'],
];

const testimonials = [
    {
        quote: 'Después de la primera clase gratis supe que este era el lugar perfecto para aprender. ¡Ya llevo 2 años!',
        name: 'Carlos Rodríguez',
        role: 'Estudiante de Guitarra',
    },
    {
        quote: 'La clase gratis me convenció al instante. Los profesores son increíbles y las instalaciones de primera.',
        name: 'María González',
        role: 'Estudiante de Piano',
    },
    {
        quote: 'La atención personalizada desde la primera clase gratuita hace toda la diferencia. Excelente metodología.',
        name: 'Ana Martínez',
        role: 'Estudiante de Canto',
    },
];

/** "Violín" y "Demo Violin" deben coincidir: sin tildes, sin mayúsculas y sin el prefijo "Demo". */
const normalize = (text: string) =>
    text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/^demo\s+/i, '')
        .trim()
        .toLowerCase();

const demoLabel = (name: string) => name.replace(/^demo\s+/i, '');

/**
 * Primera frase de la descripción, sin el "El Programa de Piano" con que empiezan casi todas
 * (el nombre ya está encima). Las que abren una lista ("Que el estudiante:") no sirven de resumen.
 */
const summary = (program: AcademicProgramData) => {
    const first = program.description
        ?.split(/\n|(?<=\.)\s/)
        .find((part) => part.trim())
        ?.trim();
    if (!first || first.endsWith(':')) return null;
    const prefix = `el programa de ${program.label} `;
    if (!normalize(first).startsWith(normalize(prefix))) return first;
    const rest = first.slice(prefix.length);
    return rest.charAt(0).toUpperCase() + rest.slice(1);
};

const scheduleValue = (schedule: Schedule) =>
    `${schedule.days_of_week} ${schedule.start_time}-${schedule.end_time}`;

/** Los mensajes del servidor traen emojis; en la página se muestran solo con texto. */
const plain = (text: string) =>
    text
        .replace(/\p{Extended_Pictographic}️?/gu, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

export default function Welcome() {
    const { demoPrograms, academicPrograms, faq, flash } =
        usePage<WelcomeProps>().props;
    const rootRef = useReveal();
    const nameInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [flashDemo, setFlashDemo] = useState<string | null>(null);

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

    // El aviso del envío aparece junto al formulario, así que la página no vuelve arriba.
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/demo/solicitud', {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const selectDemo = (name: string) => {
        if (data.instrument !== name) {
            setData((current) => ({
                ...current,
                instrument: name,
                preferred_schedule: '',
            }));
        }
    };

    const demoFor = (program: AcademicProgramData) =>
        demoPrograms.find(
            (demo) => normalize(demo.name) === normalize(program.label),
        );

    /** Desde la lista de programas: deja elegida la clase demo, lleva al formulario y la señala. */
    const bookDemo = (name: string) => {
        selectDemo(name);
        setFlashDemo(name);
        window.setTimeout(() => setFlashDemo(null), 1600);
        const reduceMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        document
            .getElementById('formulario-clase-gratis')
            ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        nameInputRef.current?.focus({ preventScroll: true });
    };

    // Las páginas /clases/{slug} enlazan con ?clase={slug}: la clase demo de ese instrumento llega elegida.
    useEffect(() => {
        const slug = new URLSearchParams(window.location.search).get('clase');
        const program = academicPrograms.find((p) => p.slug === slug);
        const demo = program && demoFor(program);
        if (demo) selectDemo(demo.name);

        // Al llegar desde otra página con un ancla (/#programas), el navegador la busca antes de que
        // React pinte la portada; se repite el salto ya con la página dibujada.
        if (window.location.hash) {
            document
                .getElementById(
                    decodeURIComponent(window.location.hash.slice(1)),
                )
                ?.scrollIntoView();
        }

        // El video se reproduce siempre, sin sonido. React no siempre aplica "muted" antes del
        // autoplay, y sin él el navegador bloquea la reproducción; se fuerza aquí.
        const video = videoRef.current;
        if (video) {
            video.muted = true;
            video.play().catch(() => {});
        }
        // Solo al cargar la página.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedDemo = demoPrograms.find((p) => p.name === data.instrument);
    const availableSchedules =
        selectedDemo?.schedules?.filter((s) => s.has_capacity) ?? [];
    const notice = flash?.success
        ? { kind: 'success', text: flash.success }
        : flash?.warning
          ? { kind: 'warning', text: flash.warning }
          : flash?.error
            ? { kind: 'error', text: flash.error }
            : null;

    return (
        <>
            {/* Descripción, Open Graph y JSON-LD los imprime el servidor (resources/views/partials/seo.blade.php). */}
            <Head title="Academia de Música en Ocaña | Piano, Guitarra y Canto" />
            <SiteFonts />

            <div
                ref={rootRef}
                className="linaje min-h-screen bg-[var(--ground)] text-[var(--ink)]"
            >
                <SiteHeader onHome />

                <main id="contenido">
                    {/* Hero: el video de la academia ocupa la primera pantalla */}
                    <section
                        aria-labelledby="hero-title"
                        className="relative isolate flex min-h-[calc(100svh-4.5rem)] items-end overflow-hidden bg-[var(--night)] text-[var(--on-night)]"
                    >
                        <video
                            ref={videoRef}
                            className="hero-media absolute inset-0 -z-20 h-full w-full object-cover"
                            src="/linaje-720.mp4"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            poster="/linaje-poster.jpg"
                            aria-label="Video promocional de Academia Linaje - Clases de música"
                            title="Academia Linaje - Aprende música con nosotros"
                        />
                        {/* Velo neutro para que el texto se lea sobre el video */}
                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(12_11_9/0.9)_0%,rgb(12_11_9/0.55)_45%,rgb(12_11_9/0.1)_100%)]"
                        />

                        <div className="mx-auto w-full max-w-7xl px-5 pt-32 pb-14 sm:px-8 sm:pb-20">
                            <h1
                                id="hero-title"
                                className="t-display hero-line max-w-[11em]"
                            >
                                Despierta el músico que hay en ti
                                <span className="hero-line-2 mt-5 block text-2xl leading-tight font-medium tracking-[-0.01em] text-[var(--on-night-2)]">
                                    Academia de música en Ocaña
                                </span>
                            </h1>
                            <p className="hero-line hero-line-3 mt-6 max-w-xl text-lg leading-relaxed text-[var(--on-night)]">
                                Piano, guitarra, canto, batería y violín con
                                profesores certificados, para niños, jóvenes y
                                adultos.{' '}
                                <strong className="font-semibold">
                                    Tu primera clase es gratis.
                                </strong>
                            </p>
                            <div className="hero-line hero-line-4 mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
                                <a
                                    href="#formulario-clase-gratis"
                                    className="btn btn-gold btn-lg group"
                                >
                                    Reserva tu clase gratis
                                    <ArrowRight
                                        className="btn-arrow h-5 w-5"
                                        aria-hidden
                                    />
                                </a>
                                <a
                                    href="#programas"
                                    className="text-link text-base font-medium text-[var(--on-night)]"
                                >
                                    Ver programas
                                </a>
                            </div>
                            <p className="hero-line hero-line-4 mt-8 text-base text-[var(--on-night-2)]">
                                Más de 500 estudiantes activos y 10 años
                                formando músicos en Ocaña.
                            </p>
                        </div>
                    </section>

                    {/* Programas: cada instrumento lleva a su página o deja lista la clase de prueba */}
                    <section
                        id="programas"
                        aria-labelledby="programas-title"
                        className="scroll-mt-18 py-24 sm:py-36"
                    >
                        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
                            <div className="lg:sticky lg:top-32 lg:self-start">
                                <h2
                                    id="programas-title"
                                    data-reveal
                                    className="section-title"
                                >
                                    ¿Qué quieres tocar?
                                </h2>
                                <p
                                    data-reveal
                                    className="mt-6 max-w-md text-lg leading-relaxed"
                                >
                                    Clases de música en Ocaña para niños,
                                    jóvenes y adultos. Abre un programa para
                                    conocerlo o reserva directamente tu clase de
                                    prueba gratis.
                                </p>
                                <img
                                    data-reveal
                                    src="/linaje-instrumentos.webp"
                                    alt="Guitarra acústica, violín y baquetas sobre una mesa de madera junto a una ventana"
                                    className="mt-10 aspect-[4/3] w-full rounded-2xl object-cover"
                                    width="1376"
                                    height="768"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>

                            {academicPrograms.length > 0 ? (
                                <ul className="flex flex-col gap-2">
                                    {academicPrograms.map((program) => {
                                        const demo = demoFor(program);
                                        const text = summary(program);
                                        return (
                                            <li
                                                key={program.id}
                                                data-reveal
                                                className="program-row group rounded-2xl px-5 py-6 sm:px-7"
                                            >
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                                                    <div className="min-w-0">
                                                        <h3 className="t-h3">
                                                            <a
                                                                href={`/clases/${program.slug}`}
                                                                className="program-link"
                                                                aria-label={`Clases de ${program.label} en Ocaña`}
                                                            >
                                                                {program.label}
                                                            </a>
                                                        </h3>
                                                        {text && (
                                                            <p className="mt-3 line-clamp-2 max-w-prose text-base leading-relaxed">
                                                                {text}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-5">
                                                        {demo ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    bookDemo(
                                                                        demo.name,
                                                                    )
                                                                }
                                                                className="btn btn-ink"
                                                            >
                                                                Probar gratis
                                                            </button>
                                                        ) : (
                                                            <a
                                                                href={`/clases/${program.slug}`}
                                                                className="text-link text-base font-medium"
                                                            >
                                                                Ver programa
                                                            </a>
                                                        )}
                                                        <a
                                                            href={`/clases/${program.slug}`}
                                                            className="row-arrow"
                                                            aria-label={`Ver el programa de ${program.label}`}
                                                        >
                                                            <ArrowRight
                                                                className="h-5 w-5"
                                                                aria-hidden
                                                            />
                                                        </a>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-lg">
                                    Próximamente más programas disponibles.
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Por qué Linaje */}
                    <section
                        aria-labelledby="porque-title"
                        className="bg-[var(--paper)] py-24 sm:py-36"
                    >
                        <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:gap-24">
                            <div>
                                <h2
                                    id="porque-title"
                                    data-reveal
                                    className="section-title max-w-[12ch]"
                                >
                                    ¿Por qué elegir Academia Linaje?
                                </h2>
                                <p
                                    data-reveal
                                    className="mt-6 max-w-md text-lg leading-relaxed"
                                >
                                    Más que una academia, somos tu comunidad
                                    musical.
                                </p>
                                <ul
                                    data-reveal
                                    className="mt-12 grid gap-x-10 gap-y-5 text-lg leading-snug sm:grid-cols-2"
                                >
                                    {benefits.map((benefit) => (
                                        <li
                                            key={benefit}
                                            className="flex gap-3"
                                        >
                                            <span
                                                aria-hidden
                                                className="mt-[0.45em] h-2 w-2 shrink-0 rounded-full bg-[var(--gold)]"
                                            />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <dl className="grid grid-cols-2 gap-x-8 gap-y-14 self-center">
                                {stats.map(([value, label]) => (
                                    <div
                                        key={label}
                                        data-reveal
                                        className="flex flex-col-reverse"
                                    >
                                        <dt className="mt-2 text-base text-[var(--ink-2)]">
                                            {label}
                                        </dt>
                                        <dd className="section-title tabular-nums">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </section>

                    {/* Testimonios */}
                    <section
                        aria-labelledby="testimonios-title"
                        className="bg-[var(--night)] py-24 text-[var(--on-night)] sm:py-36"
                    >
                        <div className="mx-auto max-w-7xl px-5 sm:px-8">
                            <h2
                                id="testimonios-title"
                                data-reveal
                                className="section-title"
                            >
                                Historias de éxito
                            </h2>
                            <figure data-reveal className="mt-14 max-w-4xl">
                                <blockquote className="t-h3 font-medium">
                                    <p>“{testimonials[0].quote}”</p>
                                </blockquote>
                                <figcaption className="mt-6 text-base text-[var(--on-night-2)]">
                                    <span className="font-semibold text-[var(--on-night)]">
                                        {testimonials[0].name}
                                    </span>{' '}
                                    · {testimonials[0].role}
                                </figcaption>
                            </figure>
                            <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-16">
                                {testimonials.slice(1).map((t) => (
                                    <figure key={t.name} data-reveal>
                                        <blockquote className="text-lg leading-relaxed">
                                            <p>“{t.quote}”</p>
                                        </blockquote>
                                        <figcaption className="mt-4 text-base text-[var(--on-night-2)]">
                                            <span className="font-semibold text-[var(--on-night)]">
                                                {t.name}
                                            </span>{' '}
                                            · {t.role}
                                        </figcaption>
                                    </figure>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Preguntas frecuentes: el mismo contenido va marcado como FAQPage en el JSON-LD del servidor */}
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
                                        ¿No encuentras tu respuesta? Escríbenos
                                        por{' '}
                                        <a
                                            href={WHATSAPP_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-link font-medium"
                                        >
                                            WhatsApp
                                        </a>
                                        .
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

                    {/* Reserva y contacto */}
                    <section
                        id="contacto"
                        aria-labelledby="contacto-title"
                        className="scroll-mt-18 bg-[var(--paper)] py-24 sm:py-36"
                    >
                        <div className="mx-auto grid max-w-7xl items-start gap-16 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
                            <div>
                                <h2
                                    id="contacto-title"
                                    data-reveal
                                    className="section-title max-w-[11ch]"
                                >
                                    Reserva tu clase gratis
                                </h2>
                                <p
                                    data-reveal
                                    className="mt-6 max-w-md text-lg leading-relaxed"
                                >
                                    Sin compromiso y sin cargos ocultos.
                                    Completa el formulario y te contactamos para
                                    agendar tu primera clase.
                                </p>

                                <div data-reveal className="mt-12">
                                    <h3 className="text-lg font-semibold">
                                        Tu clase de prueba incluye
                                    </h3>
                                    <ul className="mt-4 flex flex-col gap-2.5 text-lg leading-snug">
                                        <li>
                                            Sesión individual de 45 a 60 minutos
                                            con un profesor certificado
                                        </li>
                                        <li>
                                            Evaluación personalizada de tu nivel
                                            actual
                                        </li>
                                        <li>
                                            Plan de estudio recomendado según
                                            tus objetivos
                                        </li>
                                    </ul>
                                </div>

                                <div data-reveal className="mt-10">
                                    <h3 className="text-lg font-semibold">
                                        Después de enviar
                                    </h3>
                                    <ol className="mt-4 flex list-decimal flex-col gap-2.5 pl-5 text-lg leading-snug marker:font-semibold">
                                        <li>
                                            Revisamos tu solicitud en las
                                            próximas 24 horas
                                        </li>
                                        <li>
                                            Te contactamos por WhatsApp o correo
                                            para coordinar fecha y hora
                                        </li>
                                        <li>
                                            Recibes la confirmación con todos
                                            los detalles
                                        </li>
                                        <li>
                                            Disfrutas tu primera clase,
                                            completamente gratis
                                        </li>
                                    </ol>
                                </div>

                                <dl
                                    data-reveal
                                    className="mt-12 grid gap-6 text-lg sm:grid-cols-2"
                                >
                                    <div>
                                        <dt className="font-semibold">
                                            Dirección
                                        </dt>
                                        <dd className="mt-1">
                                            Calle 11 #25A - 15, Barrio Las
                                            Llanadas, Ocaña, Norte de Santander
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-semibold">
                                            Horario de atención
                                        </dt>
                                        <dd className="mt-1">
                                            Lunes a sábado
                                            <br />
                                            8:30 a. m. – 12:00 m. y 2:00 – 6:00
                                            p. m.
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-semibold">
                                            WhatsApp
                                        </dt>
                                        <dd className="mt-1">
                                            <a
                                                href={WHATSAPP_URL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-link"
                                            >
                                                300 421 8146
                                            </a>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="font-semibold">
                                            Correo
                                        </dt>
                                        <dd className="mt-1">
                                            <a
                                                href="mailto:Linajeacademia@gmail.com"
                                                className="text-link break-all"
                                            >
                                                Linajeacademia@gmail.com
                                            </a>
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div
                                id="formulario-clase-gratis"
                                className="scroll-mt-24 rounded-3xl bg-[var(--ground)] p-6 sm:p-10"
                            >
                                <div role="status" aria-live="polite">
                                    {notice && (
                                        <p
                                            className={`notice notice-${notice.kind} appear mb-7`}
                                        >
                                            {plain(notice.text)}
                                        </p>
                                    )}
                                </div>

                                {demoPrograms.length === 0 ? (
                                    // Sin clases de prueba con cupo el formulario no se puede enviar: se ofrece WhatsApp.
                                    <div className="flex flex-col items-start gap-6">
                                        <p className="text-lg leading-relaxed">
                                            Ahora mismo no hay clases de prueba
                                            con cupo. Escríbenos por WhatsApp y
                                            te avisamos en cuanto se abra un
                                            horario para el instrumento que
                                            quieres.
                                        </p>
                                        <a
                                            href={WHATSAPP_URL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-gold btn-lg group"
                                        >
                                            Escribir por WhatsApp
                                            <ArrowRight
                                                className="btn-arrow h-5 w-5"
                                                aria-hidden
                                            />
                                        </a>
                                    </div>
                                ) : (
                                    <form
                                        onSubmit={submit}
                                        className="flex flex-col gap-7"
                                    >
                                        <fieldset>
                                            <legend className="field-label">
                                                ¿Para quién es la clase?
                                            </legend>
                                            <div className="mt-3 grid grid-cols-2 gap-3">
                                                {[
                                                    {
                                                        value: false,
                                                        title: 'Para mí',
                                                        hint: 'Quiero aprender',
                                                    },
                                                    {
                                                        value: true,
                                                        title: 'Para mi hijo/a',
                                                        hint: 'Para un menor',
                                                    },
                                                ].map((option) => (
                                                    <label
                                                        key={option.title}
                                                        className={`choice ${data.is_for_child === option.value ? 'is-checked' : ''}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="is_for_child"
                                                            className="sr-only"
                                                            checked={
                                                                data.is_for_child ===
                                                                option.value
                                                            }
                                                            onChange={() =>
                                                                setData(
                                                                    'is_for_child',
                                                                    option.value,
                                                                )
                                                            }
                                                        />
                                                        <span className="block font-semibold">
                                                            {option.title}
                                                        </span>
                                                        <span className="choice-hint mt-0.5 block text-sm">
                                                            {option.hint}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors.is_for_child && (
                                                <p className="field-error">
                                                    {errors.is_for_child}
                                                </p>
                                            )}
                                        </fieldset>

                                        {data.is_for_child && (
                                            <div className="appear">
                                                <label
                                                    htmlFor="child_name"
                                                    className="field-label"
                                                >
                                                    Nombre del niño/a
                                                </label>
                                                <input
                                                    id="child_name"
                                                    type="text"
                                                    value={data.child_name}
                                                    onChange={(e) =>
                                                        setData(
                                                            'child_name',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Nombre completo del niño/a"
                                                    required
                                                    aria-invalid={
                                                        !!errors.child_name
                                                    }
                                                    className="field"
                                                />
                                                {errors.child_name && (
                                                    <p className="field-error">
                                                        {errors.child_name}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="field-label"
                                            >
                                                {data.is_for_child
                                                    ? 'Tu nombre (padre, madre o tutor)'
                                                    : 'Nombre completo'}
                                            </label>
                                            <input
                                                ref={nameInputRef}
                                                id="name"
                                                type="text"
                                                autoComplete="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder={
                                                    data.is_for_child
                                                        ? 'Tu nombre'
                                                        : 'Tu nombre completo'
                                                }
                                                required
                                                aria-invalid={!!errors.name}
                                                className="field"
                                            />
                                            {errors.name && (
                                                <p className="field-error">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid gap-7 sm:grid-cols-2 sm:gap-4">
                                            <div>
                                                <label
                                                    htmlFor="email"
                                                    className="field-label"
                                                >
                                                    Correo
                                                </label>
                                                <input
                                                    id="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    value={data.email}
                                                    onChange={(e) =>
                                                        setData(
                                                            'email',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="tu@email.com"
                                                    required
                                                    aria-invalid={
                                                        !!errors.email
                                                    }
                                                    className="field"
                                                />
                                                {errors.email && (
                                                    <p className="field-error">
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="phone"
                                                    className="field-label"
                                                >
                                                    Teléfono o WhatsApp
                                                </label>
                                                <input
                                                    id="phone"
                                                    type="tel"
                                                    autoComplete="tel"
                                                    value={data.phone}
                                                    onChange={(e) =>
                                                        setData(
                                                            'phone',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="300 123 4567"
                                                    required
                                                    aria-invalid={
                                                        !!errors.phone
                                                    }
                                                    className="field"
                                                />
                                                {errors.phone && (
                                                    <p className="field-error">
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <fieldset>
                                            <legend className="field-label">
                                                ¿Qué clase quieres probar?
                                            </legend>
                                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                {demoPrograms.map((program) => (
                                                    <label
                                                        key={program.id}
                                                        className={`choice ${data.instrument === program.name ? 'is-checked' : ''} ${flashDemo === program.name ? 'is-flash' : ''}`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="instrument"
                                                            className="sr-only"
                                                            value={program.name}
                                                            checked={
                                                                data.instrument ===
                                                                program.name
                                                            }
                                                            onChange={() =>
                                                                selectDemo(
                                                                    program.name,
                                                                )
                                                            }
                                                            required
                                                        />
                                                        <span className="block font-semibold">
                                                            {demoLabel(
                                                                program.name,
                                                            )}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors.instrument && (
                                                <p className="field-error">
                                                    {errors.instrument}
                                                </p>
                                            )}
                                        </fieldset>

                                        {availableSchedules.length > 0 && (
                                            <fieldset
                                                className="appear"
                                                key={data.instrument}
                                            >
                                                <legend className="field-label">
                                                    Horario preferido (opcional)
                                                </legend>
                                                <p className="mt-1 text-sm text-[var(--ink-2)]">
                                                    Elige uno o cuéntanos tu
                                                    disponibilidad en el
                                                    mensaje.
                                                </p>
                                                <div className="mt-3 flex flex-col gap-2">
                                                    {availableSchedules.map(
                                                        (schedule) => (
                                                            <label
                                                                key={
                                                                    schedule.id
                                                                }
                                                                className={`choice flex items-center justify-between gap-4 ${data.preferred_schedule === scheduleValue(schedule) ? 'is-checked' : ''}`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="preferred_schedule"
                                                                    className="sr-only"
                                                                    checked={
                                                                        data.preferred_schedule ===
                                                                        scheduleValue(
                                                                            schedule,
                                                                        )
                                                                    }
                                                                    onChange={() =>
                                                                        setData(
                                                                            'preferred_schedule',
                                                                            scheduleValue(
                                                                                schedule,
                                                                            ),
                                                                        )
                                                                    }
                                                                />
                                                                <span>
                                                                    <span className="block font-semibold">
                                                                        {formatDays(
                                                                            schedule.days_of_week,
                                                                        )}
                                                                    </span>
                                                                    <span className="choice-hint block text-sm tabular-nums">
                                                                        {formatTime(
                                                                            schedule.start_time,
                                                                        )}{' '}
                                                                        –{' '}
                                                                        {formatTime(
                                                                            schedule.end_time,
                                                                        )}{' '}
                                                                        · Prof.{' '}
                                                                        {schedule
                                                                            .professor
                                                                            ?.name ??
                                                                            'Sin asignar'}
                                                                    </span>
                                                                </span>
                                                                <span className="choice-hint shrink-0 text-sm tabular-nums">
                                                                    {
                                                                        schedule.available_slots
                                                                    }{' '}
                                                                    {schedule.available_slots ===
                                                                    1
                                                                        ? 'cupo'
                                                                        : 'cupos'}
                                                                </span>
                                                            </label>
                                                        ),
                                                    )}
                                                </div>
                                            </fieldset>
                                        )}

                                        <div>
                                            <label
                                                htmlFor="message"
                                                className="field-label"
                                            >
                                                Cuéntanos más sobre ti
                                                (opcional)
                                            </label>
                                            <textarea
                                                id="message"
                                                value={data.message}
                                                onChange={(e) =>
                                                    setData(
                                                        'message',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Por ejemplo: nunca he tocado un instrumento pero siempre quise aprender."
                                                rows={4}
                                                aria-describedby="message-help"
                                                className="field resize-y"
                                            ></textarea>
                                            {errors.message && (
                                                <p className="field-error">
                                                    {errors.message}
                                                </p>
                                            )}
                                            <p
                                                id="message-help"
                                                className="mt-2 text-sm text-[var(--ink-2)]"
                                            >
                                                Tu nivel actual, tus objetivos o
                                                cualquier pregunta.
                                            </p>
                                        </div>

                                        <div>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="btn btn-gold btn-lg group w-full justify-center"
                                            >
                                                {processing ? (
                                                    <>
                                                        <Loader2
                                                            className="h-5 w-5 animate-spin"
                                                            aria-hidden
                                                        />
                                                        Enviando tu solicitud…
                                                    </>
                                                ) : (
                                                    <>
                                                        Reservar mi clase gratis
                                                        <ArrowRight
                                                            className="btn-arrow h-5 w-5"
                                                            aria-hidden
                                                        />
                                                    </>
                                                )}
                                            </button>
                                            {/* Pendiente: enlazar los términos y la política de datos cuando la academia los entregue. */}
                                            <p className="mt-3 text-center text-sm text-[var(--ink-2)]">
                                                Usamos tus datos solo para
                                                agendar tu clase y responderte.
                                            </p>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </section>
                </main>

                <SiteFooter programs={academicPrograms} />
                <WhatsAppButton />
            </div>

            <SiteStyles />
        </>
    );
}

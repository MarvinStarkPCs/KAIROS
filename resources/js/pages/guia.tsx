import { Head, Link } from '@inertiajs/react';
import { login } from '@/routes';
import { useState } from 'react';
import {
    GraduationCap, Award, Heart, LogIn, ChevronDown, ChevronRight,
    ArrowRight, Lightbulb, BookOpen, Star, CheckCircle, BarChart,
    Monitor, Smartphone, Lock, Eye, type LucideIcon,
} from 'lucide-react';

/* ───────── Tipos ───────── */
interface Step {
    text: string;
    detail?: string;
}

interface GuideSection {
    id: string;
    title: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
    content: React.ReactNode;
}

/* ───────── Acordeón ───────── */
function Accordion({ section, defaultOpen = false }: { section: GuideSection; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    const Icon = section.icon;

    return (
        <div className={`overflow-hidden rounded-2xl border ${section.borderColor} transition-all shadow-sm`}>
            <button
                onClick={() => setOpen(!open)}
                className={`flex w-full items-center gap-4 px-6 py-5 text-left transition-colors ${open ? section.bgColor : 'bg-card hover:bg-muted'}`}
            >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${section.color} shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                </div>
                {open ? (
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
            </button>
            {open && (
                <div className="border-t border-border bg-card px-6 py-6">
                    {section.content}
                </div>
            )}
        </div>
    );
}

/* ───────── Componente de pasos ───────── */
function StepList({ steps, color }: { steps: Step[]; color: string }) {
    return (
        <ol className="space-y-4">
            {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-4">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color} shadow-sm`}>
                        {i + 1}
                    </span>
                    <div className="pt-1">
                        <p className="text-base text-foreground font-medium">{step.text}</p>
                        {step.detail && (
                            <p className="text-sm text-muted-foreground mt-1">{step.detail}</p>
                        )}
                    </div>
                </li>
            ))}
        </ol>
    );
}

/* ───────── Tip Box ───────── */
function TipBox({ tips }: { tips: string[] }) {
    return (
        <div className="mt-5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
            <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">Consejos</p>
            </div>
            <ul className="space-y-1.5">
                {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-100/80">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{tip}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ───────── Sección: Cómo iniciar sesión ───────── */
function LoginGuide() {
    return (
        <div className="space-y-5">
            <p className="text-muted-foreground">Para acceder a la plataforma necesitas un usuario y contraseña que te proporcionará la academia.</p>
            <StepList
                color="bg-blue-500"
                steps={[
                    { text: 'Abre el navegador en tu celular o computador.', detail: 'Funciona en Chrome, Safari, Firefox o cualquier navegador.' },
                    { text: 'Ingresa a la dirección web que te compartió la academia.' },
                    { text: 'Haz clic en "Acceso" o "Iniciar Sesión".', },
                    { text: 'Escribe tu correo electrónico y contraseña.', detail: 'Si olvidaste tu contraseña, haz clic en "¿Olvidaste tu contraseña?" para recuperarla.' },
                    { text: '¡Listo! Serás dirigido automáticamente a tu portal.' },
                ]}
            />
            <TipBox tips={[
                'Tu contraseña es personal. No la compartas con nadie.',
                'Si tienes problemas para ingresar, contacta a la academia por WhatsApp.',
                'La plataforma funciona igual desde el celular y el computador.',
            ]} />
        </div>
    );
}

/* ───────── Sección: Portal del Estudiante ───────── */
function StudentGuide() {
    return (
        <div className="space-y-6">
            <p className="text-muted-foreground">Al iniciar sesión como estudiante, verás directamente tus calificaciones. Así es como funciona:</p>

            <div className="space-y-4">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4 text-pink-500" />
                    ¿Qué veo al entrar?
                </h4>
                <ul className="space-y-2">
                    {[
                        'Tus programas inscritos (Piano, Guitarra, Canto, etc.)',
                        'Las actividades de cada programa con su calificación',
                        'Tu porcentaje de avance general',
                        'Tus horarios de clase',
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    ¿Cómo ver mis calificaciones?
                </h4>
                <StepList
                    color="bg-pink-500"
                    steps={[
                        { text: 'Inicia sesión con tu usuario y contraseña.' },
                        { text: 'Verás automáticamente tu página de calificaciones.', detail: 'Si estás en varios programas, selecciona el que quieras revisar.' },
                        { text: 'Haz clic en una actividad para ver el detalle.', detail: 'Cada actividad puede tener varios criterios de evaluación (por ejemplo: técnica, creatividad, presentación).' },
                    ]}
                />
            </div>

            <TipBox tips={[
                'Las calificaciones se actualizan cuando tu profesor las registra.',
                'Si ves algo que no entiendes, pregúntale a tu profesor en la siguiente clase.',
            ]} />
        </div>
    );
}

/* ───────── Sección: Portal de Padres ───────── */
function ParentGuide() {
    return (
        <div className="space-y-6">
            <p className="text-muted-foreground">Como padre o acudiente, puedes ver el progreso académico de tus hijos en la plataforma.</p>

            <div className="space-y-4">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4 text-rose-500" />
                    ¿Qué veo al entrar?
                </h4>
                <ul className="space-y-2">
                    {[
                        'La lista de tus hijos registrados en la academia',
                        'El programa en el que está inscrito cada hijo',
                        'Las calificaciones y progreso de cada uno',
                        'Puedes hacer clic en cada hijo para ver su detalle completo',
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    ¿Cómo ver las calificaciones de mi hijo?
                </h4>
                <StepList
                    color="bg-rose-500"
                    steps={[
                        { text: 'Inicia sesión con tu usuario y contraseña de padre/acudiente.' },
                        { text: 'Verás el panel con la lista de tus hijos.' },
                        { text: 'Haz clic en el nombre de tu hijo.', detail: 'Se abrirán sus calificaciones completas.' },
                        { text: 'Si tu hijo está en varios programas, selecciona el programa que quieras revisar.' },
                        { text: 'Haz clic en cada actividad para ver el detalle de evaluación.' },
                    ]}
                />
            </div>

            <TipBox tips={[
                'Ves exactamente la misma información que ve tu hijo en su portal.',
                'Si necesitas agregar otro hijo, ve a "Dependientes" en tu menú.',
                'Las calificaciones se actualizan en tiempo real cuando el profesor evalúa.',
            ]} />
        </div>
    );
}

/* ───────── Sección: Cómo entender las calificaciones ───────── */
function GradesGuide() {
    return (
        <div className="space-y-6">
            <p className="text-muted-foreground">El sistema de calificaciones de la academia funciona así:</p>

            {/* Estructura */}
            <div className="space-y-3">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                    Estructura de evaluación
                </h4>
                <div className="rounded-xl border border-border overflow-hidden">
                    <div className="bg-muted px-5 py-3 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                            <span className="font-semibold text-foreground text-sm">Programa (ej: Piano)</span>
                        </div>
                    </div>
                    <div className="px-5 py-3 border-b border-border">
                        <div className="flex items-center gap-3 ml-6">
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-400"></div>
                            <span className="text-muted-foreground text-sm">Módulo (ej: Nivel Básico)</span>
                        </div>
                    </div>
                    <div className="px-5 py-3 border-b border-border">
                        <div className="flex items-center gap-3 ml-12">
                            <div className="h-2 w-2 rounded-full bg-green-400"></div>
                            <span className="text-muted-foreground text-sm">Actividad (ej: Práctica de Escalas)</span>
                        </div>
                    </div>
                    <div className="px-5 py-3">
                        <div className="flex items-center gap-3 ml-[72px]">
                            <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                            <span className="text-muted-foreground text-sm">Criterios (ej: Técnica 40%, Ritmo 30%, Expresión 30%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cómo se calcula */}
            <div className="space-y-3">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-indigo-500" />
                    ¿Cómo se calcula la nota?
                </h4>
                <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-start gap-3">
                        <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-amber-500" />
                        <p>Cada <strong>actividad</strong> tiene varios <strong>criterios de evaluación</strong> con un porcentaje asignado.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-amber-500" />
                        <p>El profesor califica cada criterio con una nota (por ejemplo, del 1 al 5).</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-amber-500" />
                        <p>La <strong>nota final de la actividad</strong> es el promedio ponderado de todos los criterios.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <ArrowRight className="h-4 w-4 mt-1 shrink-0 text-amber-500" />
                        <p>El <strong>porcentaje general</strong> muestra tu avance total en el programa.</p>
                    </div>
                </div>
            </div>

            {/* Ejemplo visual */}
            <div className="space-y-3">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Ejemplo
                </h4>
                <div className="rounded-xl border border-border overflow-hidden text-sm">
                    <div className="bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 font-semibold text-amber-900 dark:text-amber-100 border-b border-amber-200 dark:border-amber-800">
                        Actividad: Práctica de Escalas
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-muted border-b border-border">
                                <th className="px-4 py-2 text-left text-muted-foreground font-semibold">Criterio</th>
                                <th className="px-4 py-2 text-center text-muted-foreground font-semibold">Peso</th>
                                <th className="px-4 py-2 text-center text-muted-foreground font-semibold">Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-border">
                                <td className="px-4 py-2 text-muted-foreground">Técnica</td>
                                <td className="px-4 py-2 text-center text-muted-foreground">40%</td>
                                <td className="px-4 py-2 text-center font-semibold text-green-600">4.5</td>
                            </tr>
                            <tr className="border-b border-border">
                                <td className="px-4 py-2 text-muted-foreground">Ritmo</td>
                                <td className="px-4 py-2 text-center text-muted-foreground">30%</td>
                                <td className="px-4 py-2 text-center font-semibold text-green-600">4.0</td>
                            </tr>
                            <tr className="border-b border-border">
                                <td className="px-4 py-2 text-muted-foreground">Expresión Musical</td>
                                <td className="px-4 py-2 text-center text-muted-foreground">30%</td>
                                <td className="px-4 py-2 text-center font-semibold text-amber-600">3.5</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="bg-muted px-4 py-3 flex justify-between items-center border-t border-border">
                        <span className="font-semibold text-muted-foreground">Nota Final</span>
                        <span className="font-bold text-lg text-amber-700 dark:text-amber-300">4.05</span>
                    </div>
                    <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
                        Cálculo: (4.5 × 40%) + (4.0 × 30%) + (3.5 × 30%) = 1.8 + 1.2 + 1.05 = 4.05
                    </div>
                </div>
            </div>

            <TipBox tips={[
                'Si una actividad no tiene nota, significa que el profesor aún no la ha evaluado.',
                'El porcentaje general sube a medida que se evalúan más actividades.',
                'Si tienes dudas sobre una calificación, habla con tu profesor.',
            ]} />
        </div>
    );
}

/* ───────── Sección: Configurar perfil ───────── */
function ProfileGuide() {
    return (
        <div className="space-y-5">
            <p className="text-muted-foreground">Puedes actualizar tus datos personales y cambiar tu contraseña.</p>
            <StepList
                color="bg-gray-600"
                steps={[
                    { text: 'Haz clic en tu nombre o foto en la parte inferior del menú lateral.' },
                    { text: 'Selecciona "Configuración".' },
                    { text: 'En "Perfil" puedes cambiar tu nombre, foto y datos de contacto.' },
                    { text: 'En "Contraseña" puedes cambiar tu clave de acceso.', detail: 'Necesitas escribir tu contraseña actual para poder cambiarla.' },
                ]}
            />
            <TipBox tips={[
                'Usa una contraseña segura con letras, números y caracteres especiales.',
                'Si olvidaste tu contraseña, puedes recuperarla desde la pantalla de inicio de sesión.',
            ]} />
        </div>
    );
}

/* ───────── Secciones ───────── */
const sections: GuideSection[] = [
    {
        id: 'login',
        title: 'Cómo Iniciar Sesión',
        icon: LogIn,
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-800',
        content: <LoginGuide />,
    },
    {
        id: 'student',
        title: 'Guía para Estudiantes',
        icon: Award,
        color: 'bg-pink-500',
        bgColor: 'bg-pink-50 dark:bg-pink-950/30',
        borderColor: 'border-pink-200 dark:border-pink-800',
        content: <StudentGuide />,
    },
    {
        id: 'parent',
        title: 'Guía para Padres y Acudientes',
        icon: Heart,
        color: 'bg-rose-500',
        bgColor: 'bg-rose-50 dark:bg-rose-950/30',
        borderColor: 'border-rose-200 dark:border-rose-800',
        content: <ParentGuide />,
    },
    {
        id: 'grades',
        title: 'Cómo Entender las Calificaciones',
        icon: BarChart,
        color: 'bg-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        borderColor: 'border-amber-200 dark:border-amber-800',
        content: <GradesGuide />,
    },
    {
        id: 'profile',
        title: 'Cómo Configurar mi Perfil',
        icon: Lock,
        color: 'bg-gray-600',
        bgColor: 'bg-muted',
        borderColor: 'border-border',
        content: <ProfileGuide />,
    },
];

/* ───────── Página principal ───────── */
export default function Guia() {
    return (
        <>
            <Head title="Guía de Uso - Academia Linaje">
                <meta name="description" content="Guía de uso de la plataforma KAIROS para estudiantes y padres de la Academia Linaje." />
            </Head>

            <div className="min-h-screen bg-gradient-to-b from-amber-50/50 dark:from-neutral-950 via-white dark:via-neutral-900 to-white dark:to-neutral-900">
                {/* Header */}
                <header className="bg-card border-b-2 border-amber-600/40 shadow-sm">
                    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4 flex items-center justify-between">
                        <a href="/" className="flex items-center gap-3">
                            <img
                                src="/logo_academia.png"
                                alt="Academia Linaje"
                                className="h-10 w-auto"
                            />
                        </a>
                        <Link
                            href={login()}
                            className="rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all hover:from-amber-700 hover:to-amber-800"
                        >
                            Iniciar Sesión
                        </Link>
                    </div>
                </header>

                {/* Hero */}
                <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-10 pb-8">
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg">
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
                            Guía de Uso
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            Aprende a usar la plataforma KAIROS para consultar calificaciones, horarios y más.
                        </p>
                    </div>
                </div>

                {/* Quick access cards */}
                <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Iniciar Sesión', icon: LogIn, color: 'text-blue-500', href: '#login' },
                            { label: 'Estudiantes', icon: Award, color: 'text-pink-500', href: '#student' },
                            { label: 'Padres', icon: Heart, color: 'text-rose-500', href: '#parent' },
                            { label: 'Calificaciones', icon: BarChart, color: 'text-amber-600', href: '#grades' },
                        ].map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-center hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all"
                            >
                                <item.icon className={`h-6 w-6 ${item.color}`} />
                                <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Secciones */}
                <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 space-y-4">
                    {sections.map((section, i) => (
                        <div key={section.id} id={section.id}>
                            <Accordion section={section} defaultOpen={i === 0} />
                        </div>
                    ))}

                    {/* CTA */}
                    <div className="rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 p-6 sm:p-8 text-center text-white shadow-lg mt-8">
                        <h3 className="text-xl font-bold mb-2">¿Listo para comenzar?</h3>
                        <p className="text-amber-100 mb-5 text-sm">Ingresa a la plataforma y consulta tus calificaciones.</p>
                        <Link
                            href={login()}
                            className="inline-flex items-center gap-2 rounded-lg bg-card px-6 py-3 text-sm font-bold text-amber-800 dark:text-amber-200 shadow-md hover:shadow-lg transition-all hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        >
                            <LogIn className="h-4 w-4" />
                            Iniciar Sesión
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-8 pb-4">
                        <p className="text-xs text-muted-foreground">
                            Academia Linaje — Plataforma KAIROS · 2026
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            ¿Necesitas ayuda? Escríbenos por{' '}
                            <a href="https://wa.me/573004218146" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">
                                WhatsApp
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

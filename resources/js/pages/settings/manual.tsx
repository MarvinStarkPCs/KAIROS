import { Head } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem, type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    BookOpen, Users, UserPlus, Calendar, CheckSquare, CreditCard,
    GraduationCap, Award, Heart, Settings, MessageSquare, Shield,
    BarChart, Megaphone, ChevronDown, ChevronRight, Lightbulb,
    ArrowRight, Monitor, type LucideIcon,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manual de la Plataforma', href: '/settings/manual' },
];

/* ───────── Tipos ───────── */
interface Step {
    text: string;
    tip?: string;
}

interface GuideSection {
    id: string;
    title: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    intro: string;
    features: string[];
    steps?: Step[];
    tips?: string[];
}

/* ───────── Componente acordeón ───────── */
function AccordionCard({ section, defaultOpen = false }: { section: GuideSection; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    const Icon = section.icon;

    return (
        <div className="overflow-hidden rounded-xl border border-border dark:border-gray-700 transition-all">
            {/* Header clickeable */}
            <button
                onClick={() => setOpen(!open)}
                className={`flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted dark:hover:bg-gray-800/50 ${open ? 'bg-muted/50 dark:bg-gray-800/30' : ''}`}
            >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${section.color}`}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground dark:text-gray-100">{section.title}</h3>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">{section.intro}</p>
                </div>
                {open ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
            </button>

            {/* Contenido expandible */}
            {open && (
                <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-4 space-y-4">
                    {/* Qué puedes hacer */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground mb-2">Qué puedes hacer</p>
                        <ul className="space-y-1.5">
                            {section.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground dark:text-gray-300">
                                    <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pasos rápidos */}
                    {section.steps && section.steps.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground mb-2">Cómo hacerlo</p>
                            <ol className="space-y-2">
                                {section.steps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${section.color}`}>
                                            {i + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm text-muted-foreground dark:text-gray-300">{step.text}</p>
                                            {step.tip && (
                                                <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5 italic">{step.tip}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* Tips */}
                    {section.tips && section.tips.length > 0 && (
                        <div className={`rounded-lg ${section.bgColor} p-3`}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <Lightbulb className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Tips</p>
                            </div>
                            <ul className="space-y-1">
                                {section.tips.map((tip, i) => (
                                    <li key={i} className="text-xs text-muted-foreground dark:text-muted-foreground">• {tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ───────── Datos del manual ───────── */

const adminSections: GuideSection[] = [
    {
        id: 'programs',
        title: 'Programas Académicos',
        icon: BookOpen,
        color: 'bg-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        intro: 'Gestiona los programas de música que ofrece la academia.',
        features: [
            'Crear programas de música (Piano, Guitarra, Canto, etc.)',
            'Definir el plan de estudio con módulos y actividades',
            'Configurar criterios de evaluación para cada actividad',
            'Establecer mensualidad y tipo de programa (regular o demo)',
            'Asignar icono y color representativo a cada programa',
        ],
        steps: [
            { text: 'Ve a "Programas Académicos" en el menú lateral.', },
            { text: 'Haz clic en "Nuevo Programa" y llena nombre, descripción y mensualidad.' },
            { text: 'Una vez creado, entra al programa y agrega módulos al plan de estudio.' },
            { text: 'Dentro de cada módulo, crea actividades con sus criterios de evaluación.', tip: 'Los criterios deben sumar 100% del peso total.' },
        ],
        tips: [
            'Los programas tipo "Demo" aparecen en la landing para clases gratis.',
            'Puedes desactivar un programa sin eliminarlo cambiando su estado.',
        ],
    },
    {
        id: 'users',
        title: 'Usuarios',
        icon: Users,
        color: 'bg-indigo-500',
        bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
        intro: 'Administra estudiantes, profesores, padres y administradores.',
        features: [
            'Ver listado completo de usuarios con filtros y búsqueda',
            'Crear nuevos usuarios y asignarles un rol',
            'Editar información personal y datos de contacto',
            'Ver el detalle completo con inscripciones, pagos y actividad',
        ],
        steps: [
            { text: 'Ve a "Usuarios" desde el menú lateral.' },
            { text: 'Usa la barra de búsqueda para encontrar usuarios por nombre o documento.' },
            { text: 'Para crear uno nuevo, haz clic en "Nuevo Usuario".', tip: 'Asigna el rol correcto: Estudiante, Profesor, Padre/Madre o Administrador.' },
        ],
        tips: [
            'Los estudiantes también se crean automáticamente al hacer matrícula pública.',
            'Desde el detalle de un usuario puedes ver todo su historial.',
        ],
    },
    {
        id: 'roles',
        title: 'Roles y Permisos',
        icon: Shield,
        color: 'bg-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        intro: 'Controla qué puede hacer cada tipo de usuario.',
        features: [
            'Crear roles personalizados (Admin, Profesor, Estudiante, Padre/Madre)',
            'Asignar permisos específicos a cada rol',
            'Los permisos controlan el acceso a cada módulo del sistema',
        ],
        steps: [
            { text: 'Ve a "Roles" (necesitas permiso de administrador).' },
            { text: 'Crea o edita un rol y marca los permisos que necesite.' },
        ],
        tips: [
            'Los roles predeterminados ya vienen configurados. Solo modifícalos si necesitas permisos especiales.',
            'Cada sección del menú se muestra u oculta según los permisos del usuario.',
        ],
    },
    {
        id: 'enrollments',
        title: 'Matrículas / Inscripciones',
        icon: UserPlus,
        color: 'bg-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        intro: 'Gestiona las inscripciones de estudiantes en programas.',
        features: [
            'Ver todas las inscripciones con su estado (Activa, Suspendida, Completada, etc.)',
            'Crear inscripciones manuales desde el panel',
            'Cambiar el estado de una inscripción',
            'Ver detalle con información de pago y horario preferido',
        ],
        steps: [
            { text: 'Ve a "Matrículas" en el menú lateral.' },
            { text: 'Para inscribir un estudiante manualmente, haz clic en "Nueva Matrícula".' },
            { text: 'Selecciona el estudiante, el programa y completa los datos.', tip: 'Un estudiante no puede tener dos inscripciones activas en el mismo programa.' },
        ],
        tips: [
            'Los estudiantes también pueden inscribirse solos desde la página pública /matricula.',
            'Las inscripciones en estado "Esperando" necesitan aprobación manual.',
            'Familias con varios hijos reciben descuento automático.',
        ],
    },
    {
        id: 'schedules',
        title: 'Horarios',
        icon: Calendar,
        color: 'bg-cyan-600',
        bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
        intro: 'Organiza los horarios de clases y asigna profesores.',
        features: [
            'Ver horarios en formato de calendario visual',
            'Crear horarios con días, horas, programa y profesor asignado',
            'Inscribir estudiantes en un horario específico',
            'Detectar conflictos de horario automáticamente',
            'Inscripción masiva de estudiantes',
        ],
        steps: [
            { text: 'Ve a "Horarios" en el menú lateral.' },
            { text: 'Haz clic en "Nuevo Horario" y configura días, hora inicio/fin.' },
            { text: 'Asigna un profesor y el programa académico.' },
            { text: 'Desde el detalle del horario, inscribe estudiantes al grupo.', tip: 'El sistema detecta si un estudiante ya tiene clase a esa hora.' },
        ],
        tips: [
            'Usa la vista de calendario para visualizar toda la semana.',
            'Puedes cambiar el profesor de un horario sin afectar a los estudiantes.',
        ],
    },
    {
        id: 'attendance',
        title: 'Asistencia',
        icon: CheckSquare,
        color: 'bg-teal-600',
        bgColor: 'bg-teal-50 dark:bg-teal-950/30',
        intro: 'Registra y consulta la asistencia de los estudiantes.',
        features: [
            'Registrar asistencia individual o masiva por grupo',
            'Marcar como: Presente, Ausente, Tardanza o Excusa',
            'Consultar historial de asistencia por estudiante',
        ],
        steps: [
            { text: 'Ve a "Asistencia" en el menú lateral.' },
            { text: 'Selecciona el horario/grupo y la fecha.' },
            { text: 'Marca el estado de cada estudiante y guarda.' },
        ],
        tips: [
            'Los profesores también pueden marcar asistencia desde su portal.',
        ],
    },
    {
        id: 'payments',
        title: 'Pagos',
        icon: CreditCard,
        color: 'bg-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
        intro: 'Gestiona cobros, cuotas y pagos en línea con Wompi.',
        features: [
            'Ver todos los pagos con filtros por estado y estudiante',
            'Crear pagos individuales o generar cuotas mensuales',
            'Registrar pagos manuales (efectivo, transferencia)',
            'Integración con Wompi para pagos en línea',
            'Configurar la pasarela de pagos y montos predeterminados',
        ],
        steps: [
            { text: 'Ve a "Pagos" en el menú lateral.' },
            { text: 'Para crear cuotas, haz clic en "Generar Cuotas" y selecciona el estudiante.' },
            { text: 'Para registrar un pago manual, entra al pago pendiente y haz clic en "Registrar Pago".' },
            { text: 'Configura Wompi en Configuración > Pasarela Wompi para pagos en línea.', tip: 'Necesitas las llaves pública y privada de tu cuenta Wompi.' },
        ],
        tips: [
            'Los pagos en línea se confirman automáticamente vía webhook.',
            'Puedes generar facturas desde el detalle de cada pago.',
            'Los descuentos familiares se aplican automáticamente al generar cuotas.',
        ],
    },
    {
        id: 'demo-leads',
        title: 'Solicitudes de Clase Demo',
        icon: Megaphone,
        color: 'bg-orange-500',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        intro: 'Gestiona las solicitudes de clases gratis desde la landing.',
        features: [
            'Ver todas las solicitudes recibidas desde la página web',
            'Cambiar estado: Pendiente, Contactado, Confirmado, etc.',
            'Agregar notas internas sobre cada solicitud',
        ],
        steps: [
            { text: 'Ve a "Demo Leads" (desde el menú o la ruta /admin/demo-leads).' },
            { text: 'Revisa las solicitudes nuevas y contacta al interesado.' },
            { text: 'Actualiza el estado según avance la gestión.' },
        ],
        tips: [
            'Las solicitudes llegan cuando alguien pide una clase gratis en la landing.',
            'Usa las notas para llevar registro del seguimiento.',
        ],
    },
    {
        id: 'communication',
        title: 'Comunicación',
        icon: MessageSquare,
        color: 'bg-violet-500',
        bgColor: 'bg-violet-50 dark:bg-violet-950/30',
        intro: 'Envía mensajes internos a profesores, estudiantes y padres.',
        features: [
            'Iniciar conversaciones con cualquier usuario del sistema',
            'Enviar y recibir mensajes en tiempo real',
            'Historial completo de conversaciones',
        ],
        steps: [
            { text: 'Ve a "Comunicación" en el menú.' },
            { text: 'Haz clic en "Nueva Conversación" y selecciona el destinatario.' },
            { text: 'Escribe tu mensaje y envíalo.' },
        ],
    },
    {
        id: 'audit',
        title: 'Auditoría',
        icon: BarChart,
        color: 'bg-slate-600',
        bgColor: 'bg-slate-50 dark:bg-slate-950/30',
        intro: 'Revisa el historial de cambios en el sistema.',
        features: [
            'Ver quién hizo qué y cuándo en toda la plataforma',
            'Filtrar por usuario, módulo o fecha',
            'Registro automático de creaciones, ediciones y eliminaciones',
        ],
        tips: [
            'Útil para verificar quién modificó una inscripción o un pago.',
            'El sistema registra cambios automáticamente, no necesitas activar nada.',
        ],
    },
];

const teacherSections: GuideSection[] = [
    {
        id: 'teacher-groups',
        title: 'Mis Grupos',
        icon: GraduationCap,
        color: 'bg-sky-600',
        bgColor: 'bg-sky-50 dark:bg-sky-950/30',
        intro: 'Ve tus grupos asignados, toma asistencia y evalúa estudiantes.',
        features: [
            'Ver todos los grupos que tienes asignados',
            'Ver la lista de estudiantes de cada grupo',
            'Tomar asistencia directamente desde tu portal',
            'Evaluar actividades y calificar estudiantes por criterios',
        ],
        steps: [
            { text: 'Al iniciar sesión serás dirigido a "Mis Grupos".' },
            { text: 'Selecciona un grupo para ver sus estudiantes.' },
            { text: 'Para tomar asistencia, haz clic en "Asistencia" y marca cada estudiante.' },
            { text: 'Para evaluar, selecciona una actividad y califica por cada criterio.', tip: 'Las calificaciones se guardan automáticamente al hacer clic en Guardar.' },
        ],
        tips: [
            'Puedes ver el historial de asistencia de clases anteriores.',
            'Las calificaciones que pongas son visibles para el estudiante y sus padres.',
        ],
    },
];

const studentSections: GuideSection[] = [
    {
        id: 'student-grades',
        title: 'Mis Calificaciones',
        icon: Award,
        color: 'bg-pink-500',
        bgColor: 'bg-pink-50 dark:bg-pink-950/30',
        intro: 'Consulta tus notas y progreso en cada programa.',
        features: [
            'Ver calificaciones de todos tus programas inscritos',
            'Consultar nota por actividad y por criterio de evaluación',
            'Ver tu porcentaje de avance general',
            'Revisar tus horarios de clase',
        ],
        steps: [
            { text: 'Al iniciar sesión verás directamente tus calificaciones.' },
            { text: 'Si estás en varios programas, selecciona el que quieras revisar.' },
            { text: 'Cada actividad muestra el detalle de evaluación por criterio.' },
        ],
    },
];

const parentSections: GuideSection[] = [
    {
        id: 'parent-portal',
        title: 'Panel de Padres',
        icon: Heart,
        color: 'bg-rose-500',
        bgColor: 'bg-rose-50 dark:bg-rose-950/30',
        intro: 'Sigue el progreso académico de tus hijos.',
        features: [
            'Ver el panel con todos tus hijos registrados',
            'Consultar calificaciones de cada hijo por programa',
            'Gestionar dependientes (agregar o editar hijos)',
            'Ver el progreso y notas de cada actividad',
        ],
        steps: [
            { text: 'Al iniciar sesión verás tu panel con la lista de hijos.' },
            { text: 'Haz clic en el nombre de un hijo para ver sus calificaciones.' },
            { text: 'Si necesitas agregar un hijo, ve a "Dependientes" y crea uno nuevo.' },
        ],
        tips: [
            'Puedes ver las mismas calificaciones que ve tu hijo en su portal.',
            'Si tu hijo está en varios programas, puedes filtrar por programa.',
        ],
    },
];

const configSections: GuideSection[] = [
    {
        id: 'settings',
        title: 'Configuración de Cuenta',
        icon: Settings,
        color: 'bg-gray-600',
        bgColor: 'bg-muted dark:bg-gray-800/30',
        intro: 'Personaliza tu perfil y opciones de seguridad.',
        features: [
            'Editar tu nombre, foto y datos de contacto',
            'Cambiar tu contraseña de acceso',
            'Activar autenticación de dos factores (2FA) para mayor seguridad',
            'Cambiar el tema visual (claro/oscuro)',
            'Configurar servidor de correo SMTP (solo admin)',
            'Configurar pasarela de pagos Wompi (solo admin)',
        ],
        steps: [
            { text: 'Haz clic en tu nombre/avatar en la esquina inferior del menú.' },
            { text: 'Selecciona "Configuración".' },
            { text: 'Navega entre las opciones del menú lateral: Perfil, Contraseña, etc.' },
        ],
    },
];

/* ───────── Componente de sección de rol ───────── */
function RoleBlock({ title, emoji, description, sections, defaultOpenFirst = false }: {
    title: string;
    emoji: string;
    description: string;
    sections: GuideSection[];
    defaultOpenFirst?: boolean;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-lg">{emoji}</span>
                <h2 className="text-base font-bold text-foreground dark:text-gray-100">{title}</h2>
            </div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">{description}</p>
            <div className="space-y-3">
                {sections.map((section, i) => (
                    <AccordionCard key={section.id} section={section} defaultOpen={defaultOpenFirst && i === 0} />
                ))}
            </div>
        </div>
    );
}

/* ───────── Página principal ───────── */
export default function Manual() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.roles.includes('Administrador');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manual de la Plataforma" />

            <SettingsLayout>
                <div className="space-y-8">
                    <HeadingSmall
                        title="Manual de la Plataforma"
                        description="Guía completa para usar KAIROS — Academia Linaje"
                    />

                    {/* Bienvenida */}
                    <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 p-5">
                        <div className="flex items-start gap-3">
                            <Monitor className="h-6 w-6 shrink-0 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Bienvenido a KAIROS</p>
                                <p className="text-sm text-amber-800 dark:text-amber-200/80 dark:text-amber-300/80 mt-1">
                                    KAIROS es el sistema de gestión académica de la Academia Linaje. Aquí podrás administrar
                                    programas, estudiantes, horarios, pagos y mucho más. Haz clic en cada sección para ver
                                    la guía detallada.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Inicio rápido */}
                    <div className="rounded-xl border border-border dark:border-gray-700 p-5 space-y-3">
                        <h2 className="text-sm font-bold text-foreground dark:text-gray-100 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Inicio Rápido
                        </h2>
                        <div className="grid gap-2 text-sm">
                            <div className="flex items-start gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white mt-0.5">1</span>
                                <span className="text-muted-foreground dark:text-gray-300"><strong>Crea los programas</strong> que ofrece la academia (Piano, Guitarra, Canto...)</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white mt-0.5">2</span>
                                <span className="text-muted-foreground dark:text-gray-300"><strong>Registra los horarios</strong> y asigna un profesor a cada uno</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white mt-0.5">3</span>
                                <span className="text-muted-foreground dark:text-gray-300"><strong>Inscribe estudiantes</strong> manualmente o comparte el link de matrícula pública</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white mt-0.5">4</span>
                                <span className="text-muted-foreground dark:text-gray-300"><strong>Asigna estudiantes</strong> a los horarios correspondientes</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white mt-0.5">5</span>
                                <span className="text-muted-foreground dark:text-gray-300"><strong>Listo!</strong> Los profesores ya pueden tomar asistencia y evaluar</span>
                            </div>
                        </div>
                    </div>

                    {/* Secciones por rol */}
                    {isAdmin && (
                        <RoleBlock
                            title="Panel Administrativo"
                            emoji="👑"
                            description="Todas las herramientas para gestionar la academia."
                            sections={adminSections}
                            defaultOpenFirst
                        />
                    )}

                    <RoleBlock
                        title="Portal del Profesor"
                        emoji="🎓"
                        description="Herramientas para profesores: grupos, asistencia y evaluación."
                        sections={teacherSections}
                    />

                    <RoleBlock
                        title="Portal del Estudiante"
                        emoji="📚"
                        description="Lo que ve el estudiante al iniciar sesión."
                        sections={studentSections}
                    />

                    <RoleBlock
                        title="Portal de Padres"
                        emoji="👨‍👩‍👧"
                        description="Seguimiento del progreso de los hijos."
                        sections={parentSections}
                    />

                    <RoleBlock
                        title="Configuración"
                        emoji="⚙️"
                        description="Opciones de perfil y seguridad."
                        sections={configSections}
                    />

                    {/* Footer */}
                    <div className="rounded-lg border border-border bg-muted p-4 text-center text-xs text-muted-foreground dark:border-gray-700 dark:bg-gray-800 dark:text-muted-foreground">
                        Academia Linaje — Plataforma KAIROS · Manual v1.0 · 2026
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

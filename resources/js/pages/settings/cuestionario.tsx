import type { RequestPayload } from '@inertiajs/core';
import { Head, router } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    ChevronRight,
    ClipboardCopy,
    Download,
    Loader2,
    Save,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';

import {
    buildExport,
    getList,
    getText,
    isAnswered,
    OTHER_SUFFIX,
    overallProgress,
    questionKeys,
    sectionProgress,
    type Answers,
} from './cuestionario/helpers';
import {
    MODES,
    NOTES_SECTION,
    SECTIONS,
    type Question,
    type Section,
} from './cuestionario/questions';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Cuestionario de la academia', href: '/settings/cuestionario' },
];

interface Props {
    answers: Answers;
    /** Respuestas sugeridas a partir de los datos que ya están en Kairos. */
    prefill: Answers;
    updatedAt: string | null;
    submittedAt: string | null;
    progressPercent: number;
    isProfesor: boolean;
}

/* ───────── Opción tipo chip ───────── */
function Chip({
    label,
    selected,
    onClick,
}: {
    label: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
                selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted',
            )}
        >
            {selected && <Check className="h-3 w-3" />}
            {label}
        </button>
    );
}

/* ───────── Una pregunta ───────── */
function QuestionField({
    question,
    answers,
    onChange,
    systemKeys,
}: {
    question: Question;
    answers: Answers;
    onChange: (key: string, value: unknown) => void;
    systemKeys?: Set<string>;
}) {
    const otherKey = `${question.id}${OTHER_SUFFIX}`;
    const answered = isAnswered(answers, question);
    const fromSystem = questionKeys(question).some((key) =>
        systemKeys?.has(key),
    );

    const toggleInList = (key: string, option: string) => {
        const list = getList(answers, key);
        onChange(
            key,
            list.includes(option)
                ? list.filter((item) => item !== option)
                : [...list, option],
        );
    };

    return (
        <div className="space-y-2 border-l-2 border-transparent pl-0">
            <div className="flex items-start gap-2">
                <span
                    className={cn(
                        'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                        answered ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                    )}
                />
                <div className="flex-1">
                    <Label className="text-sm font-medium text-foreground">
                        {question.label}
                    </Label>
                    {question.note && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {question.note}
                        </p>
                    )}
                    {fromSystem && (
                        <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                            Dato tomado de Kairos: confírmalo o corrígelo.
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2 pl-3.5">
                {question.type === 'checks' && (
                    <div className="flex flex-wrap gap-1.5">
                        {question.options.map((option) => (
                            <Chip
                                key={option}
                                label={option}
                                selected={getList(
                                    answers,
                                    question.id,
                                ).includes(option)}
                                onClick={() =>
                                    toggleInList(question.id, option)
                                }
                            />
                        ))}
                    </div>
                )}

                {question.type === 'choice' && (
                    <div className="flex flex-wrap gap-1.5">
                        {question.options.map((option) => (
                            <Chip
                                key={option}
                                label={option}
                                selected={
                                    getText(answers, question.id) === option
                                }
                                onClick={() =>
                                    onChange(
                                        question.id,
                                        getText(answers, question.id) === option
                                            ? ''
                                            : option,
                                    )
                                }
                            />
                        ))}
                    </div>
                )}

                {question.type === 'bymode' && (
                    <div className="space-y-2">
                        {MODES.map((mode) => {
                            const key = `${question.id}__${mode.key}`;
                            return (
                                <div
                                    key={mode.key}
                                    className="rounded-lg border border-border p-2"
                                >
                                    <p className="mb-1.5 text-xs font-semibold text-foreground">
                                        {mode.label}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {question.options.map((option) => (
                                            <Chip
                                                key={option}
                                                label={option}
                                                selected={
                                                    question.multiple
                                                        ? getList(
                                                              answers,
                                                              key,
                                                          ).includes(option)
                                                        : getText(
                                                              answers,
                                                              key,
                                                          ) === option
                                                }
                                                onClick={() => {
                                                    if (question.multiple) {
                                                        toggleInList(
                                                            key,
                                                            option,
                                                        );
                                                    } else {
                                                        onChange(
                                                            key,
                                                            getText(
                                                                answers,
                                                                key,
                                                            ) === option
                                                                ? ''
                                                                : option,
                                                        );
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {question.type === 'fields' && (
                    <div className="grid gap-2 sm:grid-cols-2">
                        {question.fields.map((field) => (
                            <div key={field.id} className="space-y-1">
                                <Label className="text-xs text-muted-foreground">
                                    {field.label}
                                </Label>
                                <Input
                                    value={getText(
                                        answers,
                                        `${question.id}__${field.id}`,
                                    )}
                                    onChange={(event) =>
                                        onChange(
                                            `${question.id}__${field.id}`,
                                            event.target.value,
                                        )
                                    }
                                    className="h-8 text-sm"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {question.type === 'text' && (
                    <Textarea
                        rows={question.rows ?? 3}
                        placeholder={question.placeholder}
                        value={getText(answers, question.id)}
                        onChange={(event) =>
                            onChange(question.id, event.target.value)
                        }
                        className="text-sm"
                    />
                )}

                {'other' in question && question.other && (
                    <Input
                        placeholder="Otro (escribe aquí)"
                        value={getText(answers, otherKey)}
                        onChange={(event) =>
                            onChange(otherKey, event.target.value)
                        }
                        className="h-8 text-sm"
                    />
                )}
            </div>
        </div>
    );
}

/* ───────── Sección plegable ───────── */
function SectionCard({
    section,
    answers,
    onChange,
    systemKeys,
    defaultOpen = false,
}: {
    section: Section;
    answers: Answers;
    onChange: (key: string, value: unknown) => void;
    systemKeys: Set<string>;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const progress = sectionProgress(answers, section);
    const complete = progress.answered === progress.total;

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted',
                    open && 'bg-muted/50',
                )}
            >
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground">
                        {section.title}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                        {section.description}
                    </p>
                </div>
                <span
                    className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
                        complete
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : 'bg-muted text-muted-foreground',
                    )}
                >
                    {progress.answered}/{progress.total}
                </span>
                {open ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
            </button>

            {open && (
                <div className="space-y-5 border-t border-border px-4 py-4">
                    {section.questions.map((question) => (
                        <QuestionField
                            key={question.id}
                            question={question}
                            answers={answers}
                            onChange={onChange}
                            systemKeys={systemKeys}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ───────── Página ───────── */
export default function Cuestionario({
    answers: initialAnswers,
    prefill,
    updatedAt,
    submittedAt,
    progressPercent: initialProgressPercent,
    isProfesor,
}: Props) {
    // Lo que ya respondió el usuario manda sobre lo que sugiere Kairos.
    const [answers, setAnswers] = useState<Answers>(() => ({
        ...(prefill ?? {}),
        ...(initialAnswers ?? {}),
    }));
    // Claves que vienen de la base de datos y el usuario todavía no ha tocado.
    const [systemKeys, setSystemKeys] = useState<Set<string>>(
        () =>
            new Set(
                Object.keys(prefill ?? {}).filter(
                    (key) => !(key in (initialAnswers ?? {})),
                ),
            ),
    );
    const [savedAt, setSavedAt] = useState<string | null>(updatedAt);
    const [saving, setSaving] = useState(false);
    const firstRender = useRef(true);
    const latest = useRef<Answers>({});
    const pending = useRef(false);

    const progress = useMemo(() => overallProgress(answers), [answers]);

    const save = useCallback((current: Answers, silent: boolean, currentPercent: number) => {
        setSaving(true);
        router.patch(
            '/settings/cuestionario',
            // Las respuestas son un objeto anidado (JSON), no un payload plano de formulario.
            { answers: current, silent, progress_percent: currentPercent } as unknown as RequestPayload,
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onSuccess: () => setSavedAt(new Date().toISOString()),
                onFinish: () => setSaving(false),
            },
        );
    }, []);

    // Autoguardado: espera a que el usuario deje de escribir.
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            latest.current = answers;
            return;
        }
        latest.current = answers;
        pending.current = true;
        const timer = window.setTimeout(() => {
            pending.current = false;
            save(answers, true, overallProgress(answers).percent);
        }, 1200);
        return () => window.clearTimeout(timer);
    }, [answers, save]);

    // Si sale de la página con cambios sin guardar, se avisa y se intenta guardar.
    useEffect(() => {
        const warn = (event: BeforeUnloadEvent) => {
            if (pending.current) {
                event.preventDefault();
            }
        };
        window.addEventListener('beforeunload', warn);

        return () => {
            window.removeEventListener('beforeunload', warn);
            if (pending.current) {
                save(latest.current, true, overallProgress(latest.current).percent);
            }
        };
    }, [save]);

    const setValue = useCallback((key: string, value: unknown) => {
        setAnswers((previous) => ({ ...previous, [key]: value }));
        setSystemKeys((previous) => {
            if (!previous.has(key)) {
                return previous;
            }
            const next = new Set(previous);
            next.delete(key);
            return next;
        });
    }, []);

    const copyAnswers = async () => {
        try {
            await navigator.clipboard.writeText(buildExport(answers));
            toast.success('Respuestas copiadas al portapapeles');
        } catch {
            toast.error('No se pudo copiar. Usa el botón de descargar.');
        }
    };

    const downloadAnswers = () => {
        const blob = new Blob([buildExport(answers)], {
            type: 'text/markdown;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cuestionario-academia-${new Date().toISOString().slice(0, 10)}.md`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cuestionario de la academia" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Cuestionario de análisis de la academia"
                        description="Para la visita: cómo trabaja la academia, qué material se usa en clase y qué logros se reconocen. Algunas respuestas vienen llenas con datos de Kairos (márcalas como correctas o corrígelas) y todo se guarda solo."
                    />

                    {/* Banner de acceso bloqueado — solo Profesores con menos del 100% */}
                    {isProfesor && progress.percent < 100 && (
                        <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-5 py-4">
                            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                            <div>
                                <p className="font-semibold text-amber-800 dark:text-amber-200">
                                    Acceso bloqueado — cuestionario al {progress.percent}%
                                </p>
                                <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-300">
                                    Debes responder <strong>todas</strong> las preguntas para acceder al sistema.
                                    Te faltan <strong>{progress.total - progress.answered}</strong> respuesta{progress.total - progress.answered !== 1 ? 's' : ''}.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Confirmación al 100% */}
                    {isProfesor && progress.percent >= 100 && (
                        <div className="flex items-center gap-2 rounded-xl border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 px-5 py-3 text-sm text-green-700 dark:text-green-300">
                            <ShieldCheck className="h-4 w-4 shrink-0 text-green-500" />
                            ¡Cuestionario completo al 100%! Tienes acceso completo al sistema.
                        </div>
                    )}

                    {/* Progreso y acciones */}
                    <div className="space-y-3 rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">
                                {progress.answered} de {progress.total}{' '}
                                preguntas
                            </span>
                            <span className="text-muted-foreground">
                                {progress.percent}%
                            </span>
                        </div>
                        <Progress value={progress.percent} className="h-2" />
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => save(answers, false, progress.percent)}
                                disabled={saving}
                            >
                                {saving ? (
                                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Save className="mr-1 h-3.5 w-3.5" />
                                )}
                                Guardar
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={copyAnswers}
                            >
                                <ClipboardCopy className="mr-1 h-3.5 w-3.5" />{' '}
                                Copiar respuestas
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={downloadAnswers}
                            >
                                <Download className="mr-1 h-3.5 w-3.5" />{' '}
                                Descargar
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                {saving
                                    ? 'Guardando…'
                                    : savedAt
                                      ? `Guardado ${new Date(savedAt).toLocaleString('es-CO')}`
                                      : 'Sin guardar todavía'}
                            </span>
                        </div>
                    </div>

                    {/* Secciones */}
                    <div className="space-y-3">
                        {SECTIONS.map((section, index) => (
                            <SectionCard
                                key={section.id}
                                section={section}
                                answers={answers}
                                onChange={setValue}
                                systemKeys={systemKeys}
                                defaultOpen={index === 0}
                            />
                        ))}
                    </div>

                    {/* Notas libres */}
                    <SectionCard
                        section={NOTES_SECTION}
                        answers={answers}
                        onChange={setValue}
                        systemKeys={systemKeys}
                    />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

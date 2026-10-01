import { Head } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronRight,
    ClipboardCopy,
    Download,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';

import {
    buildExport,
    overallProgress,
    summarize,
    type Answers,
} from './cuestionario/helpers';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Resultados del cuestionario',
        href: '/settings/cuestionario/resultados',
    },
];

interface SurveyResult {
    id: number;
    name: string;
    email: string | null;
    roles: string[];
    answers: Answers;
    updatedAt: string | null;
}

interface Props {
    surveys: SurveyResult[];
}

/** Quita el marcado Markdown para mostrar la línea en pantalla. */
function plain(line: string): string {
    return line.replace(/\*\*/g, '');
}

function ResultCard({ survey }: { survey: SurveyResult }) {
    const [open, setOpen] = useState(false);
    const progress = overallProgress(survey.answers);
    const sections = summarize(survey.answers);

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
                    <h3 className="truncate text-sm font-semibold text-foreground">
                        {survey.name}
                    </h3>
                    <p className="truncate text-xs text-muted-foreground">
                        {survey.roles.join(', ') || 'Sin rol'}
                        {survey.updatedAt
                            ? ` · ${new Date(survey.updatedAt).toLocaleDateString('es-CO')}`
                            : ''}
                    </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {progress.percent}%
                </span>
                {open ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
            </button>

            <div className="px-4 pb-3">
                <Progress value={progress.percent} className="h-1.5" />
            </div>

            {open && (
                <div className="space-y-4 border-t border-border px-4 py-4">
                    {sections.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Todavía no hay respuestas.
                        </p>
                    )}

                    {sections.map((section) => (
                        <div key={section.title} className="space-y-1">
                            <h4 className="text-xs font-semibold text-foreground">
                                {section.title}
                            </h4>
                            <ul className="space-y-1">
                                {section.lines.map((line, index) => (
                                    <li
                                        key={index}
                                        className="text-xs leading-relaxed text-muted-foreground"
                                    >
                                        {plain(line)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            navigator.clipboard
                                .writeText(
                                    buildExport(
                                        survey.answers,
                                        `Cuestionario — ${survey.name}`,
                                    ),
                                )
                                .then(() =>
                                    toast.success('Respuestas copiadas'),
                                )
                                .catch(() => toast.error('No se pudo copiar'));
                        }}
                    >
                        <ClipboardCopy className="mr-1 h-3.5 w-3.5" /> Copiar
                        estas respuestas
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function CuestionarioResultados({ surveys }: Props) {
    const downloadAll = () => {
        const content = surveys
            .map((survey) =>
                buildExport(
                    survey.answers,
                    `Cuestionario — ${survey.name}${survey.email ? ` (${survey.email})` : ''}`,
                ),
            )
            .join('\n\n---\n\n');

        const blob = new Blob([content], {
            type: 'text/markdown;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cuestionarios-academia-${new Date().toISOString().slice(0, 10)}.md`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resultados del cuestionario" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Resultados del cuestionario"
                        description="Respuestas de todos los profesores y administradores que han llenado el cuestionario de análisis."
                    />

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {surveys.length}{' '}
                            {surveys.length === 1
                                ? 'participante'
                                : 'participantes'}
                        </span>
                        {surveys.length > 0 && (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={downloadAll}
                            >
                                <Download className="mr-1 h-3.5 w-3.5" />{' '}
                                Descargar todo
                            </Button>
                        )}
                    </div>

                    {surveys.length === 0 ? (
                        <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
                            Nadie ha respondido el cuestionario todavía.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {surveys.map((survey) => (
                                <ResultCard key={survey.id} survey={survey} />
                            ))}
                        </div>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

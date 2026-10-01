import {
    MODES,
    NOTES_SECTION,
    OBSERVATION_QUESTIONS,
    SECTIONS,
    type Question,
    type Section,
} from './questions';

export type Answers = Record<string, unknown>;

export interface TimelineRow {
    min: number;
    momento: string;
    material: string;
    quien: string;
}

export interface Observation {
    answers: Answers;
    timeline: TimelineRow[];
}

export const OTHER_SUFFIX = '__otro';

export function getList(answers: Answers, key: string): string[] {
    const value = answers[key];
    return Array.isArray(value) ? (value as string[]) : [];
}

export function getText(answers: Answers, key: string): string {
    const value = answers[key];
    return typeof value === 'string' ? value : '';
}

export function getObservations(answers: Answers): Observation[] {
    const value = answers.obs;
    return Array.isArray(value) ? (value as Observation[]) : [];
}

/** Claves que guardan la respuesta de una pregunta (sin contar el campo "Otro"). */
export function questionKeys(question: Question): string[] {
    switch (question.type) {
        case 'fields':
            return question.fields.map(
                (field) => `${question.id}__${field.id}`,
            );
        case 'bymode':
            return MODES.map((mode) => `${question.id}__${mode.key}`);
        default:
            return [question.id];
    }
}

function hasValue(answers: Answers, key: string): boolean {
    const value = answers[key];
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return typeof value === 'string' && value.trim() !== '';
}

export function isAnswered(answers: Answers, question: Question): boolean {
    return questionKeys(question).some((key) => hasValue(answers, key));
}

export function sectionProgress(
    answers: Answers,
    section: Section,
): { answered: number; total: number } {
    const total = section.questions.length;
    const answered = section.questions.filter((question) =>
        isAnswered(answers, question),
    ).length;
    return { answered, total };
}

export function overallProgress(answers: Answers): {
    answered: number;
    total: number;
    percent: number;
} {
    const sections = [...SECTIONS, NOTES_SECTION];
    let answered = 0;
    let total = 0;

    for (const section of sections) {
        const progress = sectionProgress(answers, section);
        answered += progress.answered;
        total += progress.total;
    }

    for (const observation of getObservations(answers)) {
        for (const question of OBSERVATION_QUESTIONS) {
            total += 1;
            if (isAnswered(observation.answers, question)) {
                answered += 1;
            }
        }
    }

    return {
        answered,
        total,
        percent: total === 0 ? 0 : Math.round((answered / total) * 100),
    };
}

function formatQuestion(answers: Answers, question: Question): string[] {
    const lines: string[] = [];
    const other = getText(answers, `${question.id}${OTHER_SUFFIX}`);

    const describe = (value: unknown): string => {
        if (Array.isArray(value)) {
            return (value as string[]).join(', ');
        }
        return typeof value === 'string' ? value : '';
    };

    switch (question.type) {
        case 'fields': {
            const parts = question.fields
                .map((field) => {
                    const value = getText(
                        answers,
                        `${question.id}__${field.id}`,
                    );
                    return value ? `${field.label}: ${value}` : '';
                })
                .filter(Boolean);
            if (parts.length > 0) {
                lines.push(`**${question.label}** — ${parts.join(' · ')}`);
            }
            break;
        }
        case 'bymode': {
            const parts = MODES.map((mode) => {
                const value = describe(answers[`${question.id}__${mode.key}`]);
                return value ? `${mode.label}: ${value}` : '';
            }).filter(Boolean);
            if (parts.length > 0) {
                lines.push(`**${question.label}**`);
                parts.forEach((part) => lines.push(`- ${part}`));
            }
            break;
        }
        default: {
            const value = describe(answers[question.id]);
            const full = [value, other ? `Otro: ${other}` : '']
                .filter(Boolean)
                .join(' · ');
            if (full) {
                lines.push(`**${question.label}** — ${full}`);
            }
        }
    }

    return lines;
}

export interface SummarySection {
    title: string;
    lines: string[];
}

/** Secciones con lo respondido; se usa tanto para mostrar como para exportar. */
export function summarize(answers: Answers): SummarySection[] {
    const summary: SummarySection[] = [];

    for (const section of [...SECTIONS, NOTES_SECTION]) {
        const lines = section.questions.flatMap((question) =>
            formatQuestion(answers, question),
        );
        if (lines.length > 0) {
            summary.push({ title: section.title, lines });
        }
    }

    getObservations(answers).forEach((observation, index) => {
        const lines = observation.timeline
            .filter((row) => row.momento || row.material || row.quien)
            .map(
                (row) =>
                    `min ${row.min} — ${[row.momento, row.material, row.quien].filter(Boolean).join(' · ')}`,
            );

        lines.push(
            ...OBSERVATION_QUESTIONS.flatMap((question) =>
                formatQuestion(observation.answers, question),
            ),
        );

        if (lines.length > 0) {
            summary.push({
                title: `Ficha de observación — Clase ${index + 1}`,
                lines,
            });
        }
    });

    return summary;
}

/** Arma un resumen en Markdown con lo respondido, listo para copiar o descargar. */
export function buildExport(
    answers: Answers,
    title = 'Cuestionario de análisis de la academia',
): string {
    const progress = overallProgress(answers);
    const lines: string[] = [
        `# ${title}`,
        '',
        `Respondidas ${progress.answered} de ${progress.total} preguntas (${progress.percent}%).`,
        '',
    ];

    for (const section of summarize(answers)) {
        lines.push(`## ${section.title}`, '', ...section.lines, '');
    }

    return lines.join('\n');
}

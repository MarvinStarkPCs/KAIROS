/**
 * Contenido del cuestionario de análisis de la academia.
 * Se usa para renderizar el formulario y para exportar las respuestas.
 */

export const MODES = [
    { key: 'kids', label: 'Kids (4–12)' },
    { key: 'teens', label: 'Teens (13–17)' },
    { key: 'big', label: 'Big (18–30)' },
] as const;

export type Question =
    | {
          id: string;
          type: 'checks';
          label: string;
          note?: string;
          options: string[];
          other?: boolean;
      }
    | {
          id: string;
          type: 'choice';
          label: string;
          note?: string;
          options: string[];
          other?: boolean;
      }
    | {
          id: string;
          type: 'bymode';
          label: string;
          note?: string;
          options: string[];
          multiple?: boolean;
      }
    | {
          id: string;
          type: 'fields';
          label: string;
          note?: string;
          fields: { id: string; label: string }[];
      }
    | {
          id: string;
          type: 'text';
          label: string;
          note?: string;
          rows?: number;
          placeholder?: string;
      };

export interface Section {
    id: string;
    title: string;
    description: string;
    questions: Question[];
}

const SI_NO = ['Sí', 'No'];

export const SECTIONS: Section[] = [
    {
        id: 'a',
        title: 'A. Datos generales',
        description: 'Quién responde y qué instrumentos enseña.',
        questions: [
            {
                id: 'a0',
                type: 'fields',
                label: 'Quién responde',
                fields: [
                    { id: 'fecha', label: 'Fecha' },
                    { id: 'responde', label: 'Nombre' },
                    { id: 'cargo', label: 'Cargo / instrumento que enseña' },
                ],
            },
            {
                id: 'a3',
                type: 'checks',
                label: 'A1. Instrumentos o áreas que enseñas',
                options: [
                    'Piano / teclado',
                    'Guitarra',
                    'Bajo',
                    'Batería / percusión',
                    'Canto',
                    'Violín / cuerdas',
                    'Vientos',
                    'Iniciación musical',
                    'Teoría / lectura',
                    'Producción musical',
                    'Ensamble / banda',
                ],
                other: true,
            },
        ],
    },
    {
        id: 'b',
        title: 'B. Grupos y modalidades',
        description: 'Cómo se ubica y se agrupa a los alumnos.',
        questions: [
            {
                id: 'b1',
                type: 'checks',
                label: 'B1. ¿Cómo se ubica a un alumno nuevo en nivel?',
                options: [
                    'Solo por edad',
                    'Prueba / audición',
                    'Entrevista',
                    'Nivel que declara el alumno',
                    'Clase de prueba',
                ],
                other: true,
            },
            {
                id: 'b2',
                type: 'checks',
                label: 'B2. ¿Cómo se arman los grupos?',
                options: [
                    'Por edad',
                    'Por nivel',
                    'Mixtos',
                    'Casi todo es individual',
                ],
            },
        ],
    },
    {
        id: 'c',
        title: 'C. Estructura de la clase',
        description: 'Lo que ocurre dentro de la clase.',
        questions: [
            {
                id: 'c1',
                type: 'bymode',
                label: 'C1. Duración de la clase',
                options: ['30 min', '45 min', '60 min', '90 min', 'Otra'],
            },
            {
                id: 'c2',
                type: 'bymode',
                label: 'C2. Clases por semana',
                options: ['1', '2', '3 o más', 'Flexible'],
            },
            {
                id: 'c3',
                type: 'bymode',
                label: 'C3. Tipo de clase',
                options: ['Individual', 'Grupal', 'Ambas'],
            },
            {
                id: 'c4',
                type: 'checks',
                label: 'C4. Momentos que suele tener la clase',
                note: 'Marca todos los que apliquen.',
                options: [
                    'Saludo / calentamiento',
                    'Teoría',
                    'Técnica / ejercicios',
                    'Lectura de partitura',
                    'Repertorio / canciones',
                    'Juego / ritmo corporal',
                    'Tocar junto al profe',
                    'Ensamble con otros alumnos',
                    'Improvisación',
                    'Cierre / asignar tarea',
                ],
                other: true,
            },
            {
                id: 'c5',
                type: 'choice',
                label: 'C5. ¿Hay tareas o práctica para la casa?',
                options: ['Siempre', 'A veces', 'Nunca'],
            },
        ],
    },
    {
        id: 'd',
        title: 'D. Materiales',
        description: 'Qué material se usa en clase y si hay repertorio definido.',
        questions: [
            {
                id: 'd7',
                type: 'checks',
                label: 'D1. ¿Qué te gustaría tener en pantalla durante la clase?',
                note: 'Esta respuesta define el espacio de clase en Kairos.',
                options: [
                    'Partitura / acordes',
                    'Pista de acompañamiento',
                    'Metrónomo',
                    'Video de referencia',
                    'Ejercicio del día',
                    'Tareas del alumno',
                    'Progreso y logros',
                    'Notas de la clase anterior',
                    'Historial de asistencia',
                ],
                other: true,
            },
            {
                id: 'd9',
                type: 'choice',
                label: 'D2. ¿Hay repertorio definido por nivel?',
                options: ['Sí', 'Parcial', 'No'],
            },
        ],
    },
    {
        id: 'e',
        title: 'E. Planificación y uso de Kairos',
        description: 'Cómo preparas tus clases y cuándo usas la plataforma.',
        questions: [
            {
                id: 'e1',
                type: 'choice',
                label: 'E1. ¿Planificas la clase antes?',
                options: ['Sí, por escrito', 'Sí, mentalmente', 'No'],
            },
            {
                id: 'e4',
                type: 'checks',
                label: 'E2. Lo que más te molesta o te quita tiempo',
                options: [
                    'Tomar asistencia',
                    'Evaluar / calificar',
                    'Buscar o preparar material',
                    'Hablar con padres',
                    'Planificar',
                    'Reprogramar clases',
                    'Temas de pago',
                ],
                other: true,
            },
            {
                id: 'e5',
                type: 'choice',
                label: 'E3. Comodidad con la tecnología',
                note: '1 = nada, 5 = mucha.',
                options: ['1', '2', '3', '4', '5'],
            },
            {
                id: 'e6',
                type: 'choice',
                label: 'E4. ¿Cuándo usas Kairos?',
                options: [
                    'Durante la clase',
                    'Después de la clase',
                    'A fin de mes',
                    'Nunca',
                ],
            },
        ],
    },
    {
        id: 'f',
        title: 'F. Avance, niveles y logros',
        description: 'Base para el sistema de logros. Es la sección más importante.',
        questions: [
            {
                id: 'f1',
                type: 'checks',
                label: 'F1. ¿Cómo se define que un alumno pasa de nivel?',
                options: [
                    'Examen',
                    'Presentación / recital',
                    'Criterio del profe',
                    'Por tiempo (meses)',
                    'No hay niveles formales',
                ],
                other: true,
            },
            {
                id: 'f2',
                type: 'fields',
                label: 'F2. Niveles',
                fields: [
                    { id: 'cantidad', label: 'Nº de niveles por programa' },
                    { id: 'duracion', label: 'Duración aproximada de cada nivel' },
                ],
            },
            {
                id: 'f3',
                type: 'checks',
                label: 'F3. ¿Cómo se evalúa hoy?',
                options: [
                    'Nota numérica',
                    'Cualitativa (logrado / en proceso)',
                    'No se evalúa',
                ],
            },
            {
                id: 'f3b',
                type: 'choice',
                label: 'Frecuencia de la evaluación',
                options: [
                    'Cada clase',
                    'Mensual',
                    'Por módulo',
                    'Semestral',
                    'Sin frecuencia fija',
                ],
            },
            {
                id: 'f4',
                type: 'checks',
                label: 'F4. ¿Cómo se comunica el avance al alumno y al acudiente?',
                options: [
                    'De palabra',
                    'WhatsApp',
                    'Boletín impreso',
                    'Kairos',
                    'No se comunica',
                ],
            },
            {
                id: 'f5',
                type: 'checks',
                label: 'F5. Reconocimientos que existen hoy',
                options: [
                    'Stickers / sellos',
                    'Diplomas',
                    'Recitales',
                    'Mención delante del grupo',
                    'Medallas / insignias',
                    'Ninguno',
                ],
                other: true,
            },
            {
                id: 'f6',
                type: 'bymode',
                label: 'F6. ¿Qué motiva a cada grupo?',
                options: [
                    'Juegos',
                    'Canciones que les gustan',
                    'Presentarse',
                    'Premios / insignias',
                    'Ver su progreso',
                    'Reconocimiento del profe',
                    'Metas propias',
                ],
                multiple: true,
            },
            {
                id: 'f7_kids',
                type: 'text',
                label: 'F7. Logros que reconoces en clase — Kids',
                note: 'Ej.: "tocó con las dos manos", "mantuvo el pulso", "se aprendió la canción completa".',
                rows: 3,
            },
            {
                id: 'f7_teens',
                type: 'text',
                label: 'F7. Logros que reconoces — Teens',
                rows: 3,
            },
            {
                id: 'f7_big',
                type: 'text',
                label: 'F7. Logros que reconoces — Big',
                rows: 3,
            },
            {
                id: 'f8',
                type: 'choice',
                label: 'F8. ¿Quién debería otorgar un logro?',
                options: [
                    'El profesor',
                    'El sistema automáticamente',
                    'Ambos',
                    'Coordinación',
                ],
            },
            {
                id: 'f9',
                type: 'choice',
                label: 'F9. Recitales o presentaciones',
                options: ['Mensual', 'Semestral', 'Anual', 'No hay'],
            },
        ],
    },
    {
        id: 'g',
        title: 'G. El alumno fuera de clase',
        description: 'Práctica en casa y metas de los estudiantes.',
        questions: [
            {
                id: 'g1',
                type: 'choice',
                label: 'G1. ¿Cuánto practican en casa?',
                options: [
                    'A diario',
                    '2–3 veces por semana',
                    'Casi nada',
                    'No se sabe',
                ],
            },
            {
                id: 'g2',
                type: 'choice',
                label: 'G2. ¿Los acudientes de Kids participan?',
                options: [
                    'Están en la clase',
                    'Acompañan la práctica en casa',
                    'Solo llevan y recogen',
                    'No participan',
                ],
            },
            {
                id: 'g4',
                type: 'checks',
                label: 'G3. Metas de Teens y Big',
                options: [
                    'Hobby',
                    'Tocar en banda / iglesia',
                    'Entrar a universidad',
                    'Ser profesional',
                    'Grabar / producir',
                ],
                other: true,
            },
        ],
    },
    {
        id: 'i',
        title: 'I. Uso actual de Kairos',
        description: 'Qué se usa hoy y qué falta.',
        questions: [
            {
                id: 'i1',
                type: 'checks',
                label: 'I1. Módulos que usas de verdad',
                options: [
                    'Matrícula',
                    'Pagos',
                    'Horarios',
                    'Asistencia',
                    'Planes de estudio',
                    'Evaluaciones',
                    'Panel académico',
                    'Mensajes',
                    'Portal de padres',
                ],
            },
            {
                id: 'i2',
                type: 'choice',
                label: 'I2. ¿Los planes de estudio y actividades cargados reflejan lo que enseñas?',
                options: ['Sí', 'Parcialmente', 'No', 'No están cargados'],
            },
            {
                id: 'i4',
                type: 'choice',
                label: 'I3. ¿Los padres y alumnos entran a ver sus notas?',
                options: ['Sí, la mayoría', 'Pocos', 'No'],
            },
            { id: 'i4t', type: 'text', label: '¿Qué les falta o qué mejorarías?', rows: 2 },
            {
                id: 'i5',
                type: 'text',
                label: 'I4. ¿Qué te gustaría que Kairos hiciera en lo pedagógico?',
                rows: 4,
            },
        ],
    },
];

/** Notas libres del final. */
export const NOTES_SECTION: Section = {
    id: 'k',
    title: 'K. Notas libres',
    description: 'Lo que no cabe en ninguna pregunta.',
    questions: [
        {
            id: 'k2',
            type: 'text',
            label: 'K1. Cosas que te sorprendieron o que no encajan con lo que Kairos tiene hoy',
            rows: 4,
        },
        {
            id: 'k3',
            type: 'text',
            label: 'K2. Ideas que se te ocurran',
            rows: 4,
        },
    ],
};

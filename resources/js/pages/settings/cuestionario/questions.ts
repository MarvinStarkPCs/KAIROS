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
        description: 'Tamaño de la academia y quién define lo pedagógico.',
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
                id: 'a1',
                type: 'fields',
                label: 'A1. Academia',
                fields: [
                    { id: 'sedes', label: 'Nº de sedes' },
                    { id: 'profes', label: 'Nº de profesores' },
                ],
            },
            {
                id: 'a2',
                type: 'fields',
                label: 'A2. Alumnos activos aproximados por modalidad',
                fields: [
                    { id: 'kids', label: 'Kids' },
                    { id: 'teens', label: 'Teens' },
                    { id: 'big', label: 'Big' },
                ],
            },
            {
                id: 'a3',
                type: 'checks',
                label: 'A3. Instrumentos y áreas que se enseñan',
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
            {
                id: 'a5',
                type: 'checks',
                label: 'A4. Enfoque pedagógico',
                options: [
                    'No hay uno definido',
                    'Propio, escrito',
                    'Propio, no escrito',
                    'Suzuki',
                    'Orff',
                    'Kodály',
                    'Cada profe usa el suyo',
                ],
                other: true,
            },
            {
                id: 'a6',
                type: 'choice',
                label: 'A5. ¿Quién define qué se enseña en cada nivel?',
                options: [
                    'Dirección',
                    'Coordinador/a académico',
                    'Cada profesor',
                    'Se decide entre todos',
                ],
            },
        ],
    },
    {
        id: 'b',
        title: 'B. Modalidades y edades',
        description: 'Cómo se ubica y se agrupa a los alumnos.',
        questions: [
            {
                id: 'b1',
                type: 'checks',
                label: 'B1. ¿Cómo se ubica a un alumno nuevo en modalidad y nivel?',
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
            {
                id: 'b3',
                type: 'choice',
                label: 'B3. ¿Los más pequeños (4–6) tienen un tratamiento distinto de los de 7–12?',
                options: SI_NO,
            },
            {
                id: 'b3t',
                type: 'text',
                label: '¿Cuál es la diferencia?',
                rows: 2,
            },
            {
                id: 'b4t',
                type: 'text',
                label: 'B4. ¿En qué modalidad se retiran más alumnos y por qué?',
                rows: 2,
            },
        ],
    },
    {
        id: 'c',
        title: 'C. Estructura de una clase típica',
        description: 'Lo que ocurre dentro de la clase, minuto a minuto.',
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
                note: 'Marca todos los que existan.',
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
                id: 'c4t',
                type: 'text',
                label: 'Orden y minutos aproximados de cada momento',
                note: 'Ej.: calentamiento 5, técnica 15, repertorio 20, cierre 5.',
                rows: 3,
            },
            {
                id: 'c5',
                type: 'choice',
                label: 'C5. ¿Hay tareas o práctica para la casa?',
                options: ['Siempre', 'A veces', 'Nunca'],
            },
            {
                id: 'c5a',
                type: 'checks',
                label: '¿Cómo se asignan las tareas?',
                options: [
                    'De palabra',
                    'WhatsApp',
                    'Cuaderno del alumno',
                    'Kairos',
                ],
                other: true,
            },
            {
                id: 'c5b',
                type: 'choice',
                label: '¿Se revisan en la siguiente clase?',
                options: ['Sí, siempre', 'A veces', 'No'],
            },
        ],
    },
    {
        id: 'd',
        title: 'D. Materiales de trabajo',
        description: 'Qué material se usa, dónde vive y cómo llega al alumno.',
        questions: [
            {
                id: 'd1',
                type: 'checks',
                label: 'D1. Material que usa el profesor en clase',
                options: [
                    'Partituras',
                    'Tablaturas / acordes',
                    'Letras de canciones',
                    'Libro / método',
                    'Ejercicios impresos',
                    'Videos',
                    'Pistas / backing tracks',
                    'Audios',
                    'Apps',
                    'Juegos / tarjetas',
                    'Metrónomo',
                ],
                other: true,
            },
            {
                id: 'd2',
                type: 'checks',
                label: 'D2. Formato del material',
                options: [
                    'Papel',
                    'PDF',
                    'Imagen / foto',
                    'YouTube',
                    'Audio (mp3)',
                    'App',
                    'Libro físico',
                ],
            },
            {
                id: 'd3',
                type: 'checks',
                label: 'D3. De dónde sale',
                options: [
                    'Lo crea el profe',
                    'Método / libro comprado',
                    'Internet',
                    'Banco de la academia',
                ],
                other: true,
            },
            {
                id: 'd4',
                type: 'checks',
                label: 'D4. Dónde se guarda hoy',
                options: [
                    'Google Drive',
                    'WhatsApp',
                    'Celular del profe',
                    'Carpetas físicas',
                    'Kairos',
                    'En ningún lado',
                ],
                other: true,
            },
            {
                id: 'd5',
                type: 'choice',
                label: 'D5. ¿El material es el mismo para todos los profes del mismo nivel?',
                options: [
                    'Sí, estandarizado',
                    'Parcialmente',
                    'No, cada profe el suyo',
                ],
            },
            {
                id: 'd6',
                type: 'checks',
                label: 'D6. ¿Cómo le llega el material al alumno?',
                options: [
                    'Foto por WhatsApp',
                    'Fotocopia',
                    'Se lo dictan / copia',
                    'Link / video',
                    'No se lo lleva',
                ],
                other: true,
            },
            {
                id: 'd7',
                type: 'checks',
                label: 'D7. ¿Qué te gustaría tener en pantalla durante la clase?',
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
                label: 'D8. ¿Hay repertorio definido por nivel?',
                options: ['Sí', 'Parcial', 'No'],
            },
            {
                id: 'd9t',
                type: 'text',
                label: 'Ejemplos de repertorio por nivel',
                rows: 3,
            },
        ],
    },
    {
        id: 'e',
        title: 'E. Profesores y planificación',
        description: 'Cómo preparan y registran su trabajo.',
        questions: [
            {
                id: 'e1',
                type: 'choice',
                label: 'E1. ¿Planificas la clase antes?',
                options: ['Sí, por escrito', 'Sí, mentalmente', 'No'],
            },
            {
                id: 'e1b',
                type: 'checks',
                label: '¿Dónde planificas?',
                options: [
                    'Cuaderno',
                    'Plantilla de la academia',
                    'Drive / documento',
                    'Kairos',
                ],
                other: true,
            },
            {
                id: 'e2',
                type: 'choice',
                label: 'E2. ¿Llevas registro de lo trabajado con cada alumno?',
                options: SI_NO,
            },
            {
                id: 'e2b',
                type: 'checks',
                label: '¿Dónde lo registras?',
                options: ['Cuaderno', 'Celular / notas', 'Drive', 'Kairos'],
                other: true,
            },
            {
                id: 'e4',
                type: 'checks',
                label: 'E3. Lo que más te molesta o te quita tiempo',
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
                label: 'E4. Comodidad con la tecnología',
                note: '1 = nada, 5 = mucha.',
                options: ['1', '2', '3', '4', '5'],
            },
            {
                id: 'e6',
                type: 'choice',
                label: 'E5. ¿Cuándo usas Kairos?',
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
        description: 'Base para el sistema de logros.',
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
                    { id: 'duracion', label: 'Duración de cada nivel' },
                ],
            },
            {
                id: 'f3',
                type: 'checks',
                label: 'F3. Cómo se evalúa hoy',
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
                note: 'Ej.: “tocó con las dos manos”, “mantuvo el pulso”, “se aprendió la canción completa”.',
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
            {
                id: 'f10',
                type: 'choice',
                label: 'F10. ¿Se guardan videos o audios del alumno tocando?',
                options: SI_NO,
            },
            {
                id: 'f10b',
                type: 'checks',
                label: '¿Dónde se guardan?',
                options: [
                    'Celular del profe',
                    'Celular del acudiente',
                    'Drive',
                    'Redes sociales',
                ],
                other: true,
            },
        ],
    },
    {
        id: 'g',
        title: 'G. El alumno y el acudiente en casa',
        description: 'Práctica fuera de la clase.',
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
                id: 'g3',
                type: 'checks',
                label: 'G3. ¿Qué preguntan más los acudientes?',
                options: [
                    '¿Va bien?',
                    '¿Qué debe practicar?',
                    '¿Cuándo pasa de nivel?',
                    'Horarios',
                    'Pagos',
                ],
                other: true,
            },
            {
                id: 'g4',
                type: 'checks',
                label: 'G4. Metas de Teens y Big',
                options: [
                    'Hobby',
                    'Tocar en banda / iglesia',
                    'Entrar a universidad',
                    'Ser profesional',
                    'Grabar / producir',
                ],
                other: true,
            },
            {
                id: 'g5',
                type: 'choice',
                label: 'G5. ¿Tienen el instrumento en casa?',
                options: ['Todos', 'La mayoría', 'Pocos', 'Casi ninguno'],
            },
        ],
    },
    {
        id: 'h',
        title: 'H. Tecnología en el aula',
        description:
            'Condiciones reales para que el alumno entre a Kairos en clase.',
        questions: [
            {
                id: 'h1',
                type: 'checks',
                label: 'H1. Dispositivos que funcionan en el salón',
                options: [
                    'TV',
                    'PC / portátil',
                    'Tablet',
                    'Parlante',
                    'Proyector',
                    'Ninguno',
                ],
                other: true,
            },
            {
                id: 'h2',
                type: 'bymode',
                label: 'H2. Celular o tablet de los alumnos',
                options: [
                    'Llevan celular',
                    'Llevan tablet',
                    'Se permite usarlo',
                    'Prohibido',
                ],
                multiple: true,
            },
            {
                id: 'h3',
                type: 'choice',
                label: 'H3. WiFi en los salones',
                options: ['Bueno', 'Regular', 'Malo', 'No hay'],
            },
            {
                id: 'h4',
                type: 'choice',
                label: 'H4. Si el alumno de 4–8 años entrara a Kairos en clase, ¿quién manejaría el dispositivo?',
                options: [
                    'El niño',
                    'El profe',
                    'El acudiente',
                    'Pantalla compartida (TV)',
                ],
            },
            {
                id: 'h5',
                type: 'choice',
                label: 'H5. ¿Hay restricciones sobre pantallas con menores?',
                options: SI_NO,
            },
            {
                id: 'h5t',
                type: 'text',
                label: '¿Cuáles restricciones?',
                rows: 2,
            },
            {
                id: 'h6',
                type: 'choice',
                label: 'H6. ¿Tendrías un dispositivo conectado durante toda la clase?',
                options: ['Sí, propio', 'Sí, de la academia', 'A veces', 'No'],
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
            { id: 'i4t', type: 'text', label: '¿Qué les falta?', rows: 2 },
            {
                id: 'i5',
                type: 'text',
                label: 'I4. ¿Qué te gustaría que Kairos hiciera en lo pedagógico?',
                rows: 4,
            },
        ],
    },
];

/** Preguntas de cada ficha de observación de clase. */
export const OBSERVATION_QUESTIONS: Question[] = [
    {
        id: 'mod',
        type: 'choice',
        label: 'Modalidad',
        options: MODES.map((m) => m.label),
    },
    {
        id: 'datos',
        type: 'fields',
        label: 'Datos de la clase',
        fields: [
            { id: 'instrumento', label: 'Instrumento' },
            { id: 'profe', label: 'Profe' },
            { id: 'alumnos', label: 'Nº alumnos' },
            { id: 'edades', label: 'Edades' },
        ],
    },
    {
        id: 'j2',
        type: 'checks',
        label: 'J2. Cómo mostró o entregó el profe el material',
        options: [
            'Papel',
            'Su celular',
            'TV / pantalla',
            'Lo dictó',
            'Lo tocó de oído',
            'No usó material',
        ],
        other: true,
    },
    {
        id: 'j3',
        type: 'text',
        label: 'J3. Momentos en que el alumno trabajó solo vs. junto al profe',
        rows: 3,
    },
    {
        id: 'j4',
        type: 'text',
        label: 'J4. Logros que el profe reconoció',
        note: 'Qué dijo y qué había hecho el alumno.',
        rows: 3,
    },
    {
        id: 'j5',
        type: 'text',
        label: 'J5. Momentos de distracción, aburrimiento o frustración (y a qué minuto)',
        rows: 3,
    },
    {
        id: 'j6',
        type: 'text',
        label: 'J6. ¿Dónde habría ayudado que el alumno tuviera algo en pantalla? ¿Dónde habría estorbado?',
        rows: 3,
    },
    {
        id: 'j8',
        type: 'text',
        label: 'J7. Frase textual del profe al terminar',
        note: '“me habría servido tener…”',
        rows: 2,
    },
    {
        id: 'j9',
        type: 'text',
        label: 'J8. Frase textual de un alumno o acudiente a la salida',
        rows: 2,
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

export const TIMELINE_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicProgram;
use App\Models\StudyPlan;
use App\Models\Activity;
use App\Models\EvaluationCriteria;

class MusicAcademicProgramSeeder extends Seeder
{
    public function run(): void
    {
        // Programa 1: Guitarra Clásica
        $guitarraClasica = AcademicProgram::create([
            'name' => 'Guitarra Clásica',
            'description' => 'Formación integral en guitarra clásica desde nivel principiante hasta avanzado.',
            'duration_months' => 12,
            'status' => 'active',
        ]);

        // Módulo 1: Fundamentos de Guitarra
        $module1 = StudyPlan::create([
            'program_id' => $guitarraClasica->id,
            'module_name' => 'Fundamentos de Guitarra',
            'description' => 'Introducción al instrumento, postura, técnica básica y lectura musical.',
            'hours' => 40,
            'level' => 1,
        ]);

        $activity1_1 = Activity::create([
            'study_plan_id' => $module1->id,
            'name' => 'Postura y Técnica Básica',
            'description' => 'Aprendizaje de la posición correcta del cuerpo, manos y dedos.',
            'order' => 0,
            'weight' => 30,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_1->id,
            'name' => 'Postura corporal',
            'description' => 'Posición correcta del cuerpo y brazos.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_1->id,
            'name' => 'Posición de manos',
            'description' => 'Correcta colocación de dedos en diapasón y cuerdas.',
            'max_points' => 40,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_1->id,
            'name' => 'Relajación muscular',
            'description' => 'Ausencia de tensiones innecesarias.',
            'max_points' => 20,
            'order' => 2,
        ]);

        $activity1_2 = Activity::create([
            'study_plan_id' => $module1->id,
            'name' => 'Escalas y Arpegios Básicos',
            'description' => 'Ejercicios de escalas mayores y menores, arpegios simples.',
            'order' => 1,
            'weight' => 40,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_2->id,
            'name' => 'Precisión en notas',
            'description' => 'Ejecución correcta de todas las notas.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_2->id,
            'name' => 'Tempo constante',
            'description' => 'Mantener velocidad uniforme durante la ejecución.',
            'max_points' => 30,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_2->id,
            'name' => 'Limpieza de sonido',
            'description' => 'Sonido claro sin ruidos o trastes.',
            'max_points' => 30,
            'order' => 2,
        ]);

        $activity1_3 = Activity::create([
            'study_plan_id' => $module1->id,
            'name' => 'Recital - Piezas Básicas',
            'description' => 'Ejecución de 3 piezas sencillas del repertorio clásico.',
            'order' => 2,
            'weight' => 30,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_3->id,
            'name' => 'Técnica',
            'description' => 'Aplicación correcta de técnicas aprendidas.',
            'max_points' => 35,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_3->id,
            'name' => 'Musicalidad',
            'description' => 'Expresión e interpretación musical.',
            'max_points' => 35,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_3->id,
            'name' => 'Memoria',
            'description' => 'Ejecución de memoria sin partituras.',
            'max_points' => 30,
            'order' => 2,
        ]);

        // Módulo 2: Técnica Intermedia
        $module2 = StudyPlan::create([
            'program_id' => $guitarraClasica->id,
            'module_name' => 'Técnica Intermedia',
            'description' => 'Desarrollo de técnicas avanzadas: ligados, trémolo, apagados.',
            'hours' => 60,
            'level' => 2,
        ]);

        $activity2_1 = Activity::create([
            'study_plan_id' => $module2->id,
            'name' => 'Ligados Ascendentes y Descendentes',
            'description' => 'Práctica de hammer-ons y pull-offs.',
            'order' => 0,
            'weight' => 35,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_1->id,
            'name' => 'Claridad de notas',
            'description' => 'Todas las notas ligadas suenan claras.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_1->id,
            'name' => 'Velocidad y fluidez',
            'description' => 'Ejecución fluida a diferentes tempos.',
            'max_points' => 50,
            'order' => 1,
        ]);

        $activity2_2 = Activity::create([
            'study_plan_id' => $module2->id,
            'name' => 'Obras del Repertorio Clásico',
            'description' => 'Estudio de obras de compositores como Sor, Tárrega, Giuliani.',
            'order' => 1,
            'weight' => 65,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_2->id,
            'name' => 'Fidelidad a la partitura',
            'description' => 'Respeto de notas, ritmo y dinámicas.',
            'max_points' => 30,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_2->id,
            'name' => 'Técnica avanzada',
            'description' => 'Dominio de técnicas específicas requeridas.',
            'max_points' => 40,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_2->id,
            'name' => 'Interpretación artística',
            'description' => 'Expresión personal y emotiva de la obra.',
            'max_points' => 30,
            'order' => 2,
        ]);

        // Módulo 3: Repertorio Avanzado
        $module3 = StudyPlan::create([
            'program_id' => $guitarraClasica->id,
            'module_name' => 'Repertorio Avanzado y Recital',
            'description' => 'Preparación de repertorio complejo y recital público.',
            'hours' => 80,
            'level' => 3,
        ]);

        $activity3_1 = Activity::create([
            'study_plan_id' => $module3->id,
            'name' => 'Obras Virtuosas',
            'description' => 'Estudio de obras complejas: Bach, Villa-Lobos, Barrios.',
            'order' => 0,
            'weight' => 50,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_1->id,
            'name' => 'Dominio técnico',
            'description' => 'Control total de pasajes difíciles.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_1->id,
            'name' => 'Musicalidad avanzada',
            'description' => 'Interpretación madura y expresiva.',
            'max_points' => 35,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_1->id,
            'name' => 'Estilo e interpretación',
            'description' => 'Comprensión del estilo histórico de la obra.',
            'max_points' => 25,
            'order' => 2,
        ]);

        $activity3_2 = Activity::create([
            'study_plan_id' => $module3->id,
            'name' => 'Recital Final',
            'description' => 'Recital público de 30-40 minutos con programa variado.',
            'order' => 1,
            'weight' => 50,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_2->id,
            'name' => 'Preparación del programa',
            'description' => 'Selección adecuada y diversa de obras.',
            'max_points' => 20,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_2->id,
            'name' => 'Ejecución técnica',
            'description' => 'Precisión y control durante toda la presentación.',
            'max_points' => 40,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_2->id,
            'name' => 'Presencia escénica',
            'description' => 'Comunicación con el público y profesionalismo.',
            'max_points' => 20,
            'order' => 2,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_2->id,
            'name' => 'Interpretación artística',
            'description' => 'Expresión emocional y comunicativa.',
            'max_points' => 20,
            'order' => 3,
        ]);

        // Programa 2: Piano
        $piano = AcademicProgram::create([
            'name' => 'Piano',
            'description' => 'Programa completo de piano desde iniciación hasta nivel avanzado.',
            'duration_months' => 18,
            'status' => 'active',
        ]);

        // Módulo 1: Iniciación al Piano
        $module4 = StudyPlan::create([
            'program_id' => $piano->id,
            'module_name' => 'Iniciación al Piano',
            'description' => 'Fundamentos del piano: postura, técnica básica, lectura en dos claves.',
            'hours' => 50,
            'level' => 1,
        ]);

        $activity4_1 = Activity::create([
            'study_plan_id' => $module4->id,
            'name' => 'Posición y Técnica de Dedos',
            'description' => 'Curvatura de dedos, independencia digital, ejercicios de Hanon.',
            'order' => 0,
            'weight' => 30,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_1->id,
            'name' => 'Postura correcta',
            'description' => 'Altura del banco, posición del cuerpo y brazos.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_1->id,
            'name' => 'Independencia de dedos',
            'description' => 'Control individual de cada dedo.',
            'max_points' => 60,
            'order' => 1,
        ]);

        $activity4_2 = Activity::create([
            'study_plan_id' => $module4->id,
            'name' => 'Lectura Musical Bimanual',
            'description' => 'Lectura simultánea en clave de Sol y Fa.',
            'order' => 1,
            'weight' => 35,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_2->id,
            'name' => 'Precisión en lectura',
            'description' => 'Identificación correcta de notas en ambas claves.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_2->id,
            'name' => 'Coordinación bimanual',
            'description' => 'Sincronización entre manos.',
            'max_points' => 50,
            'order' => 1,
        ]);

        $activity4_3 = Activity::create([
            'study_plan_id' => $module4->id,
            'name' => 'Piezas del Método Beyer',
            'description' => 'Ejecución de primeras piezas didácticas.',
            'order' => 2,
            'weight' => 35,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_3->id,
            'name' => 'Precisión rítmica',
            'description' => 'Mantener el tempo correcto.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_3->id,
            'name' => 'Dinámica y fraseo',
            'description' => 'Aplicación de matices básicos.',
            'max_points' => 35,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_3->id,
            'name' => 'Fluidez',
            'description' => 'Ejecución sin interrupciones.',
            'max_points' => 25,
            'order' => 2,
        ]);

        // Módulo 2: Piano Intermedio
        $module5 = StudyPlan::create([
            'program_id' => $piano->id,
            'module_name' => 'Piano Intermedio',
            'description' => 'Desarrollo técnico: escalas, arpegios, obras de Mozart, Beethoven.',
            'hours' => 70,
            'level' => 2,
        ]);

        $activity5_1 = Activity::create([
            'study_plan_id' => $module5->id,
            'name' => 'Escalas y Arpegios en Todas las Tonalidades',
            'description' => 'Dominio de escalas mayores, menores y arpegios.',
            'order' => 0,
            'weight' => 40,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity5_1->id,
            'name' => 'Exactitud',
            'description' => 'Todas las notas correctas en todas las tonalidades.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity5_1->id,
            'name' => 'Velocidad',
            'description' => 'Ejecución fluida a tempo rápido.',
            'max_points' => 30,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity5_1->id,
            'name' => 'Igualdad de dedos',
            'description' => 'Volumen uniforme entre todos los dedos.',
            'max_points' => 20,
            'order' => 2,
        ]);

        $activity5_2 = Activity::create([
            'study_plan_id' => $module5->id,
            'name' => 'Sonatinas Clásicas',
            'description' => 'Estudio de sonatinas de Clementi, Kuhlau, Mozart.',
            'order' => 1,
            'weight' => 60,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity5_2->id,
            'name' => 'Comprensión formal',
            'description' => 'Entendimiento de la estructura de la sonatina.',
            'max_points' => 25,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity5_2->id,
            'name' => 'Técnica pianística',
            'description' => 'Control de pasajes escalísticos y saltos.',
            'max_points' => 40,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity5_2->id,
            'name' => 'Estilo clásico',
            'description' => 'Interpretación apropiada del estilo clásico.',
            'max_points' => 35,
            'order' => 2,
        ]);

        // Programa 3: Canto
        $canto = AcademicProgram::create([
            'name' => 'Canto Lírico',
            'description' => 'Formación vocal completa: técnica, repertorio, interpretación.',
            'duration_months' => 12,
            'status' => 'active',
        ]);

        // Módulo 1: Técnica Vocal
        $module6 = StudyPlan::create([
            'program_id' => $canto->id,
            'module_name' => 'Técnica Vocal Básica',
            'description' => 'Respiración, apoyo, emisión, resonancia y vocalización.',
            'hours' => 40,
            'level' => 1,
        ]);

        $activity6_1 = Activity::create([
            'study_plan_id' => $module6->id,
            'name' => 'Respiración y Apoyo Diafragmático',
            'description' => 'Técnica de respiración costo-diafragmática.',
            'order' => 0,
            'weight' => 40,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity6_1->id,
            'name' => 'Técnica respiratoria',
            'description' => 'Uso correcto del diafragma.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity6_1->id,
            'name' => 'Control del aire',
            'description' => 'Manejo eficiente de la columna de aire.',
            'max_points' => 50,
            'order' => 1,
        ]);

        $activity6_2 = Activity::create([
            'study_plan_id' => $module6->id,
            'name' => 'Vocalización y Extensión de Registro',
            'description' => 'Ejercicios para ampliar el rango vocal.',
            'order' => 1,
            'weight' => 35,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity6_2->id,
            'name' => 'Afinación',
            'description' => 'Precisión en la entonación.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity6_2->id,
            'name' => 'Homogeneidad',
            'description' => 'Uniformidad de timbre en todos los registros.',
            'max_points' => 35,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity6_2->id,
            'name' => 'Flexibilidad vocal',
            'description' => 'Agilidad en pasajes melódicos.',
            'max_points' => 25,
            'order' => 2,
        ]);

        $activity6_3 = Activity::create([
            'study_plan_id' => $module6->id,
            'name' => 'Canciones Sencillas',
            'description' => 'Repertorio básico: canciones italianas antiguas.',
            'order' => 2,
            'weight' => 25,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity6_3->id,
            'name' => 'Dicción',
            'description' => 'Claridad en la pronunciación del texto.',
            'max_points' => 30,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity6_3->id,
            'name' => 'Técnica aplicada',
            'description' => 'Aplicación de técnica vocal en el repertorio.',
            'max_points' => 40,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity6_3->id,
            'name' => 'Expresión musical',
            'description' => 'Comunicación del sentimiento de la canción.',
            'max_points' => 30,
            'order' => 2,
        ]);

        // Programa 4: Producción Musical
        $produccion = AcademicProgram::create([
            'name' => 'Producción Musical Digital',
            'description' => 'Formación completa en producción musical con software DAW.',
            'duration_months' => 8,
            'status' => 'active',
        ]);

        // Módulo 1: Fundamentos de Audio Digital
        $module7 = StudyPlan::create([
            'program_id' => $produccion->id,
            'module_name' => 'Fundamentos de Audio Digital',
            'description' => 'Conceptos básicos: frecuencia, amplitud, DAW, MIDI.',
            'hours' => 30,
            'level' => 1,
        ]);

        $activity7_1 = Activity::create([
            'study_plan_id' => $module7->id,
            'name' => 'Introducción a Ableton/Logic/FL Studio',
            'description' => 'Navegación y configuración del DAW elegido.',
            'order' => 0,
            'weight' => 30,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity7_1->id,
            'name' => 'Configuración de proyecto',
            'description' => 'Setup correcto de audio y MIDI.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity7_1->id,
            'name' => 'Flujo de trabajo',
            'description' => 'Eficiencia en el uso del software.',
            'max_points' => 50,
            'order' => 1,
        ]);

        $activity7_2 = Activity::create([
            'study_plan_id' => $module7->id,
            'name' => 'Grabación y Edición de Audio',
            'description' => 'Técnicas de grabación y edición básica.',
            'order' => 1,
            'weight' => 40,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity7_2->id,
            'name' => 'Calidad de grabación',
            'description' => 'Audio limpio sin ruido.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity7_2->id,
            'name' => 'Edición precisa',
            'description' => 'Timing y correcciones adecuadas.',
            'max_points' => 50,
            'order' => 1,
        ]);

        $activity7_3 = Activity::create([
            'study_plan_id' => $module7->id,
            'name' => 'Primer Beat/Track',
            'description' => 'Creación de primera producción completa.',
            'order' => 2,
            'weight' => 30,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity7_3->id,
            'name' => 'Estructura musical',
            'description' => 'Organización clara de secciones.',
            'max_points' => 35,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity7_3->id,
            'name' => 'Creatividad',
            'description' => 'Originalidad en la propuesta.',
            'max_points' => 35,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity7_3->id,
            'name' => 'Calidad técnica',
            'description' => 'Balance y mezcla básica.',
            'max_points' => 30,
            'order' => 2,
        ]);

        // Módulo 2: Mezcla y Masterización
        $module8 = StudyPlan::create([
            'program_id' => $produccion->id,
            'module_name' => 'Mezcla y Masterización',
            'description' => 'Técnicas profesionales de mixing y mastering.',
            'hours' => 50,
            'level' => 2,
        ]);

        $activity8_1 = Activity::create([
            'study_plan_id' => $module8->id,
            'name' => 'Mezcla Profesional',
            'description' => 'EQ, compresión, reverb, delay y automatización.',
            'order' => 0,
            'weight' => 60,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity8_1->id,
            'name' => 'Balance de niveles',
            'description' => 'Correcta proporción entre elementos.',
            'max_points' => 30,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity8_1->id,
            'name' => 'Procesamiento',
            'description' => 'Uso adecuado de plugins y efectos.',
            'max_points' => 35,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity8_1->id,
            'name' => 'Claridad y espacialidad',
            'description' => 'Mezcla clara con buen panorama estéreo.',
            'max_points' => 35,
            'order' => 2,
        ]);

        $activity8_2 = Activity::create([
            'study_plan_id' => $module8->id,
            'name' => 'Masterización',
            'description' => 'Proceso final para distribuir música.',
            'order' => 1,
            'weight' => 40,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity8_2->id,
            'name' => 'Loudness apropiado',
            'description' => 'Nivel adecuado según estándar LUFS.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity8_2->id,
            'name' => 'Balance espectral',
            'description' => 'Frecuencias equilibradas.',
            'max_points' => 35,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity8_2->id,
            'name' => 'Competitividad comercial',
            'description' => 'Suena profesional comparado con referencias.',
            'max_points' => 25,
            'order' => 2,
        ]);

        // Programa 5: Teoría Musical
        $teoria = AcademicProgram::create([
            'name' => 'Teoría Musical y Armonía',
            'description' => 'Fundamentos teóricos de la música: solfeo, armonía, análisis.',
            'duration_months' => 6,
            'status' => 'active',
        ]);

        // Módulo 1: Solfeo y Lectura
        $module9 = StudyPlan::create([
            'program_id' => $teoria->id,
            'module_name' => 'Solfeo y Lectura Musical',
            'description' => 'Lectura fluida en claves, ritmos y entonación.',
            'hours' => 40,
            'level' => 1,
        ]);

        $activity9_1 = Activity::create([
            'study_plan_id' => $module9->id,
            'name' => 'Lectura en Claves',
            'description' => 'Dominio de clave de Sol, Fa y Do.',
            'order' => 0,
            'weight' => 35,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity9_1->id,
            'name' => 'Velocidad de lectura',
            'description' => 'Lectura fluida a primera vista.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity9_1->id,
            'name' => 'Precisión',
            'description' => 'Identificación correcta de todas las notas.',
            'max_points' => 50,
            'order' => 1,
        ]);

        $activity9_2 = Activity::create([
            'study_plan_id' => $module9->id,
            'name' => 'Entonación y Solfeo',
            'description' => 'Solfeo cantado con afinación correcta.',
            'order' => 1,
            'weight' => 35,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity9_2->id,
            'name' => 'Afinación',
            'description' => 'Entonación precisa de intervalos.',
            'max_points' => 60,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity9_2->id,
            'name' => 'Ritmo',
            'description' => 'Precisión rítmica al cantar.',
            'max_points' => 40,
            'order' => 1,
        ]);

        $activity9_3 = Activity::create([
            'study_plan_id' => $module9->id,
            'name' => 'Dictado Musical',
            'description' => 'Transcripción auditiva de melodías y ritmos.',
            'order' => 2,
            'weight' => 30,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity9_3->id,
            'name' => 'Dictado melódico',
            'description' => 'Identificación correcta de notas.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity9_3->id,
            'name' => 'Dictado rítmico',
            'description' => 'Transcripción precisa de ritmos.',
            'max_points' => 50,
            'order' => 1,
        ]);

        // Programa inactivo
        $violin = AcademicProgram::create([
            'name' => 'Violín',
            'description' => 'Programa de violín clásico (temporalmente suspendido).',
            'duration_months' => 12,
            'status' => 'inactive',
        ]);

        $this->command->info('Music Academic Programs seeded successfully!');
    }
}

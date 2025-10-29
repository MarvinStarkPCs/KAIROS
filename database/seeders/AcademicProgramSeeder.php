<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicProgram;
use App\Models\StudyPlan;
use App\Models\Activity;
use App\Models\EvaluationCriteria;

class AcademicProgramSeeder extends Seeder
{
    public function run(): void
    {
        // Programa 1: Desarrollo Web Full Stack
        $program1 = AcademicProgram::create([
            'name' => 'Desarrollo Web Full Stack',
            'description' => 'Programa completo para formar desarrolladores web con habilidades en frontend y backend.',
            'duration_months' => 6,
            'status' => 'active',
        ]);

        // Módulo 1: Fundamentos de Programación
        $module1 = StudyPlan::create([
            'program_id' => $program1->id,
            'module_name' => 'Fundamentos de Programación',
            'description' => 'Introducción a los conceptos básicos de programación y lógica.',
            'hours' => 60,
            'level' => 1,
        ]);

        $activity1_1 = Activity::create([
            'study_plan_id' => $module1->id,
            'name' => 'Variables y Tipos de Datos',
            'description' => 'Ejercicios prácticos sobre declaración y uso de variables.',
            'order' => 0,
            'weight' => 20,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_1->id,
            'name' => 'Sintaxis correcta',
            'description' => 'Uso correcto de la sintaxis del lenguaje.',
            'max_points' => 30,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_1->id,
            'name' => 'Lógica de programación',
            'description' => 'Aplicación correcta de conceptos lógicos.',
            'max_points' => 40,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_1->id,
            'name' => 'Código limpio',
            'description' => 'Código legible y bien organizado.',
            'max_points' => 30,
            'order' => 2,
        ]);

        $activity1_2 = Activity::create([
            'study_plan_id' => $module1->id,
            'name' => 'Estructuras de Control',
            'description' => 'Implementación de condicionales y bucles.',
            'order' => 1,
            'weight' => 30,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_2->id,
            'name' => 'Uso de condicionales',
            'description' => 'Implementación correcta de if, else, switch.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_2->id,
            'name' => 'Uso de bucles',
            'description' => 'Implementación correcta de for, while, do-while.',
            'max_points' => 40,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_2->id,
            'name' => 'Optimización',
            'description' => 'Código eficiente y sin redundancias.',
            'max_points' => 20,
            'order' => 2,
        ]);

        $activity1_3 = Activity::create([
            'study_plan_id' => $module1->id,
            'name' => 'Proyecto Final - Calculadora',
            'description' => 'Desarrollo de una calculadora con operaciones básicas.',
            'order' => 2,
            'weight' => 50,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_3->id,
            'name' => 'Funcionalidad completa',
            'description' => 'Todas las operaciones funcionan correctamente.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_3->id,
            'name' => 'Manejo de errores',
            'description' => 'Validación de entradas y manejo de excepciones.',
            'max_points' => 30,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity1_3->id,
            'name' => 'Presentación',
            'description' => 'Interfaz clara y código documentado.',
            'max_points' => 20,
            'order' => 2,
        ]);

        // Módulo 2: Frontend con React
        $module2 = StudyPlan::create([
            'program_id' => $program1->id,
            'module_name' => 'Frontend con React',
            'description' => 'Desarrollo de interfaces de usuario modernas con React.',
            'hours' => 80,
            'level' => 2,
        ]);

        $activity2_1 = Activity::create([
            'study_plan_id' => $module2->id,
            'name' => 'Componentes y Props',
            'description' => 'Creación de componentes reutilizables.',
            'order' => 0,
            'weight' => 25,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_1->id,
            'name' => 'Componentización',
            'description' => 'Diseño de componentes modulares y reutilizables.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_1->id,
            'name' => 'Uso de Props',
            'description' => 'Paso correcto de datos entre componentes.',
            'max_points' => 50,
            'order' => 1,
        ]);

        $activity2_2 = Activity::create([
            'study_plan_id' => $module2->id,
            'name' => 'Hooks y Estado',
            'description' => 'Manejo de estado con useState y useEffect.',
            'order' => 1,
            'weight' => 25,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_2->id,
            'name' => 'Gestión de estado',
            'description' => 'Uso correcto de useState.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_2->id,
            'name' => 'Efectos secundarios',
            'description' => 'Implementación correcta de useEffect.',
            'max_points' => 40,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_2->id,
            'name' => 'Performance',
            'description' => 'Optimización y evitar re-renders innecesarios.',
            'max_points' => 20,
            'order' => 2,
        ]);

        $activity2_3 = Activity::create([
            'study_plan_id' => $module2->id,
            'name' => 'Proyecto - Aplicación de Tareas',
            'description' => 'Desarrollo de una aplicación CRUD de tareas.',
            'order' => 2,
            'weight' => 50,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_3->id,
            'name' => 'CRUD completo',
            'description' => 'Crear, leer, actualizar y eliminar tareas.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_3->id,
            'name' => 'Diseño UI/UX',
            'description' => 'Interfaz atractiva y fácil de usar.',
            'max_points' => 30,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity2_3->id,
            'name' => 'Código limpio',
            'description' => 'Organización y buenas prácticas.',
            'max_points' => 30,
            'order' => 2,
        ]);

        // Módulo 3: Backend con Laravel
        $module3 = StudyPlan::create([
            'program_id' => $program1->id,
            'module_name' => 'Backend con Laravel',
            'description' => 'Desarrollo de APIs RESTful con Laravel.',
            'hours' => 90,
            'level' => 3,
        ]);

        $activity3_1 = Activity::create([
            'study_plan_id' => $module3->id,
            'name' => 'Rutas y Controladores',
            'description' => 'Creación de rutas y controladores para API.',
            'order' => 0,
            'weight' => 20,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_1->id,
            'name' => 'Estructura RESTful',
            'description' => 'Rutas siguiendo convenciones REST.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_1->id,
            'name' => 'Controladores organizados',
            'description' => 'Lógica bien estructurada en controladores.',
            'max_points' => 50,
            'order' => 1,
        ]);

        $activity3_2 = Activity::create([
            'study_plan_id' => $module3->id,
            'name' => 'Eloquent ORM y Migraciones',
            'description' => 'Modelado de base de datos con Eloquent.',
            'order' => 1,
            'weight' => 30,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_2->id,
            'name' => 'Diseño de base de datos',
            'description' => 'Estructura de tablas y relaciones.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_2->id,
            'name' => 'Modelos y relaciones',
            'description' => 'Definición correcta de modelos Eloquent.',
            'max_points' => 40,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_2->id,
            'name' => 'Seeders y factories',
            'description' => 'Datos de prueba bien estructurados.',
            'max_points' => 20,
            'order' => 2,
        ]);

        $activity3_3 = Activity::create([
            'study_plan_id' => $module3->id,
            'name' => 'Proyecto Final - API REST',
            'description' => 'Desarrollo de una API completa con autenticación.',
            'order' => 2,
            'weight' => 50,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_3->id,
            'name' => 'Funcionalidad completa',
            'description' => 'Todos los endpoints funcionan correctamente.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_3->id,
            'name' => 'Seguridad',
            'description' => 'Autenticación, autorización y validación.',
            'max_points' => 35,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity3_3->id,
            'name' => 'Documentación',
            'description' => 'Documentación clara de la API.',
            'max_points' => 25,
            'order' => 2,
        ]);

        // Programa 2: Diseño Gráfico Digital
        $program2 = AcademicProgram::create([
            'name' => 'Diseño Gráfico Digital',
            'description' => 'Formación integral en diseño gráfico, branding y medios digitales.',
            'duration_months' => 4,
            'status' => 'active',
        ]);

        // Módulo 1: Fundamentos del Diseño
        $module4 = StudyPlan::create([
            'program_id' => $program2->id,
            'module_name' => 'Fundamentos del Diseño',
            'description' => 'Teoría del color, composición y principios básicos del diseño.',
            'hours' => 50,
            'level' => 1,
        ]);

        $activity4_1 = Activity::create([
            'study_plan_id' => $module4->id,
            'name' => 'Teoría del Color',
            'description' => 'Estudio de psicología del color y paletas cromáticas.',
            'order' => 0,
            'weight' => 30,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_1->id,
            'name' => 'Conocimiento teórico',
            'description' => 'Comprensión de conceptos de color.',
            'max_points' => 40,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_1->id,
            'name' => 'Aplicación práctica',
            'description' => 'Creación de paletas armónicas.',
            'max_points' => 60,
            'order' => 1,
        ]);

        $activity4_2 = Activity::create([
            'study_plan_id' => $module4->id,
            'name' => 'Composición y Layout',
            'description' => 'Principios de composición visual y jerarquía.',
            'order' => 1,
            'weight' => 30,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_2->id,
            'name' => 'Balance y proporción',
            'description' => 'Equilibrio visual en composiciones.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_2->id,
            'name' => 'Jerarquía visual',
            'description' => 'Guía efectiva de la atención del usuario.',
            'max_points' => 50,
            'order' => 1,
        ]);

        $activity4_3 = Activity::create([
            'study_plan_id' => $module4->id,
            'name' => 'Proyecto - Poster',
            'description' => 'Diseño de un poster aplicando principios aprendidos.',
            'order' => 2,
            'weight' => 40,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_3->id,
            'name' => 'Creatividad',
            'description' => 'Originalidad y propuesta visual.',
            'max_points' => 35,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_3->id,
            'name' => 'Técnica',
            'description' => 'Aplicación de principios de diseño.',
            'max_points' => 40,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity4_3->id,
            'name' => 'Presentación',
            'description' => 'Calidad de ejecución final.',
            'max_points' => 25,
            'order' => 2,
        ]);

        // Programa 3: Marketing Digital
        $program3 = AcademicProgram::create([
            'name' => 'Marketing Digital',
            'description' => 'Estrategias de marketing en medios digitales y redes sociales.',
            'duration_months' => 3,
            'status' => 'active',
        ]);

        // Módulo 1: Introducción al Marketing Digital
        $module5 = StudyPlan::create([
            'program_id' => $program3->id,
            'module_name' => 'Introducción al Marketing Digital',
            'description' => 'Conceptos básicos de marketing digital y estrategia.',
            'hours' => 40,
            'level' => 1,
        ]);

        $activity5_1 = Activity::create([
            'study_plan_id' => $module5->id,
            'name' => 'Análisis de Mercado',
            'description' => 'Investigación de público objetivo y competencia.',
            'order' => 0,
            'weight' => 40,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity5_1->id,
            'name' => 'Investigación',
            'description' => 'Profundidad del análisis de mercado.',
            'max_points' => 50,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity5_1->id,
            'name' => 'Presentación de datos',
            'description' => 'Claridad en la presentación de hallazgos.',
            'max_points' => 50,
            'order' => 1,
        ]);

        $activity5_2 = Activity::create([
            'study_plan_id' => $module5->id,
            'name' => 'Estrategia Digital',
            'description' => 'Desarrollo de una estrategia de marketing digital.',
            'order' => 1,
            'weight' => 60,
            'status' => 'active',
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity5_2->id,
            'name' => 'Objetivos claros',
            'description' => 'Definición de objetivos SMART.',
            'max_points' => 30,
            'order' => 0,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity5_2->id,
            'name' => 'Tácticas apropiadas',
            'description' => 'Selección de canales y tácticas efectivas.',
            'max_points' => 40,
            'order' => 1,
        ]);

        EvaluationCriteria::create([
            'activity_id' => $activity5_2->id,
            'name' => 'Métricas de éxito',
            'description' => 'KPIs relevantes y medibles.',
            'max_points' => 30,
            'order' => 2,
        ]);

        // Programa inactivo para demostración
        $program4 = AcademicProgram::create([
            'name' => 'Programación Python Básico',
            'description' => 'Curso introductorio de Python (programa pausado temporalmente).',
            'duration_months' => 2,
            'status' => 'inactive',
        ]);

        $this->command->info('Academic Programs seeded successfully!');
    }
}

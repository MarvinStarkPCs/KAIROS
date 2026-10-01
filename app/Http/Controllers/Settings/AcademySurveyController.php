<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AcademicProgram;
use App\Models\AcademySurvey;
use App\Models\StudyPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AcademySurveyController extends Controller
{
    /**
     * Cada profesor o administrador responde su propio cuestionario.
     */
    public function edit(Request $request)
    {
        $this->authorizeParticipant($request);

        $survey = AcademySurvey::firstWhere('user_id', $request->user()->id);

        return Inertia::render('settings/cuestionario', [
            'answers' => $survey?->answers ?? (object) [],
            'prefill' => $this->prefill($request->user()),
            'updatedAt' => $survey?->updated_at?->toIso8601String(),
        ]);
    }

    public function update(Request $request)
    {
        $this->authorizeParticipant($request);

        $validated = $request->validate([
            'answers' => ['present', 'array'],
        ], [
            'answers.present' => 'No se recibieron las respuestas',
            'answers.array' => 'El formato de las respuestas no es válido',
        ]);

        // Tope de tamaño: el cuestionario completo pesa unos pocos KB.
        if (strlen(json_encode($validated['answers'])) > 512 * 1024) {
            return back()->withErrors(['answers' => 'Las respuestas son demasiado largas']);
        }

        AcademySurvey::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['answers' => $validated['answers']],
        );

        // El autoguardado no muestra notificación para no interrumpir mientras se llena.
        if (! $request->boolean('silent')) {
            flash_success('Respuestas guardadas correctamente');
        }

        return back();
    }

    /**
     * Resultados de todos los participantes. Solo para la cuenta configurada en
     * config/survey.php (Admin Dev).
     */
    public function results(Request $request)
    {
        abort_unless($request->user()->email === config('survey.results_email'), 403);

        $surveys = AcademySurvey::with('user:id,name,last_name,email')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (AcademySurvey $survey) => [
                'id' => $survey->id,
                'name' => trim($survey->user?->name.' '.$survey->user?->last_name) ?: 'Sin nombre',
                'email' => $survey->user?->email,
                'roles' => $survey->user?->getRoleNames()->toArray() ?? [],
                'answers' => $survey->answers ?? (object) [],
                'updatedAt' => $survey->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('settings/cuestionario-resultados', [
            'surveys' => $surveys,
        ]);
    }

    /**
     * El cuestionario lo responden los roles indicados en config/survey.php.
     */
    private function authorizeParticipant(Request $request): void
    {
        abort_unless($request->user()->hasAnyRole(config('survey.roles')), 403);
    }

    /**
     * Respuestas sugeridas a partir de lo que Kairos ya sabe. Solo se usan para las
     * preguntas que el usuario todavía no ha respondido, y él puede corregirlas.
     */
    private function prefill(User $user): array
    {
        $cargo = array_filter([
            $user->getRoleNames()->first(),
            $user->teacherProfile?->instruments_played,
        ]);

        $prefill = [
            'a0__fecha' => Carbon::now()->format('Y-m-d'),
            'a0__responde' => trim($user->name.' '.$user->last_name),
            'a0__cargo' => implode(' · ', $cargo),
            'a1__profes' => (string) User::role('Profesor')->count(),
            'a3' => $this->programInstruments(),
        ];

        foreach ($this->activeStudentsByModality() as $key => $total) {
            $prefill["a2__{$key}"] = (string) $total;
        }

        foreach ($this->classLengthByModality() as $key => $label) {
            $prefill["c1__{$key}"] = $label;
        }

        if ($levels = StudyPlan::max('level')) {
            $prefill['f2__cantidad'] = (string) $levels;
        }

        return array_filter($prefill, fn ($value) => $value !== '' && $value !== []);
    }

    /** Modalidades del perfil del estudiante mapeadas a las claves del cuestionario. */
    private const MODALITIES = [
        'Linaje Kids' => 'kids',
        'Linaje Teens' => 'teens',
        'Linaje Big' => 'big',
    ];

    /** Alumnos con matrícula activa, contados por modalidad. */
    private function activeStudentsByModality(): array
    {
        $rows = DB::table('student_profiles')
            ->join('enrollments', 'enrollments.student_id', '=', 'student_profiles.user_id')
            ->where('enrollments.status', 'active')
            ->whereNotNull('student_profiles.modality')
            ->selectRaw('student_profiles.modality, COUNT(DISTINCT student_profiles.user_id) as total')
            ->groupBy('student_profiles.modality')
            ->pluck('total', 'modality');

        $counts = [];
        foreach (self::MODALITIES as $modality => $key) {
            if ($rows->has($modality)) {
                $counts[$key] = (int) $rows[$modality];
            }
        }

        return $counts;
    }

    /** Duración de clase más frecuente en cada modalidad, según los horarios. */
    private function classLengthByModality(): array
    {
        $rows = DB::table('schedule_enrollments')
            ->join('schedules', 'schedules.id', '=', 'schedule_enrollments.schedule_id')
            ->join('student_profiles', 'student_profiles.user_id', '=', 'schedule_enrollments.student_id')
            ->whereNotNull('student_profiles.modality')
            ->select('student_profiles.modality', 'schedules.start_time', 'schedules.end_time')
            ->get();

        $tally = [];
        foreach ($rows as $row) {
            $key = self::MODALITIES[$row->modality] ?? null;
            if (! $key || ! $row->start_time || ! $row->end_time) {
                continue;
            }

            $minutes = Carbon::parse($row->start_time)->diffInMinutes(Carbon::parse($row->end_time));
            $label = match (true) {
                $minutes <= 35 => '30 min',
                $minutes <= 50 => '45 min',
                $minutes <= 70 => '60 min',
                $minutes <= 100 => '90 min',
                default => 'Otra',
            };

            $tally[$key][$label] = ($tally[$key][$label] ?? 0) + 1;
        }

        return array_map(fn (array $labels) => array_key_first(
            collect($labels)->sortDesc()->all()
        ), $tally);
    }

    /** Instrumentos y áreas deducidos de los programas académicos. */
    private function programInstruments(): array
    {
        $keywords = [
            'Piano / teclado' => ['piano', 'teclado'],
            'Guitarra' => ['guitarra'],
            'Bajo' => ['bajo'],
            'Batería / percusión' => ['bater', 'percus', 'tambor'],
            'Canto' => ['canto', 'vocal', 'coro'],
            'Violín / cuerdas' => ['viol', 'cuerda', 'cello', 'chelo'],
            'Vientos' => ['viento', 'flauta', 'saxo', 'trompeta', 'clarinete'],
            'Iniciación musical' => ['inicia'],
            'Teoría / lectura' => ['teor', 'armon', 'lectura', 'solfeo'],
            'Producción musical' => ['produc'],
            'Ensamble / banda' => ['ensamble', 'banda'],
        ];

        $names = AcademicProgram::pluck('name')
            ->map(fn (string $name) => mb_strtolower($name))
            ->all();

        $found = [];
        foreach ($keywords as $option => $terms) {
            foreach ($names as $name) {
                foreach ($terms as $term) {
                    if (str_contains($name, $term)) {
                        $found[] = $option;

                        continue 3;
                    }
                }
            }
        }

        return $found;
    }
}

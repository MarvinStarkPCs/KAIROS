<?php

namespace App\Support;

use App\Models\AcademicProgram;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Programas activos (regulares y demo) que se publican como páginas propias en /clases/{slug}.
 * Si un instrumento tiene programa regular y demo, queda una sola página con los datos del regular;
 * los que solo existen como demo (p. ej. guitarra eléctrica) también tienen su página.
 * Una página por instrumento le da a Google una URL para cada búsqueda ("clases de piano en Ocaña"...).
 */
class PublicPrograms
{
    private const DAYS = [
        'lunes' => 'Lunes', 'martes' => 'Martes', 'miercoles' => 'Miércoles', 'miércoles' => 'Miércoles',
        'jueves' => 'Jueves', 'viernes' => 'Viernes', 'sabado' => 'Sábado', 'sábado' => 'Sábado', 'domingo' => 'Domingo',
    ];

    /** @return array<int, array{id: int, slug: string, label: string, name: string, description: ?string, is_demo: bool, icon: ?string, color: ?string, schedules: array<int, array{days: string, time: string}>}> */
    public static function all(): array
    {
        return Cache::remember('public.programs', now()->addMinutes(5), function () {
            return AcademicProgram::active()
                ->with(['schedules' => fn ($q) => $q->where('status', 'active')->select('id', 'academic_program_id', 'days_of_week', 'start_time', 'end_time')])
                ->orderBy('is_demo')
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'icon', 'color', 'is_demo'])
                ->unique('name')
                ->map(fn (AcademicProgram $p) => [
                    'id' => $p->id,
                    'slug' => Str::slug(self::label($p->name)),
                    'label' => self::label($p->name),
                    'name' => $p->name,
                    'description' => $p->description ? trim(preg_replace('/[ \t]+/', ' ', $p->description)) : null,
                    'is_demo' => (bool) $p->is_demo,
                    'icon' => $p->icon,
                    'color' => $p->color,
                    'schedules' => $p->schedules->map(fn ($s) => [
                        'days' => collect(explode(',', $s->days_of_week))
                            ->map(fn ($d) => self::DAYS[Str::lower(trim($d))] ?? Str::ucfirst(trim($d)))
                            ->implode(', '),
                        'time' => substr($s->start_time, 0, 5).' - '.substr($s->end_time, 0, 5),
                    ])->unique()->values()->all(),
                ])
                // Los regulares van primero, así que ganan cuando hay demo del mismo instrumento.
                ->unique('slug')
                ->sortBy('label')
                ->values()
                ->all();
        });
    }

    public static function find(string $slug): ?array
    {
        return collect(self::all())->firstWhere('slug', $slug);
    }

    /** "Programa de Bateria" / "Demo Bateria" → "Batería": el nombre que la gente busca, sin el prefijo administrativo. */
    public static function label(string $name): string
    {
        $label = trim(preg_replace('/^(programa|demo)\s+(de\s+)?/iu', '', trim($name)));

        return strtr(Str::ucfirst($label), ['Bateria' => 'Batería', 'Violin' => 'Violín', 'Electrica' => 'Eléctrica']);
    }
}

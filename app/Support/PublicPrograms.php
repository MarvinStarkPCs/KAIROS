<?php

namespace App\Support;

use App\Models\AcademicProgram;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Programas regulares que se publican como páginas propias en /clases/{slug}.
 * Una página por instrumento le da a Google una URL para cada búsqueda
 * ("clases de piano en Ocaña", "clases de canto en Ocaña"...).
 */
class PublicPrograms
{
    private const DAYS = [
        'lunes' => 'Lunes', 'martes' => 'Martes', 'miercoles' => 'Miércoles', 'miércoles' => 'Miércoles',
        'jueves' => 'Jueves', 'viernes' => 'Viernes', 'sabado' => 'Sábado', 'sábado' => 'Sábado', 'domingo' => 'Domingo',
    ];

    /** @return array<int, array{id: int, slug: string, label: string, name: string, description: ?string, monthly_fee: float, icon: ?string, color: ?string, schedules: array<int, array{days: string, time: string}>}> */
    public static function all(): array
    {
        return Cache::remember('public.programs', now()->addMinutes(5), function () {
            return AcademicProgram::public()
                ->with(['schedules' => fn ($q) => $q->where('status', 'active')->select('id', 'academic_program_id', 'days_of_week', 'start_time', 'end_time')])
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'monthly_fee', 'icon', 'color'])
                ->unique('name')
                ->map(fn (AcademicProgram $p) => [
                    'id' => $p->id,
                    'slug' => Str::slug(self::label($p->name)),
                    'label' => self::label($p->name),
                    'name' => $p->name,
                    'description' => $p->description ? trim(preg_replace('/[ \t]+/', ' ', $p->description)) : null,
                    'monthly_fee' => (float) $p->monthly_fee,
                    'icon' => $p->icon,
                    'color' => $p->color,
                    'schedules' => $p->schedules->map(fn ($s) => [
                        'days' => collect(explode(',', $s->days_of_week))
                            ->map(fn ($d) => self::DAYS[Str::lower(trim($d))] ?? Str::ucfirst(trim($d)))
                            ->implode(', '),
                        'time' => substr($s->start_time, 0, 5).' - '.substr($s->end_time, 0, 5),
                    ])->unique()->values()->all(),
                ])
                ->unique('slug')
                ->values()
                ->all();
        });
    }

    public static function find(string $slug): ?array
    {
        return collect(self::all())->firstWhere('slug', $slug);
    }

    /** "Programa de Bateria" → "Batería": el nombre que la gente busca, sin el prefijo administrativo. */
    public static function label(string $name): string
    {
        $label = trim(preg_replace('/^programa\s+(de\s+)?/iu', '', trim($name)));

        return strtr(Str::ucfirst($label), ['Bateria' => 'Batería', 'Violin' => 'Violín']);
    }
}

<?php

namespace App\Support;

use App\Models\PaymentSetting;
use App\Services\EnrollmentService;
use Illuminate\Support\Str;

/**
 * Metadatos SEO que la plantilla Blade imprime en el HTML del servidor, para que los vean
 * los buscadores y las vistas previas de redes sociales sin ejecutar JavaScript.
 */
class Seo
{
    public static function forPage(string $page): array
    {
        $config = config("seo.pages.{$page}");

        $graph = match ($page) {
            'home' => [self::organization(), self::faqPage(self::faq())],
            default => [self::breadcrumbs([[$config['title'], $config['path']]])],
        };

        return self::meta($config['title'], $config['description'], $config['path'], $graph);
    }

    public static function forProgram(array $program): array
    {
        $path = '/clases/'.$program['slug'];
        $title = "Clases de {$program['label']} en Ocaña | Academia Linaje";

        $course = [
            '@type' => 'Course',
            '@id' => config('seo.url').$path.'#curso',
            'name' => "Clases de {$program['label']}",
            'description' => self::excerpt($program['description'] ?? "Programa de {$program['label']} para niños, jóvenes y adultos.", 300),
            'url' => config('seo.url').$path,
            'inLanguage' => 'es',
            'provider' => self::orgRef(),
            'hasCourseInstance' => [
                '@type' => 'CourseInstance',
                'courseMode' => 'onsite',
                'location' => self::orgRef(),
            ],
        ];

        if ($modalities = self::modalities()) {
            $course['offers'] = array_map(fn ($m) => [
                '@type' => 'Offer',
                'name' => "{$m['name']} ({$m['ages']})",
                'category' => 'Mensualidad',
                'price' => number_format($m['amount'], 0, '.', ''),
                'priceCurrency' => 'COP',
                'url' => config('seo.url').'/matricula',
            ], $modalities);
        }

        return self::meta($title, self::programDescription($program), $path, [
            $course,
            self::breadcrumbs([['Programas', '/#programas'], ["Clases de {$program['label']}", $path]]),
            self::faqPage(self::programFaq($program)),
        ]);
    }

    /** Preguntas frecuentes de la portada. Se muestran en la página y se marcan como FAQPage. */
    public static function faq(): array
    {
        $b = config('seo.business');
        $labels = collect(PublicPrograms::all())->pluck('label');

        $faq = [
            ['¿Dónde queda Academia Linaje?', "Estamos en la {$b['street']}, en {$b['locality']}, {$b['region']}. Puedes escribirnos por WhatsApp al 300 421 8146 para indicaciones."],
            ['¿La primera clase es gratis?', 'Sí. La primera clase es una clase demo gratuita, sin compromiso. Resérvala con el formulario de esta página o por WhatsApp.'],
        ];

        if ($labels->isNotEmpty()) {
            $faq[] = ['¿Qué instrumentos puedo aprender en Ocaña con Academia Linaje?', 'Tenemos clases de '.self::humanList($labels->map(fn ($l) => Str::lower($l))->all()).'.'];
        }

        return array_merge($faq, self::modalityFaq(), [
            ['¿Cuál es el horario de atención?', 'Atendemos de lunes a sábado de 8:30 a. m. a 12:00 m. y de 2:00 p. m. a 6:00 p. m.'],
            ['¿Cómo me matriculo?', 'Puedes matricularte en línea en academialinaje.com/matricula: eliges el programa y el horario y completas los datos del estudiante.'],
        ]);
    }

    public static function programFaq(array $program): array
    {
        $label = Str::lower($program['label']);

        return array_merge([
            ["¿Dónde puedo tomar clases de {$label} en Ocaña?", 'En Academia Linaje, '.config('seo.business.street').', Ocaña, Norte de Santander.'],
            ["¿La primera clase de {$label} es gratis?", 'Sí, la primera clase es gratuita y sin compromiso. Resérvala desde la página principal o por WhatsApp al 300 421 8146.'],
        ], self::modalityFaq());
    }

    /**
     * Mensualidad por modalidad (edad del estudiante), tal como la cobra el sistema:
     * PaymentSetting + EnrollmentService::MODALITY_AGE_RANGES. El monthly_fee del programa no se usa.
     *
     * @return array<int, array{name: string, ages: string, amount: float}>
     */
    public static function modalities(): array
    {
        $setting = PaymentSetting::where('is_active', true)->first();
        if (! $setting) {
            return [];
        }

        return collect(EnrollmentService::MODALITY_AGE_RANGES)
            ->map(fn (array $range, string $name) => [
                'name' => $name,
                'ages' => $range['max'] >= 100 ? "{$range['min']} años en adelante" : "{$range['min']} a {$range['max']} años",
                'amount' => $setting->getAmountForModality($name),
            ])
            ->filter(fn (array $m) => $m['amount'] > 0)
            ->values()
            ->all();
    }

    /** @return array{min_students: int, percentage: float}|null */
    public static function siblingDiscount(): ?array
    {
        $setting = PaymentSetting::where('is_active', true)->first();

        return $setting && $setting->discount_percentage > 0
            ? ['min_students' => (int) $setting->discount_min_students, 'percentage' => (float) $setting->discount_percentage]
            : null;
    }

    private static function modalityFaq(): array
    {
        $modalities = self::modalities();
        if (! $modalities) {
            return [];
        }

        $ages = self::humanList(array_map(fn ($m) => "{$m['name']} ({$m['ages']})", $modalities));
        $prices = implode('; ', array_map(fn ($m) => "{$m['name']}: $".number_format($m['amount'], 0, ',', '.'), $modalities));
        $discount = self::siblingDiscount();

        return [
            ['¿Desde qué edad se puede estudiar?', "Las clases se organizan por edad en tres modalidades: {$ages}."],
            ['¿Cuánto cuesta la mensualidad?', "La mensualidad depende de la modalidad. {$prices} COP."
                .($discount ? " Si hay {$discount['min_students']} o más estudiantes de la misma familia, cada uno tiene ".rtrim(rtrim(number_format($discount['percentage'], 2, ',', ''), '0'), ',').' % de descuento.' : '')
                .' La primera clase es gratis.'],
        ];
    }

    private static function meta(string $title, string $description, string $path, array $graph): array
    {
        $base = config('seo.url');

        return [
            'title' => $title,
            'description' => $description,
            'canonical' => $base.$path,
            'image' => $base.config('seo.image'),
            'jsonld' => ['@context' => 'https://schema.org', '@graph' => array_values(array_filter($graph))],
        ];
    }

    private static function programDescription(array $program): string
    {
        if ($program['is_demo']) {
            return "Clases de {$program['label']} en Ocaña para niños, jóvenes y adultos. Reserva tu primera clase gratis en Academia Linaje, barrio Las Llanadas.";
        }

        $intro = "Clases de {$program['label']} en Ocaña para niños, jóvenes y adultos.";
        $outro = ' Primera clase gratis en Academia Linaje.';

        return $intro.' '.self::excerpt($program['description'] ?? '', 155 - mb_strlen($intro) - mb_strlen($outro)).$outro;
    }

    private static function orgId(): string
    {
        return config('seo.url').'/#academia';
    }

    /** Referencia corta a la academia para las páginas donde no va el bloque completo. */
    private static function orgRef(): array
    {
        $b = config('seo.business');

        return [
            '@type' => $b['type'],
            '@id' => self::orgId(),
            'name' => config('seo.site_name'),
            'url' => config('seo.url').'/',
            'telephone' => $b['telephone'],
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => $b['street'],
                'addressLocality' => $b['locality'],
                'addressRegion' => $b['region'],
                'addressCountry' => $b['country'],
            ],
        ];
    }

    private static function organization(): array
    {
        $base = config('seo.url');
        $b = config('seo.business');
        $programs = collect(PublicPrograms::all());
        $fees = collect(self::modalities())->pluck('amount');

        $org = [
            '@type' => $b['type'],
            '@id' => self::orgId(),
            'name' => config('seo.site_name'),
            'description' => config('seo.pages.home.description'),
            'url' => $base.'/',
            'logo' => $base.'/logo_academia.png',
            'image' => $base.config('seo.image'),
            'telephone' => $b['telephone'],
            'email' => $b['email'],
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => $b['street'],
                'addressLocality' => $b['locality'],
                'addressRegion' => $b['region'],
                'addressCountry' => $b['country'],
            ],
            'areaServed' => ['@type' => 'City', 'name' => "{$b['locality']}, {$b['region']}"],
            'openingHoursSpecification' => array_map(fn ($h) => [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                'opens' => $h['opens'],
                'closes' => $h['closes'],
            ], $b['hours']),
            'sameAs' => array_values(array_unique(array_merge([$b['whatsapp']], $b['profiles']))),
            'hasOfferCatalog' => [
                '@type' => 'OfferCatalog',
                'name' => 'Programas musicales',
                'itemListElement' => $programs->map(fn ($p) => [
                    '@type' => 'Offer',
                    'itemOffered' => ['@id' => $base.'/clases/'.$p['slug'].'#curso', '@type' => 'Course', 'name' => "Clases de {$p['label']}", 'url' => $base.'/clases/'.$p['slug']],
                ])->prepend([
                    '@type' => 'Offer',
                    'price' => '0',
                    'priceCurrency' => 'COP',
                    'itemOffered' => ['@type' => 'Service', 'name' => 'Clase demo gratuita', 'description' => 'Primera clase de música gratis con un profesor de la academia.'],
                ])->values()->all(),
            ],
        ];

        if ($fees->isNotEmpty()) {
            $org['priceRange'] = '$'.number_format($fees->min(), 0, ',', '.').($fees->min() != $fees->max() ? ' - $'.number_format($fees->max(), 0, ',', '.') : '').' COP / mes';
        }

        return $org;
    }

    /** @param  array<int, array{0: string, 1: string}>  $items  [nombre, ruta] después de "Inicio" */
    private static function breadcrumbs(array $items): array
    {
        $base = config('seo.url');
        $list = array_merge([['Inicio', '/']], $items);

        return [
            '@type' => 'BreadcrumbList',
            'itemListElement' => array_map(fn ($item, $i) => [
                '@type' => 'ListItem',
                'position' => $i + 1,
                'name' => $item[0],
                'item' => $base.$item[1],
            ], $list, array_keys($list)),
        ];
    }

    private static function faqPage(array $faq): array
    {
        return [
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn ($qa) => [
                '@type' => 'Question',
                'name' => $qa[0],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $qa[1]],
            ], $faq),
        ];
    }

    private static function excerpt(string $text, int $max): string
    {
        $text = trim(preg_replace('/\s+/', ' ', $text));
        if (mb_strlen($text) <= $max) {
            return $text;
        }

        $cut = mb_substr($text, 0, $max);
        $sentence = mb_strrpos($cut, '. ');

        return $sentence !== false && $sentence > $max * 0.5
            ? mb_substr($cut, 0, $sentence + 1)
            : rtrim(mb_substr($cut, 0, mb_strrpos($cut, ' ') ?: $max), ' ,;:').'…';
    }

    private static function humanList(array $items): string
    {
        return count($items) > 1
            ? implode(', ', array_slice($items, 0, -1)).' y '.end($items)
            : ($items[0] ?? '');
    }
}

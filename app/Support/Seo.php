<?php

namespace App\Support;

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

        if ($program['monthly_fee'] > 0) {
            $course['offers'] = [
                '@type' => 'Offer',
                'category' => 'Mensualidad',
                'price' => number_format($program['monthly_fee'], 0, '.', ''),
                'priceCurrency' => 'COP',
                'availability' => 'https://schema.org/InStock',
                'url' => config('seo.url').'/matricula',
            ];
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
        $programs = PublicPrograms::all();
        $labels = collect($programs)->pluck('label');
        $minFee = collect($programs)->pluck('monthly_fee')->filter()->min();

        $faq = [
            ['¿Dónde queda Academia Linaje?', "Estamos en la {$b['street']}, en {$b['locality']}, {$b['region']}. Puedes escribirnos por WhatsApp al 300 421 8146 para indicaciones."],
            ['¿La primera clase es gratis?', 'Sí. Tu primera clase es una clase demo gratuita con uno de nuestros profesores, sin compromiso. Resérvala con el formulario de esta página o por WhatsApp.'],
        ];

        if ($labels->isNotEmpty()) {
            $faq[] = ['¿Qué instrumentos puedo aprender en Ocaña con Academia Linaje?', 'Tenemos clases de '.self::humanList($labels->map(fn ($l) => Str::lower($l))->all()).'. Cada programa avanza por niveles, desde básico hasta avanzado.'];
        }

        if ($minFee) {
            $faq[] = ['¿Cuánto cuestan las clases de música?', 'La mensualidad es desde $'.number_format($minFee, 0, ',', '.').' COP. La primera clase es gratis para que conozcas la metodología antes de matricularte.'];
        }

        return array_merge($faq, [
            ['¿Las clases son para niños o para adultos?', 'Para ambos. Nuestros programas están pensados para niños, jóvenes y adultos, y el profesor adapta el ritmo al nivel de cada estudiante.'],
            ['¿Cuál es el horario de atención?', 'Atendemos de lunes a sábado de 8:30 a. m. a 12:00 m. y de 2:00 p. m. a 6:00 p. m.'],
            ['¿Cómo me matriculo?', 'Puedes matricularte en línea en academialinaje.com/matricula: eliges el programa y el horario y completas tus datos en pocos minutos.'],
        ]);
    }

    public static function programFaq(array $program): array
    {
        $label = Str::lower($program['label']);
        $faq = [
            ["¿Dónde puedo tomar clases de {$label} en Ocaña?", 'En Academia Linaje, '.config('seo.business.street').', Ocaña, Norte de Santander.'],
            ["¿La primera clase de {$label} es gratis?", 'Sí, la primera clase es gratuita y sin compromiso. Resérvala desde la página principal o por WhatsApp al 300 421 8146.'],
            ["¿Las clases de {$label} son para niños y adultos?", 'Sí, recibimos niños, jóvenes y adultos, desde nivel inicial hasta avanzado.'],
        ];

        if ($program['monthly_fee'] > 0) {
            $faq[] = ["¿Cuánto cuestan las clases de {$label}?", 'La mensualidad es de $'.number_format($program['monthly_fee'], 0, ',', '.').' COP.'];
        }

        return $faq;
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
        $fees = $programs->pluck('monthly_fee')->filter();

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

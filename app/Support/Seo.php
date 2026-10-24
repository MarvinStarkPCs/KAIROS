<?php

namespace App\Support;

/**
 * Metadatos SEO que la plantilla Blade imprime en el HTML del servidor, para que los vean
 * los buscadores y las vistas previas de redes sociales sin ejecutar JavaScript.
 */
class Seo
{
    /** @param  array<int, string>  $programNames  Programas para el catálogo del JSON-LD */
    public static function forPage(string $page, array $programNames = []): array
    {
        $config = config("seo.pages.{$page}");
        $base = config('seo.url');

        return [
            'title' => $config['title'],
            'description' => $config['description'],
            'canonical' => $base.($config['path'] === '/' ? '/' : $config['path']),
            'image' => $base.config('seo.image'),
            'jsonld' => $page === 'home' ? self::organization($programNames) : null,
        ];
    }

    private static function organization(array $programNames): array
    {
        $base = config('seo.url');
        $b = config('seo.business');
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        $courses = collect($programNames)->unique()->values()->map(fn (string $name) => [
            '@type' => 'Offer',
            'itemOffered' => ['@type' => 'Course', 'name' => $name, 'provider' => ['@type' => $b['type'], 'name' => config('seo.site_name')]],
        ]);

        return [
            '@context' => 'https://schema.org',
            '@type' => $b['type'],
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
                'addressCountry' => $b['country'],
            ],
            'openingHoursSpecification' => array_map(fn ($h) => [
                '@type' => 'OpeningHoursSpecification',
                'dayOfWeek' => $days,
                'opens' => $h['opens'],
                'closes' => $h['closes'],
            ], $b['hours']),
            'sameAs' => [$b['whatsapp']],
            'hasOfferCatalog' => [
                '@type' => 'OfferCatalog',
                'name' => 'Programas musicales',
                'itemListElement' => $courses->prepend([
                    '@type' => 'Offer',
                    'price' => '0',
                    'priceCurrency' => 'COP',
                    'itemOffered' => ['@type' => 'Course', 'name' => 'Clase demo gratuita', 'description' => 'Primera clase de música gratis con un profesor de la academia.'],
                ])->values()->all(),
            ],
        ];
    }
}

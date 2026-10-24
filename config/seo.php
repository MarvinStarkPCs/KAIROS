<?php

return [

    // Dominio canónico fijo: canonical, og:url, sitemap y JSON-LD no deben depender de APP_URL.
    'url' => rtrim(env('SEO_CANONICAL_URL', 'https://academialinaje.com'), '/'),

    'site_name' => 'Academia Linaje',
    'image' => '/og-image.jpg',
    'locale' => 'es_CO',

    // Verificación de la propiedad academialinaje.com en Google Search Console (etiqueta HTML).
    'google_verification' => env('GOOGLE_SITE_VERIFICATION', '82a7lx0NyKAlc_9xtY0Taa9y7V9akOu_lEPgXfrIKy8'),

    // ID de medición de Google Analytics 4 (G-XXXXXXX). Solo se carga en las páginas públicas indexables.
    'analytics_id' => env('GOOGLE_ANALYTICS_ID', 'G-XTRSC3578W'),

    // Páginas públicas indexables. El resto del sitio sale con noindex.
    // Las páginas de cada programa (/clases/{slug}) se generan desde la base de datos (App\Support\PublicPrograms).
    'pages' => [
        'home' => [
            'path' => '/',
            'title' => 'Academia de Música en Ocaña | Piano, Guitarra y Canto | Academia Linaje',
            'description' => 'Academia de música en Ocaña, Norte de Santander: clases de piano, guitarra, canto, batería y violín para niños, jóvenes y adultos en el barrio Las Llanadas. ¡Tu primera clase es gratis!',
        ],
        'matricula' => [
            'path' => '/matricula',
            'title' => 'Matrícula en línea | Academia de Música en Ocaña | Academia Linaje',
            'description' => 'Inscríbete en Academia Linaje, academia de música en Ocaña: elige tu programa y horario y completa tu matrícula en línea.',
        ],
    ],

    // Datos del negocio para el JSON-LD y los textos de ubicación. Deben coincidir con el Perfil de Empresa de Google.
    'business' => [
        'type' => 'MusicSchool',
        'telephone' => '+573004218146',
        'email' => 'Linajeacademia@gmail.com',
        'street' => 'Calle 11 #25A-15, Barrio Las Llanadas',
        'neighborhood' => 'Las Llanadas',
        'locality' => 'Ocaña',
        'region' => 'Norte de Santander',
        'country' => 'CO',
        'whatsapp' => 'https://wa.me/573004218146',
        // Redes y ficha de Google Maps (URLs completas). Se agregan al sameAs del JSON-LD.
        'profiles' => array_values(array_filter(explode(',', env('SEO_PROFILES', '')))),
        'hours' => [
            ['opens' => '08:30', 'closes' => '12:00'],
            ['opens' => '14:00', 'closes' => '18:00'],
        ],
    ],
];

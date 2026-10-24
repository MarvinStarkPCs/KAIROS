<?php

return [

    // Dominio canónico fijo: canonical, og:url, sitemap y JSON-LD no deben depender de APP_URL.
    'url' => rtrim(env('SEO_CANONICAL_URL', 'https://academialinaje.com'), '/'),

    'site_name' => 'Academia Linaje',
    'image' => '/og-image.jpg',
    'locale' => 'es_CO',

    // Verificación de la propiedad academialinaje.com en Google Search Console (etiqueta HTML).
    'google_verification' => env('GOOGLE_SITE_VERIFICATION', '82a7lx0NyKAlc_9xtY0Taa9y7V9akOu_lEPgXfrIKy8'),

    // Páginas públicas indexables. El resto del sitio sale con noindex.
    'pages' => [
        'home' => [
            'path' => '/',
            'title' => 'Academia de música en Las Llanadas | Academia Linaje',
            'description' => 'Clases de piano, guitarra, batería, canto y más en Las Llanadas para niños, jóvenes y adultos. Profesores certificados y metodología personalizada. ¡Tu primera clase es gratis!',
        ],
        'matricula' => [
            'path' => '/matricula',
            'title' => 'Matrícula | Academia Linaje',
            'description' => 'Inscríbete en Academia Linaje: elige tu programa y horario de música y completa tu matrícula en línea.',
        ],
    ],

    // Datos del negocio para el JSON-LD (los mismos que muestra la portada).
    'business' => [
        'type' => 'MusicSchool',
        'telephone' => '+573004218146',
        'email' => 'Linajeacademia@gmail.com',
        'street' => 'Calle 11 #25A - 15',
        'locality' => 'Las Llanadas',
        'country' => 'CO',
        'whatsapp' => 'https://wa.me/573004218146',
        'hours' => [
            ['opens' => '08:30', 'closes' => '12:00'],
            ['opens' => '14:00', 'closes' => '18:00'],
        ],
    ],
];

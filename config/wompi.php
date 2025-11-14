<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Wompi API Keys
    |--------------------------------------------------------------------------
    |
    | Tus llaves de API de Wompi. Usa las llaves de prueba para desarrollo
    | y las de producción para producción.
    |
    */
    'public_key' => env('WOMPI_PUBLIC_KEY'),
    'private_key' => env('WOMPI_PRIVATE_KEY'),
    'events_secret' => env('WOMPI_EVENTS_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Wompi API URL
    |--------------------------------------------------------------------------
    |
    | URL base de la API de Wompi
    | Sandbox: https://sandbox.wompi.co/v1
    | Producción: https://production.wompi.co/v1
    |
    */
    'url' => env('WOMPI_URL', 'https://sandbox.wompi.co/v1'),

    /*
    |--------------------------------------------------------------------------
    | Redirect URLs
    |--------------------------------------------------------------------------
    |
    | URLs de redirección después del pago
    |
    */
    'redirect_url' => env('APP_URL') . '/pagos/confirmacion',
];

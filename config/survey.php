<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cuestionario de análisis de la academia
    |--------------------------------------------------------------------------
    |
    | Cada profesor y administrador responde su propio cuestionario. Los
    | resultados consolidados de todos los participantes los ve únicamente la
    | cuenta indicada aquí (Admin Dev).
    |
    */

    'results_email' => env('SURVEY_RESULTS_EMAIL', 'programminghomee@gmail.com'),

    'roles' => ['Administrador', 'Profesor'],

];

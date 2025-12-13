<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // Usar nuestro middleware CSRF personalizado
        $middleware->validateCsrfTokens(except: [
            'matricula/checkout/*/create-payment-link',
            'webhook/wompi',
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Registrar alias de middleware de Spatie Permission
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        // Generar mensualidades el día 25 de cada mes a las 2:00 AM
        $schedule->command('payments:generate-monthly')->monthlyOn(25, '02:00');

        // Marcar pagos vencidos diariamente a las 6:00 AM (después del día 5)
        $schedule->command('payments:mark-overdue')->dailyAt('06:00');

        // Verificar pagos manuales pendientes del 1-5 del mes
        // Se ejecuta el día 6 de cada mes a las 7:00 AM
        $schedule->command('payments:check-pending-manual')->monthlyOn(6, '07:00');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

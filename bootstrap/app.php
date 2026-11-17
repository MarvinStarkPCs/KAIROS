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
            'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'survey.required'    => \App\Http\Middleware\RequireSurveyCompleted::class,
            'system.access'      => \App\Http\Middleware\BlockSystemAccess::class,
        ]);
    })
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        // Reasignar la modalidad de quienes cumplieron años.
        // Corre a diario para que la ficha del estudiante y el valor a cobrar
        // no queden desfasados entre una mensualidad y la siguiente.
        $schedule->command('students:sync-modality')->dailyAt('05:00');

        // Generar mensualidades el día 1 de cada mes a las 00:00 AM
        $schedule->command('payments:generate-monthly')->monthlyOn(1, '00:00');

        // Marcar pagos vencidos diariamente a las 6:00 AM (después del día 5)
        $schedule->command('payments:mark-overdue')->dailyAt('06:00');

        // Verificar pagos manuales pendientes del 1-5 del mes
        // Se ejecuta el día 6 de cada mes a las 7:00 AM
        $schedule->command('payments:check-pending-manual')->monthlyOn(6, '07:00');

        // Enviar recordatorios de pago 3 días antes del vencimiento
        // Se ejecuta diariamente a las 8:00 AM
        $schedule->command('payments:send-reminders')->dailyAt('08:00');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // MySQL caído o sin conexiones libres (hosting compartido): aviso que no toca la base de datos.
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if (config('app.debug') || ! \App\Support\DatabaseDown::matches($e)) {
                return null;
            }

            $headers = ['Retry-After' => '30'];

            return $request->expectsJson() && ! $request->header('X-Inertia')
                ? response()->json(['message' => 'El servicio no está disponible por un momento. Intenta de nuevo.'], 503, $headers)
                : response()->view('errors.sin-base-de-datos', [], 503, $headers);
        });
    })->create();

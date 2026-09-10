<?php

namespace App\Providers;

use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Registrar MailService como singleton para usar en toda la aplicación
        $this->app->singleton(\App\Services\MailService::class, function ($app) {
            return new \App\Services\MailService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Mantiene la modalidad del estudiante alineada con su fecha de nacimiento.
        \App\Models\User::observe(\App\Observers\UserObserver::class);

        Inertia::share([
            'flash' => function () {
                return [
                    'success' => Session::get('success'),
                    'error' => Session::get('error'),
                    'warning' => Session::get('warning'),
                    'info' => Session::get('info'),
                ];
            },
        ]);
    }
}

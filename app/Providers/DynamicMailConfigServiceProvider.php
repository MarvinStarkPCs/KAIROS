<?php

namespace App\Providers;

use App\Models\SmtpSetting;
use Illuminate\Support\ServiceProvider;

class DynamicMailConfigServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        try {
            // Intentar cargar la configuración SMTP de la base de datos
            $smtpSetting = SmtpSetting::where('is_active', true)->first();

            if ($smtpSetting) {
                config([
                    'mail.default' => 'smtp',
                    'mail.mailers.smtp.host' => $smtpSetting->host,
                    'mail.mailers.smtp.port' => $smtpSetting->port,
                    'mail.mailers.smtp.username' => $smtpSetting->username,
                    'mail.mailers.smtp.password' => $smtpSetting->password,
                    'mail.mailers.smtp.encryption' => $smtpSetting->encryption,
                    'mail.from.address' => $smtpSetting->from_address,
                    'mail.from.name' => $smtpSetting->from_name,
                ]);
            }
        } catch (\Exception $e) {
            // Si falla (por ejemplo, durante migraciones), no hacer nada
            // y usar la configuración por defecto del .env
        }
    }
}

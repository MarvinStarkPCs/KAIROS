<?php

namespace App\Services;

use App\Models\SmtpSetting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;

class MailService
{
    protected ?SmtpSetting $settings = null;

    /**
     * Constructor - Carga la configuración SMTP activa
     */
    public function __construct()
    {
        $this->loadSettings();
    }

    /**
     * Carga la configuración SMTP desde la base de datos
     */
    protected function loadSettings(): void
    {
        try {
            $this->settings = SmtpSetting::where('is_active', true)->first();
        } catch (\Exception $e) {
            // Si no hay conexión a BD aún (migraciones, etc.), ignorar
            $this->settings = null;
        }
    }

    /**
     * Configura el mailer con la configuración SMTP de la base de datos
     */
    public function configure(): bool
    {
        if (!$this->settings) {
            return false;
        }

        Config::set('mail.mailers.smtp', [
            'transport' => 'smtp',
            'host' => $this->settings->host,
            'port' => $this->settings->port,
            'encryption' => $this->settings->encryption,
            'username' => $this->settings->username,
            'password' => $this->settings->password,
            'timeout' => null,
        ]);

        Config::set('mail.from', [
            'address' => $this->settings->from_address,
            'name' => $this->settings->from_name,
        ]);

        // Cambiar el mailer por defecto a SMTP
        Config::set('mail.default', 'smtp');

        return true;
    }

    /**
     * Obtiene la configuración SMTP activa
     */
    public function getSettings(): ?SmtpSetting
    {
        return $this->settings;
    }

    /**
     * Verifica si hay configuración SMTP activa
     */
    public function isConfigured(): bool
    {
        return $this->settings !== null;
    }

    /**
     * Recarga la configuración SMTP
     */
    public function reload(): void
    {
        $this->loadSettings();
        $this->configure();
    }
}

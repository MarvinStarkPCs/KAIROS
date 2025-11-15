<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestMailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mail:test {email? : Dirección de correo para enviar la prueba}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Enviar un correo de prueba para verificar configuración SMTP';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email') ?? $this->ask('¿A qué dirección quieres enviar el correo de prueba?');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('La dirección de correo no es válida');
            return 1;
        }

        $this->info('Enviando correo de prueba a: ' . $email);
        $this->info('Configuración SMTP actual:');
        $this->line('  Host: ' . config('mail.mailers.smtp.host'));
        $this->line('  Port: ' . config('mail.mailers.smtp.port'));
        $this->line('  From: ' . config('mail.from.address'));
        $this->newLine();

        try {
            Mail::raw('Este es un correo de prueba desde KAIROS. Si recibes este mensaje, la configuración SMTP está funcionando correctamente.', function ($message) use ($email) {
                $message->to($email)
                    ->subject('Correo de prueba - KAIROS');
            });

            $this->info('✓ Correo enviado exitosamente!');
            $this->newLine();
            $this->info('Por favor, verifica tu bandeja de entrada (y spam) en: ' . $email);

            return 0;
        } catch (\Exception $e) {
            $this->error('✗ Error al enviar el correo:');
            $this->error($e->getMessage());
            $this->newLine();

            if (str_contains($e->getMessage(), 'authentication')) {
                $this->warn('NOTA: Si usas Gmail, necesitas una "Contraseña de aplicación" en lugar de tu contraseña normal.');
                $this->warn('Genera una en: https://myaccount.google.com/apppasswords');
            }

            return 1;
        }
    }
}

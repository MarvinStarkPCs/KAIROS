<?php

namespace App\Console\Commands;

use App\Models\DemoLead;
use App\Mail\DemoClassWelcomeMail;
use App\Services\MailService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestDemoWelcomeEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:demo-email {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Enviar un correo de prueba de bienvenida para clase demo';

    /**
     * Execute the console command.
     */
    public function handle(MailService $mailService)
    {
        $email = $this->argument('email');

        // Verificar configuración SMTP
        if (!$mailService->isConfigured()) {
            $this->error('❌ No hay configuración SMTP activa en la base de datos.');
            $this->info('💡 Configura el SMTP desde el panel de administración.');
            return 1;
        }

        // Configurar SMTP
        $mailService->configure();

        // Crear un lead de prueba
        $testLead = new DemoLead([
            'name' => 'Juan Pérez',
            'email' => $email,
            'phone' => '+57 300 123 4567',
            'is_for_child' => false,
            'child_name' => null,
            'instrument' => 'Piano',
            'preferred_schedule' => 'Lunes y Miércoles 10:00-11:00',
            'message' => 'Este es un correo de prueba',
            'status' => 'pending',
        ]);

        try {
            $this->info('📧 Enviando correo de prueba a: ' . $email);
            $this->info('⏳ Por favor espera...');

            Mail::to($email)->send(new DemoClassWelcomeMail($testLead));

            $this->line('');
            $this->info('✅ ¡Correo enviado exitosamente!');
            $this->info('📬 Revisa la bandeja de entrada de: ' . $email);
            $this->line('');

            return 0;
        } catch (\Exception $e) {
            $this->line('');
            $this->error('❌ Error al enviar el correo:');
            $this->error($e->getMessage());
            $this->line('');
            $this->info('💡 Verifica la configuración SMTP en la base de datos.');

            return 1;
        }
    }
}

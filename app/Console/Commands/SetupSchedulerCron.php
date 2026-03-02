<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SetupSchedulerCron extends Command
{
    protected $signature = 'schedule:setup-cron {--install : Instalar el cron automáticamente vía crontab}';
    protected $description = 'Muestra o instala la entrada de cron para el scheduler de Laravel';

    public function handle(): int
    {
        $artisanPath = base_path('artisan');
        $phpBin = PHP_BINARY ?: '/usr/local/bin/php';

        // En cPanel el PHP suele estar en una de estas rutas
        $possiblePhpPaths = [
            '/usr/local/bin/php',
            '/usr/bin/php',
            PHP_BINARY,
        ];

        $cronLine = "* * * * * {$phpBin} {$artisanPath} schedule:run >> /dev/null 2>&1";

        $this->newLine();
        $this->info('═══════════════════════════════════════════════════════════');
        $this->info('   Configuración del Scheduler de Laravel');
        $this->info('═══════════════════════════════════════════════════════════');
        $this->newLine();
        $this->line('Línea de cron a agregar:');
        $this->newLine();
        $this->comment("  {$cronLine}");
        $this->newLine();

        if ($this->option('install')) {
            return $this->installCron($cronLine);
        }

        $this->info('Para instalar automáticamente, corre:');
        $this->line("  php artisan schedule:setup-cron --install");
        $this->newLine();
        $this->info('O agrégala manualmente en cPanel:');
        $this->line('  1. cPanel → Cron Jobs');
        $this->line('  2. Common Settings: "Once Per Minute (*  *  *  *  *)"');
        $this->line('  3. Command: ' . $cronLine);
        $this->newLine();
        $this->info('Tareas programadas activas:');
        $this->table(
            ['Comando', 'Frecuencia'],
            [
                ['payments:generate-monthly', 'Día 1 de cada mes - 02:00 AM'],
                ['payments:mark-overdue',     'Diario - 06:00 AM'],
                ['payments:check-pending-manual', 'Día 6 de cada mes - 07:00 AM'],
                ['payments:send-reminders',   'Diario - 08:00 AM'],
            ]
        );

        return 0;
    }

    private function installCron(string $cronLine): int
    {
        // Verificar si ya está instalado
        $currentCrontab = shell_exec('crontab -l 2>/dev/null') ?? '';

        if (str_contains($currentCrontab, 'schedule:run')) {
            $this->warn('⚠️  El cron del scheduler ya está instalado:');
            $this->line(collect(explode("\n", $currentCrontab))
                ->first(fn($l) => str_contains($l, 'schedule:run')) ?? '');
            $this->newLine();

            if (!$this->confirm('¿Deseas reemplazarlo?', false)) {
                $this->info('No se realizaron cambios.');
                return 0;
            }

            // Eliminar la línea existente
            $currentCrontab = collect(explode("\n", $currentCrontab))
                ->reject(fn($l) => str_contains($l, 'schedule:run'))
                ->implode("\n");
        }

        $newCrontab = trim($currentCrontab) . "\n" . $cronLine . "\n";

        $tmpFile = tempnam(sys_get_temp_dir(), 'crontab_');
        file_put_contents($tmpFile, $newCrontab);

        $result = shell_exec("crontab {$tmpFile} 2>&1");
        unlink($tmpFile);

        if ($result === null || $result === '') {
            $this->info('✅ Cron instalado correctamente.');
            $this->newLine();
            $this->line("  {$cronLine}");
            $this->newLine();
            $this->line('Verifica con: crontab -l');
        } else {
            $this->error('❌ Error al instalar el cron:');
            $this->line($result);
            $this->newLine();
            $this->info('Agrégalo manualmente en cPanel → Cron Jobs.');
        }

        return 0;
    }
}

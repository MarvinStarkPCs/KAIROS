<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\EnrollmentService;
use Carbon\Carbon;
use Illuminate\Console\Command;

/**
 * Reasigna la modalidad de cada estudiante segun su edad actual.
 *
 * La modalidad se fija al matricular y define el valor de la mensualidad, pero
 * los estudiantes cumplen anios y cambian de rango. Sin este ajuste un niño que
 * pasa de 9 a 10 seguiria pagando la tarifa de Linaje Kids indefinidamente.
 */
class SyncStudentModality extends Command
{
    protected $signature = 'students:sync-modality
                            {--dry-run : Muestra los cambios sin guardarlos}';

    protected $description = 'Actualiza la modalidad de los estudiantes segun su edad actual';

    public function handle(EnrollmentService $enrollmentService): int
    {
        $dryRun = (bool) $this->option('dry-run');

        if ($dryRun) {
            $this->warn('Modo simulacion: no se guardara ningun cambio.');
        }

        $students = User::with('studentProfile')
            ->whereHas('studentProfile')
            ->whereNotNull('birth_date')
            ->get();

        $this->info("Estudiantes con perfil y fecha de nacimiento: {$students->count()}");
        $this->newLine();

        $changed = 0;
        $unchanged = 0;

        foreach ($students as $student) {
            $profile = $student->studentProfile;
            $current = $profile->modality;
            $expected = $enrollmentService->resolveModality(
                $student->birth_date instanceof Carbon
                    ? $student->birth_date->toDateString()
                    : (string) $student->birth_date,
                $current
            );

            if ($current === $expected) {
                $unchanged++;

                continue;
            }

            $age = Carbon::parse($student->birth_date)->age;
            $name = trim($student->name.' '.($student->last_name ?? ''));

            $this->line("  {$name} ({$age} años): {$current} -> {$expected}");

            if (! $dryRun) {
                $profile->update(['modality' => $expected]);
                $enrollmentService->logModalityChange($student, $current, $expected, $age);
            }

            $changed++;
        }

        $this->newLine();
        $this->info($dryRun
            ? "Cambiarian de modalidad: {$changed}. Sin cambios: {$unchanged}."
            : "Modalidades actualizadas: {$changed}. Sin cambios: {$unchanged}.");

        if ($changed > 0 && ! $dryRun) {
            $this->warn('Las mensualidades que se generen a partir de ahora usaran la nueva modalidad.');
            $this->warn('Los cobros ya emitidos conservan el valor con el que se crearon.');
        }

        return self::SUCCESS;
    }
}

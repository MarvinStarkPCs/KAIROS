<?php

namespace App\Observers;

use App\Models\User;
use App\Services\EnrollmentService;
use Carbon\Carbon;

/**
 * Mantiene la modalidad del estudiante alineada con su fecha de nacimiento.
 *
 * La modalidad define el valor de la mensualidad, y antes se fijaba al
 * matricular y no se volvía a tocar. Al colgarlo del modelo, cualquier
 * corrección de la fecha reasigna la modalidad, sin importar por qué pantalla
 * o comando se haya hecho el cambio.
 */
class UserObserver
{
    public function __construct(private readonly EnrollmentService $enrollments) {}

    public function updated(User $user): void
    {
        // Solo interesa cuando la fecha de nacimiento acaba de cambiar.
        if (! $user->wasChanged('birth_date') || ! $user->birth_date) {
            return;
        }

        $profile = $user->studentProfile;

        if (! $profile) {
            return;
        }

        $birthDate = $user->birth_date instanceof Carbon
            ? $user->birth_date->toDateString()
            : (string) $user->birth_date;

        $current = $profile->modality;
        $expected = $this->enrollments->resolveModality($birthDate, $current);

        if ($expected === $current) {
            return;
        }

        $profile->update(['modality' => $expected]);

        $this->enrollments->logModalityChange(
            $user,
            $current,
            $expected,
            Carbon::parse($birthDate)->age
        );
    }
}

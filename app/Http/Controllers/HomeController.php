<?php

namespace App\Http\Controllers;

use App\Models\AcademicProgram;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Portada pública. Es la página que más visitan los bots, así que los programas
     * se cachean unos minutos en lugar de consultarse en cada visita.
     */
    public function welcome()
    {
        $data = Cache::remember('home.programs', now()->addMinutes(5), fn () => [
            'demoPrograms' => $this->demoPrograms(),
            'academicPrograms' => $this->academicPrograms(),
        ]);

        return Inertia::render('welcome', $data);
    }

    /**
     * Redirección por rol (la usan Fortify y otros redirects a /dashboard).
     */
    public function dashboard()
    {
        $user = auth()->user();

        return match (true) {
            $user->hasRole('Administrador') => redirect()->route('programas_academicos.index'),
            $user->hasRole('Estudiante') => redirect()->route('estudiante.calificaciones'),
            $user->hasRole('Profesor') => redirect()->route('profesor.mis-grupos'),
            $user->hasRole('Padre/Madre') => redirect()->route('padre.dashboard'),
            default => redirect()->route('programas_academicos.index'),
        };
    }

    /** Programas demo con al menos un horario con cupo. */
    private function demoPrograms(): array
    {
        $programs = AcademicProgram::where('is_demo', true)
            ->where('status', 'active')
            ->with(['schedules' => function ($query) {
                $query->where('status', 'active')
                    ->with('professor:id,name')
                    ->withCount(['enrollments as enrolled_count' => function ($q) {
                        $q->where('status', 'enrolled');
                    }])
                    ->select('id', 'academic_program_id', 'days_of_week', 'start_time', 'end_time', 'professor_id', 'max_students', 'status');
            }])
            ->select('id', 'name', 'description')
            ->orderBy('name')
            ->get();

        $programs->each(function ($program) {
            $program->schedules->each(function ($schedule) {
                $schedule->available_slots = $schedule->max_students - $schedule->enrolled_count;
                $schedule->has_capacity = $schedule->available_slots > 0;
            });
        });

        return $programs
            ->filter(fn ($program) => $program->schedules->where('has_capacity', true)->isNotEmpty())
            ->values()
            ->toArray();
    }

    /** Programas regulares; se agrupan por nombre porque puede haber registros repetidos. */
    private function academicPrograms(): array
    {
        return AcademicProgram::where('is_demo', false)
            ->where('status', 'active')
            ->select('id', 'name', 'description', 'monthly_fee', 'icon', 'color')
            ->orderBy('name')
            ->get()
            ->unique('name')
            ->values()
            ->toArray();
    }
}

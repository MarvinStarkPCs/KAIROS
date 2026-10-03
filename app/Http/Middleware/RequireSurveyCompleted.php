<?php

namespace App\Http\Middleware;

use App\Models\AcademySurvey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireSurveyCompleted
{
    /**
     * Bloquea el acceso a profesores que no han completado (100%) el cuestionario institucional.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->hasRole('Profesor')) {
            return $next($request);
        }

        // Siempre se permite acceder al cuestionario y a las rutas básicas de cuenta.
        if ($request->routeIs('academy-survey.*', 'logout', 'profile.*', 'password.*')) {
            return $next($request);
        }

        // Se consulta una vez por sesión: evita una query en cada petición del profesor.
        if ($request->session()->get('survey_completed')) {
            return $next($request);
        }

        $completed = AcademySurvey::where('user_id', $user->id)
            ->where('progress_percent', '>=', 100)
            ->exists();

        if ($completed) {
            $request->session()->put('survey_completed', true);
        } else {
            flash_warning('Debes completar el cuestionario institucional al 100% antes de continuar.');

            return redirect()->route('academy-survey.show');
        }

        return $next($request);
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockSystemAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Siempre se permite: rutas de autenticación, la página de bloqueo y el logout.
        if ($request->routeIs('sistema-bloqueado', 'logout', 'login', 'password.*')) {
            return $next($request);
        }

        // El usuario administrador principal (ID 1) nunca se bloquea.
        if ($user && $user->id === 1) {
            return $next($request);
        }

        if (cache('sistema_bloqueado', false)) {
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return redirect()->route('sistema-bloqueado');
            }

            return redirect()->route('sistema-bloqueado');
        }

        return $next($request);
    }
}

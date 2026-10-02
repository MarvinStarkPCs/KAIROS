<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemAccessController extends Controller
{
    public function edit()
    {
        abort_unless(auth()->id() === 1, 403);

        return Inertia::render('settings/acceso', [
            'bloqueado' => (bool) cache('sistema_bloqueado', false),
        ]);
    }

    public function lock(Request $request)
    {
        abort_unless($request->user()->id === 1, 403);

        cache()->forever('sistema_bloqueado', true);
        flash_warning('Sistema bloqueado. Solo tú puedes acceder.');

        return back();
    }

    public function unlock(Request $request)
    {
        abort_unless($request->user()->id === 1, 403);

        cache()->forget('sistema_bloqueado');
        flash_success('Acceso restaurado. Todos los usuarios pueden entrar.');

        return back();
    }
}

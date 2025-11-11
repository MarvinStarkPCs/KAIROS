<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirigir a Google para autenticación
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Manejar el callback de Google
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Buscar usuario por Google ID
            $user = User::where('google_id', $googleUser->getId())->first();

            if ($user) {
                // Usuario existente con Google, actualizar avatar si cambió
                $user->update([
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                // Buscar usuario por email
                $user = User::where('email', $googleUser->getEmail())->first();

                if ($user) {
                    // Usuario existente sin Google ID, vincular cuenta
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                    ]);
                } else {
                    // Crear nuevo usuario
                    $user = User::create([
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                        'password' => Hash::make(Str::random(24)), // Password random para usuarios de Google
                        'email_verified_at' => now(), // Consideramos el email verificado si viene de Google
                    ]);

                    // Asignar rol de Estudiante por defecto
                    $user->assignRole('Estudiante');
                }
            }

            // Iniciar sesión
            Auth::login($user);

            flash_success('¡Bienvenido! Has iniciado sesión con Google correctamente.');

            return redirect()->intended(route('dashboard'));
        } catch (\Exception $e) {
            flash_error('Error al iniciar sesión con Google. Por favor, intenta nuevamente.');

            return redirect()->route('login');
        }
    }
}

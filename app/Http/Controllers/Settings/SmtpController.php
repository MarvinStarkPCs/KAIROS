<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SmtpSetting;
use App\Models\User;
use App\Notifications\TestEmailNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SmtpController extends Controller
{
    public function edit()
    {
        $smtpSetting = SmtpSetting::first();

        return Inertia::render('settings/smtp', [
            'smtpSetting' => $smtpSetting,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'host' => ['required', 'string', 'max:255'],
            'port' => ['required', 'integer', 'min:1', 'max:65535'],
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
            'encryption' => ['nullable', Rule::in(['tls', 'ssl', null])],
            'from_address' => ['required', 'email', 'max:255'],
            'from_name' => ['required', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ], [
            'host.required' => 'El host es obligatorio',
            'port.required' => 'El puerto es obligatorio',
            'port.integer' => 'El puerto debe ser un número',
            'port.min' => 'El puerto debe ser mayor a 0',
            'port.max' => 'El puerto debe ser menor o igual a 65535',
            'from_address.required' => 'El correo de remitente es obligatorio',
            'from_address.email' => 'El correo de remitente debe ser válido',
            'from_name.required' => 'El nombre de remitente es obligatorio',
            'encryption.in' => 'El tipo de encriptación debe ser TLS, SSL o ninguno',
            'is_active.required' => 'El estado es obligatorio',
            'is_active.boolean' => 'El estado debe ser verdadero o falso',
        ]);

        $smtpSetting = SmtpSetting::first();

        if ($smtpSetting) {
            // Si no se proporciona contraseña, mantener la actual
            if (empty($validated['password'])) {
                unset($validated['password']);
            }

            $smtpSetting->update($validated);
            flash_success('Configuración SMTP actualizada correctamente');
        } else {
            // Para nueva configuración, la contraseña es opcional pero recomendada
            if (empty($validated['password'])) {
                flash_warning('Configuración SMTP creada sin contraseña. Se recomienda configurar una para mayor seguridad.');
            } else {
                flash_success('Configuración SMTP creada correctamente');
            }

            SmtpSetting::create($validated);
        }

        return redirect()->back();
    }

    public function test(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'El correo de prueba es obligatorio',
            'email.email' => 'El correo de prueba debe ser válido',
        ]);

        $smtpSetting = SmtpSetting::where('is_active', true)->first();

        if (! $smtpSetting) {
            flash_error('No hay configuración SMTP activa');

            return redirect()->back();
        }

        try {
            // Configurar temporalmente el mailer con las credenciales actuales
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.host' => $smtpSetting->host,
                'mail.mailers.smtp.port' => $smtpSetting->port,
                'mail.mailers.smtp.username' => $smtpSetting->username,
                'mail.mailers.smtp.password' => $smtpSetting->password,
                'mail.mailers.smtp.encryption' => $smtpSetting->encryption,
                'mail.from.address' => $smtpSetting->from_address,
                'mail.from.name' => $smtpSetting->from_name,
            ]);

            // Crear un usuario temporal para la notificación
            $tempUser = new User([
                'name' => 'Usuario de Prueba',
                'email' => $request->email,
            ]);

            // Enviar notificación de prueba
            Notification::send($tempUser, new TestEmailNotification());

            flash_success('Correo de prueba enviado correctamente a '.$request->email);
        } catch (\Exception $e) {
            flash_error('Error al enviar el correo de prueba: '.$e->getMessage());
        }

        return redirect()->back();
    }
}

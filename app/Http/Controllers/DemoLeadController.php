<?php

namespace App\Http\Controllers;

use App\Models\DemoLead;
use App\Mail\DemoClassWelcomeMail;
use App\Services\MailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class DemoLeadController extends Controller
{
    public function __construct(
        protected MailService $mailService
    ) {}

    /**
     * Guardar solicitud de clase demo desde formulario de welcome
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'is_for_child' => 'required|boolean',
            'child_name' => 'nullable|required_if:is_for_child,true|string|max:255',
            'instrument' => 'required|string|max:50',
            'preferred_schedule' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:1000',
        ], [
            'name.required' => 'El nombre es obligatorio',
            'email.required' => 'El email es obligatorio',
            'email.email' => 'El email debe ser válido',
            'phone.required' => 'El teléfono es obligatorio',
            'is_for_child.required' => 'Debes indicar para quién es la clase',
            'child_name.required_if' => 'El nombre del niño/a es obligatorio',
            'instrument.required' => 'Debes seleccionar un instrumento',
        ]);

        try {
            $lead = DemoLead::create($validated);

            $emailSent = false;

            // Enviar correo de bienvenida si hay configuración SMTP activa
            if ($this->mailService->isConfigured()) {
                try {
                    // Configurar SMTP
                    $this->mailService->configure();

                    // Enviar correo (queued para mejor rendimiento)
                    Mail::to($lead->email)->send(new DemoClassWelcomeMail($lead));

                    $emailSent = true;

                    \Log::info('Correo de bienvenida enviado exitosamente', [
                        'lead_id' => $lead->id,
                        'email' => $lead->email,
                    ]);
                } catch (\Exception $e) {
                    // No fallar la solicitud si el correo falla
                    \Log::error('Error al enviar correo de bienvenida:', [
                        'lead_id' => $lead->id,
                        'message' => $e->getMessage(),
                    ]);
                }
            } else {
                \Log::warning('No se pudo enviar correo de bienvenida: SMTP no configurado', [
                    'lead_id' => $lead->id,
                ]);
            }

            // Mensaje de éxito diferente según si se envió el correo
            if ($emailSent) {
                flash_success('¡Solicitud recibida exitosamente! 📧 Te hemos enviado un correo de confirmación a ' . $lead->email . '. Revisa tu bandeja de entrada.');
            } else {
                flash_success('¡Gracias por tu interés! Tu solicitud ha sido registrada. Nos pondremos en contacto contigo pronto.');
            }

            return redirect()->back();
        } catch (\Exception $e) {
            \Log::error('Error al guardar lead de demo:', [
                'message' => $e->getMessage(),
                'data' => $validated,
            ]);

            flash_error('Hubo un error al enviar tu solicitud. Por favor intenta nuevamente.');

            return redirect()->back()->withInput();
        }
    }
}

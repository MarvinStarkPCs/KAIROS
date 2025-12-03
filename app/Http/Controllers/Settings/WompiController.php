<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\WompiSetting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WompiController extends Controller
{
    public function edit()
    {
        $wompiSetting = WompiSetting::first();

        // Si existe, mostrar los campos sensibles para edición
        if ($wompiSetting) {
            $wompiSetting->makeVisible(['private_key', 'events_secret', 'integrity_secret']);
        }

        return Inertia::render('settings/wompi', [
            'wompiSetting' => $wompiSetting,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'environment' => ['required', Rule::in(['test', 'production'])],
            'public_key' => ['required', 'string', 'max:255'],
            'private_key' => ['nullable', 'string', 'max:255'],
            'events_secret' => ['nullable', 'string', 'max:255'],
            'integrity_secret' => ['nullable', 'string', 'max:255'],
            'api_url' => ['required', 'url', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ], [
            'environment.required' => 'El ambiente es obligatorio',
            'environment.in' => 'El ambiente debe ser test o production',
            'public_key.required' => 'La llave pública es obligatoria',
            'api_url.required' => 'La URL de la API es obligatoria',
            'api_url.url' => 'La URL de la API debe ser válida',
            'is_active.required' => 'El estado es obligatorio',
            'is_active.boolean' => 'El estado debe ser verdadero o falso',
        ]);

        $wompiSetting = WompiSetting::first();

        if ($wompiSetting) {
            // Si no se proporcionan los secretos, mantener los actuales
            if (empty($validated['private_key'])) {
                unset($validated['private_key']);
            }
            if (empty($validated['events_secret'])) {
                unset($validated['events_secret']);
            }
            if (empty($validated['integrity_secret'])) {
                unset($validated['integrity_secret']);
            }

            $wompiSetting->update($validated);
            flash_success('Configuración de Wompi actualizada correctamente');
        } else {
            // Para nueva configuración, validar que todos los secretos estén presentes
            if (empty($validated['private_key']) || empty($validated['events_secret']) || empty($validated['integrity_secret'])) {
                flash_error('Para crear una nueva configuración, todos los secretos son obligatorios');
                return redirect()->back()->withInput();
            }

            WompiSetting::create($validated);
            flash_success('Configuración de Wompi creada correctamente');
        }

        // Actualizar las variables de config en memoria
        $this->updateWompiConfig();

        return redirect()->back();
    }

    /**
     * Actualizar la configuración de Wompi en memoria
     */
    protected function updateWompiConfig()
    {
        $wompiSetting = WompiSetting::where('is_active', true)->first();

        if ($wompiSetting) {
            config([
                'wompi.public_key' => $wompiSetting->public_key,
                'wompi.private_key' => $wompiSetting->private_key,
                'wompi.events_secret' => $wompiSetting->events_secret,
                'wompi.integrity_secret' => $wompiSetting->integrity_secret,
                'wompi.url' => $wompiSetting->api_url,
            ]);
        }
    }
}

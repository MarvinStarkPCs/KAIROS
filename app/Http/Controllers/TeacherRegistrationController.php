<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class TeacherRegistrationController extends Controller
{
    /**
     * Mostrar el formulario de registro público de profesores
     */
    public function create()
    {
        return Inertia::render('TeacherRegistration/Create');
    }

    /**
     * Procesar el registro del profesor
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Datos personales
            'name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'document_type' => ['required', 'in:CC,TI,CE,Pasaporte'],
            'document_number' => ['required', 'string', 'max:20'],
            'birth_date' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:M,F'],
            'phone' => ['nullable', 'string', 'max:20'],
            'mobile' => ['required', 'string', 'max:20'],

            // Ubicación
            'address' => ['required', 'string', 'max:255'],
            'neighborhood' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'department' => ['required', 'string', 'max:255'],

            // Información musical
            'instruments_played' => ['required', 'string', 'max:500'],
            'music_schools' => ['nullable', 'string', 'max:500'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:50'],
            'bio' => ['nullable', 'string', 'max:1000'],

            // Credenciales
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'name.required' => 'El nombre es obligatorio',
            'last_name.required' => 'El apellido es obligatorio',
            'email.required' => 'El correo electrónico es obligatorio',
            'email.email' => 'El correo electrónico no es válido',
            'email.unique' => 'Este correo electrónico ya está registrado',
            'document_type.required' => 'El tipo de documento es obligatorio',
            'document_number.required' => 'El número de documento es obligatorio',
            'birth_date.required' => 'La fecha de nacimiento es obligatoria',
            'birth_date.before' => 'La fecha de nacimiento debe ser anterior a hoy',
            'gender.required' => 'El género es obligatorio',
            'mobile.required' => 'El número de celular es obligatorio',
            'address.required' => 'La dirección es obligatoria',
            'city.required' => 'La ciudad es obligatoria',
            'department.required' => 'El departamento es obligatorio',
            'instruments_played.required' => 'Debes indicar al menos un instrumento que dominas',
            'password.required' => 'La contraseña es obligatoria',
            'password.confirmed' => 'Las contraseñas no coinciden',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
        ]);

        try {
            // Crear el usuario profesor (solo datos básicos)
            $teacher = User::create([
                'name' => $validated['name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'document_type' => $validated['document_type'],
                'document_number' => $validated['document_number'],
                'birth_date' => $validated['birth_date'],
                'gender' => $validated['gender'],
                'phone' => $validated['phone'],
                'mobile' => $validated['mobile'],
                'address' => $validated['address'],
                'neighborhood' => $validated['neighborhood'],
                'city' => $validated['city'],
                'department' => $validated['department'],
            ]);

            // Asignar rol de Profesor
            $profesorRole = Role::where('name', 'Profesor')->first();
            if ($profesorRole) {
                $teacher->assignRole($profesorRole);
            }

            // Crear el perfil de profesor con la información musical
            $teacher->teacherProfile()->create([
                'instruments_played' => $validated['instruments_played'],
                'music_schools' => $validated['music_schools'] ?? null,
                'experience_years' => $validated['experience_years'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'is_active' => true,
            ]);

            \Log::info('Nuevo profesor registrado', [
                'teacher_id' => $teacher->id,
                'email' => $teacher->email,
            ]);

            return redirect()->route('registro-profesor.confirmacion', ['teacher' => $teacher->id]);

        } catch (\Exception $e) {
            \Log::error('Error al registrar profesor:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->with('error', 'Ocurrió un error al procesar el registro. Por favor intenta nuevamente.')
                ->withInput($request->except('password', 'password_confirmation'));
        }
    }

    /**
     * Mostrar página de confirmación
     */
    public function confirmation(User $teacher)
    {
        // Verificar que el usuario tiene rol de profesor
        if (! $teacher->hasRole('Profesor')) {
            abort(404);
        }

        return Inertia::render('TeacherRegistration/Confirmation', [
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'last_name' => $teacher->last_name,
                'email' => $teacher->email,
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class DependentController extends Controller
{
    /**
     * Mostrar lista de dependientes del responsable actual
     */
    public function index()
    {
        $user = auth()->user();

        $dependents = $user->dependents()
            ->with(['programEnrollments.academicProgram', 'payments'])
            ->get()
            ->map(function ($dependent) {
                return [
                    'id' => $dependent->id,
                    'name' => $dependent->name,
                    'email' => $dependent->email,
                    'phone' => $dependent->phone,
                    'document_type' => $dependent->document_type,
                    'document_number' => $dependent->document_number,
                    'birth_date' => $dependent->birth_date?->format('Y-m-d'),
                    'age' => $dependent->birth_date?->age,
                    'address' => $dependent->address,
                    'enrollments_count' => $dependent->programEnrollments->count(),
                    'pending_payments' => $dependent->payments()->where('status', 'pending')->count(),
                ];
            });

        return Inertia::render('Dependents/Index', [
            'dependents' => $dependents,
        ]);
    }

    /**
     * Mostrar formulario para crear dependiente
     */
    public function create()
    {
        return Inertia::render('Dependents/Create');
    }

    /**
     * Guardar nuevo dependiente
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'document_type' => ['required', Rule::in(['CC', 'TI', 'CE', 'Pasaporte'])],
            'document_number' => ['required', 'string', 'max:50', 'unique:users,document_number'],
            'birth_date' => ['required', 'date', 'before:today'],
            'address' => ['nullable', 'string'],
            'create_account' => ['boolean'], // Si se crea cuenta de acceso
            'password' => ['nullable', 'required_if:create_account,true', 'min:8', 'confirmed'],
        ], [
            'name.required' => 'El nombre es obligatorio',
            'document_type.required' => 'El tipo de documento es obligatorio',
            'document_number.required' => 'El número de documento es obligatorio',
            'document_number.unique' => 'Este número de documento ya está registrado',
            'birth_date.required' => 'La fecha de nacimiento es obligatoria',
            'birth_date.before' => 'La fecha de nacimiento debe ser anterior a hoy',
            'email.unique' => 'Este correo electrónico ya está registrado',
        ]);

        $dependent = User::create([
            'name' => $validated['name'],
            'email' => $request->filled('email') ? $validated['email'] : null,
            'password' => $request->filled('password') ? Hash::make($validated['password']) : null,
            'phone' => $validated['phone'],
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'],
            'birth_date' => $validated['birth_date'],
            'address' => $validated['address'],
            'parent_id' => $user->id, // Asignar responsable
        ]);

        // Asignar rol Estudiante por defecto
        $dependent->assignRole('Estudiante');

        flash_success('Dependiente creado exitosamente');

        return redirect()->route('dependientes.index');
    }

    /**
     * Mostrar formulario para editar dependiente
     */
    public function edit(User $dependent)
    {
        $user = auth()->user();

        // Verificar que sea su dependiente
        if ($dependent->parent_id !== $user->id && !$user->hasRole('Admin')) {
            abort(403, 'No tienes permiso para editar este dependiente');
        }

        return Inertia::render('Dependents/Edit', [
            'dependent' => [
                'id' => $dependent->id,
                'name' => $dependent->name,
                'email' => $dependent->email,
                'phone' => $dependent->phone,
                'document_type' => $dependent->document_type,
                'document_number' => $dependent->document_number,
                'birth_date' => $dependent->birth_date?->format('Y-m-d'),
                'address' => $dependent->address,
                'has_account' => !is_null($dependent->email) && !is_null($dependent->password),
            ],
        ]);
    }

    /**
     * Actualizar dependiente
     */
    public function update(Request $request, User $dependent)
    {
        $user = auth()->user();

        // Verificar que sea su dependiente
        if ($dependent->parent_id !== $user->id && !$user->hasRole('Admin')) {
            abort(403, 'No tienes permiso para editar este dependiente');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', Rule::unique('users')->ignore($dependent->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'document_type' => ['required', Rule::in(['CC', 'TI', 'CE', 'Pasaporte'])],
            'document_number' => ['required', 'string', 'max:50', Rule::unique('users')->ignore($dependent->id)],
            'birth_date' => ['required', 'date', 'before:today'],
            'address' => ['nullable', 'string'],
            'update_password' => ['boolean'],
            'password' => ['nullable', 'required_if:update_password,true', 'min:8', 'confirmed'],
        ], [
            'name.required' => 'El nombre es obligatorio',
            'document_type.required' => 'El tipo de documento es obligatorio',
            'document_number.required' => 'El número de documento es obligatorio',
            'document_number.unique' => 'Este número de documento ya está registrado',
            'birth_date.required' => 'La fecha de nacimiento es obligatoria',
            'email.unique' => 'Este correo electrónico ya está registrado',
        ]);

        $dependent->update([
            'name' => $validated['name'],
            'email' => $request->filled('email') ? $validated['email'] : null,
            'phone' => $validated['phone'],
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'],
            'birth_date' => $validated['birth_date'],
            'address' => $validated['address'],
        ]);

        // Actualizar contraseña si se proporciona
        if ($request->filled('password')) {
            $dependent->update(['password' => Hash::make($validated['password'])]);
        }

        flash_success('Dependiente actualizado exitosamente');

        return redirect()->route('dependientes.index');
    }

    /**
     * Eliminar dependiente
     */
    public function destroy(User $dependent)
    {
        $user = auth()->user();

        // Verificar que sea su dependiente
        if ($dependent->parent_id !== $user->id && !$user->hasRole('Admin')) {
            abort(403, 'No tienes permiso para eliminar este dependiente');
        }

        // Verificar que no tenga inscripciones activas
        $activeEnrollments = $dependent->programEnrollments()
            ->whereIn('status', ['active', 'waiting'])
            ->count();

        if ($activeEnrollments > 0) {
            flash_error('No se puede eliminar el dependiente porque tiene inscripciones activas');
            return redirect()->back();
        }

        // Verificar que no tenga pagos pendientes
        $pendingPayments = $dependent->payments()
            ->where('status', 'pending')
            ->count();

        if ($pendingPayments > 0) {
            flash_error('No se puede eliminar el dependiente porque tiene pagos pendientes');
            return redirect()->back();
        }

        $dependent->delete();

        flash_success('Dependiente eliminado exitosamente');

        return redirect()->route('dependientes.index');
    }

    /**
     * Ver detalle de un dependiente con sus inscripciones y pagos
     */
    public function show(User $dependent)
    {
        $user = auth()->user();

        // Verificar que sea su dependiente
        if ($dependent->parent_id !== $user->id && !$user->hasRole('Admin')) {
            abort(403, 'No tienes permiso para ver este dependiente');
        }

        $dependent->load([
            'programEnrollments.academicProgram',
            'payments' => function ($query) {
                $query->latest()->take(10);
            },
            'attendances' => function ($query) {
                $query->latest()->take(20);
            },
        ]);

        return Inertia::render('Dependents/Show', [
            'dependent' => [
                'id' => $dependent->id,
                'name' => $dependent->name,
                'email' => $dependent->email,
                'phone' => $dependent->phone,
                'document_type' => $dependent->document_type,
                'document_number' => $dependent->document_number,
                'birth_date' => $dependent->birth_date?->format('Y-m-d'),
                'age' => $dependent->birth_date?->age,
                'address' => $dependent->address,
            ],
            'enrollments' => $dependent->programEnrollments,
            'payments' => $dependent->payments,
            'attendances' => $dependent->attendances,
        ]);
    }
}

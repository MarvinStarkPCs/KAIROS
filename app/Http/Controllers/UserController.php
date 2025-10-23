<?php

namespace App\Http\Controllers;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Mostrar lista de usuarios
     */
    public function index()
    {
        $users = User::with('roles')->get();
        
        return Inertia::render('Security/Users/Index', [
            'users' => $users->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'roles' => $user->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                ])->toArray(),
                'created_at' => $user->created_at->toIso8601String(),
            ]),
        ]);
    }

    /**
     * Mostrar formulario para crear usuario
     */
    public function create()
    {
        $roles = Role::all()->map(fn($role) => [
            'id' => $role->id,
            'name' => $role->name,
        ]);

        return Inertia::render('Security/Users/Create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Guardar nuevo usuario
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'roles' => 'array',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        if ($validated['roles'] ?? []) {
            $user->syncRoles($validated['roles']);
        }

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario creado exitosamente');
    }

    /**
     * Mostrar formulario para editar usuario
     */
    public function edit(User $user)
    {
        $roles = Role::all()->map(fn($role) => [
            'id' => $role->id,
            'name' => $role->name,
            'assigned' => $user->hasRole($role->name),
        ]);

        return Inertia::render('Security/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'roles' => $roles,
        ]);
    }

    /**
     * Actualizar usuario
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'roles' => 'array',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($validated['password'] ?? null) {
            $user->update([
                'password' => bcrypt($validated['password']),
            ]);
        }

        if ($validated['roles'] ?? []) {
            $user->syncRoles($validated['roles']);
        }

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado exitosamente');
    }

    /**
     * Eliminar usuario
     */
    public function destroy(User $user)
    {
        // No permitir eliminar el usuario autenticado
        if ($user->id === auth()->id()) {
            return back()->with('error', 'No puedes eliminar tu propio usuario');
        }

        $user->delete();
        
        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario eliminado exitosamente');
    }
}
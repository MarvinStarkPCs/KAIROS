<?php

namespace App\Http\Controllers;

use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        
        return Inertia::render('Security/Roles/Index', [
            'roles' => $roles->map(fn($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
                'users_count' => $role->users()->count(),
            ]),
        ]);
    }
    public function create()
    {
        $permissions = Permission::all()->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
        ]);

        return Inertia::render('Security/Roles/Create', [
            'permissions' => $permissions,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles',
            'permissions' => 'array',
        ]);

        $role = Role::create(['name' => $validated['name']]);
        
        if (!empty($validated['permissions'])) {
            $role->givePermissionTo($validated['permissions']);
        }

        return redirect()->route('roles.index')->with('success', 'Rol creado exitosamente');
    }
    public function edit(Role $role)
    {
        $permissions = Permission::all()->map(fn($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'assigned' => $role->hasPermissionTo($p->name),
        ]);

        return Inertia::render('Security/Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'array',
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('roles.index')->with('success', 'Rol actualizado exitosamente');
    }
    public function destroy(Role $role)
    {
        if ($role->name === 'Administrador') {
            return back()->with('error', 'No puedes eliminar el rol Administrador');
        }

        $role->delete();
        return redirect()->route('roles.index')->with('success', 'Rol eliminado exitosamente');
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar caché de permisos
        app()[\Spatie\Permission\Models\Permission::class]->forgetCachedPermissions();

        // Crear Permisos
        $permissions = [
            // Permisos de Estudiantes
            'ver_estudiantes',
            'crear_estudiante',
            'editar_estudiante',
            'eliminar_estudiante',

            // Permisos de Profesores
            'ver_profesores',
            'crear_profesor',
            'editar_profesor',
            'eliminar_profesor',

            // Permisos de Pagos
            'ver_pagos',
            'crear_pago',
            'editar_pago',
            'eliminar_pago',

            // Permisos de Roles
            'ver_roles',
            'crear_rol',
            'editar_rol',
            'eliminar_rol',

            // Permisos de Usuarios
            'ver_usuarios',
            'crear_usuario',
            'editar_usuario',
            'eliminar_usuario',

            // Permisos de Auditoría
            'ver_auditoria',

            // Permisos generales
            'ver_dashboard',
            'ver_horarios',
            'ver_asistencia',
            'ver_comunicacion',
            'ver_reportes',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'web']);
        }

        // Crear Roles
        $adminRole = Role::create(['name' => 'Administrador', 'guard_name' => 'web']);
        $profesorRole = Role::create(['name' => 'Profesor', 'guard_name' => 'web']);
        $estudianteRole = Role::create(['name' => 'Estudiante', 'guard_name' => 'web']);

        // Asignar todos los permisos al Administrador
        $adminRole->givePermissionTo(Permission::all());

        // Permisos del Profesor
        $profesorPermissions = [
            'ver_estudiantes',
            'ver_profesores',
            'ver_horarios',
            'ver_asistencia',
            'ver_comunicacion',
            'ver_reportes',
        ];
        $profesorRole->givePermissionTo($profesorPermissions);

        // Permisos del Estudiante
        $estudiantePermissions = [
            'ver_dashboard',
            'ver_horarios',
            'ver_asistencia',
            'ver_comunicacion',
        ];
        $estudianteRole->givePermissionTo($estudiantePermissions);
    }
}
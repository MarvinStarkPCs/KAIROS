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

            // Permisos de Programas Académicos
            'ver_programas',
            'crear_programa',
            'editar_programa',
            'eliminar_programa',

            // Permisos de Horarios
            'ver_horarios',
            'crear_horario',
            'editar_horario',
            'eliminar_horario',
            'asignar_profesor_horario',
            'inscribir_estudiante_horario',

            // Permisos de Asistencia
            'ver_asistencia',
            'registrar_asistencia',
            'editar_asistencia',
            'eliminar_asistencia',

            // Permisos de Pagos
            'ver_pagos',
            'crear_pago',
            'editar_pago',
            'eliminar_pago',
            'procesar_pago',

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

            // Permisos de Progreso Académico
            'ver_progreso',
            'registrar_progreso',
            'editar_progreso',

            // Permisos generales
            'ver_dashboard',
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
            'ver_programas',
            'ver_horarios',
            'ver_asistencia',
            'registrar_asistencia',
            'editar_asistencia',
            'ver_progreso',
            'registrar_progreso',
            'editar_progreso',
            'ver_comunicacion',
            'ver_reportes',
            'ver_dashboard',
        ];
        $profesorRole->givePermissionTo($profesorPermissions);

        // Permisos del Estudiante
        $estudiantePermissions = [
            'ver_dashboard',
            'ver_programas',
            'ver_horarios',
            'inscribir_estudiante_horario',
            'ver_asistencia',
            'ver_pagos',
            'ver_progreso',
            'ver_comunicacion',
        ];
        $estudianteRole->givePermissionTo($estudiantePermissions);
    }
}
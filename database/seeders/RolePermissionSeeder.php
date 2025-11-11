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

            // Permisos de Planes de Estudio
            'crear_plan_estudio',
            'editar_plan_estudio',
            'eliminar_plan_estudio',
            'crear_actividad',
            'editar_actividad',
            'eliminar_actividad',
            'crear_criterio_evaluacion',
            'editar_criterio_evaluacion',
            'eliminar_criterio_evaluacion',

            // Permisos de Inscripciones
            'ver_inscripciones',
            'crear_inscripcion',
            'editar_inscripcion',
            'eliminar_inscripcion',
            'cambiar_estado_inscripcion',

            // Permisos de Horarios
            'ver_horarios',
            'crear_horario',
            'editar_horario',
            'eliminar_horario',
            'inscribir_estudiante_horario',
            'desinscribir_estudiante_horario',

            // Permisos de Asistencia
            'ver_asistencia',
            'registrar_asistencia',
            'editar_asistencia',
            'eliminar_asistencia',
            'ver_asistencia_propia', // Para profesores ver solo sus grupos

            // Permisos de Evaluaciones
            'ver_evaluaciones',
            'crear_evaluacion',
            'editar_evaluacion',
            'eliminar_evaluacion',

            // Permisos de Pagos
            'ver_pagos',
            'crear_pago',
            'editar_pago',
            'eliminar_pago',
            'procesar_pago',
            'generar_factura',

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

            // Permisos del Portal de Profesores
            'ver_mis_grupos',
            'marcar_asistencia_grupo',
            'evaluar_estudiantes',

            // Permisos generales
            'ver_dashboard',
            'ver_comunicacion',
            'ver_reportes',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web']
            );
        }

        // Crear Roles si no existen
        $adminRole = Role::firstOrCreate(['name' => 'Administrador', 'guard_name' => 'web']);
        $profesorRole = Role::firstOrCreate(['name' => 'Profesor', 'guard_name' => 'web']);
        $estudianteRole = Role::firstOrCreate(['name' => 'Estudiante', 'guard_name' => 'web']);

        // Sincronizar todos los permisos al Administrador
        $adminRole->syncPermissions(Permission::all());

        // Permisos del Profesor
        $profesorPermissions = [
            'ver_dashboard',
            'ver_mis_grupos',
            'marcar_asistencia_grupo',
            'ver_asistencia_propia',
            'evaluar_estudiantes',
            'crear_evaluacion',
            'ver_evaluaciones',
            'ver_comunicacion',
            'ver_reportes',
        ];
        $profesorRole->syncPermissions($profesorPermissions);

        // Permisos del Estudiante
        $estudiantePermissions = [
            'ver_dashboard',
            'ver_programas',
            'ver_horarios',
            'ver_asistencia',
            'ver_pagos',
            'ver_comunicacion',
        ];
        $estudianteRole->syncPermissions($estudiantePermissions);
    }
}
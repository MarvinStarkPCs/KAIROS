<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Migra los datos de perfil existentes de la tabla users a las nuevas tablas de perfil.
     */
    public function up(): void
    {
        // Migrar datos de estudiantes
        $students = DB::table('users')
            ->join('model_has_roles', function ($join) {
                $join->on('users.id', '=', 'model_has_roles.model_id')
                    ->where('model_has_roles.model_type', '=', 'App\\Models\\User');
            })
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'Estudiante')
            ->select('users.*')
            ->get();

        foreach ($students as $student) {
            // Verificar si ya existe un perfil para evitar duplicados
            $exists = DB::table('student_profiles')->where('user_id', $student->id)->exists();

            if (!$exists) {
                DB::table('student_profiles')->insert([
                    'user_id' => $student->id,
                    'modality' => $student->modality,
                    'desired_instrument' => $student->desired_instrument,
                    'plays_instrument' => $student->plays_instrument ?? false,
                    'instruments_played' => $student->instruments_played,
                    'has_music_studies' => $student->has_music_studies ?? false,
                    'music_schools' => $student->music_schools,
                    'current_level' => $student->current_level,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Migrar datos de profesores
        $teachers = DB::table('users')
            ->join('model_has_roles', function ($join) {
                $join->on('users.id', '=', 'model_has_roles.model_id')
                    ->where('model_has_roles.model_type', '=', 'App\\Models\\User');
            })
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->where('roles.name', 'Profesor')
            ->select('users.*')
            ->get();

        foreach ($teachers as $teacher) {
            // Verificar si ya existe un perfil para evitar duplicados
            $exists = DB::table('teacher_profiles')->where('user_id', $teacher->id)->exists();

            if (!$exists && $teacher->instruments_played) {
                DB::table('teacher_profiles')->insert([
                    'user_id' => $teacher->id,
                    'instruments_played' => $teacher->instruments_played,
                    'music_schools' => $teacher->music_schools,
                    'experience_years' => null, // No existe en la tabla actual
                    'bio' => null, // No existe en la tabla actual
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Los datos se perderán al hacer rollback de las tablas de perfil
        // No es necesario revertir aquí ya que las migraciones anteriores
        // eliminan las tablas completas
    }
};

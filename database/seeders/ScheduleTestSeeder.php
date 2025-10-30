<?php

namespace Database\Seeders;

use App\Models\AcademicProgram;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ScheduleTestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear 3 profesores de prueba
        $profesores = [];
        for ($i = 1; $i <= 3; $i++) {
            $profesor = User::create([
                'name' => "Profesor $i",
                'email' => "profesor$i@kairos.edu",
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $profesor->assignRole('Profesor');
            $profesores[] = $profesor;
        }

        // Crear 10 estudiantes de prueba
        $estudiantes = [];
        for ($i = 1; $i <= 10; $i++) {
            $estudiante = User::create([
                'name' => "Estudiante $i",
                'email' => "estudiante$i@kairos.edu",
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            $estudiante->assignRole('Estudiante');
            $estudiantes[] = $estudiante;
        }

        // Obtener programas académicos existentes
        $programs = AcademicProgram::where('status', 'active')->get();

        if ($programs->isEmpty()) {
            $this->command->warn('No hay programas académicos activos. Creando uno...');
            $program = AcademicProgram::create([
                'name' => 'Programa de Prueba',
                'description' => 'Programa académico para pruebas',
                'duration' => 4,
                'status' => 'active',
            ]);
            $programs = collect([$program]);
        }

        // Crear horarios de prueba
        $daysOfWeek = ['lunes,miércoles,viernes', 'martes,jueves', 'lunes,miércoles', 'martes,jueves,viernes'];
        $times = [
            ['start' => '08:00', 'end' => '10:00'],
            ['start' => '10:00', 'end' => '12:00'],
            ['start' => '14:00', 'end' => '16:00'],
            ['start' => '16:00', 'end' => '18:00'],
        ];
        $classrooms = ['Aula 101', 'Aula 102', 'Aula 201', 'Aula 202', 'Laboratorio 1'];

        $scheduleNames = [
            'Matemáticas - Grupo A',
            'Física - Grupo B',
            'Química - Grupo A',
            'Programación - Grupo B',
            'Inglés - Grupo C',
            'Historia - Grupo A',
            'Biología - Grupo B',
            'Literatura - Grupo A',
        ];

        foreach ($scheduleNames as $index => $name) {
            $time = $times[$index % count($times)];
            $program = $programs->random();
            $profesor = $profesores[array_rand($profesores)];

            Schedule::create([
                'academic_program_id' => $program->id,
                'professor_id' => $profesor->id,
                'name' => $name,
                'description' => "Curso de $name para el semestre actual",
                'days_of_week' => $daysOfWeek[$index % count($daysOfWeek)],
                'start_time' => $time['start'],
                'end_time' => $time['end'],
                'classroom' => $classrooms[array_rand($classrooms)],
                'semester' => '2025-1',
                'max_students' => rand(20, 40),
                'status' => 'active',
            ]);
        }

        $this->command->info('✓ Creados 3 profesores');
        $this->command->info('✓ Creados 10 estudiantes');
        $this->command->info('✓ Creados ' . count($scheduleNames) . ' horarios');
        $this->command->info("\nCredenciales de prueba:");
        $this->command->info("Profesores: profesor1@kairos.edu, profesor2@kairos.edu, profesor3@kairos.edu");
        $this->command->info("Estudiantes: estudiante1@kairos.edu, estudiante2@kairos.edu, ..., estudiante10@kairos.edu");
        $this->command->info("Password para todos: password");
    }
}

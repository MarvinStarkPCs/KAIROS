<?php

namespace Database\Seeders;

use App\Models\AcademicProgram;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $profesores = User::role('Profesor')->get();

        if ($profesores->isEmpty()) {
            $this->command->warn('No hay profesores. Ejecuta TeacherSeeder primero.');
            return;
        }

        $programs = AcademicProgram::where('status', 'active')->get();

        if ($programs->isEmpty()) {
            $this->command->warn('No hay programas activos. Ejecuta MusicAcademicProgramSeeder primero.');
            return;
        }

        $scheduleData = [
            // Guitarra Clásica
            [
                'program' => 'Guitarra Clásica',
                'schedules' => [
                    ['name' => 'Guitarra Clásica - Grupo A', 'days' => 'lunes,miércoles', 'start' => '08:00', 'end' => '10:00', 'classroom' => 'Aula 101', 'max' => 15],
                    ['name' => 'Guitarra Clásica - Grupo B', 'days' => 'martes,jueves', 'start' => '10:00', 'end' => '12:00', 'classroom' => 'Aula 101', 'max' => 15],
                    ['name' => 'Guitarra Clásica - Grupo C (Tarde)', 'days' => 'lunes,miércoles,viernes', 'start' => '14:00', 'end' => '16:00', 'classroom' => 'Aula 102', 'max' => 12],
                ],
            ],
            // Piano
            [
                'program' => 'Piano',
                'schedules' => [
                    ['name' => 'Piano - Grupo A', 'days' => 'lunes,miércoles', 'start' => '10:00', 'end' => '12:00', 'classroom' => 'Sala de Piano 1', 'max' => 10],
                    ['name' => 'Piano - Grupo B', 'days' => 'martes,jueves', 'start' => '08:00', 'end' => '10:00', 'classroom' => 'Sala de Piano 1', 'max' => 10],
                    ['name' => 'Piano - Grupo C (Tarde)', 'days' => 'martes,jueves', 'start' => '16:00', 'end' => '18:00', 'classroom' => 'Sala de Piano 2', 'max' => 8],
                ],
            ],
            // Canto Lírico
            [
                'program' => 'Canto Lírico',
                'schedules' => [
                    ['name' => 'Canto Lírico - Grupo A', 'days' => 'lunes,miércoles,viernes', 'start' => '08:00', 'end' => '10:00', 'classroom' => 'Auditorio', 'max' => 20],
                    ['name' => 'Canto Lírico - Grupo B', 'days' => 'martes,jueves', 'start' => '14:00', 'end' => '16:00', 'classroom' => 'Auditorio', 'max' => 20],
                ],
            ],
            // Producción Musical Digital
            [
                'program' => 'Producción Musical Digital',
                'schedules' => [
                    ['name' => 'Producción Musical - Grupo A', 'days' => 'lunes,miércoles', 'start' => '16:00', 'end' => '18:00', 'classroom' => 'Lab. Producción', 'max' => 12],
                    ['name' => 'Producción Musical - Grupo B', 'days' => 'viernes', 'start' => '08:00', 'end' => '12:00', 'classroom' => 'Lab. Producción', 'max' => 12],
                    ['name' => 'Producción Musical - Sábado', 'days' => 'sábado', 'start' => '09:00', 'end' => '13:00', 'classroom' => 'Lab. Producción', 'max' => 15],
                ],
            ],
            // Teoría Musical y Armonía
            [
                'program' => 'Teoría Musical y Armonía',
                'schedules' => [
                    ['name' => 'Teoría Musical - Grupo A', 'days' => 'martes,jueves', 'start' => '10:00', 'end' => '12:00', 'classroom' => 'Aula 201', 'max' => 25],
                    ['name' => 'Teoría Musical - Grupo B', 'days' => 'lunes,miércoles', 'start' => '14:00', 'end' => '16:00', 'classroom' => 'Aula 201', 'max' => 25],
                    ['name' => 'Teoría Musical - Sábado', 'days' => 'sábado', 'start' => '10:00', 'end' => '14:00', 'classroom' => 'Aula 202', 'max' => 30],
                ],
            ],
        ];

        $totalCreated = 0;
        $profIndex = 0;

        foreach ($scheduleData as $data) {
            $program = $programs->firstWhere('name', $data['program']);

            if (!$program) {
                $this->command->warn("Programa '{$data['program']}' no encontrado, saltando...");
                continue;
            }

            foreach ($data['schedules'] as $schedule) {
                $profesor = $profesores[$profIndex % $profesores->count()];
                $profIndex++;

                Schedule::firstOrCreate(
                    [
                        'academic_program_id' => $program->id,
                        'name' => $schedule['name'],
                    ],
                    [
                        'professor_id' => $profesor->id,
                        'description' => "Clase de {$data['program']} - {$schedule['days']}",
                        'days_of_week' => $schedule['days'],
                        'start_time' => $schedule['start'],
                        'end_time' => $schedule['end'],
                        'classroom' => $schedule['classroom'],
                        'semester' => '2025-1',
                        'max_students' => $schedule['max'],
                        'status' => 'active',
                    ]
                );

                $totalCreated++;
            }
        }

        $this->command->info("✓ {$totalCreated} horarios creados exitosamente");
    }
}

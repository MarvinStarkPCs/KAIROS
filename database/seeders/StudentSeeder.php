<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modalities = ['Linaje Kids', 'Linaje Teens', 'Linaje Big'];
        $instruments = ['Piano', 'Guitarra', 'Violín', 'Batería', 'Canto', 'Saxofón', 'Flauta', 'Bajo'];

        $students = [
            [
                'user' => [
                    'name' => 'María García López',
                    'email' => 'maria.garcia@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Piano',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Juan Carlos Rodríguez',
                    'email' => 'juan.rodriguez@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Guitarra',
                    'plays_instrument' => true,
                    'instruments_played' => 'Guitarra básica',
                ],
            ],
            [
                'user' => [
                    'name' => 'Ana Sofía Martínez',
                    'email' => 'ana.martinez@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Teens',
                    'desired_instrument' => 'Violín',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Pedro José Fernández',
                    'email' => 'pedro.fernandez@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Batería',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Laura Isabel Torres',
                    'email' => 'laura.torres@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Teens',
                    'desired_instrument' => 'Canto',
                    'plays_instrument' => true,
                    'instruments_played' => 'Piano intermedio',
                    'has_music_studies' => true,
                    'music_schools' => 'Academia de Música Local',
                ],
            ],
            [
                'user' => [
                    'name' => 'Carlos Alberto Ramírez',
                    'email' => 'carlos.ramirez@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Saxofón',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Valentina Ruiz Sánchez',
                    'email' => 'valentina.ruiz@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Kids',
                    'desired_instrument' => 'Flauta',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Diego Alejandro Castro',
                    'email' => 'diego.castro@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Teens',
                    'desired_instrument' => 'Bajo',
                    'plays_instrument' => true,
                    'instruments_played' => 'Guitarra eléctrica',
                ],
            ],
            [
                'user' => [
                    'name' => 'Camila Andrea Morales',
                    'email' => 'camila.morales@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Piano',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Sebastián López Díaz',
                    'email' => 'sebastian.lopez@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Teens',
                    'desired_instrument' => 'Guitarra',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Isabella Gómez Pérez',
                    'email' => 'isabella.gomez@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Kids',
                    'desired_instrument' => 'Violín',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Mateo Hernández Vega',
                    'email' => 'mateo.hernandez@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Kids',
                    'desired_instrument' => 'Piano',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Sofía Daniela Vargas',
                    'email' => 'sofia.vargas@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Teens',
                    'desired_instrument' => 'Canto',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Andrés Felipe Medina',
                    'email' => 'andres.medina@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Batería',
                    'plays_instrument' => true,
                    'instruments_played' => 'Percusión básica',
                ],
            ],
            [
                'user' => [
                    'name' => 'Lucía Alejandra Reyes',
                    'email' => 'lucia.reyes@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Flauta',
                    'plays_instrument' => true,
                    'instruments_played' => 'Flauta dulce',
                    'has_music_studies' => true,
                    'music_schools' => 'Colegio con énfasis musical',
                ],
            ],
            [
                'user' => [
                    'name' => 'Santiago García Ortiz',
                    'email' => 'santiago.garcia@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Teens',
                    'desired_instrument' => 'Guitarra',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Martina Cruz Silva',
                    'email' => 'martina.cruz@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Kids',
                    'desired_instrument' => 'Piano',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Nicolás Ríos Herrera',
                    'email' => 'nicolas.rios@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Teens',
                    'desired_instrument' => 'Bajo',
                    'plays_instrument' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Valeria Mendoza Luna',
                    'email' => 'valeria.mendoza@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Canto',
                    'plays_instrument' => true,
                    'instruments_played' => 'Guitarra acústica',
                ],
            ],
            [
                'user' => [
                    'name' => 'Daniel Eduardo Flores',
                    'email' => 'daniel.flores@estudiante.com',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Saxofón',
                    'plays_instrument' => false,
                ],
            ],
        ];

        foreach ($students as $studentData) {
            $student = User::firstOrCreate(
                ['email' => $studentData['user']['email']],
                [
                    'name' => $studentData['user']['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            // Asignar rol de Estudiante
            $student->assignRole('Estudiante');

            // Crear perfil de estudiante
            $student->studentProfile()->firstOrCreate(
                ['user_id' => $student->id],
                $studentData['profile']
            );
        }

        $this->command->info('✓ ' . count($students) . ' estudiantes con perfiles creados exitosamente');
    }
}

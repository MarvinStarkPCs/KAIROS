<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TeacherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teachers = [
            [
                'name' => 'Prof. Roberto Carlos Delgado',
                'email' => 'roberto.delgado@profesor.com',
            ],
            [
                'name' => 'Prof. Patricia Jiménez Mora',
                'email' => 'patricia.jimenez@profesor.com',
            ],
            [
                'name' => 'Mtro. Fernando Alvarado',
                'email' => 'fernando.alvarado@profesor.com',
            ],
            [
                'name' => 'Mtra. Gabriela Romero Santos',
                'email' => 'gabriela.romero@profesor.com',
            ],
            [
                'name' => 'Prof. Miguel Ángel Gutiérrez',
                'email' => 'miguel.gutierrez@profesor.com',
            ],
            [
                'name' => 'Mtra. Carmen Beatriz Navarro',
                'email' => 'carmen.navarro@profesor.com',
            ],
            [
                'name' => 'Prof. Javier Alejandro Mendoza',
                'email' => 'javier.mendoza@profesor.com',
            ],
            [
                'name' => 'Mtra. Elena Victoria Castro',
                'email' => 'elena.castro@profesor.com',
            ],
            [
                'name' => 'Prof. Ricardo Montes de Oca',
                'email' => 'ricardo.montes@profesor.com',
            ],
            [
                'name' => 'Mtra. Adriana Solís Márquez',
                'email' => 'adriana.solis@profesor.com',
            ],
        ];

        foreach ($teachers as $teacherData) {
            $teacher = User::firstOrCreate(
                ['email' => $teacherData['email']],
                [
                    'name' => $teacherData['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            // Asignar rol de Profesor
            $teacher->assignRole('Profesor');
        }

        $this->command->info('✓ ' . count($teachers) . ' profesores creados exitosamente');
    }
}

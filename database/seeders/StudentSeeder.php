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
        $students = [
            [
                'name' => 'María García López',
                'email' => 'maria.garcia@estudiante.com',
            ],
            [
                'name' => 'Juan Carlos Rodríguez',
                'email' => 'juan.rodriguez@estudiante.com',
            ],
            [
                'name' => 'Ana Sofía Martínez',
                'email' => 'ana.martinez@estudiante.com',
            ],
            [
                'name' => 'Pedro José Fernández',
                'email' => 'pedro.fernandez@estudiante.com',
            ],
            [
                'name' => 'Laura Isabel Torres',
                'email' => 'laura.torres@estudiante.com',
            ],
            [
                'name' => 'Carlos Alberto Ramírez',
                'email' => 'carlos.ramirez@estudiante.com',
            ],
            [
                'name' => 'Valentina Ruiz Sánchez',
                'email' => 'valentina.ruiz@estudiante.com',
            ],
            [
                'name' => 'Diego Alejandro Castro',
                'email' => 'diego.castro@estudiante.com',
            ],
            [
                'name' => 'Camila Andrea Morales',
                'email' => 'camila.morales@estudiante.com',
            ],
            [
                'name' => 'Sebastián López Díaz',
                'email' => 'sebastian.lopez@estudiante.com',
            ],
            [
                'name' => 'Isabella Gómez Pérez',
                'email' => 'isabella.gomez@estudiante.com',
            ],
            [
                'name' => 'Mateo Hernández Vega',
                'email' => 'mateo.hernandez@estudiante.com',
            ],
            [
                'name' => 'Sofía Daniela Vargas',
                'email' => 'sofia.vargas@estudiante.com',
            ],
            [
                'name' => 'Andrés Felipe Medina',
                'email' => 'andres.medina@estudiante.com',
            ],
            [
                'name' => 'Lucía Alejandra Reyes',
                'email' => 'lucia.reyes@estudiante.com',
            ],
            [
                'name' => 'Santiago García Ortiz',
                'email' => 'santiago.garcia@estudiante.com',
            ],
            [
                'name' => 'Martina Cruz Silva',
                'email' => 'martina.cruz@estudiante.com',
            ],
            [
                'name' => 'Nicolás Ríos Herrera',
                'email' => 'nicolas.rios@estudiante.com',
            ],
            [
                'name' => 'Valeria Mendoza Luna',
                'email' => 'valeria.mendoza@estudiante.com',
            ],
            [
                'name' => 'Daniel Eduardo Flores',
                'email' => 'daniel.flores@estudiante.com',
            ],
        ];

        foreach ($students as $studentData) {
            $student = User::firstOrCreate(
                ['email' => $studentData['email']],
                [
                    'name' => $studentData['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            // Asignar rol de Estudiante
            $student->assignRole('Estudiante');
        }

        $this->command->info('✓ ' . count($students) . ' estudiantes creados exitosamente');
    }
}

<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@kairos.com'],
            [
                'name' => 'Admin KAIROS',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'phone' => '3001234567',
                'document_type' => 'CC',
                'document_number' => '1000000000',
                'birth_date' => Carbon::parse('1985-01-15'),
                'address' => 'Calle Principal #123',
            ]
        );
        $admin->assignRole('Administrador');

        // Profesores
        $profesores = [
            [
                'name' => 'María García',
                'email' => 'maria.garcia@kairos.com',
                'phone' => '3101234567',
                'document_type' => 'CC',
                'document_number' => '1000000001',
                'birth_date' => Carbon::parse('1990-03-20'),
                'address' => 'Av. Música #45',
            ],
            [
                'name' => 'Carlos Rodríguez',
                'email' => 'carlos.rodriguez@kairos.com',
                'phone' => '3201234567',
                'document_type' => 'CC',
                'document_number' => '1000000002',
                'birth_date' => Carbon::parse('1988-07-12'),
                'address' => 'Calle Armonía #78',
            ],
            [
                'name' => 'Ana Martínez',
                'email' => 'ana.martinez@kairos.com',
                'phone' => '3301234567',
                'document_type' => 'CC',
                'document_number' => '1000000003',
                'birth_date' => Carbon::parse('1992-11-05'),
                'address' => 'Carrera 10 #20-30',
            ],
            [
                'name' => 'Luis Hernández',
                'email' => 'luis.hernandez@kairos.com',
                'phone' => '3401234567',
                'document_type' => 'CC',
                'document_number' => '1000000004',
                'birth_date' => Carbon::parse('1987-05-25'),
                'address' => 'Av. Central #90',
            ],
        ];

        foreach ($profesores as $profesorData) {
            $profesor = User::firstOrCreate(
                ['email' => $profesorData['email']],
                array_merge($profesorData, [
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ])
            );
            $profesor->assignRole('Profesor');
        }

        // Responsables con sus dependientes
        $responsables = [
            [
                'responsable' => [
                    'name' => 'Juan Pérez',
                    'email' => 'juan.perez@gmail.com',
                    'phone' => '3501234567',
                    'document_type' => 'CC',
                    'document_number' => '2000000001',
                    'birth_date' => Carbon::parse('1980-04-10'),
                    'address' => 'Calle 50 #12-34',
                ],
                'dependientes' => [
                    [
                        'name' => 'Sofía Pérez',
                        'email' => null,
                        'phone' => null,
                        'document_type' => 'TI',
                        'document_number' => '3000000001',
                        'birth_date' => Carbon::parse('2012-08-15'),
                        'address' => 'Calle 50 #12-34',
                    ],
                    [
                        'name' => 'Mateo Pérez',
                        'email' => null,
                        'phone' => null,
                        'document_type' => 'TI',
                        'document_number' => '3000000002',
                        'birth_date' => Carbon::parse('2014-03-20'),
                        'address' => 'Calle 50 #12-34',
                    ],
                ],
            ],
            [
                'responsable' => [
                    'name' => 'Laura Gómez',
                    'email' => 'laura.gomez@gmail.com',
                    'phone' => '3601234567',
                    'document_type' => 'CC',
                    'document_number' => '2000000002',
                    'birth_date' => Carbon::parse('1982-09-22'),
                    'address' => 'Carrera 20 #45-67',
                ],
                'dependientes' => [
                    [
                        'name' => 'Valentina Gómez',
                        'email' => 'valentina.gomez@gmail.com',
                        'phone' => '3701234567',
                        'document_type' => 'TI',
                        'document_number' => '3000000003',
                        'birth_date' => Carbon::parse('2010-12-05'),
                        'address' => 'Carrera 20 #45-67',
                    ],
                ],
            ],
            [
                'responsable' => [
                    'name' => 'Roberto Silva',
                    'email' => 'roberto.silva@gmail.com',
                    'phone' => '3801234567',
                    'document_type' => 'CC',
                    'document_number' => '2000000003',
                    'birth_date' => Carbon::parse('1978-06-18'),
                    'address' => 'Av. Principal #100',
                ],
                'dependientes' => [
                    [
                        'name' => 'Santiago Silva',
                        'email' => null,
                        'phone' => null,
                        'document_type' => 'TI',
                        'document_number' => '3000000004',
                        'birth_date' => Carbon::parse('2011-05-10'),
                        'address' => 'Av. Principal #100',
                    ],
                    [
                        'name' => 'Isabella Silva',
                        'email' => null,
                        'phone' => null,
                        'document_type' => 'TI',
                        'document_number' => '3000000005',
                        'birth_date' => Carbon::parse('2013-09-25'),
                        'address' => 'Av. Principal #100',
                    ],
                ],
            ],
        ];

        foreach ($responsables as $data) {
            $responsable = User::firstOrCreate(
                ['email' => $data['responsable']['email']],
                array_merge($data['responsable'], [
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ])
            );
            $responsable->assignRole('Responsable');

            foreach ($data['dependientes'] as $dependienteData) {
                $dependiente = User::firstOrCreate(
                    ['document_number' => $dependienteData['document_number']],
                    array_merge($dependienteData, [
                        'password' => $dependienteData['email'] ? Hash::make('password') : null,
                        'email_verified_at' => $dependienteData['email'] ? now() : null,
                        'parent_id' => $responsable->id,
                    ])
                );
                $dependiente->assignRole('Estudiante');
            }
        }

        // Estudiantes independientes (mayores de edad)
        $estudiantesIndependientes = [
            [
                'name' => 'Camila Torres',
                'email' => 'camila.torres@gmail.com',
                'phone' => '3901234567',
                'document_type' => 'CC',
                'document_number' => '4000000001',
                'birth_date' => Carbon::parse('2000-02-14'),
                'address' => 'Calle 15 #30-45',
            ],
            [
                'name' => 'Daniel Morales',
                'email' => 'daniel.morales@gmail.com',
                'phone' => '3101234568',
                'document_type' => 'CC',
                'document_number' => '4000000002',
                'birth_date' => Carbon::parse('1999-07-30'),
                'address' => 'Carrera 5 #20-10',
            ],
            [
                'name' => 'Gabriela Ramírez',
                'email' => 'gabriela.ramirez@gmail.com',
                'phone' => '3201234568',
                'document_type' => 'CC',
                'document_number' => '4000000003',
                'birth_date' => Carbon::parse('2001-11-20'),
                'address' => 'Av. Libertad #55',
            ],
        ];

        foreach ($estudiantesIndependientes as $estudianteData) {
            $estudiante = User::firstOrCreate(
                ['email' => $estudianteData['email']],
                array_merge($estudianteData, [
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ])
            );
            $estudiante->assignRole('Estudiante');
        }

        $this->command->info('✅ Usuarios creados exitosamente');
        $this->command->info('   - 1 Administrador');
        $this->command->info('   - 4 Profesores');
        $this->command->info('   - 3 Responsables con 6 dependientes');
        $this->command->info('   - 3 Estudiantes independientes');
    }
}

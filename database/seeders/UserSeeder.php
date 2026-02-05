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
                'user' => [
                    'name' => 'María García',
                    'email' => 'maria.garcia@kairos.com',
                    'phone' => '3101234567',
                    'document_type' => 'CC',
                    'document_number' => '1000000001',
                    'birth_date' => Carbon::parse('1990-03-20'),
                    'address' => 'Av. Música #45',
                ],
                'profile' => [
                    'instruments_played' => 'Piano, Teclado',
                    'music_schools' => 'Conservatorio Nacional de Música',
                    'experience_years' => 8,
                    'bio' => 'Especialista en piano clásico y música contemporánea.',
                    'specialization' => 'Piano Clásico',
                ],
            ],
            [
                'user' => [
                    'name' => 'Carlos Rodríguez',
                    'email' => 'carlos.rodriguez@kairos.com',
                    'phone' => '3201234567',
                    'document_type' => 'CC',
                    'document_number' => '1000000002',
                    'birth_date' => Carbon::parse('1988-07-12'),
                    'address' => 'Calle Armonía #78',
                ],
                'profile' => [
                    'instruments_played' => 'Guitarra Acústica, Guitarra Eléctrica, Bajo',
                    'music_schools' => 'Escuela de Música Moderna',
                    'experience_years' => 12,
                    'bio' => 'Guitarrista profesional con experiencia en bandas y enseñanza.',
                    'specialization' => 'Guitarra y Bajo',
                ],
            ],
            [
                'user' => [
                    'name' => 'Ana Martínez',
                    'email' => 'ana.martinez@kairos.com',
                    'phone' => '3301234567',
                    'document_type' => 'CC',
                    'document_number' => '1000000003',
                    'birth_date' => Carbon::parse('1992-11-05'),
                    'address' => 'Carrera 10 #20-30',
                ],
                'profile' => [
                    'instruments_played' => 'Violín, Viola',
                    'music_schools' => 'Academia Filarmónica',
                    'experience_years' => 6,
                    'bio' => 'Violinista de orquesta sinfónica con pasión por la enseñanza.',
                    'specialization' => 'Cuerdas',
                ],
            ],
            [
                'user' => [
                    'name' => 'Luis Hernández',
                    'email' => 'luis.hernandez@kairos.com',
                    'phone' => '3401234567',
                    'document_type' => 'CC',
                    'document_number' => '1000000004',
                    'birth_date' => Carbon::parse('1987-05-25'),
                    'address' => 'Av. Central #90',
                ],
                'profile' => [
                    'instruments_played' => 'Batería, Percusión',
                    'music_schools' => 'Berklee College of Music (Online)',
                    'experience_years' => 15,
                    'bio' => 'Percusionista con amplia experiencia en jazz y rock.',
                    'specialization' => 'Percusión y Ritmo',
                ],
            ],
        ];

        foreach ($profesores as $profesorData) {
            $profesor = User::firstOrCreate(
                ['email' => $profesorData['user']['email']],
                array_merge($profesorData['user'], [
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ])
            );
            $profesor->assignRole('Profesor');

            // Crear perfil de profesor
            $profesor->teacherProfile()->firstOrCreate(
                ['user_id' => $profesor->id],
                $profesorData['profile']
            );
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
                        'user' => [
                            'name' => 'Sofía Pérez',
                            'email' => null,
                            'phone' => null,
                            'document_type' => 'TI',
                            'document_number' => '3000000001',
                            'birth_date' => Carbon::parse('2012-08-15'),
                            'address' => 'Calle 50 #12-34',
                        ],
                        'profile' => [
                            'modality' => 'Linaje Kids',
                            'desired_instrument' => 'Piano',
                            'plays_instrument' => false,
                        ],
                    ],
                    [
                        'user' => [
                            'name' => 'Mateo Pérez',
                            'email' => null,
                            'phone' => null,
                            'document_type' => 'TI',
                            'document_number' => '3000000002',
                            'birth_date' => Carbon::parse('2014-03-20'),
                            'address' => 'Calle 50 #12-34',
                        ],
                        'profile' => [
                            'modality' => 'Linaje Kids',
                            'desired_instrument' => 'Guitarra',
                            'plays_instrument' => false,
                        ],
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
                        'user' => [
                            'name' => 'Valentina Gómez',
                            'email' => 'valentina.gomez@gmail.com',
                            'phone' => '3701234567',
                            'document_type' => 'TI',
                            'document_number' => '3000000003',
                            'birth_date' => Carbon::parse('2010-12-05'),
                            'address' => 'Carrera 20 #45-67',
                        ],
                        'profile' => [
                            'modality' => 'Linaje Teens',
                            'desired_instrument' => 'Violín',
                            'plays_instrument' => true,
                            'instruments_played' => 'Flauta dulce',
                            'has_music_studies' => true,
                            'music_schools' => 'Escuela primaria',
                        ],
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
                        'user' => [
                            'name' => 'Santiago Silva',
                            'email' => null,
                            'phone' => null,
                            'document_type' => 'TI',
                            'document_number' => '3000000004',
                            'birth_date' => Carbon::parse('2011-05-10'),
                            'address' => 'Av. Principal #100',
                        ],
                        'profile' => [
                            'modality' => 'Linaje Teens',
                            'desired_instrument' => 'Batería',
                            'plays_instrument' => false,
                        ],
                    ],
                    [
                        'user' => [
                            'name' => 'Isabella Silva',
                            'email' => null,
                            'phone' => null,
                            'document_type' => 'TI',
                            'document_number' => '3000000005',
                            'birth_date' => Carbon::parse('2013-09-25'),
                            'address' => 'Av. Principal #100',
                        ],
                        'profile' => [
                            'modality' => 'Linaje Kids',
                            'desired_instrument' => 'Piano',
                            'plays_instrument' => false,
                        ],
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
                    ['document_number' => $dependienteData['user']['document_number']],
                    array_merge($dependienteData['user'], [
                        'password' => $dependienteData['user']['email'] ? Hash::make('password') : null,
                        'email_verified_at' => $dependienteData['user']['email'] ? now() : null,
                        'parent_id' => $responsable->id,
                    ])
                );
                $dependiente->assignRole('Estudiante');

                // Crear perfil de estudiante
                $dependiente->studentProfile()->firstOrCreate(
                    ['user_id' => $dependiente->id],
                    $dependienteData['profile']
                );
            }
        }

        // Estudiantes independientes (mayores de edad)
        $estudiantesIndependientes = [
            [
                'user' => [
                    'name' => 'Camila Torres',
                    'email' => 'camila.torres@gmail.com',
                    'phone' => '3901234567',
                    'document_type' => 'CC',
                    'document_number' => '4000000001',
                    'birth_date' => Carbon::parse('2000-02-14'),
                    'address' => 'Calle 15 #30-45',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Canto',
                    'plays_instrument' => true,
                    'instruments_played' => 'Guitarra básica',
                    'has_music_studies' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Daniel Morales',
                    'email' => 'daniel.morales@gmail.com',
                    'phone' => '3101234568',
                    'document_type' => 'CC',
                    'document_number' => '4000000002',
                    'birth_date' => Carbon::parse('1999-07-30'),
                    'address' => 'Carrera 5 #20-10',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Saxofón',
                    'plays_instrument' => false,
                    'has_music_studies' => false,
                ],
            ],
            [
                'user' => [
                    'name' => 'Gabriela Ramírez',
                    'email' => 'gabriela.ramirez@gmail.com',
                    'phone' => '3201234568',
                    'document_type' => 'CC',
                    'document_number' => '4000000003',
                    'birth_date' => Carbon::parse('2001-11-20'),
                    'address' => 'Av. Libertad #55',
                ],
                'profile' => [
                    'modality' => 'Linaje Big',
                    'desired_instrument' => 'Piano',
                    'plays_instrument' => true,
                    'instruments_played' => 'Flauta traversa',
                    'has_music_studies' => true,
                    'music_schools' => 'Clases particulares por 3 años',
                ],
            ],
        ];

        foreach ($estudiantesIndependientes as $estudianteData) {
            $estudiante = User::firstOrCreate(
                ['email' => $estudianteData['user']['email']],
                array_merge($estudianteData['user'], [
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ])
            );
            $estudiante->assignRole('Estudiante');

            // Crear perfil de estudiante
            $estudiante->studentProfile()->firstOrCreate(
                ['user_id' => $estudiante->id],
                $estudianteData['profile']
            );
        }

        $this->command->info('✅ Usuarios creados exitosamente');
        $this->command->info('   - 1 Administrador');
        $this->command->info('   - 4 Profesores con perfiles');
        $this->command->info('   - 3 Responsables con 6 dependientes (con perfiles de estudiante)');
        $this->command->info('   - 3 Estudiantes independientes con perfiles');
    }
}

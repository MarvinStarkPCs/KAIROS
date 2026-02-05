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
                'user' => [
                    'name' => 'Prof. Roberto Carlos Delgado',
                    'email' => 'roberto.delgado@profesor.com',
                ],
                'profile' => [
                    'instruments_played' => 'Piano, Teclado, Órgano',
                    'music_schools' => 'Conservatorio Nacional',
                    'experience_years' => 15,
                    'bio' => 'Pianista concertista con amplia trayectoria en música clásica y contemporánea.',
                    'specialization' => 'Piano Clásico',
                ],
            ],
            [
                'user' => [
                    'name' => 'Prof. Patricia Jiménez Mora',
                    'email' => 'patricia.jimenez@profesor.com',
                ],
                'profile' => [
                    'instruments_played' => 'Canto, Piano',
                    'music_schools' => 'Academia de Bellas Artes',
                    'experience_years' => 10,
                    'bio' => 'Soprano lírica especializada en técnica vocal y repertorio lírico.',
                    'specialization' => 'Canto Lírico',
                ],
            ],
            [
                'user' => [
                    'name' => 'Mtro. Fernando Alvarado',
                    'email' => 'fernando.alvarado@profesor.com',
                ],
                'profile' => [
                    'instruments_played' => 'Guitarra Clásica, Guitarra Flamenca',
                    'music_schools' => 'Escuela de Música de Madrid',
                    'experience_years' => 20,
                    'bio' => 'Guitarrista con formación en España, especializado en flamenco y música española.',
                    'specialization' => 'Guitarra Clásica y Flamenca',
                ],
            ],
            [
                'user' => [
                    'name' => 'Mtra. Gabriela Romero Santos',
                    'email' => 'gabriela.romero@profesor.com',
                ],
                'profile' => [
                    'instruments_played' => 'Violín, Viola',
                    'music_schools' => 'Julliard School (Diplomado)',
                    'experience_years' => 12,
                    'bio' => 'Primera violinista de orquesta sinfónica con experiencia internacional.',
                    'specialization' => 'Violín y Música de Cámara',
                ],
            ],
            [
                'user' => [
                    'name' => 'Prof. Miguel Ángel Gutiérrez',
                    'email' => 'miguel.gutierrez@profesor.com',
                ],
                'profile' => [
                    'instruments_played' => 'Batería, Percusión Latina, Cajón',
                    'music_schools' => 'Berklee College of Music',
                    'experience_years' => 18,
                    'bio' => 'Percusionista versátil con experiencia en jazz, rock y música latina.',
                    'specialization' => 'Percusión y Ritmo',
                ],
            ],
            [
                'user' => [
                    'name' => 'Mtra. Carmen Beatriz Navarro',
                    'email' => 'carmen.navarro@profesor.com',
                ],
                'profile' => [
                    'instruments_played' => 'Flauta Traversa, Piccolo',
                    'music_schools' => 'Conservatorio de París',
                    'experience_years' => 14,
                    'bio' => 'Flautista con formación europea y experiencia en orquestas internacionales.',
                    'specialization' => 'Vientos Madera',
                ],
            ],
            [
                'user' => [
                    'name' => 'Prof. Javier Alejandro Mendoza',
                    'email' => 'javier.mendoza@profesor.com',
                ],
                'profile' => [
                    'instruments_played' => 'Bajo Eléctrico, Contrabajo',
                    'music_schools' => 'Musicians Institute',
                    'experience_years' => 11,
                    'bio' => 'Bajista de sesión con experiencia en grabación y producción musical.',
                    'specialization' => 'Bajo y Producción',
                ],
            ],
            [
                'user' => [
                    'name' => 'Mtra. Elena Victoria Castro',
                    'email' => 'elena.castro@profesor.com',
                ],
                'profile' => [
                    'instruments_played' => 'Saxofón Alto, Saxofón Tenor, Clarinete',
                    'music_schools' => 'New England Conservatory',
                    'experience_years' => 9,
                    'bio' => 'Saxofonista de jazz con participación en festivales internacionales.',
                    'specialization' => 'Jazz y Improvisación',
                ],
            ],
            [
                'user' => [
                    'name' => 'Prof. Ricardo Montes de Oca',
                    'email' => 'ricardo.montes@profesor.com',
                ],
                'profile' => [
                    'instruments_played' => 'Guitarra Eléctrica, Guitarra Acústica',
                    'music_schools' => 'Guitar Institute of Technology',
                    'experience_years' => 16,
                    'bio' => 'Guitarrista de rock y blues con experiencia en bandas y como solista.',
                    'specialization' => 'Rock y Blues',
                ],
            ],
            [
                'user' => [
                    'name' => 'Mtra. Adriana Solís Márquez',
                    'email' => 'adriana.solis@profesor.com',
                ],
                'profile' => [
                    'instruments_played' => 'Piano, Teoría Musical, Solfeo',
                    'music_schools' => 'Universidad Nacional de Música',
                    'experience_years' => 22,
                    'bio' => 'Pedagoga musical especializada en iniciación musical para niños.',
                    'specialization' => 'Iniciación Musical',
                ],
            ],
        ];

        foreach ($teachers as $teacherData) {
            $teacher = User::firstOrCreate(
                ['email' => $teacherData['user']['email']],
                [
                    'name' => $teacherData['user']['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            // Asignar rol de Profesor
            $teacher->assignRole('Profesor');

            // Crear perfil de profesor
            $teacher->teacherProfile()->firstOrCreate(
                ['user_id' => $teacher->id],
                $teacherData['profile']
            );
        }

        $this->command->info('✓ ' . count($teachers) . ' profesores con perfiles creados exitosamente');
    }
}

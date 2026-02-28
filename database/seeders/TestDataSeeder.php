<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\ParentGuardian;
use App\Models\Payment;
use App\Models\PaymentTransaction;
use App\Models\StudentProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    // Programas disponibles (IDs reales de la BD)
    private array $programas = [
        1 => 'Guitarra Clásica',
        2 => 'Piano',
        3 => 'Canto Lírico',
        4 => 'Producción Musical Digital',
        5 => 'Teoría Musical y Armonía',
        6 => 'Violín',
    ];

    private int $docCounter = 9100000000;

    public function run(): void
    {
        $this->command->info('🌱 Iniciando TestDataSeeder...');

        // ─────────────────────────────────────────────
        // 1. RESPONSABLES (Padre/Madre) con menores
        // ─────────────────────────────────────────────
        $responsables = [
            [
                'responsable' => [
                    'name'            => 'Patricia',
                    'last_name'       => 'Rueda Vargas',
                    'email'           => 'patricia.rueda@test.com',
                    'document_type'   => 'CC',
                    'document_number' => '91000000010',
                    'birth_date'      => '1981-03-12',
                    'gender'          => 'F',
                    'mobile'          => '3152001001',
                    'phone'           => '5742001',
                    'address'         => 'Carrera 12 #34-56',
                    'neighborhood'    => 'La Floresta',
                    'city'            => 'Ocaña',
                    'department'      => 'Norte de Santander',
                    'birth_place'     => 'Ocaña',
                ],
                'relationship' => 'madre',
                'menores' => [
                    [
                        'name'            => 'Emilio',
                        'last_name'       => 'Rueda Vargas',
                        'document_type'   => 'TI',
                        'document_number' => '91000000011',
                        'birth_date'      => '2013-07-20',
                        'gender'          => 'M',
                        'modality'        => 'Linaje Kids',
                        'desired_instrument' => 'Piano',
                        'program_id'      => 2,
                        'enrollment_status' => 'active',
                    ],
                    [
                        'name'            => 'Valeria',
                        'last_name'       => 'Rueda Vargas',
                        'document_type'   => 'TI',
                        'document_number' => '91000000012',
                        'birth_date'      => '2015-11-04',
                        'gender'          => 'F',
                        'modality'        => 'Linaje Kids',
                        'desired_instrument' => 'Guitarra',
                        'program_id'      => 1,
                        'enrollment_status' => 'active',
                    ],
                ],
            ],
            [
                'responsable' => [
                    'name'            => 'Hernando',
                    'last_name'       => 'Castro Pineda',
                    'email'           => 'hernando.castro@test.com',
                    'document_type'   => 'CC',
                    'document_number' => '91000000020',
                    'birth_date'      => '1977-09-05',
                    'gender'          => 'M',
                    'mobile'          => '3162002001',
                    'phone'           => '5742002',
                    'address'         => 'Calle 8 #22-11',
                    'neighborhood'    => 'El Centro',
                    'city'            => 'Ocaña',
                    'department'      => 'Norte de Santander',
                    'birth_place'     => 'Cúcuta',
                ],
                'relationship' => 'padre',
                'menores' => [
                    [
                        'name'            => 'Daniela',
                        'last_name'       => 'Castro Pineda',
                        'document_type'   => 'TI',
                        'document_number' => '91000000021',
                        'birth_date'      => '2011-02-18',
                        'gender'          => 'F',
                        'modality'        => 'Linaje Teens',
                        'desired_instrument' => 'Violín',
                        'program_id'      => 6,
                        'enrollment_status' => 'active',
                    ],
                ],
            ],
            [
                'responsable' => [
                    'name'            => 'Adriana',
                    'last_name'       => 'Moreno Duarte',
                    'email'           => 'adriana.moreno@test.com',
                    'document_type'   => 'CC',
                    'document_number' => '91000000030',
                    'birth_date'      => '1985-06-29',
                    'gender'          => 'F',
                    'mobile'          => '3173003001',
                    'phone'           => '5743003',
                    'address'         => 'Av. Simón Bolívar #45-78',
                    'neighborhood'    => 'San Luis',
                    'city'            => 'Ocaña',
                    'department'      => 'Norte de Santander',
                    'birth_place'     => 'Bucaramanga',
                ],
                'relationship' => 'madre',
                'menores' => [
                    [
                        'name'            => 'Samuel',
                        'last_name'       => 'Moreno Duarte',
                        'document_type'   => 'TI',
                        'document_number' => '91000000031',
                        'birth_date'      => '2014-04-10',
                        'gender'          => 'M',
                        'modality'        => 'Linaje Kids',
                        'desired_instrument' => 'Canto',
                        'program_id'      => 3,
                        'enrollment_status' => 'active',
                    ],
                    [
                        'name'            => 'Isabela',
                        'last_name'       => 'Moreno Duarte',
                        'document_type'   => 'TI',
                        'document_number' => '91000000032',
                        'birth_date'      => '2010-08-22',
                        'gender'          => 'F',
                        'modality'        => 'Linaje Teens',
                        'desired_instrument' => 'Guitarra',
                        'program_id'      => 1,
                        'enrollment_status' => 'waiting',
                    ],
                ],
            ],
            [
                'responsable' => [
                    'name'            => 'Orlando',
                    'last_name'       => 'Quintero Leal',
                    'email'           => 'orlando.quintero@test.com',
                    'document_type'   => 'CC',
                    'document_number' => '91000000040',
                    'birth_date'      => '1979-12-01',
                    'gender'          => 'M',
                    'mobile'          => '3184004001',
                    'phone'           => '5744004',
                    'address'         => 'Transversal 15 #67-23',
                    'neighborhood'    => 'Ospina Pérez',
                    'city'            => 'Ocaña',
                    'department'      => 'Norte de Santander',
                    'birth_place'     => 'Ocaña',
                ],
                'relationship' => 'padre',
                'menores' => [
                    [
                        'name'            => 'Tomás',
                        'last_name'       => 'Quintero Leal',
                        'document_type'   => 'TI',
                        'document_number' => '91000000041',
                        'birth_date'      => '2012-01-15',
                        'gender'          => 'M',
                        'modality'        => 'Linaje Teens',
                        'desired_instrument' => 'Producción',
                        'program_id'      => 4,
                        'enrollment_status' => 'active',
                    ],
                ],
            ],
        ];

        foreach ($responsables as $rData) {
            $responsable = $this->crearResponsable($rData['responsable']);
            $this->command->line("  ✅ Responsable: {$responsable->name} {$responsable->last_name}");

            foreach ($rData['menores'] as $menorData) {
                $menor = $this->crearMenor($menorData, $responsable);
                $this->command->line("    👦 Menor: {$menor->name} {$menor->last_name}");

                // ParentGuardian record
                ParentGuardian::firstOrCreate(
                    ['student_id' => $menor->id],
                    [
                        'relationship_type'        => $rData['relationship'],
                        'name'                     => "{$responsable->name} {$responsable->last_name}",
                        'address'                  => $responsable->address,
                        'phone'                    => $responsable->mobile,
                        'has_signed_authorization' => true,
                        'authorization_date'       => now()->subDays(rand(5, 30)),
                    ]
                );

                if ($menorData['enrollment_status'] !== 'waiting') {
                    $enrollment = $this->crearMatricula($menor, $menorData['program_id'], $menorData['enrollment_status'], $responsable->name . ' ' . $responsable->last_name, $menorData['modality']);
                    $this->crearPagos($menor, $enrollment, $menorData['program_id'], $menorData['modality']);
                } else {
                    // Crear matrícula en espera sin pagos
                    Enrollment::firstOrCreate(
                        ['student_id' => $menor->id, 'program_id' => $menorData['program_id']],
                        [
                            'enrollment_date'             => now()->subDays(rand(1, 10)),
                            'status'                      => 'waiting',
                            'payment_commitment_signed'   => false,
                            'parental_authorization_signed' => true,
                            'parental_authorization_date' => now()->subDays(rand(1, 5)),
                            'parent_guardian_name'        => $responsable->name . ' ' . $responsable->last_name,
                        ]
                    );
                }
            }
        }

        // ─────────────────────────────────────────────
        // 2. ESTUDIANTES ADULTOS INDEPENDIENTES
        // ─────────────────────────────────────────────
        $adultos = [
            [
                'name'            => 'Juliana',
                'last_name'       => 'Serrano López',
                'email'           => 'juliana.serrano@test.com',
                'document_type'   => 'CC',
                'document_number' => '91000000050',
                'birth_date'      => '2000-05-14',
                'gender'          => 'F',
                'mobile'          => '3015005001',
                'phone'           => '5745005',
                'address'         => 'Calle 20 #10-45',
                'neighborhood'    => 'Lleras',
                'city'            => 'Ocaña',
                'department'      => 'Norte de Santander',
                'birth_place'     => 'Ocaña',
                'modality'        => 'Linaje Big',
                'desired_instrument' => 'Canto',
                'plays_instrument' => true,
                'instruments_played' => 'Guitarra acústica',
                'has_music_studies' => false,
                'program_id'      => 3,
                'enrollment_status' => 'active',
            ],
            [
                'name'            => 'Fernando',
                'last_name'       => 'Ríos Medina',
                'email'           => 'fernando.rios@test.com',
                'document_type'   => 'CC',
                'document_number' => '91000000051',
                'birth_date'      => '1998-11-30',
                'gender'          => 'M',
                'mobile'          => '3026006001',
                'phone'           => '5746006',
                'address'         => 'Carrera 7 #55-80',
                'neighborhood'    => 'La Merced',
                'city'            => 'Ocaña',
                'department'      => 'Norte de Santander',
                'birth_place'     => 'Convención',
                'modality'        => 'Linaje Big',
                'desired_instrument' => 'Piano',
                'plays_instrument' => false,
                'has_music_studies' => false,
                'program_id'      => 2,
                'enrollment_status' => 'active',
            ],
            [
                'name'            => 'Natalia',
                'last_name'       => 'Bermúdez Cano',
                'email'           => 'natalia.bermudez@test.com',
                'document_type'   => 'CC',
                'document_number' => '91000000052',
                'birth_date'      => '2002-03-22',
                'gender'          => 'F',
                'mobile'          => '3037007001',
                'phone'           => '5747007',
                'address'         => 'Av. Los Estudiantes #88-12',
                'neighborhood'    => 'El Recreo',
                'city'            => 'Ocaña',
                'department'      => 'Norte de Santander',
                'birth_place'     => 'Ábrego',
                'modality'        => 'Linaje Big',
                'desired_instrument' => 'Violín',
                'plays_instrument' => true,
                'instruments_played' => 'Flauta traversa',
                'has_music_studies' => true,
                'music_schools'   => 'Banda Municipal de Ábrego',
                'program_id'      => 6,
                'enrollment_status' => 'active',
            ],
            [
                'name'            => 'Rodrigo',
                'last_name'       => 'Palomino Vera',
                'email'           => 'rodrigo.palomino@test.com',
                'document_type'   => 'CC',
                'document_number' => '91000000053',
                'birth_date'      => '1995-08-07',
                'gender'          => 'M',
                'mobile'          => '3048008001',
                'phone'           => '5748008',
                'address'         => 'Calle 35 #14-60',
                'neighborhood'    => 'Torcoroma',
                'city'            => 'Ocaña',
                'department'      => 'Norte de Santander',
                'birth_place'     => 'La Playa de Belén',
                'modality'        => 'Linaje Big',
                'desired_instrument' => 'Guitarra',
                'plays_instrument' => true,
                'instruments_played' => 'Guitarra eléctrica',
                'has_music_studies' => true,
                'music_schools'   => 'Clases particulares 2 años',
                'program_id'      => 1,
                'enrollment_status' => 'suspended',
            ],
            [
                'name'            => 'Marcela',
                'last_name'       => 'Aguirre Soto',
                'email'           => 'marcela.aguirre@test.com',
                'document_type'   => 'CC',
                'document_number' => '91000000054',
                'birth_date'      => '2001-01-19',
                'gender'          => 'F',
                'mobile'          => '3059009001',
                'phone'           => '5749009',
                'address'         => 'Cra 22 #40-15',
                'neighborhood'    => 'Villa del Río',
                'city'            => 'Ocaña',
                'department'      => 'Norte de Santander',
                'birth_place'     => 'Ocaña',
                'modality'        => 'Linaje Big',
                'desired_instrument' => 'Teoría Musical',
                'plays_instrument' => false,
                'has_music_studies' => false,
                'program_id'      => 5,
                'enrollment_status' => 'active',
            ],
        ];

        $this->command->info('');
        $this->command->info('👤 Creando estudiantes adultos...');

        foreach ($adultos as $aData) {
            $adulto = $this->crearAdulto($aData);
            $this->command->line("  ✅ Adulto: {$adulto->name} {$adulto->last_name}");

            $enrollment = $this->crearMatricula($adulto, $aData['program_id'], $aData['enrollment_status'], null, $aData['modality']);
            $this->crearPagos($adulto, $enrollment, $aData['program_id'], $aData['modality']);
        }

        $this->command->info('');
        $this->command->info('✅ TestDataSeeder completado exitosamente');
        $this->command->info('   Responsables creados:  4');
        $this->command->info('   Menores creados:        7');
        $this->command->info('   Adultos creados:        5');
        $this->command->info('   Total usuarios nuevos: 16');
    }

    // ─────────────────────────────────────────────────────────
    private function crearResponsable(array $data): User
    {
        $responsable = User::firstOrCreate(
            ['document_number' => $data['document_number']],
            [
                'name'              => $data['name'],
                'last_name'         => $data['last_name'],
                'email'             => $data['email'],
                'document_type'     => $data['document_type'],
                'document_number'   => $data['document_number'],
                'birth_date'        => Carbon::parse($data['birth_date']),
                'gender'            => $data['gender'],
                'mobile'            => $data['mobile'],
                'phone'             => $data['phone'],
                'address'           => $data['address'],
                'neighborhood'      => $data['neighborhood'],
                'city'              => $data['city'],
                'department'        => $data['department'],
                'birth_place'       => $data['birth_place'],
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        if (! $responsable->hasRole('Padre/Madre')) {
            $responsable->assignRole('Padre/Madre');
        }

        return $responsable;
    }

    private function crearMenor(array $data, User $responsable): User
    {
        $menor = User::firstOrCreate(
            ['document_number' => $data['document_number']],
            [
                'name'              => $data['name'],
                'last_name'         => $data['last_name'],
                'document_type'     => $data['document_type'],
                'document_number'   => $data['document_number'],
                'birth_date'        => Carbon::parse($data['birth_date']),
                'gender'            => $data['gender'],
                'address'           => $responsable->address,
                'city'              => $responsable->city,
                'department'        => $responsable->department,
                'password'          => null,
                'email'             => null,
                'email_verified_at' => null,
                'parent_id'         => $responsable->id,
            ]
        );

        if (! $menor->hasRole('Estudiante')) {
            $menor->assignRole('Estudiante');
        }

        // Perfil de estudiante
        $menor->studentProfile()->firstOrCreate(
            ['user_id' => $menor->id],
            [
                'modality'           => $data['modality'],
                'desired_instrument' => $data['desired_instrument'],
                'plays_instrument'   => false,
                'has_music_studies'  => false,
            ]
        );

        return $menor;
    }

    private function crearAdulto(array $data): User
    {
        $adulto = User::firstOrCreate(
            ['document_number' => $data['document_number']],
            [
                'name'              => $data['name'],
                'last_name'         => $data['last_name'],
                'email'             => $data['email'],
                'document_type'     => $data['document_type'],
                'document_number'   => $data['document_number'],
                'birth_date'        => Carbon::parse($data['birth_date']),
                'gender'            => $data['gender'],
                'mobile'            => $data['mobile'],
                'phone'             => $data['phone'],
                'address'           => $data['address'],
                'neighborhood'      => $data['neighborhood'],
                'city'              => $data['city'],
                'department'        => $data['department'],
                'birth_place'       => $data['birth_place'],
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        if (! $adulto->hasRole('Estudiante')) {
            $adulto->assignRole('Estudiante');
        }

        $adulto->studentProfile()->firstOrCreate(
            ['user_id' => $adulto->id],
            [
                'modality'           => $data['modality'],
                'desired_instrument' => $data['desired_instrument'],
                'plays_instrument'   => $data['plays_instrument'] ?? false,
                'instruments_played' => $data['instruments_played'] ?? null,
                'has_music_studies'  => $data['has_music_studies'] ?? false,
                'music_schools'      => $data['music_schools'] ?? null,
            ]
        );

        return $adulto;
    }

    private function crearMatricula(User $estudiante, int $programId, string $estado, ?string $nombreResponsable, string $modality): Enrollment
    {
        $fechaInscripcion = Carbon::now()->subMonths(rand(2, 6))->subDays(rand(0, 15));

        $enrollment = Enrollment::firstOrCreate(
            ['student_id' => $estudiante->id, 'program_id' => $programId],
            [
                'enrollment_date'               => $fechaInscripcion,
                'status'                        => $estado,
                'payment_commitment_signed'     => true,
                'payment_commitment_date'       => $fechaInscripcion,
                'parental_authorization_signed' => ($nombreResponsable !== null),
                'parental_authorization_date'   => ($nombreResponsable !== null) ? $fechaInscripcion : null,
                'parent_guardian_name'          => $nombreResponsable,
                'enrolled_level'                => 1,
            ]
        );

        return $enrollment;
    }

    private function crearPagos(User $estudiante, Enrollment $enrollment, int $programId, string $modality): void
    {
        $nombrePrograma = $this->programas[$programId] ?? 'Programa';

        // ── Pago de matrícula inicial ──────────────────
        $fechaMatricula = Carbon::parse($enrollment->enrollment_date);
        $montoMatricula = 350000.00;

        $pagoMatricula = Payment::firstOrCreate(
            [
                'student_id' => $estudiante->id,
                'concept'    => 'Matrícula',
                'program_id' => $programId,
            ],
            [
                'enrollment_id'    => $enrollment->id,
                'modality'         => $modality,
                'payment_type'     => 'single',
                'amount'           => $montoMatricula,
                'due_date'         => $fechaMatricula->copy(),
                'payment_date'     => $fechaMatricula->copy(),
                'status'           => 'completed',
                'payment_method'   => collect(['efectivo', 'transferencia', 'tarjeta'])->random(),
                'reference_number' => 'MAT-' . strtoupper(substr(md5($estudiante->id . $programId), 0, 8)),
                'notes'            => "Pago de matrícula para {$nombrePrograma} - {$modality}",
            ]
        );

        // ── Mensualidades (3-5 meses pasados + mes actual + 1 futuro) ──
        $monto = 100000.00; // monthly_fee
        $mesesAtras = rand(3, 5);

        for ($i = $mesesAtras; $i >= -1; $i--) {
            $fechaVenc = Carbon::now()->startOfMonth()->subMonths($i);
            $concepto  = 'Mensualidad ' . $fechaVenc->translatedFormat('F Y');

            // Evitar duplicado
            if (Payment::where('student_id', $estudiante->id)
                ->where('concept', $concepto)
                ->where('program_id', $programId)
                ->exists()) {
                continue;
            }

            $esPasado = $fechaVenc->isPast() && ! $fechaVenc->isCurrentMonth();
            $esFuturo = $fechaVenc->isFuture();

            if ($esPasado) {
                // Mes pasado: 80% pagado, 20% vencido
                $pagado = (rand(1, 10) <= 8);
                $status = $pagado ? 'completed' : 'overdue';

                if ($enrollment->status === 'suspended' && $i <= 1) {
                    $status = 'overdue'; // suspendido tiene meses vencidos
                }

                $pago = Payment::create([
                    'student_id'       => $estudiante->id,
                    'program_id'       => $programId,
                    'enrollment_id'    => $enrollment->id,
                    'concept'          => $concepto,
                    'modality'         => $modality,
                    'payment_type'     => 'single',
                    'amount'           => $monto,
                    'due_date'         => $fechaVenc->copy()->endOfMonth(),
                    'payment_date'     => $pagado ? $fechaVenc->copy()->addDays(rand(1, 20)) : null,
                    'status'           => $status,
                    'payment_method'   => $pagado ? collect(['efectivo', 'transferencia'])->random() : null,
                    'reference_number' => $pagado ? 'MEN-' . strtoupper(substr(md5($estudiante->id . $i), 0, 8)) : null,
                    'notes'            => "Mensualidad {$nombrePrograma}",
                ]);

                // Si está pagado, crear transacción
                if ($pagado) {
                    PaymentTransaction::create([
                        'payment_id'       => $pago->id,
                        'amount'           => $monto,
                        'transaction_date' => $pago->payment_date,
                        'payment_method'   => $pago->payment_method,
                        'reference_number' => $pago->reference_number,
                        'notes'            => 'Pago registrado',
                    ]);
                }
            } else {
                // Mes actual o futuro: pendiente
                Payment::create([
                    'student_id'    => $estudiante->id,
                    'program_id'    => $programId,
                    'enrollment_id' => $enrollment->id,
                    'concept'       => $concepto,
                    'modality'      => $modality,
                    'payment_type'  => 'single',
                    'amount'        => $monto,
                    'due_date'      => $fechaVenc->copy()->endOfMonth(),
                    'payment_date'  => null,
                    'status'        => 'pending',
                    'notes'         => "Mensualidad {$nombrePrograma}",
                ]);
            }
        }
    }
}

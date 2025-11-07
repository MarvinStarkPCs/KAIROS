<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\AcademicProgram;
use App\Models\StudyPlan;
use App\Models\Activity;
use App\Models\EvaluationCriteria;
use App\Models\Schedule;
use App\Models\ScheduleEnrollment;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Attendance;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class CompleteDataSeeder extends Seeder
{
    private $profesores = [];
    private $responsables = [];
    private $estudiantes = [];
    private $programs = [];
    private $schedules = [];

    public function run(): void
    {
        $this->command->info('🎵 Iniciando seeding completo de KAIROS...');

        $this->seedUsers();
        $this->seedPrograms();
        $this->seedSchedules();
        $this->seedEnrollments();
        $this->seedPayments();
        $this->seedAttendances();

        $this->command->info('');
        $this->command->info('✅ Seeding completo finalizado exitosamente!');
    }

    private function seedUsers()
    {
        $this->command->info('👥 Creando usuarios...');

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
        $profesoresData = [
            ['María García', 'maria.garcia@kairos.com', '3101234567', '1000000001', '1990-03-20'],
            ['Carlos Rodríguez', 'carlos.rodriguez@kairos.com', '3201234567', '1000000002', '1988-07-12'],
            ['Ana Martínez', 'ana.martinez@kairos.com', '3301234567', '1000000003', '1992-11-05'],
            ['Luis Hernández', 'luis.hernandez@kairos.com', '3401234567', '1000000004', '1987-05-25'],
        ];

        foreach ($profesoresData as $data) {
            $profesor = User::firstOrCreate(
                ['email' => $data[1]],
                [
                    'name' => $data[0],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'phone' => $data[2],
                    'document_type' => 'CC',
                    'document_number' => $data[3],
                    'birth_date' => Carbon::parse($data[4]),
                ]
            );
            $profesor->assignRole('Profesor');
            $this->profesores[] = $profesor;
        }

        // Responsables con dependientes
        $responsablesData = [
            [
                'responsable' => ['Juan Pérez', 'juan.perez@gmail.com', '3501234567', '2000000001', '1980-04-10', 'Calle 50 #12-34'],
                'dependientes' => [
                    ['Sofía Pérez', null, 'TI', '3000000001', '2012-08-15'],
                    ['Mateo Pérez', null, 'TI', '3000000002', '2014-03-20'],
                ],
            ],
            [
                'responsable' => ['Laura Gómez', 'laura.gomez@gmail.com', '3601234567', '2000000002', '1982-09-22', 'Carrera 20 #45-67'],
                'dependientes' => [
                    ['Valentina Gómez', 'valentina.gomez@gmail.com', 'TI', '3000000003', '2010-12-05'],
                ],
            ],
            [
                'responsable' => ['Roberto Silva', 'roberto.silva@gmail.com', '3801234567', '2000000003', '1978-06-18', 'Av. Principal #100'],
                'dependientes' => [
                    ['Santiago Silva', null, 'TI', '3000000004', '2011-05-10'],
                    ['Isabella Silva', null, 'TI', '3000000005', '2013-09-25'],
                ],
            ],
        ];

        foreach ($responsablesData as $data) {
            $rData = $data['responsable'];
            $responsable = User::firstOrCreate(
                ['email' => $rData[1]],
                [
                    'name' => $rData[0],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'phone' => $rData[2],
                    'document_type' => 'CC',
                    'document_number' => $rData[3],
                    'birth_date' => Carbon::parse($rData[4]),
                    'address' => $rData[5],
                ]
            );
            $responsable->assignRole('Responsable');
            $this->responsables[] = $responsable;

            foreach ($data['dependientes'] as $dData) {
                $dependiente = User::firstOrCreate(
                    ['document_number' => $dData[3]],
                    [
                        'name' => $dData[0],
                        'email' => $dData[1],
                        'password' => $dData[1] ? Hash::make('password') : null,
                        'email_verified_at' => $dData[1] ? now() : null,
                        'document_type' => $dData[2],
                        'document_number' => $dData[3],
                        'birth_date' => Carbon::parse($dData[4]),
                        'address' => $rData[5],
                        'parent_id' => $responsable->id,
                    ]
                );
                $dependiente->assignRole('Estudiante');
                $this->estudiantes[] = $dependiente;
            }
        }

        // Estudiantes independientes
        $estudiantesData = [
            ['Camila Torres', 'camila.torres@gmail.com', '3901234567', '4000000001', '2000-02-14'],
            ['Daniel Morales', 'daniel.morales@gmail.com', '3101234568', '4000000002', '1999-07-30'],
            ['Gabriela Ramírez', 'gabriela.ramirez@gmail.com', '3201234568', '4000000003', '2001-11-20'],
        ];

        foreach ($estudiantesData as $data) {
            $estudiante = User::firstOrCreate(
                ['email' => $data[1]],
                [
                    'name' => $data[0],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'phone' => $data[2],
                    'document_type' => 'CC',
                    'document_number' => $data[3],
                    'birth_date' => Carbon::parse($data[4]),
                ]
            );
            $estudiante->assignRole('Estudiante');
            $this->estudiantes[] = $estudiante;
        }

        $this->command->info("   ✓ Admin: 1");
        $this->command->info("   ✓ Profesores: " . count($this->profesores));
        $this->command->info("   ✓ Responsables: " . count($this->responsables));
        $this->command->info("   ✓ Estudiantes: " . count($this->estudiantes));
    }

    private function seedPrograms()
    {
        $this->command->info('🎼 Creando programas académicos...');

        $programsData = [
            ['Piano', '#3b82f6', 150000, 'Piano Básico', 'Técnica de piano', 40],
            ['Guitarra', '#10b981', 120000, 'Guitarra Inicial', 'Acordes y ritmo', 35],
            ['Violín', '#8b5cf6', 180000, 'Violín Básico', 'Técnica de arco', 45],
            ['Canto', '#ec4899', 140000, 'Técnica Vocal', 'Respiración y vocalización', 40],
            ['Batería', '#f59e0b', 130000, 'Batería Inicial', 'Ritmo y coordinación', 35],
            ['Saxofón', '#06b6d4', 160000, 'Saxofón Básico', 'Embocadura y técnica', 38],
        ];

        foreach ($programsData as $data) {
            $program = AcademicProgram::firstOrCreate(
                ['name' => $data[0]],
                [
                    'description' => "Programa completo de {$data[0]} para todos los niveles",
                    'duration_months' => 24,
                    'monthly_fee' => $data[2],
                    'status' => 'active',
                    'color' => $data[1],
                ]
            );

            // Crear un módulo básico para cada programa
            $module = StudyPlan::firstOrCreate(
                ['program_id' => $program->id, 'module_name' => $data[3]],
                [
                    'description' => $data[4],
                    'hours' => $data[5],
                    'level' => 1,
                ]
            );

            // Crear 2 actividades por módulo
            for ($i = 1; $i <= 2; $i++) {
                $activity = Activity::firstOrCreate(
                    ['study_plan_id' => $module->id, 'order' => $i - 1],
                    [
                        'name' => "Actividad {$i} - {$data[0]}",
                        'description' => "Ejercicios prácticos de {$data[0]}",
                        'weight' => $i == 1 ? 40 : 60,
                        'status' => 'active',
                    ]
                );

                // Crear 2 criterios de evaluación por actividad
                EvaluationCriteria::firstOrCreate(
                    ['activity_id' => $activity->id, 'order' => 0],
                    [
                        'name' => 'Técnica',
                        'description' => 'Ejecución técnica correcta',
                        'max_points' => 50,
                    ]
                );

                EvaluationCriteria::firstOrCreate(
                    ['activity_id' => $activity->id, 'order' => 1],
                    [
                        'name' => 'Musicalidad',
                        'description' => 'Expresión e interpretación musical',
                        'max_points' => 50,
                    ]
                );
            }

            $this->programs[] = $program;
        }

        $this->command->info("   ✓ Programas: " . count($this->programs));
    }

    private function seedSchedules()
    {
        $this->command->info('📅 Creando horarios...');

        $days = [['Monday'], ['Tuesday'], ['Wednesday'], ['Thursday'], ['Friday'], ['Saturday']];
        $times = [
            ['08:00:00', '10:00:00'],
            ['10:00:00', '12:00:00'],
            ['14:00:00', '16:00:00'],
            ['16:00:00', '18:00:00'],
        ];

        $scheduleCount = 0;
        foreach ($this->programs as $index => $program) {
            // Crear 2 horarios por programa
            for ($i = 0; $i < 2; $i++) {
                $profesor = $this->profesores[$index % count($this->profesores)];
                $day = $days[($index + $i) % count($days)];
                $time = $times[$i % count($times)];

                $schedule = Schedule::firstOrCreate(
                    [
                        'academic_program_id' => $program->id,
                        'professor_id' => $profesor->id,
                        'days_of_week' => $day,
                    ],
                    [
                        'name' => $program->name . " - Grupo " . chr(65 + $i),
                        'description' => "Clase de {$program->name}",
                        'start_time' => $time[0],
                        'end_time' => $time[1],
                        'max_students' => 10,
                        'status' => 'active',
                    ]
                );

                $this->schedules[] = $schedule;
                $scheduleCount++;
            }
        }

        $this->command->info("   ✓ Horarios: " . $scheduleCount);
    }

    private function seedEnrollments()
    {
        $this->command->info('📝 Creando inscripciones...');

        $enrollmentCount = 0;
        $scheduleEnrollmentCount = 0;

        // Inscribir cada estudiante en 1-2 programas
        foreach ($this->estudiantes as $index => $estudiante) {
            $numEnrollments = rand(1, 2);

            for ($i = 0; $i < $numEnrollments; $i++) {
                $programIndex = ($index + $i) % count($this->programs);
                $program = $this->programs[$programIndex];

                // Crear inscripción al programa
                $enrollment = Enrollment::firstOrCreate(
                    [
                        'student_id' => $estudiante->id,
                        'program_id' => $program->id,
                    ],
                    [
                        'enrollment_date' => Carbon::now()->subMonths(rand(1, 6)),
                        'status' => 'active',
                    ]
                );

                $enrollmentCount++;

                // Inscribir en un horario del programa
                $programSchedules = collect($this->schedules)->where('academic_program_id', $program->id);
                if ($programSchedules->isNotEmpty()) {
                    $schedule = $programSchedules->random();

                    $scheduleEnrollment = ScheduleEnrollment::firstOrCreate(
                        [
                            'schedule_id' => $schedule->id,
                            'student_id' => $estudiante->id,
                        ],
                        [
                            'enrollment_date' => $enrollment->enrollment_date,
                            'status' => 'enrolled',
                        ]
                    );

                    $scheduleEnrollmentCount++;
                }
            }
        }

        $this->command->info("   ✓ Inscripciones a programas: " . $enrollmentCount);
        $this->command->info("   ✓ Inscripciones a horarios: " . $scheduleEnrollmentCount);
    }

    private function seedPayments()
    {
        $this->command->info('💳 Creando pagos...');

        $paymentCount = 0;

        // Crear pagos mensuales para cada inscripción
        foreach (Enrollment::all() as $enrollment) {
            // Crear 3 pagos: uno pasado (pagado), uno del mes actual (pendiente), uno futuro (pendiente)
            for ($i = 2; $i >= 0; $i--) {
                $dueDate = Carbon::now()->subMonths($i)->day(5);
                $status = $i == 2 ? 'completed' : 'pending';
                $monthName = $dueDate->locale('es')->isoFormat('MMMM YYYY');

                $payment = Payment::firstOrCreate(
                    [
                        'student_id' => $enrollment->student_id,
                        'enrollment_id' => $enrollment->id,
                        'due_date' => $dueDate,
                    ],
                    [
                        'program_id' => $enrollment->program_id,
                        'concept' => "Mensualidad {$enrollment->program->name} - {$monthName}",
                        'payment_type' => 'single',
                        'amount' => $enrollment->program->monthly_fee,
                        'original_amount' => $enrollment->program->monthly_fee,
                        'paid_amount' => $status == 'completed' ? $enrollment->program->monthly_fee : 0,
                        'remaining_amount' => $status == 'completed' ? 0 : $enrollment->program->monthly_fee,
                        'status' => $status,
                        'payment_date' => $status == 'completed' ? $dueDate->copy()->subDays(2) : null,
                        'payment_method' => $status == 'completed' ? 'Efectivo' : null,
                        'recorded_by' => 1,
                    ]
                );

                $paymentCount++;
            }
        }

        $this->command->info("   ✓ Pagos: " . $paymentCount);
    }

    private function seedAttendances()
    {
        $this->command->info('✅ Creando asistencias...');

        $attendanceCount = 0;

        // Crear asistencias para las últimas 4 semanas
        foreach (ScheduleEnrollment::where('status', 'enrolled')->get() as $scheduleEnrollment) {
            $schedule = $scheduleEnrollment->schedule;
            $daysOfWeek = $schedule->days_of_week;

            // Últimas 4 semanas
            for ($week = 0; $week < 4; $week++) {
                foreach ($daysOfWeek as $dayName) {
                    $dayNumber = $this->getDayNumber($dayName);
                    $date = Carbon::now()->subWeeks($week)->startOfWeek()->addDays($dayNumber - 1);

                    // No crear asistencias futuras
                    if ($date->isFuture()) {
                        continue;
                    }

                    // 90% de probabilidad de asistir
                    $status = rand(1, 10) <= 9 ? 'present' : 'absent';

                    Attendance::firstOrCreate(
                        [
                            'schedule_enrollment_id' => $scheduleEnrollment->id,
                            'date' => $date->toDateString(),
                        ],
                        [
                            'student_id' => $scheduleEnrollment->student_id,
                            'status' => $status,
                            'recorded_by' => $schedule->professor_id,
                        ]
                    );

                    $attendanceCount++;
                }
            }
        }

        $this->command->info("   ✓ Asistencias: " . $attendanceCount);
    }

    private function getDayNumber($dayName)
    {
        $days = [
            'Monday' => 1,
            'Tuesday' => 2,
            'Wednesday' => 3,
            'Thursday' => 4,
            'Friday' => 5,
            'Saturday' => 6,
            'Sunday' => 7,
        ];

        return $days[$dayName] ?? 1;
    }
}

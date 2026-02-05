<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\ParentGuardian;
use App\Models\Payment;
use App\Models\PaymentSetting;
use App\Models\ScheduleEnrollment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EnrollmentService
{
    /**
     * Crear usuario responsable
     */
    public function createResponsible(array $data, bool $isStudent = false): User
    {
        $userData = [
            'name' => $data['name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'document_type' => $data['document_type'],
            'document_number' => $data['document_number'],
            'birth_place' => $data['birth_place'] ?? null,
            'birth_date' => $data['birth_date'],
            'gender' => $data['gender'],
            'address' => $data['address'],
            'neighborhood' => $data['neighborhood'] ?? null,
            'phone' => $data['phone'] ?? null,
            'mobile' => $data['mobile'],
            'city' => $data['city'],
            'department' => $data['department'],
        ];

        $user = User::create($userData);

        // Si el responsable también es estudiante, crear perfil de estudiante
        if ($isStudent) {
            $user->studentProfile()->create([
                'plays_instrument' => $data['plays_instrument'] ?? false,
                'instruments_played' => $data['instruments_played'] ?? null,
                'has_music_studies' => $data['has_music_studies'] ?? false,
                'music_schools' => $data['music_schools'] ?? null,
                'desired_instrument' => $data['desired_instrument'] ?? null,
                'modality' => $data['modality'] ?? 'Linaje Big',
                'current_level' => $data['current_level'] ?? 1,
            ]);
        }

        return $user;
    }

    /**
     * Crear usuario estudiante (menor de edad)
     */
    public function createStudent(array $data, ?int $parentId = null): User
    {
        $student = User::create([
            'name' => $data['name'],
            'last_name' => $data['last_name'],
            'email' => $data['email'] ?? null,
            'password' => Hash::make('temporal123'), // Temporal
            'document_type' => $data['document_type'],
            'document_number' => $data['document_number'],
            'birth_place' => $data['birth_place'] ?? null,
            'birth_date' => $data['birth_date'],
            'gender' => $data['gender'],
            'parent_id' => $parentId, // Vincular con el responsable
        ]);

        // Crear perfil de estudiante con datos musicales
        $datosMusicales = $data['datos_musicales'] ?? [];
        $student->studentProfile()->create([
            'modality' => $datosMusicales['modality'] ?? 'Linaje Kids',
            'desired_instrument' => $datosMusicales['desired_instrument'] ?? null,
            'plays_instrument' => $datosMusicales['plays_instrument'] ?? false,
            'instruments_played' => $datosMusicales['instruments_played'] ?? null,
            'has_music_studies' => $datosMusicales['has_music_studies'] ?? false,
            'music_schools' => $datosMusicales['music_schools'] ?? null,
            'current_level' => $datosMusicales['current_level'] ?? 1,
        ]);

        return $student;
    }

    /**
     * Crear inscripción con autorizaciones
     */
    public function createEnrollment(
        User $student,
        int $programId,
        bool $paymentCommitment = false,
        bool $parentalAuthorization = false,
        ?string $parentGuardianName = null,
        ?int $enrolledLevel = null
    ): Enrollment {
        return Enrollment::create([
            'student_id' => $student->id,
            'program_id' => $programId,
            'enrollment_date' => Carbon::today(),
            'status' => 'waiting',
            'enrolled_level' => $enrolledLevel ?? 1,
            'payment_commitment_signed' => $paymentCommitment,
            'payment_commitment_date' => $paymentCommitment ? now() : null,
            'parental_authorization_signed' => $parentalAuthorization,
            'parental_authorization_date' => $parentalAuthorization ? now() : null,
            'parent_guardian_name' => $parentGuardianName,
        ]);
    }

    /**
     * Obtener monto de pago configurado según la modalidad
     */
    public function getPaymentAmount(string $modality): float
    {
        $paymentSetting = PaymentSetting::where('is_active', true)->first();

        if (! $paymentSetting) {
            // Valores por defecto si no hay configuración
            return 100000;
        }

        $amount = $paymentSetting->getAmountForModality($modality);

        // Validar mínimo de Wompi (1,500 COP)
        return max($amount, 1500);
    }

    /**
     * Crear pago de matrícula
     */
    /**
     * Crear inscripción en horario
     */
    public function createScheduleEnrollment(User $student, int $scheduleId): ScheduleEnrollment
    {
        return ScheduleEnrollment::firstOrCreate(
            [
                'student_id' => $student->id,
                'schedule_id' => $scheduleId,
            ],
            [
                'enrollment_date' => Carbon::today(),
                'status' => 'enrolled',
            ]
        );
    }

    /**
     * Crear pago de matrícula
     */
    public function createPayment(
        User $student,
        int $programId,
        int $enrollmentId,
        string $programName,
        string $modality,
        ?int $scheduleId = null
    ): Payment {
        $amount = $this->getPaymentAmount($modality);

        return Payment::create([
            'student_id' => $student->id,
            'program_id' => $programId,
            'enrollment_id' => $enrollmentId,
            'concept' => "Matrícula {$programName} - {$student->name} ({$modality})",
            'modality' => $modality,
            'payment_type' => 'single',
            'amount' => $amount,
            'original_amount' => $amount,
            'paid_amount' => 0,
            'remaining_amount' => $amount,
            'due_date' => Carbon::today(),
            'status' => 'pending',
            'wompi_reference' => "MAT-{$enrollmentId}-".time(),
        ]);
    }

    /**
     * Vincular padre/madre con estudiante
     */
    public function linkParent(User $parent, User $student, string $relationship): void
    {
        // Convertir relación a formato enum válido
        $relationshipType = match (strtolower($relationship)) {
            'padre/madre', 'padre', 'papá' => 'padre',
            'madre', 'mamá' => 'madre',
            'conyuge', 'cónyuge', 'esposo', 'esposa' => 'conyuge',
            default => 'otro'
        };

        ParentGuardian::create([
            'student_id' => $student->id,
            'relationship_type' => $relationshipType,
            'name' => $parent->name.' '.$parent->last_name,
            'address' => $parent->address ?? null,
            'phone' => $parent->phone ?? $parent->mobile ?? null,
            'has_signed_authorization' => false, // Se actualizará cuando firme
            'authorization_date' => null,
        ]);
    }

    /**
     * Asignar rol a usuario
     */
    public function assignRole(User $user, string $role): void
    {
        if (! \Spatie\Permission\Models\Role::where('name', $role)->exists()) {
            \Spatie\Permission\Models\Role::create(['name' => $role]);
        }
        $user->assignRole($role);
    }

    /**
     * Procesar matrícula de adulto
     */
    public function processAdultEnrollment(array $data): array
    {
        \Log::info('Procesando matrícula de adulto', ['data' => $data]);

        return DB::transaction(function () use ($data) {
            // 1. Crear usuario responsable (que también es el estudiante)
            $responsible = $this->createResponsible($data['responsable'], true);

            // 2. Asignar rol de estudiante
            $this->assignRole($responsible, 'Estudiante');

            // 3. Crear inscripción con autorizaciones
            $modality = $data['responsable']['modality'] ?? 'Linaje Big';
            $currentLevel = $data['responsable']['current_level'] ?? 1;

            $enrollment = $this->createEnrollment(
                $responsible,
                $data['responsable']['program_id'],
                $data['payment_commitment'] ?? true, // Compromiso de pago
                false, // No requiere autorización parental (es adulto)
                null, // Sin nombre de tutor
                $currentLevel
            );

            // 3.5. Inscribir en horario si se seleccionó uno
            $scheduleId = $data['responsable']['schedule_id'] ?? null;
            if ($scheduleId) {
                $this->createScheduleEnrollment($responsible, $scheduleId);
            }

            // 4. Crear pago
            $programName = \App\Models\AcademicProgram::find($data['responsable']['program_id'])->name;
            $payment = $this->createPayment(
                $responsible,
                $data['responsable']['program_id'],
                $enrollment->id,
                $programName,
                $modality,
                $scheduleId
            );

            return [
                'payments' => [$payment],
                'responsible' => $responsible,
            ];
        });
    }

    /**
     * Procesar matrícula de menores
     */
    public function processMinorEnrollment(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // 1. Crear usuario responsable (padre/madre)
            $responsible = $this->createResponsible($data['responsable']);

            // 2. Asignar rol de padre/madre
            $this->assignRole($responsible, 'Padre/Madre');

            // Nombre completo del responsable para las autorizaciones
            $parentGuardianName = $responsible->name.' '.$responsible->last_name;

            $payments = [];

            // 3. Procesar cada estudiante
            foreach ($data['estudiantes'] as $estudianteData) {
                // Crear usuario estudiante con parent_id vinculado
                $student = $this->createStudent($estudianteData, $responsible->id);

                // Asignar rol
                $this->assignRole($student, 'Estudiante');

                // Vincular con responsable en tabla parent_guardians
                $this->linkParent($responsible, $student, 'Padre/Madre');

                // Obtener datos musicales para el nivel
                $datosMusicales = $estudianteData['datos_musicales'] ?? [];
                $currentLevel = $datosMusicales['current_level'] ?? 1;

                // Crear inscripción con autorizaciones del responsable
                $enrollment = $this->createEnrollment(
                    $student,
                    $estudianteData['program_id'],
                    $data['payment_commitment'] ?? true,
                    $data['parental_authorization'] ?? true,
                    $parentGuardianName,
                    $currentLevel
                );

                // Inscribir en horario si se seleccionó uno
                $scheduleId = $estudianteData['schedule_id'] ?? null;
                if ($scheduleId) {
                    $this->createScheduleEnrollment($student, $scheduleId);
                }

                // Crear pago
                $programName = \App\Models\AcademicProgram::find($estudianteData['program_id'])->name;
                $modality = $datosMusicales['modality'] ?? 'Linaje Kids';
                $payment = $this->createPayment(
                    $student,
                    $estudianteData['program_id'],
                    $enrollment->id,
                    $programName,
                    $modality,
                    $scheduleId
                );

                $payments[] = $payment;
            }

            return [
                'payments' => $payments,
                'responsible' => $responsible,
            ];
        });
    }
}

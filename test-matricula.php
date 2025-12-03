<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\AcademicProgram;
use App\Models\Enrollment;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

echo "Probando flujo de matrícula para adulto..." . PHP_EOL;

DB::beginTransaction();

try {
    // 1. Crear usuario responsable
    $responsable = User::create([
        'name' => 'Test',
        'last_name' => 'Adulto',
        'email' => 'test.adulto.' . time() . '@test.com',
        'password' => Hash::make('password123'),
        'document_type' => 'CC',
        'document_number' => 'TEST' . time(),
        'birth_date' => '1990-01-01',
        'gender' => 'M',
        'address' => 'Calle 123',
        'city' => 'Ocaña',
        'department' => 'Norte de Santander',
        'mobile' => '3001234567',
        'user_type' => 'both',
        // Datos musicales
        'plays_instrument' => false,
        'has_music_studies' => false,
        'desired_instrument' => 'Piano',
        'modality' => 'Linaje Big',
        'current_level' => 1,
    ]);

    $responsable->assignRole('Estudiante');

    echo "✅ Usuario creado: {$responsable->name} (ID: {$responsable->id})" . PHP_EOL;

    // 2. Crear inscripción
    $program = AcademicProgram::first();

    if (!$program) {
        throw new Exception('No hay programas académicos en la base de datos');
    }

    $enrollment = Enrollment::create([
        'student_id' => $responsable->id,
        'program_id' => $program->id,
        'enrolled_level' => 1,
        'enrollment_date' => Carbon::today(),
        'status' => 'active',
        'payment_commitment_signed' => true,
        'payment_commitment_date' => now(),
    ]);

    echo "✅ Inscripción creada: ID {$enrollment->id}" . PHP_EOL;

    // 3. Crear pago
    $paymentSetting = \App\Models\PaymentSetting::where('is_active', true)->first();
    $amount = $paymentSetting && $paymentSetting->monthly_amount
        ? $paymentSetting->monthly_amount
        : ($program->monthly_fee ?? 100000);

    $payment = Payment::create([
        'student_id' => $responsable->id,
        'program_id' => $program->id,
        'enrollment_id' => $enrollment->id,
        'concept' => 'Matrícula - ' . $program->name,
        'payment_type' => 'single',
        'amount' => $amount,
        'original_amount' => $amount,
        'paid_amount' => 0,
        'remaining_amount' => $amount,
        'due_date' => Carbon::today(),
        'status' => 'pending',
        'wompi_reference' => 'MAT-' . $enrollment->id . '-' . time(),
    ]);

    echo "✅ Pago creado: ID {$payment->id}, Monto: \${$amount}" . PHP_EOL;
    echo "✅ Referencia Wompi: {$payment->wompi_reference}" . PHP_EOL;

    echo PHP_EOL;
    echo "🔗 URL de checkout: " . url('/matricula/checkout/' . $payment->id) . PHP_EOL;

    DB::commit();

    echo PHP_EOL;
    echo "✅ ¡TODO FUNCIONÓ! El flujo es correcto." . PHP_EOL;

} catch (Exception $e) {
    DB::rollBack();
    echo PHP_EOL;
    echo "❌ ERROR: " . $e->getMessage() . PHP_EOL;
    echo PHP_EOL;
    echo "Stack trace:" . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}

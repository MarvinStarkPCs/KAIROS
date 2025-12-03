<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Payment;
use App\Models\User;
use App\Models\AcademicProgram;
use Carbon\Carbon;

echo "Creando pago de prueba..." . PHP_EOL;

try {
    $student = User::role('Estudiante')->first();

    if (!$student) {
        echo "No hay estudiantes en el sistema" . PHP_EOL;
        exit(1);
    }

    $program = AcademicProgram::first();

    $payment = Payment::create([
        'student_id' => $student->id,
        'program_id' => $program ? $program->id : null,
        'concept' => 'Test Matrícula - ' . $student->name,
        'payment_type' => 'single',
        'amount' => 100000,
        'original_amount' => 100000,
        'paid_amount' => 0,
        'remaining_amount' => 100000,
        'due_date' => Carbon::today(),
        'status' => 'pending',
        'wompi_reference' => 'TEST-' . time(),
    ]);

    echo "✅ Pago creado exitosamente!" . PHP_EOL;
    echo "   ID: " . $payment->id . PHP_EOL;
    echo "   Estudiante: " . $student->name . PHP_EOL;
    echo "   Monto: $" . number_format($payment->amount, 0, ',', '.') . " COP" . PHP_EOL;
    echo "   Referencia Wompi: " . $payment->wompi_reference . PHP_EOL;
    echo PHP_EOL;
    echo "🔗 URL de checkout:" . PHP_EOL;
    echo "   " . url('/matricula/checkout/' . $payment->id) . PHP_EOL;

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}

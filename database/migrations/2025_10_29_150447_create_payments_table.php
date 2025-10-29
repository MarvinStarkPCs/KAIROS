<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('program_id')->nullable()->constrained('academic_programs')->onDelete('set null');
            $table->foreignId('enrollment_id')->nullable()->constrained('enrollments')->onDelete('set null');
            $table->string('concept'); // Concepto del pago: matrícula, mensualidad, certificado, etc.
            $table->decimal('amount', 10, 2); // Monto del pago
            $table->date('due_date')->nullable(); // Fecha de vencimiento
            $table->date('payment_date')->nullable(); // Fecha en que se realizó el pago
            $table->enum('status', ['pending', 'completed', 'cancelled', 'overdue'])->default('pending');
            $table->string('payment_method')->nullable(); // Efectivo, transferencia, tarjeta, etc.
            $table->string('reference_number')->nullable(); // Número de referencia/comprobante
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null'); // Usuario que registró
            $table->text('notes')->nullable();
            $table->timestamps();

            // Índices para búsquedas rápidas
            $table->index(['student_id', 'status']);
            $table->index('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

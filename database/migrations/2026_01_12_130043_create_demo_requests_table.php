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
        Schema::create('demo_requests', function (Blueprint $table) {
            $table->id();

            // Datos del responsable
            $table->string('responsible_name');
            $table->string('responsible_last_name');
            $table->string('responsible_email');
            $table->string('responsible_phone')->nullable();
            $table->string('responsible_mobile');
            $table->string('responsible_document_type', 10);
            $table->string('responsible_document_number', 50);
            $table->date('responsible_birth_date');
            $table->string('responsible_gender', 1);
            $table->string('responsible_address');
            $table->string('responsible_city');
            $table->string('responsible_department');

            // Tipo de solicitud
            $table->boolean('is_minor')->default(false);

            // Datos del programa demo solicitado
            $table->foreignId('program_id')->constrained('academic_programs')->onDelete('cascade');
            $table->foreignId('schedule_id')->nullable()->constrained('schedules')->onDelete('set null');

            // Datos de estudiantes (JSON para almacenar uno o más)
            $table->json('students_data')->nullable();

            // Estado de la solicitud
            $table->enum('status', ['pending', 'contacted', 'completed', 'cancelled'])->default('pending');

            // Notas adicionales
            $table->text('notes')->nullable();

            $table->timestamps();

            // Índices
            $table->index('responsible_email');
            $table->index('status');
            $table->index('program_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demo_requests');
    }
};

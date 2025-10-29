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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_program_id')->constrained('academic_programs')->onDelete('cascade');
            $table->foreignId('professor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('name', 120); // Nombre del horario/grupo (ej: "Matemáticas - Grupo A")
            $table->text('description')->nullable();

            // Información de horario
            $table->string('days_of_week'); // JSON o string separado por comas: "lunes,miércoles,viernes"
            $table->time('start_time');
            $table->time('end_time');

            // Información adicional
            $table->string('classroom')->nullable(); // Aula/salón
            $table->string('semester')->nullable(); // Semestre/período (ej: "2025-1")
            $table->integer('max_students')->default(30);
            $table->enum('status', ['active', 'inactive', 'completed'])->default('active');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};

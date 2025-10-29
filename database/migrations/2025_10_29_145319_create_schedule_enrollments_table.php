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
        Schema::create('schedule_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('schedule_id')->constrained('schedules')->onDelete('cascade');
            $table->date('enrollment_date')->useCurrent();
            $table->enum('status', ['enrolled', 'dropped', 'completed'])->default('enrolled');
            $table->decimal('final_grade', 5, 2)->nullable(); // Calificación final
            $table->text('notes')->nullable(); // Notas adicionales
            $table->timestamps();

            // Evitar que un estudiante se inscriba dos veces al mismo horario
            $table->unique(['student_id', 'schedule_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_enrollments');
    }
};

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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('schedule_id')->constrained('schedules')->onDelete('cascade');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null'); // Profesor que registró
            $table->date('class_date');
            $table->enum('status', ['present', 'absent', 'late', 'excused'])->default('absent');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Índice único para evitar duplicados
            $table->unique(['student_id', 'schedule_id', 'class_date']);

            // Índice para búsquedas rápidas
            $table->index(['schedule_id', 'class_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};

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
        Schema::create('activity_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('schedule_id')->constrained('schedules')->onDelete('cascade');
            $table->foreignId('activity_id')->constrained('activities')->onDelete('cascade');
            $table->foreignId('evaluation_criteria_id')->nullable()->constrained('evaluation_criteria')->onDelete('cascade');
            $table->decimal('points_earned', 5, 2)->default(0);
            $table->text('feedback')->nullable();
            $table->date('evaluation_date');
            $table->timestamps();

            // Índices para búsquedas rápidas
            $table->index(['student_id', 'activity_id']);
            $table->index(['schedule_id', 'evaluation_date']);
            $table->index('teacher_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_evaluations');
    }
};

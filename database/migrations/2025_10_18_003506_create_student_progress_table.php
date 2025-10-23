<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('program_id')->constrained('academic_programs')->onDelete('cascade');
            $table->foreignId('module_id')->constrained('study_plans')->onDelete('cascade');
            $table->decimal('progress', 5, 2)->default(0);
            $table->text('remarks')->nullable();
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_progress');
    }
};

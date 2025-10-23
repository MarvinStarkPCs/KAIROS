<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('study_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('academic_programs')->onDelete('cascade');
            $table->string('module_name', 120);
            $table->text('description')->nullable();
            $table->integer('hours')->default(0);
            $table->integer('level')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_plans');
    }
};

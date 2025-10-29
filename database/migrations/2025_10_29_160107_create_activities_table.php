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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_plan_id')->constrained('study_plans')->onDelete('cascade');
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->bigInteger('order')->default(0); // Orden de la actividad dentro del módulo
            $table->decimal('weight', 5, 2)->default(0); // Peso/porcentaje para calificación
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            // Índice para ordenamiento
            $table->index(['study_plan_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};

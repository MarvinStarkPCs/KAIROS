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
        Schema::create('evaluation_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained('activities')->onDelete('cascade');
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->decimal('max_points', 5, 2); // Puntuación máxima para este criterio
            $table->integer('order')->default(0); // Orden del criterio
            $table->timestamps();

            // Índice para ordenamiento
            $table->index(['activity_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_criteria');
    }
};

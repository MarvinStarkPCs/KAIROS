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
        Schema::create('teacher_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Información musical profesional
            $table->text('instruments_played');
            $table->text('music_schools')->nullable();
            $table->integer('experience_years')->nullable();

            // Información profesional
            $table->text('bio')->nullable();
            $table->string('specialization')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();

            // Estado
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Relación 1:1 con users
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teacher_profiles');
    }
};

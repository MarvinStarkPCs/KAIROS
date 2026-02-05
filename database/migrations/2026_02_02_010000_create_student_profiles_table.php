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
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Modalidad del programa
            $table->enum('modality', ['Linaje Kids', 'Linaje Teens', 'Linaje Big'])->nullable();

            // Información musical
            $table->string('desired_instrument')->nullable();
            $table->boolean('plays_instrument')->default(false);
            $table->text('instruments_played')->nullable();
            $table->boolean('has_music_studies')->default(false);
            $table->text('music_schools')->nullable();
            $table->integer('current_level')->nullable();

            // Información de emergencia
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();

            // Información médica
            $table->text('medical_conditions')->nullable();
            $table->text('allergies')->nullable();

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
        Schema::dropIfExists('student_profiles');
    }
};

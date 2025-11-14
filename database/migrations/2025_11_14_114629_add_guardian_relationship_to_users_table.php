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
        Schema::table('users', function (Blueprint $table) {
            // Guardian ID: Si el usuario es menor, apunta al usuario responsable
            // Si es null, el usuario es mayor de edad o responsable
            $table->foreignId('guardian_id')->nullable()->after('id')->constrained('users')->onDelete('cascade');

            // Indica si el usuario es el responsable o el estudiante
            $table->enum('user_type', ['guardian', 'student', 'both'])->default('both')->after('guardian_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['guardian_id']);
            $table->dropColumn(['guardian_id', 'user_type']);
        });
    }
};

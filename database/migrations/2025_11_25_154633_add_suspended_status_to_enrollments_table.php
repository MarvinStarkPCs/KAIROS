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
        // Modificar el enum existente para incluir 'suspended'
        DB::statement("ALTER TABLE enrollments MODIFY COLUMN status ENUM('active', 'waiting', 'withdrawn', 'suspended') DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Volver al enum original sin 'suspended'
        DB::statement("ALTER TABLE enrollments MODIFY COLUMN status ENUM('active', 'waiting', 'withdrawn') DEFAULT 'active'");
    }
};

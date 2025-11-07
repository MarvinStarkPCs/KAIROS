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
            // Relación con responsable (parent)
            $table->foreignId('parent_id')
                ->nullable()
                ->after('id')
                ->constrained('users')
                ->nullOnDelete();

            // Información personal
            $table->string('phone', 20)->nullable()->after('email');
            $table->enum('document_type', ['CC', 'TI', 'CE', 'Pasaporte'])
                ->nullable()
                ->after('phone');
            $table->string('document_number', 50)->nullable()->after('document_type');
            $table->date('birth_date')->nullable()->after('document_number');
            $table->text('address')->nullable()->after('birth_date');
        });

        // Hacer email y password nullable para menores sin acceso
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn([
                'parent_id',
                'phone',
                'document_type',
                'document_number',
                'birth_date',
                'address',
            ]);
        });

        // Revertir email y password a NOT NULL
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
            $table->string('password')->nullable(false)->change();
        });
    }
};

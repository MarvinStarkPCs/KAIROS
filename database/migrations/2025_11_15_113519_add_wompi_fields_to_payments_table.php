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
        Schema::table('payments', function (Blueprint $table) {
            // Campos para integración con Wompi
            $table->string('wompi_reference')->nullable()->unique()->after('reference_number');
            $table->string('wompi_transaction_id')->nullable()->after('wompi_reference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['wompi_reference', 'wompi_transaction_id']);
        });
    }
};

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
        Schema::table('enrollments', function (Blueprint $table) {
            // Compromiso de pago
            $table->boolean('payment_commitment_signed')->default(false)->after('status');
            $table->timestamp('payment_commitment_date')->nullable()->after('payment_commitment_signed');

            // Autorización parental (para menores)
            $table->boolean('parental_authorization_signed')->default(false)->after('payment_commitment_date');
            $table->timestamp('parental_authorization_date')->nullable()->after('parental_authorization_signed');
            $table->string('parent_guardian_name')->nullable()->after('parental_authorization_date');

            // Nivel al que se inscribe
            $table->integer('enrolled_level')->nullable()->after('program_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropColumn([
                'payment_commitment_signed',
                'payment_commitment_date',
                'parental_authorization_signed',
                'parental_authorization_date',
                'parent_guardian_name',
                'enrolled_level',
            ]);
        });
    }
};

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
        // Campos de descuento en payment_settings
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->unsignedTinyInteger('discount_min_students')->default(3)->after('enable_manual_payment');
            $table->decimal('discount_percentage', 5, 2)->default(0)->after('discount_min_students');
        });

        // Campos de descuento aplicado en payments
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('discount_percentage', 5, 2)->nullable()->after('original_amount');
            $table->decimal('discount_amount', 10, 2)->nullable()->after('discount_percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn(['discount_min_students', 'discount_percentage']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['discount_percentage', 'discount_amount']);
        });
    }
};

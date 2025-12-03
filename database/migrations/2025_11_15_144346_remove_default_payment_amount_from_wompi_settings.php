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
        Schema::table('wompi_settings', function (Blueprint $table) {
            $table->dropColumn('default_payment_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wompi_settings', function (Blueprint $table) {
            $table->decimal('default_payment_amount', 10, 2)->default(100000)->after('api_url');
        });
    }
};

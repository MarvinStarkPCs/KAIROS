<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->boolean('enable_online_payment')->default(true)->after('is_active');
            $table->boolean('enable_manual_payment')->default(true)->after('enable_online_payment');
        });
    }

    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn(['enable_online_payment', 'enable_manual_payment']);
        });
    }
};

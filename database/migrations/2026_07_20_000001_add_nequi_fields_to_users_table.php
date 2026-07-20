<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nequi_phone')->nullable()->after('mobile');
            $table->string('nequi_payment_source_id')->nullable()->after('nequi_phone');
            $table->boolean('nequi_subscription_active')->default(false)->after('nequi_payment_source_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nequi_phone', 'nequi_payment_source_id', 'nequi_subscription_active']);
        });
    }
};

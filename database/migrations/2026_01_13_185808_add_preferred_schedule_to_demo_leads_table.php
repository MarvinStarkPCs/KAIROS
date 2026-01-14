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
        Schema::table('demo_leads', function (Blueprint $table) {
            $table->string('preferred_schedule')->nullable()->after('instrument');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demo_leads', function (Blueprint $table) {
            $table->dropColumn('preferred_schedule');
        });
    }
};

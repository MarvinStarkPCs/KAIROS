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
            $table->boolean('is_for_child')->default(false)->after('phone');
            $table->string('child_name')->nullable()->after('is_for_child');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demo_leads', function (Blueprint $table) {
            $table->dropColumn(['is_for_child', 'child_name']);
        });
    }
};

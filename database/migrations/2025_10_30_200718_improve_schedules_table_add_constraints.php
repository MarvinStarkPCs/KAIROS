<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add check constraint to ensure start_time < end_time
        // Note: Laravel doesn't support check constraints natively, so we use raw SQL
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE schedules ADD CONSTRAINT chk_schedules_time_range CHECK (start_time < end_time)');
        }

        // Add indexes for better filtering performance
        Schema::table('schedules', function (Blueprint $table) {
            $table->index('days_of_week');
            $table->index('status');
            $table->index(['academic_program_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE schedules DROP CONSTRAINT chk_schedules_time_range');
        }

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex(['days_of_week']);
            $table->dropIndex(['status']);
            $table->dropIndex(['academic_program_id', 'status']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academy_surveys', function (Blueprint $table) {
            $table->unsignedTinyInteger('progress_percent')->default(0)->after('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::table('academy_surveys', function (Blueprint $table) {
            $table->dropColumn('progress_percent');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Auditoría: se lista paginada por fecha descendente.
        Schema::table('activity_log', function (Blueprint $table) {
            $table->index('created_at');
        });

        // Asistencia: conteos del día y del mes filtran solo por fecha.
        Schema::table('attendances', function (Blueprint $table) {
            $table->index('class_date');
        });

        // Pagos: el listado ordena por fecha de creación.
        Schema::table('payments', function (Blueprint $table) {
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['class_date']);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });
    }
};

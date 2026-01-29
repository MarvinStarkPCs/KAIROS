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
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->decimal('amount_linaje_kids', 10, 2)->default(100000)->after('monthly_amount');
            $table->decimal('amount_linaje_teens', 10, 2)->default(100000)->after('amount_linaje_kids');
            $table->decimal('amount_linaje_big', 10, 2)->default(100000)->after('amount_linaje_teens');
        });

        // Migrar valor existente de monthly_amount a los nuevos campos
        DB::table('payment_settings')->update([
            'amount_linaje_kids' => DB::raw('monthly_amount'),
            'amount_linaje_teens' => DB::raw('monthly_amount'),
            'amount_linaje_big' => DB::raw('monthly_amount'),
        ]);

        // Eliminar columna antigua
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn('monthly_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->decimal('monthly_amount', 10, 2)->default(100000)->after('id');
        });

        // Restaurar valor promedio a monthly_amount
        DB::table('payment_settings')->update([
            'monthly_amount' => DB::raw('amount_linaje_kids'),
        ]);

        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn(['amount_linaje_kids', 'amount_linaje_teens', 'amount_linaje_big']);
        });
    }
};

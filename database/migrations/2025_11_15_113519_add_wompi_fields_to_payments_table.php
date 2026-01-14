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
        Schema::table('payments', function (Blueprint $table) {
            // Campos para integración con Wompi
            if (!Schema::hasColumn('payments', 'wompi_reference')) {
                $table->string('wompi_reference')->nullable()->unique()->after('reference_number');
            }
            if (!Schema::hasColumn('payments', 'wompi_transaction_id')) {
                $table->string('wompi_transaction_id')->nullable()->after('wompi_reference');
            }

            // Campos para pagos recurrentes
            if (!Schema::hasColumn('payments', 'is_recurring')) {
                $table->boolean('is_recurring')->default(false)->after('notes');
            }
            if (!Schema::hasColumn('payments', 'card_token')) {
                $table->string('card_token')->nullable()->after('is_recurring');
            }
            if (!Schema::hasColumn('payments', 'payment_source_id')) {
                $table->string('payment_source_id')->nullable()->after('card_token');
            }
            if (!Schema::hasColumn('payments', 'last_4_digits')) {
                $table->string('last_4_digits', 4)->nullable()->after('payment_source_id');
            }
            if (!Schema::hasColumn('payments', 'card_brand')) {
                $table->string('card_brand')->nullable()->after('last_4_digits');
            }
            if (!Schema::hasColumn('payments', 'next_charge_date')) {
                $table->date('next_charge_date')->nullable()->after('card_brand');
            }
            if (!Schema::hasColumn('payments', 'failed_attempts')) {
                $table->integer('failed_attempts')->default(0)->after('next_charge_date');
            }

            // Metadata JSON
            if (!Schema::hasColumn('payments', 'metadata')) {
                $table->json('metadata')->nullable()->after('failed_attempts');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'wompi_reference',
                'wompi_transaction_id',
                'is_recurring',
                'card_token',
                'payment_source_id',
                'last_4_digits',
                'card_brand',
                'next_charge_date',
                'failed_attempts',
                'metadata'
            ]);
        });
    }
};

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
            $table->string('wompi_reference')->nullable()->unique()->after('reference_number');
            $table->string('wompi_transaction_id')->nullable()->after('wompi_reference');

            // Campos adicionales para pagos
            $table->enum('payment_type', ['single', 'partial'])->default('single')->after('concept');
            $table->decimal('original_amount', 10, 2)->nullable()->after('amount');
            $table->decimal('paid_amount', 10, 2)->default(0)->after('original_amount');
            $table->decimal('remaining_amount', 10, 2)->nullable()->after('paid_amount');

            // Campos para pagos recurrentes
            $table->boolean('is_recurring')->default(false)->after('notes');
            $table->string('card_token')->nullable()->after('is_recurring');
            $table->string('payment_source_id')->nullable()->after('card_token');
            $table->string('last_4_digits', 4)->nullable()->after('payment_source_id');
            $table->string('card_brand')->nullable()->after('last_4_digits');
            $table->date('next_charge_date')->nullable()->after('card_brand');
            $table->integer('failed_attempts')->default(0)->after('next_charge_date');

            // Relación con pago padre (para cuotas)
            $table->foreignId('parent_payment_id')->nullable()->constrained('payments')->onDelete('cascade')->after('enrollment_id');

            // Metadata JSON
            $table->json('metadata')->nullable()->after('failed_attempts');
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
                'payment_type',
                'original_amount',
                'paid_amount',
                'remaining_amount',
                'is_recurring',
                'card_token',
                'payment_source_id',
                'last_4_digits',
                'card_brand',
                'next_charge_date',
                'failed_attempts',
                'parent_payment_id',
                'metadata'
            ]);
        });
    }
};

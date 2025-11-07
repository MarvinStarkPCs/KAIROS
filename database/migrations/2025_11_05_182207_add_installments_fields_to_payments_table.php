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
            // Campos para plan de cuotas
            $table->foreignId('parent_payment_id')->nullable()->after('enrollment_id')->constrained('payments')->onDelete('cascade');
            $table->integer('installment_number')->nullable()->after('parent_payment_id'); // Número de cuota actual
            $table->integer('total_installments')->nullable()->after('installment_number'); // Total de cuotas

            // Campos para abonos parciales
            $table->decimal('original_amount', 10, 2)->nullable()->after('amount'); // Monto original total
            $table->decimal('paid_amount', 10, 2)->default(0)->after('original_amount'); // Monto ya pagado/abonado
            $table->decimal('remaining_amount', 10, 2)->nullable()->after('paid_amount'); // Monto restante

            // Tipo de pago
            $table->enum('payment_type', ['single', 'installment', 'partial'])->default('single')->after('concept');
            // single: pago único
            // installment: cuota de un plan de pagos
            // partial: permite abonos parciales

            // Índices
            $table->index('parent_payment_id');
            $table->index('payment_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['parent_payment_id']);
            $table->dropIndex(['payment_type']);
            $table->dropForeign(['parent_payment_id']);
            $table->dropColumn([
                'parent_payment_id',
                'installment_number',
                'total_installments',
                'original_amount',
                'paid_amount',
                'remaining_amount',
                'payment_type',
            ]);
        });
    }
};

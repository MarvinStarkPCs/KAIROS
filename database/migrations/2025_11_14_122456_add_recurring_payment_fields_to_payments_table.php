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
            // Card tokenization for recurring payments
            $table->string('card_token')->nullable()->after('payment_method');
            $table->string('payment_source_id')->nullable()->after('card_token');
            $table->boolean('is_recurring')->default(false)->after('payment_source_id');

            // Card info (for display purposes)
            $table->string('last_4_digits')->nullable()->after('is_recurring');
            $table->string('card_brand')->nullable()->after('last_4_digits'); // Visa, Mastercard, etc

            // Auto-charge info
            $table->timestamp('next_charge_date')->nullable()->after('card_brand');
            $table->integer('failed_attempts')->default(0)->after('next_charge_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'card_token',
                'payment_source_id',
                'is_recurring',
                'last_4_digits',
                'card_brand',
                'next_charge_date',
                'failed_attempts',
            ]);
        });
    }
};

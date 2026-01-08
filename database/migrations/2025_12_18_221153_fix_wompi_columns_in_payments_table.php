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
            // Check and drop old incorrect columns if they exist
            if (Schema::hasColumn('payments', '_reference')) {
                $table->dropColumn('_reference');
            }
            if (Schema::hasColumn('payments', '_transaction_id')) {
                $table->dropColumn('_transaction_id');
            }

            // Add correct Wompi columns if they don't exist
            if (!Schema::hasColumn('payments', 'wompi_reference')) {
                $table->string('wompi_reference')->nullable()->unique()->after('reference_number');
            }
            if (!Schema::hasColumn('payments', 'wompi_transaction_id')) {
                $table->string('wompi_transaction_id')->nullable()->after('wompi_reference');
            }

            // Add payment type if not exists
            if (!Schema::hasColumn('payments', 'payment_type')) {
                $table->enum('payment_type', ['single', 'partial'])->default('single')->after('concept');
            }

            // Add amount fields if not exist
            if (!Schema::hasColumn('payments', 'original_amount')) {
                $table->decimal('original_amount', 10, 2)->nullable()->after('amount');
            }
            if (!Schema::hasColumn('payments', 'paid_amount')) {
                $table->decimal('paid_amount', 10, 2)->default(0)->after('original_amount');
            }
            if (!Schema::hasColumn('payments', 'remaining_amount')) {
                $table->decimal('remaining_amount', 10, 2)->nullable()->after('paid_amount');
            }

            // Add recurring payment fields if not exist
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

            // Add parent payment relationship if not exists
            if (!Schema::hasColumn('payments', 'parent_payment_id')) {
                $table->foreignId('parent_payment_id')->nullable()->constrained('payments')->onDelete('cascade')->after('enrollment_id');
            }

            // Add metadata if not exists
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

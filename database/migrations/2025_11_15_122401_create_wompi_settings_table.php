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
        Schema::create('wompi_settings', function (Blueprint $table) {
            $table->id();
            $table->string('environment')->default('test'); // 'test' o 'production'
            $table->string('public_key');
            $table->string('private_key');
            $table->string('events_secret');
            $table->string('integrity_secret');
            $table->string('api_url')->default('https://sandbox.wompi.co/v1');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wompi_settings');
    }
};

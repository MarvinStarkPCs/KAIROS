<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Remueve los campos de perfil de la tabla users que ahora están en las tablas separadas.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'plays_instrument',
                'instruments_played',
                'has_music_studies',
                'music_schools',
                'desired_instrument',
                'modality',
                'current_level',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('plays_instrument')->default(false)->after('department');
            $table->text('instruments_played')->nullable()->after('plays_instrument');
            $table->boolean('has_music_studies')->default(false)->after('instruments_played');
            $table->text('music_schools')->nullable()->after('has_music_studies');
            $table->string('desired_instrument')->nullable()->after('music_schools');
            $table->enum('modality', ['Linaje Kids', 'Linaje Teens', 'Linaje Big'])->nullable()->after('desired_instrument');
            $table->integer('current_level')->nullable()->after('modality');
        });
    }
};

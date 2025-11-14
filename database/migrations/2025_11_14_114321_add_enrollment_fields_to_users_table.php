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
        Schema::table('users', function (Blueprint $table) {
            // DATOS BÁSICOS (solo campos que no existen)
            $table->string('last_name')->nullable()->after('name');
            $table->string('birth_place')->nullable()->after('document_number');
            $table->enum('gender', ['M', 'F'])->nullable()->after('birth_date');

            // DATOS DE LOCALIZACIÓN (solo campos que no existen)
            $table->string('neighborhood')->nullable()->after('address');
            $table->string('mobile')->nullable()->after('phone');
            $table->string('city')->nullable()->after('mobile');
            $table->string('department')->nullable()->after('city');

            // DATOS MUSICALES
            $table->boolean('plays_instrument')->default(false)->after('department');
            $table->text('instruments_played')->nullable()->after('plays_instrument');
            $table->boolean('has_music_studies')->default(false)->after('instruments_played');
            $table->text('music_schools')->nullable()->after('has_music_studies');
            $table->string('desired_instrument')->nullable()->after('music_schools');
            $table->enum('modality', ['Linaje Kids', 'Linaje Teens', 'Linaje Big'])->nullable()->after('desired_instrument');
            $table->integer('current_level')->nullable()->after('modality');

            // Tipo de usuario
            $table->enum('user_type', ['guardian', 'student', 'both'])->default('both')->after('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'last_name',
                'birth_place',
                'gender',
                'neighborhood',
                'mobile',
                'city',
                'department',
                'plays_instrument',
                'instruments_played',
                'has_music_studies',
                'music_schools',
                'desired_instrument',
                'modality',
                'current_level',
                'user_type',
            ]);
        });
    }
};

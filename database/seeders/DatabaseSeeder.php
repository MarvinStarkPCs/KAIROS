<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call([
            RolePermissionSeeder::class,
        ]);

        // Create test user (Admin)
        $testUser = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $testUser->assignRole('Administrador');

        // Seed users: teachers and students
        $this->call([
            TeacherSeeder::class,
            StudentSeeder::class,
        ]);

        // Seed music academic programs with study plans, activities, and criteria
        $this->call([
            MusicAcademicProgramSeeder::class,
        ]);
    }
}

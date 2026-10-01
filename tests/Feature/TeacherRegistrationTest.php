<?php

use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('Profesor', 'web');
});

function teacherPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Marvin',
        'last_name' => 'Pérez',
        'email' => 'profe@kairos.test',
        'document_type' => 'CC',
        'document_number' => '123456789',
        'birth_date' => '1995-04-12',
        'gender' => 'M',
        'mobile' => '3001234567',
        'address' => 'Calle 1 # 2-3',
        'city' => 'Bogotá',
        'department' => 'Cundinamarca',
        'instruments_played' => 'Guitarra, piano',
        'password' => 'clave-segura-123',
        'password_confirmation' => 'clave-segura-123',
    ], $overrides);
}

test('un profesor se registra desde el formulario público', function () {
    Notification::fake();

    $this->post(route('registro-profesor.store'), teacherPayload())
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $teacher = User::where('email', 'profe@kairos.test')->first();

    expect($teacher)->not->toBeNull()
        ->and($teacher->hasRole('Profesor'))->toBeTrue()
        ->and($teacher->teacherProfile->instruments_played)->toBe('Guitarra, piano');
});

test('el registro se completa aunque falle el envío del correo', function () {
    // Simula el SMTP rechazando la autenticación, como pasó con Gmail.
    Notification::fake();
    Notification::shouldReceive('send')->andThrow(new RuntimeException('Failed to authenticate on SMTP server'));

    $this->post(route('registro-profesor.store'), teacherPayload(['email' => 'otro@kairos.test']))
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $teacher = User::where('email', 'otro@kairos.test')->first();

    expect($teacher)->not->toBeNull()
        ->and($teacher->hasRole('Profesor'))->toBeTrue()
        ->and($teacher->teacherProfile)->not->toBeNull();
});

test('no se crea el profesor si el correo ya existe', function () {
    User::factory()->create(['email' => 'profe@kairos.test']);

    $this->post(route('registro-profesor.store'), teacherPayload())
        ->assertSessionHasErrors('email');

    expect(User::where('email', 'profe@kairos.test')->count())->toBe(1);
});

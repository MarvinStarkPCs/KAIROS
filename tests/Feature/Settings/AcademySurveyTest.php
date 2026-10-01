<?php

use App\Models\AcademicProgram;
use App\Models\AcademySurvey;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['Administrador', 'Profesor', 'Estudiante'] as $role) {
        Role::findOrCreate($role, 'web');
    }
});

function surveyUser(string $role, ?string $email = null): User
{
    $user = User::factory()->create($email ? ['email' => $email] : []);
    $user->assignRole($role);

    return $user;
}

test('un profesor puede ver y responder su propio cuestionario', function () {
    $teacher = surveyUser('Profesor');

    $this->actingAs($teacher)
        ->get(route('academy-survey.show'))
        ->assertOk();

    $answers = [
        'a0__responde' => 'Profe de guitarra',
        'd7' => ['Partitura / acordes', 'Metrónomo'],
        'obs' => [
            [
                'answers' => ['mod' => 'Kids (4–12)'],
                'timeline' => [
                    ['min' => 0, 'momento' => 'Saludo', 'material' => 'Ninguno', 'quien' => 'Profe'],
                ],
            ],
        ],
    ];

    $this->actingAs($teacher)
        ->patch(route('academy-survey.update'), ['answers' => $answers])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect(AcademySurvey::where('user_id', $teacher->id)->first()->answers)->toEqual($answers);

    $this->actingAs($teacher)
        ->get(route('academy-survey.show'))
        ->assertInertia(fn ($page) => $page
            ->component('settings/cuestionario')
            ->where('answers.a0__responde', 'Profe de guitarra')
        );
});

test('cada usuario tiene su propio cuestionario', function () {
    $first = surveyUser('Profesor');
    $second = surveyUser('Profesor');

    $this->actingAs($first)->patch(route('academy-survey.update'), ['answers' => ['a6' => 'Dirección']]);
    $this->actingAs($second)->patch(route('academy-survey.update'), ['answers' => ['a6' => 'Cada profesor']]);
    $this->actingAs($first)->patch(route('academy-survey.update'), ['answers' => ['a6' => 'Se decide entre todos']]);

    expect(AcademySurvey::count())->toBe(2)
        ->and(AcademySurvey::where('user_id', $first->id)->first()->answers)->toEqual(['a6' => 'Se decide entre todos'])
        ->and(AcademySurvey::where('user_id', $second->id)->first()->answers)->toEqual(['a6' => 'Cada profesor']);
});

test('un estudiante no puede responder el cuestionario', function () {
    $student = surveyUser('Estudiante');

    $this->actingAs($student)->get(route('academy-survey.show'))->assertForbidden();
    $this->actingAs($student)->patch(route('academy-survey.update'), ['answers' => []])->assertForbidden();
});

test('solo la cuenta configurada ve los resultados de todos', function () {
    config(['survey.results_email' => 'dev@kairos.test']);

    $dev = surveyUser('Administrador', 'dev@kairos.test');
    $otherAdmin = surveyUser('Administrador', 'otro@kairos.test');
    $teacher = surveyUser('Profesor');

    $this->actingAs($teacher)->patch(route('academy-survey.update'), ['answers' => ['a6' => 'Dirección']]);

    $this->actingAs($otherAdmin)->get(route('academy-survey.results'))->assertForbidden();
    $this->actingAs($teacher)->get(route('academy-survey.results'))->assertForbidden();

    $this->actingAs($dev)
        ->get(route('academy-survey.results'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('settings/cuestionario-resultados')
            ->has('surveys', 1)
            ->where('surveys.0.email', $teacher->email)
        );
});

test('el cuestionario llega prellenado con datos de Kairos', function () {
    $teacher = surveyUser('Profesor');
    $teacher->update(['name' => 'Ana', 'last_name' => 'Ruiz']);
    AcademicProgram::create([
        'name' => 'Programa de Piano',
        'duration_months' => 12,
        'monthly_fee' => 100000,
        'status' => 'active',
    ]);

    $this->actingAs($teacher)
        ->get(route('academy-survey.show'))
        ->assertInertia(fn ($page) => $page
            ->where('prefill.a0__responde', 'Ana Ruiz')
            ->where('prefill.a3', ['Piano / teclado'])
        );
});

test('lo ya respondido no se sobrescribe con el prellenado', function () {
    $teacher = surveyUser('Profesor');
    $teacher->update(['name' => 'Ana', 'last_name' => 'Ruiz']);

    $this->actingAs($teacher)
        ->patch(route('academy-survey.update'), ['answers' => ['a0__responde' => 'Otro nombre']]);

    $this->actingAs($teacher)
        ->get(route('academy-survey.show'))
        ->assertInertia(fn ($page) => $page
            ->where('answers.a0__responde', 'Otro nombre')
            ->where('prefill.a0__responde', 'Ana Ruiz')
        );
});

test('un invitado no puede ver ni guardar el cuestionario', function () {
    $this->get(route('academy-survey.show'))->assertRedirect(route('login'));
    $this->patch(route('academy-survey.update'), ['answers' => []])->assertRedirect(route('login'));
    $this->get(route('academy-survey.results'))->assertRedirect(route('login'));
});

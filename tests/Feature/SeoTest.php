<?php

use App\Models\AcademicProgram;
use App\Support\PublicPrograms;

beforeEach(function () {
    AcademicProgram::create(['name' => 'Programa de Bateria', 'description' => 'Ritmo y coordinación.', 'monthly_fee' => 100000, 'status' => 'active', 'is_demo' => false, 'duration_months' => 12]);
    AcademicProgram::create(['name' => 'Demo Piano', 'description' => 'Primera clase', 'monthly_fee' => 0, 'status' => 'active', 'is_demo' => true, 'duration_months' => 1]);
    AcademicProgram::create(['name' => 'Programa de Arpa', 'monthly_fee' => 100000, 'status' => 'inactive', 'is_demo' => false, 'duration_months' => 12]);
});

it('limpia el nombre administrativo del programa para la URL', function () {
    expect(PublicPrograms::label('Programa de Bateria'))->toBe('Batería')
        ->and(PublicPrograms::label('Guitarra Popular'))->toBe('Guitarra Popular');
});

it('publica solo los programas regulares activos', function () {
    expect(collect(PublicPrograms::all())->pluck('slug')->all())->toBe(['bateria']);
});

it('muestra la página del programa con su SEO', function () {
    $this->get('/clases/bateria')
        ->assertOk()
        ->assertSee('<title inertia>Clases de Batería en Ocaña | Academia Linaje</title>', false)
        ->assertSee('<link rel="canonical" href="https://academialinaje.com/clases/bateria">', false)
        ->assertSee('"@type":"Course"', false);
});

it('responde 404 para programas inexistentes, demo o inactivos', function (string $slug) {
    $this->get("/clases/{$slug}")->assertNotFound();
})->with(['no-existe', 'demo-piano', 'arpa']);

it('incluye las páginas de programas en el sitemap', function () {
    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertSee('<loc>https://academialinaje.com/clases/bateria</loc>', false)
        ->assertDontSee('demo-piano');
});

it('marca la portada con la academia y sus preguntas frecuentes', function () {
    $this->get('/')
        ->assertOk()
        ->assertSee('"@type":"MusicSchool"', false)
        ->assertSee('"addressLocality":"Ocaña"', false)
        ->assertSee('"@type":"FAQPage"', false);
});

it('deja fuera del índice las páginas privadas', function () {
    $this->get('/login')->assertSee('<meta name="robots" content="noindex, nofollow">', false);
});

<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;

// Ruta de prueba para verificar errores de Inertia
Route::get('/test-errors', function () {
    return Inertia::render('TestErrors');
})->name('test.errors');

Route::post('/test-errors', function (Request $request) {
    $request->validate([
        'name' => 'required|min:3',
        'email' => 'required|email',
    ], [
        'name.required' => 'El nombre es obligatorio',
        'name.min' => 'El nombre debe tener al menos 3 caracteres',
        'email.required' => 'El email es obligatorio',
        'email.email' => 'El email debe ser válido',
    ]);

    flash_success('Formulario enviado correctamente');
    return redirect()->back();
})->name('test.errors.store');

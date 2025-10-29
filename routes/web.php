<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\program_academy;
use App\Http\Controllers\schedules;
use App\Http\Controllers\Assists;
use App\Http\Controllers\Pay;
use App\Http\Controllers\StudyPlanController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});


Route::middleware(['auth'])->group(function () {
    // Roles
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

    // Usuarios
    Route::get('/usuarios', [UserController::class, 'index'])->name('usuarios.index');
    Route::get('/usuarios/create', [UserController::class, 'create'])->name('usuarios.create');
    Route::post('/usuarios', [UserController::class, 'store'])->name('usuarios.store');
    Route::get('/usuarios/{user}/edit', [UserController::class, 'edit'])->name('usuarios.edit');
    Route::put('/usuarios/{user}', [UserController::class, 'update'])->name('usuarios.update');
    Route::delete('/usuarios/{user}', [UserController::class, 'destroy'])->name('usuarios.destroy');
     Route::get('/auditoria', [AuditController::class, 'index'])->name('audit.index');
    Route::get('/auditoria/filter', [AuditController::class, 'filter'])->name('audit.filter');

    // Programas Académicos
    Route::get('/programas_academicos', [program_academy::class, 'index'])->name('programas_academicos.index');
    Route::get('/programas_academicos/create', [program_academy::class, 'create'])->name('programas_academicos.create');
    Route::post('/programas_academicos', [program_academy::class, 'store'])->name('programas_academicos.store');
    Route::get('/programas_academicos/{program}', [program_academy::class, 'show'])->name('programas_academicos.show');
    Route::get('/programas_academicos/{program}/edit', [program_academy::class, 'edit'])->name('programas_academicos.edit');
    Route::put('/programas_academicos/{program}', [program_academy::class, 'update'])->name('programas_academicos.update');
    Route::delete('/programas_academicos/{program}', [program_academy::class, 'destroy'])->name('programas_academicos.destroy');

    // Study Plans (Módulos)
    Route::post('/programas_academicos/{program}/study-plans', [StudyPlanController::class, 'store'])->name('study_plans.store');
    Route::put('/study-plans/{studyPlan}', [StudyPlanController::class, 'update'])->name('study_plans.update');
    Route::delete('/study-plans/{studyPlan}', [StudyPlanController::class, 'destroy'])->name('study_plans.destroy');

    // Activities
    Route::post('/study-plans/{studyPlan}/activities', [StudyPlanController::class, 'storeActivity'])->name('activities.store');
    Route::put('/activities/{activity}', [StudyPlanController::class, 'updateActivity'])->name('activities.update');
    Route::delete('/activities/{activity}', [StudyPlanController::class, 'destroyActivity'])->name('activities.destroy');

    // Evaluation Criteria
    Route::post('/activities/{activity}/criteria', [StudyPlanController::class, 'storeCriteria'])->name('criteria.store');
    Route::put('/criteria/{criteria}', [StudyPlanController::class, 'updateCriteria'])->name('criteria.update');
    Route::delete('/criteria/{criteria}', [StudyPlanController::class, 'destroyCriteria'])->name('criteria.destroy');

    Route::get('/horarios', [schedules::class, 'index'])->name('horarios.index');
    Route::get('/asistencia', [Assists::class, 'index'])->name('asistencias.index');
    Route::get('/pagos', [Pay::class, 'index'])->name('pagos.index');



});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
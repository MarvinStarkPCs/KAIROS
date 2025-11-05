<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuditController;
use App\Http\Controllers\program_academy;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\PaymentController;
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

    // API: Get schedules for a program
    Route::get('/api/programas/{program}/horarios', [program_academy::class, 'getSchedules'])->name('api.programas.horarios');

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

    // Inscripciones a Programas (Enrollments)
    Route::get('/inscripciones', [EnrollmentController::class, 'index'])->name('inscripciones.index');
    Route::get('/inscripciones/create', [EnrollmentController::class, 'create'])->name('inscripciones.create');
    Route::post('/inscripciones', [EnrollmentController::class, 'store'])->name('inscripciones.store');
    Route::get('/inscripciones/{enrollment}', [EnrollmentController::class, 'show'])->name('inscripciones.show');
    Route::get('/inscripciones/{enrollment}/edit', [EnrollmentController::class, 'edit'])->name('inscripciones.edit');
    Route::put('/inscripciones/{enrollment}', [EnrollmentController::class, 'update'])->name('inscripciones.update');
    Route::delete('/inscripciones/{enrollment}', [EnrollmentController::class, 'destroy'])->name('inscripciones.destroy');

    // Acciones rápidas de inscripciones
    Route::post('/inscripciones/quick-enroll', [EnrollmentController::class, 'quickEnroll'])->name('inscripciones.quick-enroll');
    Route::post('/inscripciones/{enrollment}/change-status', [EnrollmentController::class, 'changeStatus'])->name('inscripciones.change-status');
    Route::get('/programs/{program}/available-students', [EnrollmentController::class, 'availableStudents'])->name('programs.available-students');

    // Horarios (Schedules)
    Route::get('/horarios', [ScheduleController::class, 'index'])->name('horarios.index');
    Route::get('/horarios/create', [ScheduleController::class, 'create'])->name('horarios.create');
    Route::post('/horarios', [ScheduleController::class, 'store'])->name('horarios.store');
    Route::get('/horarios/{schedule}', [ScheduleController::class, 'show'])->name('horarios.show');
    Route::get('/horarios/{schedule}/edit', [ScheduleController::class, 'edit'])->name('horarios.edit');
    Route::put('/horarios/{schedule}', [ScheduleController::class, 'update'])->name('horarios.update');
    Route::delete('/horarios/{schedule}', [ScheduleController::class, 'destroy'])->name('horarios.destroy');

    // API de calendarios
    Route::get('/horarios-api/calendar-events', [ScheduleController::class, 'calendarEvents'])->name('horarios.calendar-events');
    Route::post('/horarios-api/check-conflicts', [ScheduleController::class, 'checkStudentConflicts'])->name('horarios.check-conflicts');

    // Inscripciones en horarios
    Route::post('/horarios/{schedule}/enroll', [ScheduleController::class, 'enrollStudent'])->name('horarios.enroll');
    Route::post('/horarios/{schedule}/bulk-enroll', [ScheduleController::class, 'bulkEnroll'])->name('horarios.bulk-enroll');
    Route::delete('/horarios/{schedule}/students/{student}', [ScheduleController::class, 'disenrollStudent'])->name('horarios.disenroll');

    // Asistencia
    Route::get('/asistencia', [AttendanceController::class, 'index'])->name('asistencias.index');
    Route::post('/asistencia', [AttendanceController::class, 'store'])->name('asistencias.store');
    Route::put('/asistencia/{attendance}', [AttendanceController::class, 'update'])->name('asistencias.update');
    Route::delete('/asistencia/{attendance}', [AttendanceController::class, 'destroy'])->name('asistencias.destroy');
    Route::post('/asistencia/bulk', [AttendanceController::class, 'bulkStore'])->name('asistencias.bulk');

    // Pagos
    Route::get('/pagos', [PaymentController::class, 'index'])->name('pagos.index'); // Dashboard
    Route::get('/pagos/list', [PaymentController::class, 'list'])->name('pagos.list'); // Lista/Tabla
    Route::get('/pagos/create', [PaymentController::class, 'create'])->name('pagos.create'); // Crear
    Route::get('/pagos/{payment}', [PaymentController::class, 'show'])->name('pagos.show'); // Ver
    Route::get('/pagos/{payment}/edit', [PaymentController::class, 'edit'])->name('pagos.edit'); // Editar
    Route::post('/pagos', [PaymentController::class, 'store'])->name('pagos.store'); // Guardar
    Route::put('/pagos/{payment}', [PaymentController::class, 'update'])->name('pagos.update'); // Actualizar
    Route::delete('/pagos/{payment}', [PaymentController::class, 'destroy'])->name('pagos.destroy'); // Eliminar
    Route::post('/pagos/{payment}/mark-paid', [PaymentController::class, 'markAsPaid'])->name('pagos.mark-paid'); // Marcar como pagado
    Route::get('/pagos/{payment}/invoice', [PaymentController::class, 'generateInvoice'])->name('pagos.invoice'); // Factura



});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
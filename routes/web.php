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
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\CommunicationController;
use App\Http\Controllers\MatriculaController;
use App\Http\Controllers\DemoLeadController;
use App\Http\Controllers\Admin\DemoLeadController as AdminDemoLeadController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\DependentController;
use App\Http\Controllers\TeacherRegistrationController;

// Demo Lead desde Welcome (sin autenticación, con rate limiting)
Route::middleware(['throttle:5,1'])->group(function () {
    Route::post('/demo/solicitud', [DemoLeadController::class, 'store'])->name('demo.lead.store');
});

// Matrícula Pública (sin autenticación, con rate limiting)
Route::middleware(['throttle:10,1'])->group(function () {
    Route::get('/matricula', [MatriculaController::class, 'create'])->name('matricula.create');
    Route::post('/matricula', [MatriculaController::class, 'store'])->name('matricula.store');
    Route::get('/matricula/demo/confirmacion/{request}', [MatriculaController::class, 'demoConfirmation'])->name('matricula.demo.confirmacion');
});

Route::middleware(['throttle:20,1'])->group(function () {
    Route::get('/matricula/checkout/{payment}', [MatriculaController::class, 'checkout'])->name('matricula.checkout');
    Route::post('/matricula/checkout/{payment}/create-payment-link', [MatriculaController::class, 'createPaymentLink'])->name('matricula.create-payment-link');
    Route::post('/matricula/checkout/{payment}/manual', [MatriculaController::class, 'checkoutManualPayment'])->name('matricula.checkout.manual');
    Route::get('/matricula/checkout-multiple', [MatriculaController::class, 'checkoutMultiple'])->name('matricula.checkout.multiple');
    Route::get('/matricula/confirmacion', [MatriculaController::class, 'confirmation'])->name('matricula.confirmation');
});

// Webhook de Wompi (sin autenticación)
Route::post('/webhook/wompi', [PaymentController::class, 'wompiWebhook'])->name('webhook.wompi');

// Registro Público de Profesores (sin autenticación, con rate limiting)
Route::middleware(['throttle:10,1'])->group(function () {
    Route::get('/registro-profesor', [TeacherRegistrationController::class, 'create'])->name('registro-profesor.create');
    Route::post('/registro-profesor', [TeacherRegistrationController::class, 'store'])->name('registro-profesor.store');
    Route::get('/registro-profesor/confirmacion/{teacher}', [TeacherRegistrationController::class, 'confirmation'])->name('registro-profesor.confirmacion');
});

// TEST: Ruta de prueba para verificar errores de Inertia
Route::get('/test-errors', function () {
    return Inertia::render('TestErrors');
})->name('test.errors');

Route::post('/test-errors', function (\Illuminate\Http\Request $request) {
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

Route::get('/', function () {
    $demoPrograms = \App\Models\AcademicProgram::where('is_demo', true)
        ->where('status', 'active')
        ->with(['schedules' => function ($query) {
            $query->where('status', 'active')
                ->with('professor:id,name')
                ->withCount(['enrollments as enrolled_count' => function ($q) {
                    $q->where('status', 'enrolled');
                }])
                ->select('id', 'academic_program_id', 'days_of_week', 'start_time', 'end_time', 'professor_id', 'max_students', 'status');
        }])
        ->select('id', 'name', 'description')
        ->orderBy('name')
        ->get();

    // Agregar información de cupos disponibles
    $demoPrograms->each(function ($program) {
        $program->schedules->each(function ($schedule) {
            $schedule->available_slots = $schedule->max_students - $schedule->enrolled_count;
            $schedule->has_capacity = $schedule->available_slots > 0;
        });
    });

    // Filtrar solo programas que tienen horarios con capacidad disponible
    $demoPrograms = $demoPrograms->filter(function($program) {
        return $program->schedules->where('has_capacity', true)->count() > 0;
    })->values();

    // Programas académicos normales (no demo) para mostrar en la sección de programas
    // Agrupamos por nombre para evitar duplicados (pueden existir varios registros del mismo programa)
    $academicPrograms = \App\Models\AcademicProgram::where('is_demo', false)
        ->where('status', 'active')
        ->select('id', 'name', 'description', 'monthly_fee', 'icon', 'color')
        ->orderBy('name')
        ->get()
        ->unique('name')
        ->values();

    return Inertia::render('welcome', [
        'demoPrograms' => $demoPrograms,
        'academicPrograms' => $academicPrograms,
    ]);
})->name('home');

Route::middleware(['auth'])->group(function () {
    // === RUTAS ADMINISTRATIVAS ===

    // Roles (requiere permisos específicos)
    Route::middleware(['permission:ver_roles'])->group(function () {
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    });
    Route::middleware(['permission:crear_rol'])->group(function () {
        Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
    });
    Route::middleware(['permission:editar_rol'])->group(function () {
        Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
        Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    });
    Route::middleware(['permission:eliminar_rol'])->group(function () {
        Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
    });

    // Usuarios (requiere permisos específicos)
    Route::middleware(['permission:ver_usuarios'])->group(function () {
        Route::get('/usuarios/search', [UserController::class, 'search'])->name('usuarios.search');
        Route::get('/usuarios', [UserController::class, 'index'])->name('usuarios.index');
        Route::get('/usuarios/{user}', [UserController::class, 'show'])->name('usuarios.show');
    });
    Route::middleware(['permission:crear_usuario'])->group(function () {
        Route::get('/usuarios/create', [UserController::class, 'create'])->name('usuarios.create');
        Route::post('/usuarios', [UserController::class, 'store'])->name('usuarios.store');
    });
    Route::middleware(['permission:editar_usuario'])->group(function () {
        Route::get('/usuarios/{user}/edit', [UserController::class, 'edit'])->name('usuarios.edit');
        Route::put('/usuarios/{user}', [UserController::class, 'update'])->name('usuarios.update');
    });
    Route::middleware(['permission:eliminar_usuario'])->group(function () {
        Route::delete('/usuarios/{user}', [UserController::class, 'destroy'])->name('usuarios.destroy');
    });

    // Auditoría
    Route::middleware(['permission:ver_auditoria'])->group(function () {
        Route::get('/auditoria', [AuditController::class, 'index'])->name('audit.index');
        Route::get('/auditoria/filter', [AuditController::class, 'filter'])->name('audit.filter');
    });

    // Demo Leads (Gestión de solicitudes de clases demo)
    Route::prefix('admin/demo-leads')->name('admin.demo-leads.')->middleware(['permission:ver_demo_leads'])->group(function () {
        Route::get('/', [AdminDemoLeadController::class, 'index'])->name('index');
        Route::get('/{lead}', [AdminDemoLeadController::class, 'show'])->name('show');
        Route::patch('/{lead}/status', [AdminDemoLeadController::class, 'updateStatus'])->name('update-status');
        Route::patch('/{lead}/notes', [AdminDemoLeadController::class, 'updateNotes'])->name('update-notes');
        Route::delete('/{lead}', [AdminDemoLeadController::class, 'destroy'])->name('destroy');
    });

    // Programas Académicos
    Route::middleware(['permission:crear_programa'])->group(function () {
        Route::get('/programas_academicos/create', [program_academy::class, 'create'])->name('programas_academicos.create');
        Route::post('/programas_academicos', [program_academy::class, 'store'])->name('programas_academicos.store');
    });
    Route::middleware(['permission:ver_programas'])->group(function () {
        Route::get('/programas_academicos', [program_academy::class, 'index'])->name('programas_academicos.index');
        Route::get('/programas_academicos/{program}', [program_academy::class, 'show'])->name('programas_academicos.show');
    });
    Route::middleware(['permission:editar_programa'])->group(function () {
        Route::get('/programas_academicos/{program}/edit', [program_academy::class, 'edit'])->name('programas_academicos.edit');
        Route::put('/programas_academicos/{program}', [program_academy::class, 'update'])->name('programas_academicos.update');
    });
    Route::middleware(['permission:eliminar_programa'])->group(function () {
        Route::delete('/programas_academicos/{program}', [program_academy::class, 'destroy'])->name('programas_academicos.destroy');
    });

    // Study Plans y Activities
    Route::middleware(['permission:crear_plan_estudio'])->group(function () {
        Route::post('/programas_academicos/{program}/study-plans', [StudyPlanController::class, 'store'])->name('study_plans.store');
    });
    Route::middleware(['permission:editar_plan_estudio'])->group(function () {
        Route::put('/study-plans/{studyPlan}', [StudyPlanController::class, 'update'])->name('study_plans.update');
    });
    Route::middleware(['permission:eliminar_plan_estudio'])->group(function () {
        Route::delete('/study-plans/{studyPlan}', [StudyPlanController::class, 'destroy'])->name('study_plans.destroy');
    });
    Route::middleware(['permission:crear_actividad'])->group(function () {
        Route::post('/study-plans/{studyPlan}/activities', [StudyPlanController::class, 'storeActivity'])->name('activities.store');
    });
    Route::middleware(['permission:editar_actividad'])->group(function () {
        Route::put('/activities/{activity}', [StudyPlanController::class, 'updateActivity'])->name('activities.update');
    });
    Route::middleware(['permission:eliminar_actividad'])->group(function () {
        Route::delete('/activities/{activity}', [StudyPlanController::class, 'destroyActivity'])->name('activities.destroy');
    });
    Route::middleware(['permission:crear_criterio_evaluacion'])->group(function () {
        Route::post('/activities/{activity}/criteria', [StudyPlanController::class, 'storeCriteria'])->name('criteria.store');
    });
    Route::middleware(['permission:editar_criterio_evaluacion'])->group(function () {
        Route::put('/criteria/{criteria}', [StudyPlanController::class, 'updateCriteria'])->name('criteria.update');
    });
    Route::middleware(['permission:eliminar_criterio_evaluacion'])->group(function () {
        Route::delete('/criteria/{criteria}', [StudyPlanController::class, 'destroyCriteria'])->name('criteria.destroy');
    });

    // Inscripciones
    Route::middleware(['permission:ver_inscripciones'])->group(function () {
        Route::get('/matriculas', [EnrollmentController::class, 'index'])->name('inscripciones.index');
        Route::get('/matriculas/{enrollment}', [EnrollmentController::class, 'show'])->name('inscripciones.show');
        Route::get('/programs/{program}/available-students', [EnrollmentController::class, 'availableStudents'])->name('programs.available-students');
    });
    Route::middleware(['permission:crear_inscripcion'])->group(function () {
        Route::get('/matriculas/create', [EnrollmentController::class, 'create'])->name('inscripciones.create');
        Route::post('/matriculas', [EnrollmentController::class, 'store'])->name('inscripciones.store');
        Route::post('/matriculas/quick-enroll', [EnrollmentController::class, 'quickEnroll'])->name('inscripciones.quick-enroll');
    });
    Route::middleware(['permission:editar_inscripcion'])->group(function () {
        Route::get('/matriculas/{enrollment}/edit', [EnrollmentController::class, 'edit'])->name('inscripciones.edit');
        Route::put('/matriculas/{enrollment}', [EnrollmentController::class, 'update'])->name('inscripciones.update');
    });
    Route::middleware(['permission:cambiar_estado_inscripcion'])->group(function () {
        Route::post('/matriculas/{enrollment}/change-status', [EnrollmentController::class, 'changeStatus'])->name('inscripciones.change-status');
    });
    Route::middleware(['permission:eliminar_inscripcion'])->group(function () {
        Route::delete('/matriculas/{enrollment}', [EnrollmentController::class, 'destroy'])->name('inscripciones.destroy');
    });

    // Horarios
    Route::middleware(['permission:ver_horarios'])->group(function () {
        Route::get('/horarios', [ScheduleController::class, 'index'])->name('horarios.index');
        Route::get('/horarios/{schedule}', [ScheduleController::class, 'show'])->name('horarios.show');
    });
    Route::middleware(['permission:crear_horario'])->group(function () {
        Route::get('/horarios/create', [ScheduleController::class, 'create'])->name('horarios.create');
        Route::post('/horarios', [ScheduleController::class, 'store'])->name('horarios.store');
    });
    Route::middleware(['permission:editar_horario'])->group(function () {
        Route::get('/horarios/{schedule}/edit', [ScheduleController::class, 'edit'])->name('horarios.edit');
        Route::put('/horarios/{schedule}', [ScheduleController::class, 'update'])->name('horarios.update');
        Route::patch('/horarios/{schedule}/professor', [ScheduleController::class, 'updateProfessor'])->name('horarios.update-professor');
    });
    Route::middleware(['permission:eliminar_horario'])->group(function () {
        Route::delete('/horarios/{schedule}', [ScheduleController::class, 'destroy'])->name('horarios.destroy');
    });
    Route::middleware(['permission:inscribir_estudiante_horario'])->group(function () {
        Route::post('/horarios/{schedule}/enroll', [ScheduleController::class, 'enrollStudent'])->name('horarios.enroll');
        Route::post('/horarios/{schedule}/bulk-enroll', [ScheduleController::class, 'bulkEnroll'])->name('horarios.bulk-enroll');
    });
    Route::middleware(['permission:desinscribir_estudiante_horario'])->group(function () {
        Route::delete('/horarios/{schedule}/students/{student}', [ScheduleController::class, 'disenrollStudent'])->name('horarios.disenroll');
    });

    // Asistencia (Admin)
    Route::middleware(['permission:ver_asistencia'])->group(function () {
        Route::get('/asistencia', [AttendanceController::class, 'index'])->name('asistencias.index');
    });
    Route::middleware(['permission:registrar_asistencia'])->group(function () {
        Route::post('/asistencia', [AttendanceController::class, 'store'])->name('asistencias.store');
        Route::post('/asistencia/bulk', [AttendanceController::class, 'bulkStore'])->name('asistencias.bulk');
    });
    Route::middleware(['permission:editar_asistencia'])->group(function () {
        Route::put('/asistencia/{attendance}', [AttendanceController::class, 'update'])->name('asistencias.update');
    });
    Route::middleware(['permission:eliminar_asistencia'])->group(function () {
        Route::delete('/asistencia/{attendance}', [AttendanceController::class, 'destroy'])->name('asistencias.destroy');
    });

    // Pagos
    Route::middleware(['permission:ver_pagos'])->group(function () {
        Route::get('/pagos', [PaymentController::class, 'index'])->name('pagos.index');
        Route::get('/pagos/settings', [PaymentController::class, 'settings'])->name('pagos.settings');
        Route::get('/pagos/{payment}', [PaymentController::class, 'show'])->name('pagos.show');
        Route::get('/pagos/{payment}/details', [PaymentController::class, 'getPaymentDetails'])->name('pagos.details');
    });
    Route::middleware(['permission:editar_pago'])->group(function () {
        Route::patch('/pagos/settings', [PaymentController::class, 'updateSettings'])->name('pagos.settings.update');
    });
    Route::middleware(['permission:crear_pago'])->group(function () {
        Route::get('/pagos/create', [PaymentController::class, 'create'])->name('pagos.create');
        Route::post('/pagos', [PaymentController::class, 'store'])->name('pagos.store');
        Route::post('/pagos/create-installments', [PaymentController::class, 'createInstallments'])->name('pagos.create-installments');
    });
    Route::middleware(['permission:editar_pago'])->group(function () {
        Route::get('/pagos/{payment}/edit', [PaymentController::class, 'edit'])->name('pagos.edit');
        Route::put('/pagos/{payment}', [PaymentController::class, 'update'])->name('pagos.update');
    });
    Route::middleware(['permission:procesar_pago'])->group(function () {
        Route::post('/pagos/{payment}/mark-paid', [PaymentController::class, 'markAsPaid'])->name('pagos.mark-paid');
        Route::post('/pagos/{payment}/add-transaction', [PaymentController::class, 'addTransaction'])->name('pagos.add-transaction');
        Route::post('/pagos/{payment}/check-wompi', [PaymentController::class, 'checkWompiStatus'])->name('pagos.check-wompi');
    });
    Route::middleware(['permission:generar_factura'])->group(function () {
        Route::get('/pagos/{payment}/invoice', [PaymentController::class, 'generateInvoice'])->name('pagos.invoice');
    });
    Route::middleware(['permission:eliminar_pago'])->group(function () {
        Route::delete('/pagos/{payment}', [PaymentController::class, 'destroy'])->name('pagos.destroy');
    });

    // === PORTAL DE PROFESORES ===
    Route::prefix('profesor')->group(function () {
        Route::middleware(['permission:ver_mis_grupos'])->group(function () {
            Route::get('/mis-grupos', [TeacherController::class, 'myGroups'])->name('profesor.mis-grupos');
            Route::get('/grupo/{schedule}', [TeacherController::class, 'groupDetail'])->name('profesor.grupo.detalle');
        });
        Route::middleware(['permission:marcar_asistencia_grupo'])->group(function () {
            Route::post('/grupo/{schedule}/asistencia', [TeacherController::class, 'markGroupAttendance'])->name('profesor.marcar-asistencia');
        });
        Route::middleware(['permission:evaluar_estudiantes'])->group(function () {
            Route::get('/grupo/{schedule}/actividad/{activity}/evaluar', [TeacherController::class, 'evaluateActivity'])->name('profesor.evaluar-actividad');
            Route::post('/grupo/{schedule}/actividad/{activity}/evaluaciones', [TeacherController::class, 'storeEvaluations'])->name('profesor.guardar-evaluaciones');
        });
    });

    // === PORTAL DE ESTUDIANTES ===
    Route::prefix('estudiante')->group(function () {
        Route::middleware(['role:Estudiante|Administrador'])->group(function () {
            Route::get('/calificaciones/{programId?}', [StudentController::class, 'grades'])->name('estudiante.calificaciones');
        });
    });

    // === PORTAL DE PADRES/RESPONSABLES ===
    Route::prefix('padre')->middleware(['role:Padre/Madre|Administrador'])->group(function () {
        Route::get('/dashboard', [ParentController::class, 'dashboard'])->name('padre.dashboard');
        Route::get('/hijo/{child}/calificaciones/{programId?}', [ParentController::class, 'childGrades'])->name('padre.hijo.calificaciones');
    });

    // === GESTIÓN DE DEPENDIENTES (para Padre/Madre) ===
    Route::prefix('dependientes')->middleware(['role:Padre/Madre|Administrador'])->group(function () {
        Route::get('/', [DependentController::class, 'index'])->name('dependientes.index');
        Route::get('/crear', [DependentController::class, 'create'])->name('dependientes.create');
        Route::post('/', [DependentController::class, 'store'])->name('dependientes.store');
        Route::get('/{dependent}', [DependentController::class, 'show'])->name('dependientes.show');
        Route::get('/{dependent}/editar', [DependentController::class, 'edit'])->name('dependientes.edit');
        Route::put('/{dependent}', [DependentController::class, 'update'])->name('dependientes.update');
        Route::delete('/{dependent}', [DependentController::class, 'destroy'])->name('dependientes.destroy');
    });

    // === RUTA DASHBOARD (redirect por rol - para Fortify two-factor y otros redirects) ===
    Route::get('/dashboard', function () {
        $user = auth()->user();
        if ($user->hasRole('Administrador')) {
            return redirect()->route('programas_academicos.index');
        }
        if ($user->hasRole('Estudiante')) {
            return redirect()->route('estudiante.calificaciones');
        }
        if ($user->hasRole('Profesor')) {
            return redirect()->route('profesor.mis-grupos');
        }
        if ($user->hasRole('Padre/Madre')) {
            return redirect()->route('padre.dashboard');
        }
        return redirect()->route('programas_academicos.index');
    })->name('dashboard');

    // Comunicaciones
    Route::middleware(['permission:ver_comunicacion'])->group(function () {
        Route::get('/comunicacion', [CommunicationController::class, 'index'])->name('comunicacion.index');
        Route::get('/comunicacion/{conversation}', [CommunicationController::class, 'show'])->name('comunicacion.show');
        Route::post('/comunicacion/start', [CommunicationController::class, 'start'])->name('comunicacion.start');
        Route::post('/comunicacion/{conversation}/message', [CommunicationController::class, 'sendMessage'])->name('comunicacion.send');
        Route::get('/api/comunicacion/users', [CommunicationController::class, 'users'])->name('comunicacion.users');
    });

    // === RUTAS COMPARTIDAS (APIs y recursos de solo lectura) ===
    Route::get('/api/programas/{program}/horarios', [program_academy::class, 'getSchedules'])->name('api.programas.horarios');
    Route::get('/horarios-api/calendar-events', [ScheduleController::class, 'calendarEvents'])->name('horarios.calendar-events');
    Route::post('/horarios-api/check-conflicts', [ScheduleController::class, 'checkStudentConflicts'])->name('horarios.check-conflicts');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
<?php

namespace App\Http\Controllers;

use App\Models\AcademicProgram;
use Illuminate\Http\Request;
use Inertia\Inertia;

class program_academy extends Controller
{
    public function index()
    {
        // Obtener todos los programas con sus relaciones y contadores
        $programs = AcademicProgram::withCount(['activeStudents', 'schedules', 'activeSchedules'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'description' => $program->description,
                    'duration_months' => $program->duration_months,
                    'status' => $program->status,
                    'color' => $program->color,
                    'active_students_count' => $program->active_students_count,
                    'schedules_count' => $program->schedules_count,
                    'active_schedules_count' => $program->active_schedules_count,
                    'created_at' => $program->created_at->format('Y-m-d'),
                ];
            });

        // Estadísticas generales
        $stats = [
            'total_programs' => AcademicProgram::count(),
            'active_programs' => AcademicProgram::where('status', 'active')->count(),
            'total_students' => \App\Models\User::whereHas('roles', function($q) {
                $q->where('name', 'Estudiante');
            })->count(),
            'total_professors' => \App\Models\User::whereHas('roles', function($q) {
                $q->where('name', 'Profesor');
            })->count(),
        ];

        return Inertia::render('ProgramAcademy/Index', [
            'programs' => $programs,
            'stats' => $stats,
        ]);
    }

    public function show(AcademicProgram $program)
    {
        $program->load([
            'studyPlans.activities.evaluationCriteria'
        ]);

        $studyPlans = $program->studyPlans->map(function ($studyPlan) {
            return [
                'id' => $studyPlan->id,
                'module_name' => $studyPlan->module_name,
                'description' => $studyPlan->description,
                'hours' => $studyPlan->hours,
                'level' => $studyPlan->level,
                'activities' => $studyPlan->activities->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'name' => $activity->name,
                        'description' => $activity->description,
                        'order' => $activity->order,
                        'weight' => $activity->weight,
                        'status' => $activity->status,
                        'evaluation_criteria' => $activity->evaluationCriteria->map(function ($criteria) {
                            return [
                                'id' => $criteria->id,
                                'name' => $criteria->name,
                                'description' => $criteria->description,
                                'max_points' => $criteria->max_points,
                                'order' => $criteria->order,
                            ];
                        })->toArray(),
                    ];
                })->toArray(),
            ];
        });

        return Inertia::render('ProgramAcademy/Show', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'description' => $program->description,
                'duration_months' => $program->duration_months,
                'status' => $program->status,
                'color' => $program->color,
                'created_at' => $program->created_at->format('Y-m-d'),
            ],
            'studyPlans' => $studyPlans,
        ]);
    }

    public function create()
    {
        return Inertia::render('ProgramAcademy/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'description' => 'nullable|string',
            'duration_months' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ], [
            'name.required' => 'El nombre del programa es obligatorio.',
            'duration_months.required' => 'La duración es obligatoria.',
            'duration_months.min' => 'La duración debe ser al menos 1 mes.',
            'color.required' => 'El color es obligatorio.',
            'color.regex' => 'El color debe ser un código hexadecimal válido (ej: #3B82F6).',
        ]);

        AcademicProgram::create($validated);

        flash_success('Programa académico creado exitosamente.');
        return redirect()->route('programas_academicos.index');
    }

    public function edit(AcademicProgram $program)
    {
        return Inertia::render('ProgramAcademy/Form', [
            'program' => [
                'id' => $program->id,
                'name' => $program->name,
                'description' => $program->description,
                'duration_months' => $program->duration_months,
                'status' => $program->status,
                'color' => $program->color,
            ],
        ]);
    }

    public function update(Request $request, AcademicProgram $program)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'description' => 'nullable|string',
            'duration_months' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ], [
            'name.required' => 'El nombre del programa es obligatorio.',
            'duration_months.required' => 'La duración es obligatoria.',
            'duration_months.min' => 'La duración debe ser al menos 1 mes.',
            'color.required' => 'El color es obligatorio.',
            'color.regex' => 'El color debe ser un código hexadecimal válido (ej: #3B82F6).',
        ]);

        $program->update($validated);

        flash_success('Programa académico actualizado exitosamente.');
        return redirect()->route('programas_academicos.index');
    }

    public function destroy(AcademicProgram $program)
    {
        // Verificar si tiene estudiantes activos o horarios
        if ($program->activeStudents()->count() > 0) {
            return back()->with('error', 'No se puede eliminar el programa porque tiene estudiantes activos.');
        }

        if ($program->schedules()->count() > 0) {
            return back()->with('error', 'No se puede eliminar el programa porque tiene horarios asociados.');
        }

        $program->delete();

        return redirect()->route('programas_academicos.index')
            ->with('success', 'Programa académico eliminado exitosamente.');
    }

    /**
     * Get active schedules for a program (API endpoint)
     */
    public function getSchedules(AcademicProgram $program)
    {
        $schedules = $program->schedules()
            ->where('status', 'active')
            ->with('professor')
            ->withCount(['enrollments as enrolled_count' => function ($query) {
                $query->where('status', 'enrolled');
            }])
            ->get()
            ->map(function ($schedule) {
                return [
                    'id' => $schedule->id,
                    'name' => $schedule->name,
                    'days_of_week' => $schedule->days_of_week,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'classroom' => $schedule->classroom,
                    'professor' => $schedule->professor ? [
                        'id' => $schedule->professor->id,
                        'name' => $schedule->professor->name,
                    ] : null,
                    'enrolled_count' => $schedule->enrolled_count,
                    'max_students' => $schedule->max_students,
                    'available_slots' => max(0, $schedule->max_students - $schedule->enrolled_count),
                ];
            });

        return response()->json($schedules);
    }
}
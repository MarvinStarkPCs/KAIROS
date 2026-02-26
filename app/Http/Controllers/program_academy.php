<?php

namespace App\Http\Controllers;

use App\Models\AcademicProgram;
use Illuminate\Http\Request;
use Inertia\Inertia;

class program_academy extends Controller
{
    public function index(Request $request)
    {
        // Obtener parámetros de búsqueda y filtros
        $search = $request->input('search', '');
        $status = $request->input('status', '');
        $perPage = $request->input('per_page', 9);

        // Query base con contadores
        $query = AcademicProgram::withCount(['activeStudents', 'schedules', 'activeSchedules']);

        // Aplicar búsqueda
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filtrar por estado
        if ($status) {
            $query->where('status', $status);
        }

        // Paginar resultados
        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();

        // Transformar los items manualmente para asegurar estructura correcta
        $programs = [
            'data' => $paginator->map(function ($program) {
                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'description' => $program->description,
                    'duration_months' => $program->duration_months,
                    'status' => $program->status,
                    'color' => $program->color,
                    'icon' => $program->icon ?? 'music',
                    'is_demo' => $program->is_demo,
                    'active_students_count' => $program->active_students_count,
                    'schedules_count' => $program->schedules_count,
                    'active_schedules_count' => $program->active_schedules_count,
                    'created_at' => $program->created_at->format('Y-m-d'),
                ];
            })->values()->all(),
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
            'prev_page_url' => $paginator->previousPageUrl(),
            'next_page_url' => $paginator->nextPageUrl(),
        ];

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
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
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
                'is_demo' => $program->is_demo,
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
            'icon' => 'nullable|string|max:50',
            'is_demo' => 'boolean',
        ], [
            'name.required' => 'El nombre del programa es obligatorio.',
            'duration_months.required' => 'La duración es obligatoria.',
            'duration_months.min' => 'La duración debe ser al menos 1 mes.',
            'color.required' => 'El color es obligatorio.',
            'color.regex' => 'El color debe ser un código hexadecimal válido (ej: #3B82F6).',
        ]);

        // Si no se proporciona icono, usar el predeterminado
        $validated['icon'] = $validated['icon'] ?? 'music';

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
                'icon' => $program->icon ?? 'music',
                'is_demo' => $program->is_demo,
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
            'icon' => 'nullable|string|max:50',
            'is_demo' => 'boolean',
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
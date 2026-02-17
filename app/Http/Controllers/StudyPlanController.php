<?php

namespace App\Http\Controllers;

use App\Models\AcademicProgram;
use App\Models\StudyPlan;
use App\Models\Activity;
use App\Models\EvaluationCriteria;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudyPlanController extends Controller
{
    public function store(Request $request, AcademicProgram $program)
    {
        $validated = $request->validate([
            'module_name' => 'required|string|max:120',
            'description' => 'nullable|string',
            'hours' => 'required|integer|min:1',
            'level' => 'required|integer|min:1',
        ], [
            'module_name.required' => 'El nombre del módulo es obligatorio.',
            'hours.required' => 'Las horas son obligatorias.',
            'level.required' => 'El nivel es obligatorio.',
        ]);

        $validated['program_id'] = $program->id;
        StudyPlan::create($validated);

        return back()->with('success', 'Módulo creado exitosamente.');
    }

    public function update(Request $request, StudyPlan $studyPlan)
    {
        $validated = $request->validate([
            'module_name' => 'required|string|max:120',
            'description' => 'nullable|string',
            'hours' => 'required|integer|min:1',
            'level' => 'required|integer|min:1',
        ], [
            'module_name.required' => 'El nombre del módulo es obligatorio.',
            'hours.required' => 'Las horas son obligatorias.',
            'level.required' => 'El nivel es obligatorio.',
        ]);

        $studyPlan->update($validated);

        return back()->with('success', 'Módulo actualizado exitosamente.');
    }

    public function destroy(StudyPlan $studyPlan)
    {
        // Check if has student progress
        if ($studyPlan->studentProgress()->count() > 0) {
            return back()->with('error', 'No se puede eliminar el módulo porque tiene progreso de estudiantes registrado.');
        }

        $studyPlan->delete();

        return back()->with('success', 'Módulo eliminado exitosamente.');
    }

    // Activity management
    public function storeActivity(Request $request, StudyPlan $studyPlan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'description' => 'nullable|string',
            'order' => 'required|integer|min:0|max:1000',
            'weight' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:active,inactive',
        ], [
            'name.required' => 'El nombre de la actividad es obligatorio.',
            'order.required' => 'El orden es obligatorio.',
            'order.max' => 'El orden no puede ser mayor a 1000.',
            'weight.required' => 'El peso es obligatorio.',
        ]);

        $validated['study_plan_id'] = $studyPlan->id;
        Activity::create($validated);

        return back()->with('success', 'Actividad creada exitosamente.');
    }

    public function updateActivity(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'description' => 'nullable|string',
            'order' => 'required|integer|min:0|max:1000',
            'weight' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:active,inactive',
        ], [
            'name.required' => 'El nombre de la actividad es obligatorio.',
            'order.required' => 'El orden es obligatorio.',
            'order.max' => 'El orden no puede ser mayor a 1000.',
            'weight.required' => 'El peso es obligatorio.',
        ]);

        $activity->update($validated);

        return back()->with('success', 'Actividad actualizada exitosamente.');
    }

    public function destroyActivity(Activity $activity)
    {
        $activity->delete();

        return back()->with('success', 'Actividad eliminada exitosamente.');
    }

    // Evaluation Criteria management
    public function storeCriteria(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'description' => 'nullable|string',
            'max_points' => 'required|numeric|min:0',
            'order' => 'required|integer|min:0|max:1000',
        ], [
            'name.required' => 'El nombre del criterio es obligatorio.',
            'max_points.required' => 'La puntuación máxima es obligatoria.',
            'order.required' => 'El orden es obligatorio.',
            'order.max' => 'El orden no puede ser mayor a 1000.',
        ]);

        $validated['activity_id'] = $activity->id;
        EvaluationCriteria::create($validated);

        return back()->with('success', 'Criterio de evaluación creado exitosamente.');
    }

    public function updateCriteria(Request $request, EvaluationCriteria $criteria)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'description' => 'nullable|string',
            'max_points' => 'required|numeric|min:0',
            'order' => 'required|integer|min:0|max:1000',
        ], [
            'name.required' => 'El nombre del criterio es obligatorio.',
            'max_points.required' => 'La puntuación máxima es obligatoria.',
            'order.required' => 'El orden es obligatorio.',
            'order.max' => 'El orden no puede ser mayor a 1000.',
        ]);

        $criteria->update($validated);

        return back()->with('success', 'Criterio de evaluación actualizado exitosamente.');
    }

    public function destroyCriteria(EvaluationCriteria $criteria)
    {
        $criteria->delete();

        return back()->with('success', 'Criterio de evaluación eliminado exitosamente.');
    }

    // Set all evaluation criteria max_points to 10 for all activities in a program
    public function setAllCriteriaToTenPoints(AcademicProgram $program)
    {
        $updated = EvaluationCriteria::whereHas('activity.studyPlan', function ($query) use ($program) {
            $query->where('program_id', $program->id);
        })->update(['max_points' => 10]);

        if ($updated === 0) {
            return back()->with('warning', 'No se encontraron criterios de evaluación para actualizar.');
        }

        return back()->with('success', "Se actualizaron {$updated} criterios de evaluación a 10 puntos.");
    }
}

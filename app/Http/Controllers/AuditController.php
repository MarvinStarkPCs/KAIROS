<?php

namespace App\Http\Controllers;

use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    /**
     * Mostrar log de auditoría
     */
    public function index()
    {
        $paginator = Activity::with(['causer', 'subject'])
            ->latest('created_at')
            ->paginate(50);

        return Inertia::render('Security/Audit/Index', [
            'activities' => [
                'data' => $paginator->getCollection()->map(fn($activity) => $this->formatActivity($activity))->values()->toArray(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->lastPage() ? $paginator->url($paginator->lastPage()) : null,
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Formatear un registro de actividad
     */
    private function formatActivity($activity): array
    {
        return [
            'id' => $activity->id,
            'description' => $activity->description,
            'causer' => $activity->causer ? [
                'id' => $activity->causer->id,
                'name' => $activity->causer->name,
                'email' => $activity->causer->email,
            ] : null,
            'subject' => $activity->subject_type ? [
                'type' => $activity->subject_type,
                'id' => $activity->subject_id,
                'name' => $this->getSubjectName($activity),
            ] : null,
            'properties' => $activity->properties,
            'created_at' => $activity->created_at->toIso8601String(),
        ];
    }

    /**
     * Obtener nombre del subject
     */
    private function getSubjectName($activity)
    {
        if (!$activity->subject) {
            // Intentar obtener el nombre de las propiedades si el registro fue eliminado
            return $activity->properties['old']['name']
                ?? $activity->properties['attributes']['name']
                ?? 'Eliminado';
        }

        $subject = $activity->subject;

        // Modelos con campo 'name'
        if (isset($subject->name)) {
            $name = $subject->name;
            if (isset($subject->last_name)) {
                $name = trim($name.' '.$subject->last_name);
            }
            return $name;
        }

        // StudyPlan
        if (isset($subject->module_name)) {
            return $subject->module_name;
        }

        // Payment
        if (isset($subject->concept)) {
            return $subject->concept;
        }

        return 'Elemento #'.$subject->id;
    }

    /**
     * Filtrar auditoría por fecha
     */
    public function filter(Request $request)
    {
        $query = Activity::with(['causer', 'subject']);

        if ($request->start_date) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        if ($request->user_id) {
            $query->where('causer_id', $request->user_id);
        }

        if ($request->action) {
            $query->where('description', 'like', "%{$request->action}%");
        }

        $paginator = $query->latest('created_at')->paginate(50);

        return Inertia::render('Security/Audit/Index', [
            'activities' => [
                'data' => $paginator->getCollection()->map(fn($activity) => $this->formatActivity($activity))->values()->toArray(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->lastPage() ? $paginator->url($paginator->lastPage()) : null,
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
            'filters' => $request->only(['start_date', 'end_date', 'user_id', 'action']),
        ]);
    }
}

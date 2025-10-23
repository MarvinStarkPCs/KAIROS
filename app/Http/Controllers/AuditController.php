<?php

namespace App\Http\Controllers;

use Spatie\ActivityLog\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditController extends Controller
{
    /**
     * Mostrar log de auditoría
     */
    public function index()
    {
        $activities = Activity::with(['causer', 'subject'])
            ->latest('created_at')
            ->paginate(50);

        return Inertia::render('Security/Audit/Index', [
            'activities' => $activities->through(fn($activity) => [
                'id' => $activity->id,
                'description' => $activity->description,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name,
                    'email' => $activity->causer->email,
                ] : null,
                'subject' => $activity->subject ? [
                    'type' => $activity->subject_type,
                    'id' => $activity->subject_id,
                    'name' => $this->getSubjectName($activity),
                ] : null,
                'properties' => $activity->properties,
                'created_at' => $activity->created_at->toIso8601String(),
            ])->toArray(),
            'links' => [
                'first' => $activities->url(1),
                'last' => $activities->lastPage() ? $activities->url($activities->lastPage()) : null,
                'prev' => $activities->previousPageUrl(),
                'next' => $activities->nextPageUrl(),
            ],
            'meta' => [
                'current_page' => $activities->currentPage(),
                'from' => $activities->from(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'to' => $activities->to(),
                'total' => $activities->total(),
            ],
        ]);
    }

    /**
     * Obtener nombre del subject
     */
    private function getSubjectName($activity)
    {
        if ($activity->subject_type === 'App\\Models\\User') {
            return $activity->subject?->name ?? 'Eliminado';
        }
        if ($activity->subject_type === 'App\\Models\\Role') {
            return $activity->properties['attributes']['name'] ?? 'Rol';
        }
        return 'Elemento';
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

        $activities = $query->latest('created_at')->paginate(50);

        return Inertia::render('Security/Audit/Index', [
            'activities' => $activities->through(fn($activity) => [
                'id' => $activity->id,
                'description' => $activity->description,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name,
                    'email' => $activity->causer->email,
                ] : null,
                'subject' => $activity->subject ? [
                    'type' => $activity->subject_type,
                    'id' => $activity->subject_id,
                    'name' => $this->getSubjectName($activity),
                ] : null,
                'properties' => $activity->properties,
                'created_at' => $activity->created_at->toIso8601String(),
            ])->toArray(),
            'filters' => $request->only(['start_date', 'end_date', 'user_id', 'action']),
        ]);
    }
}

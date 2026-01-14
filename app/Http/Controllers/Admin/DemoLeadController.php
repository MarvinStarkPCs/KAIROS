<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DemoLead;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DemoLeadController extends Controller
{
    /**
     * Mostrar lista de leads
     */
    public function index(Request $request)
    {
        $query = DemoLead::query();

        // Filtro por estado
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Búsqueda
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('instrument', 'like', "%{$search}%")
                    ->orWhere('child_name', 'like', "%{$search}%");
            });
        }

        // Ordenamiento
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $leads = $query->paginate(15)->withQueryString();

        // Estadísticas
        $stats = [
            'total' => DemoLead::count(),
            'pending' => DemoLead::pending()->count(),
            'contacted' => DemoLead::contacted()->count(),
            'converted' => DemoLead::converted()->count(),
            'rejected' => DemoLead::rejected()->count(),
        ];

        return Inertia::render('Admin/DemoLeads/Index', [
            'leads' => $leads,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status,
                'search' => $request->search,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Mostrar detalle de un lead
     */
    public function show(DemoLead $lead)
    {
        return Inertia::render('Admin/DemoLeads/Show', [
            'lead' => $lead,
        ]);
    }

    /**
     * Actualizar estado de un lead
     */
    public function updateStatus(Request $request, DemoLead $lead)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,contacted,converted,rejected',
        ]);

        $oldStatus = $lead->status;
        $lead->update(['status' => $validated['status']]);

        flash_success('Estado actualizado exitosamente de "' . $lead->getStatusLabelAttribute() . '" a "' . $lead->fresh()->status_label . '"');

        return redirect()->back();
    }

    /**
     * Actualizar notas de un lead
     */
    public function updateNotes(Request $request, DemoLead $lead)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:5000',
        ], [
            'notes.max' => 'Las notas no pueden exceder 5000 caracteres',
        ]);

        $lead->update(['notes' => $validated['notes']]);

        flash_success('Notas actualizadas exitosamente');

        return redirect()->back();
    }

    /**
     * Eliminar un lead
     */
    public function destroy(DemoLead $lead)
    {
        $leadName = $lead->name;
        $lead->delete();

        flash_success('Lead "' . $leadName . '" eliminado exitosamente');

        return redirect()->route('admin.demo-leads.index');
    }
}

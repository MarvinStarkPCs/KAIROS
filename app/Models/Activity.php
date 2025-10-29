<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Activity extends Model
{
    use LogsActivity;

    protected $fillable = [
        'study_plan_id',
        'name',
        'description',
        'order',
        'weight',
        'status',
    ];

    protected $casts = [
        'order' => 'integer',
        'weight' => 'decimal:2',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['study_plan_id', 'name', 'description', 'order', 'weight', 'status'])
            ->logOnlyDirty()
            ->useLogName('activities');
    }

    // Relación con el plan de estudios
    public function studyPlan(): BelongsTo
    {
        return $this->belongsTo(StudyPlan::class);
    }

    // Relación con criterios de evaluación
    public function evaluationCriteria(): HasMany
    {
        return $this->hasMany(EvaluationCriteria::class)->orderBy('order');
    }

    // Verificar si la actividad está activa
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    // Obtener la puntuación máxima total de todos los criterios
    public function getTotalMaxPoints(): float
    {
        return $this->evaluationCriteria()->sum('max_points');
    }
}

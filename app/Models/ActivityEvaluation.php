<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ActivityEvaluation extends Model
{
    use LogsActivity;

    protected $fillable = [
        'student_id',
        'teacher_id',
        'schedule_id',
        'activity_id',
        'evaluation_criteria_id',
        'points_earned',
        'feedback',
        'evaluation_date',
    ];

    protected $casts = [
        'points_earned' => 'decimal:2',
        'evaluation_date' => 'date',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'student_id',
                'teacher_id',
                'activity_id',
                'evaluation_criteria_id',
                'points_earned',
                'feedback',
            ])
            ->logOnlyDirty()
            ->useLogName('activity_evaluations');
    }

    // Relación con el estudiante
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Relación con el profesor
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    // Relación con el horario
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    // Relación con la actividad
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    // Relación con el criterio de evaluación
    public function evaluationCriteria(): BelongsTo
    {
        return $this->belongsTo(EvaluationCriteria::class);
    }

    // Obtener la calificación como porcentaje
    public function getPercentage(): float
    {
        if (!$this->evaluationCriteria) {
            return 0;
        }

        $maxPoints = $this->evaluationCriteria->max_points;
        if ($maxPoints <= 0) {
            return 0;
        }

        return round(($this->points_earned / $maxPoints) * 100, 2);
    }

    // Verificar si aprobó (>= 60%)
    public function isPassing(): bool
    {
        return $this->getPercentage() >= 60;
    }
}

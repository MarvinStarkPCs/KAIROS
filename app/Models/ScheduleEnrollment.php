<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ScheduleEnrollment extends Model
{
    use LogsActivity;

    protected $fillable = [
        'student_id',
        'schedule_id',
        'enrollment_date',
        'status',
        'final_grade',
        'notes',
    ];

    protected $casts = [
        'enrollment_date' => 'date',
        'final_grade' => 'decimal:2',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'student_id',
                'schedule_id',
                'enrollment_date',
                'status',
                'final_grade',
                'notes',
            ])
            ->logOnlyDirty()
            ->useLogName('schedule_enrollments');
    }

    // Relación con el estudiante
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Relación con el horario
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    // Verificar si la inscripción está activa
    public function isActive(): bool
    {
        return $this->status === 'enrolled';
    }

    // Verificar si está completada
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    // Verificar si fue abandonada
    public function isDropped(): bool
    {
        return $this->status === 'dropped';
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Attendance extends Model
{
    use LogsActivity;

    protected $fillable = [
        'student_id',
        'schedule_id',
        'recorded_by',
        'class_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'class_date' => 'date',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['student_id', 'schedule_id', 'recorded_by', 'class_date', 'status', 'notes'])
            ->logOnlyDirty()
            ->useLogName('attendances');
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

    // Relación con el usuario que registró la asistencia
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    // Verificar si estuvo presente
    public function isPresent(): bool
    {
        return $this->status === 'present';
    }

    // Verificar si estuvo ausente
    public function isAbsent(): bool
    {
        return $this->status === 'absent';
    }

    // Verificar si llegó tarde
    public function isLate(): bool
    {
        return $this->status === 'late';
    }

    // Verificar si tiene justificación
    public function isExcused(): bool
    {
        return $this->status === 'excused';
    }
}

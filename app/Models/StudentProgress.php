<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class StudentProgress extends Model
{
    use LogsActivity;

    protected $table = 'student_progress';

    protected $fillable = [
        'student_id',
        'teacher_id',
        'program_id',
        'module_id',
        'progress',
        'remarks',
        'recorded_at',
    ];

    protected $casts = [
        'progress' => 'decimal:2',
        'recorded_at' => 'datetime',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['student_id', 'teacher_id', 'program_id', 'module_id', 'progress', 'remarks'])
            ->logOnlyDirty()
            ->useLogName('student_progress');
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

    // Relación con el programa académico
    public function program(): BelongsTo
    {
        return $this->belongsTo(AcademicProgram::class, 'program_id');
    }

    // Relación con el módulo (study plan)
    public function module(): BelongsTo
    {
        return $this->belongsTo(StudyPlan::class, 'module_id');
    }
}

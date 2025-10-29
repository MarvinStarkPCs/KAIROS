<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class StudyPlan extends Model
{
    use LogsActivity;

    protected $fillable = [
        'program_id',
        'module_name',
        'description',
        'hours',
        'level',
    ];

    protected $casts = [
        'hours' => 'integer',
        'level' => 'integer',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['program_id', 'module_name', 'description', 'hours', 'level'])
            ->logOnlyDirty()
            ->useLogName('study_plans');
    }

    // Relación con el programa académico
    public function program(): BelongsTo
    {
        return $this->belongsTo(AcademicProgram::class, 'program_id');
    }

    // Relación con el progreso de estudiantes
    public function studentProgress()
    {
        return $this->hasMany(StudentProgress::class, 'module_id');
    }

    // Relación con las actividades del módulo
    public function activities()
    {
        return $this->hasMany(Activity::class)->orderBy('order');
    }

    // Obtener actividades activas
    public function activeActivities()
    {
        return $this->activities()->where('status', 'active');
    }
}

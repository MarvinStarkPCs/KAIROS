<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class AcademicProgram extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'description',
        'duration_months',
        'monthly_fee',
        'status',
        'color',
        'is_demo',
    ];

    protected $casts = [
        'duration_months' => 'integer',
        'monthly_fee' => 'decimal:2',
        'is_demo' => 'boolean',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'description', 'duration_months', 'monthly_fee', 'status', 'color', 'is_demo'])
            ->logOnlyDirty()
            ->useLogName('academic_programs');
    }

    // Relación con horarios del programa
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    // Horarios activos del programa
    public function activeSchedules(): HasMany
    {
        return $this->schedules()->where('status', 'active');
    }

    // Relación con inscripciones al programa
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'program_id');
    }

    // Estudiantes inscritos en el programa (many-to-many)
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrollments', 'program_id', 'student_id')
            ->withPivot('enrollment_date', 'status')
            ->withTimestamps();
    }

    // Estudiantes activos en el programa
    public function activeStudents(): BelongsToMany
    {
        return $this->students()->wherePivot('status', 'active');
    }

    // Planes de estudio del programa
    public function studyPlans(): HasMany
    {
        return $this->hasMany(StudyPlan::class, 'program_id');
    }

    // Verificar si el programa está activo
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    // Relación con pagos del programa
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'program_id');
    }

    // Relación con el progreso de estudiantes
    public function studentProgress(): HasMany
    {
        return $this->hasMany(StudentProgress::class, 'program_id');
    }
}

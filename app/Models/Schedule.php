<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Schedule extends Model
{
    use LogsActivity;

    protected $fillable = [
        'academic_program_id',
        'professor_id',
        'name',
        'description',
        'days_of_week',
        'start_time',
        'end_time',
        'classroom',
        'semester',
        'max_students',
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'academic_program_id',
                'professor_id',
                'name',
                'description',
                'days_of_week',
                'start_time',
                'end_time',
                'classroom',
                'semester',
                'max_students',
                'status',
            ])
            ->logOnlyDirty()
            ->useLogName('schedules');
    }

    // Relación con el programa académico
    public function academicProgram(): BelongsTo
    {
        return $this->belongsTo(AcademicProgram::class);
    }

    // Relación con el profesor asignado
    public function professor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professor_id');
    }

    // Relación con las inscripciones de estudiantes
    public function enrollments(): HasMany
    {
        return $this->hasMany(ScheduleEnrollment::class);
    }

    // Relación many-to-many con estudiantes
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'schedule_enrollments', 'schedule_id', 'student_id')
            ->withPivot('enrollment_date', 'status', 'final_grade', 'notes')
            ->withTimestamps();
    }

    // Obtener estudiantes activos inscritos
    public function activeStudents(): BelongsToMany
    {
        return $this->students()->wherePivot('status', 'enrolled');
    }

    // Verificar si hay cupos disponibles
    public function hasAvailableSlots(): bool
    {
        return $this->activeStudents()->count() < $this->max_students;
    }

    // Obtener número de cupos disponibles
    public function availableSlots(): int
    {
        return max(0, $this->max_students - $this->activeStudents()->count());
    }

    // Relación con asistencias
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    // Obtener asistencias de una fecha específica
    public function attendancesForDate($date): HasMany
    {
        return $this->attendances()->where('class_date', $date);
    }
}

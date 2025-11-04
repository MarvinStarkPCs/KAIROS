<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Carbon\Carbon;

class Schedule extends Model
{
    use LogsActivity;

    // Días válidos de la semana
    public const VALID_DAYS = [
        'lunes',
        'martes',
        'miércoles',
        'jueves',
        'viernes',
        'sábado',
        'domingo',
    ];

    // Mapeo de días a números para FullCalendar (0 = domingo, 1 = lunes, etc.)
    public const DAY_TO_NUMBER = [
        'domingo' => 0,
        'lunes' => 1,
        'martes' => 2,
        'miércoles' => 3,
        'jueves' => 4,
        'viernes' => 5,
        'sábado' => 6,
    ];

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
        'start_time' => 'string',
        'end_time' => 'string',
    ];

    protected static function boot()
    {
        parent::boot();

        // Validar antes de crear o actualizar
        static::saving(function ($schedule) {
            // Validar que start_time sea menor que end_time
            if ($schedule->start_time >= $schedule->end_time) {
                throw new \InvalidArgumentException('La hora de inicio debe ser anterior a la hora de fin');
            }

            // Validar días de la semana
            $days = explode(',', $schedule->days_of_week);
            foreach ($days as $day) {
                $day = trim($day);
                if (!in_array($day, self::VALID_DAYS)) {
                    throw new \InvalidArgumentException("Día inválido: {$day}. Los días válidos son: " . implode(', ', self::VALID_DAYS));
                }
            }
        });
    }

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

    /**
     * Obtener los días de la semana como array
     */
    public function getDaysArray(): array
    {
        return array_map('trim', explode(',', $this->days_of_week));
    }

    /**
     * Obtener los días como números para FullCalendar (0=domingo, 1=lunes, etc.)
     */
    public function getDaysAsNumbers(): array
    {
        $days = $this->getDaysArray();
        return array_map(function ($day) {
            return self::DAY_TO_NUMBER[$day] ?? null;
        }, $days);
    }

    /**
     * Verificar si el horario ocurre en un día específico
     */
    public function occursOnDay(string $day): bool
    {
        return in_array($day, $this->getDaysArray());
    }

    /**
     * Obtener duración en minutos
     */
    public function getDurationInMinutes(): int
    {
        $start = Carbon::parse($this->start_time);
        $end = Carbon::parse($this->end_time);
        return $start->diffInMinutes($end);
    }

    /**
     * Convertir a formato de evento para FullCalendar
     */
    public function toCalendarEvent(): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->name,
            'daysOfWeek' => $this->getDaysAsNumbers(),
            'startTime' => Carbon::parse($this->start_time)->format('H:i:s'),
            'endTime' => Carbon::parse($this->end_time)->format('H:i:s'),
            'startRecur' => now()->startOfYear()->toDateString(), // Comenzar desde inicio del año
            'endRecur' => now()->endOfYear()->toDateString(), // Hasta fin del año
            'extendedProps' => [
                'program' => $this->academicProgram->name ?? null,
                'professor' => $this->professor->name ?? 'Sin asignar',
                'classroom' => $this->classroom,
                'semester' => $this->semester,
                'enrolled_count' => $this->activeStudents()->count(),
                'max_students' => $this->max_students,
                'available_slots' => $this->availableSlots(),
                'status' => $this->status,
            ],
        ];
    }

    /**
     * Verificar si el horario tiene conflicto con otro horario
     */
    public function hasConflictWith(Schedule $other): bool
    {
        // Verificar si hay días en común
        $thisDays = $this->getDaysArray();
        $otherDays = $other->getDaysArray();
        $commonDays = array_intersect($thisDays, $otherDays);

        if (empty($commonDays)) {
            return false;
        }

        // Verificar si hay solapamiento de tiempo
        $thisStart = Carbon::parse($this->start_time);
        $thisEnd = Carbon::parse($this->end_time);
        $otherStart = Carbon::parse($other->start_time);
        $otherEnd = Carbon::parse($other->end_time);

        // Hay conflicto si:
        // - Este empieza antes de que termine el otro Y
        // - Este termina después de que empiece el otro
        return $thisStart->lt($otherEnd) && $thisEnd->gt($otherStart);
    }
}

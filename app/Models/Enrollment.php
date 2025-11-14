<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Enrollment extends Model
{
    use LogsActivity;

    protected $fillable = [
        'student_id',
        'program_id',
        'enrolled_level',
        'enrollment_date',
        'status',
        'payment_commitment_signed',
        'payment_commitment_date',
        'parental_authorization_signed',
        'parental_authorization_date',
        'parent_guardian_name',
    ];

    protected $casts = [
        'enrollment_date' => 'date',
        'payment_commitment_signed' => 'boolean',
        'payment_commitment_date' => 'datetime',
        'parental_authorization_signed' => 'boolean',
        'parental_authorization_date' => 'datetime',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'student_id',
                'program_id',
                'enrolled_level',
                'enrollment_date',
                'status',
                'payment_commitment_signed',
                'parental_authorization_signed',
            ])
            ->logOnlyDirty()
            ->useLogName('enrollments');
    }

    // Relación con el estudiante
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Relación con el programa académico
    public function program(): BelongsTo
    {
        return $this->belongsTo(AcademicProgram::class, 'program_id');
    }

    // Verificar si la inscripción está activa
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}

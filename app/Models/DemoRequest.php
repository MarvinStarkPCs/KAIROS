<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class DemoRequest extends Model
{
    use LogsActivity;

    protected $fillable = [
        'responsible_name',
        'responsible_last_name',
        'responsible_email',
        'responsible_phone',
        'responsible_mobile',
        'responsible_document_type',
        'responsible_document_number',
        'responsible_birth_date',
        'responsible_gender',
        'responsible_address',
        'responsible_city',
        'responsible_department',
        'is_minor',
        'program_id',
        'schedule_id',
        'students_data',
        'status',
        'notes',
    ];

    protected $casts = [
        'is_minor' => 'boolean',
        'students_data' => 'array',
        'responsible_birth_date' => 'date',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['responsible_email', 'program_id', 'status', 'is_minor'])
            ->logOnlyDirty()
            ->useLogName('demo_requests');
    }

    // Relación con el programa académico
    public function program(): BelongsTo
    {
        return $this->belongsTo(AcademicProgram::class, 'program_id');
    }

    // Relación con el horario
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class, 'schedule_id');
    }

    // Scope para solicitudes pendientes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Scope para solicitudes contactadas
    public function scopeContacted($query)
    {
        return $query->where('status', 'contacted');
    }
}

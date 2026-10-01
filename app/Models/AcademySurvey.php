<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class AcademySurvey extends Model
{
    use LogsActivity;

    protected $fillable = [
        'user_id',
        'answers',
        'submitted_at',
        'progress_percent',
    ];

    protected $casts = [
        'answers'      => 'array',
        'submitted_at' => 'datetime',
    ];

    // Solo se audita quién llena el cuestionario: el JSON de respuestas cambia en cada
    // autoguardado y registrarlo completo llenaría el activity log.
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['user_id'])
            ->logOnlyDirty()
            ->useLogName('academy_surveys');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

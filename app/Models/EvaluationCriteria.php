<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class EvaluationCriteria extends Model
{
    use LogsActivity;

    protected $table = 'evaluation_criteria';

    protected $fillable = [
        'activity_id',
        'name',
        'description',
        'max_points',
        'order',
    ];

    protected $casts = [
        'max_points' => 'decimal:2',
        'order' => 'integer',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['activity_id', 'name', 'description', 'max_points', 'order'])
            ->logOnlyDirty()
            ->useLogName('evaluation_criteria');
    }

    // Relación con la actividad
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }
}

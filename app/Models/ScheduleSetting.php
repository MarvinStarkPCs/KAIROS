<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ScheduleSetting extends Model
{
    use LogsActivity;

    protected $fillable = [
        'validate_program_overlap',
        'validate_professor_overlap',
    ];

    protected $casts = [
        'validate_program_overlap' => 'boolean',
        'validate_professor_overlap' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'validate_program_overlap',
                'validate_professor_overlap',
            ])
            ->logOnlyDirty()
            ->useLogName('schedule_settings');
    }
}

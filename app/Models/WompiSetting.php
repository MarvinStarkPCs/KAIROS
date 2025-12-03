<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class WompiSetting extends Model
{
    use LogsActivity;

    protected $fillable = [
        'environment',
        'public_key',
        'private_key',
        'events_secret',
        'integrity_secret',
        'api_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Ocultar campos sensibles en JSON
    protected $hidden = [
        'private_key',
        'events_secret',
        'integrity_secret',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'environment',
                'public_key',
                'api_url',
                'is_active',
            ])
            ->logOnlyDirty()
            ->useLogName('wompi_settings');
    }
}

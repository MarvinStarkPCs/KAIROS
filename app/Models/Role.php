<?php


namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;
use Spatie\ActivityLog\Traits\LogsActivity;
use Spatie\ActivityLog\LogOptions;

class Role extends SpatieRole
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name'])
            ->useLogName('rol')
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
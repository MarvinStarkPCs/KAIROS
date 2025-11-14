<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class ParentGuardian extends Model
{
    use LogsActivity;

    protected $fillable = [
        'student_id',
        'relationship_type',
        'name',
        'address',
        'phone',
        'has_signed_authorization',
        'authorization_date',
    ];

    protected $casts = [
        'has_signed_authorization' => 'boolean',
        'authorization_date' => 'datetime',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['student_id', 'relationship_type', 'name', 'has_signed_authorization'])
            ->logOnlyDirty()
            ->useLogName('parent_guardians');
    }

    // Relación con el estudiante
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}

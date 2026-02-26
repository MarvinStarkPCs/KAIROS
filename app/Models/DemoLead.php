<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class DemoLead extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'is_for_child',
        'child_name',
        'instrument',
        'preferred_schedule',
        'message',
        'status',
        'notes',
    ];

    protected $casts = [
        'is_for_child' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'status_label',
        'status_color',
    ];

    // Constantes de estados
    const STATUS_PENDING = 'pending';
    const STATUS_CONTACTED = 'contacted';
    const STATUS_CONVERTED = 'converted';
    const STATUS_REJECTED = 'rejected';

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'phone', 'instrument', 'status', 'notes'])
            ->logOnlyDirty()
            ->useLogName('demo_leads');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeContacted($query)
    {
        return $query->where('status', self::STATUS_CONTACTED);
    }

    public function scopeConverted($query)
    {
        return $query->where('status', self::STATUS_CONVERTED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    // Métodos de ayuda
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isContacted(): bool
    {
        return $this->status === self::STATUS_CONTACTED;
    }

    public function isConverted(): bool
    {
        return $this->status === self::STATUS_CONVERTED;
    }

    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'Pendiente',
            self::STATUS_CONTACTED => 'Contactado',
            self::STATUS_CONVERTED => 'Convertido',
            self::STATUS_REJECTED => 'Rechazado',
            default => 'Desconocido',
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            self::STATUS_PENDING => 'yellow',
            self::STATUS_CONTACTED => 'blue',
            self::STATUS_CONVERTED => 'green',
            self::STATUS_REJECTED => 'red',
            default => 'gray',
        };
    }
}

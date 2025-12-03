<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class PaymentSetting extends Model
{
    use LogsActivity;

    protected $fillable = [
        'monthly_amount',
        'is_active',
    ];

    protected $casts = [
        'monthly_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'monthly_amount',
                'is_active',
            ])
            ->logOnlyDirty()
            ->useLogName('payment_settings');
    }
}

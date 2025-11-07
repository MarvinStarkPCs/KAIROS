<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class PaymentTransaction extends Model
{
    use LogsActivity;

    protected $fillable = [
        'payment_id',
        'amount',
        'transaction_date',
        'payment_method',
        'reference_number',
        'recorded_by',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'payment_id',
                'amount',
                'transaction_date',
                'payment_method',
                'reference_number',
            ])
            ->logOnlyDirty()
            ->useLogName('payment_transactions');
    }

    // Relación con el pago
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    // Relación con el usuario que registró la transacción
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}

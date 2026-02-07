<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class PaymentSetting extends Model
{
    use LogsActivity;

    protected $fillable = [
        'amount_linaje_kids',
        'amount_linaje_teens',
        'amount_linaje_big',
        'is_active',
        'enable_online_payment',
        'enable_manual_payment',
        'discount_min_students',
        'discount_percentage',
    ];

    protected $casts = [
        'amount_linaje_kids' => 'decimal:2',
        'amount_linaje_teens' => 'decimal:2',
        'amount_linaje_big' => 'decimal:2',
        'is_active' => 'boolean',
        'enable_online_payment' => 'boolean',
        'enable_manual_payment' => 'boolean',
        'discount_min_students' => 'integer',
        'discount_percentage' => 'decimal:2',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'amount_linaje_kids',
                'amount_linaje_teens',
                'amount_linaje_big',
                'is_active',
                'enable_online_payment',
                'enable_manual_payment',
                'discount_min_students',
                'discount_percentage',
            ])
            ->logOnlyDirty()
            ->useLogName('payment_settings');
    }

    /**
     * Obtener el monto de pago según la modalidad
     */
    public function getAmountForModality(string $modality): float
    {
        return match ($modality) {
            'Linaje Kids' => (float) $this->amount_linaje_kids,
            'Linaje Teens' => (float) $this->amount_linaje_teens,
            'Linaje Big' => (float) $this->amount_linaje_big,
            default => (float) $this->amount_linaje_kids,
        };
    }

    /**
     * Obtener el porcentaje de descuento según la cantidad de estudiantes
     * Retorna 0 si no aplica descuento
     */
    public function getDiscountPercentage(int $totalStudents): float
    {
        if ($totalStudents >= $this->discount_min_students && $this->discount_percentage > 0) {
            return (float) $this->discount_percentage;
        }

        return 0;
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Payment extends Model
{
    use LogsActivity;

    protected $fillable = [
        'student_id',
        'program_id',
        'enrollment_id',
        'concept',
        'amount',
        'due_date',
        'payment_date',
        'status',
        'payment_method',
        'reference_number',
        'recorded_by',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'payment_date' => 'date',
    ];

    // Activity Log configuration
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'student_id',
                'program_id',
                'enrollment_id',
                'concept',
                'amount',
                'due_date',
                'payment_date',
                'status',
                'payment_method',
                'reference_number',
            ])
            ->logOnlyDirty()
            ->useLogName('payments');
    }

    // Relación con el estudiante
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Relación con el programa académico
    public function program(): BelongsTo
    {
        return $this->belongsTo(AcademicProgram::class, 'program_id');
    }

    // Relación con la inscripción
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    // Relación con el usuario que registró el pago
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    // Verificar si el pago está pendiente
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    // Verificar si el pago está completado
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    // Verificar si el pago está vencido
    public function isOverdue(): bool
    {
        return $this->status === 'overdue';
    }

    // Verificar si el pago está cancelado
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    // Marcar como pagado
    public function markAsPaid(string $paymentMethod, ?string $referenceNumber = null): void
    {
        $this->update([
            'status' => 'completed',
            'payment_date' => now(),
            'payment_method' => $paymentMethod,
            'reference_number' => $referenceNumber,
        ]);
    }
}

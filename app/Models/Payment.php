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
        'parent_payment_id',
        'installment_number',
        'total_installments',
        'concept',
        'modality',
        'payment_type',
        'amount',
        'original_amount',
        'discount_percentage',
        'discount_amount',
        'paid_amount',
        'remaining_amount',
        'due_date',
        'payment_date',
        'status',
        'payment_method',
        'reference_number',
        'recorded_by',
        'notes',
        // Campos de Wompi
        'wompi_reference',
        'wompi_transaction_id',
        // Campos de pagos recurrentes
        'card_token',
        'payment_source_id',
        'is_recurring',
        'last_4_digits',
        'card_brand',
        'next_charge_date',
        'failed_attempts',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'original_amount' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
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
                'modality',
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

    // Relación con el pago padre (para cuotas)
    public function parentPayment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'parent_payment_id');
    }

    // Relación con las cuotas hijas
    public function installments()
    {
        return $this->hasMany(Payment::class, 'parent_payment_id');
    }

    // Relación con las transacciones (abonos)
    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    // Marcar como pagado
    public function markAsPaid(string $paymentMethod, ?string $referenceNumber = null): void
    {
        $this->update([
            'status' => 'completed',
            'payment_date' => now(),
            'payment_method' => $paymentMethod,
            'reference_number' => $referenceNumber,
            'paid_amount' => $this->amount,
            'remaining_amount' => 0,
        ]);
    }

    // Registrar un abono parcial
    public function addTransaction(float $amount, string $paymentMethod, ?string $referenceNumber = null, ?string $notes = null): PaymentTransaction
    {
        // Crear la transacción
        $transaction = $this->transactions()->create([
            'amount' => $amount,
            'transaction_date' => now(),
            'payment_method' => $paymentMethod,
            'reference_number' => $referenceNumber,
            'recorded_by' => auth()->id(),
            'notes' => $notes,
        ]);

        // Actualizar el pago
        $newPaidAmount = $this->paid_amount + $amount;
        $newRemainingAmount = ($this->original_amount ?? $this->amount) - $newPaidAmount;

        $isCompleted = $newRemainingAmount <= 0;

        $this->update([
            'paid_amount' => $newPaidAmount,
            'remaining_amount' => max(0, $newRemainingAmount),
            'status' => $isCompleted ? 'completed' : 'pending',
            'payment_date' => $isCompleted ? now() : $this->payment_date,
        ]);

        // Activar la matrícula cuando el pago se completa
        if ($isCompleted && $this->enrollment_id) {
            $this->enrollment()->update(['status' => 'active']);
        }

        return $transaction;
    }

    // Verificar si tiene abonos
    public function hasTransactions(): bool
    {
        return $this->transactions()->exists();
    }

    // Obtener el saldo pendiente
    public function getPendingBalance(): float
    {
        return max(0, ($this->remaining_amount ?? $this->amount - $this->paid_amount));
    }

    // Verificar si es una cuota
    public function isInstallment(): bool
    {
        return $this->payment_type === 'installment';
    }

    // Verificar si permite abonos parciales
    public function allowsPartialPayments(): bool
    {
        return $this->payment_type === 'partial';
    }

    // Verificar si está totalmente pagado
    public function isFullyPaid(): bool
    {
        return $this->remaining_amount <= 0 && $this->status === 'completed';
    }

    // Crear plan de cuotas
    public static function createInstallmentPlan(
        int $studentId,
        ?int $programId,
        ?int $enrollmentId,
        string $concept,
        float $totalAmount,
        int $numberOfInstallments,
        string $startDate
    ): array {
        $installmentAmount = round($totalAmount / $numberOfInstallments, 2);
        $installments = [];

        for ($i = 1; $i <= $numberOfInstallments; $i++) {
            // Calcular fecha de vencimiento (día 5 de cada mes)
            $dueDate = \Carbon\Carbon::parse($startDate)->addMonths($i - 1)->day(5);

            $installments[] = self::create([
                'student_id' => $studentId,
                'program_id' => $programId,
                'enrollment_id' => $enrollmentId,
                'installment_number' => $i,
                'total_installments' => $numberOfInstallments,
                'concept' => $concept . " - Cuota {$i}/{$numberOfInstallments}",
                'payment_type' => 'installment',
                'amount' => $i === $numberOfInstallments
                    ? $totalAmount - ($installmentAmount * ($numberOfInstallments - 1)) // Ajustar última cuota
                    : $installmentAmount,
                'original_amount' => $installmentAmount,
                'paid_amount' => 0,
                'remaining_amount' => $installmentAmount,
                'due_date' => $dueDate,
                'status' => 'pending',
                'recorded_by' => auth()->id(),
            ]);
        }

        return $installments;
    }
}

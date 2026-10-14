<?php

namespace App\Services;

use App\Mail\CobroGenerado;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Mensualidades de una matrícula: qué meses tienen cobro, generarlas y revertirlas.
 * La regla "el mes ya tiene cobro" vive solo aquí para que la use también el comando mensual.
 */
class MonthlyPaymentService
{
    public const MONTHLY_PREFIX = 'Mensualidad';

    public function __construct(private EnrollmentService $enrollmentService) {}

    /** Un mes tiene cobro si la matrícula tiene algún pago no cancelado con vencimiento en ese mes. */
    public function monthHasPayment(Enrollment $enrollment, Carbon $month): bool
    {
        return $this->paymentsInMonth($enrollment, $month)
            ->where('status', '!=', 'cancelled')
            ->exists();
    }

    /** Crea la mensualidad del mes. Devuelve null si no hay tarifa para calcular el monto. */
    public function generate(Enrollment $enrollment, Carbon $month): ?Payment
    {
        $enrollment->loadMissing('program');
        $program = $enrollment->program;
        $student = User::with('studentProfile')->find($enrollment->student_id);
        $modality = $student->studentProfile?->modality;

        if ($modality) {
            $siblingsCount = 1;
            if ($student->parent_id) {
                $siblingsCount = User::where('parent_id', $student->parent_id)
                    ->whereHas('programEnrollments', fn ($q) => $q->whereIn('status', ['active', 'waiting']))
                    ->count();
            }
            $info = $this->enrollmentService->getPaymentAmount($modality, $siblingsCount);
            $amount = $info['amount'];
            $originalAmount = $info['original_amount'];
            $discountPct = $info['discount_percentage'] > 0 ? $info['discount_percentage'] : null;
            $discountAmount = $info['discount_amount'] > 0 ? $info['discount_amount'] : null;
        } else {
            if (! $program->monthly_fee || $program->monthly_fee <= 0) {
                return null;
            }
            $amount = (float) $program->monthly_fee;
            $originalAmount = $amount;
            $discountPct = null;
            $discountAmount = null;
        }

        $month = $month->copy()->startOfMonth();
        $dueDate = $month->copy()->day(5);

        $concept = self::MONTHLY_PREFIX." {$program->name} — ".$month->locale('es')->isoFormat('MMMM YYYY');
        if ($modality) {
            $concept .= " ({$modality})";
        }
        if ($discountPct) {
            $concept .= " — Descuento familiar {$discountPct}%";
        }

        return Payment::create([
            'student_id' => $enrollment->student_id,
            'program_id' => $program->id,
            'enrollment_id' => $enrollment->id,
            'concept' => $concept,
            'payment_type' => 'single',
            'modality' => $modality,
            'amount' => $amount,
            'original_amount' => $originalAmount,
            'discount_percentage' => $discountPct,
            'discount_amount' => $discountAmount,
            'paid_amount' => 0,
            'remaining_amount' => $amount,
            'due_date' => $dueDate,
            'status' => 'pending',
            'recorded_by' => auth()->id(),
        ]);
    }

    /** Motivo por el que no se puede revertir el pago, o null si se puede. */
    public function revertBlocker(Payment $payment): ?string
    {
        if (! str_starts_with((string) $payment->concept, self::MONTHLY_PREFIX)) {
            return 'Solo se pueden revertir mensualidades; el pago de matrícula no.';
        }
        if (! in_array($payment->status, ['pending', 'overdue'], true)) {
            return $payment->status === 'completed'
                ? 'El pago ya fue pagado.'
                : 'El pago está cancelado.';
        }
        // Usa los conteos de withCount() cuando vienen cargados (cuadrícula) para no consultar por pago.
        $transactions = $payment->transactions_count ?? $payment->transactions()->count();
        $installments = $payment->installments_count ?? $payment->installments()->count();

        if ((float) $payment->paid_amount > 0 || $transactions > 0) {
            return 'El pago tiene abonos registrados.';
        }
        if ($payment->wompi_transaction_id || $payment->wompi_reference) {
            return 'El pago tiene una transacción en la pasarela (Wompi/Nequi).';
        }
        if ($payment->parent_payment_id || $installments > 0) {
            return 'El pago está dividido en cuotas.';
        }

        return null;
    }

    /** Elimina la mensualidad; el Activity Log de Payment registra el borrado y quién lo hizo. */
    public function revert(Payment $payment): void
    {
        $payment->delete();
    }

    /**
     * Avisa por correo del nuevo cobro al responsable y al estudiante (mismos destinatarios
     * que los recordatorios). Un fallo de SMTP no deshace el cobro. Devuelve los correos enviados.
     */
    public function notifyNewCharge(Payment $payment): int
    {
        $payment->loadMissing(['student', 'program']);
        $student = $payment->student;
        $studentName = trim($student->name.' '.($student->last_name ?? ''));

        $recipients = [];
        if ($student->parent_id && ($parent = User::find($student->parent_id)) && $parent->email) {
            $recipients[$parent->email] = trim($parent->name.' '.($parent->last_name ?? ''));
        }
        if ($student->email) {
            $recipients[$student->email] ??= $studentName;
        }

        $sent = 0;
        foreach ($recipients as $email => $name) {
            try {
                Mail::to($email)->send(new CobroGenerado($payment, $name, $studentName));
                $sent++;
            } catch (\Throwable $e) {
                Log::warning("No se pudo enviar el aviso de cobro #{$payment->id} a {$email}: {$e->getMessage()}");
            }
        }

        return $sent;
    }

    /**
     * Los 12 meses del año con sus pagos, para la cuadrícula de la matrícula.
     *
     * @return array<int, array<string, mixed>>
     */
    public function yearOverview(Enrollment $enrollment, int $year): array
    {
        $payments = Payment::where('enrollment_id', $enrollment->id)
            ->whereYear('due_date', $year)
            ->withCount(['transactions', 'installments'])
            ->orderBy('due_date')
            ->get();

        $byMonth = $payments->groupBy(fn (Payment $p) => Carbon::parse($p->due_date)->month);
        $start = Carbon::parse($enrollment->enrollment_date ?? $enrollment->created_at)->startOfMonth();
        $current = Carbon::today()->startOfMonth();

        return collect(range(1, 12))->map(function (int $m) use ($year, $byMonth, $start, $current) {
            $month = Carbon::create($year, $m, 1);
            /** @var Collection<int, Payment> $list */
            $list = $byMonth->get($m, collect());

            return [
                'month' => $month->format('Y-m'),
                'label' => $month->locale('es')->isoFormat('MMMM'),
                'has_payment' => $list->contains(fn (Payment $p) => $p->status !== 'cancelled'),
                'before_enrollment' => $month->lt($start),
                'is_current' => $month->equalTo($current),
                'payments' => $list->map(fn (Payment $p) => [
                    'id' => $p->id,
                    'kind' => str_starts_with((string) $p->concept, self::MONTHLY_PREFIX) ? 'mensualidad' : 'matricula',
                    'status' => $p->status,
                    'amount' => (float) $p->amount,
                    'paid_amount' => (float) $p->paid_amount,
                    'pending_balance' => $p->getPendingBalance(),
                    'revert_blocker' => $this->revertBlocker($p),
                ])->values()->all(),
            ];
        })->all();
    }

    private function paymentsInMonth(Enrollment $enrollment, Carbon $month)
    {
        return Payment::where('enrollment_id', $enrollment->id)
            ->whereBetween('due_date', [
                $month->copy()->startOfMonth()->toDateString(),
                $month->copy()->endOfMonth()->toDateString(),
            ]);
    }
}

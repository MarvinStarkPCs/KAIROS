<?php

namespace App\Mail;

use App\Models\Payment;
use App\Models\Schedule;
use App\Models\ScheduleEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EnrollmentManualPayment extends Mailable
{
    use Queueable, SerializesModels;

    public Payment $payment;

    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Estás matriculado/a! - Pago pendiente',
        );
    }

    public function content(): Content
    {
        // Buscar el horario escogido por el estudiante
        $studentSchedule = null;
        if ($this->payment->student && $this->payment->program) {
            $programScheduleIds = $this->payment->program
                ->activeSchedules()
                ->pluck('id');

            $scheduleEnrollment = ScheduleEnrollment::where('student_id', $this->payment->student->id)
                ->whereIn('schedule_id', $programScheduleIds)
                ->first();

            if ($scheduleEnrollment) {
                $studentSchedule = Schedule::with('professor')->find($scheduleEnrollment->schedule_id);
            }
        }

        return new Content(
            view: 'emails.enrollment-manual-payment',
            with: [
                'payment' => $this->payment,
                'studentName' => $this->payment->student->name . ' ' . $this->payment->student->last_name,
                'programName' => $this->payment->program?->name ?? 'N/A',
                'amount' => number_format($this->payment->amount, 0, ',', '.'),
                'studentSchedule' => $studentSchedule,
            ],
        );
    }
}

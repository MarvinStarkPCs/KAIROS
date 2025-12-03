<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

class PaymentConfirmed extends Mailable
{
    use Queueable, SerializesModels;

    public Payment $payment;
    public Carbon $startDate;

    /**
     * Create a new message instance.
     */
    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
        $this->startDate = $this->calculateStartDate($payment->payment_date);
    }

    /**
     * Calculate start date (5 business days from payment)
     */
    private function calculateStartDate(Carbon $paymentDate): Carbon
    {
        $date = $paymentDate->copy();
        $businessDaysAdded = 0;

        while ($businessDaysAdded < 5) {
            $date->addDay();

            // Si no es sábado (6) ni domingo (0)
            if ($date->dayOfWeek !== Carbon::SATURDAY && $date->dayOfWeek !== Carbon::SUNDAY) {
                $businessDaysAdded++;
            }
        }

        return $date;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirmación de Pago - KAIROS',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-confirmed',
            with: [
                'payment' => $this->payment,
                'startDate' => $this->startDate,
                'studentName' => $this->payment->student->name . ' ' . $this->payment->student->last_name,
                'programName' => $this->payment->program?->name ?? 'N/A',
                'amount' => number_format($this->payment->amount, 0, ',', '.'),
                'paymentDate' => $this->payment->payment_date->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
                'startDateFormatted' => $this->startDate->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
            ],
        );
    }
}

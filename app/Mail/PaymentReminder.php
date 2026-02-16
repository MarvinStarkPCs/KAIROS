<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentReminder extends Mailable
{
    use Queueable, SerializesModels;

    public Payment $payment;
    public string $recipientName;
    public string $studentName;
    public int $daysUntilDue;

    /**
     * Create a new message instance.
     */
    public function __construct(Payment $payment, string $recipientName, string $studentName, int $daysUntilDue)
    {
        $this->payment = $payment;
        $this->recipientName = $recipientName;
        $this->studentName = $studentName;
        $this->daysUntilDue = $daysUntilDue;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->daysUntilDue > 0
            ? "Recordatorio: Pago pendiente en {$this->daysUntilDue} día(s) - Academia Linaje"
            : 'Recordatorio: Pago vence hoy - Academia Linaje';

        return new Envelope(subject: $subject);
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-reminder',
            with: [
                'payment' => $this->payment,
                'recipientName' => $this->recipientName,
                'studentName' => $this->studentName,
                'daysUntilDue' => $this->daysUntilDue,
                'programName' => $this->payment->program?->name ?? 'N/A',
                'amount' => number_format($this->payment->remaining_amount ?? $this->payment->amount, 0, ',', '.'),
                'dueDateFormatted' => $this->payment->due_date->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
            ],
        );
    }
}

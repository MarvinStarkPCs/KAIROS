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
        // Saldo pendiente real: si hay abonos usa remaining_amount, si no el total
        $totalAmount     = (float) $this->payment->amount;
        $paidAmount      = (float) ($this->payment->paid_amount ?? 0);
        $remainingAmount = (float) ($this->payment->remaining_amount ?? $totalAmount);
        $hasPartialPayments = $paidAmount > 0;

        return new Content(
            view: 'emails.payment-reminder',
            with: [
                'payment'           => $this->payment,
                'recipientName'     => $this->recipientName,
                'studentName'       => $this->studentName,
                'daysUntilDue'      => $this->daysUntilDue,
                'programName'       => $this->payment->program?->name ?? 'N/A',
                'amount'            => number_format($remainingAmount, 0, ',', '.'),
                'totalAmount'       => number_format($totalAmount, 0, ',', '.'),
                'paidAmount'        => number_format($paidAmount, 0, ',', '.'),
                'hasPartialPayments' => $hasPartialPayments,
                'dueDateFormatted'  => $this->payment->due_date->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
            ],
        );
    }
}

<?php

namespace App\Mail;

use App\Models\Payment;
use App\Models\PaymentTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AbonoRegistrado extends Mailable
{
    use Queueable, SerializesModels;

    public Payment $payment;
    public PaymentTransaction $transaction;
    public string $recipientName;
    public string $studentName;

    public function __construct(
        Payment $payment,
        PaymentTransaction $transaction,
        string $recipientName,
        string $studentName
    ) {
        $this->payment       = $payment;
        $this->transaction   = $transaction;
        $this->recipientName = $recipientName;
        $this->studentName   = $studentName;
    }

    public function envelope(): Envelope
    {
        $isPaid = $this->payment->remaining_amount <= 0;

        return new Envelope(
            subject: $isPaid
                ? '✅ Pago completado - Academia Linaje'
                : '💰 Abono registrado - Academia Linaje',
        );
    }

    public function content(): Content
    {
        $isPaid = $this->payment->remaining_amount <= 0;

        return new Content(
            view: 'emails.abono-registrado',
            with: [
                'payment'           => $this->payment,
                'transaction'       => $this->transaction,
                'recipientName'     => $this->recipientName,
                'studentName'       => $this->studentName,
                'programName'       => $this->payment->program?->name ?? 'N/A',
                'abonoAmount'       => number_format($this->transaction->amount, 0, ',', '.'),
                'remainingAmount'   => number_format(max(0, $this->payment->remaining_amount), 0, ',', '.'),
                'totalAmount'       => number_format($this->payment->amount, 0, ',', '.'),
                'paidAmount'        => number_format($this->payment->paid_amount, 0, ',', '.'),
                'referenceNumber'   => $this->transaction->reference_number,
                'transactionDate'   => $this->transaction->transaction_date->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
                'isPaid'            => $isPaid,
            ],
        );
    }
}

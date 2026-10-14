<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CobroGenerado extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Payment $payment,
        public string $recipientName,
        public string $studentName,
    ) {}

    public function envelope(): Envelope
    {
        $month = $this->payment->due_date->locale('es')->isoFormat('MMMM YYYY');

        return new Envelope(subject: "Nuevo cobro: mensualidad de {$month} - Academia Linaje");
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.cobro-generado',
            with: [
                'payment' => $this->payment,
                'recipientName' => $this->recipientName,
                'studentName' => $this->studentName,
                'programName' => $this->payment->program?->name ?? 'N/A',
                'amount' => number_format((float) $this->payment->amount, 0, ',', '.'),
                'dueDateFormatted' => $this->payment->due_date->locale('es')->isoFormat('D [de] MMMM [de] YYYY'),
                'isOverdue' => $this->payment->due_date->isPast() && ! $this->payment->due_date->isToday(),
            ],
        );
    }
}

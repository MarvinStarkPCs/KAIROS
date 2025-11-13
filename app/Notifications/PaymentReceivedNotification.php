<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReceivedNotification extends Notification
{
    use Queueable;

    protected Payment $payment;

    /**
     * Create a new notification instance.
     */
    public function __construct(Payment $payment)
    {
        $this->payment = $payment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Confirmación de Pago - KAIROS')
            ->greeting('¡Hola '.$notifiable->name.'!')
            ->line('Hemos recibido tu pago correctamente.')
            ->line('Detalles del pago:')
            ->line('Monto: $'.number_format($this->payment->amount, 2))
            ->line('Fecha: '.$this->payment->payment_date->format('d/m/Y'))
            ->line('Método: '.$this->payment->payment_method)
            ->action('Ver Mis Pagos', url('/payments'))
            ->line('Gracias por tu pago.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'payment_date' => $this->payment->payment_date->toDateString(),
        ];
    }
}

<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
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
            ->subject('¡Bienvenido a KAIROS!')
            ->greeting('¡Hola '.$notifiable->name.'!')
            ->line('Te damos la bienvenida a KAIROS, el sistema de gestión académica.')
            ->line('Tu cuenta ha sido creada exitosamente y ya puedes comenzar a utilizarla.')
            ->action('Iniciar Sesión', url('/login'))
            ->line('Si tienes alguna pregunta, no dudes en contactarnos.')
            ->line('¡Gracias por unirte a nosotros!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}

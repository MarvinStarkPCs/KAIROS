<?php

namespace App\Notifications;

use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EnrollmentStatusNotification extends Notification
{
    use Queueable;

    protected Enrollment $enrollment;

    protected string $status;

    /**
     * Create a new notification instance.
     */
    public function __construct(Enrollment $enrollment, string $status)
    {
        $this->enrollment = $enrollment;
        $this->status = $status;
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
        $statusMessages = [
            'active' => [
                'subject' => 'Inscripción Aprobada - KAIROS',
                'line1' => 'Tu inscripción al programa '.$this->enrollment->academicProgram->name.' ha sido aprobada.',
                'line2' => 'Ya puedes comenzar a participar en las actividades del programa.',
                'action' => 'Ver Programa',
            ],
            'rejected' => [
                'subject' => 'Inscripción Rechazada - KAIROS',
                'line1' => 'Lamentamos informarte que tu inscripción al programa '.$this->enrollment->academicProgram->name.' ha sido rechazada.',
                'line2' => 'Si tienes alguna pregunta, por favor contacta con la administración.',
                'action' => 'Ver Mis Inscripciones',
            ],
            'cancelled' => [
                'subject' => 'Inscripción Cancelada - KAIROS',
                'line1' => 'Tu inscripción al programa '.$this->enrollment->academicProgram->name.' ha sido cancelada.',
                'line2' => 'Si necesitas más información, contacta con la administración.',
                'action' => 'Ver Mis Inscripciones',
            ],
        ];

        $message = $statusMessages[$this->status] ?? $statusMessages['active'];

        return (new MailMessage)
            ->subject($message['subject'])
            ->greeting('¡Hola '.$notifiable->name.'!')
            ->line($message['line1'])
            ->line($message['line2'])
            ->action($message['action'], url('/'))
            ->line('Gracias por usar KAIROS.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'enrollment_id' => $this->enrollment->id,
            'program_name' => $this->enrollment->academicProgram->name,
            'status' => $this->status,
        ];
    }
}

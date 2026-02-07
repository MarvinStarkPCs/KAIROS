<?php

namespace App\Mail;

use App\Models\Payment;
use App\Models\Schedule;
use App\Models\ScheduleEnrollment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Password;

class EnrollmentWelcome extends Mailable
{
    use Queueable, SerializesModels;

    public User $responsible;

    public array $payments;

    public bool $isMinor;

    public function __construct(User $responsible, array $payments, bool $isMinor)
    {
        $this->responsible = $responsible;
        $this->payments = $payments;
        $this->isMinor = $isMinor;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Bienvenido/a a KAIROS! - Tu matrícula ha sido registrada',
        );
    }

    public function content(): Content
    {
        // Generar token de reset para establecer contraseña
        $token = Password::createToken($this->responsible);
        $resetUrl = url(route('password.reset', [
            'token' => $token,
            'email' => $this->responsible->email,
        ], false));

        // Preparar datos de estudiantes con sus horarios
        $studentsData = [];
        foreach ($this->payments as $payment) {
            /** @var Payment $payment */
            $payment->load(['student', 'program']);

            $studentSchedule = null;
            if ($payment->student && $payment->program) {
                $programScheduleIds = $payment->program
                    ->activeSchedules()
                    ->pluck('id');

                $scheduleEnrollment = ScheduleEnrollment::where('student_id', $payment->student->id)
                    ->whereIn('schedule_id', $programScheduleIds)
                    ->first();

                if ($scheduleEnrollment) {
                    $studentSchedule = Schedule::with('professor')->find($scheduleEnrollment->schedule_id);
                }
            }

            $studentsData[] = [
                'name' => $payment->student->name.' '.$payment->student->last_name,
                'program' => $payment->program?->name ?? 'N/A',
                'amount' => number_format($payment->amount, 0, ',', '.'),
                'modality' => $payment->modality ?? 'N/A',
                'schedule' => $studentSchedule,
            ];
        }

        return new Content(
            view: 'emails.enrollment-welcome',
            with: [
                'responsibleName' => $this->responsible->name.' '.$this->responsible->last_name,
                'isMinor' => $this->isMinor,
                'studentsData' => $studentsData,
                'resetUrl' => $resetUrl,
                'email' => $this->responsible->email,
            ],
        );
    }
}

# Ejemplos de Integración de Notificaciones por Email

## Integración en Controladores Existentes

### 1. EnrollmentController - Notificar cambios de estado

```php
<?php

namespace App\Http\Controllers;

use App\Notifications\EnrollmentStatusNotification;

class EnrollmentController extends Controller
{
    public function update(Request $request, Enrollment $enrollment)
    {
        $oldStatus = $enrollment->status;

        $validated = $request->validate([
            'status' => ['required', Rule::in(['waiting', 'active', 'rejected', 'cancelled'])],
            // otros campos...
        ]);

        $enrollment->update($validated);

        // Notificar al estudiante si el estado cambió
        if ($oldStatus !== $validated['status'] && in_array($validated['status'], ['active', 'rejected', 'cancelled'])) {
            try {
                $enrollment->student->notify(
                    new EnrollmentStatusNotification($enrollment, $validated['status'])
                );
                flash_success('Estado actualizado y notificación enviada al estudiante');
            } catch (\Exception $e) {
                flash_warning('Estado actualizado, pero no se pudo enviar la notificación');
                \Log::error('Error al enviar notificación de inscripción: ' . $e->getMessage());
            }
        } else {
            flash_success('Estado de inscripción actualizado correctamente');
        }

        return redirect()->back();
    }
}
```

### 2. PaymentController - Confirmar pagos recibidos

```php
<?php

namespace App\Http\Controllers;

use App\Notifications\PaymentReceivedNotification;

class PaymentController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'payment_date' => ['required', 'date'],
            'payment_method' => ['required', 'string'],
            // otros campos...
        ]);

        $payment = Payment::create($validated);

        // Enviar confirmación de pago al estudiante
        try {
            $payment->student->notify(new PaymentReceivedNotification($payment));
            flash_success('Pago registrado correctamente y confirmación enviada al estudiante');
        } catch (\Exception $e) {
            flash_warning('Pago registrado, pero no se pudo enviar la confirmación por email');
            \Log::error('Error al enviar notificación de pago: ' . $e->getMessage());
        }

        return redirect()->route('payments.index');
    }
}
```

### 3. UserController - Bienvenida a nuevos usuarios

```php
<?php

namespace App\Http\Controllers;

use App\Notifications\WelcomeNotification;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            // otros campos...
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $user = User::create($validated);

        // Asignar rol si está presente
        if ($request->has('role')) {
            $user->assignRole($request->role);
        }

        // Enviar correo de bienvenida
        try {
            $user->notify(new WelcomeNotification());
            flash_success('Usuario creado correctamente y correo de bienvenida enviado');
        } catch (\Exception $e) {
            flash_warning('Usuario creado, pero no se pudo enviar el correo de bienvenida');
            \Log::error('Error al enviar notificación de bienvenida: ' . $e->getMessage());
        }

        return redirect()->route('users.index');
    }
}
```

## Notificaciones Adicionales Sugeridas

### 4. AttendanceReminderNotification

```php
<?php

namespace App\Notifications;

use App\Models\Schedule;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AttendanceReminderNotification extends Notification
{
    use Queueable;

    protected Schedule $schedule;

    public function __construct(Schedule $schedule)
    {
        $this->schedule = $schedule;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $scheduleDate = $this->schedule->start_time->format('d/m/Y');
        $scheduleTime = $this->schedule->start_time->format('H:i');

        return (new MailMessage)
            ->subject('Recordatorio de Clase - KAIROS')
            ->greeting('¡Hola '.$notifiable->name.'!')
            ->line('Te recordamos que tienes clase programada:')
            ->line('Programa: '.$this->schedule->academicProgram->name)
            ->line('Fecha: '.$scheduleDate)
            ->line('Hora: '.$scheduleTime)
            ->line('Ubicación: '.$this->schedule->location)
            ->action('Ver Horario', url('/schedules'))
            ->line('¡Te esperamos!');
    }
}
```

### 5. ActivityDeadlineNotification

```php
<?php

namespace App\Notifications;

use App\Models\Activity;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ActivityDeadlineNotification extends Notification
{
    use Queueable;

    protected Activity $activity;
    protected int $daysRemaining;

    public function __construct(Activity $activity, int $daysRemaining)
    {
        $this->activity = $activity;
        $this->daysRemaining = $daysRemaining;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $deadline = $this->activity->due_date->format('d/m/Y');

        return (new MailMessage)
            ->subject('Recordatorio: Actividad Próxima a Vencer - KAIROS')
            ->greeting('¡Hola '.$notifiable->name.'!')
            ->line('Te recordamos que tienes una actividad próxima a vencer:')
            ->line('Actividad: '.$this->activity->title)
            ->line('Plan de Estudio: '.$this->activity->studyPlan->name)
            ->line('Fecha límite: '.$deadline)
            ->line('Días restantes: '.$this->daysRemaining)
            ->action('Ver Actividad', url('/activities/'.$this->activity->id))
            ->line('¡No olvides completarla a tiempo!');
    }
}
```

### 6. PaymentReminderNotification

```php
<?php

namespace App\Notifications;

use App\Models\Enrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReminderNotification extends Notification
{
    use Queueable;

    protected Enrollment $enrollment;
    protected float $amountDue;

    public function __construct(Enrollment $enrollment, float $amountDue)
    {
        $this->enrollment = $enrollment;
        $this->amountDue = $amountDue;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Recordatorio de Pago - KAIROS')
            ->greeting('¡Hola '.$notifiable->name.'!')
            ->line('Te recordamos que tienes un pago pendiente:')
            ->line('Programa: '.$this->enrollment->academicProgram->name)
            ->line('Monto pendiente: $'.number_format($this->amountDue, 2))
            ->action('Realizar Pago', url('/payments/create'))
            ->line('Si ya realizaste el pago, por favor ignora este mensaje.')
            ->line('Gracias por tu atención.');
    }
}
```

## Comando Artisan para Recordatorios Automáticos

### Crear comando para enviar recordatorios

```bash
php artisan make:command SendScheduleReminders
```

```php
<?php

namespace App\Console\Commands;

use App\Models\Schedule;
use App\Notifications\AttendanceReminderNotification;
use Illuminate\Console\Command;

class SendScheduleReminders extends Command
{
    protected $signature = 'reminders:schedules';
    protected $description = 'Enviar recordatorios de clases para mañana';

    public function handle()
    {
        $tomorrow = now()->addDay()->startOfDay();
        $endOfTomorrow = now()->addDay()->endOfDay();

        $schedules = Schedule::whereBetween('start_time', [$tomorrow, $endOfTomorrow])
            ->with(['scheduleEnrollments.student'])
            ->get();

        $sent = 0;

        foreach ($schedules as $schedule) {
            foreach ($schedule->scheduleEnrollments as $enrollment) {
                try {
                    $enrollment->student->notify(
                        new AttendanceReminderNotification($schedule)
                    );
                    $sent++;
                } catch (\Exception $e) {
                    $this->error('Error enviando a '.$enrollment->student->email);
                }
            }
        }

        $this->info("Recordatorios enviados: {$sent}");
    }
}
```

### Programar en el Kernel

```php
// app/Console/Kernel.php

protected function schedule(Schedule $schedule)
{
    // Enviar recordatorios de clases todos los días a las 6 PM
    $schedule->command('reminders:schedules')
        ->dailyAt('18:00');

    // Enviar recordatorios de pagos el día 1 de cada mes
    $schedule->command('reminders:payments')
        ->monthlyOn(1, '09:00');

    // Enviar recordatorios de actividades próximas a vencer
    $schedule->command('reminders:activities')
        ->weeklyOn(1, '10:00'); // Lunes a las 10 AM
}
```

## Uso en Eventos

También puedes usar eventos de Laravel para enviar notificaciones automáticamente:

```php
<?php

namespace App\Events;

use App\Models\Enrollment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EnrollmentStatusChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Enrollment $enrollment;
    public string $oldStatus;
    public string $newStatus;

    public function __construct(Enrollment $enrollment, string $oldStatus, string $newStatus)
    {
        $this->enrollment = $enrollment;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }
}
```

```php
<?php

namespace App\Listeners;

use App\Events\EnrollmentStatusChanged;
use App\Notifications\EnrollmentStatusNotification;

class SendEnrollmentStatusNotification
{
    public function handle(EnrollmentStatusChanged $event)
    {
        if (in_array($event->newStatus, ['active', 'rejected', 'cancelled'])) {
            $event->enrollment->student->notify(
                new EnrollmentStatusNotification($event->enrollment, $event->newStatus)
            );
        }
    }
}
```

## Mejores Prácticas

1. **Siempre usa try-catch**: Los correos pueden fallar, no dejes que rompan tu aplicación
2. **Logs de errores**: Registra errores de envío para debugging
3. **Mensajes flash apropiados**: Informa al usuario si el correo se envió o no
4. **Usa queues en producción**: Para no bloquear las respuestas HTTP
5. **Valida configuración SMTP**: Antes de enviar, verifica que exista una configuración activa
6. **Testing**: Usa Mail::fake() en tests para verificar que se envían las notificaciones

## Testing de Notificaciones

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\WelcomeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_notification_is_sent_when_user_is_created()
    {
        Notification::fake();

        $user = User::factory()->create();
        $user->notify(new WelcomeNotification());

        Notification::assertSentTo($user, WelcomeNotification::class);
    }
}
```

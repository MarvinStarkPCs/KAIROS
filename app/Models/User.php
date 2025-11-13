<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\ActivityLog\LogOptions;
use Spatie\ActivityLog\Traits\LogsActivity;
use Spatie\Permission\Traits\HasRoles;



class User extends Authenticatable
{
    use HasRoles;
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getRoles()
    {
        return $this->roles->pluck('name');
    }

    // Obtener permisos del usuario
    public function getPermissions()
    {
        return $this->getAllPermissions()->pluck('name')->toArray();
    }

    // ========== Relaciones con Horarios ==========

    // Horarios asignados como profesor
    public function teachingSchedules()
    {
        return $this->hasMany(Schedule::class, 'professor_id');
    }

    // Inscripciones de horarios como estudiante
    public function scheduleEnrollments()
    {
        return $this->hasMany(ScheduleEnrollment::class, 'student_id');
    }

    // Horarios en los que está inscrito como estudiante (many-to-many)
    public function enrolledSchedules()
    {
        return $this->belongsToMany(Schedule::class, 'schedule_enrollments', 'student_id', 'schedule_id')
            ->withPivot('enrollment_date', 'status', 'final_grade', 'notes')
            ->withTimestamps();
    }

    // Horarios activos como estudiante
    public function activeSchedules()
    {
        return $this->enrolledSchedules()->wherePivot('status', 'enrolled');
    }

    // Inscripciones a programas académicos
    public function programEnrollments()
    {
        return $this->hasMany(\App\Models\Enrollment::class, 'student_id');
    }

    // Programas académicos en los que está inscrito
    public function enrolledPrograms()
    {
        return $this->belongsToMany(\App\Models\AcademicProgram::class, 'enrollments', 'student_id', 'program_id')
            ->withPivot('enrollment_date', 'status')
            ->withTimestamps();
    }

    // ========== Relaciones con Asistencia ==========

    // Asistencias como estudiante
    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'student_id');
    }

    // Asistencias registradas por este usuario (profesor/admin)
    public function recordedAttendances()
    {
        return $this->hasMany(Attendance::class, 'recorded_by');
    }

    // ========== Relaciones con Pagos ==========

    // Pagos del estudiante
    public function payments()
    {
        return $this->hasMany(Payment::class, 'student_id');
    }

    // Pagos pendientes
    public function pendingPayments()
    {
        return $this->payments()->where('status', 'pending');
    }

    // Pagos completados
    public function completedPayments()
    {
        return $this->payments()->where('status', 'completed');
    }

    // Pagos registrados por este usuario
    public function recordedPayments()
    {
        return $this->hasMany(Payment::class, 'recorded_by');
    }

    // ========== Relaciones con Progreso ==========

    // Progreso como estudiante
    public function studentProgress()
    {
        return $this->hasMany(StudentProgress::class, 'student_id');
    }

    // Progreso registrado como profesor
    public function recordedProgress()
    {
        return $this->hasMany(StudentProgress::class, 'teacher_id');
    }

    // ========== Relaciones con Comunicaciones ==========

    // Conversaciones del usuario
    public function conversations()
    {
        return $this->belongsToMany(Conversation::class)
            ->withPivot('last_read_at')
            ->withTimestamps()
            ->latest('last_message_at');
    }

    // Mensajes enviados por el usuario
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

}

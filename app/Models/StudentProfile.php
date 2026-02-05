<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class StudentProfile extends Model
{
    use HasFactory, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'modality',
        'desired_instrument',
        'plays_instrument',
        'instruments_played',
        'has_music_studies',
        'music_schools',
        'current_level',
        'emergency_contact_name',
        'emergency_contact_phone',
        'medical_conditions',
        'allergies',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'plays_instrument' => 'boolean',
            'has_music_studies' => 'boolean',
            'current_level' => 'integer',
        ];
    }

    /**
     * Get the activity log options for the model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'modality',
                'desired_instrument',
                'plays_instrument',
                'instruments_played',
                'has_music_studies',
                'music_schools',
                'current_level',
            ])
            ->logOnlyDirty()
            ->useLogName('student_profile');
    }

    /**
     * Get the user that owns this student profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the modality display name.
     */
    public function getModalityDisplayAttribute(): string
    {
        return match ($this->modality) {
            'Linaje Kids' => 'Kids (5-11 años)',
            'Linaje Teens' => 'Teens (12-17 años)',
            'Linaje Big' => 'Big (18+ años)',
            default => 'No definida',
        };
    }

    /**
     * Check if the student has emergency contact info.
     */
    public function hasEmergencyContact(): bool
    {
        return ! empty($this->emergency_contact_name) && ! empty($this->emergency_contact_phone);
    }

    /**
     * Check if the student has medical info.
     */
    public function hasMedicalInfo(): bool
    {
        return ! empty($this->medical_conditions) || ! empty($this->allergies);
    }
}

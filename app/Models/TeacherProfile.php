<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class TeacherProfile extends Model
{
    use HasFactory, LogsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'instruments_played',
        'music_schools',
        'experience_years',
        'bio',
        'specialization',
        'hourly_rate',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'experience_years' => 'integer',
            'hourly_rate' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the activity log options for the model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'instruments_played',
                'music_schools',
                'experience_years',
                'bio',
                'specialization',
                'hourly_rate',
                'is_active',
            ])
            ->logOnlyDirty()
            ->useLogName('teacher_profile');
    }

    /**
     * Get the user that owns this teacher profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get instruments as an array.
     */
    public function getInstrumentsArrayAttribute(): array
    {
        if (empty($this->instruments_played)) {
            return [];
        }

        return array_map('trim', explode(',', $this->instruments_played));
    }

    /**
     * Get the experience display text.
     */
    public function getExperienceDisplayAttribute(): string
    {
        if (is_null($this->experience_years)) {
            return 'No especificada';
        }

        if ($this->experience_years === 0) {
            return 'Menos de 1 año';
        }

        if ($this->experience_years === 1) {
            return '1 año';
        }

        return "{$this->experience_years} años";
    }

    /**
     * Scope to get only active teachers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get teachers by instrument.
     */
    public function scopeByInstrument($query, string $instrument)
    {
        return $query->where('instruments_played', 'like', "%{$instrument}%");
    }
}

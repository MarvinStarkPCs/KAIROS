<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Conversation extends Model
{
    use LogsActivity;

    protected $fillable = [
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['last_message_at'])
            ->logOnlyDirty()
            ->useLogName('conversations');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('last_read_at')
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function getOtherUser(int $currentUserId): ?User
    {
        return $this->users()->where('users.id', '!=', $currentUserId)->first();
    }

    public function unreadMessagesCount(int $userId): int
    {
        $lastRead = $this->users()
            ->where('users.id', $userId)
            ->first()
            ?->pivot
            ?->last_read_at;

        if (!$lastRead) {
            return $this->messages()
                ->where('user_id', '!=', $userId)
                ->count();
        }

        return $this->messages()
            ->where('user_id', '!=', $userId)
            ->where('created_at', '>', $lastRead)
            ->count();
    }
}

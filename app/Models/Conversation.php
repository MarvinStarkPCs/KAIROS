<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
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

    /**
     * Mensajes no leídos por conversación para un usuario, en una sola consulta.
     *
     * @return \Illuminate\Support\Collection<int, int> conversation_id => total
     */
    public static function unreadCountsFor(int $userId): \Illuminate\Support\Collection
    {
        return DB::table('messages')
            ->join('conversation_user as cu', function ($join) use ($userId) {
                $join->on('cu.conversation_id', '=', 'messages.conversation_id')
                    ->where('cu.user_id', '=', $userId);
            })
            ->where('messages.user_id', '!=', $userId)
            ->where(function ($query) {
                $query->whereNull('cu.last_read_at')
                    ->orWhereColumn('messages.created_at', '>', 'cu.last_read_at');
            })
            ->groupBy('messages.conversation_id')
            ->selectRaw('messages.conversation_id, COUNT(*) as total')
            ->pluck('total', 'conversation_id')
            ->map(fn ($total) => (int) $total);
    }
}

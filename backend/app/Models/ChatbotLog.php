<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'session_id', 'user_message', 'ai_response'])]
class ChatbotLog extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'chatbot_logs';

    /**
     * Get the user that generated the chatbot log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

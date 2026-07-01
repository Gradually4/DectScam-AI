<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'feature', 'used_count', 'date'])]
class UserUsage extends Model
{
    /**
     * Get the user that owns the usage.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

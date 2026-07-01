<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'scan_type', 'input_data', 'risk_score', 'risk_level', 'ai_analysis_details'])]
class Detection extends Model
{
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ai_analysis_details' => 'array',
            'risk_score' => 'decimal:2',
        ];
    }

    /**
     * Get the user that performed the detection.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

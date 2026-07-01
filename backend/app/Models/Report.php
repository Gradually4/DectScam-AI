<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'user_id',
    'title',
    'entity_name',
    'entity_contact',
    'fraud_category_id',
    'description',
    'evidence_path',
    'status'
])]
class Report extends Model
{
    use HasFactory;

    /**
     * Get the user that submitted the report.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the category that this report belongs to.
     */
    public function fraudCategory(): BelongsTo
    {
        return $this->belongsTo(FraudCategory::class);
    }

    /**
     * Get the platforms associated with this report.
     */
    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class);
    }
}

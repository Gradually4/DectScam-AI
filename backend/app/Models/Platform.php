<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable(['name'])]
class Platform extends Model
{
    use HasFactory;

    /**
     * Get the reports associated with this platform.
     */
    public function reports(): BelongsToMany
    {
        return $this->belongsToMany(Report::class);
    }
}

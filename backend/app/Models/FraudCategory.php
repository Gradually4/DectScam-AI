<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug'])]
class FraudCategory extends Model
{
    use HasFactory;

    /**
     * Get the reports under this category.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}

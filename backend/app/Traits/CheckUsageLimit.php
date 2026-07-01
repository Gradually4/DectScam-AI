<?php

namespace App\Traits;

use App\Models\UserUsage;
use Carbon\Carbon;

trait CheckUsageLimit
{
    protected $limits = [
        'free' => ['text' => 5, 'url' => 5, 'image' => 3, 'chat' => 3, 'investment' => 5],
        'plus' => ['text' => 20, 'url' => 20, 'image' => 10, 'chat' => 10, 'investment' => 20],
        'pro'  => ['text' => 50, 'url' => 50, 'image' => 30, 'chat' => 30, 'investment' => 50],
    ];

    /**
     * Check if user has exceeded usage limit for a feature, and increment used_count if allowed.
     *
     * @param  \App\Models\User  $user
     * @param  string  $feature
     * @return bool|\Illuminate\Http\JsonResponse
     */
    public function checkAndIncrementUsage($user, $feature)
    {
        // 1. Bypass check if admin or ultimate tier
        if ($user->role === 'admin' || $user->subscription_tier === 'ultimate') {
            return true;
        }

        $tier = $user->subscription_tier ?: 'free';
        $today = Carbon::today()->toDateString();

        // 2. Fetch limit for current tier and feature
        $limit = isset($this->limits[$tier][$feature]) ? $this->limits[$tier][$feature] : 0;

        // 3. Find or create the usage record for today
        $usage = UserUsage::firstOrCreate(
            [
                'user_id' => $user->id,
                'feature' => $feature,
                'date' => $today,
            ],
            [
                'used_count' => 0,
            ]
        );

        // 4. Check if limit is exceeded
        if ($usage->used_count >= $limit) {
            return response()->json([
                'status' => 'error',
                'error_code' => 'limit_exceeded',
                'message' => "Limit paket {$tier} Anda habis. Silakan upgrade ke paket yang lebih tinggi."
            ], 403);
        }

        // 5. Increment usage count
        $usage->increment('used_count');

        return true;
    }
}

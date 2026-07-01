<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class PaymentController extends Controller
{
    private array $tierPrices = [
        'plus' => 29000,
        'pro' => 59000,
        'ultimate' => 99000,
    ];

    public function __construct()
    {
        // Set Midtrans Configuration
        \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY', 'SB-Mid-server-YOUR_DUMMY_KEY');
        \Midtrans\Config::$isProduction = filter_var(env('MIDTRANS_IS_PRODUCTION', false), FILTER_VALIDATE_BOOLEAN);
        \Midtrans\Config::$isSanitized = filter_var(env('MIDTRANS_IS_SANITIZED', true), FILTER_VALIDATE_BOOLEAN);
        \Midtrans\Config::$is3ds = filter_var(env('MIDTRANS_IS_3DS', true), FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Request a Midtrans Snap Token for transaction overlay.
     */
    public function requestSnapToken(Request $request)
    {
        $request->validate([
            'tier' => 'required|string|in:plus,pro,ultimate',
        ]);

        $user = $request->user();
        $tier = $request->tier;
        $amount = $this->tierPrices[$tier];

        // Format Order ID: SUB-{userId}-{tier}-{timestamp}
        $orderId = 'SUB-' . $user->id . '-' . $tier . '-' . time();

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => $amount,
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
            ],
            'item_details' => [
                [
                    'id' => $tier,
                    'price' => $amount,
                    'quantity' => 1,
                    'name' => 'DectScam ' . ucfirst($tier) . ' Plan',
                ]
            ],
        ];

        try {
            $snapToken = \Midtrans\Snap::getSnapToken($params);

            return response()->json([
                'status' => 'success',
                'snap_token' => $snapToken,
                'order_id' => $orderId
            ], 200);
        } catch (Exception $e) {
            Log::error('Midtrans Snap Token Request Failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal terhubung ke penyedia pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle payment notification from Midtrans (Webhook).
     */
    public function handleNotification(Request $request)
    {
        try {
            $notification = $request->all();

            $orderId = $notification['order_id'] ?? '';
            $statusCode = $notification['status_code'] ?? '';
            $grossAmount = $notification['gross_amount'] ?? '';
            $signatureKey = $notification['signature_key'] ?? '';
            $transactionStatus = $notification['transaction_status'] ?? '';
            $paymentType = $notification['payment_type'] ?? '';
            $fraudStatus = $notification['fraud_status'] ?? '';

            // Verify Midtrans Signature Key
            $serverKey = env('MIDTRANS_SERVER_KEY', 'SB-Mid-server-YOUR_DUMMY_KEY');
            $localSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

            if ($localSignature !== $signatureKey) {
                Log::warning('Midtrans Webhook Invalid Signature Key for Order: ' . $orderId);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid signature key'
                ], 403);
            }

            // Extract user id and tier from order_id: SUB-{userId}-{tier}-{timestamp}
            $parts = explode('-', $orderId);
            if (count($parts) < 4 || $parts[0] !== 'SUB') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid order ID format'
                ], 400);
            }

            $userId = $parts[1];
            $tier = $parts[2];

            $user = User::find($userId);
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found'
                ], 404);
            }

            // Handle transaction status
            if ($transactionStatus === 'capture') {
                if ($paymentType === 'credit_card') {
                    if ($fraudStatus === 'challenge') {
                        Log::info("Payment challenge: Order " . $orderId);
                    } else {
                        // Success
                        $user->subscription_tier = $tier;
                        $user->save();
                        Log::info("Subscription upgraded to: " . $tier . " for User ID " . $userId);
                    }
                }
            } elseif ($transactionStatus === 'settlement') {
                // Success
                $user->subscription_tier = $tier;
                $user->save();
                Log::info("Subscription upgraded to: " . $tier . " for User ID " . $userId);
            } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'])) {
                Log::info("Payment failed/expired: Order " . $orderId);
            } elseif ($transactionStatus === 'pending') {
                Log::info("Payment pending: Order " . $orderId);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Notification processed successfully'
            ], 200);

        } catch (Exception $e) {
            Log::error('Midtrans Webhook Error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Server Error: ' . $e->getMessage()
            ], 500);
        }
    }
}

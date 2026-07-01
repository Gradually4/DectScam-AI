<?php
 
namespace App\Http\Controllers\Api\V1;
 
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Traits\CheckUsageLimit;
use Exception;
 
class ChatController extends Controller
{
    use CheckUsageLimit;
    /**
     * Forward user message to FastAPI chatbot service and return response.
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $usageCheck = $this->checkAndIncrementUsage($request->user(), 'chat');
        if ($usageCheck !== true) {
            return $usageCheck;
        }

        $aiUrl = config('services.ai.url', 'http://127.0.0.1:8000');
        $endpoint = $aiUrl . '/api/v1/chat';
 
        try {
            // Forward payload to FastAPI AI Service
            $response = Http::timeout(60)->post($endpoint, [
                'user_message' => $request->message,
            ]);
 
            if ($response->failed()) {
                Log::error('Chatbot AI Service failed: ' . $response->body());
                $errorData = $response->json();
                $msg = $errorData['message'] ?? 'Layanan asisten AI sedang mengalami gangguan.';
                return response()->json([
                    'status' => 'error',
                    'message' => $msg,
                ], 502);
            }
 
            return response()->json($response->json(), 200);
 
        } catch (Exception $e) {
            Log::error('AI Chat Connection Error: ' . $e->getMessage());
 
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghubungkan ke layanan asisten AI. Pastikan AI Service aktif.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }
}

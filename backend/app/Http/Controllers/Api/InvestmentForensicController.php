<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Detection;
use App\Traits\CheckUsageLimit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class InvestmentForensicController extends Controller
{
    use CheckUsageLimit;

    /**
     * Scan suspicious investment promotional text using AI analysis.
     * Logs the scan results to the detections table.
     */
    public function scanInvestment(Request $request)
    {
        // 1. Validasi input
        $request->validate([
            'entity_name' => 'nullable|string',
            'promotional_text' => 'required|string',
            'screenshot_file' => 'nullable|image|max:10240',
        ]);

        // Check usage limits
        $usageCheck = $this->checkAndIncrementUsage($request->user(), 'investment');
        if ($usageCheck !== true) {
            return $usageCheck;
        }

        $aiUrl = env('AI_SERVICE_URL', 'http://127.0.0.1:8000');
        $apiKey = env('AI_API_KEY');
        $extractedText = '';

        // If screenshot_file is provided, perform OCR extraction via FastAPI
        if ($request->hasFile('screenshot_file')) {
            try {
                $file = $request->file('screenshot_file');
                $ocrEndpoint = rtrim($aiUrl, '/') . '/api/v1/detect/image';
                
                $ocrResponse = Http::timeout(30)
                    ->attach(
                        'file',
                        file_get_contents($file->getRealPath()),
                        $file->getClientOriginalName()
                    )
                    ->post($ocrEndpoint);

                if ($ocrResponse->successful()) {
                    $extractedText = $ocrResponse->json('data.extracted_text', '');
                }
            } catch (Exception $ocrEx) {
                Log::warning('OCR extraction failed during investment scan: ' . $ocrEx->getMessage());
            }
        }

        // Compile unified text to analyze
        $compiledText = '';
        if ($request->filled('entity_name')) {
            $compiledText .= "Platform/Entitas Investasi: " . $request->entity_name . "\n";
        }
        $compiledText .= "Teks Promosi: " . $request->promotional_text;
        if (!empty($extractedText)) {
            $compiledText .= "\nTeks Dari Gambar/Brosur: " . $extractedText;
        }

        // 2. Siapkan variabel $systemPrompt yang menginstruksikan AI untuk menjadi Analis Forensik Finansial.
        $systemPrompt = "Anda adalah Analis Forensik Finansial yang ahli mendeteksi penipuan investasi, skema Ponzi, dan robot trading bodong.\n\n"
            . "Tugas Anda adalah memindai teks promosi investasi yang dikirimkan oleh pengguna dengan mematuhi aturan analisis ketat berikut:\n"
            . "1. Fundamental Reality Check: Tegaskan bahwa instrumen keuangan riil dan saham berfundamental kuat (seperti INCO, BRMS, MBMA) bergerak murni karena mekanisme penawaran dan permintaan pasar. Tidak ada investasi legal yang bisa menjamin keuntungan tetap (fix return) baik harian maupun bulanan.\n"
            . "2. Platform Legitimacy: Waspadai ajakan untuk mentransfer dana/deposit ke rekening atas nama pribadi atau menggunakan aplikasi robot trading pihak ketiga yang tidak terdaftar di regulator sekuritas resmi (seperti OJK atau Bappebti).\n"
            . "3. FOMO Tactics: Pindai taktik psikologis kelangkaan dan urgensi, seperti 'Slot terbatas!', 'Hanya untuk hari ini!', atau janji cepat kaya tanpa risiko.\n\n"
            . "HANYA kembalikan respons dalam format JSON murni dengan struktur persis seperti ini (tanpa menyertakan format markdown ```json):\n"
            . "{\n"
            . "  \"risk_score\": <skor risiko dari 0 hingga 100>,\n"
            . "  \"risk_level\": \"<aman|waspada|bahaya>\",\n"
            . "  \"ai_analysis_details\": {\n"
            . "    \"fundamental_flaws\": \"<rincian kecacatan fundamental investasi dalam bahasa Indonesia>\",\n"
            . "    \"psychological_tactics\": \"<rincian taktik psikologis/FOMO yang digunakan dalam bahasa Indonesia>\"\n"
            . "  }\n"
            . "}";

        // 3. Gunakan Illuminate\Support\Facades\Http untuk menembak API AI
        $endpoint = rtrim($aiUrl, '/') . '/api/v1/detect/investment';

        try {
            // Forward payload to FastAPI AI Service
            $response = Http::withHeaders([
                'X-API-Key' => $apiKey,
            ])->timeout(30)->post($endpoint, [
                'promotional_text' => $compiledText,
                'system_prompt' => $systemPrompt,
            ]);

            if ($response->failed()) {
                Log::error('AI Investment Service returned failure: ' . $response->body());
                return response()->json([
                    'status' => 'error',
                    'message' => 'Layanan analisis AI mendeteksi kesalahan internal atau tidak merespons.',
                ], 502);
            }

            $responseData = $response->json();
            
            // Extract metrics for database logging
            $riskScore = data_get($responseData, 'data.risk_score', 0);
            $riskLevel = data_get($responseData, 'data.risk_level', 'aman');
            $aiAnalysisDetails = data_get($responseData, 'data.ai_analysis_details', []);

            // 4. Simpan hasil deteksi ke tabel detections (gunakan model App\Models\Detection).
            $detection = Detection::create([
                'user_id' => $request->user()->id,
                'scan_type' => 'text',
                'input_data' => $compiledText,
                'risk_score' => $riskScore,
                'risk_level' => $riskLevel,
                'ai_analysis_details' => $aiAnalysisDetails,
            ]);

            // Append local scan record id to response for frontend convenience
            if (isset($responseData['data'])) {
                $responseData['data']['local_id'] = $detection->id;
            }

            // 5. Kembalikan respons JSON ke frontend.
            return response()->json($responseData, 200);

        } catch (Exception $e) {
            Log::error('AI Investment Connection Error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghubungkan ke layanan deteksi AI. Pastikan AI Service aktif.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }
}

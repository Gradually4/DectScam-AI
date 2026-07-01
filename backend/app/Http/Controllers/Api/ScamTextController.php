<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Detection;
use App\Traits\CheckUsageLimit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class ScamTextController extends Controller
{
    use CheckUsageLimit;

    /**
     * Analyze text for social engineering, malware, or impersonation.
     * Logs the scan results to the detections table.
     */
    public function analyzeText(Request $request)
    {
        // 1. Validasi input
        $request->validate([
            'text_content' => 'required|string|min:10',
        ]);

        // Check usage limits
        $usageCheck = $this->checkAndIncrementUsage($request->user(), 'text');
        if ($usageCheck !== true) {
            return $usageCheck;
        }

        $aiUrl = env('AI_SERVICE_URL', 'http://127.0.0.1:8000');
        $apiKey = env('AI_API_KEY');

        // 2. Siapkan $systemPrompt yang SANGAT KETAT
        $systemPrompt = "Anda adalah Analis Keamanan Siber senior yang ahli mendeteksi Social Engineering (rekayasa sosial), Phishing, dan Malware.\n\n"
            . "Tugas Anda adalah menganalisis teks pesan mencurigakan yang dikirimkan oleh pengguna dengan mematuhi aturan analisis ketat berikut:\n"
            . "1. Malware/APK Rule: Jika teks mengandung ajakan/instruksi untuk mengunduh berkas aplikasi atau mengakses tautan berakhiran .apk, file .pdf palsu, atau tautan tidak resmi (typosquatting), Anda HARUS menetapkan skor risiko (risk_score) sebesar 90-100 (BAHAYA TINGGI/bahaya).\n"
            . "2. Social Engineering Rule: Deteksi adanya ancaman psikologis, manipulasi emosi, atau desakan waktu (urgensi palsu) seperti klaim 'paket akan diretur', 'rekening diblokir', 'pemenang undian', 'tagihan tilang', atau 'pemutusan layanan PLN'.\n"
            . "3. Impersonation Rule: Waspadai jika pengirim mengaku/mengatasnamakan instansi atau perusahaan resmi seperti J&T, JNE, PLN, Kepolisian (POLRI), atau Bank (BCA, Mandiri, BRI, dll.) namun disertai instruksi mencurigakan atau tautan tidak resmi.\n\n"
            . "HANYA kembalikan respons dalam format JSON murni dengan struktur persis seperti ini (tanpa format markdown atau pembungkus kode):\n"
            . "{\n"
            . "  \"risk_score\": <skor risiko dari 0 hingga 100>,\n"
            . "  \"risk_level\": \"<aman|waspada|bahaya>\",\n"
            . "  \"analysis\": \"<penjelasan detail mengapa teks ini diidentifikasi aman/waspada/bahaya dalam bahasa Indonesia>\",\n"
            . "  \"manipulative_keywords\": [\"kata1\", \"kata2\"]\n"
            . "}";

        $endpoint = rtrim($aiUrl, '/') . '/api/v1/detect/text-advanced';

        try {
            // Forward payload to FastAPI AI Service
            $response = Http::withHeaders([
                'X-API-Key' => $apiKey,
            ])->timeout(30)->post($endpoint, [
                'text_content' => $request->text_content,
                'system_prompt' => $systemPrompt,
            ]);

            if ($response->failed()) {
                Log::error('AI Text Advanced Service returned failure: ' . $response->body());
                return response()->json([
                    'status' => 'error',
                    'message' => 'Layanan analisis AI mendeteksi kesalahan internal atau tidak merespons.',
                ], 502);
            }

            $responseData = $response->json();
            
            // Extract metrics for database logging
            $riskScore = data_get($responseData, 'data.risk_score', 0);
            $riskLevel = data_get($responseData, 'data.risk_level', 'aman');
            $analysis = data_get($responseData, 'data.analysis', 'Tidak terdeteksi kejanggalan pada teks.');
            $manipulativeKeywords = data_get($responseData, 'data.manipulative_keywords', []);

            // Save detection record in MySQL detections table
            $detection = Detection::create([
                'user_id' => $request->user()->id,
                'scan_type' => 'text',
                'input_data' => $request->text_content,
                'risk_score' => $riskScore,
                'risk_level' => $riskLevel,
                'ai_analysis_details' => [
                    'recommendation' => $analysis,
                    'keywords_detected' => $manipulativeKeywords
                ],
            ]);

            // Format response to frontend convenience
            return response()->json([
                'status' => 'success',
                'data' => [
                    'local_id' => $detection->id,
                    'risk_score' => $riskScore,
                    'risk_level' => $riskLevel,
                    'ai_analysis' => [
                        'recommendation' => $analysis,
                        'keywords_detected' => $manipulativeKeywords
                    ]
                ]
            ], 200);

        } catch (Exception $e) {
            Log::error('AI Text Advanced Connection Error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghubungkan ke layanan deteksi AI. Pastikan AI Service aktif.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }
}

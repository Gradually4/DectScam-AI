<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\TextDetectionRequest;
use App\Http\Requests\Api\V1\UrlDetectionRequest;
use App\Http\Requests\Api\V1\ImageDetectionRequest;
use App\Models\Detection;
use App\Traits\CheckUsageLimit;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class DetectionController extends Controller
{
    use CheckUsageLimit;
    /**
     * Scan suspicious text content using Python FastAPI service.
     * Logs the scan results to MySQL database.
     */
    public function detectText(TextDetectionRequest $request)
    {
        $usageCheck = $this->checkAndIncrementUsage($request->user(), 'text');
        if ($usageCheck !== true) {
            return $usageCheck;
        }

        $aiUrl = config('services.ai.url', 'http://127.0.0.1:8000');
        $endpoint = $aiUrl . '/api/v1/detect/text';

        try {
            // Forward payload to FastAPI AI Service
            $response = Http::timeout(10)->post($endpoint, [
                'text_content' => $request->text_content,
            ]);

            if ($response->failed()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Layanan analisis AI mendeteksi kesalahan internal.',
                ], 502);
            }

            $responseData = $response->json();

            // Extract metrics for database logging
            $riskScore = $response->json('data.risk_score', 0.0);
            $riskLevel = $response->json('data.risk_level', 'aman');
            $aiAnalysis = $response->json('data.ai_analysis', []);

            // Save detection record in MySQL detections table
            $detection = Detection::create([
                'user_id' => $request->user()->id,
                'scan_type' => 'text',
                'input_data' => $request->text_content,
                'risk_score' => $riskScore,
                'risk_level' => $riskLevel,
                'ai_analysis_details' => $aiAnalysis,
            ]);

            // Append local scan record id to response for frontend convenience
            if (isset($responseData['data'])) {
                $responseData['data']['local_id'] = $detection->id;
            }

            return response()->json($responseData, 200);

        } catch (Exception $e) {
            Log::error('AI Service Connection Error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghubungkan ke layanan deteksi AI. Pastikan AI Service aktif.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Scan suspicious URL using Python FastAPI service.
     * Logs the scan results to MySQL database.
     */
    public function detectUrl(UrlDetectionRequest $request)
    {
        $usageCheck = $this->checkAndIncrementUsage($request->user(), 'url');
        if ($usageCheck !== true) {
            return $usageCheck;
        }

        $aiUrl = config('services.ai.url', 'http://127.0.0.1:8000');
        $endpoint = $aiUrl . '/api/v1/detect/url';

        try {
            // Forward payload to FastAPI AI Service
            $response = Http::timeout(30)->post($endpoint, [
                'url' => $request->url,
            ]);

            if ($response->failed()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Layanan analisis AI mendeteksi kesalahan internal.',
                ], 502);
            }

            $responseData = $response->json();

            // Extract metrics for database logging
            $riskScore = $response->json('data.risk_score', 0.0);
            $riskLevel = $response->json('data.risk_level', 'aman');
            $aiAnalysis = $response->json('data.ai_analysis', []);

            // Save detection record in MySQL detections table
            $detection = Detection::create([
                'user_id' => $request->user()->id,
                'scan_type' => 'url',
                'input_data' => $request->url,
                'risk_score' => $riskScore,
                'risk_level' => $riskLevel,
                'ai_analysis_details' => $aiAnalysis,
            ]);

            // Append local scan record id to response for frontend convenience
            if (isset($responseData['data'])) {
                $responseData['data']['local_id'] = $detection->id;
            }

            return response()->json($responseData, 200);

        } catch (Exception $e) {
            Log::error('AI Service Connection Error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghubungkan ke layanan deteksi AI. Pastikan AI Service aktif.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Scan uploaded screenshot/image using Python FastAPI OCR service.
     * Logs the scan results to MySQL database.
     */
    public function detectImage(ImageDetectionRequest $request)
    {
        $usageCheck = $this->checkAndIncrementUsage($request->user(), 'image');
        if ($usageCheck !== true) {
            return $usageCheck;
        }

        $aiUrl = config('services.ai.url', 'http://127.0.0.1:8000');
        $endpoint = $aiUrl . '/api/v1/detect/image';

        try {
            $file = $request->file('image');

            // Forward file as multipart/form-data to FastAPI AI Service
            $response = Http::timeout(30)
                ->attach(
                    'file',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName()
                )
                ->post($endpoint);

            if ($response->failed()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Layanan analisis gambar AI mendeteksi kesalahan internal.',
                ], 502);
            }

            $responseData = $response->json();

            // Extract metrics for database logging
            $riskScore = $response->json('data.risk_score', 0.0);
            $riskLevel = $response->json('data.risk_level', 'aman');
            $aiAnalysis = $response->json('data.ai_analysis', []);
            $extractedText = $response->json('data.extracted_text', '');

            // Save detection record in MySQL detections table
            $detection = Detection::create([
                'user_id' => $request->user()->id,
                'scan_type' => 'image',
                'input_data' => $file->getClientOriginalName(),
                'risk_score' => $riskScore,
                'risk_level' => $riskLevel,
                'ai_analysis_details' => array_merge(
                    is_array($aiAnalysis) ? $aiAnalysis : [],
                    ['extracted_text' => $extractedText]
                ),
            ]);

            // Append local scan record id to response for frontend convenience
            if (isset($responseData['data'])) {
                $responseData['data']['local_id'] = $detection->id;
            }

            return response()->json($responseData, 200);

        } catch (Exception $e) {
            Log::error('AI Image Service Error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghubungkan ke layanan deteksi gambar AI. Pastikan AI Service aktif.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }
}

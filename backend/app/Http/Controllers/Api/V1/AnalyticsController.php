<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Detection;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;

class AnalyticsController extends Controller
{
    /**
     * Get aggregate statistics for the admin/user dashboard.
     */
    public function getDashboardStats(Request $request)
    {
        try {
            $user = $request->user();
            $isAdmin = $user && $user->role === 'admin';

            // Query base for detections and reports
            $detectionsQuery = Detection::query();
            $reportsQuery = Report::query();

            // Scope queries to the user if not an administrator
            if (!$isAdmin) {
                $detectionsQuery->where('user_id', $user->id);
                $reportsQuery->where('user_id', $user->id);
            }

            // Count total scans and reports
            $totalScans = (clone $detectionsQuery)->count();
            $totalReports = (clone $reportsQuery)->count();

            // Count distribution of risk levels
            $riskDistributionRaw = (clone $detectionsQuery)
                ->select('risk_level', DB::raw('count(*) as count'))
                ->groupBy('risk_level')
                ->get()
                ->pluck('count', 'risk_level')
                ->toArray();

            $riskDistribution = [
                'aman' => (int)($riskDistributionRaw['aman'] ?? 0),
                'waspada' => (int)($riskDistributionRaw['waspada'] ?? 0),
                'bahaya' => (int)($riskDistributionRaw['bahaya'] ?? 0),
            ];

            // Count distribution of scan types
            $scanTypesRaw = (clone $detectionsQuery)
                ->select('scan_type', DB::raw('count(*) as count'))
                ->groupBy('scan_type')
                ->get()
                ->pluck('count', 'scan_type')
                ->toArray();

            $scanTypes = [
                'text' => (int)($scanTypesRaw['text'] ?? 0),
                'url' => (int)($scanTypesRaw['url'] ?? 0),
                'image' => (int)($scanTypesRaw['image'] ?? 0),
            ];

            // Fetch the 5 most recent scans
            $recentScans = (clone $detectionsQuery)
                ->with('user')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($scan) {
                    return [
                        'id' => $scan->id,
                        'type' => ucfirst($scan->scan_type),
                        'input' => $scan->input_data,
                        'score' => floatval($scan->risk_score),
                        'level' => $scan->risk_level,
                        'time' => $scan->created_at->diffForHumans(),
                        'user_name' => $scan->user ? $scan->user->name : 'Guest'
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'role' => $user ? $user->role : 'user',
                    'total_scans' => $totalScans,
                    'total_reports' => $totalReports,
                    'risk_distribution' => $riskDistribution,
                    'scan_types' => $scanTypes,
                    'recent_scans' => $recentScans,
                ]
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data statistik dashboard.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get advanced analytics statistics for the admin dashboard.
     */
    public function getAdminStats(Request $request)
    {
        try {
            // 1. Total Laporan per Kategori
            $reportsByCategory = DB::table('reports')
                ->join('fraud_categories', 'reports.fraud_category_id', '=', 'fraud_categories.id')
                ->select('fraud_categories.name as category_name', DB::raw('count(reports.id) as count'))
                ->groupBy('fraud_categories.id', 'fraud_categories.name')
                ->get()
                ->map(function ($item) {
                    return [
                        'category_name' => $item->category_name,
                        'count' => (int)$item->count
                    ];
                });

            // 2. Platform Paling Rawan
            $platformsRawan = DB::table('platform_report')
                ->join('platforms', 'platform_report.platform_id', '=', 'platforms.id')
                ->select('platforms.name as platform_name', DB::raw('count(platform_report.report_id) as count'))
                ->groupBy('platforms.id', 'platforms.name')
                ->orderByDesc('count')
                ->get()
                ->map(function ($item) {
                    return [
                        'platform_name' => $item->platform_name,
                        'count' => (int)$item->count
                    ];
                });

            // 3. Tren Laporan (Interaktif berdasarkan parameter days)
            $daysInput = $request->query('days', 7);
            if ($daysInput === '365' || $daysInput === 'year') {
                $startDate = now()->startOfYear();
                $days = (int)now()->diffInDays($startDate);
            } else {
                $days = (int)$daysInput;
                if ($days <= 0) {
                    $days = 7;
                }
                $startDate = now()->subDays($days - 1)->startOfDay();
            }

            $reportTrendRaw = Report::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
                ->where('created_at', '>=', $startDate)
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('date', 'asc')
                ->get()
                ->pluck('count', 'date')
                ->toArray();

            // Populate all days in the range to ensure dates are continuous
            $labels = [];
            $data = [];
            
            $currentDate = clone $startDate;
            $today = now()->startOfDay();
            
            while ($currentDate->lte($today)) {
                $dateString = $currentDate->format('Y-m-d');
                $formattedDate = $currentDate->format('d M');
                
                $count = 0;
                foreach ($reportTrendRaw as $key => $val) {
                    if (date('Y-m-d', strtotime($key)) === $dateString) {
                        $count = (int)$val;
                        break;
                    }
                }
                
                $labels[] = $formattedDate;
                $data[] = $count;
                
                $currentDate->addDay();
            }

            $reportTrend = [
                'labels' => $labels,
                'data' => $data
            ];

            return response()->json([
                'status' => 'success',
                'data' => [
                    'reports_by_category' => $reportsByCategory,
                    'platforms_rawan' => $platformsRawan,
                    'report_trend' => $reportTrend
                ]
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data statistik analitik admin.',
                'error_detail' => $e->getMessage()
            ], 500);
        }
    }
}


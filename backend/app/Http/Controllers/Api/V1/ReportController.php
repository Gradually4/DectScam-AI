<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreReportRequest;
use App\Models\Report;
use App\Models\FraudCategory;
use App\Models\Platform;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    /**
     * Display a listing of approved reports (public feed).
     */
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $status = $request->input('status', 'approved');

        // Only admins are allowed to see pending/rejected reports
        if ($status !== 'approved') {
            $user = $request->user('sanctum');
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Akses ditolak. Hanya admin yang dapat mengakses antrean moderasi.'
                ], 403);
            }
        }

        $reports = Report::with(['user:id,name', 'fraudCategory', 'platforms'])
            ->where('status', $status)
            ->latest()
            ->paginate($limit);

        return response()->json([
            'status' => 'success',
            'data' => collect($reports->items())->map(function ($report) {
                return [
                    'id' => $report->id,
                    'title' => $report->title,
                    'entity_name' => $report->entity_name,
                    'entity_contact' => $report->entity_contact,
                    'fraud_type' => $report->fraudCategory?->name ?? 'Lainnya',
                    'description' => $report->description,
                    'location_platform' => $report->platforms->pluck('name')->join(' & '),
                    'status' => $report->status,
                    'user_name' => $report->user?->name ?? 'Anonim',
                    'created_at' => $report->created_at ? $report->created_at->toISOString() : null,
                ];
            }),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'total_pages' => $reports->lastPage(),
                'total' => $reports->total(),
            ]
        ], 200);
    }

    /**
     * Store a newly created report in storage.
     */
    public function store(StoreReportRequest $request)
    {
        // 1. Resolve or create fraud category
        $category = FraudCategory::firstOrCreate(
            ['slug' => Str::slug($request->fraud_type)],
            ['name' => $request->fraud_type]
        );

        // 2. Create the report
        $report = Report::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'entity_name' => $request->entity_name,
            'entity_contact' => $request->entity_contact,
            'fraud_category_id' => $category->id,
            'description' => $request->description,
            'status' => 'pending', // default to pending for moderation
        ]);

        // 3. Resolve and associate platforms
        if ($request->filled('location_platform')) {
            $platformNames = preg_split('/(\s*&\s*|\s*,\s*|\s+and\s+|\s+dan\s+)/i', $request->location_platform);
            $platformIds = [];
            foreach ($platformNames as $name) {
                $name = trim($name);
                if ($name !== '') {
                    $platform = Platform::firstOrCreate(['name' => $name]);
                    $platformIds[] = $platform->id;
                }
            }
            if (!empty($platformIds)) {
                $report->platforms()->attach($platformIds);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan berhasil diajukan dan sedang menunggu moderasi admin.'
        ], 201);
    }

    /**
     * Update report status (Admin only: approve or reject).
     */
    public function updateStatus(Request $request, $id)
    {
        // Check if current user is admin
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Hanya admin yang dapat mengubah status laporan.'
            ], 403);
        }

        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'status' => 'error',
                'message' => 'Laporan tidak ditemukan.'
            ], 404);
        }

        $report->status = $request->status;
        $report->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Status laporan berhasil diperbarui menjadi ' . $request->status . '.',
            'data' => [
                'id' => $report->id,
                'status' => $report->status,
            ]
        ], 200);
    }

    /**
     * Get all reports for admin dashboard (all statuses).
     */
    public function getAdminReports(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Hanya admin yang dapat mengakses semua data laporan.'
            ], 403);
        }

        $reports = Report::with(['user:id,name', 'fraudCategory', 'platforms'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $reports->map(function ($report) {
                return [
                    'id' => $report->id,
                    'title' => $report->title,
                    'entity_name' => $report->entity_name,
                    'entity_contact' => $report->entity_contact,
                    'fraud_type' => $report->fraudCategory?->name ?? 'Lainnya',
                    'description' => $report->description,
                    'location_platform' => $report->platforms->pluck('name')->join(' & '),
                    'status' => $report->status,
                    'user_name' => $report->user?->name ?? 'Anonim',
                    'created_at' => $report->created_at ? $report->created_at->toISOString() : null,
                ];
            })
        ], 200);
    }

    /**
     * Delete a report (Admin only).
     */
    public function destroy(Request $request, $id)
    {
        // Check if current user is admin
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak. Hanya admin yang dapat menghapus laporan.'
            ], 403);
        }

        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'status' => 'error',
                'message' => 'Laporan tidak ditemukan.'
            ], 404);
        }

        $report->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan berhasil dihapus.'
        ], 200);
    }
}

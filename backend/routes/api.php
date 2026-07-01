<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\ArticleController;
use App\Http\Controllers\Api\V1\DetectionController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\PasswordResetController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\InvestmentForensicController;
use App\Http\Controllers\Api\ScamTextController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
|*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// API V1 Group
Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail']);
    Route::post('/auth/reset-password', [PasswordResetController::class, 'reset']);

    // Public reports and articles feed
    Route::get('/reports', [ReportController::class, 'index']);
    Route::get('/articles', [ArticleController::class, 'index']);
    Route::get('/articles/{slug}', [ArticleController::class, 'show']);

    // Public Midtrans Webhook Route
    Route::post('/payment/webhook', [PaymentController::class, 'handleNotification']);

    // Authenticated Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::put('/user/profile', [ProfileController::class, 'updateInfo']);
        Route::post('/user/profile/photo', [ProfileController::class, 'updatePhoto']);
        Route::put('/user/password', [ProfileController::class, 'updatePassword']);
        Route::get('/user/reports', [ProfileController::class, 'getUserReports']);
        Route::post('/reports', [ReportController::class, 'store']);
        Route::post('/detect/text', [DetectionController::class, 'detectText']);
        Route::post('/scam-analyze', [ScamTextController::class, 'analyzeText']);
        Route::post('/detect/url', [DetectionController::class, 'detectUrl']);
        Route::post('/detect/image', [DetectionController::class, 'detectImage']);
        Route::post('/investment-scan', [InvestmentForensicController::class, 'scanInvestment']);
        Route::patch('/reports/{id}/status', [ReportController::class, 'updateStatus']);
        
        // Analytics Routes
        Route::get('/analytics/dashboard', [AnalyticsController::class, 'getDashboardStats']);

        // Chatbot Route
        Route::post('/chat', [ChatController::class, 'sendMessage']);

        // Payment Routes
        Route::post('/payment/snap-token', [PaymentController::class, 'requestSnapToken']);

        // Admin Specific Routes
        Route::middleware('admin')->group(function () {
            Route::post('/articles', [ArticleController::class, 'store']);
            Route::put('/articles/{id}', [ArticleController::class, 'update']);
            Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);
            Route::get('/admin/reports', [ReportController::class, 'getAdminReports']);
            Route::patch('/admin/reports/{id}/status', [ReportController::class, 'updateStatus']);
            Route::delete('/admin/reports/{id}', [ReportController::class, 'destroy']);
            Route::get('/admin/analytics', [AnalyticsController::class, 'getAdminStats']);
        });
    });
});

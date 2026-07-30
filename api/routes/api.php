<?php

use App\Http\Controllers\Api\V1\AdminOrderController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AdminPlatformController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\ItemController;
use App\Http\Controllers\Api\V1\LineupController;
use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\MatchActionController;
use App\Http\Controllers\Api\V1\PlayerController;
use App\Http\Controllers\Api\V1\RankingController;
use App\Http\Controllers\Api\V1\TransferController;
use App\Http\Controllers\Api\V1\WalletController;
use App\Http\Controllers\Api\V1\SyncStatusController;
use App\Http\Controllers\Api\V1\TeamController;
use App\Http\Controllers\Api\V1\PixWebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', HealthController::class);
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth');
    Route::post('/webhooks/pix', PixWebhookController::class)->middleware('throttle:webhook');
    Route::get('/catalog', [CatalogController::class, 'index']);
    Route::get('/sync/status', SyncStatusController::class);
    Route::get('/players', [PlayerController::class, 'index']);
    Route::get('/players/{player}', [PlayerController::class, 'show']);
    Route::get('/transfers', [TransferController::class, 'index']);
    Route::get('/items', [ItemController::class, 'index']);
    Route::get('/ranking', [RankingController::class, 'index']);
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::delete('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/matches/{matchId}/actions', MatchActionController::class)->middleware('throttle:match-actions');
        Route::get('/lineups/{matchId}', [LineupController::class, 'show']);
        Route::put('/lineups/{matchId}', [LineupController::class, 'update']);
        Route::get('/wallet', [WalletController::class, 'show']);
        Route::post('/wallet/orders', [WalletController::class, 'createOrder'])->middleware('throttle:purchase');
        Route::post('/transfers/{player}/buy', [TransferController::class, 'buy'])->middleware('throttle:purchase');
        Route::post('/items/{item}/buy', [ItemController::class, 'buy'])->middleware('throttle:purchase');
        Route::post('/players/{player}/items/{item}', [ItemController::class, 'equip']);
        Route::put('/teams/{team}/choose', [TeamController::class, 'choose'])->middleware('throttle:purchase');
    });
    Route::middleware(['auth:sanctum', 'can:manage-platform'])->prefix('admin')->group(function (): void {
        Route::get('/metrics', [AdminPlatformController::class, 'metrics']);
        Route::post('/sync', [AdminPlatformController::class, 'sync'])->middleware('throttle:purchase');
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::patch('/orders/{order}', [AdminOrderController::class, 'update']);
    });
});

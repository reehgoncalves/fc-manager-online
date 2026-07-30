<?php

namespace App\Http\Controllers\Api\V1;

use App\Jobs\SyncFootballDataJob;
use App\Models\Order;
use App\Models\Player;
use App\Models\SyncRun;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AdminPlatformController
{
    public function __construct(private readonly AuditService $audit) {}

    public function metrics(): JsonResponse
    {
        return response()->json(['users' => User::query()->count(), 'active_users' => User::query()->where('status', 'active')->count(), 'pending_orders' => Order::query()->where('status', 'pending')->count(), 'players' => Player::query()->count(), 'last_sync' => SyncRun::query()->latest('started_at')->first(), 'generated_at' => now()->toIso8601String()]);
    }

    public function sync(Request $request): JsonResponse
    {
        $run = SyncRun::create(['resource' => 'full_catalog', 'status' => 'queued', 'started_at' => now()]);
        SyncFootballDataJob::dispatch($run->id);
        $this->audit->record($request->user()->id, 'platform.sync_requested', $run, [], $request);
        return response()->json(['run' => $run], 202);
    }
}

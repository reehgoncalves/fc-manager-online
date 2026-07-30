<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\SyncRun;
use Illuminate\Http\JsonResponse;

final class SyncStatusController
{
    public function __invoke(): JsonResponse
    {
        return response()->json(['status' => 'ok', 'last_runs' => SyncRun::query()->latest('started_at')->limit(20)->get(), 'next_run' => now()->addMinutes(15)->toIso8601String()]);
    }
}

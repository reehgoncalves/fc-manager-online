<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;

final class HealthController
{
    public function __invoke(): JsonResponse
    {
        return response()->json(['status' => 'ok', 'service' => 'fc-manager-api', 'timestamp' => now()->toIso8601String()]);
    }
}

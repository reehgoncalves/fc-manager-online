<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Team;
use App\Services\PurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class TeamController
{
    public function __construct(private readonly PurchaseService $purchases) {}

    public function choose(Request $request, Team $team): JsonResponse
    {
        $key = $request->header('Idempotency-Key');
        abort_if(! is_string($key) || strlen($key) < 12, 400, 'Idempotency-Key is required.');
        return response()->json(['user' => $this->purchases->buyTeam($request->user(), $team, $key)]);
    }
}

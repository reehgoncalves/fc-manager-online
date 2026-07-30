<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\MatchStateUpdated;
use App\Models\GameMatch;
use App\Models\MatchAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class MatchActionController
{
    public function __invoke(Request $request, string $matchId): JsonResponse
    {
        $payload = $request->validate([
            'action' => ['required', 'string', 'in:atacar,defender,equilibrado,substitute,item-power'],
            'player' => ['nullable', 'string', 'max:120'],
        ]);

        $match = GameMatch::query()->where('external_id', $matchId)->orWhereKey($matchId)->firstOrFail();
        abort_unless(in_array($request->user()->team_id, [$match->home_team_id, $match->away_team_id], true), 403, 'Manager does not belong to this match.');
        $key = $request->header('Idempotency-Key');
        abort_if(! is_string($key) || strlen($key) < 12, 400, 'Idempotency-Key is required.');
        $matchAction = DB::transaction(function () use ($match, $payload, $key, $request): MatchAction {
            $existing = MatchAction::query()->where('match_id', $match->id)->where('user_id', $request->user()->id)->where('idempotency_key', $key)->first();
            if ($existing) return $existing;
            $lockedMatch = GameMatch::query()->lockForUpdate()->findOrFail($match->id);
            $sequence = ((int) MatchAction::query()->where('match_id', $lockedMatch->id)->lockForUpdate()->max('sequence')) + 1;
            return MatchAction::create(['match_id' => $lockedMatch->id, 'user_id' => $request->user()->id, 'action' => $payload['action'], 'player_name' => $payload['player'] ?? null, 'idempotency_key' => $key, 'sequence' => $sequence, 'payload' => $payload]);
        });
        if ($matchAction->wasRecentlyCreated === false) return response()->json(['status' => 'accepted', 'matchId' => $matchId, 'action' => $matchAction->action, 'sequence' => $matchAction->sequence, 'duplicate' => true], 200);
        MatchStateUpdated::dispatch($matchId, [
            'action' => $payload['action'],
            'player' => $payload['player'] ?? null,
            'sequence' => $sequence,
            'serverTime' => now()->toIso8601String(),
        ]);

        return response()->json(['status' => 'accepted', 'matchId' => $matchId, 'action' => $payload['action'], 'sequence' => $matchAction->sequence], 202);
    }
}

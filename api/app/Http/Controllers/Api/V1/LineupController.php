<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\GameMatch;
use App\Models\Lineup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class LineupController
{
    public function show(Request $request, string $matchId): JsonResponse
    {
        $match = GameMatch::query()->where('external_id', $matchId)->orWhereKey($matchId)->firstOrFail();
        abort_unless(in_array($request->user()->team_id, [$match->home_team_id, $match->away_team_id], true), 403, 'Manager does not belong to this match.');
        return response()->json(Lineup::query()->with('players')->where('user_id', $request->user()->id)->where('match_id', $match->id)->first());
    }

    public function update(Request $request, string $matchId): JsonResponse
    {
        $data = $request->validate(['formation' => ['required', 'in:4-3-3,4-4-2,3-5-2'], 'tactic' => ['nullable', 'string', 'in:balanced,attack,defend,high_press'], 'players' => ['required', 'array', 'min:1', 'max:18'], 'players.*.player_id' => ['required', 'integer', 'distinct'], 'players.*.position' => ['required', 'string', 'max:8'], 'players.*.role' => ['nullable', 'string', 'max:30'], 'players.*.x' => ['nullable', 'numeric', 'between:0,100'], 'players.*.y' => ['nullable', 'numeric', 'between:0,100']]);
        $match = GameMatch::query()->where('external_id', $matchId)->orWhereKey($matchId)->firstOrFail();
        $user = $request->user();
        abort_unless(in_array($user->team_id, [$match->home_team_id, $match->away_team_id], true), 403, 'Manager does not belong to this match.');
        $ownedIds = $user->players()->whereIn('players.id', collect($data['players'])->pluck('player_id'))->pluck('players.id');
        abort_unless($ownedIds->count() === count($data['players']), 422, 'Escalação contém jogador fora do elenco.');
        $lineup = DB::transaction(function () use ($data, $match, $user): Lineup {
            $lineup = Lineup::updateOrCreate(['user_id' => $user->id, 'match_id' => $match->id], ['team_id' => $user->team_id, 'formation' => $data['formation'], 'tactic' => $data['tactic'] ?? 'balanced', 'settings' => ['positions' => $data['players']]]);
            $lineup->players()->sync(collect($data['players'])->mapWithKeys(fn (array $player): array => [$player['player_id'] => ['position' => $player['position'], 'role' => $player['role'] ?? null]])->all());
            return $lineup->load('players');
        });
        return response()->json($lineup);
    }
}

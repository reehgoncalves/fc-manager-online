<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class PlayerController
{
    public function index(Request $request): JsonResponse
    {
        $players = Player::query()
            ->when($request->string('tier')->isNotEmpty(), fn ($query) => $query->where('tier', $request->string('tier')))
            ->when($request->string('role')->isNotEmpty(), fn ($query) => $query->where('role', $request->string('role')))
            ->when($request->string('q')->isNotEmpty(), fn ($query) => $query->where(fn ($search) => $search->where('name', 'ilike', '%'.$request->string('q').'%')->orWhere('club_name', 'ilike', '%'.$request->string('q').'%')))
            ->where('is_listed', true)->orderByDesc('rating')->paginate($request->integer('per_page', 24));
        return response()->json($players);
    }

    public function show(Player $player): JsonResponse { return response()->json($player->load('team')); }
}

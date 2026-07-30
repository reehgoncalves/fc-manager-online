<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Item;
use App\Models\League;
use App\Models\Player;
use App\Models\Stadium;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class CatalogController
{
    public function index(Request $request): JsonResponse
    {
        $etag = sha1(implode('|', [League::max('updated_at'), Team::max('updated_at'), Player::max('updated_at'), Item::max('updated_at'), Stadium::max('updated_at')]));
        if ($request->header('If-None-Match') === $etag) return response()->json([], 304)->header('ETag', $etag);
        return response()->json([
            'leagues' => League::query()->with('seasons:id,league_id,name,status')->where('is_premium', false)->orWhere('is_premium', true)->orderBy('name')->get(),
            'teams' => Team::query()->orderBy('name')->get(),
            'players' => Player::query()->with(['team:id,name'])->where('is_listed', true)->orderByDesc('rating')->paginate($request->integer('players_per_page', 100)),
            'items' => Item::query()->orderByDesc('power')->get(),
            'stadiums' => Stadium::query()->orderBy('level')->get(),
            'meta' => ['version' => $etag, 'generated_at' => now()->toIso8601String()],
        ])->header('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')->header('ETag', $etag);
    }
}

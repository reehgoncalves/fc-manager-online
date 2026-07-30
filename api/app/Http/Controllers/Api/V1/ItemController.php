<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Item;
use App\Models\Player;
use App\Services\PurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ItemController
{
    public function __construct(private readonly PurchaseService $purchases) {}

    public function index(Request $request): JsonResponse { return response()->json(Item::query()->when($request->string('element')->isNotEmpty(), fn ($query) => $query->where('element', $request->string('element')))->orderByDesc('power')->paginate($request->integer('per_page', 24))); }

    public function equip(Request $request, Player $player, Item $item): JsonResponse
    {
        abort_unless($request->user()->players()->whereKey($player->id)->exists(), 403, 'Player is not owned by this manager.');
        $player->items()->syncWithoutDetaching([$item->id => ['equipped_at' => now()]]);
        return response()->json(['player' => $player->load('items'), 'bonus' => $item->power, 'message' => "{$item->name} equipped."]);
    }

    public function buy(Request $request, Item $item): JsonResponse
    {
        $key = $request->header('Idempotency-Key');
        abort_if(! is_string($key) || strlen($key) < 12, 400, 'Idempotency-Key is required.');
        return response()->json($this->purchases->buyItemWithCoins($request->user(), $item, $key), 201);
    }
}

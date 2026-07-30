<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Player;
use App\Services\PurchaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class TransferController
{
    public function __construct(private readonly PurchaseService $purchases) {}

    public function index(Request $request): JsonResponse { return response()->json(Player::query()->where('is_listed', true)->orderByDesc('is_extreme')->orderByDesc('rating')->paginate($request->integer('per_page', 24))); }

    public function buy(Request $request, Player $player): JsonResponse
    {
        $data = $request->validate(['payment_method' => ['required', 'in:coins,pix']]);
        $key = $request->header('Idempotency-Key');
        abort_if(! is_string($key) || strlen($key) < 12, 400, 'Idempotency-Key is required.');
        if ($data['payment_method'] === 'coins') return response()->json($this->purchases->buyPlayerWithCoins($request->user(), $player, $key));
        return response()->json(['order' => $this->purchases->createPixOrder($request->user(), 'player', (int) $player->price_cents, ['player_id' => $player->id], $key)], 201);
    }
}

<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Player;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class OrderSettlementService
{
    public function __construct(private readonly WalletService $wallets) {}

    public function settle(Order $order, ?User $actor = null, string $source = 'pix'): Order
    {
        return DB::transaction(function () use ($order, $actor, $source): Order {
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            if ($locked->status === 'paid') return $locked->load('user');
            if (in_array($locked->status, ['failed', 'refunded'], true)) throw ValidationException::withMessages(['order' => 'Pedido não pode ser liquidado neste estado.']);
            $user = User::query()->findOrFail($locked->user_id);
            $payload = $locked->payload ?? [];
            if ($locked->kind === 'coins') {
                $coins = (int) ($payload['coins'] ?? 0);
                if ($coins <= 0) throw ValidationException::withMessages(['order' => 'Pedido de moedas sem quantidade válida.']);
                $this->wallets->credit($user, $coins, 'order:'.$locked->id, ['order_id' => $locked->id, 'source' => $source], 'order-settle:'.$locked->id);
            } elseif ($locked->kind === 'player') {
                $playerId = (int) ($payload['player_id'] ?? 0);
                $player = Player::query()->whereKey($playerId)->where('is_listed', true)->firstOrFail();
                $user->players()->syncWithoutDetaching([$player->id]);
            }
            $locked->forceFill(['status' => 'paid', 'paid_at' => now(), 'settled_by' => $actor?->id, 'metadata' => array_merge($locked->metadata ?? [], ['settled_source' => $source])])->save();
            return $locked->load('user');
        });
    }
}

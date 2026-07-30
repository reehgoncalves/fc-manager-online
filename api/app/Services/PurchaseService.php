<?php

namespace App\Services;

use App\Models\Item;
use App\Models\Order;
use App\Models\Player;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class PurchaseService
{
    public function __construct(private readonly WalletService $wallets) {}

    public function buyPlayerWithCoins(User $user, Player $player, string $idempotencyKey): array
    {
        return DB::transaction(function () use ($user, $player, $idempotencyKey): array {
            $existing = $user->players()->whereKey($player->id)->exists();
            if ($existing) throw ValidationException::withMessages(['player' => 'Jogador já pertence ao elenco.']);
            $fresh = Player::query()->lockForUpdate()->findOrFail($player->id);
            $price = (int) $fresh->price_fc;
            if ($price <= 0) throw ValidationException::withMessages(['player' => 'Jogador sem preço de FC configurado.']);
            $transaction = $this->wallets->debit($user, $price, 'player:'.$fresh->id, ['player_id' => $fresh->id], $idempotencyKey);
            $user->players()->attach($fresh->id);
            return ['player' => $fresh->load('team'), 'wallet' => $transaction->wallet()->first(), 'transaction' => $transaction];
        });
    }

    public function createPixOrder(User $user, string $kind, int $totalCents, array $payload, string $idempotencyKey): Order
    {
        if ($totalCents <= 0) throw ValidationException::withMessages(['total_cents' => 'Valor inválido.']);
        return Order::query()->firstOrCreate(['user_id' => $user->id, 'idempotency_key' => $idempotencyKey], ['kind' => $kind, 'payment_method' => 'pix', 'status' => 'pending', 'total_cents' => $totalCents, 'payload' => $payload, 'metadata' => ['receiver_tax_id' => config('services.pix.receiver_tax_id')]]);
    }

    public function buyTeam(User $user, Team $team, string $idempotencyKey): User
    {
        return DB::transaction(function () use ($user, $team, $idempotencyKey): User {
            if ($user->team_id === $team->id) return $user;
            $price = (int) $team->price_fc;
            if ($price > 0) $this->wallets->debit($user, $price, 'team:'.$team->id, ['team_id' => $team->id], $idempotencyKey);
            $user->forceFill(['team_id' => $team->id])->save();
            if (! $user->players()->exists()) {
                $starterIds = Player::query()->where('team_id', $team->id)->where('is_listed', true)->orderByDesc('rating')->limit(11)->pluck('id')->all();
                if (count($starterIds) < 11) {
                    $fallbackIds = Player::query()->where('is_listed', true)->whereNotIn('id', $starterIds)->where('is_extreme', false)->orderByDesc('rating')->limit(11 - count($starterIds))->pluck('id')->all();
                    $starterIds = array_values(array_unique([...$starterIds, ...$fallbackIds]));
                }
                if ($starterIds !== []) $user->players()->syncWithoutDetaching($starterIds);
            }
            return $user->fresh('team', 'wallet');
        });
    }

    public function buyItemWithCoins(User $user, Item $item, string $idempotencyKey): array
    {
        return DB::transaction(function () use ($user, $item, $idempotencyKey): array {
            $inventory = DB::table('player_inventory')->where('user_id', $user->id)->where('item_id', $item->id)->lockForUpdate()->first();
            if ($inventory) throw ValidationException::withMessages(['item' => 'Item já está no inventário.']);
            $this->wallets->debit($user, (int) $item->price_fc, 'item:'.$item->id, ['item_id' => $item->id], $idempotencyKey);
            DB::table('player_inventory')->insert(['user_id' => $user->id, 'item_id' => $item->id, 'quantity' => 1, 'durability' => $item->max_durability ?? 100, 'created_at' => now(), 'updated_at' => now()]);
            return ['item' => $item, 'wallet' => $this->wallets->walletFor($user)];
        });
    }
}

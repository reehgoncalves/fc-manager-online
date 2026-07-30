<?php

namespace Tests\Feature;

use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WalletPurchaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_coin_purchase_is_idempotent_and_debits_once(): void
    {
        $user = User::create(['name' => 'Manager Compra', 'email' => 'buy@example.com', 'password' => 'not-used', 'role' => 'manager', 'status' => 'active']);
        $user->wallet()->create(['balance' => 25000]);
        $player = Player::create(['external_id' => 'player-test-1', 'name' => 'Player Teste', 'role' => 'ATA', 'club_name' => 'FC Teste', 'rating' => 80, 'price_cents' => 1000, 'price_fc' => 1200, 'tier' => 'gold', 'is_extreme' => false, 'is_listed' => true]);
        Sanctum::actingAs($user);
        $headers = ['Idempotency-Key' => 'purchase-test-0001'];
        $this->withHeaders($headers)->postJson('/api/v1/transfers/'.$player->id.'/buy', ['payment_method' => 'coins'])->assertOk();
        $this->withHeaders($headers)->postJson('/api/v1/transfers/'.$player->id.'/buy', ['payment_method' => 'coins'])->assertUnprocessable();
        $this->assertDatabaseHas('wallets', ['user_id' => $user->id, 'balance' => 23800]);
        $this->assertDatabaseHas('manager_players', ['user_id' => $user->id, 'player_id' => $player->id]);
    }

    public function test_pending_pix_order_does_not_credit_until_admin_settlement(): void
    {
        $admin = User::create(['name' => 'Admin Teste', 'email' => 'admin@example.com', 'password' => 'not-used', 'role' => 'admin', 'status' => 'active']);
        $manager = User::create(['name' => 'Manager PIX', 'email' => 'pix@example.com', 'password' => 'not-used', 'role' => 'manager', 'status' => 'active']);
        $manager->wallet()->create(['balance' => 0]);
        Sanctum::actingAs($manager);
        $this->withHeaders(['Idempotency-Key' => 'pix-test-0001'])->postJson('/api/v1/wallet/orders', ['package' => 'starter', 'payment_method' => 'pix'])->assertCreated()->assertJsonPath('order.status', 'pending');
        $this->assertDatabaseHas('wallets', ['user_id' => $manager->id, 'balance' => 0]);
        Sanctum::actingAs($admin);
        $order = $manager->orders()->latest()->first();
        $this->patchJson('/api/v1/admin/orders/'.$order->id, ['status' => 'paid', 'reason' => 'Conferência do recebimento PIX'])->assertOk();
        $this->assertDatabaseHas('wallets', ['user_id' => $manager->id, 'balance' => 3000]);
    }
}

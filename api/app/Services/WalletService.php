<?php

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class WalletService
{
    public function walletFor(User $user, bool $lock = false): Wallet
    {
        $user->wallet()->firstOrCreate([], ['balance' => 0]);
        $query = Wallet::query()->where('user_id', $user->id);
        if ($lock) $query->lockForUpdate();
        return $query->firstOrFail();
    }

    public function credit(User $user, int $amount, string $reference, array $metadata = [], ?string $idempotencyKey = null): WalletTransaction
    {
        if ($amount <= 0) throw ValidationException::withMessages(['amount' => 'Credit amount must be positive.']);
        return DB::transaction(function () use ($user, $amount, $reference, $metadata, $idempotencyKey): WalletTransaction {
            $wallet = $this->walletFor($user, true);
            if ($idempotencyKey) {
                $existing = $wallet->transactions()->where('idempotency_key', $idempotencyKey)->first();
                if ($existing) return $existing;
            }
            $wallet->increment('balance', $amount);
            $wallet->refresh();
            return $wallet->transactions()->create(['type' => 'credit', 'amount' => $amount, 'balance_after' => $wallet->balance, 'reference' => $reference, 'idempotency_key' => $idempotencyKey, 'metadata' => $metadata]);
        });
    }

    public function debit(User $user, int $amount, string $reference, array $metadata = [], ?string $idempotencyKey = null): WalletTransaction
    {
        if ($amount <= 0) throw ValidationException::withMessages(['amount' => 'Debit amount must be positive.']);
        return DB::transaction(function () use ($user, $amount, $reference, $metadata, $idempotencyKey): WalletTransaction {
            $wallet = $this->walletFor($user, true);
            if ($idempotencyKey) {
                $existing = $wallet->transactions()->where('idempotency_key', $idempotencyKey)->first();
                if ($existing) return $existing;
            }
            if ($wallet->balance < $amount) throw ValidationException::withMessages(['wallet' => 'Saldo de FC insuficiente.']);
            $wallet->decrement('balance', $amount);
            $wallet->refresh();
            return $wallet->transactions()->create(['type' => 'debit', 'amount' => -$amount, 'balance_after' => $wallet->balance, 'reference' => $reference, 'idempotency_key' => $idempotencyKey, 'metadata' => $metadata]);
        });
    }
}

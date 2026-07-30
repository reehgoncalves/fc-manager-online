<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    protected $fillable = ['wallet_id', 'type', 'amount', 'balance_after', 'reference', 'idempotency_key', 'metadata'];
    protected function casts(): array { return ['amount' => 'integer', 'balance_after' => 'integer', 'metadata' => 'array']; }
    public function wallet(): BelongsTo { return $this->belongsTo(Wallet::class); }
}

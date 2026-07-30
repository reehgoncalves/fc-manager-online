<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = ['user_id', 'kind', 'payment_method', 'status', 'total_cents', 'payload', 'metadata', 'provider_reference', 'idempotency_key', 'paid_at', 'settled_by'];
    protected function casts(): array { return ['total_cents' => 'integer', 'payload' => 'array', 'metadata' => 'array', 'paid_at' => 'datetime']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}

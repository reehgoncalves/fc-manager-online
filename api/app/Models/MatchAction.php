<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchAction extends Model
{
    protected $fillable = ['match_id', 'user_id', 'action', 'player_name', 'idempotency_key', 'sequence', 'payload'];
    protected function casts(): array { return ['sequence' => 'integer', 'payload' => 'array']; }
    public function match(): BelongsTo { return $this->belongsTo(GameMatch::class, 'match_id'); }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}

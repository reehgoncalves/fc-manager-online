<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Season extends Model
{
    protected $fillable = ['league_id', 'external_id', 'name', 'starts_at', 'ends_at', 'status'];
    protected function casts(): array { return ['starts_at' => 'date', 'ends_at' => 'date']; }
    public function league(): BelongsTo { return $this->belongsTo(League::class); }
}

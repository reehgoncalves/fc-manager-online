<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Player extends Model
{
    use HasFactory;
    protected $fillable = ['team_id', 'external_id', 'name', 'role', 'club_name', 'avatar_url', 'rating', 'price_cents', 'price_fc', 'tier', 'is_extreme', 'is_listed', 'stats', 'tags', 'version'];
    protected function casts(): array { return ['is_extreme' => 'boolean', 'is_listed' => 'boolean', 'stats' => 'array', 'tags' => 'array', 'price_fc' => 'integer', 'version' => 'integer']; }
    public function team(): BelongsTo { return $this->belongsTo(Team::class); }
    public function items(): BelongsToMany { return $this->belongsToMany(Item::class, 'player_items')->withPivot('equipped_at')->withTimestamps(); }
}

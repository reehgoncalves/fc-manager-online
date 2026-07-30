<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Item extends Model
{
    protected $fillable = ['name', 'category', 'element', 'power', 'effect', 'price_cents', 'price_fc', 'icon', 'version', 'max_durability'];
    protected function casts(): array { return ['price_fc' => 'integer', 'power' => 'integer', 'version' => 'integer', 'max_durability' => 'integer']; }
    public function players(): BelongsToMany { return $this->belongsToMany(Player::class, 'player_items')->withPivot('equipped_at')->withTimestamps(); }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Lineup extends Model
{
    protected $fillable = ['user_id', 'match_id', 'team_id', 'formation', 'tactic', 'settings'];
    protected function casts(): array { return ['settings' => 'array']; }
    public function match(): BelongsTo { return $this->belongsTo(GameMatch::class, 'match_id'); }
    public function team(): BelongsTo { return $this->belongsTo(Team::class); }
    public function players(): BelongsToMany { return $this->belongsToMany(Player::class, 'lineup_players')->withPivot(['position', 'role']); }
}

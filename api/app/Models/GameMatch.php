<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameMatch extends Model
{
    protected $table = 'matches';
    protected $fillable = ['season_id', 'external_id', 'home_team_id', 'away_team_id', 'kickoff_at', 'status', 'home_score', 'away_score', 'events'];
    protected function casts(): array { return ['kickoff_at' => 'datetime', 'home_score' => 'integer', 'away_score' => 'integer', 'events' => 'array']; }
    public function homeTeam(): BelongsTo { return $this->belongsTo(Team::class, 'home_team_id'); }
    public function awayTeam(): BelongsTo { return $this->belongsTo(Team::class, 'away_team_id'); }
}

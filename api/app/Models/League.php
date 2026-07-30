<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class League extends Model
{
    protected $fillable = ['external_id', 'name', 'country', 'tier', 'club_count', 'is_premium', 'logo_url'];
    protected $casts = ['is_premium' => 'boolean'];
    public function seasons(): HasMany { return $this->hasMany(Season::class); }
}

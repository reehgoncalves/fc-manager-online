<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = ['external_id', 'name', 'short_name', 'country', 'flag_url', 'logo_url', 'rating', 'price_fc'];
    protected function casts(): array { return ['price_fc' => 'integer', 'rating' => 'integer']; }
}

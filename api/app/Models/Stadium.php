<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stadium extends Model
{
    protected $fillable = ['external_id', 'name', 'capacity', 'level', 'revenue_multiplier', 'visual'];
    protected function casts(): array { return ['visual' => 'array', 'revenue_multiplier' => 'decimal:3']; }
}

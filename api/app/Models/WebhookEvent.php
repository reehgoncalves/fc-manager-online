<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebhookEvent extends Model
{
    protected $fillable = ['provider', 'external_id', 'event_type', 'payload', 'processed_at', 'error_message'];
    protected function casts(): array { return ['payload' => 'array', 'processed_at' => 'datetime']; }
}

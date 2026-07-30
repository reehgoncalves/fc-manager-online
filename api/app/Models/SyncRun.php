<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyncRun extends Model
{
    protected $fillable = ['resource', 'status', 'records_processed', 'started_at', 'finished_at', 'error_message', 'provider_cursor'];
    protected function casts(): array { return ['started_at' => 'datetime', 'finished_at' => 'datetime']; }
}

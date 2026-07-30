<?php

namespace App\Console\Commands;

use App\Jobs\SyncFootballDataJob;
use Illuminate\Console\Command;

class SyncFootballData extends Command
{
    protected $signature = 'game:sync-data';
    protected $description = 'Sync teams and players from the configured football data provider.';
    public function handle(): int { SyncFootballDataJob::dispatchSync(); $this->info('Football data synchronized.'); return self::SUCCESS; }
}

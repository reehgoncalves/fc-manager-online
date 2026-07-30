<?php

use App\Jobs\SyncFootballDataJob;
use Illuminate\Support\Facades\Schedule;

Schedule::job(new SyncFootballDataJob())->everyFifteenMinutes()->withoutOverlapping();

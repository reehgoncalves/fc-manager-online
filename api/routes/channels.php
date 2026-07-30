<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('matches.{matchId}', static function ($user, string $matchId): bool {
    return (bool) $user && $matchId !== '';
});

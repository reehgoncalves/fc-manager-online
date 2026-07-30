<?php

return [
    'driver' => env('REALTIME_DRIVER', 'reverb'),
    'ws_url' => env('REALTIME_WS_URL', 'ws://localhost:8080'),
    'match_channel_prefix' => env('REALTIME_MATCH_CHANNEL_PREFIX', 'matches'),
];

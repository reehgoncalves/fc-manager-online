<?php

return [
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
    'football_data' => ['provider' => env('FOOTBALL_DATA_PROVIDER', 'snapshot'), 'url' => env('FOOTBALL_DATA_PROVIDER_URL'), 'key' => env('FOOTBALL_DATA_PROVIDER_KEY'), 'season' => env('FOOTBALL_DATA_SEASON', date('Y')), 'leagues' => env('FOOTBALL_DATA_LEAGUES', ''), 'max_leagues' => env('FOOTBALL_DATA_MAX_LEAGUES', 8), 'max_pages' => env('FOOTBALL_DATA_MAX_PAGES', 50), 'player_avatar_template' => env('PLAYER_AVATAR_URL_TEMPLATE')],
    'pix' => ['url' => env('PIX_PROVIDER_URL'), 'key' => env('PIX_PROVIDER_KEY'), 'webhook_secret' => env('PIX_WEBHOOK_SECRET'), 'receiver_tax_id' => env('PIX_RECEIVER_TAX_ID')],
];

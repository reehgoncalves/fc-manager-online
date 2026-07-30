<?php

namespace App\Jobs;

use App\Models\Item;
use App\Models\League;
use App\Models\Player;
use App\Models\Stadium;
use App\Models\SyncRun;
use App\Models\Team;
use App\Services\ApiFootballProvider;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Throwable;

class SyncFootballDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public readonly ?int $runId = null) {}

    public function handle(): void
    {
        $run = $this->runId ? SyncRun::query()->findOrFail($this->runId) : SyncRun::create(['resource' => 'full_catalog', 'status' => 'running', 'started_at' => now()]);
        $run->update(['status' => 'running']);
        try {
            $url = config('services.football_data.url');
            $key = config('services.football_data.key');
            if (! $url || ! $key) { $run->update(['status' => 'skipped', 'finished_at' => now(), 'error_message' => 'Provider credentials are not configured.']); return; }

            $snapshot = config('services.football_data.provider') === 'api-football'
                ? app(ApiFootballProvider::class)->snapshot()
                : tap(Http::retry(3, 500)->withToken($key)->acceptJson()->timeout(30)->get(rtrim($url, '/').'/snapshot'))->throw()->json();
            $processed = 0;

            foreach ($snapshot['leagues'] ?? [] as $league) {
                League::updateOrCreate(['external_id' => $league['id']], ['name' => $league['name'], 'country' => $league['country'] ?? 'INT', 'tier' => $league['tier'] ?? 'standard', 'club_count' => $league['club_count'] ?? 20, 'is_premium' => $league['is_premium'] ?? false, 'logo_url' => $league['logo_url'] ?? null]);
                $processed++;
            }
            foreach ($snapshot['teams'] ?? [] as $team) {
                Team::updateOrCreate(['external_id' => $team['id']], ['name' => $team['name'], 'short_name' => $team['short_name'] ?? null, 'country' => $team['country'] ?? null, 'flag_url' => $team['flag_url'] ?? null, 'logo_url' => $team['logo_url'] ?? null, 'rating' => $team['rating'] ?? 0, 'price_fc' => $team['price_fc'] ?? 0]);
                $processed++;
            }
            foreach ($snapshot['players'] ?? [] as $player) {
                $avatarUrl = $player['avatar_url'] ?? $player['photo'] ?? $player['image_url'] ?? null;
                if (! $avatarUrl && config('services.football_data.player_avatar_template') && isset($player['id'])) {
                    $avatarUrl = str_replace('{id}', (string) $player['id'], config('services.football_data.player_avatar_template'));
                }
                Player::updateOrCreate(['external_id' => $player['id']], ['team_id' => Team::where('external_id', $player['team_id'])->value('id'), 'name' => $player['name'], 'role' => $player['role'], 'club_name' => $player['club_name'] ?? '', 'avatar_url' => $avatarUrl, 'rating' => $player['rating'], 'price_cents' => $player['price_cents'] ?? 0, 'price_fc' => $player['price_fc'] ?? max(1000, ((int) $player['rating']) * 100), 'tier' => $player['tier'], 'is_extreme' => $player['tier'] === 'extreme', 'is_listed' => $player['is_listed'] ?? true, 'stats' => $player['stats'] ?? [], 'tags' => $player['tags'] ?? []]);
                $processed++;
            }
            foreach ($snapshot['items'] ?? [] as $item) {
                Item::updateOrCreate(['name' => $item['name']], ['category' => $item['category'], 'element' => $item['element'], 'power' => $item['power'], 'effect' => $item['effect'], 'price_cents' => $item['price_cents'] ?? 0, 'price_fc' => $item['price_fc'] ?? 0, 'icon' => $item['icon'] ?? null, 'max_durability' => $item['max_durability'] ?? 100, 'version' => 1]);
                $processed++;
            }
            foreach ($snapshot['stadiums'] ?? [] as $stadium) {
                Stadium::updateOrCreate(['external_id' => $stadium['id']], ['name' => $stadium['name'], 'capacity' => $stadium['capacity'], 'level' => $stadium['level'] ?? 1, 'revenue_multiplier' => $stadium['revenue_multiplier'] ?? 1, 'visual' => $stadium['visual'] ?? []]);
                $processed++;
            }
            $run->update(['status' => 'completed', 'records_processed' => $processed, 'provider_cursor' => null, 'finished_at' => now()]);
        } catch (Throwable $exception) {
            $run->update(['status' => 'failed', 'finished_at' => now(), 'error_message' => $exception->getMessage()]);
            throw $exception;
        }
    }
}

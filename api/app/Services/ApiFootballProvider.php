<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

final class ApiFootballProvider
{
    public function snapshot(): array
    {
        $baseUrl = rtrim((string) config('services.football_data.url'), '/');
        $key = (string) config('services.football_data.key');
        $season = (int) config('services.football_data.season');
        $configuredLeagues = array_values(array_filter(array_map('intval', explode(',', (string) config('services.football_data.leagues')))));
        $maxLeagues = max(1, (int) config('services.football_data.max_leagues'));
        $maxPages = max(1, (int) config('services.football_data.max_pages'));

        if ($baseUrl === '' || $key === '' || $season < 2000) {
            throw new RuntimeException('API-Football requires FOOTBALL_DATA_PROVIDER_URL, FOOTBALL_DATA_PROVIDER_KEY and FOOTBALL_DATA_SEASON.');
        }

        $client = Http::withHeaders(['x-apisports-key' => $key, 'Accept' => 'application/json'])->retry(3, 750)->timeout(45);
        $leagueIds = $configuredLeagues ?: $this->discoverLeagueIds($client, $baseUrl, $season, $maxLeagues);
        $leagueIds = array_slice(array_values(array_unique($leagueIds)), 0, $maxLeagues);
        $leagues = [];
        $teamsById = [];
        $playersById = [];

        foreach ($leagueIds as $leagueId) {
            $leagueResponse = $this->get($client, $baseUrl, 'leagues', ['id' => $leagueId, 'season' => $season]);
            $leagueRow = $leagueResponse['response'][0] ?? null;
            if (! $leagueRow) continue;
            $league = $leagueRow['league'] ?? [];
            $country = $leagueRow['country'] ?? [];
            $leagues[] = ['id' => $league['id'] ?? $leagueId, 'name' => $league['name'] ?? 'Liga', 'country' => $country['code'] ?? ($country['name'] ?? 'INT'), 'tier' => 'standard', 'club_count' => 20, 'is_premium' => false, 'logo_url' => $league['logo'] ?? null];

            $teamResponse = $this->get($client, $baseUrl, 'teams', ['league' => $leagueId, 'season' => $season]);
            foreach ($teamResponse['response'] ?? [] as $teamRow) {
                $team = $teamRow['team'] ?? [];
                if (! isset($team['id'])) continue;
                $teamsById[$team['id']] = ['id' => $team['id'], 'name' => $team['name'] ?? 'Clube', 'short_name' => $team['code'] ?? null, 'country' => $team['country'] ?? null, 'flag_url' => $country['flag'] ?? null, 'logo_url' => $team['logo'] ?? null, 'rating' => 0];
            }

            for ($page = 1; $page <= $maxPages; $page++) {
                $playerResponse = $this->get($client, $baseUrl, 'players', ['league' => $leagueId, 'season' => $season, 'page' => $page]);
                foreach ($playerResponse['response'] ?? [] as $playerRow) {
                    $player = $playerRow['player'] ?? [];
                    if (! isset($player['id'])) continue;
                    $stat = $playerRow['statistics'][0] ?? [];
                    $games = $stat['games'] ?? [];
                    $rating = (int) round((float) ($games['rating'] ?? 60));
                    $rating = min(99, max(40, $rating));
                    $playersById[$player['id']] = [
                        'id' => $player['id'],
                        'team_id' => $stat['team']['id'] ?? null,
                        'name' => $player['name'] ?? trim(($player['firstname'] ?? '').' '.($player['lastname'] ?? '')),
                        'role' => $this->role($games['position'] ?? 'Midfielder'),
                        'club_name' => $stat['team']['name'] ?? '',
                        'avatar_url' => $player['photo'] ?? null,
                        'rating' => $rating,
                        'price_cents' => max(4990, $rating * 220),
                        'price_fc' => max(1000, $rating * 100),
                        'tier' => $this->tier($rating),
                        'is_listed' => true,
                        'stats' => ['rating' => $rating, 'appearances' => $games['appearences'] ?? 0, 'goals' => $games['goals'] ?? 0, 'assists' => $games['assists'] ?? 0],
                        'tags' => array_values(array_filter([$player['nationality'] ?? null, isset($player['age']) ? 'idade '.$player['age'] : null])),
                    ];
                }
                $paging = $playerResponse['paging'] ?? [];
                if (! isset($paging['current'], $paging['total']) || (int) $paging['current'] >= (int) $paging['total']) break;
            }
        }

        return ['leagues' => $leagues, 'teams' => array_values($teamsById), 'players' => array_values($playersById), 'items' => [], 'stadiums' => []];
    }

    private function discoverLeagueIds($client, string $baseUrl, int $season, int $maxLeagues): array
    {
        $response = $this->get($client, $baseUrl, 'leagues', ['season' => $season]);
        return array_values(array_filter(array_map(static fn (array $row): ?int => isset($row['league']['id']) ? (int) $row['league']['id'] : null, array_slice($response['response'] ?? [], 0, $maxLeagues))));
    }

    private function get($client, string $baseUrl, string $endpoint, array $query): array
    {
        $response = $client->get($baseUrl.'/'.$endpoint, $query)->throw()->json();
        if (! is_array($response) || isset($response['errors']) && $response['errors'] !== []) throw new RuntimeException('API-Football returned an invalid response for '.$endpoint.'.');
        return $response;
    }

    private function role(string $position): string
    {
        return match (strtolower($position)) { 'goalkeeper' => 'GOL', 'defender' => 'ZAG', 'attacker' => 'ATA', default => 'MEI' };
    }

    private function tier(int $rating): string
    {
        return $rating >= 90 ? 'extreme' : ($rating >= 85 ? 'diamond' : ($rating >= 78 ? 'gold' : 'silver'));
    }
}

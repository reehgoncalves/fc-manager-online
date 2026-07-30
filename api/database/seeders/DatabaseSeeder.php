<?php

namespace Database\Seeders;

use App\Models\Player;
use App\Models\League;
use App\Models\Stadium;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $adminPassword = (string) env('SEED_ADMIN_PASSWORD');
        $demoPassword = (string) env('SEED_DEMO_PASSWORD');
        if ($adminPassword === '' || $demoPassword === '') throw new \RuntimeException('SEED_ADMIN_PASSWORD and SEED_DEMO_PASSWORD must be set before seeding.');
        $admin = User::updateOrCreate(['email' => env('SEED_ADMIN_EMAIL', 'admin@fc-manager.online')], [
            'name' => env('SEED_ADMIN_NAME', 'Administrador FC Manager'),
            'password' => Hash::make($adminPassword),
            'role' => 'admin',
            'referral_code' => 'ADMINFC2026',
        ]);
        $demo = User::updateOrCreate(['email' => env('SEED_DEMO_EMAIL', 'jogador@fc-manager.online')], [
            'name' => 'Manager Demo',
            'password' => Hash::make($demoPassword),
            'role' => 'manager',
            'referral_code' => 'JOGARFC2026',
        ]);
        foreach ([$admin, $demo] as $user) {
            $user->wallet()->updateOrCreate([], ['balance' => $user->role === 'admin' ? 999999 : (int) config('game.initial_fc', 25000)]);
        }

        $teams = collect([['external_id' => 'aurora', 'name' => 'FC Aurora', 'short_name' => 'FC', 'country' => 'Brasil', 'rating' => 86, 'price_fc' => 0], ['external_id' => 'rio-bulls', 'name' => 'Rio Bulls', 'short_name' => 'RB', 'country' => 'Brasil', 'rating' => 84, 'price_fc' => 5500], ['external_id' => 'porto', 'name' => 'Atlético Porto', 'short_name' => 'AP', 'country' => 'Brasil', 'rating' => 88, 'price_fc' => 7500]])->mapWithKeys(fn (array $team) => [$team['external_id'] => Team::updateOrCreate(['external_id' => $team['external_id']], $team)]);
        $admin->update(['team_id' => $teams['aurora']->id]);
        $demo->update(['team_id' => $teams['aurora']->id]);
        foreach ([['external_id' => 'p-001', 'name' => 'L. Andrade', 'role' => 'ATA', 'club_name' => 'São Paulo FC', 'rating' => 92, 'price_cents' => 24990, 'price_fc' => 12400, 'tier' => 'extreme', 'is_extreme' => true, 'stats' => ['attack' => 94, 'technique' => 88, 'defence' => 91], 'tags' => ['Finalizador', 'Capitão']], ['external_id' => 'p-002', 'name' => 'M. Costa', 'role' => 'MEI', 'club_name' => 'Atlético Porto', 'rating' => 88, 'price_cents' => 15990, 'price_fc' => 7800, 'tier' => 'diamond', 'is_extreme' => false, 'stats' => ['attack' => 86, 'technique' => 93, 'defence' => 84], 'tags' => ['Passe longo']], ['external_id' => 'p-003', 'name' => 'R. Nascimento', 'role' => 'ZAG', 'club_name' => 'Bahia United', 'rating' => 84, 'price_cents' => 9990, 'price_fc' => 5200, 'tier' => 'gold', 'is_extreme' => false, 'stats' => ['attack' => 79, 'technique' => 81, 'defence' => 89], 'tags' => ['Marcação']]] as $player) { Player::updateOrCreate(['external_id' => $player['external_id']], $player + ['team_id' => $teams['porto']->id]); }
        foreach ([['external_id' => 'p-004', 'name' => 'E. Vidal', 'role' => 'GOL', 'club_name' => 'FC Aurora', 'rating' => 81, 'price_cents' => 6990, 'price_fc' => 3950, 'tier' => 'silver', 'is_extreme' => false, 'stats' => ['attack' => 40, 'technique' => 74, 'defence' => 91], 'tags' => ['Reflexo']], ['external_id' => 'p-005', 'name' => 'D. Souza', 'role' => 'ZAG', 'club_name' => 'FC Aurora', 'rating' => 83, 'price_cents' => 8490, 'price_fc' => 4700, 'tier' => 'gold', 'is_extreme' => false, 'stats' => ['attack' => 62, 'technique' => 78, 'defence' => 88], 'tags' => ['Cobertura']], ['external_id' => 'p-006', 'name' => 'J. Lima', 'role' => 'LD', 'club_name' => 'FC Aurora', 'rating' => 82, 'price_cents' => 7990, 'price_fc' => 4300, 'tier' => 'gold', 'is_extreme' => false, 'stats' => ['attack' => 70, 'technique' => 80, 'defence' => 82], 'tags' => ['Apoio']], ['external_id' => 'p-007', 'name' => 'N. Melo', 'role' => 'VOL', 'club_name' => 'FC Aurora', 'rating' => 86, 'price_cents' => 11990, 'price_fc' => 6600, 'tier' => 'diamond', 'is_extreme' => false, 'stats' => ['attack' => 82, 'technique' => 89, 'defence' => 86], 'tags' => ['Pressão']], ['external_id' => 'p-008', 'name' => 'T. Lima', 'role' => 'PD', 'club_name' => 'FC Aurora', 'rating' => 90, 'price_cents' => 19990, 'price_fc' => 9900, 'tier' => 'extreme', 'is_extreme' => true, 'stats' => ['attack' => 96, 'technique' => 90, 'defence' => 82], 'tags' => ['Velocista']], ['external_id' => 'p-009', 'name' => 'B. Reis', 'role' => 'PE', 'club_name' => 'FC Aurora', 'rating' => 85, 'price_cents' => 10490, 'price_fc' => 5900, 'tier' => 'diamond', 'is_extreme' => false, 'stats' => ['attack' => 88, 'technique' => 84, 'defence' => 72], 'tags' => ['Cruzador']], ['external_id' => 'p-010', 'name' => 'P. Rocha', 'role' => 'ZAG', 'club_name' => 'FC Aurora', 'rating' => 80, 'price_cents' => 6490, 'price_fc' => 3500, 'tier' => 'silver', 'is_extreme' => false, 'stats' => ['attack' => 55, 'technique' => 70, 'defence' => 84], 'tags' => ['Jogo aéreo']], ['external_id' => 'p-011', 'name' => 'C. Alves', 'role' => 'ATA', 'club_name' => 'FC Aurora', 'rating' => 79, 'price_cents' => 5990, 'price_fc' => 3200, 'tier' => 'silver', 'is_extreme' => false, 'stats' => ['attack' => 82, 'technique' => 75, 'defence' => 61], 'tags' => ['Reserva']]] as $player) { Player::updateOrCreate(['external_id' => $player['external_id']], $player + ['team_id' => $teams['aurora']->id]); }
        $demo->players()->sync(Player::query()->pluck('id')->all());
        $league = League::updateOrCreate(['external_id' => 'brasileirao'], ['name' => 'Liga Brasileira', 'country' => 'BR', 'tier' => 'standard', 'club_count' => 20]);
        $season = $league->seasons()->updateOrCreate(['external_id' => 'season-07'], ['name' => 'Temporada 07', 'starts_at' => now()->startOfYear(), 'ends_at' => now()->endOfYear(), 'status' => 'active']);
        foreach ($teams as $team) { \DB::table('league_teams')->updateOrInsert(['league_id' => $league->id, 'team_id' => $team->id, 'season_id' => $season->id], ['position' => $team->name === 'FC Aurora' ? 3 : null, 'points' => $team->name === 'FC Aurora' ? 38 : 0]); }
        $stadium = Stadium::updateOrCreate(['external_id' => 'aurora-stadium'], ['name' => 'Estádio Aurora', 'capacity' => 42500, 'level' => 6, 'revenue_multiplier' => 1.18, 'visual' => ['accent' => 'teal', 'lights' => true]]);
        \DB::table('team_stadiums')->updateOrInsert(['team_id' => $teams['aurora']->id, 'stadium_id' => $stadium->id], ['is_primary' => true, 'created_at' => now(), 'updated_at' => now()]);
        \DB::table('matches')->updateOrInsert(['external_id' => 'aurora-07'], ['season_id' => $season->id, 'home_team_id' => $teams['aurora']->id, 'away_team_id' => $teams['rio-bulls']->id, 'kickoff_at' => now()->addHours(4), 'status' => 'live', 'home_score' => 1, 'away_score' => 0, 'events' => json_encode(["37' · Aurora mantém a posse no campo de ataque", "31' · Defesa do Rio Bulls afasta o cruzamento", "24' · Gol do FC Aurora · L. Andrade"]), 'updated_at' => now()]);
        foreach ([['key' => 'fire-finisher', 'name' => 'Fogo', 'element' => 'fogo', 'description' => 'Finalização e intensidade no último terço.', 'default_bonus' => 8], ['key' => 'water-reflex', 'name' => 'Água', 'element' => 'agua', 'description' => 'Reflexos e controle em condições difíceis.', 'default_bonus' => 7], ['key' => 'lightning-burst', 'name' => 'Raio', 'element' => 'raio', 'description' => 'Aceleração após recuperar a bola.', 'default_bonus' => 6], ['key' => 'wind-pressure', 'name' => 'Vento', 'element' => 'vento', 'description' => 'Resistência e pressão alta.', 'default_bonus' => 5], ['key' => 'ice-duel', 'name' => 'Gelo', 'element' => 'gelo', 'description' => 'Marcação em duelos decisivos.', 'default_bonus' => 9]] as $power) { \DB::table('power_types')->updateOrInsert(['key' => $power['key']], $power); }
        foreach ([['name' => 'Chuteira Fênix', 'category' => 'chuteira', 'element' => 'fogo', 'power' => 8, 'effect' => '+8 finalização no último terço', 'price_cents' => 1990, 'price_fc' => 1900, 'icon' => '♢'], ['name' => 'Luva Maré Alta', 'category' => 'luva', 'element' => 'agua', 'power' => 7, 'effect' => '+7 reflexo em bolas molhadas', 'price_cents' => 1790, 'price_fc' => 1650, 'icon' => '◒'], ['name' => 'Colar Voltagem', 'category' => 'colar', 'element' => 'raio', 'power' => 6, 'effect' => '+6 aceleração após roubar a bola', 'price_cents' => 1490, 'price_fc' => 1350, 'icon' => 'ϟ'], ['name' => 'Touca Ventus', 'category' => 'touca', 'element' => 'vento', 'power' => 5, 'effect' => '+5 resistência e pressão', 'price_cents' => 990, 'price_fc' => 980, 'icon' => '⌁'], ['name' => 'Máscara Glacial', 'category' => 'mascara', 'element' => 'gelo', 'power' => 9, 'effect' => '+9 marcação em duelos decisivos', 'price_cents' => 2290, 'price_fc' => 2200, 'icon' => '◉']] as $item) { \DB::table('items')->updateOrInsert(['name' => $item['name']], $item + ['max_durability' => 100, 'version' => 1]); }
    }
}

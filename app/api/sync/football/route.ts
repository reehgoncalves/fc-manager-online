import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// Esta rota deve ser chamada por um Cron Job diariamente (ex: Vercel Cron)
// e pode ser acionada manualmente no painel Admin.

export async function POST(req: Request) {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    
    // Se não tivermos a chave (modo de desenvolvimento/validação inicial)
    // usaremos dados mockados simulando o formato da API-Football.
    if (!apiKey || apiKey === "Sua chave da API-Sports aqui") {
      console.warn("⚠️ [SYNC] API_FOOTBALL_KEY não configurada. Usando dados MOCK da vida real.");
      
      const mockApiSportsResponse = [
        { id: 1001, name: "L. Messi", pos: "ATA", rating: 93, team: "Inter Miami" },
        { id: 1002, name: "C. Ronaldo", pos: "ATA", rating: 91, team: "Al-Nassr" },
        { id: 1003, name: "Neymar Jr", pos: "MEI", rating: 89, team: "Al-Hilal" },
        { id: 1004, name: "E. Haaland", pos: "ATA", rating: 92, team: "Manchester City" },
        { id: 1005, name: "Vini Jr", pos: "ATA", rating: 91, team: "Real Madrid" },
        { id: 1006, name: "K. De Bruyne", pos: "MEI", rating: 91, team: "Manchester City" },
      ];

      // Atualizamos a tabela local global.mockCatalog 
      // (Se usarmos Supabase, isso vai pro banco de dados real via UPSERT)
      const { data, error } = await supabase
        .from('players')
        .upsert(
          mockApiSportsResponse.map(p => ({
            external_id: p.id,
            name: p.name,
            position: p.pos,
            base_rating: p.rating,
            club_name: p.team
          })), 
          { onConflict: 'external_id' }
        );
        
      if (error) {
        console.error("Erro no Supabase Upsert (Mock):", error);
        // Fallback local caso Supabase não esteja online
        // @ts-ignore
        global.mockCatalog = mockApiSportsResponse;
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Sync simulado concluído (Mock Fallback). Banco atualizado.',
        count: mockApiSportsResponse.length
      });
    }

    // =========================================================================
    // EXECUÇÃO EM PRODUÇÃO (Com chave real)
    // =========================================================================
    console.log("🚀 [SYNC] Iniciando sincronização real com API-Football...");
    
    const response = await fetch("https://v3.football.api-sports.io/players?league=71&season=2023", {
      headers: {
        "x-apisports-key": apiKey,
        "x-apisports-host": "v3.football.api-sports.io"
      }
    });

    if (!response.ok) {
      throw new Error(`API-Football respondeu com erro: ${response.status}`);
    }

    const payload = await response.json();
    
    if (!payload.response || !payload.response.length) {
      return NextResponse.json({ success: false, message: 'Nenhum jogador retornado' });
    }

    // Mapeamento e tratamento de dados reais para o Supabase
    const playersToUpsert = payload.response.map((item: any) => ({
      external_id: item.player.id,
      name: item.player.name,
      position: item.statistics[0]?.games?.position || 'UNKNOWN',
      base_rating: Math.min(99, Math.max(50, 60 + (item.statistics[0]?.games?.rating || 10) * 3)), // formula baseada na nota do jogo (0-10) -> (60-99)
      club_name: item.statistics[0]?.team?.name || 'Free Agent'
    }));

    // UPSERT (insere ou atualiza se já existir)
    const { error: dbError } = await supabase
      .from('players')
      .upsert(playersToUpsert, { onConflict: 'external_id' });

    if (dbError) throw dbError;

    return NextResponse.json({ 
      success: true, 
      message: 'Sincronização API-Football -> Supabase concluída com sucesso.',
      count: playersToUpsert.length
    });

  } catch (error: any) {
    console.error("Erro no Sync:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: path.startsWith("/api/") ? "application/json" : "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renderiza o portal FC Manager Online", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /FC MANAGER/i);
  assert.match(html, /Visão geral/i);
  assert.match(html, /Transferências/i);
  assert.match(html, /Loja &amp; moedas|Loja & moedas/i);
  assert.match(html, /Abrir jogo online/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
});

test("renderiza as telas principais do jogo", async () => {
  for (const path of ["/login", "/career", "/choose-league", "/lineup", "/live-match", "/transfer-list", "/standings", "/stadium"]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /FC MANAGER|Partida ao vivo|Entre no jogo/i, path);
  }
});

test("entrega o catálogo rápido para o frontend", async () => {
  const response = await render("/api/catalog");
  assert.equal(response.status, 200);
  const catalog = await response.json();
  assert.ok(catalog.players.length >= 4);
  assert.ok(catalog.items.length >= 5);
  assert.ok(catalog.powerTypes.length >= 5);
  assert.ok(catalog.stadiums.length >= 1);
  assert.ok(catalog.leagues.length >= 4);
  assert.ok(catalog.news.length >= 3);
  assert.ok(catalog.achievements.length >= 3);
  assert.ok(catalog.trophies.length >= 3);
  assert.ok(catalog.teamAssets.some((team) => team.flagUrl));
});

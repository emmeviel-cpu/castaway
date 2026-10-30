// Prova di fumo: avvia l'app su localhost:8123 con Wikipedia simulata e posizione a Lisbona.
// Uso: python3 -m http.server 8123 &  poi  node tests/smoke.js docs/screenshot-mvp.png
const assert = require('assert');
const { chromium } = require('playwright');
const fx = require('./fixtures.js');

(async () => {
  const browser = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } } : {});
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
    geolocation: { latitude: 38.7107, longitude: -9.1365 }, permissions: ['geolocation'], locale: 'it-IT',
  });
  const page = await ctx.newPage();
  const requests = [];
  await page.route('https://*.wikipedia.org/**', (route) => {
    const url = new URL(route.request().url());
    requests.push(url);
    const lang = url.hostname.split('.')[0];
    route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(fx[lang]) });
  });
  await page.addInitScript(() => {
    window.__spoken = [];
    const orig = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => { if (u.text) window.__spoken.push(`[${u.lang}] ${u.text}`); orig(u); };
  });
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  await page.goto('http://localhost:8123/');
  await page.click('#tell');
  await page.waitForSelector('#places li', { timeout: 20000 });

  const spoken = await page.evaluate(() => window.__spoken);
  const titles = await page.$$eval('#places h2', (els) => els.map((e) => e.textContent));
  console.log(spoken.join('\n'));

  // La richiesta chiede a Wikipedia i filtri e i dati della ricetta.
  for (const u of requests) {
    const q = u.searchParams;
    assert.strictEqual(q.get('ggsmaxdim'), '500');
    assert.strictEqual(q.get('ggsprimary'), 'primary');
    assert.match(q.get('prop'), /description/);
    assert.match(q.get('prop'), /pageviews/);
  }
  // Scelta degli imperdibili: 5 luoghi, ordinati per distanza.
  assert.deepStrictEqual(titles, [
    'Rua Augusta', 'Elevador de Santa Justa', 'Convento do Carmo',
    'Piazza del Rossio', 'Teatro nazionale Dona Maria II',
  ]);
  // Scartati: stazione (tipo), luoghi poco visitati (punteggio), voce senza coordinate.
  for (const out of ['Stazione di Lisbona Rossio', 'Cappella minore', 'Beco do Exemplo', 'Senza coordinate']) {
    assert(!titles.includes(out), `${out} non doveva esserci`);
  }
  // Descrizione breve nell'annuncio italiano, non in quello delle voci inglesi.
  assert(spoken.includes('[it-IT] Convento do Carmo, ex convento carmelitano, a 391 metri.'));
  assert(spoken.includes('[it-IT] Rua Augusta, a 89 metri. Te lo racconto in inglese.'));
  console.log('OK: tutte le verifiche superate');

  if (process.argv[2]) await page.screenshot({ path: process.argv[2], fullPage: true });
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });

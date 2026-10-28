// Prova di fumo: avvia l'app su localhost:8123 con Wikipedia simulata e posizione a Lisbona.
// Uso: python3 -m http.server 8123 &  poi  node tests/smoke.js docs/screenshot-mvp.png
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' } } : {});
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
    geolocation: { latitude: 38.7107, longitude: -9.1365 }, permissions: ['geolocation'], locale: 'it-IT',
  });
  const page = await ctx.newPage();
  const fx = require('./fixtures.js');
  await page.route('https://*.wikipedia.org/**', (route) => {
    const lang = new URL(route.request().url()).hostname.split('.')[0];
    console.log('wiki request:', lang);
    route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(fx[lang]) });
  });
  await page.addInitScript(() => {
    window.__spoken = [];
    const orig = speechSynthesis.speak.bind(speechSynthesis);
    speechSynthesis.speak = (u) => { if (u.text) window.__spoken.push(`[${u.lang}] ${u.text}`); orig(u); };
  });
  page.on('console', m => console.log('console:', m.text()));
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.goto('http://localhost:8123/');
  await page.click('#tell');
  await page.waitForSelector('#places li', { timeout: 20000 }).catch(() => {});
  console.log('STATUS:', await page.textContent('#status'));
  console.log((await page.evaluate(() => window.__spoken)).join('\n'));
  await page.screenshot({ path: process.argv[2], fullPage: true });
  await browser.close();
})();

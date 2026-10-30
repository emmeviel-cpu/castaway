// Cerca su Wikipedia i luoghi vicini a una coordinata e sceglie gli
// "imperdibili" (vedi la ricetta in CLAUDE.md).
// Strategia lingua: italiano prima, inglese come riserva per i luoghi
// che non hanno una voce italiana.

const RADIUS_M = 1000;    // massimo consentito dall'API: 10000
const MAX_DIM_M = 500;    // esclude città, regioni, fiumi
const MAX_PLACES = 5;
const PAGEVIEW_DAYS = 7;
const WEIGHT_POPULARITY = 0.6;
const WEIGHT_PROXIMITY = 0.4;

// Tipi di coordinata poco interessanti per chi cammina.
const EXCLUDED_TYPES = new Set([
  'edu', 'railwaystation', 'airport',
  'country', 'state', 'adm1st', 'adm2nd', 'adm3rd', 'city',
]);

function apiUrl(lang, params) {
  const qs = new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params });
  return `https://${lang}.wikipedia.org/w/api.php?${qs}`;
}

function distanceM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

function sumPageviews(pageviews) {
  return Object.values(pageviews || {}).reduce((sum, n) => sum + (n || 0), 0);
}

async function geosearch(lang, lat, lon, extraProps = {}) {
  const url = apiUrl(lang, {
    action: 'query',
    generator: 'geosearch',
    ggscoord: `${lat}|${lon}`,
    ggsradius: String(RADIUS_M),
    ggsmaxdim: String(MAX_DIM_M),
    ggsprimary: 'primary',
    ggslimit: '20',
    prop: 'coordinates|extracts|description|pageviews' + (extraProps.prop ? `|${extraProps.prop}` : ''),
    coprop: 'type',
    coprimary: 'primary',
    exintro: '1',
    explaintext: '1',
    exsentences: '2',
    exlimit: 'max',
    pvipdays: String(PAGEVIEW_DAYS),
    ...extraProps.params,
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wikipedia ${lang} ha risposto ${res.status}`);
  const data = await res.json();
  const pages = (data.query && data.query.pages) || [];
  return pages
    .filter((p) => p.coordinates && p.coordinates.length && p.extract)
    .filter((p) => !EXCLUDED_TYPES.has(p.coordinates[0].type))
    .map((p) => ({
      title: p.title,
      description: p.description || '',
      summary: p.extract.trim(),
      lang,
      distance: distanceM(lat, lon, p.coordinates[0].lat, p.coordinates[0].lon),
      views: sumPageviews(p.pageviews),
      hasItalian: Boolean(p.langlinks && p.langlinks.length),
    }));
}

// Popolarità su scala logaritmica: 100 visite contro 10.000 conta, ma senza
// schiacciare tutto il resto sotto il luogo più famoso.
function scorePlaces(places) {
  const maxLogViews = Math.max(1, ...places.map((p) => Math.log10(1 + p.views)));
  return places.map((p) => ({
    ...p,
    score: WEIGHT_POPULARITY * (Math.log10(1 + p.views) / maxLogViews) +
      WEIGHT_PROXIMITY * Math.max(0, 1 - p.distance / RADIUS_M),
  }));
}

async function findNearbyPlaces(lat, lon) {
  const [itRes, enRes] = await Promise.allSettled([
    geosearch('it', lat, lon),
    geosearch('en', lat, lon, {
      prop: 'langlinks',
      params: { lllang: 'it', lllimit: 'max' },
    }),
  ]);
  if (itRes.status === 'rejected' && enRes.status === 'rejected') {
    throw new Error('Wikipedia non risponde. Riprova tra poco.');
  }
  const it = itRes.status === 'fulfilled' ? itRes.value : [];
  const en = enRes.status === 'fulfilled' ? enRes.value : [];
  // Una voce inglese entra solo se il luogo non ha già una voce italiana.
  const enOnly = en.filter((p) => !p.hasItalian);
  // Scelgo i migliori per punteggio, poi li racconto dal più vicino.
  return scorePlaces([...it, ...enOnly])
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PLACES)
    .sort((a, b) => a.distance - b.distance);
}

window.CastawayWiki = { findNearbyPlaces, distanceM, scorePlaces };

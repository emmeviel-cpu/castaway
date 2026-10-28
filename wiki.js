// Cerca su Wikipedia i luoghi vicini a una coordinata.
// Strategia lingua: italiano prima, inglese come riserva per i luoghi
// che non hanno una voce italiana.

const RADIUS_M = 1000;   // massimo consentito dall'API: 10000
const MAX_PLACES = 5;

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

async function geosearch(lang, lat, lon, extraProps = {}) {
  const url = apiUrl(lang, {
    action: 'query',
    generator: 'geosearch',
    ggscoord: `${lat}|${lon}`,
    ggsradius: String(RADIUS_M),
    ggslimit: '20',
    prop: 'coordinates|extracts' + (extraProps.prop ? `|${extraProps.prop}` : ''),
    exintro: '1',
    explaintext: '1',
    exsentences: '2',
    exlimit: 'max',
    ...extraProps.params,
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wikipedia ${lang} ha risposto ${res.status}`);
  const data = await res.json();
  const pages = (data.query && data.query.pages) || [];
  return pages
    .filter((p) => p.coordinates && p.coordinates.length && p.extract)
    .map((p) => ({
      title: p.title,
      summary: p.extract.trim(),
      lang,
      distance: distanceM(lat, lon, p.coordinates[0].lat, p.coordinates[0].lon),
      hasItalian: Boolean(p.langlinks && p.langlinks.length),
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
  return [...it, ...enOnly]
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_PLACES);
}

window.CastawayWiki = { findNearbyPlaces, distanceM };

const tellBtn = document.getElementById('tell');
const stopBtn = document.getElementById('stop');
const statusEl = document.getElementById('status');
const listEl = document.getElementById('places');

function setStatus(text) { statusEl.textContent = text; }

function formatDistance(m) {
  return m < 1000 ? `${m} metri` : `${(m / 1000).toFixed(1).replace('.', ',')} chilometri`;
}

function getPosition() {
  // Per le prove: ?lat=38.7107&lon=-9.1365 sostituisce il GPS.
  const q = new URLSearchParams(location.search);
  if (q.has('lat') && q.has('lon')) {
    return Promise.resolve({ lat: Number(q.get('lat')), lon: Number(q.get('lon')) });
  }
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Il telefono non fornisce la posizione.'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => reject(new Error('Non riesco a leggere la posizione. Controlla i permessi del GPS.')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  });
}

function renderPlaces(places) {
  listEl.innerHTML = '';
  places.forEach((p) => {
    const li = document.createElement('li');
    const h = document.createElement('h2');
    h.textContent = p.title;
    const meta = document.createElement('p');
    meta.className = 'meta';
    meta.textContent = [p.description, `a ${formatDistance(p.distance)}`, p.lang === 'en' ? 'voce in inglese' : '']
      .filter(Boolean).join(' · ');
    const summary = document.createElement('p');
    summary.className = 'summary';
    summary.textContent = p.summary;
    li.append(h, meta, summary);
    listEl.append(li);
  });
}

// Ogni luogo diventa due frasi: l'annuncio in italiano e il riassunto
// nella lingua della voce Wikipedia, letto con la pronuncia giusta.
function buildUtterances(places) {
  const out = [];
  const intro = places.length === 1
    ? 'Qui intorno c\'è un luogo da conoscere.'
    : `Qui intorno ci sono ${places.length} luoghi da conoscere.`;
  out.push({ text: intro, lang: 'it-IT', index: -1 });
  places.forEach((p, i) => {
    // La descrizione breve entra nell'annuncio solo se è in italiano.
    const desc = p.lang === 'it' && p.description ? `, ${p.description},` : ',';
    const header = `${p.title}${desc} a ${formatDistance(p.distance)}.` +
      (p.lang === 'en' ? ' Te lo racconto in inglese.' : '');
    out.push({ text: header, lang: 'it-IT', index: i });
    out.push({ text: p.summary, lang: p.lang === 'en' ? 'en-US' : 'it-IT', index: i });
  });
  return out;
}

function highlight(index) {
  [...listEl.children].forEach((li, i) => li.classList.toggle('speaking', i === index));
}

function speak(places) {
  if (!('speechSynthesis' in window)) {
    setStatus('Questo browser non sa leggere ad alta voce: trovi i testi qui sotto.');
    return;
  }
  speechSynthesis.cancel();
  const items = buildUtterances(places);
  items.forEach((item, n) => {
    const u = new SpeechSynthesisUtterance(item.text);
    u.lang = item.lang;
    u.onstart = () => highlight(item.index);
    if (n === items.length - 1) {
      u.onend = () => { highlight(-1); stopBtn.hidden = true; setStatus('Fine del racconto.'); };
    }
    speechSynthesis.speak(u);
  });
  stopBtn.hidden = false;
  setStatus('Ti sto raccontando cosa c\'è intorno…');
}

tellBtn.addEventListener('click', async () => {
  // Su iOS la voce parte solo se avviata dentro il tocco: la "sblocco" subito.
  if ('speechSynthesis' in window) speechSynthesis.speak(new SpeechSynthesisUtterance(''));
  tellBtn.disabled = true;
  listEl.innerHTML = '';
  try {
    setStatus('Cerco dove sei…');
    const { lat, lon } = await getPosition();
    setStatus('Cerco i luoghi qui intorno…');
    const places = await window.CastawayWiki.findNearbyPlaces(lat, lon);
    if (!places.length) {
      setStatus('Qui intorno non trovo luoghi su Wikipedia. Prova a spostarti un po\'.');
      return;
    }
    renderPlaces(places);
    speak(places);
  } catch (err) {
    setStatus(err.message);
  } finally {
    tellBtn.disabled = false;
  }
});

stopBtn.addEventListener('click', () => {
  speechSynthesis.cancel();
  highlight(-1);
  stopBtn.hidden = true;
  setStatus('Voce fermata.');
});

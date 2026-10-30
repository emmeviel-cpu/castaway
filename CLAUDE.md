# Castaway (nome provvisorio)

## Descrizione
Web app per telefono che accompagna chi cammina in una città straniera. Con le
cuffie, l'utente ascolta una voce che racconta i luoghi imperdibili del
quartiere in cui si trova, in base alle sue preferenze. Niente pagamenti.

Funzioni essenziali previste:
1. **Dare info**: racconta a voce i luoghi vicini. ✅ MVP fatto
2. **Seguire il viaggio**: aggiorna il racconto mentre l'utente cammina.
3. **Approfondire**: apre la voce Wikipedia di ciò che è stato raccontato.

## Stato attuale (MVP)
- Pulsante "Cosa c'è qui intorno?": legge il GPS, cerca su Wikipedia le voci
  geolocalizzate entro 1 km e legge in voce le 5 più vicine (nome, distanza,
  riassunto di 2 frasi). Le schede evidenziano il luogo in lettura.
- Pulsante "Ferma la voce".
- Parametri di prova: `?lat=38.7107&lon=-9.1365` sostituisce il GPS.

## Scelte tecniche
- **PWA statica** (HTML/CSS/JS senza framework né build): si apre da un link e
  si aggiunge alla Home. Nessuna dipendenza da installare.
- **Dati**: API Wikipedia `generator=geosearch` + `prop=extracts|coordinates`
  (gratuita, senza chiave). Codice in `wiki.js`.
- **Lingua**: italiano prima; inglese come riserva solo per i luoghi senza voce
  italiana (filtro via `langlinks` con `lllang=it`). Le voci inglesi sono
  annunciate in italiano e lette con pronuncia inglese.
- **Voce**: Web Speech API (`speechSynthesis`) del telefono, con `lang`
  impostato per ogni frase. Su iOS la voce viene "sbloccata" nel tocco.
- **Limite noto**: in una web app la voce e il GPS si fermano a schermo spento.
  Se la funzione 2 lo richiede, valutare un'app nativa (Expo/React Native).

## Struttura
- `index.html`, `style.css`, `app.js` (interfaccia e voce), `wiki.js` (ricerca)
- `manifest.webmanifest`, `icons/icon.svg`
- `tests/smoke.js` + `tests/fixtures.js`: prova con Playwright e risposte
  Wikipedia simulate (il server cloud riceve 429 da Wikipedia).
- `docs/screenshot-mvp.png`

## Come provarla
- In locale: `python3 -m http.server 8123` e apri `http://localhost:8123`.
- Sul telefono serve HTTPS per il GPS: per esempio GitHub Pages sul branch.

## Ricetta "imperdibili"
Come scegliere i luoghi da raccontare, usando solo dati di Wikipedia ottenibili
nella stessa richiesta della ricerca per posizione:
1. **Filtrare**: solo coordinate principali (`ggsprimary=primary`), oggetti
   piccoli (`ggsmaxdim` ~500 m, toglie città, regioni, fiumi) e niente tipi poco
   interessanti a piedi (`edu`, `railwaystation`, `airport`, livelli
   amministrativi), letti da `ggsprop=type`.
2. **Ordinare per punteggio**: visite alla pagina negli ultimi giorni
   (`prop=pageviews`) più vicinanza; in seguito anche corrispondenza con le
   preferenze (categorie o Wikidata).
3. **Raccontare**: descrizione breve (`prop=description`) come annuncio, poi il
   riassunto.

Limiti: molte voci non hanno il tipo; per le preferenze serviranno categorie
o Wikidata (`pageprops` → `wikibase_item`).

Riferimenti: Extension:GeoData e API:Geosearch su mediawiki.org. La pagina
`Special:Nearby` di Wikipedia usa la stessa API ma senza voce, percorso né
preferenze.

## Prossimi passi
1. Implementare la ricetta "imperdibili" (filtro + punteggio + descrizione).
2. Pubblicare su GitHub Pages e provare sul telefono, in strada.
3. Funzione 2 "Seguire il viaggio": `watchPosition`, racconta solo luoghi nuovi
   quando ci si sposta di ~150 m, senza ripetere quelli già detti.
4. Funzione 3 "Approfondire": link alla voce Wikipedia e lettura estesa.
5. Preferenze personali (storia, arte, cibo, architettura…) per filtrare e
   ordinare i luoghi, salvate sul telefono; entrano nel punteggio della ricetta.

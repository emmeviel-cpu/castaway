// Risposte Wikipedia simulate per il centro di Lisbona (formato formatversion=2).
// Contiene casi che la ricetta deve scartare: una stazione, un luogo vicino
// ma poco visitato (in italiano e in inglese), una voce senza coordinate.
const views = (n) => ({ '2026-10-22': n, '2026-10-23': null, '2026-10-24': n });

module.exports = {
  it: { query: { pages: [
    { title: 'Elevador de Santa Justa', description: 'ascensore pubblico di Lisbona',
      coordinates: [{ lat: 38.71211, lon: -9.13942, type: 'landmark' }], pageviews: views(2500),
      extract: "L'Elevador de Santa Justa è un ascensore pubblico di Lisbona, inaugurato nel 1902. Collega la Baixa al Largo do Carmo ed è opera dell'ingegnere Raoul Mesnier du Ponsard." },
    { title: 'Piazza del Rossio', description: 'piazza di Lisbona',
      coordinates: [{ lat: 38.71389, lon: -9.13917, type: 'landmark' }], pageviews: views(4000),
      extract: "Piazza del Rossio, ufficialmente Praça de D. Pedro IV, è una delle piazze principali di Lisbona. È famosa per la pavimentazione ondulata in pietra." },
    { title: 'Convento do Carmo', description: 'ex convento carmelitano',
      coordinates: [{ lat: 38.71222, lon: -9.14056 }], pageviews: views(1500),
      extract: "Il Convento do Carmo è un ex convento carmelitano di Lisbona, rimasto in rovina dopo il terremoto del 1755. Oggi ospita il Museo archeologico del Carmo." },
    { title: 'Teatro nazionale Dona Maria II', description: 'teatro di Lisbona',
      coordinates: [{ lat: 38.7145, lon: -9.1395, type: 'landmark' }], pageviews: views(750),
      extract: "Il Teatro nazionale Dona Maria II è un teatro storico di Lisbona, affacciato sulla piazza del Rossio. Fu inaugurato nel 1846." },
    { title: 'Stazione di Lisbona Rossio', description: 'stazione ferroviaria',
      coordinates: [{ lat: 38.7143, lon: -9.1409, type: 'railwaystation' }], pageviews: views(3000),
      extract: 'La stazione di Lisbona Rossio è una stazione ferroviaria. Va scartata per tipo.' },
    { title: 'Cappella minore', description: 'cappella',
      coordinates: [{ lat: 38.7110, lon: -9.1368 }], pageviews: views(2),
      extract: 'Una cappella vicinissima ma poco visitata. Deve perdere contro i luoghi famosi.' },
    { title: 'Senza coordinate', extract: 'Va scartata.' },
  ] } },
  en: { query: { pages: [
    { title: 'Elevador de Santa Justa', description: 'elevator in Lisbon',
      coordinates: [{ lat: 38.71211, lon: -9.13942, type: 'landmark' }], pageviews: views(9000),
      extract: 'The Santa Justa Lift is an elevator in Lisbon.', langlinks: [{ lang: 'it', title: 'Elevador de Santa Justa' }] },
    { title: 'Rua Augusta', description: 'street in Lisbon',
      coordinates: [{ lat: 38.71000, lon: -9.13700 }], pageviews: views(2000),
      extract: 'Rua Augusta is a historic, touristic and commercial street in Lisbon. It connects the Praça do Comércio to the Rossio.' },
    { title: 'Beco do Exemplo', description: 'alley in Lisbon',
      coordinates: [{ lat: 38.7105, lon: -9.1363 }], pageviews: views(1),
      extract: 'A tiny alley with few readers. It must lose against famous places.' },
  ] } },
};

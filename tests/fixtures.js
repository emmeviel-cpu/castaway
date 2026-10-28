// Risposte Wikipedia simulate per il centro di Lisbona (formato formatversion=2).
module.exports = {
  it: { query: { pages: [
    { title: 'Elevador de Santa Justa', coordinates: [{ lat: 38.71211, lon: -9.13942 }],
      extract: "L'Elevador de Santa Justa è un ascensore pubblico di Lisbona, inaugurato nel 1902. Collega la Baixa al Largo do Carmo ed è opera dell'ingegnere Raoul Mesnier du Ponsard." },
    { title: 'Piazza del Rossio', coordinates: [{ lat: 38.71389, lon: -9.13917 }],
      extract: "Piazza del Rossio, ufficialmente Praça de D. Pedro IV, è una delle piazze principali di Lisbona. È famosa per la pavimentazione ondulata in pietra." },
    { title: 'Convento do Carmo', coordinates: [{ lat: 38.71222, lon: -9.14056 }],
      extract: "Il Convento do Carmo è un ex convento carmelitano di Lisbona, rimasto in rovina dopo il terremoto del 1755. Oggi ospita il Museo archeologico del Carmo." },
    { title: 'Senza coordinate', extract: 'Va scartata.' },
  ] } },
  en: { query: { pages: [
    { title: 'Elevador de Santa Justa', coordinates: [{ lat: 38.71211, lon: -9.13942 }],
      extract: 'The Santa Justa Lift is an elevator in Lisbon.', langlinks: [{ lang: 'it', title: 'Elevador de Santa Justa' }] },
    { title: 'Rua Augusta', coordinates: [{ lat: 38.71000, lon: -9.13700 }],
      extract: 'Rua Augusta is a historic, touristic and commercial street in Lisbon. It connects the Praça do Comércio to the Rossio.' },
  ] } },
};

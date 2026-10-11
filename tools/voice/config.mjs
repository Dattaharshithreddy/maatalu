// Which Google Chirp 3 HD voice speaks for each character. Change a name or speed here and
// re-run the "Generate story voices" workflow to re-record just that character's lines.
// Female voices: Achernar, Aoede, Autonoe, Callirrhoe, Despina, Erinome, Gacrux, Kore, Laomedeia, Leda,
//   Pulcherrima, Sulafat, Vindemiatrix, Zephyr
// Male voices: Achird, Algenib, Algieba, Alnilam, Charon, Enceladus, Fenrir, Iapetus, Orus, Puck,
//   Rasalgethi, Sadachbia, Sadaltager, Schedar, Umbriel, Zubenelgenubi
export const LANGUAGE = 'te-IN';
export const VOICES = {
  ammamma: { voice: 'Gacrux', rate: 0.88 },
  tatayya: { voice: 'Algenib', rate: 0.85 },
  amma: { voice: 'Sulafat', rate: 0.95 },
  nanna: { voice: 'Achird', rate: 0.95 },
  // Children: Google has no child voices, so both use light, youthful voices (as cartoons often do).
  boy: { voice: 'Laomedeia', rate: 1.0 },
  girl: { voice: 'Leda', rate: 1.0 },
};

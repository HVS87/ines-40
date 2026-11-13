// As músicas do jogo, escritas em notas (o som é gerado em js/audio.js, sem ficheiros de áudio).
//
// Cada faixa é uma sequência de compassos. Em cada compasso há um acorde (que dá o baixo e o
// acompanhamento) e a melodia, escrita passo a passo: uma nota ('E5', 'F#5', 'Bb4'), '-' (prolonga
// a nota anterior) ou '.' (pausa).
//
//   bpm       batidas por minuto (e gain: volume da faixa inteira, 1 por omissão)
//   div       passos por batida (2 = colcheias, por omissão; 3 = tercinas, para o 6/8; 4 = semicolcheias)
//   per       passos por compasso (8 por omissão; 6 para a valsa e para o 6/8; 16 em semicolcheias)
//   swing     atraso dos passos ímpares (0 a 0.33), para o balanço do jazz
//   lead      onda da melodia ('square', 'triangle', 'sine', 'sawtooth'), com leadVol e leadLen (1 = ligado, 0.5 = picado)
//   arp/comp  onda e desenho do acompanhamento, por passo: '0' '1' '2' = notas do acorde, '3' = a
//             fundamental uma oitava acima, 'x' = o acorde inteiro, 'X' = acorde acentuado, '.' = nada
//   bass      desenho do baixo: 'r' fundamental, 'f' quinta, 't' terceira, 'R' fundamental acima, 'F' quinta abaixo
//   drums     percussão, um desenho por instrumento ('x' toca, 'X' acentua, 'o' toca baixinho):
//             k bombo · s tarola · h prato fechado · o prato aberto · c palmas · m ganzá · r aro/castanholas
//             x paus (clapsticks) · u surdo · U surdo abafado · t tamborim · a/A agogô · b bombo de festa · g ferrinhos
//
// Os desenhos repetem-se (um desenho de 4 passos enche um compasso de 8) e podem durar mais de
// um compasso. As melodias são originais, compostas para o jogo «ao estilo de» cada momento, com
// duas exceções de domínio público: a canção de embalar de Brahms e o «Parabéns a você».
export const TRACKS = {
  // ----- as de sempre -----
  // menu e momentos ternos: calma, em dó maior
  menu: {
    bpm: 88, gain: 1.1, lead: 'triangle', leadVol: 0.05, arp: 'square', arpVol: 0.012, bassVol: 0.06,
    chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'C'],
    melody: [
      'E5 - - G5 E5 - C5 -', 'D5 - - G5 D5 - B4 -', 'C5 - E5 - A5 - G5 -', 'F5 - E5 - D5 - C5 -',
      'E5 - G5 - C6 - G5 -', 'B5 - A5 - G5 - D5 -', 'A5 - G5 - F5 - E5 D5', 'C5 - - - . . . .',
    ],
  },
  // alegre e mexida: a casa nova
  play: {
    bpm: 132, gain: 1.1, lead: 'square', leadVol: 0.028, arp: 'square', arpVol: 0.011, bassVol: 0.065,
    drums: { h: 'o.x.o.x.' },
    chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'],
    melody: [
      'G5 . G5 E5 G5 - C6 -', 'A5 . A5 E5 A5 - C6 -', 'C6 B5 A5 G5 F5 - A5 -', 'G5 - D5 - G5 F5 E5 D5',
      'E5 . E5 G5 C6 - E6 -', 'D6 C6 B5 A5 E5 - A5 -', 'F5 G5 A5 C6 D6 - C6 A5', 'G5 - - - D5 E5 F5 D5',
    ],
  },
  // fins de tarde e pores do sol
  calm: {
    bpm: 72, lead: 'sine', leadVol: 0.06, arp: 'triangle', arpVol: 0.03, bassVol: 0.05,
    chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'],
    melody: [
      'E5 - - - A5 - - -', 'C6 - - - A5 - G5 -', 'G5 - - - E5 - - -', 'D5 - - - G5 - B4 -',
      'C5 - E5 - A5 - - -', 'A5 - C6 - F6 - E6 -', 'E6 - D6 - C6 - G5 -', 'B5 - - - . . . .',
    ],
  },
  // tensão: os momentos de aperto (rápida, em lá menor, com o baixo a martelar)
  tense: {
    bpm: 176, gain: 0.8, lead: 'square', leadVol: 0.03, arp: 'sawtooth', arpVol: 0.014, bassVol: 0.075,
    drums: { k: 'x...x...', h: '..x...x.' },
    chords: ['Am', 'Am', 'F', 'E', 'Am', 'Am', 'Dm', 'E'],
    melody: [
      'A5 A5 . A5 C6 B5 A5 .', 'E5 E5 . E5 A5 G5 E5 .', 'F5 F5 . F5 A5 G5 F5 .', 'E5 - G5 E5 D5 - B4 .',
      'A5 A5 . A5 C6 B5 A5 .', 'E6 - D6 C6 B5 - A5 .', 'D6 D6 . D6 F6 E6 D6 .', 'E6 - - - E5 - - .',
    ],
  },
  // festa: os finais felizes
  party: {
    bpm: 120, gain: 0.85, lead: 'square', leadVol: 0.03, arp: 'triangle', arpVol: 0.03, bassVol: 0.065,
    drums: { k: 'x...x...', c: '..x...x.', h: 'o.o.o.o.' },
    chords: ['C', 'F', 'G', 'C', 'Am', 'F', 'G', 'C'],
    melody: [
      'C5 E5 G5 C6 - - G5 -', 'A5 - C6 - F6 - C6 -', 'B5 - D6 - G6 - F6 -', 'E6 - C6 - G5 - - -',
      'A5 B5 C6 - E6 - C6 -', 'F6 - E6 - D6 - C6 -', 'D6 - B5 - G5 A5 B5 D6', 'C6 - - - G5 - - -',
    ],
  },

  // ----- domínio público -----
  // os nascimentos: a canção de embalar de Brahms (1868), em caixinha de música
  embalar: {
    bpm: 84, per: 6, lead: 'sine', leadVol: 0.07, arp: 'triangle', arpVol: 0.022, comp: '012121', bass: 'r.....', bassVol: 0.045, bassLen: 5,
    chords: ['C', 'C', 'C', 'C', 'G', 'G', 'G', 'C', 'F', 'C', 'G', 'C', 'F', 'C', 'G', 'C'],
    melody: [
      'G5 - - E5 E5 -', 'G5 - - - E5 G5', 'C6 - B5 - - A5', 'A5 - G5 - D5 E5',
      'F5 - D5 - D5 E5', 'F5 - - - D5 F5', 'B5 - A5 - G5 -', 'B5 - C6 - C5 C5',
      'C6 - - - A5 F5', 'G5 - - - E5 C5', 'F5 - G5 - A5 -', 'G5 - - - C5 C5',
      'C6 - - - A5 F5', 'G5 - - - E5 C5', 'F5 - E5 - D5 -', 'C5 - - - E5 E5',
    ],
  },
  // as 40 velas: «Parabéns a você»
  parabens: {
    bpm: 138, per: 6, lead: 'square', leadVol: 0.032, arp: 'triangle', arpVol: 0.03, comp: '..x.x.', bass: 'r.....', bassLen: 2.4,
    drums: { k: 'x.....', h: '..x.x.', g: 'o.....' },
    chords: ['C', 'G', 'G', 'C', 'C', 'F', 'C', 'C'],
    melody: [
      'A5 - G5 - C6 -', 'B5 - - - G5 G5', 'A5 - G5 - D6 -', 'C6 - - - G5 G5',
      'G6 - E6 - C6 -', 'B5 - A5 - F6 F6', 'E6 - C6 - D6 -', 'C6 - - - G5 G5',
    ],
  },

  // ----- infância e liceu -----
  // o recreio das Escravas: saltitante, como uma cantiga de roda
  recreio: {
    bpm: 126, gain: 1.25, lead: 'square', leadVol: 0.028, leadLen: 0.6, arp: 'triangle', arpVol: 0.026, comp: '0.2.1.2.', bassVol: 0.06,
    drums: { r: '..o...o.' },
    chords: ['C', 'G', 'C', 'G', 'F', 'C', 'G', 'C'],
    melody: [
      'E5 G5 G5 E5 C5 E5 G5 .', 'D5 G5 G5 D5 B4 D5 G5 .', 'E5 G5 C6 G5 E5 G5 C6 .', 'B5 A5 G5 F5 D5 - - .',
      'A5 A5 C6 A5 F5 A5 C6 .', 'G5 G5 E5 G5 C6 - G5 .', 'F5 E5 D5 F5 E5 D5 B4 D5', 'C5 - E5 - C5 - . .',
    ],
  },
  // o Rainha, anos 2000: pop-rock de guitarras
  liceu: {
    bpm: 150, gain: 0.75, lead: 'square', leadVol: 0.028, arp: 'sawtooth', arpVol: 0.011, comp: 'X..x..x.', bass: 'rrrrrrrr', bassVol: 0.05, bassLen: 0.9,
    drums: { k: 'x...x.x.', s: '..x...x.', h: 'xxxxxxxx' },
    chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G'],
    melody: [
      'A5 . A5 C6 B5 A5 E5 .', 'F5 . A5 C6 A5 - F5 .', 'G5 . G5 C6 E6 - C6 .', 'D6 - B5 - G5 A5 B5 .',
      'C6 . C6 E6 D6 C6 A5 .', 'A5 . C6 F6 E6 - C6 .', 'E6 D6 C6 G5 E5 G5 C6 .', 'B5 - D6 - G5 - - .',
    ],
  },
  // o namoro e os pedidos: uma valsa de bandolim, à italiana
  romance: {
    bpm: 100, gain: 1.15, per: 6, lead: 'triangle', leadVol: 0.055, arp: 'triangle', arpVol: 0.024, comp: '..x.x.', bass: 'r.....', bassVol: 0.055, bassLen: 3,
    chords: ['C', 'Am', 'Dm', 'G', 'C', 'Am', 'Dm', 'G'],
    melody: [
      'E5 - G5 - C6 -', 'C6 - A5 - E5 -', 'F5 - A5 - D6 -', 'D6 - B5 - G5 -',
      'E6 - - D6 C6 -', 'A5 - - C6 E6 -', 'D6 - F6 - E6 D6', 'B5 - D6 - G5 -',
    ],
  },

  // ----- as noites -----
  // a pista do Paradise Garage: house francês, de bombo a quatro tempos e baixo de disco
  house: {
    bpm: 124, gain: 0.75, lead: 'square', leadVol: 0.026, leadLen: 0.8, arp: 'sawtooth', arpVol: 0.012, comp: 'x..x..x.',
    bass: 'rRrRrRrR', bassWave: 'square', bassVol: 0.03, bassLen: 0.8,
    drums: { k: 'X.x.x.x.', o: '.x.x.x.x', c: '..x...x.' },
    chords: ['Dm', 'G', 'C', 'Am', 'Dm', 'G', 'C', 'Am'],
    melody: [
      'A5 . A5 . F5 A5 . D6', '. B5 . B5 D6 . B5 .', 'G5 . G5 . E5 G5 . C6', '. A5 . C6 E6 - C6 .',
      'A5 . A5 . F5 A5 . D6', '. B5 . D6 G6 - D6 .', 'E6 . E6 . C6 E6 . G6', 'E6 - C6 - A5 - . .',
    ],
  },
  // madrugada: mais escura e hipnótica, com as luzes baixas
  noite: {
    bpm: 128, gain: 0.75, lead: 'sine', leadVol: 0.055, arp: 'square', arpVol: 0.012, comp: '01232101',
    bass: 'r.rr.r.r', bassWave: 'sawtooth', bassVol: 0.03, bassLen: 0.8,
    drums: { k: 'x.x.x.x.', h: '.x.x.x.x', m: 'xoxoxoxo' },
    chords: ['Am', 'Am', 'F', 'G', 'Am', 'Am', 'F', 'G'],
    melody: [
      'E5 - - - - - A5 -', 'C6 - - - B5 - A5 -', 'A5 - - - - - C6 -', 'B5 - - - D6 - B5 -',
      'E6 - - - - - C6 -', 'A5 - - - C6 - E6 -', 'F6 - - - E6 - C6 -', 'D6 - - - B5 - G5 -',
    ],
  },
  // pé ante pé: fugir pela janela, esperar nas urgências
  sorrateiro: {
    bpm: 100, gain: 1.7, swing: 0.2, lead: 'square', leadVol: 0.028, leadLen: 0.45, comp: '', bass: 'r.t.f.t.', bassVol: 0.07, bassLen: 0.6,
    drums: { r: '..o...o.', h: '......o.' },
    chords: ['Dm', 'Dm', 'Gm', 'A', 'Dm', 'Bb', 'A', 'Dm'],
    melody: [
      'D5 . F5 . A5 . G#5 A5', 'D6 . . . A5 . F5 .', 'G5 . Bb5 . D6 . C#6 D6', 'E6 . . . C#6 . A5 .',
      'D5 . F5 . A5 . G#5 A5', 'Bb5 . D6 . F6 . D6 .', 'E6 . C#6 . A5 . G5 E5', 'D5 . . . D6 . . .',
    ],
  },
  // música ao vivo no Xafarix: balada pop de guitarra
  aovivo: {
    bpm: 104, lead: 'triangle', leadVol: 0.055, arp: 'sawtooth', arpVol: 0.009, comp: 'x.x.xx.x', bass: 'r..r..f.', bassVol: 0.06,
    drums: { k: 'x...x...', s: '..x...x.', h: 'xoxoxoxo' },
    chords: ['D', 'A', 'Bm', 'G', 'D', 'A', 'Bm', 'G'],
    melody: [
      'F#5 - A5 - D6 - - A5', 'E6 - C#6 - A5 - - .', 'D6 - B5 - F#5 - B5 D6', 'B5 - - G5 - D5 - .',
      'A5 - D6 - F#6 - - D6', 'E6 - - C#6 E6 - A6 -', 'F#6 - D6 - B5 - D6 -', 'G6 - - D6 B5 - - .',
    ],
  },
  // os Santos Populares: marcha de arraial, com acordeão e ferrinhos
  pimba: {
    bpm: 116, lead: 'sawtooth', leadVol: 0.022, arp: 'square', arpVol: 0.011, comp: '.x.x.x.x', bass: 'r.f.r.f.', bassVol: 0.07, bassLen: 1,
    drums: { b: 'x...x...', s: '..x...x.', g: 'x.xxx.xx' },
    chords: ['C', 'C', 'G', 'G', 'G', 'G', 'C', 'C'],
    melody: [
      'E5 G5 C6 - E6 - C6 -', 'G5 - E5 G5 C6 - - .', 'D5 G5 B5 - D6 - B5 -', 'G5 - D5 G5 B5 - - .',
      'F6 - D6 B5 G5 - B5 D6', 'F6 E6 D6 B5 G5 - - .', 'E6 - C6 G5 E5 - G5 C6', 'E6 D6 C6 - C6 - . .',
    ],
  },
  // a roda de samba: surdo, tamborim, agogô e cavaquinho
  samba: {
    bpm: 100, gain: 0.75, div: 4, per: 16, lead: 'square', leadVol: 0.028, leadLen: 0.85, arp: 'triangle', arpVol: 0.022, comp: 'x.xx.xx.x.xx.xx.', compLen: 0.6,
    bass: 'r..r....f..f....', bassVol: 0.06, bassLen: 2.4,
    drums: { U: 'x.......x.......', u: '....x.......x...', t: 'x.x.xx.x.x.x.xx.', a: '..x...x.....x...', A: 'x.......x.x.....', m: 'xooxxooxxooxxoox' },
    chords: ['C', 'Am', 'Dm', 'G', 'C', 'Am', 'Dm', 'G'],
    melody: [
      'E5 . G5 . C6 - . B5 . A5 . G5 - . E5 .', 'A5 . C6 . E6 - . D6 . C6 . A5 - . . .',
      'F5 . A5 . D6 - . C6 . A5 . F5 - . A5 .', 'B5 - . D6 - . B5 . G5 - - - . . . .',
      'G5 . C6 . E6 - . G6 . E6 . C6 - . G5 .', 'A5 . C6 . E6 - . A6 . E6 . C6 - . . .',
      'D6 . F6 . E6 - . D6 . C6 . A5 - . F5 .', 'G5 - . B5 - . D6 . G6 - - - . . . .',
    ],
  },

  // ----- verões, praias e viagens -----
  // os verões em Santo Amaro: balanço de reggae
  verao: {
    bpm: 92, lead: 'triangle', leadVol: 0.055, arp: 'square', arpVol: 0.011, comp: '.x.x.x.x', compLen: 0.5, bass: 'r..r.f..', bassVol: 0.07,
    drums: { k: '....x...', r: '....x...', h: 'x.x.x.x.' },
    chords: ['G', 'C', 'G', 'D', 'G', 'C', 'D', 'G'],
    melody: [
      'B5 - D6 - B5 G5 - .', 'C6 - E6 - C6 G5 - .', 'B5 - D6 - G6 - D6 .', 'A5 - F#5 - D5 - - .',
      'G5 B5 D6 - B5 - G5 .', 'E6 - C6 - E6 G6 - .', 'F#6 - D6 - A5 - C6 .', 'B5 - G5 - - - . .',
    ],
  },
  // acampar na Ilha do Farol: guitarra à fogueira
  acampar: {
    bpm: 108, gain: 1.2, lead: 'square', leadVol: 0.024, arp: 'triangle', arpVol: 0.022, comp: 'x.xx.xxx', bass: 'r...f...', bassVol: 0.06, bassLen: 3,
    drums: { m: 'x.o.x.o.' },
    chords: ['G', 'Em', 'C', 'D', 'G', 'Em', 'C', 'D'],
    melody: [
      'D5 - G5 - B5 - A5 G5', 'E5 - G5 - B5 - - .', 'E5 - G5 - C6 - B5 A5', 'A5 - F#5 - D5 - - .',
      'B5 - D6 - B5 - A5 G5', 'G5 - B5 - E6 - - .', 'E6 - D6 C6 - A5 - G5', 'F#5 - A5 - D5 - . .',
    ],
  },
  // a partida para a Austrália: saudade, quase fado
  saudade: {
    bpm: 76, lead: 'triangle', leadVol: 0.055, arp: 'triangle', arpVol: 0.026, comp: '01232121', bass: 'r...f...', bassVol: 0.05, bassLen: 3.5,
    chords: ['Am', 'Dm', 'E', 'Am', 'Am', 'Dm', 'E', 'Am'],
    melody: [
      'E5 - - A5 C6 - B5 A5', 'A5 - - F5 D5 - - -', 'G#5 - - B5 E6 - D6 B5', 'C6 - - A5 E5 - - -',
      'A5 - C6 - E6 - - C6', 'D6 - - F6 E6 - D6 -', 'B5 - - D6 B5 - G#5 E5', 'A5 - - - - - . .',
    ],
  },
  // a esplanada do Crô-Crô: bossa nova de fim de tarde
  esplanada: {
    bpm: 120, lead: 'triangle', leadVol: 0.05, arp: 'triangle', arpVol: 0.02, comp: 'x..x..x...x..x..', compLen: 0.7, bass: 'r..ff..r', bassVol: 0.06, bassLen: 1.4,
    drums: { r: 'x..x..x...x..x..', m: 'xoxoxoxo', k: 'o..oo..o' },
    chords: ['C', 'Am', 'Dm', 'G', 'C', 'Am', 'Dm', 'G'],
    melody: [
      '. E5 G5 - B5 - A5 G5', '. E5 A5 - C6 - B5 A5', '. F5 A5 - D6 - C6 A5', 'B5 - - G5 - D5 - .',
      '. G5 C6 - E6 - D6 C6', '. A5 C6 - E6 - - C6', 'D6 - C6 A5 - F5 - A5', 'G5 - - - - - . .',
    ],
  },
  // Pedras d'El Rei: praia e família, ao som de um cavaquinho
  praia: {
    bpm: 104, swing: 0.15, lead: 'sine', leadVol: 0.065, arp: 'triangle', arpVol: 0.02, comp: 'x.xx.x.x', compLen: 0.5, bass: 'r...r.f.', bassVol: 0.06,
    drums: { m: 'x.o.x.o.' },
    chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'],
    melody: [
      'G5 - E5 G5 C6 - - G5', 'A5 - E5 A5 C6 - - A5', 'A5 - F5 A5 C6 - D6 C6', 'B5 - G5 - D5 - - .',
      'E6 - C6 E6 G6 - - E6', 'E6 - C6 A5 E6 - - C6', 'F6 - E6 D6 C6 - A5 -', 'G5 - B5 - D6 - . .',
    ],
  },
  // os passeios de barco: uma cantiga de marinheiros, em 6/8
  mar: {
    bpm: 108, div: 3, per: 6, lead: 'square', leadVol: 0.026, leadLen: 0.8, arp: 'sawtooth', arpVol: 0.009, comp: 'x..x.x', bass: 'r..f..', bassVol: 0.065, bassLen: 2.2,
    drums: { b: 'x.....', c: '...o..' },
    chords: ['D', 'G', 'D', 'A', 'D', 'G', 'A', 'D'],
    melody: [
      'F#5 - A5 D6 - A5', 'B5 - D6 G6 - D6', 'A5 - D6 F#6 - D6', 'E6 - C#6 A5 - -',
      'D6 - F#6 A6 - F#6', 'G6 - E6 D6 - B5', 'C#6 - E6 A5 - C#6', 'D6 - - D5 - .',
    ],
  },
  // os telefonemas da Austrália: didgeridoo, paus a marcar o tempo e uma melodia aos saltos
  australia: {
    bpm: 96, gain: 1.6, lead: 'triangle', leadVol: 0.05, leadLen: 0.7, comp: '', bass: 'rrr.rr.r', bassWave: 'sawtooth', bassVol: 0.034, bassLen: 1,
    drums: { x: 'x..x..x.', U: '....o...' },
    chords: ['C'],
    melody: [
      'C5 . E5 . G5 . A5 G5', 'E5 . G5 . C6 - . .', 'A5 . G5 . E5 . D5 E5', 'C5 - . . G5 - . .',
      'C6 . A5 . G5 . E5 G5', 'A5 . C6 . D6 - . .', 'E6 . D6 . C6 . A5 G5', 'C6 - . . C5 - . .',
    ],
  },
  // o Sushi@Home: escala japonesa, em cordas dedilhadas
  japao: {
    bpm: 100, lead: 'triangle', leadVol: 0.055, leadLen: 0.7, arp: 'triangle', arpVol: 0.02, comp: '0...2...', compLen: 2, bass: 'r.......', bassVol: 0.055, bassLen: 6,
    drums: { x: '....o...', U: 'x.....o.' },
    chords: ['Am', 'Am', 'F', 'Am', 'Am', 'F', 'Am', 'Am'],
    melody: [
      'E5 - F5 E5 C5 - B4 -', 'A4 - C5 - E5 - - .', 'F5 - A5 F5 E5 - C5 -', 'B4 - C5 - A4 - - .',
      'A5 - B5 C6 B5 - A5 -', 'F5 - A5 - C6 - A5 F5', 'E5 - F5 E5 C5 - B4 C5', 'A4 - - - E5 - A5 .',
    ],
  },
  // Moçambique: marrabenta, de guitarra saltitante
  marrabenta: {
    bpm: 132, gain: 0.8, lead: 'square', leadVol: 0.026, leadLen: 0.8, arp: 'triangle', arpVol: 0.026, comp: '02120212', compLen: 0.6, bass: 'r..r.f.r', bassVol: 0.06, bassLen: 1,
    drums: { k: 'x..x..x.', m: 'xxxxxxxx', c: '....o...' },
    chords: ['G', 'C', 'D', 'G', 'G', 'C', 'D', 'G'],
    melody: [
      'D6 B5 D6 . G6 - D6 .', 'E6 C6 E6 . G6 - E6 .', 'F#6 D6 A5 . D6 - A5 .', 'B5 D6 G5 - - . . .',
      'G5 B5 D6 . B5 D6 G6 .', 'C6 E6 G6 . E6 - C6 .', 'A5 D6 F#6 . A6 - F#6 D6', 'G6 - D6 - G5 - . .',
    ],
  },
  // a Noruega: flauta e silêncio, entre fiordes
  norte: {
    bpm: 80, lead: 'triangle', leadVol: 0.055, arp: 'sine', arpVol: 0.03, comp: '0.1.2.1.', compLen: 1.8, bass: 'r.......', bassVol: 0.05, bassLen: 7,
    chords: ['Dm', 'C', 'Dm', 'Am', 'Dm', 'C', 'G', 'Dm'],
    melody: [
      'D5 - - A5 - - F5 -', 'E5 - - G5 - - C6 -', 'A5 - - D6 - - C6 A5', 'E5 - - - - - . .',
      'F5 - A5 - D6 - - F6', 'E6 - - C6 - - G5 -', 'B5 - - D6 - - B5 G5', 'A5 - - - D5 - . .',
    ],
  },

  // ----- o dia a dia -----
  // a Bimby e os jantares: cozinha atarefada
  cozinha: {
    bpm: 138, gain: 1.45, lead: 'square', leadVol: 0.027, leadLen: 0.55, arp: 'triangle', arpVol: 0.024, comp: '.x.x.x.x', compLen: 0.5, bass: 'r.f.r.f.', bassVol: 0.06, bassLen: 1,
    drums: { x: '..o...o.', h: 'o.o.o.o.' },
    chords: ['F', 'Bb', 'C', 'F', 'Dm', 'Bb', 'C', 'F'],
    melody: [
      'A5 C6 A5 F5 A5 C6 F6 .', 'D6 Bb5 D6 F6 D6 - Bb5 .', 'G5 C6 E6 C6 G5 C6 E6 .', 'F6 - C6 - A5 - F5 .',
      'F5 A5 D6 A5 F5 A5 D6 .', 'F6 D6 Bb5 D6 F6 - D6 .', 'E6 D6 C6 Bb5 G5 Bb5 C6 E6', 'F6 - . C6 F5 - . .',
    ],
  },
  // o Tomás no rugby: marcha de estádio, com tarola e bombo
  estadio: {
    bpm: 120, lead: 'square', leadVol: 0.03, arp: 'sawtooth', arpVol: 0.01, comp: 'x...x...', compLen: 1.5, bass: 'r.f.r.f.', bassVol: 0.065, bassLen: 1,
    drums: { b: 'x...x...', s: '..x.o.xx', h: 'o.o.o.o.' },
    chords: ['C', 'F', 'C', 'G', 'C', 'F', 'G', 'C'],
    melody: [
      'C5 C5 E5 G5 C6 - G5 -', 'A5 A5 C6 A5 F5 - - .', 'G5 G5 C6 E6 G6 - E6 -', 'D6 - B5 - G5 - - .',
      'E6 - E6 D6 C6 - G5 -', 'A5 - C6 - F6 - - C6', 'D6 D6 B5 G5 D6 - F6 -', 'E6 - C6 - C6 - . .',
    ],
  },
  // eventos e galas: swing de orquestra
  swing: {
    bpm: 132, gain: 1.4, swing: 0.3, lead: 'square', leadVol: 0.026, leadLen: 0.8, arp: 'sawtooth', arpVol: 0.009, comp: '...x..x.', compLen: 0.5, bass: 'r.t.f.t.', bassVol: 0.065, bassLen: 1.2,
    drums: { h: 'x.xox.xo', r: '..x...x.' },
    chords: ['F', 'Dm', 'Gm', 'C', 'F', 'Dm', 'Gm', 'C'],
    melody: [
      'C6 - A5 C6 . F6 - D6', 'A5 - F5 A5 . D6 - .', 'Bb5 - G5 Bb5 . D6 - Bb5', 'G5 - E5 G5 C6 - . .',
      'A5 C6 F6 - . A5 C6 F6', 'A6 - F6 D6 . A5 - .', 'G5 Bb5 D6 - G6 - F6 D6', 'E6 - C6 - G5 - . .',
    ],
  },
  // Lanheses: um vira do Minho, de concertina, bombo e ferrinhos
  minho: {
    bpm: 126, div: 3, per: 6, lead: 'sawtooth', leadVol: 0.022, leadLen: 0.85, arp: 'square', arpVol: 0.01, comp: '.xx.xx', compLen: 0.6, bass: 'r..f..', bassVol: 0.065, bassLen: 1.6,
    drums: { b: 'x.....', g: 'x.xx.x' },
    chords: ['G', 'G', 'D', 'D', 'D', 'D', 'G', 'G'],
    melody: [
      'D6 - B5 D6 - B5', 'G5 - B5 D6 - -', 'C6 - A5 C6 - A5', 'F#5 - A5 D6 - -',
      'E6 - D6 C6 - A5', 'F#5 A5 C6 E6 - D6', 'D6 - B5 G5 - B5', 'G5 - - G6 - .',
    ],
  },
  // o batizado do Micas: órgão de igreja
  igreja: {
    bpm: 72, lead: 'triangle', leadVol: 0.055, arp: 'sine', arpVol: 0.028, comp: 'x...x...', compLen: 3.8, bass: 'r...r...', bassVol: 0.05, bassLen: 3.8,
    chords: ['F', 'Bb', 'F', 'C', 'Dm', 'Bb', 'C', 'F'],
    melody: [
      'A5 - - - C6 - A5 -', 'Bb5 - - - D6 - Bb5 -', 'A5 - C6 - F6 - - -', 'E6 - - - C6 - - -',
      'D6 - - - F6 - D6 -', 'D6 - C6 - Bb5 - - -', 'G5 - Bb5 - C6 - E6 -', 'F6 - - - - - . .',
    ],
  },
  // a paella no catamarã: rumba espanhola, com palmas
  flamenco: {
    bpm: 112, gain: 1.2, lead: 'triangle', leadVol: 0.055, leadLen: 0.85, arp: 'triangle', arpVol: 0.02, comp: 'x..x.xx.', compLen: 0.5, bass: 'r..r..f.', bassVol: 0.06, bassLen: 1.2,
    drums: { c: 'x..x..x.', r: '.oo.oo.o' },
    chords: ['Am', 'G', 'F', 'E', 'Am', 'G', 'F', 'E'],
    melody: [
      'A5 - C6 E6 - C6 A5 -', 'G5 - B5 D6 - B5 G5 -', 'F5 - A5 C6 - A5 F5 -', 'E5 G#5 B5 E6 - D6 C6 B5',
      'E6 - E6 D6 C6 - A5 -', 'D6 - D6 C6 B5 - G5 -', 'C6 - C6 B5 A5 - F5 A5', 'G#5 - B5 - E6 F6 E6 .',
    ],
  },
};

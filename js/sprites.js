// Sprites em pixel art definidos em código (sem ficheiros de imagem).
// Cada letra de uma linha corresponde a uma cor da paleta; '.' é transparente.

export function makeSprite(rows, pal) {
  const w = Math.max(...rows.map((r) => r.length));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = rows.length;
  const g = c.getContext('2d');
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  });
  return c;
}

export function flip(src) {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d');
  g.translate(src.width, 0);
  g.scale(-1, 1);
  g.drawImage(src, 0, 0);
  return c;
}

// ---------- Personagens ----------
// 16x24 píxeis, virados para a direita. Legenda:
// o contorno · h cabelo · H madeixa · v cabelo comprido atrás · s pele · d barba (igual à pele = sem barba) · c corado
// e olhos · m boca · q/Q touca · t roupa · T sombra da roupa · k camisa/gravata · p calças · b sapatos
const MULHER = {
  upper: [
    '................',
    '................',
    '................',
    '....oooooooo....',
    '...ovvvhhhhho...',
    '..ovvhHHhhhhho..',
    '..ovhHhhhhhhho..',
    '..ovhhhhssssho..',
    '..ovhhssssssso..',
    '..ovhsssesseso..',
    '..ovhsssesseso..',
    '..ovhsssssscso..',
    '..ovhosssmmso...',
    '..ovhooooooo....',
    '..ovotttttto....',
    '..ovottttttso...',
    '...ootttttto....',
    '....otttttto....',
    '...otttttttto...',
    '..otttttttttto..',
    '..oTTTTTTTTTTo..',
  ],
  // chapéu, gorro ou véu (substitui estas linhas do cabelo quando a roupa tem `cap`)
  cap: { 4: '...oqqqqqqqqo...', 5: '..oqqqqqqqqqqo..', 6: '..oQQQQQQQQQQo..' },
  legs: {
    stand: ['..ooossoossooo..', '....obboobbo....', '....oooooooo....'],
    a: ['..ooossoossooo..', '...obbo.obbbo...', '...oooo.ooooo...'],
    b: ['..ooooossooooo..', '.....obbbbo.....', '.....oooooo.....'],
  },
};

const HOMEM = {
  upper: [
    '................',
    '....oooooooo....',
    '...ohhhhhhhho...',
    '..ohhhhhhhhhho..',
    '..ohhhhhhhhhho..',
    '..ohhhhsssssso..',
    '..ohhsssssssso..',
    '..ohssssesseso..',
    '..ohssssesseso..',
    '..ohdsssssssso..',
    '...odddddmmdo...',
    '....oooooooo....',
    '....ottkktto....',
    '...otttkkttto...',
    '...osttttttso...',
    '...osttttttso...',
    '....otttttto....',
    '....oppppppo....',
  ],
  cap: { 2: '...oqqqqqqqqo...', 3: '..oqqqqqqqqqqo..', 4: '..oQQQQQQQQQQo..' },
  legs: {
    stand: ['....oppppppo....', '....oppooppo....', '....oppooppo....', '....oppooppo....', '....obboobbo....', '....oooooooo....'],
    a: ['....oppppppo....', '...oppo.oppo....', '..oppo...oppo...', '..obbo...obbo...', '..oooo...obbbo..', '.........ooooo..'],
    b: ['....oppppppo....', '.....oppppo.....', '.....oppppo.....', '.....oppppo.....', '.....obbbbo.....', '.....oooooo.....'],
    // de joelhos (para o pedido de casamento): o boneco fica mais baixo
    kneel: ['....oppppppoo...', '..oppooopppppo..', '..obbbo..obbbo..', '..ooooo..ooooo..'],
  },
};

// Crianças (mais pequenas do que os adultos). k = fita do cabelo (menina, de cabelo comprido) / gola (menino);
// w = blusa (mangas e peito, por baixo das alças do vestido).
const MENINA = {
  upper: [
    '................',
    '....oooooo......',
    '...ohhkhhho.....',
    '..ohhhkhhhho....',
    '.ohhhsssssho....',
    '.ohhsssesseo....',
    '.ohhssssscso....',
    '.ohhssssmmo.....',
    '.ohhoooooo......',
    '.ohhwtwwtwo.....',
    '.ohwwttttwwo....',
    '..ootttttto.....',
    '..oTTTTTTTTo....',
  ],
  legs: {
    stand: ['....oso.oso.....', '....obo.obo.....', '....ooo.ooo.....'],
    a: ['...oso...oso....', '...obo...obbo...', '...ooo...oooo...'],
    b: ['.....ososo......', '.....obbbo......', '.....ooooo......'],
  },
};
const MENINO = {
  upper: [
    '................',
    '................',
    '....oooooo......',
    '...ohhhhhho.....',
    '..ohhhhhhhho....',
    '..ohhsssssso....',
    '..ohssesseso....',
    '..ohsssssscso...',
    '...ossssmmo.....',
    '....oooooo......',
    '...ottkktto.....',
    '..osttttttso....',
    '...otttttto.....',
  ],
  legs: {
    stand: ['....opo.opo.....', '....obo.obo.....', '....ooo.ooo.....'],
    a: ['...opo...opo....', '...obo...obbo...', '...ooo...oooo...'],
    b: ['.....opopo......', '.....obbbo......', '.....ooooo......'],
  },
};

// Penteados (linhas do boneco de mulher que mudam): cabelo ondulado e franja.
const ONDAS = { 10: '.ovvhsssesseso..', 12: '.ovvhosssmmso...', 14: '.ovvotttttto....' };
const FRANJA = { 7: '..ovhhhhhhhhho..', 8: '..ovhhhshshsso..' };
// Camisa às flores (linhas do boneco de homem): k = as flores.
const FLORES = { 13: '...otkttttkto...', 14: '...ostkttktso...', 15: '...osttkttkso...', 16: '....otkttkto....' };
// Camisola de rugby às riscas (linhas do boneco de homem): k = risca branca.
const RUGBY = { 12: '....ottkktto....', 13: '...okkkkkkkko...', 14: '...osttttttso...', 15: '...oskkkkkkso...', 16: '....otttttto....' };
const BASE = { o: '#2b1d2e', s: '#f6c9a0', c: '#f09a8c', e: '#2b1d2e', m: '#c2544c' };
const F = MULHER, M = HOMEM, GIRL = MENINA, BOY = MENINO;
const NOBEARD = '#f6c9a0';
const RALA = '#c9a084';      // barba rala: só uma sombra no queixo
const FARDA = { t: '#3f62b8', T: '#2f4a94', w: '#ffffff', b: '#2b1d2e' };   // a farda do colégio: vestido azul de alças sobre blusa branca

// O ELENCO. Aspeto de cada personagem: cores base (cabelo h/H/v, olhos e, pele s, barba d) e roupa
// por ocasião (mulheres e meninas: t roupa, T bainha, b sapatos · homens e meninos: t camisola,
// k gola, p calças, b sapatos · q/Q chapéu, com cap: true · shades: true = óculos escuros). Uma roupa também pode mudar o cabelo
// (por exemplo, grisalho nos níveis mais recentes). `rows` muda o penteado (ONDAS, FRANJA).
// Para ajustar a cor do cabelo, dos olhos ou da roupa de alguém, basta mudar aqui.
export const LOOKS = {
  // ----- a Inês, em várias idades -----
  inesc: { def: GIRL, base: { h: '#4a2f1e', s: '#efbd94', e: '#4a3a2a', k: '#a8324a' }, outfits: {
    farda: FARDA,
    casual: { t: '#ff8ab8', T: '#e0669a', w: '#ff8ab8', b: '#ffffff' } } },
  ines: { def: F, rows: ONDAS, base: { h: '#4a2f1e', H: '#6b4630', v: '#4a2f1e', s: '#efbd94', e: '#4a3a2a' }, outfits: {
    casual: { t: '#e0527a', T: '#b83a62', b: '#2b1d2e' },
    teen: { t: '#7ec8f0', T: '#4a8ac0', b: '#ffffff' },           // liceu, anos 2000
    night: { t: '#2b2540', T: '#ff5d8f', b: '#c9c9d8' },          // de sair à noite
    praia: { t: '#ff8a4b', T: '#ffd166', b: '#efbd94' },          // vestido de praia, descalça
    work: { t: '#3f9f6a', T: '#2f7f52', b: '#2b1d2e' },           // no escritório (verde Bimby)
    inverno: { t: '#c0392b', T: '#96281b', b: '#5a3a22', q: '#fff6e6', Q: '#c0392b', cap: true },   // casaco e gorro
    bata: { t: '#ffc6de', T: '#e89ab8', b: '#ffffff' },           // na maternidade
    barco: { t: '#ffffff', T: '#e4e6f0', b: '#efbd94' },          // o dia do pedido: de branco, descalça
    festa: { t: '#ffd166', T: '#e0a820', b: '#c0392b' } } },      // a festa dos 40 anos
  // ----- os pais e os irmãos da Inês: irma1 = Sofia, irma2 = Maria, irmao = Zé Inácio, irmao2 = Kiko -----
  tio: { def: M, base: { h: '#d8b25a', d: NOBEARD, e: '#3f7fd0' }, outfits: {
    casual: { t: '#b8862e', k: '#fff6e6', p: '#5a4630', b: '#2b1d2e' },                               // 1986
    hoje: { t: '#5a7fb5', k: '#ffffff', p: '#4a4458', b: '#2b1d2e', h: '#f6c9a0' } } },                 // já careca
  tiafatima: { def: F, base: { h: '#4a2f1e', H: '#6b4630', v: '#4a2f1e', e: '#4a3a2a' }, outfits: {
    casual: { t: '#8a5ac0', T: '#6a3fa0', b: '#2b1d2e' },                                             // 1986
    hoje: { t: '#2f7f8a', T: '#256670', b: '#2b1d2e', h: '#9a8a7a', H: '#b8a898', v: '#9a8a7a' } } },
  irma1: { def: F, base: { h: '#d8b25a', H: '#f0d088', v: '#d8b25a', e: '#3f7fd0' }, outfits: { casual: { t: '#4f9a5a', T: '#3f7f48', b: '#2b1d2e' }, festa: { t: '#3fa6a0', T: '#2f8680', b: '#2b1d2e' } } },
  irma2: { def: F, base: { h: '#cfa650', H: '#e8c880', v: '#cfa650', e: '#3f7fd0' }, outfits: { casual: { t: '#ff8a6a', T: '#e06a4a', b: '#7a2e2a' }, festa: { t: '#c79bff', T: '#a878e0', b: '#2b1d2e' } } },
  irmao: { def: M, base: { h: '#4a2f1e', d: NOBEARD, e: '#4a3a2a' }, outfits: { casual: { t: '#5a8fd0', k: '#5a8fd0', p: '#3b4a7a', b: '#2b1d2e' }, festa: { t: '#f2f2f7', k: '#f2f2f7', p: '#2a3358', b: '#111122' } } },
  irmao2: { def: M, base: { h: '#c8a468', d: NOBEARD, e: '#3f7fd0' }, outfits: { casual: { t: '#3fa672', k: '#3fa672', p: '#5a4a3a', b: '#2b1d2e' }, festa: { t: '#a8324a', k: '#ffffff', p: '#2a3358', b: '#111122' } } },
  // ----- o Lourenço -----
  lourenco: { def: M, base: { h: '#4a3020', s: '#ecb48a', d: NOBEARD, e: '#55803f' }, outfits: {
    casual: { t: '#3f6fb5', k: '#3f6fb5', p: '#3a3f55', b: '#2b1d2e', d: '#7a5a44' },
    teen: { t: '#f2f2f7', k: '#c0392b', p: '#4a6a9a', b: '#ffffff' },                                 // liceu
    night: { t: '#2b2b3a', k: '#2b2b3a', p: '#3a4a6a', b: '#2b1d2e' },
    praia: { t: '#ffd166', k: '#ffd166', p: '#3fa6a0', b: '#eebb8e' },
    aussie: { t: '#c9a86a', k: '#c9a86a', p: '#7a6a4a', b: '#5a3a22', q: '#a8884a', Q: '#5a3a22', cap: true, d: '#7a5a44' },   // na Austrália, de chapéu
    sushi: { t: '#1c1c28', k: '#c0392b', p: '#1c1c28', b: '#111122', q: '#ffffff', Q: '#c0392b', cap: true, d: '#7a5a44' },    // a fazer sushi
    grelha: { t: '#ffffff', k: '#c0392b', p: '#3a3f55', b: '#2b1d2e', d: '#7a5a44' },                 // avental de churrasco
    inverno: { t: '#2f6a8a', k: '#ffd166', p: '#2b2b3a', b: '#5a3a22', q: '#2f6a8a', Q: '#1f4a6a', cap: true, d: '#7a5a44' },
    bata: { t: '#3fae8a', k: '#3fae8a', p: '#3fae8a', b: '#ffffff', q: '#3fae8a', Q: '#2f8a6c', cap: true, d: '#7a5a44' },
    barco: { t: '#f29ab0', k: '#fff2f5', p: '#b9a878', b: '#ecb48a', d: '#7a5a44', rows: FLORES },   // o dia do pedido: camisa cor-de-rosa às flores
    festa: { t: '#2a3358', k: '#ffffff', p: '#2a3358', b: '#111122', d: '#7a5a44' } } },
  // ----- as amigas do colégio (em pequenas, de farda) -----
  anac: { def: GIRL, base: { h: '#6b4630', e: '#4a3a2a', k: '#a8324a' }, outfits: { farda: FARDA } },
  maisac: { def: GIRL, base: { h: '#4a2f1e', e: '#4a3a2a', k: '#a8324a' }, outfits: { farda: FARDA } },
  softc: { def: GIRL, base: { h: '#7a5236', e: '#55803f', k: '#a8324a' }, outfits: { farda: FARDA } },
  isabelc: { def: GIRL, base: { h: '#a87a4a', e: '#4a3a2a', k: '#a8324a' }, outfits: { farda: FARDA } },
  // ----- as amigas e os amigos, já crescidos -----
  ana: { def: F, rows: ONDAS, base: { h: '#6b4630', H: '#a87a4a', v: '#6b4630', s: '#efbd94', e: '#4a3a2a' }, outfits: {
    casual: { t: '#5a8fd0', T: '#3f6fb0', b: '#2b1d2e' }, teen: { t: '#ff8a6a', T: '#e06a4a', b: '#ffffff' }, night: { t: '#c0392b', T: '#96281b', b: '#2b1d2e' },
    praia: { t: '#3fa6a0', T: '#ffffff', b: '#efbd94' }, festa: { t: '#3f6fb5', T: '#2f5795', b: '#2b1d2e' } } },
  maisa: { def: F, rows: FRANJA, base: { h: '#5a3a26', H: '#7a5236', v: '#5a3a26', e: '#4a3a2a' }, outfits: {
    casual: { t: '#ffb347', T: '#e09030', b: '#2b1d2e' }, night: { t: '#7a3fa0', T: '#5a2f80', b: '#2b1d2e' },
    praia: { t: '#ff5d8f', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#ff8a4b', T: '#e06a2b', b: '#2b1d2e' } } },
  soft: { def: F, base: { h: '#7a5236', H: '#96704a', v: '#7a5236', e: '#55803f' }, outfits: {
    casual: { t: '#7be0b0', T: '#4fb888', b: '#2b1d2e' }, teen: { t: '#ffd166', T: '#e0a820', b: '#ffffff' }, night: { t: '#3fa6a0', T: '#2f8680', b: '#2b1d2e' },
    praia: { t: '#ffd166', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#4fb888', T: '#3f9870', b: '#2b1d2e' } } },
  isabel: { def: F, base: { h: '#a87a4a', H: '#d0a870', v: '#a87a4a', e: '#4a3a2a' }, outfits: {
    casual: { t: '#f29ac0', T: '#d877a3', b: '#2b1d2e' }, teen: { t: '#f29ac0', T: '#d877a3', b: '#ffffff' }, night: { t: '#ff5d8f', T: '#d63f72', b: '#2b1d2e' },
    praia: { t: '#c79bff', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#d877a3', T: '#b85783', b: '#2b1d2e' } } },
  mi: { def: F, base: { h: '#4f3220', H: '#7a5236', v: '#4f3220', e: '#4a3a2a' }, outfits: {
    casual: { t: '#c0392b', T: '#96281b', b: '#2b1d2e' }, teen: { t: '#7be0b0', T: '#4fb888', b: '#ffffff' }, night: { t: '#ffd166', T: '#e0a820', b: '#2b1d2e' },
    praia: { t: '#5a8fd0', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#c0392b', T: '#96281b', b: '#2b1d2e' } } },
  maria: { def: F, base: { h: '#4f3220', H: '#6f4a32', v: '#4f3220', e: '#4a3a2a' }, outfits: {
    casual: { t: '#3fa6a0', T: '#2f8680', b: '#2b1d2e' }, teen: { t: '#5a8fd0', T: '#3f6fb0', b: '#ffffff' }, night: { t: '#f2f2f7', T: '#c9c9d8', b: '#2b1d2e' },
    praia: { t: '#ff8a4b', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#f2f2f7', T: '#c9c9d8', b: '#2b1d2e' } } },
  tete: { def: F, base: { h: '#2f2018', H: '#4a3628', v: '#2f2018', e: '#4a3a2a' }, outfits: {
    casual: { t: '#ff8a4b', T: '#e06a2b', b: '#2b1d2e' }, teen: { t: '#ff5d8f', T: '#d63f72', b: '#ffffff' }, night: { t: '#5a8fd0', T: '#3f6fb0', b: '#2b1d2e' },
    praia: { t: '#7be0b0', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#7a3fa0', T: '#5a2f80', b: '#2b1d2e' } } },
  pipoca: { def: M, base: { h: '#4a2f1e', d: '#6b4a3a', e: '#4a3a2a' }, outfits: {
    casual: { t: '#ffd166', k: '#ffd166', p: '#3b4a7a', b: '#2b1d2e' }, night: { t: '#5a6aa8', k: '#ffffff', p: '#2a2f4a', b: '#2b1d2e' },
    avental: { t: '#ffffff', k: '#ffd166', p: '#3b4a7a', b: '#2b1d2e' }, festa: { t: '#5a6aa8', k: '#ffffff', p: '#2a2f4a', b: '#111122' } } },
  leal: { def: M, base: { h: '#3a2418', d: '#6b4a3a', e: '#4a3a2a' }, outfits: {
    casual: { t: '#3fa672', k: '#3fa672', p: '#3a3f55', b: '#2b1d2e' }, night: { t: '#f2f2f7', k: '#f2f2f7', p: '#2a2f4a', b: '#2b1d2e' },
    praia: { t: '#ff8a4b', k: '#ff8a4b', p: '#3f6fb5', b: '#eebb8e' }, festa: { t: '#3a3f55', k: '#ffffff', p: '#3a3f55', b: '#111122' } } },
  nuno: { def: M, base: { h: '#b8956a', d: NOBEARD, e: '#3f7fd0' }, outfits: { casual: { t: '#a8324a', k: '#ffffff', p: '#3a3f55', b: '#2b1d2e' }, night: { t: '#2a3358', k: '#ffffff', p: '#2a3358', b: '#111122' }, festa: { t: '#2a3358', k: '#ffffff', p: '#2a3358', b: '#111122' } } },
  ze: { def: M, base: { h: '#6b4a2e', d: NOBEARD }, outfits: { casual: { t: '#7a8a5a', k: '#7a8a5a', p: '#3b4a7a', b: '#2b1d2e' }, bata: { t: '#3fae8a', k: '#3fae8a', p: '#3fae8a', b: '#ffffff', q: '#3fae8a', Q: '#2f8a6c', cap: true } } },
  zebras: { def: M, base: { h: '#4a2f1e', d: '#6b4a36', e: '#4a3a2a' }, outfits: { casual: { t: '#ff8a4b', k: '#ff8a4b', p: '#7a6a4a', b: '#5a3a22' }, praia: { t: '#7be0b0', k: '#7be0b0', p: '#c0392b', b: '#eebb8e' }, festa: { t: '#ff8a4b', k: '#ffffff', p: '#3a3f55', b: '#111122' } } },
  pi: { def: M, base: { h: '#5a3a22', s: '#e0a878', d: NOBEARD, e: '#4a3a2a' }, outfits: { casual: { t: '#f2f2f7', k: '#f2f2f7', p: '#c9a86a', b: '#5a3a22', shades: true }, praia: { t: '#f2f2f7', k: '#f2f2f7', p: '#3f6fb5', b: '#e0a878', shades: true }, festa: { t: '#f2f2f7', k: '#f2f2f7', p: '#c9a86a', b: '#5a3a22', shades: true } } },   // quase sempre de óculos escuros
  // o Kiko (Francisco), namorado da Ana — não confundir com o irmão da Inês, que é o `irmao2`
  kiko: { def: M, base: { h: '#5a3a26', d: NOBEARD, e: '#4a3a2a' }, outfits: {
    casual: { t: '#8fb4e0', k: '#ffffff', p: '#c9a86a', b: '#5a3a22' }, work: { t: '#dfe8f4', k: '#2a3358', p: '#2a3358', b: '#111122' }, festa: { t: '#8fb4e0', k: '#ffffff', p: '#2a3358', b: '#111122' } } },
  moncada: { def: M, base: { h: '#4a3020', d: RALA, e: '#4a3a2a' }, outfits: { casual: { t: '#e0d2b4', k: '#e0d2b4', p: '#3f6fb5', b: '#5a3a22' }, festa: { t: '#e0d2b4', k: '#ffffff', p: '#2a3358', b: '#111122' } } },
  marta: { def: F, base: { h: '#a87a4a', H: '#dcb478', v: '#a87a4a', s: '#efbd94', e: '#55803f' }, outfits: { casual: { t: '#f2f2f7', T: '#ff8a6a', b: '#5a3a22' }, festa: { t: '#ff8a6a', T: '#e06a4a', b: '#2b1d2e' } } },
  gonzaga: { def: M, base: { h: '#33241c', s: '#efbd94', d: '#c09478', e: '#4a3a2a' }, outfits: { casual: { t: '#a8324a', k: '#a8324a', p: '#c9a86a', b: '#5a3a22' }, festa: { t: '#a8324a', k: '#ffffff', p: '#2a3358', b: '#111122' } } },
  carlos: { def: M, base: { h: '#a8a4ac', s: '#e0a878', d: NOBEARD }, outfits: { casual: { t: '#2a3358', k: '#ffffff', p: '#f2f2f7', b: '#5a3a22', q: '#ffffff', Q: '#2a3358', cap: true }, festa: { t: '#2a3358', k: '#ffffff', p: '#f2f2f7', b: '#5a3a22' } } },
  barbara: { def: F, base: { h: '#d8a858', H: '#f0c888', v: '#d8a858' }, outfits: { casual: { t: '#3f9f6a', T: '#2f7f52', b: '#2b1d2e' }, festa: { t: '#ffb347', T: '#e09030', b: '#2b1d2e' } } },
  isabelv: { def: F, base: { h: '#3b2a20', H: '#5a4030', v: '#3b2a20' }, outfits: { casual: { t: '#f2f2f7', T: '#3f9f6a', b: '#2b1d2e' }, festa: { t: '#5a8fd0', T: '#3f6fb0', b: '#2b1d2e' } } },
  // ----- os filhos -----
  tomasc: { def: BOY, base: { h: '#6b4a2e' }, outfits: { casual: { t: '#8fc4ff', k: '#ffffff', p: '#5a8fd0', b: '#ffffff' } } },
  tomas: { def: M, base: { h: '#6b4a2e', d: NOBEARD }, outfits: {
    casual: { t: '#4fb888', k: '#4fb888', p: '#3a3f55', b: '#ffffff' }, teen: { t: '#ff8a4b', k: '#2b2b3a', p: '#4a6a9a', b: '#ffffff' },
    inverno: { t: '#ffb347', k: '#2b2b3a', p: '#2b2b3a', b: '#5a3a22', q: '#2b2b3a', Q: '#ffb347', cap: true }, festa: { t: '#f2f2f7', k: '#4fb888', p: '#3a3f55', b: '#111122' },
    rugby: { t: '#2f8a4a', k: '#ffffff', p: '#f2f2f7', b: '#111122', rows: RUGBY } } },                 // equipamento da Agronomia
  // ----- figurantes -----
  freira: { def: F, base: { h: '#8a8794', H: '#8a8794', v: '#1c1c28' }, outfits: { casual: { t: '#1c1c28', T: '#1c1c28', b: '#111122', q: '#1c1c28', Q: '#ffffff', cap: true } } },
  professora: { def: F, base: { h: '#9a5a3a', H: '#b87a52', v: '#9a5a3a' }, outfits: { casual: { t: '#b8862e', T: '#96691e', b: '#2b1d2e' } } },
  porteiro: { def: M, base: { h: '#eebb8e', s: '#eebb8e', d: '#eebb8e' }, outfits: { casual: { t: '#1c1c28', k: '#1c1c28', p: '#1c1c28', b: '#111122' } } },   // careca, todo de preto
  mico: { def: M, base: { h: '#b8b4c0', d: '#b8b4c0' }, outfits: { casual: { t: '#f2f2f7', k: '#f2f2f7', p: '#2b2b3a', b: '#111122' } } },
  avo: { def: M, base: { h: '#eceaf2', d: '#eceaf2' }, outfits: { casual: { t: '#7a8a5a', k: '#fff6e6', p: '#6b5a3e', b: '#5a3a22' }, pijama: { t: '#a8c8f0', k: '#ffffff', p: '#a8c8f0', b: '#8a5a34' } } },
  pescador: { def: M, base: { h: '#5a5a66', s: '#d89a6a', d: '#8a8794' }, outfits: { casual: { t: '#ffd23e', k: '#ffd23e', p: '#3a4a6a', b: '#2b2b3a', q: '#2a3358', Q: '#1f2a48', cap: true } } },
  gnr: { def: M, base: { h: '#3b2a20', d: NOBEARD }, outfits: { casual: { t: '#4a6a4a', k: '#ffffff', p: '#3a523a', b: '#111122', q: '#3a523a', Q: '#2b1d2e', cap: true } } },
  empregado: { def: M, base: { h: '#2b2b3a', d: NOBEARD }, outfits: { casual: { t: '#f2f2f7', k: '#2b2b3a', p: '#2b2b3a', b: '#111122' } } },
  parteira: { def: F, base: { h: '#2b2b3a', H: '#4a4a5e', v: '#2b2b3a' }, outfits: { casual: { t: '#f29ac0', T: '#d877a3', b: '#ffffff', q: '#f29ac0', Q: '#d877a3', cap: true } } },
  padre: { def: M, base: { h: '#8a8794', d: NOBEARD }, outfits: { casual: { t: '#f2f2f7', k: '#7a3fa0', p: '#f2f2f7', b: '#111122' } } },
  musico: { def: M, base: { h: '#3b2a20', d: NOBEARD }, outfits: { casual: { t: '#c0392b', k: '#ffffff', p: '#2b2b3a', b: '#111122' }, b: { t: '#2f6f8a', k: '#ffffff', p: '#2b2b3a', b: '#111122', h: '#8a8794' } } },   // músicos do arraial
  adversario: { def: M, base: { h: '#3b2a20', d: NOBEARD }, outfits: { casual: { t: '#2a3358', k: '#ffd166', p: '#2a3358', b: '#111122', rows: RUGBY }, b: { t: '#2a3358', k: '#ffd166', p: '#2a3358', b: '#111122', rows: RUGBY, h: '#c8a468' } } },   // a outra equipa, no rugby
  cantora: { def: F, rows: ONDAS, base: { h: '#2b2b3a', H: '#4a4a5e', v: '#2b2b3a' }, outfits: { casual: { t: '#c0392b', T: '#96281b', b: '#111122' } } },   // a voz da banda, na festa
  sambista: { def: M, base: { h: '#2b2b3a', s: '#b8794a', d: '#b8794a' }, outfits: { casual: { t: '#ffd23e', k: '#3fa672', p: '#f2f2f7', b: '#f2f2f7', q: '#f2f2f7', Q: '#2b2b3a', cap: true } } },
};

const cache = new Map();
// nomes de todas as personagens pedidas (os testes usam isto para ver quem aparece em cada nível)
export const seen = new Set();
// pedidos de personagens ou roupas que não existem (ficam com o aspeto por omissão; os testes avisam)
export const missing = new Set();

// Devolve os fotogramas { stand, a, b } de uma personagem, cada um com versão direita (r) e esquerda (l).
// Um asterisco no fim da roupa ('casual*') põe óculos de sol a qualquer personagem.
export function getCharacter(name, outfit = 'casual') {
  const key = name + ':' + outfit, sol = outfit.endsWith('*');
  if (sol) outfit = outfit.slice(0, -1);
  seen.add(name);
  if (cache.has(key)) return cache.get(key);
  if (!LOOKS[name]) missing.add(name);
  else if (!LOOKS[name].outfits[outfit]) missing.add(name + ':' + outfit);
  const look = LOOKS[name] || LOOKS.ines;
  const { cap, shades, rows, ...clothes } = look.outfits[outfit] || look.outfits.casual;
  const pal = { ...BASE, ...look.base, ...clothes };
  let upper = look.rows ? look.def.upper.map((row, i) => look.rows[i] || row) : look.def.upper;
  if (rows) upper = upper.map((row, i) => rows[i] || row);     // a roupa também pode mudar linhas (riscas)
  if (cap) upper = upper.map((row, i) => look.def.cap[i] || row);
  // óculos escuros (tipo Wayfarer): duas lentes com reflexo, a ponte entre elas e a haste até à orelha
  if (shades || sol) {
    pal.g = '#111122'; pal.G = '#7f93b8';
    let n = 0;
    upper = upper.map((row) => {
      const a = row.indexOf('e'), b = row.lastIndexOf('e');
      if (a < 0) return row;
      const c = row.split('');
      if (n++ === 0) { for (let x = a - 3; x <= b; x++) c[x] = 'g'; c[a] = 'G'; c[b] = 'G'; }   // armação, de fora a fora
      else { c[a - 1] = 'g'; c[a] = 'g'; c[b - 1] = 'g'; c[b] = 'g'; }                          // as duas lentes
      return c.join('');
    });
  }
  const frames = {};
  for (const leg of Object.keys(look.def.legs)) {
    const img = makeSprite([...upper, ...look.def.legs[leg]], pal);
    frames[leg] = { r: img, l: flip(img) };
  }
  cache.set(key, frames);
  return frames;
}

const CYCLE = ['a', 'stand', 'b', 'stand'];
export function charFrame(frames, facing, moving, air, dist) {
  let leg = 'stand';
  if (air) leg = 'a';
  else if (moving) leg = CYCLE[Math.floor(dist / 7) % 4];
  return frames[leg][facing < 0 ? 'l' : 'r'];
}

// ---------- Objetos ----------
const HEART = [
  '..oo.oo..',
  '.orrorro.',
  'orwrrrrro',
  'orrrrrrro',
  '.orrrrro.',
  '..orrro..',
  '...oro...',
  '....o....',
];

let sprites = null;
export function getSprites() {
  if (!sprites) {
    sprites = {
      heart: makeSprite(HEART, { o: '#2b1d2e', r: '#ff5d8f', w: '#ffffff' }),
      heartOff: makeSprite(HEART, { o: '#2b1d2e', r: '#9a93ad', w: '#d8d3e6' }),
    };
  }
  return sprites;
}

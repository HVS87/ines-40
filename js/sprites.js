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

// Crianças (mais pequenas do que os adultos). k = laços do cabelo (menina) / gola (menino).
const MENINA = {
  upper: [
    '................',
    '....oooooo......',
    '...ohhhhhho.....',
    '.kohhhhhhhhok...',
    '.kohhssssshok...',
    '..ohsssesseo....',
    '..ohssssscso....',
    '...ossssmmo.....',
    '....oooooo......',
    '...otttttto.....',
    '..osttttttso....',
    '...otttttto.....',
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

const BASE = { o: '#2b1d2e', s: '#f6c9a0', c: '#f09a8c', e: '#2b1d2e', m: '#c2544c' };
const F = MULHER, M = HOMEM, GIRL = MENINA, BOY = MENINO;
const NOBEARD = '#f6c9a0';
const FARDA = { t: '#2a3a6a', T: '#1f2c52', b: '#2b1d2e' };   // a farda do colégio (cores por confirmar)

// O ELENCO. Aspeto de cada personagem: cores base (cabelo h/H/v, olhos e, pele s, barba d) e roupa
// por ocasião (mulheres e meninas: t roupa, T bainha, b sapatos · homens e meninos: t camisola,
// k gola, p calças, b sapatos · q/Q chapéu, com cap: true). Uma roupa também pode mudar o cabelo
// (por exemplo, grisalho nos níveis mais recentes).
// Para ajustar a cor do cabelo, dos olhos ou da roupa de alguém, basta mudar aqui.
export const LOOKS = {
  // ----- a Inês, em várias idades -----
  inesc: { def: GIRL, base: { h: '#6b4226', e: '#4a3a2a', k: '#a8324a' }, outfits: {
    farda: FARDA,
    casual: { t: '#ff8ab8', T: '#e0669a', b: '#ffffff' } } },
  ines: { def: F, base: { h: '#6b4226', H: '#8a5a34', v: '#6b4226', e: '#4a3a2a' }, outfits: {
    casual: { t: '#e0527a', T: '#b83a62', b: '#2b1d2e' },
    teen: { t: '#7ec8f0', T: '#4a8ac0', b: '#ffffff' },           // liceu, anos 2000
    night: { t: '#2b2540', T: '#ff5d8f', b: '#c9c9d8' },          // de sair à noite
    praia: { t: '#ff8a4b', T: '#ffd166', b: '#f6c9a0' },          // vestido de praia, descalça
    work: { t: '#3f9f6a', T: '#2f7f52', b: '#2b1d2e' },           // no escritório (verde Bimby)
    inverno: { t: '#c0392b', T: '#96281b', b: '#5a3a22', q: '#fff6e6', Q: '#c0392b', cap: true },   // casaco e gorro
    bata: { t: '#ffc6de', T: '#e89ab8', b: '#ffffff' },           // na maternidade
    festa: { t: '#ffd166', T: '#e0a820', b: '#c0392b' } } },      // a festa dos 40 anos
  // ----- os pais e os irmãos da Inês -----
  tio: { def: M, base: { h: '#3b2a20', d: '#3b2a20' }, outfits: {
    casual: { t: '#b8862e', k: '#fff6e6', p: '#5a4630', b: '#2b1d2e' },                               // 1986
    hoje: { t: '#5a7fb5', k: '#ffffff', p: '#4a4458', b: '#2b1d2e', h: '#a8a4ac', d: '#a8a4ac' } } },
  tiafatima: { def: F, base: { h: '#4a2f1e', H: '#6b4630', v: '#4a2f1e', e: '#4a3a2a' }, outfits: {
    casual: { t: '#8a5ac0', T: '#6a3fa0', b: '#2b1d2e' },                                             // 1986
    hoje: { t: '#2f7f8a', T: '#256670', b: '#2b1d2e', h: '#9a8a7a', H: '#b8a898', v: '#9a8a7a' } } },
  irma1: { def: F, base: { h: '#7a4f2e', H: '#a87446', v: '#7a4f2e' }, outfits: { casual: { t: '#4f9a5a', T: '#3f7f48', b: '#2b1d2e' }, festa: { t: '#3fa6a0', T: '#2f8680', b: '#2b1d2e' } } },
  irma2: { def: F, base: { h: '#5a3a22', H: '#7a5236', v: '#5a3a22' }, outfits: { casual: { t: '#ff8a6a', T: '#e06a4a', b: '#7a2e2a' }, festa: { t: '#c79bff', T: '#a878e0', b: '#2b1d2e' } } },
  irmao: { def: M, base: { h: '#5a3a22', d: NOBEARD }, outfits: { casual: { t: '#5a8fd0', k: '#5a8fd0', p: '#3b4a7a', b: '#2b1d2e' }, festa: { t: '#f2f2f7', k: '#f2f2f7', p: '#2a3358', b: '#111122' } } },
  // ----- o Lourenço -----
  lourenco: { def: M, base: { h: '#3b2a20', d: NOBEARD }, outfits: {
    casual: { t: '#3f6fb5', k: '#3f6fb5', p: '#3a3f55', b: '#2b1d2e', d: '#8a6a52' },
    teen: { t: '#f2f2f7', k: '#c0392b', p: '#4a6a9a', b: '#ffffff' },                                 // liceu
    night: { t: '#2b2b3a', k: '#2b2b3a', p: '#3a4a6a', b: '#2b1d2e' },
    praia: { t: '#ffd166', k: '#ffd166', p: '#3fa6a0', b: '#eebb8e' },
    aussie: { t: '#c9a86a', k: '#c9a86a', p: '#7a6a4a', b: '#5a3a22', q: '#a8884a', Q: '#5a3a22', cap: true, d: '#8a6a52' },   // na Austrália, de chapéu
    sushi: { t: '#1c1c28', k: '#c0392b', p: '#1c1c28', b: '#111122', q: '#ffffff', Q: '#c0392b', cap: true, d: '#8a6a52' },    // a fazer sushi
    grelha: { t: '#ffffff', k: '#c0392b', p: '#3a3f55', b: '#2b1d2e', d: '#8a6a52' },                 // avental de churrasco
    inverno: { t: '#2f6a8a', k: '#ffd166', p: '#2b2b3a', b: '#5a3a22', q: '#2f6a8a', Q: '#1f4a6a', cap: true, d: '#8a6a52' },
    bata: { t: '#3fae8a', k: '#3fae8a', p: '#3fae8a', b: '#ffffff', q: '#3fae8a', Q: '#2f8a6c', cap: true, d: '#8a6a52' },
    festa: { t: '#2a3358', k: '#ffffff', p: '#2a3358', b: '#111122', d: '#8a6a52' } } },
  // ----- as amigas do colégio (em pequenas, de farda) -----
  anac: { def: GIRL, base: { h: '#c9985a', k: '#a8324a' }, outfits: { farda: FARDA } },
  maisac: { def: GIRL, base: { h: '#2b2b3a', k: '#a8324a' }, outfits: { farda: FARDA } },
  softc: { def: GIRL, base: { h: '#a8562e', k: '#a8324a' }, outfits: { farda: FARDA } },
  isabelc: { def: GIRL, base: { h: '#8a5f3a', k: '#a8324a' }, outfits: { farda: FARDA } },
  // ----- as amigas e os amigos, já crescidos -----
  ana: { def: F, base: { h: '#c9985a', H: '#e8c088', v: '#c9985a', e: '#55703f' }, outfits: {
    casual: { t: '#5a8fd0', T: '#3f6fb0', b: '#2b1d2e' }, teen: { t: '#ff8a6a', T: '#e06a4a', b: '#ffffff' }, night: { t: '#c0392b', T: '#96281b', b: '#2b1d2e' },
    praia: { t: '#3fa6a0', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#3f6fb5', T: '#2f5795', b: '#2b1d2e' } } },
  maisa: { def: F, base: { h: '#2b2b3a', H: '#4a4a5e', v: '#2b2b3a' }, outfits: {
    casual: { t: '#ffb347', T: '#e09030', b: '#2b1d2e' }, teen: { t: '#c79bff', T: '#a878e0', b: '#ffffff' }, night: { t: '#7a3fa0', T: '#5a2f80', b: '#2b1d2e' },
    praia: { t: '#ff5d8f', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#ff8a4b', T: '#e06a2b', b: '#2b1d2e' } } },
  soft: { def: F, base: { h: '#a8562e', H: '#c9764a', v: '#a8562e', e: '#55703f' }, outfits: {
    casual: { t: '#7be0b0', T: '#4fb888', b: '#2b1d2e' }, teen: { t: '#ffd166', T: '#e0a820', b: '#ffffff' }, night: { t: '#3fa6a0', T: '#2f8680', b: '#2b1d2e' },
    praia: { t: '#ffd166', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#4fb888', T: '#3f9870', b: '#2b1d2e' } } },
  isabel: { def: F, base: { h: '#8a5f3a', H: '#b08050', v: '#8a5f3a' }, outfits: {
    casual: { t: '#f29ac0', T: '#d877a3', b: '#2b1d2e' }, teen: { t: '#f29ac0', T: '#d877a3', b: '#ffffff' }, night: { t: '#ff5d8f', T: '#d63f72', b: '#2b1d2e' },
    praia: { t: '#c79bff', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#d877a3', T: '#b85783', b: '#2b1d2e' } } },
  mi: { def: F, base: { h: '#e0b86a', H: '#f5d898', v: '#e0b86a', e: '#3f6fb5' }, outfits: {
    casual: { t: '#c0392b', T: '#96281b', b: '#2b1d2e' }, teen: { t: '#7be0b0', T: '#4fb888', b: '#ffffff' }, night: { t: '#ffd166', T: '#e0a820', b: '#2b1d2e' },
    praia: { t: '#5a8fd0', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#c0392b', T: '#96281b', b: '#2b1d2e' } } },
  maria: { def: F, base: { h: '#4a2f1e', H: '#6b4630', v: '#4a2f1e' }, outfits: {
    casual: { t: '#3fa6a0', T: '#2f8680', b: '#2b1d2e' }, teen: { t: '#5a8fd0', T: '#3f6fb0', b: '#ffffff' }, night: { t: '#f2f2f7', T: '#c9c9d8', b: '#2b1d2e' },
    praia: { t: '#ff8a4b', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#f2f2f7', T: '#c9c9d8', b: '#2b1d2e' } } },
  tete: { def: F, base: { h: '#1f1a2a', H: '#3a3550', v: '#1f1a2a' }, outfits: {
    casual: { t: '#ff8a4b', T: '#e06a2b', b: '#2b1d2e' }, teen: { t: '#ff5d8f', T: '#d63f72', b: '#ffffff' }, night: { t: '#5a8fd0', T: '#3f6fb0', b: '#2b1d2e' },
    praia: { t: '#7be0b0', T: '#ffffff', b: '#f6c9a0' }, festa: { t: '#7a3fa0', T: '#5a2f80', b: '#2b1d2e' } } },
  pipoca: { def: M, base: { h: '#5a3a22', d: NOBEARD }, outfits: {
    casual: { t: '#ffd166', k: '#ffd166', p: '#3b4a7a', b: '#2b1d2e' }, teen: { t: '#ff8a4b', k: '#ff8a4b', p: '#4a6a9a', b: '#ffffff' }, night: { t: '#5a6aa8', k: '#ffffff', p: '#2a2f4a', b: '#2b1d2e' },
    avental: { t: '#ffffff', k: '#ffd166', p: '#3b4a7a', b: '#2b1d2e' }, festa: { t: '#5a6aa8', k: '#ffffff', p: '#2a2f4a', b: '#111122' } } },
  leal: { def: M, base: { h: '#1f1a2a', d: '#4a4458' }, outfits: {
    casual: { t: '#3fa672', k: '#3fa672', p: '#3a3f55', b: '#2b1d2e' }, night: { t: '#f2f2f7', k: '#f2f2f7', p: '#2a2f4a', b: '#2b1d2e' },
    praia: { t: '#ff8a4b', k: '#ff8a4b', p: '#3f6fb5', b: '#eebb8e' }, festa: { t: '#3a3f55', k: '#ffffff', p: '#3a3f55', b: '#111122' } } },
  nuno: { def: M, base: { h: '#8a6a3a', d: NOBEARD }, outfits: { casual: { t: '#a8324a', k: '#ffffff', p: '#3a3f55', b: '#2b1d2e' }, night: { t: '#2a3358', k: '#ffffff', p: '#2a3358', b: '#111122' }, festa: { t: '#2a3358', k: '#ffffff', p: '#2a3358', b: '#111122' } } },
  ze: { def: M, base: { h: '#6b4a2e', d: NOBEARD }, outfits: { casual: { t: '#7a8a5a', k: '#7a8a5a', p: '#3b4a7a', b: '#2b1d2e' }, bata: { t: '#3fae8a', k: '#3fae8a', p: '#3fae8a', b: '#ffffff', q: '#3fae8a', Q: '#2f8a6c', cap: true } } },
  zebras: { def: M, base: { h: '#2b2b3a', d: '#2b2b3a' }, outfits: { casual: { t: '#ff8a4b', k: '#ff8a4b', p: '#7a6a4a', b: '#5a3a22' }, praia: { t: '#7be0b0', k: '#7be0b0', p: '#c0392b', b: '#eebb8e' }, festa: { t: '#ff8a4b', k: '#ffffff', p: '#3a3f55', b: '#111122' } } },
  pi: { def: M, base: { h: '#8a5f3a', s: '#e0a878', d: '#8a5f3a' }, outfits: { casual: { t: '#f2f2f7', k: '#f2f2f7', p: '#c9a86a', b: '#5a3a22', q: '#e8d8a8', Q: '#c9b57a', cap: true }, festa: { t: '#f2f2f7', k: '#f2f2f7', p: '#c9a86a', b: '#5a3a22' } } },
  carlos: { def: M, base: { h: '#a8a4ac', s: '#e0a878', d: NOBEARD }, outfits: { casual: { t: '#2a3358', k: '#ffffff', p: '#f2f2f7', b: '#5a3a22', q: '#ffffff', Q: '#2a3358', cap: true }, festa: { t: '#2a3358', k: '#ffffff', p: '#f2f2f7', b: '#5a3a22' } } },
  barbara: { def: F, base: { h: '#d8a858', H: '#f0c888', v: '#d8a858' }, outfits: { casual: { t: '#3f9f6a', T: '#2f7f52', b: '#2b1d2e' }, festa: { t: '#ffb347', T: '#e09030', b: '#2b1d2e' } } },
  isabelv: { def: F, base: { h: '#3b2a20', H: '#5a4030', v: '#3b2a20' }, outfits: { casual: { t: '#f2f2f7', T: '#3f9f6a', b: '#2b1d2e' }, festa: { t: '#5a8fd0', T: '#3f6fb0', b: '#2b1d2e' } } },
  // ----- os filhos -----
  tomasc: { def: BOY, base: { h: '#6b4a2e' }, outfits: { casual: { t: '#8fc4ff', k: '#ffffff', p: '#5a8fd0', b: '#ffffff' } } },
  tomas: { def: M, base: { h: '#6b4a2e', d: NOBEARD }, outfits: {
    casual: { t: '#4fb888', k: '#4fb888', p: '#3a3f55', b: '#ffffff' }, teen: { t: '#ff8a4b', k: '#2b2b3a', p: '#4a6a9a', b: '#ffffff' },
    inverno: { t: '#ffb347', k: '#2b2b3a', p: '#2b2b3a', b: '#5a3a22', q: '#2b2b3a', Q: '#ffb347', cap: true }, festa: { t: '#f2f2f7', k: '#4fb888', p: '#3a3f55', b: '#111122' } } },
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
  sambista: { def: M, base: { h: '#2b2b3a', s: '#b8794a', d: '#b8794a' }, outfits: { casual: { t: '#ffd23e', k: '#3fa672', p: '#f2f2f7', b: '#f2f2f7', q: '#f2f2f7', Q: '#2b2b3a', cap: true } } },
};

const cache = new Map();
// nomes de todas as personagens pedidas (os testes usam isto para ver quem aparece em cada nível)
export const seen = new Set();

// Devolve os fotogramas { stand, a, b } de uma personagem, cada um com versão direita (r) e esquerda (l).
export function getCharacter(name, outfit = 'casual') {
  const key = name + ':' + outfit;
  seen.add(name);
  if (cache.has(key)) return cache.get(key);
  const look = LOOKS[name] || LOOKS.ines;
  const { cap, ...clothes } = look.outfits[outfit] || look.outfits.casual;
  const pal = { ...BASE, ...look.base, ...clothes };
  const upper = cap ? look.def.upper.map((row, i) => look.def.cap[i] || row) : look.def.upper;
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
      heartGold: makeSprite(HEART, { o: '#2b1d2e', r: '#ffd166', w: '#ffffff' }),
      heartOff: makeSprite(HEART, { o: '#2b1d2e', r: '#9a93ad', w: '#d8d3e6' }),
    };
  }
  return sprites;
}

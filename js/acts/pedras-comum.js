// Peças de desenho do nível de Pedras d'El Rei: a família, o comboiozinho da Praia do Barril,
// gaivotas, chapéus de sol, as casas caiadas da antiga armação do atum e as âncoras.
import { getCharacter, makeSprite, flip } from '../sprites.js';
import { INK, disc } from '../draw.js';

// A família, pela ordem: Inês, Tia Fátima, o pai, as irmãs (Sofia e Maria) e os irmãos (Zé Inácio e Kiko).
export function familia() {
  return [getCharacter('ines', 'praia'), getCharacter('tiafatima', 'casual'), getCharacter('tio', 'casual'),
    getCharacter('irma1', 'casual'), getCharacter('irma2', 'casual'), getCharacter('irmao', 'casual'), getCharacter('irmao2', 'casual')];
}

// ---------- Gaivotas ----------
const PAL = { w: '#ffffff', g: '#a9b2c4', k: '#2b1d2e', y: '#f0a020' };
let gaiv = null;
export function gaivotas() {
  if (!gaiv) {
    const pousada = makeSprite([
      '....kkkk....', '...kwwwwk...', '...kwwkwyy..', '..kgwwwwk...', '.kgggwwwwk..', 'kggggggwwk..',
      '.kkgggggwk..', '...kwwwwk...', '....y..y....', '....y..y....'], PAL);
    const cima = makeSprite([
      'kk........kk', 'kggk....kggk', '.kgggkkgggk.', '..kgwwwwwkk.', '...kwwwwkwyy', '....kwwwwk..', '.....kkkk...'], PAL);
    const baixo = makeSprite([
      '....kkkkkk..', '...kwwwwkwyy', '..kgwwwwwwk.', '.kgggwwgggk.', 'kggkkkkkggk.', 'kgk.....kgk.', 'kk.......kk.'], PAL);
    gaiv = { pousada: { r: pousada, l: flip(pousada) }, voa: [{ r: cima, l: flip(cima) }, { r: baixo, l: flip(baixo) }] };
  }
  return gaiv;
}

// ---------- O comboio da praia ----------
// Locomotiva pequena e carruagens abertas (as cores são escolha nossa). x = frente da locomotiva,
// y = carris, s = escala, gente = fotogramas de quem vai sentado (dois por carruagem).
export function comboio(ctx, R, x, y, s, t, gente = [], o = {}) {
  x = Math.round(x); y = Math.round(y);
  const roda = (cx) => {
    disc(ctx, cx, y - 3 * s, 3 * s, INK); disc(ctx, cx, y - 3 * s, 3 * s - 2, '#8a8794');
    const a = (o.dist || 0) / (3 * s);
    R(cx + Math.cos(a) * (3 * s - 3) - 1, y - 3 * s + Math.sin(a) * (3 * s - 3) - 1, 2, 2, INK); R(cx - 1, y - 3 * s - 1, 2, 2, INK);
  };
  // carruagens (da última para a primeira)
  const nc = o.carruagens === undefined ? 3 : o.carruagens;
  for (let c = nc - 1; c >= 0; c--) {
    const x0 = x - (28 + (c + 1) * 26) * s, q = (a, b, w, h, col) => R(x0 + a * s, y + b * s, w * s, h * s, col);
    q(24, -6, 3, 1, INK);                                  // engate
    for (let k = 0; k < 2; k++) {
      const g = gente[c * 2 + k];
      if (g) ctx.drawImage(g.stand.r, 0, 0, 16, 18, x0 + (3 + k * 11) * s - (s === 1 ? 0 : 5), y - 9 * s - 18 * s, 16 * s, 18 * s);
    }
    q(0, -27, 24, 2, INK); q(0, -27, 24, 1, '#fff6e6'); q(-1, -26, 26, 1, '#e8dcc0');
    for (const a of [0, 11.5, 23]) q(a, -25, 1, 16, '#5a3a22');
    q(0, -10, 24, 6, INK); q(0, -9, 24, 4, '#3f8a5a'); q(0, -9, 24, 1, '#6fc08a'); q(0, -7, 24, 1, '#ffd166');
    q(1, -5, 22, 2, '#3a2f3a');
    roda(x0 + 5 * s); roda(x0 + 19 * s);
  }
  // locomotiva
  const x0 = x - 26 * s, q = (a, b, w, h, col) => R(x0 + a * s, y + b * s, w * s, h * s, col);
  q(-1, -27, 12, 2, INK); q(0, -25, 10, 20, INK); q(1, -24, 8, 18, '#c0392b'); q(2, -22, 6, 7, '#bfe6f5'); q(1, -13, 8, 1, '#ffd166');
  q(3, -20, 4, 5, '#3a4a6a'); q(3, -22, 4, 2, '#f6c9a0');             // o maquinista, de boné
  q(9, -17, 17, 12, INK); q(10, -16, 15, 10, '#c0392b'); q(10, -16, 15, 2, '#e8604a'); q(10, -9, 15, 1, '#ffd166');
  q(23, -17, 3, 12, '#3a2f3a');
  q(19, -24, 4, 7, INK); q(20, -23, 2, 6, '#3a2f3a'); q(18, -25, 6, 2, INK);     // chaminé
  q(13, -19, 3, 2, INK); q(13, -20, 3, 1, '#ffd166');                            // apito
  q(0, -6, 26, 2, '#3a2f3a'); q(26, -6, 1, 3, INK);
  roda(x0 + 4 * s); roda(x0 + 13 * s); roda(x0 + 21 * s);
  // fumo (e o vapor do apito)
  for (let k = 0; k < 3; k++) {
    const p = (t * 0.8 + k / 3) % 1;
    disc(ctx, x0 + 21 * s - p * 14 * s, y - (27 + p * 9) * s, Math.round((1.5 + p * 2) * s), `rgba(255,255,255,${(0.75 - p * 0.6).toFixed(2)})`);
  }
  if (o.apito > 0) for (let k = 0; k < 3; k++) disc(ctx, x0 + (14.5 + (k - 1) * 3 * (1 - o.apito)) * s, y - (22 + (1 - o.apito) * 10 + k) * s, 2 * s, '#ffffff');
}

// Carris e travessas, a correr com a câmara.
export function linha(R, w, y, cam) {
  for (let x = -((cam % 8) + 8) % 8; x < w; x += 8) R(x, y, 4, 3, '#6b4a2e');
  R(0, y - 1, w, 1, '#3a2f3a'); R(0, y, w, 1, '#b8bcc8');
}

// ---------- Praia ----------
// Chapéu de sol às riscas. (x = pé, gy = areia)
export function chapeu(R, x, gy, c1, c2, s = 1) {
  x = Math.round(x); gy = Math.round(gy);
  const hw = (i) => 3 + i * 2.5;
  R(x, gy - 22 * s, s, 22 * s, '#8a8794');
  for (let i = 0; i < 5; i++) R(x - hw(i) * s - 1, gy - (27 - i) * s - 1, hw(i) * 2 * s + s + 2, s + 2, INK);
  for (let i = 0; i < 5; i++) {
    const w = hw(i), y = gy - (27 - i) * s;
    R(x - w * s, y, w * 2 * s + s, s, c1);
    R(x - w * 0.25 * s, y, w * 0.5 * s + s, s, c2);
    R(x - w * s, y, w * 0.3 * s, s, c2); R(x + w * 0.7 * s + s, y, w * 0.3 * s, s, c2);
  }
  R(x, gy - 29 * s, s, 2 * s, INK);
}

// Casa caiada da antiga armação do atum. (x = esquerda, gy = chão)
export function casaAtum(R, x, gy, w = 26, h = 14) {
  x = Math.round(x); gy = Math.round(gy);
  R(x - 1, gy - h - 5, w + 2, h + 5, INK);
  R(x, gy - h, w, h, '#fffaf0'); R(x + w - 5, gy - h, 5, h, '#e4dccb');
  for (let i = 0; i < 4; i++) R(x - 1 + i, gy - h - 1 - i, w + 2 - i * 2, 1, i % 2 ? '#c8643c' : '#d8784a');
  R(x + 4, gy - 9, 4, 9, '#3f6fa0'); R(x + 13, gy - 10, 4, 4, '#3f6fa0'); R(x + 20, gy - 10, 3, 4, '#3f6fa0');
  R(x + w - 8, gy - h - 8, 4, 5, INK); R(x + w - 7, gy - h - 7, 2, 4, '#fffaf0');
}

// Âncora ferrugenta espetada na duna. (x = centro, gy = areia)
export function ancora(R, x, gy, s = 2, inc = 0, longe = false) {
  x = Math.round(x); gy = Math.round(gy);
  const c1 = longe ? '#c48a5c' : '#a8562a', c2 = longe ? '#a56c44' : '#6a3018', c3 = longe ? '#d8a274' : '#d08048';
  const q = (a, b, w, h, c) => R(x + a * s, gy + b * s, w * s, h * s, c);
  for (let i = 0; i < 15; i++) { const dx = Math.round(inc * (i - 7) * 0.12); q(dx, -1 - i, 1, 1, i % 4 === 3 ? c2 : c1); q(dx + 1, -1 - i, 1, 1, c2); }
  const tx = Math.round(inc * 0.9);
  q(tx - 1, -18, 4, 1, c2); q(tx - 1, -17, 1, 2, c2); q(tx + 2, -17, 1, 2, c2);       // argola
  q(tx - 4, -14, 10, 1, c1); q(tx - 4, -13, 10, 1, c2); q(tx - 5, -15, 1, 3, c3); q(tx + 6, -15, 1, 3, c3);   // cepo
  const bx = -Math.round(inc * 0.9);
  q(bx - 5, -3, 12, 1, c1); q(bx - 5, -2, 12, 1, c2);                                 // braços
  q(bx - 6, -6, 1, 4, c1); q(bx + 7, -6, 1, 4, c1);
  q(bx - 7, -8, 2, 2, c3); q(bx + 7, -8, 2, 2, c3);                                   // unhas
}

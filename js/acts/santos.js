// Nível «Santos»: os Santos Populares em Lisboa.
//   arraial()   — a rua enfeitada: casas, festões, balões de papel, manjericos;
//   Sardinhas   — na banca: tirar cada sardinha (ou bifana) da grelha no ponto certo;
//   PIMBA       — a «pele» do jogo de ritmo (js/acts/ritmo.js) para dançar música pimba no arraial;
//   praceta()   — o largo em frente ao Xafarix (o chafariz iluminado, o terraço, o palco com a
//                 banda, o toldo verde do gato), onde acabava sempre a noite de Santo António.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, clamp, hash, stars, disc, text, sign, person, shadow } from '../draw.js';
import { gato } from './xafarix-cenario.js';

const CORES = ['#ff5d8f', '#ffd166', '#7be0b0', '#6fb0f0', '#ff8a4b', '#c79bff'];
const CASAS = ['#c98a7a', '#d8c08a', '#8fa8b8', '#c8a0b0', '#a8b890'];

// Festões: fios de bandeirinhas de papel, de um lado ao outro da rua.
function festoes(R, w, y0, t, n = 3) {
  for (let k = 0; k < n; k++) {
    for (let x = -4, i = 0; x < w; x += 7, i++) {
      const y = y0 + k * 9 + Math.round(Math.sin((x / w) * Math.PI * (2 + k)) * 4) + (k % 2 ? 3 : 0);
      R(x, y, 7, 1, '#e8e0d0');
      const c = CORES[(i + k * 2) % CORES.length], sway = Math.floor(t * 2 + i) % 5 === 0 ? 1 : 0;
      R(x + 1 + sway, y + 1, 5, 3, c); R(x + 2 + sway, y + 4, 3, 2, c);
    }
  }
}

// Balão de papel (lanterna dos santos), pendurado.
function balao(ctx, R, x, y, c, t) {
  const b = Math.round(Math.sin(t * 1.5 + x) * 1);
  R(x, y - 8, 1, 8, '#e8e0d0');
  disc(ctx, x + b, y + 6, 6, INK); disc(ctx, x + b, y + 6, 5, c);
  R(x + b - 5, y + 5, 10, 1, PAPER); R(x + b - 3, y + 1, 6, 1, PAPER); R(x + b - 2, y + 12, 4, 2, INK);
  R(x + b - 1, y + 4, 2, 4, 'rgba(255,240,160,0.8)');
}

// Vaso de manjerico, com o cravo de papel e a bandeirinha da quadra.
function manjerico(ctx, R, x, gy) {
  R(x - 5, gy - 7, 10, 7, INK); R(x - 4, gy - 6, 8, 6, '#b8502e'); R(x - 5, gy - 8, 10, 2, '#d8683e');
  disc(ctx, x, gy - 13, 6, '#2f7a40'); disc(ctx, x - 2, gy - 14, 3, '#4fa85a');
  R(x + 3, gy - 24, 1, 9, '#6a4a2a'); R(x + 1, gy - 26, 5, 4, '#ff5d8f'); R(x - 4, gy - 22, 1, 7, '#6a4a2a'); R(x - 9, gy - 22, 5, 4, PAPER);
}

// A rua do arraial, de noite. o: { banca: x do centro da banca (ou null) }
export function arraial(ctx, v, R, t, gy, top, o = {}) {
  const w = v.w;
  R(0, 0, w, gy, '#161a40');
  stars(ctx, w, Math.max(20, top + 10), t, 14, 24);
  // casas antigas, de janelas acesas e varandas
  const hh = clamp(gy - top - 6, 46, 110);
  for (let x = -6, i = 0; x < w; x += 48, i++) {
    const h = hh - (i % 3) * 8, y = gy - h, c = CASAS[i % CASAS.length];
    R(x, y, 47, h, INK); R(x + 1, y + 1, 45, h - 1, c); R(x + 1, y + 1, 45, 3, '#8a4a3a');
    for (let r = 0; r < Math.floor((h - 30) / 22) + 1; r++) for (let q = 0; q < 2; q++) {
      const wx = x + 8 + q * 20, wy = y + 10 + r * 22, on = hash(i * 7 + r * 3 + q) > 0.35;
      R(wx - 1, wy - 1, 12, 14, INK); R(wx, wy, 10, 12, on ? '#ffd98a' : '#3a3f5a'); R(wx + 4, wy, 1, 12, INK);
      R(wx - 2, wy + 12, 14, 2, '#2b2b3a');
    }
    R(x + 18, gy - 18, 11, 18, INK); R(x + 19, gy - 17, 9, 17, '#5a3a2a');
  }
  R(0, 0, w, gy, 'rgba(20,16,50,0.25)');
  festoes(R, w, Math.max(top + 2, gy - hh - 4), t, v.portrait ? 4 : 3);
  for (let i = 0; i < Math.ceil(w / 70); i++) balao(ctx, R, 30 + i * 70, Math.max(top + 14, gy - hh + 10) + (i % 2) * 10, CORES[(i * 2 + 1) % CORES.length], t);
  // a calçada
  R(0, gy, w, v.h - gy, '#8a8794'); R(0, gy, w, 2, '#a8a4b0');
  for (let y = gy + 4, j = 0; y < v.h; y += 7, j++) for (let x = (j % 2) * 6; x < w; x += 12) R(x, y, 5, 1, j % 3 ? '#7a7684' : '#c8c4d0');
  if (o.banca !== undefined && o.banca !== null) {
    const cx = o.banca;
    // a banca: toldo às riscas, letreiro, balcão e a grelha com as brasas
    for (let k = 0; k < 13; k++) R(cx - 52 + k * 8, gy - 74, 8, 9, k % 2 ? '#e0392b' : PAPER);
    R(cx - 53, gy - 75, 106, 1, INK); R(cx - 53, gy - 65, 106, 1, INK);
    R(cx - 50, gy - 64, 2, 64, '#5a4030'); R(cx + 48, gy - 64, 2, 64, '#5a4030');
    sign(ctx, 'SARDINHAS E BIFANAS', cx, gy - 62, { bg: '#2f6f62', color: '#ffffff' });
    R(cx - 47, gy - 25, 94, 25, INK); R(cx - 46, gy - 24, 92, 24, '#b07a44'); R(cx - 46, gy - 24, 92, 3, '#d09a5c');
    for (let x = cx - 40; x < cx + 44; x += 14) R(x, gy - 20, 1, 20, '#8a5a34');
    manjerico(ctx, R, cx + 38, gy - 24);
  }
}

// Uma sardinha na grelha (de crua, prateada, a dourada).
function sardinha(R, x, y, f) {
  const c = f > 0.85 ? '#5a4030' : f > 0.4 ? '#c89a4a' : '#a8bccc';
  R(x - 9, y - 3, 17, 7, INK); R(x - 8, y - 2, 15, 5, c); R(x - 8, y - 2, 15, 1, f > 0.4 ? '#e0b86a' : '#d8e6f0');
  R(x + 8, y - 4, 4, 9, INK); R(x + 9, y - 3, 2, 7, c); R(x - 6, y - 1, 1, 1, INK);
  for (let k = 0; k < 3; k++) R(x - 3 + k * 4, y - 1, 1, 3, 'rgba(43,29,46,0.5)');
}
// Uma bifana: o pão com o bife a espreitar.
function bifana(R, x, y, f) {
  R(x - 9, y - 6, 18, 11, INK); R(x - 8, y - 5, 16, 4, '#e0b070'); R(x - 8, y - 5, 16, 1, '#f0c88a');
  R(x - 9, y - 1, 18, 2, f > 0.85 ? '#4a2a1a' : f > 0.4 ? '#9a5a34' : '#d08a8a'); R(x - 8, y + 1, 16, 3, '#d8a060');
}

const RONDAS = [
  { item: 'sardinha', quem: 0, fala: 'Pipoca: «Sardinha no pão: não há melhor!»' },
  { item: 'bifana', quem: 1, fala: 'Ana: «Uma bifana a pingar, como deve ser!»' },
  { item: 'sardinha', quem: 2, fala: 'Mi: «Cheira tão bem que se sente na rua toda!»' },
  { item: 'bifana', quem: 0, fala: 'Pipoca: «Agora uma bifana. E mais uma imperial!»' },
  { item: 'sardinha', quem: 1, fala: 'Ana: «A última é para a Inês. Viva o Santo António!»' },
];
const LO = 0.5, HI = 0.74;      // zona «no ponto» da barra

// Na banca do arraial: a barra vai de «crua» a «queimada»; toca-se quando está «no ponto».
export class Sardinhas extends Act {
  get max() { return RONDAS.length; }

  start() {
    this.k = 0; this.pos = 0; this.tries = 0; this.wait = 0; this.over = 0; this.joy = 0; this.feitas = 0;
    this.ines = getCharacter('ines', 'casual');
    this.amigos = ['pipoca', 'ana', 'mi'].map((q) => getCharacter(q, 'casual'));
    this.hint('Noite de Santo António! Toca quando a sardinha estiver no ponto (na zona verde).');
  }

  serve(comCoracao, v) {
    const r = RONDAS[this.k];
    if (comCoracao) this.heart(1, v.w * 0.5, v.h * 0.5);
    this.sfx(comCoracao ? 'check' : 'click');
    this.hint(comCoracao ? r.fala : 'A vizinha da banca dá uma ajuda: esta saiu... mais ou menos.');
    this.joy = 1.2; this.feitas++; this.k++; this.tries = 0; this.pos = 0; this.wait = 1.5;
    if (this.k >= RONDAS.length) this.over = 0.01;
  }

  update(dt, I, v) {
    this.joy = Math.max(0, this.joy - dt);
    if (this.over) { this.over += dt; if (this.over > 2.6) this.done(); return; }
    if (this.wait > 0) { this.wait -= dt; return; }
    this.pos += dt * (0.5 + this.k * 0.05);
    if (this.pos >= 1) { this.miss('Esturricou! Outra para a grelha...', v); return; }
    if (I.actionPressed) {
      if (this.pos >= LO && this.pos <= HI) this.serve(this.tries < 2, v);
      else this.miss(this.pos < LO ? 'Ainda está crua! Espera pela zona verde.' : 'Já passou do ponto! Outra para a grelha...', v);
    }
  }

  miss(texto, v) {
    this.tries++;
    this.sfx('toc');
    if (this.tries >= 3) { this.serve(false, v); return; }
    this.hint(texto);
    this.pos = 0; this.wait = 0.7;
  }

  bot(I) { if (!this.over && this.wait <= 0 && this.pos > LO + 0.08 && this.pos < HI - 0.06) I.actionPressed = true; }

  draw(ctx, v, R) {
    const P = v.portrait, gy = Math.round(v.h * (P ? 0.72 : 0.86)), top = this.top(v), t = this.t;
    const cx = Math.round(v.w * (P ? 0.44 : 0.42));
    arraial(ctx, v, R, t, gy, top, { banca: cx });
    // a Inês, de pinça na mão, ao lado da grelha
    const ix = cx - 62;
    shadow(ctx, ix, gy, 14); person(ctx, this.ines, ix, gy, { scale: 2, face: 1 });
    R(ix + 12, gy - 30, 12, 2, INK); R(ix + 12, gy - 27, 12, 2, INK);
    // a grelha: brasas, grade e o que lá está a assar
    R(cx - 31, gy - 33, 62, 9, INK); R(cx - 30, gy - 32, 60, 7, '#3a3448');
    for (let k = 0; k < 10; k++) R(cx - 28 + k * 6, gy - 27, 4, 2, (k + Math.floor(t * 6)) % 3 ? '#ff8a3a' : '#ffd166');
    for (let x = cx - 28; x < cx + 30; x += 5) R(x, gy - 33, 1, 4, '#8a93a7');
    const r = RONDAS[Math.min(this.k, RONDAS.length - 1)], f = this.wait > 0 || this.over ? 0.6 : this.pos;
    for (let k = -1; k <= 1; k++) (r.item === 'sardinha' ? sardinha : bifana)(R, cx + k * 20, gy - 37, k === 0 ? f : 0.5);
    // fumo
    for (let k = 0; k < 5; k++) { const p = (t * 0.5 + k * 0.2) % 1; R(cx - 20 + k * 10 + Math.round(Math.sin(p * 5 + k) * 3), gy - 42 - Math.round(p * 26), 4 - Math.round(p * 2), 3, `rgba(230,230,240,${(0.5 * (1 - p)).toFixed(2)})`); }
    // os amigos, na fila, de prato na mão; salta quem acabou de ser servido
    this.amigos.forEach((a, i) => {
      const x = cx + 66 + i * (P ? 24 : 28), quem = RONDAS[Math.max(0, this.k - 1)].quem;
      const hop = this.joy > 0 && quem === i ? Math.round(Math.abs(Math.sin(t * 10)) * 4) : 0;
      shadow(ctx, x, gy, 14); person(ctx, a, x, gy, { scale: 2, face: -1, hop });
      R(x - 14, gy - 28 - hop, 10, 2, PAPER); R(x - 15, gy - 27 - hop, 12, 1, INK);
    });
    // a barra: crua · no ponto · queimada
    const bw = Math.min(170, v.w - 30), bx = Math.round((v.w - bw) / 2), by = top + 6;
    R(bx - 1, by - 1, bw + 2, 10, INK); R(bx, by, bw, 8, '#a8bccc');
    R(bx + bw * LO, by, bw * (HI - LO), 8, '#5cf08a'); R(bx + bw * HI, by, bw * (1 - HI), 8, '#5a3020');
    text(ctx, 'CRUA', bx + 3, by + 2, '#2b1d2e'); text(ctx, 'NO PONTO', bx + bw * (LO + HI) / 2, by + 2, '#1f5a30', { align: 'center' });
    if (!this.over && this.wait <= 0) { const mx = Math.round(bx + this.pos * bw); R(mx - 2, by - 3, 5, 14, INK); R(mx - 1, by - 2, 3, 12, GOLD); }
    for (let k = 0; k < RONDAS.length; k++) { R(bx + k * 9, by + 13, 7, 4, INK); R(bx + k * 9 + 1, by + 14, 5, 2, k < this.feitas ? GOLD : '#3a3448'); }
  }
}

// «Pele» do jogo de ritmo: dançar música pimba no arraial.
export const PIMBA = {
  lanes: 2,
  bpm: 116,
  lead: 1.6,
  colors: ['#ff5d8f', '#ffd166'],
  sounds: ['click', 'toc'],
  track: '#161a40',
  pattern: [
    '1...2...', '1...2...', '1.2.1...',
    '2...1.1.', '1.2.1.2.', '1...2.2.',
    '1.1.2...', '2.1.2.1.', '1.2.1...',
    '1.1.2.2.', '2.2.1.1.', '1.2.1.2.',
  ],
  songs: [{ label: 'NO ARRAIAL', title: 'MÚSICA PIMBA' }],
  ground: (v) => Math.round(v.h * (v.portrait ? 0.52 : 0.86)),
  bg: (ctx, v, R, t, st) => arraial(ctx, v, R, t, st.gy, st.top),
  dancers: [
    { who: 'ana', outfit: 'casual', x: 0.1, px: 0.14 },
    { who: 'ines', outfit: 'casual', x: 0.24, px: 0.38, off: 1 },
    { who: 'pipoca', outfit: 'casual', x: 0.78, px: 0.64 },
    { who: 'mi', outfit: 'casual', x: 0.92, px: 0.88, off: 1 },
  ],
  intro: 'Música pimba! Toca do lado da nota (ou usa as setas ← →) quando ela chegar ao círculo.',
  end: 'Pipoca: «E agora, todos para a praceta do Xafarix!»',
};

// O largo em frente ao Xafarix na noite de Santo António, desenhado pelas fotografias das festas
// do bar: ao fundo o prédio vermelho de cantarias brancas e o cor-de-rosa; ao meio o chafariz
// barroco, iluminado a roxo, por cima do terraço de pedra de onde há gente a ver; encostado ao
// muro, o palco com a banda e os projetores vermelhos; à esquerda a barraca de toldo às riscas e,
// à direita, a escada de pedra para a porta do Xafarix, com o toldo verde do gato e os vasos.
function musicos(ctx, R, cx, sw, sy, t) {
  const A = getCharacter('musico', 'casual'), B = getCharacter('musico', 'b');
  const bob = (i) => Math.round(Math.abs(Math.sin(t * 6 + i * 1.5)) * 1);
  // o baterista, atrás da bateria
  const dx = Math.round(cx - sw * 0.3);
  person(ctx, B, dx, sy - 5, { scale: 1, face: 1, hop: bob(0) });
  disc(ctx, dx, sy - 7, 6, INK); disc(ctx, dx, sy - 7, 5, '#e8e2d6'); disc(ctx, dx, sy - 7, 2, '#c0392b');
  R(dx - 11, sy - 14, 6, 4, INK); R(dx - 10, sy - 13, 4, 2, '#d8d2c6'); R(dx + 6, sy - 13, 5, 4, INK); R(dx + 7, sy - 12, 3, 2, '#d8d2c6');
  R(dx - 13, sy - 21 + (Math.floor(t * 8) % 2), 8, 1, '#ffd166'); R(dx - 10, sy - 20, 1, 20, '#8a8794'); R(dx + 7, sy - 23, 8, 1, '#ffd166'); R(dx + 11, sy - 22, 1, 22, '#8a8794');
  // guitarras, voz e teclas
  const guit = (x, c, i) => { person(ctx, i % 2 ? A : B, x, sy, { scale: 1, face: i % 2 ? -1 : 1, hop: bob(i) }); R(x - 5, sy - 12 - bob(i), 8, 5, INK); R(x - 4, sy - 11 - bob(i), 6, 3, c); R(x + 3, sy - 13 - bob(i), 8, 1, INK); };
  guit(Math.round(cx - sw * 0.13), '#c0392b', 1);
  const vx = Math.round(cx + sw * 0.03);
  person(ctx, A, vx, sy, { scale: 1, face: 1, hop: bob(2) });
  R(vx + 7, sy - 19, 1, 19, '#8a8794'); R(vx + 5, sy - 21, 4, 3, INK); R(vx - 6, sy - 24 - bob(2), 2, 7, '#f6c9a0');       // o microfone e o braço no ar
  const kx = Math.round(cx + sw * 0.19);
  person(ctx, B, kx, sy, { scale: 1, face: -1, hop: bob(3) });
  R(kx - 9, sy - 12, 18, 4, INK); R(kx - 8, sy - 11, 16, 2, '#b79cf0'); for (let k = 0; k < 8; k += 2) R(kx - 8 + k * 2, sy - 11, 1, 2, '#f2f2f7'); R(kx - 6, sy - 8, 1, 8, '#8a8794'); R(kx + 5, sy - 8, 1, 8, '#8a8794');
  guit(Math.round(cx + sw * 0.35), '#e8c34a', 4);
}

export function praceta(ctx, v, R, t, act) {
  const gy = act.ground(v), top = act.top(v), w = v.w, P = v.portrait, livre = gy - top;
  const cx = Math.round(w * (P ? 0.44 : 0.47)), ww = Math.round(Math.min(w * 0.33, 132));    // o muro do terraço: cx ± ww
  const mh = Math.min(P ? 78 : 64, Math.round(livre * 0.56)), my = gy - mh;                   // altura do muro
  const ch = Math.max(26, Math.min(P ? 84 : 54, my - top - 6));                               // o chafariz, por cima do muro
  R(0, 0, w, gy, '#12143a');
  stars(ctx, w, top + 20, t, 5, 20);

  // ----- os prédios do largo: o vermelho de cantarias brancas e o cor-de-rosa -----
  const by = Math.max(top - 8, gy - (P ? 236 : 176)), div = Math.round(cx + ww * 0.62);
  R(0, by, div, gy - by, '#6e2833'); R(div, by + 10, w - div, gy - by - 10, '#7c5a7c');
  R(0, by, div, 3, '#b3aab4'); R(div - 3, by, 3, gy - by, '#b3aab4'); R(div, by + 10, w - div, 2, '#a892a8');
  for (let yy = by + 12, r = 0; yy < my - ch - 4 || (yy < gy - 30 && r < 6); yy += 36, r++) {
    for (let x = 10, q = 0; x < w - 8; x += 30, q++) {
      if (Math.abs(x + 7 - div) < 12) continue;
      const on = hash(q * 5.1 + r * 3.7) > 0.55;
      R(x - 2, yy - 2, 18, 24, x < div ? '#b3aab4' : '#a892a8'); R(x, yy, 14, 20, on ? '#ffd98a' : '#1f2340');
      R(x + 6, yy, 2, 20, x < div ? '#2f4a3c' : '#5a4a5a'); R(x, yy + 7, 14, 1, x < div ? '#2f4a3c' : '#5a4a5a');
      if (r % 2 === 0 && x < div) for (let k = 0; k < 16; k += 2) R(x - 1 + k, yy + 14, 1, 7, '#22262e');       // varandim de ferro
    }
  }
  R(0, by, w, gy - by, 'rgba(16,14,48,0.3)');
  // a árvore do largo, com a copa acesa de vermelho pelos projetores
  if (livre > 96) {
    R(3, top + 22, 6, gy - top - 22, '#3a2a2e');
    for (const [dx, dy, r, c] of [[6, 14, 20, '#7a2434'], [26, 8, 15, '#a83238'], [-2, 26, 13, '#5a2030'], [18, 22, 11, '#c8483c'], [36, 18, 9, '#8a2a36']]) disc(ctx, dx, top + dy, r, c);
    for (let i = 0; i < 18; i++) R(Math.floor(hash(i * 1.7) * 44), top + 2 + Math.floor(hash(i * 4.1) * 30), 2, 1, '#e86a50');
  }

  // ----- o chafariz, iluminado a roxo -----
  const L = '#eadfff', M = '#b99ef2', D = '#7f61d2', DD = '#4a3896', fw = Math.round(Math.min(104, ww * 1.25)), h1 = Math.round(ch * 0.46), h2 = Math.round(ch * 0.8);
  // as alas, com as volutas, e os pináculos
  R(cx - fw / 2, my - h1, fw, h1, M); R(cx - fw / 2, my - h1, fw, 2, L);
  for (const d of [-1, 1]) {
    for (let i = 0; i < 6; i++) R(cx + d * (fw / 2 - 3 - i * 2) - (d > 0 ? 0 : 3), my - h1 - 2 - i * 2, 3, 2, i % 2 ? M : L);
    for (const k of [0.5, 0.33]) { const px = Math.round(cx + d * fw * k); R(px - 2, my - (k > 0.4 ? h1 : h2) - 4, 5, 4, M); R(px - 1, my - (k > 0.4 ? h1 : h2) - 11, 3, 8, L); disc(ctx, px, my - (k > 0.4 ? h1 : h2) - 12, 2, L); }
    const lx = Math.round(cx + d * fw * 0.42); disc(ctx, lx, my - h1 - 9, 4, 'rgba(255,200,110,0.3)'); disc(ctx, lx, my - h1 - 9, 2, '#ffe6a8');       // os dois candeeiros
  }
  // o corpo central: colunas, nicho e frontão curvo
  const bw2 = Math.round(fw * 0.62);
  R(cx - bw2 / 2, my - h2, bw2, h2, M); R(cx - bw2 / 2 - 2, my - h2 - 2, bw2 + 4, 3, L); R(cx - bw2 / 2, my - h2 + 1, bw2, 1, D);
  for (const k of [-0.43, -0.27, 0.27, 0.43]) { const px = Math.round(cx + bw2 * k); R(px - 2, my - h2 + 2, 4, h2 - 2, L); R(px + 1, my - h2 + 2, 1, h2 - 2, D); R(px - 3, my - 4, 6, 4, L); }
  const nw = Math.round(bw2 * 0.2), nh = Math.round(h2 * 0.62);
  R(cx - nw, my - nh, nw * 2, nh, DD); R(cx - nw + 2, my - nh + 2, nw * 2 - 4, nh - 2, D); R(cx - nw + 2, my - nh - 2, nw * 2 - 4, 2, DD); R(cx - 3, my - Math.round(nh * 0.6), 6, Math.round(nh * 0.6), M);
  const ph = Math.max(5, ch - h2 - 6);
  for (let i = 0; i < ph; i++) { const half = Math.round((bw2 * 0.34) * Math.sqrt(1 - Math.pow((ph - 1 - i) / ph, 2))); R(cx - half, my - h2 - 2 - ph + i, half * 2, 1, i < 2 ? L : M); }
  R(cx - 1, my - h2 - ph - 6, 3, 5, L); disc(ctx, cx, my - h2 - ph - 7, 2, L);

  // ----- o terraço: o muro de pedra, as urnas e a gente a ver de cima -----
  R(cx - ww, my, ww * 2, mh, '#d6cfc6'); R(cx - ww - 2, my - 3, ww * 2 + 4, 4, '#efe9df'); R(cx - ww, my + 1, ww * 2, 1, '#a9a198');
  for (let yy = my + 12, j = 0; yy < gy; yy += 13, j++) { R(cx - ww, yy, ww * 2, 1, '#bdb5ac'); for (let x = cx - ww + (j % 2) * 14; x < cx + ww; x += 28) R(x, yy, 1, 13, '#bdb5ac'); }
  disc(ctx, cx, my + 15, 7, '#a9a198'); disc(ctx, cx, my + 15, 5, '#e6dfd4'); disc(ctx, cx, my + 15, 2, '#a9a198');          // o medalhão
  for (const d of [-1, 1]) { const ux = Math.round(cx + d * ww * 0.7); R(ux - 3, my - 7, 6, 4, '#cfc8be'); disc(ctx, ux, my - 10, 4, '#8fb0f0'); R(ux - 1, my - 15, 2, 2, '#b8d0ff'); }
  for (let x = cx - ww + 7, i = 0; x < cx + ww - 4; x += 10, i++) {
    if (Math.abs(Math.abs(x - cx) - ww * 0.7) < 7) continue;
    const c = ['#2a2540', '#40304a', '#2f3558', '#5a3040', '#3a4a5a'][i % 5], up = Math.round(hash(i * 2.3) * 2);
    R(x - 3, my - 8 - up, 6, 6, c); disc(ctx, x, my - 11 - up, 2, i % 3 ? '#d8b090' : '#c89a78'); R(x - 2, my - 14 - up, 4, 2, ['#2a1c1a', '#c8a060', '#5a3a2a'][i % 3]);
  }
  R(cx - ww, my + Math.round(mh * 0.5), ww * 2, Math.round(mh * 0.5), 'rgba(30,20,60,0.22)');

  // ----- o palco, encostado ao muro: projetores, colunas e a banda -----
  const sw = Math.min(ww * 2 - 26, 156), sh = Math.min(P ? 38 : 32, mh - 26), sy = gy - sh;
  for (const d of [-1, 1]) {
    const px = Math.round(cx + d * (sw / 2 + 9));
    R(px, my - 16, 2, mh + 16, '#2b2a30'); R(px - 6, my - 17, 14, 2, '#2b2a30');
    for (const [k, c, g] of [[-5, '#ff5038', 'rgba(255,70,50,0.10)'], [4, '#ff9a3a', 'rgba(255,150,60,0.08)']]) {
      R(px + k - 2, my - 15, 5, 5, INK); R(px + k - 1, my - 11, 3, 2, c); disc(ctx, px + k, my - 12, 5, g.replace(/0\.\d+\)/, '0.3)'));
      for (let i = 0; i < 12; i++) R(px + k - d * i * 3 - 3 - i, my - 9 + i * 3, 6 + i * 2, 3, g);
    }
  }
  R(cx - sw / 2, sy - 30, sw, 30, 'rgba(255,60,70,0.07)');
  R(cx - sw / 2 - 1, sy - 2, sw + 2, sh + 2, INK); R(cx - sw / 2, sy, sw, sh, '#17151e'); R(cx - sw / 2, sy - 1, sw, 2, '#4a4458');
  for (let x = cx - sw / 2 + 6; x < cx + sw / 2 - 4; x += 12) R(x, sy + 3, 1, sh - 3, '#221f2c');
  for (const d of [-1, 1]) { const bx = Math.round(cx + d * (sw / 2 - 8)) - 6; R(bx - 1, sy - 21, 14, 20, INK); R(bx, sy - 20, 12, 18, '#2a2436'); disc(ctx, bx + 6, sy - 14, 3, '#0d0820'); disc(ctx, bx + 6, sy - 6, 4, '#0d0820'); }
  musicos(ctx, R, cx, sw - 34, sy - 1, t);

  // ----- à esquerda: a barraca de toldo às riscas -----
  const tx = Math.round((cx - ww) / 2) - 2, tw = Math.max(40, Math.min(58, cx - ww - 2));
  R(tx - tw / 2 + 2, gy - 34, tw - 4, 34, '#2a2032'); R(tx - tw / 2 + 4, gy - 30, tw - 8, 14, '#ffcf80'); R(tx - tw / 2 + 2, gy - 15, tw - 4, 15, '#5a3a2a'); R(tx - tw / 2 + 2, gy - 16, tw - 4, 2, '#8a5a3a');
  for (let x = 0; x < tw; x += 5) { const c = (x / 5) % 2 ? '#f2f2ea' : '#2f7a5c'; R(tx - tw / 2 + x, gy - 46, 5, 11, c); R(tx - tw / 2 + x + 1, gy - 35, 3, 2, c); }
  R(tx - tw / 2, gy - 47, tw, 1, INK); R(tx - tw / 2 + 1, gy - 34, 2, 34, '#d8d2c6'); R(tx + tw / 2 - 3, gy - 34, 2, 34, '#d8d2c6');

  // ----- à direita: a escada de pedra, a porta do Xafarix e o toldo verde do gato -----
  const ex0 = cx + ww + 2, ex = Math.round((ex0 + w) / 2), VERDE = '#1f5a44';
  R(ex0, gy - 40, w - ex0, 40, '#cfc8be'); R(ex0, gy - 41, w - ex0, 2, '#efe9df'); R(ex0, gy - 40, w - ex0, 40, 'rgba(30,20,60,0.2)');
  R(ex - 10, gy - 45, 20, 30, INK); R(ex - 9, gy - 44, 18, 29, '#7a3fc0'); R(ex - 6, gy - 44, 12, 29, '#c85aff'); R(ex - 2, gy - 34, 4, 19, '#ff9ad8');     // a porta, com a luz lá dentro
  for (let k = 0; k < 5; k++) { R(ex - 15 + k, gy - 3 * (k + 1), 30 - k * 2, 3, k % 2 ? '#9d978e' : '#b9b3a8'); R(ex - 15 + k, gy - 3 * (k + 1), 30 - k * 2, 1, '#d6d0c6'); }
  for (let i = 0; i < 20; i++) { const half = Math.round(23 * Math.sqrt(1 - Math.pow((19 - i) / 20, 2))); R(ex - half, gy - 73 + i, half * 2, 1, i < 3 ? '#2f7a5c' : VERDE); }
  R(ex - 24, gy - 53, 48, 8, INK); R(ex - 23, gy - 53, 46, 7, VERDE);
  for (let x = ex - 23; x < ex + 23; x += 6) { R(x, gy - 46, 5, 2, VERDE); R(x + 1, gy - 44, 3, 1, VERDE); }
  gato(ctx, ex - 8, gy - 69, '#ffffff', VERDE);
  text(ctx, 'XAFARIX', ex, gy - 52, '#ffffff', { align: 'center' });
  R(ex + 13, gy - 38, 4, 6, INK); R(ex + 14, gy - 37, 2, 4, '#e0303a');                                             // a lanterna vermelha
  for (const d of [-1, 1]) {                                                                                       // os vasos de barro com as iúcas
    const vx = ex + d * 24;
    R(vx - 5, gy - 12, 10, 12, INK); R(vx - 4, gy - 11, 8, 11, '#c8683e'); R(vx - 5, gy - 13, 10, 2, '#e0855a'); R(vx, gy - 26, 1, 14, '#6a5a3a');
    for (const [a, b] of [[-7, -30], [-5, -34], [0, -36], [5, -34], [7, -29], [-8, -24], [8, -23]]) for (let i = 0; i <= 6; i++) R(vx + Math.round((a * i) / 6), gy - 22 + Math.round(((b + 22) * i) / 6), 1, 2, i > 3 ? '#6fae5a' : '#3f7a40');
  }
  manjerico(ctx, R, Math.round(cx + ww - 10), gy);

  // festões e balões de papel, por cima de tudo
  festoes(R, w, top + 1, t, P ? 3 : 1);
  for (let i = 0; i < Math.ceil(w / 80); i++) balao(ctx, R, 24 + i * 80, top + (P ? 30 : 12) + (i % 2) * 6, CORES[(i * 2) % CORES.length], t);

  // ----- a calçada e a gente do arraial -----
  R(0, gy, w, v.h - gy, '#8a8794'); R(0, gy, w, 2, '#a8a4b0');
  for (let y = gy + 4, j = 0; y < v.h; y += 7, j++) for (let x = (j % 2) * 6; x < w; x += 12) R(x, y, 5, 1, j % 3 ? '#7a7684' : '#c8c4d0');
  // quem está a ver o concerto, de costas, entre o palco e nós
  for (let x = cx - sw / 2 - 12, i = 0; x < cx + sw / 2 + 14; x += 11, i++) {
    const hgt = 17 + Math.round(hash(i * 3.3) * 6), hop = Math.round(Math.abs(Math.sin(t * 5 + i * 1.7)) * 2), yb = gy + 1 - hop;
    const c = ['#2a2540', '#3a2f55', '#4a2f48', '#2f3558', '#5a3348'][i % 5];
    R(x - 4, yb - hgt, 9, hgt, c); disc(ctx, x, yb - hgt - 3, 4, ['#2a1c1a', '#d8b870', '#5a3a2a', '#c89a50', '#3a2a26'][i % 5]);
    if (i % 4 === 1) { R(x - 6, yb - hgt - 9, 2, 10, c); R(x - 6, yb - hgt - 11, 2, 2, '#e8c0a0'); }
  }
  for (let i = 0; i < Math.floor(w / 22); i++) {
    const x = 8 + i * 22 + Math.round(hash(i) * 8), y = v.h - 2 + Math.round(Math.abs(Math.sin(t * 5 + i * 1.3)) * -3), hgt = 22 + Math.round(hash(i * 3) * 8);
    if (v.h - gy < 90) break;
    R(x - 5, y - hgt, 10, hgt, '#2a2540'); disc(ctx, x, y - hgt - 4, 5, '#2a2540');
  }
}

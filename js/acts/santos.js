// Nível «Santos»: os Santos Populares em Lisboa.
//   arraial()   — a rua enfeitada: casas, festões, balões de papel, manjericos;
//   Sardinhas   — na banca: tirar cada sardinha (ou bifana) da grelha no ponto certo;
//   PIMBA       — a «pele» do jogo de ritmo (js/acts/ritmo.js) para dançar música pimba no arraial;
//   praceta()   — a praceta em frente ao Xafarix (toldo verde com o gato, o chafariz, o palco
//                 com música ao vivo), onde acabava sempre a noite de Santo António.
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

// A praceta em frente ao Xafarix, na noite de Santo António: a parede de pedra com o toldo
// verde do gato e a porta de luz roxa, a urna de pedra do chafariz, e o palco da música ao vivo.
export function praceta(ctx, v, R, t, act) {
  const gy = act.ground(v), top = act.top(v), w = v.w, P = v.portrait;
  R(0, 0, w, gy, '#161a40');
  stars(ctx, w, top + 20, t, 5, 20);
  // a parede de cantaria
  const wy = Math.max(top - 6, gy - (P ? 150 : 100));
  R(0, wy, w, gy - wy, '#c8b890');
  for (let y = wy, j = 0; y < gy; y += 13, j++) { R(0, y, w, 1, '#a89870'); for (let x = (j % 2) * 16; x < w; x += 32) R(x, y, 1, 13, '#a89870'); }
  R(0, wy, w, gy - wy, 'rgba(255,170,60,0.12)');
  // a porta, com a luz roxa lá dentro, e o toldo verde com o gato e o nome
  const dx = Math.round(w * (P ? 0.5 : 0.4));
  R(dx - 13, gy - 44, 26, 44, INK); R(dx - 12, gy - 43, 24, 43, '#7a3fc0'); R(dx - 8, gy - 43, 16, 43, '#c85aff'); R(dx - 3, gy - 30, 6, 30, '#ff9ad8');
  const aw = 92, ay = gy - 76;
  R(dx - aw / 2 - 1, ay - 1, aw + 2, 28, INK); R(dx - aw / 2, ay, aw, 26, '#1f5a44'); R(dx - aw / 2, ay, aw, 3, '#2f7a5c');
  for (let x = dx - aw / 2; x < dx + aw / 2; x += 8) { R(x, ay + 26, 8, 3, INK); R(x + 1, ay + 26, 6, 2, '#1f5a44'); }
  gato(ctx, dx - 40, ay + 6, '#ffffff', '#1f5a44');
  text(ctx, 'XAFARIX', dx - 16, ay + 9, '#ffffff', { scale: 2 });
  // a urna de pedra do chafariz
  const ux = Math.round(w * (P ? 0.12 : 0.1));
  R(ux - 11, gy - 30, 22, 30, INK); R(ux - 10, gy - 29, 20, 29, '#d8c8a0'); R(ux - 13, gy - 34, 26, 5, INK); R(ux - 12, gy - 33, 24, 3, '#e8d8b0');
  disc(ctx, ux, gy - 46, 11, INK); disc(ctx, ux, gy - 46, 10, '#d8c8a0'); R(ux - 5, gy - 60, 10, 6, INK); R(ux - 4, gy - 59, 8, 4, '#e8d8b0');
  for (let k = -2; k <= 2; k++) R(ux + k * 4, gy - 50, 1, 8, '#b8a880');
  // o palco: estrado, grade de luzes e a banda
  const sx = Math.round(w * (P ? 0.82 : 0.8)), sw = P ? 76 : 96;
  R(sx - sw / 2, gy - 62, 2, 62, INK); R(sx + sw / 2 - 2, gy - 62, 2, 62, INK); R(sx - sw / 2 - 2, gy - 66, sw + 4, 5, INK);
  ['#ff4f8a', '#ffd166', '#6fb0f0'].forEach((c, i) => { const lx = sx - sw / 3 + (i * sw) / 3; R(lx - 3, gy - 61, 7, 5, INK); R(lx - 2, gy - 57, 5, 2, c); for (let k = 0; k < 12; k++) R(lx - 2 - k, gy - 55 + k * 3, 5 + k * 2, 3, c === '#ffd166' ? 'rgba(255,220,150,0.1)' : c === '#ff4f8a' ? 'rgba(255,80,150,0.1)' : 'rgba(110,170,240,0.1)'); });
  R(sx - sw / 2 - 1, gy - 9, sw + 2, 9, INK); R(sx - sw / 2, gy - 8, sw, 8, '#3a3448'); R(sx - sw / 2, gy - 8, sw, 2, '#5a5468');
  [['musico', 'casual', -18], ['musico', 'b', 16]].forEach(([who, outfit, dx2], i) => {
    const bob = Math.round(Math.abs(Math.sin(t * 6 + i * 1.5)) * 2), x = sx + dx2;
    person(ctx, getCharacter(who, outfit), x, gy - 8, { scale: 2, face: -1, hop: bob });
    // guitarra / acordeão
    if (i === 0) { R(x - 12, gy - 30 - bob, 16, 10, INK); R(x - 11, gy - 29 - bob, 14, 8, '#c8843c'); R(x + 3, gy - 30 - bob, 14, 3, INK); R(x - 6, gy - 27 - bob, 3, 3, '#3a2416'); }
    else { R(x - 12, gy - 32 - bob, 20, 14, INK); R(x - 11, gy - 31 - bob, 6, 12, '#c0392b'); R(x - 5, gy - 31 - bob, 6 + Math.round(Math.sin(t * 6) * 2), 12, PAPER); R(x + 2, gy - 31 - bob, 5, 12, '#c0392b'); }
  });
  // festões, balões de papel e manjericos
  festoes(R, w, Math.max(top + 2, wy - 6), t, 3);
  for (let i = 0; i < Math.ceil(w / 80); i++) balao(ctx, R, 24 + i * 80, Math.max(top + 16, wy + 6) + (i % 2) * 8, CORES[(i * 2) % CORES.length], t);
  manjerico(ctx, R, dx + 24, gy);
  // a calçada e a gente do arraial, em silhueta, ao fundo
  R(0, gy, w, v.h - gy, '#8a8794'); R(0, gy, w, 2, '#a8a4b0');
  for (let y = gy + 4, j = 0; y < v.h; y += 7, j++) for (let x = (j % 2) * 6; x < w; x += 12) R(x, y, 5, 1, j % 3 ? '#7a7684' : '#c8c4d0');
  for (let i = 0; i < Math.floor(w / 22); i++) {
    const x = 8 + i * 22 + Math.round(hash(i) * 8), y = v.h - 2 + Math.round(Math.abs(Math.sin(t * 5 + i * 1.3)) * -3), hgt = 22 + Math.round(hash(i * 3) * 8);
    if (v.h - gy < 90) break;
    R(x - 5, y - hgt, 10, hgt, '#2a2540'); disc(ctx, x, y - hgt - 4, 5, '#2a2540');
  }
}

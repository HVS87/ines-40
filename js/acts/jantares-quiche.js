// Nível 13, ato 1: a quiche em casa do Pipoca. A Inês corta o alho-francês, o bacon e os
// cogumelos: a faca avança sozinha e toca-se quando passa por cima de cada risca. O Pipoca bate
// os ovos; a Ana e a Mi põem a mesa e dão palpites. O último corte é sempre o do dedo (faz
// parte da história, não é falha de quem joga): um «ai!», estrelinhas e um penso.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, PINK, SKIN, clamp, lerp, person, shadow, sign, disc } from '../draw.js';
import { cached, box, INOX, INOX_L } from './bimby-comum.js';

const ING = [
  { nome: 'ALHO-FRANCÊS', fala: 'Ana: «Fininho, Inês! Isso é alho-francês, não é lenha.»', quem: 'Ana' },
  { nome: 'BACON', fala: 'Mi: «Esse bacon é para a quiche, não é para ires provando!»', quem: 'Mi' },
  { nome: 'COGUMELOS' },
];
const CUTS = 5;            // riscas por ingrediente
const BEAT = 0.85;         // segundos entre riscas
const TOL = 0.2;           // tolerância de cada corte, em segundos
const LIMIARES = [2, 4, 7, 10, 12];   // cortes certos (em 14) que valem cada coração
const TABUA = '#c98f52';

// A cozinha do Pipoca: parede quente, azulejos, tachos pendurados, janela para a noite e forno.
function cozinhaPipoca(g, R, v, gy) {
  const w = v.w;
  R(0, 0, w, v.h, '#f6e3b4');
  for (let x = 0; x < w; x += 20) R(x, 0, 1, gy, '#efd8a0');
  // azulejos aos quadrados
  for (let y = gy - 44; y < gy - 20; y += 8) for (let x = 0; x < w; x += 8) R(x, y, 8, 8, ((x + y) / 8) % 2 ? '#ffffff' : '#8fc4e8');
  R(0, gy - 46, w, 2, '#3f6fb5');
  // bancada ao fundo
  R(0, gy - 21, w, 1, INK); R(0, gy - 20, w, 3, '#e8dcc0'); R(0, gy - 17, w, 17, '#a8744e');
  for (let x = 10; x < w; x += 30) { R(x, gy - 17, 1, 17, '#8a5a34'); R(x + 12, gy - 13, 6, 2, '#e8c890'); }
  // tachos pendurados
  const ry = gy - 84;
  R(8, ry, Math.min(w - 16, 120), 2, '#5a6072');
  for (let i = 0; i < 4; i++) { const x = 18 + i * 28; R(x + 4, ry + 2, 1, 5, INK); box(R, x, ry + 7, 10, 7 + (i % 2) * 2, i % 2 ? '#c98f52' : '#5a6072'); R(x + 10, ry + 9, 6, 2, INK); }
  // janela (é de noite)
  const jx = Math.max(140, w - 60);
  if (jx + 40 < w) { box(R, jx, ry - 4, 36, 30, '#2a2358'); disc(g, jx + 26, ry + 5, 4, '#fff3c4'); R(jx + 6, ry + 3, 1, 1, '#ffffff'); R(jx + 14, ry + 14, 1, 1, '#ffffff'); R(jx + 17, ry - 4, 2, 30, '#ffffff'); R(jx, ry + 10, 36, 2, '#ffffff'); }
  // candeeiro por cima da mesa
  const lx = Math.round((v.portrait ? w : w * 0.42) * 0.25), ly = Math.max(ry - 22, 20);
  R(lx, 0, 1, ly, INK); box(R, lx - 9, ly, 18, 6, '#d43d51'); R(lx - 6, ly - 3, 12, 3, '#d43d51'); R(lx - 3, ly + 6, 6, 2, '#fff3c4');
  // ao alto sobra parede: uma prateleira de pratos e um relógio
  if (ry > 190) {
    const sy = Math.round(ry * 0.62);
    box(R, w - 110, sy, 96, 3, '#8a5a34');
    for (let i = 0; i < 5; i++) { disc(g, w - 100 + i * 19, sy - 9, 8, INK); disc(g, w - 100 + i * 19, sy - 9, 7, '#ffffff'); disc(g, w - 100 + i * 19, sy - 9, 4, i % 2 ? '#8fc4e8' : '#f6e3b4'); }
    disc(g, 118, sy - 16, 12, INK); disc(g, 118, sy - 16, 11, '#ffffff'); R(118, sy - 24, 1, 9, INK); R(118, sy - 16, 6, 1, INK);
  }
  // chão de tijoleira
  R(0, gy, w, v.h - gy, '#b8704a');
  for (let y = gy, k = 0; y < v.h; y += 10, k++) { R(0, y, w, 1, '#96583a'); for (let x = (k % 2) * 10; x < w; x += 20) R(x, y, 1, 10, '#96583a'); }
}

export class JantaresQuiche extends Act {
  get max() { return this.cfg.hearts || LIMIARES.length; }

  start() {
    this.k = 0;                 // ingrediente atual
    this.kt = 0;                // tempo da faca neste ingrediente
    this.marks = new Array(CUTS).fill(null);   // null | 'ok' | 'bad' | 'miss'
    this.badAt = [];            // onde ficaram os cortes tortos (em tempo de faca)
    this.good = 0;
    this.pause = 1.8;           // espera inicial (para ler) e entre ingredientes
    this.pending = false;
    this.dip = 0;
    this.phase = 'cut';         // cut → ai
    this.at = 0; this.penso = false;
    this.who = '';
    this.ines = getCharacter('ines', 'casual');
    this.pipoca = getCharacter('pipoca', 'avental');
    this.ana = getCharacter('ana', 'casual');
    this.mi = getCharacter('mi', 'casual');
    this.hint('Toca quando a faca passar por cima de cada risca!');
  }

  lay(v) {
    const top = this.top(v);
    if (v.portrait) {
      const sh = Math.round((v.h - top) * 0.45), bh = Math.min(150, v.h - top - sh - 30);
      return { top, gy: top + sh, sx: 0, sw: v.w, bx: 8, by: top + sh + 18, bw: v.w - 16, bh };
    }
    const sw = Math.round(v.w * 0.42);
    return { top, gy: Math.round(v.h * 0.88), sx: 0, sw, bx: sw + 2, by: top + 6, bw: v.w - sw - 8, bh: v.h - top - 14 };
  }

  // Geometria da tábua: início e comprimento do ingrediente, centro vertical.
  board(L) {
    const x0 = L.bx + 20, len = L.bw - 20 - 50, yc = L.by + 22 + Math.round((L.bh - 34) / 2);
    return { x0, len, yc, mx: (i) => Math.round(x0 + (len * (i + 1)) / (CUTS + 1)), kx: (kt) => x0 + Math.min(len + 4, (len * kt) / (BEAT * (CUTS + 1))) };
  }

  update(dt, I, v) {
    if (this.dip > 0) this.dip -= dt;
    if (this.phase === 'ai') {
      this.at += dt;
      if (!this.penso && this.at > 1.6) {
        this.penso = true; this.who = 'Pipoca'; this.sfx('pop');
        this.hint('Pipoca: «Calma, não é nada! Um penso... e urgências, só por via das dúvidas.»');
      }
      if (this.at > 5 || (this.at > 2.6 && I.actionPressed)) this.done();
      return;
    }
    if (this.pause > 0) {
      this.pause -= dt;
      if (this.pause <= 0 && this.pending) {
        this.pending = false; this.k++; this.kt = 0; this.marks.fill(null); this.badAt = [];
      }
      return;
    }
    this.kt += dt;
    const last = this.k === ING.length - 1, i = this.marks.indexOf(null);
    // o último corte do último ingrediente é o do dedo, faça-se o que se fizer
    if (last && i === CUTS - 1) {
      if (this.kt >= CUTS * BEAT - (I.actionPressed ? 0.3 : 0)) this.ai(v);
      return;
    }
    const d = this.kt - (i + 1) * BEAT;
    if (I.actionPressed) {
      this.dip = 0.14;
      const b = this.board(this.lay(v));
      if (Math.abs(d) <= TOL) {
        this.marks[i] = 'ok'; this.good++; this.sfx('toc');
        this.fx.burst(b.mx(i), b.yc, 6, ['#ffffff', '#5cf08a', GOLD], 40);
        while (this.got < LIMIARES.length && this.good >= LIMIARES[this.got]) this.heart(1, b.mx(i), b.yc - 20);
      } else { this.marks[i] = 'bad'; this.badAt.push(this.kt); this.sfx('click'); }
    } else if (d > TOL) this.marks[i] = 'miss';
    if (!last && this.marks.indexOf(null) < 0) {
      this.pause = 1.5; this.pending = true;
      this.who = ING[this.k].quem; this.hint(ING[this.k].fala);
    }
  }

  ai(v) {
    const b = this.board(this.lay(v));
    this.phase = 'ai'; this.at = 0; this.dip = 0.4; this.who = 'Inês';
    this.sfx('hurt');
    this.fx.burst(b.mx(CUTS - 1), b.yc - 4, 16, [GOLD, '#ffffff', PINK], 70);
    this.hint('Inês: «Ai! O dedo!»');
  }

  draw(ctx, v, R) {
    const L = this.lay(v), t = this.t, gy = L.gy;
    ctx.drawImage(cached(this, 'pip' + L.top, v, (g, r) => cozinhaPipoca(g, r, v, gy)), 0, 0);

    // ----- a cozinha: a Mi e a Ana põem a mesa, o Pipoca bate os ovos, a Inês corta -----
    const X = (f) => Math.round(L.sx + L.sw * f);
    const hop = (n, k) => (this.who === n ? Math.round(Math.abs(Math.sin(t * 7)) * 2) : this.phase === 'ai' && !this.penso ? Math.round(Math.abs(Math.sin(t * 10 + k)) * 2) : 0);
    for (const [f, who, n, face] of [[0.12, this.mi, 'Mi', 1], [0.36, this.ana, 'Ana', 1], [0.62, this.pipoca, 'Pipoca', 1], [0.87, this.ines, 'Inês', v.portrait ? -1 : 1]]) {
      shadow(ctx, X(f), gy, 14);
      person(ctx, who, X(f), gy, { scale: 2, face, hop: hop(n, f * 9) });
    }
    // a mesa, com toalha aos quadrados, pratos e copos
    const tx = X(0.03), tw = Math.round(L.sw * 0.44);
    R(tx + 3, gy - 14, 3, 14, '#6a4424'); R(tx + tw - 6, gy - 14, 3, 14, '#6a4424');
    box(R, tx, gy - 20, tw, 8, '#ffffff');
    for (let x = 0; x < tw; x += 8) R(tx + x, gy - 20 + ((x / 8) % 2) * 4, 4, 4, '#d43d51');
    for (let i = 0; i < 3; i++) { const px = tx + 8 + (i * (tw - 16)) / 2; R(px - 5, gy - 22, 10, 2, INK); R(px - 4, gy - 22, 8, 1, '#ffffff'); R(px + 6, gy - 26, 3, 5, '#bfe6fa'); }
    // a taça e a vara de arames do Pipoca
    const px = X(0.62) + 12, wy = Math.round(Math.sin(t * 14) * 2);
    R(px - 6, gy - 27, 12, 6, INK); R(px - 5, gy - 26, 10, 4, PAPER); R(px - 4, gy - 26, 8, 1, GOLD);
    R(px + wy, gy - 34, 1, 8, INK); R(px - 1 + wy, gy - 28, 3, 3, INOX);
    if (this.phase === 'ai' && !this.penso) { const ix = X(0.87); R(ix - 1, gy - 60, 3, 6, '#e0572f'); R(ix - 1, gy - 52, 3, 2, '#e0572f'); }

    // ----- a tábua, em grande -----
    const b = this.board(L), last = this.k === ING.length - 1;
    R(L.bx - 2, L.by - 2, L.bw + 4, L.bh + 4, INK);
    R(L.bx, L.by, L.bw, L.bh, PAPER);
    R(L.bx + 2, L.by + 2, L.bw - 4, L.bh - 4, '#e8d9b8');
    box(R, L.bx + 8, L.by + 22, L.bw - 16, L.bh - 34, TABUA);
    for (let y = L.by + 28; y < L.by + L.bh - 14; y += 9) R(L.bx + 8, y, L.bw - 16, 1, '#b87f44');
    sign(ctx, ING[this.k].nome, L.bx + L.bw / 2, L.by + 5, { bg: '#3a2f4f' });

    const slide = this.pending ? clamp(1 - this.pause / 0.5, 0, 1) : 0;   // o ingrediente cortado sai pela esquerda
    ctx.save();
    ctx.beginPath(); ctx.rect(L.bx + 2, L.by + 2, L.bw - 4, L.bh - 4); ctx.clip();
    this.ingredient(ctx, R, b, this.k, -slide * (b.len + 40));
    // os cortes já feitos
    if (!slide) {
      this.marks.forEach((m, i) => {
        const mx = b.mx(i);
        if (m === 'ok') R(mx - 1, b.yc - 13, 2, 26, TABUA);
        else if (!m) {
          const next = i === this.marks.indexOf(null), c = next ? GOLD : '#ffffff';
          for (let y = -14; y < 14; y += 4) R(mx, b.yc + y, 1, 2, c);
          R(mx - 2, b.yc - 20, 5, 2, c); R(mx - 1, b.yc - 18, 3, 1, c); R(mx, b.yc - 17, 1, 1, c);
        }
      });
      for (const kt of this.badAt) { const x = Math.round(b.kx(kt)); R(x - 3, b.yc - 13, 2, 13, TABUA); R(x + 1, b.yc, 2, 13, TABUA); }
    }
    // a mão da Inês a segurar (no fim, distraída, chega os dedos à última risca)
    const near = last && this.marks.indexOf(null) === CUTS - 1 ? clamp((this.kt - (CUTS - 1) * BEAT) / 0.5, 0, 1) : this.phase === 'ai' ? 1 : 0;
    const hx = Math.round(lerp(b.x0 + b.len - 8, b.mx(CUTS - 1) - 3, near));
    R(hx + 30, b.yc - 8, L.bx + L.bw - hx - 30, 16, '#e0527a');
    R(hx + 30, b.yc - 8, 2, 16, '#b83a62');
    box(R, hx + 12, b.yc - 9, 20, 18, SKIN);
    [3, 0, 1, 5].forEach((o, i) => { R(hx + o - 1, b.yc - 9 + i * 4, 16 - o, 5, INK); R(hx + o, b.yc - 8 + i * 4, 15 - o, 3, SKIN); });
    if (this.penso) { box(R, hx + 1, b.yc - 5, 8, 5, '#e8b88a'); R(hx + 3, b.yc - 4, 4, 3, '#fff6e6'); }
    // a faca
    if (!slide && this.pause <= 0) {
      const kx = Math.round(this.phase === 'ai' ? b.mx(CUTS - 1) : b.kx(this.kt)), ky = b.yc - 38 + (this.dip > 0 ? 23 : 0);
      box(R, kx - 3, ky - 11, 7, 12, '#5a3a22'); R(kx - 1, ky - 8, 1, 1, GOLD); R(kx - 1, ky - 4, 1, 1, GOLD);
      box(R, kx - 2, ky + 1, 5, 21, INOX_L); R(kx + 1, ky + 1, 2, 21, INOX);
      R(kx - 1, ky + 22, 3, 1, INK); R(kx - 1, ky + 22, 2, 1, INOX_L);
    }
    // estrelinhas à volta do dedo
    if (this.phase === 'ai' && !this.penso) {
      for (let i = 0; i < 5; i++) {
        const a = t * 4 + i * 1.26, x = hx + 4 + Math.cos(a) * 14, y = b.yc - 6 + Math.sin(a) * 10;
        R(x - 2, y, 5, 1, GOLD); R(x, y - 2, 1, 5, GOLD);
      }
    }
    ctx.restore();
  }

  // O ingrediente inteiro, deitado na tábua (dx: deslocamento ao sair).
  ingredient(ctx, R, b, k, dx) {
    const x0 = b.x0 + dx, y = b.yc, len = b.len;
    if (k === 0) {
      box(R, x0, y - 7, len, 14, '#f4f4e6');
      R(x0 + len * 0.35, y - 7, len * 0.2, 14, '#c8e09a');
      R(x0 + len * 0.55, y - 7, len * 0.45, 14, '#5a9a4a');
      R(x0 + len * 0.55, y - 2, len * 0.45, 2, '#3f7a3a'); R(x0 + len * 0.7, y + 3, len * 0.3, 1, '#3f7a3a');
      R(x0, y - 7, len, 2, 'rgba(255,255,255,0.35)');
      for (let i = 0; i < 3; i++) R(x0 - 4, y - 5 + i * 4, 4, 1, '#c9b88a');
    } else if (k === 1) {
      box(R, x0, y - 9, len, 18, '#d8526a');
      R(x0, y - 5, len, 3, '#ffd9d0'); R(x0, y + 3, len, 2, '#ffd9d0');
      for (let x = 6; x < len - 6; x += 14) { R(x0 + x, y - 6, 6, 1, '#ffd9d0'); R(x0 + x + 6, y + 5, 5, 1, '#ffd9d0'); }
      R(x0, y - 9, len, 1, '#f08a9a');
    } else {
      for (let i = 0; i < CUTS; i++) {
        const mx = b.mx(i) + dx;
        box(R, mx - 4, y, 8, 10, '#f4ecd8');
        R(mx - 10, y - 5, 20, 7, INK); R(mx - 8, y - 9, 16, 5, INK);
        R(mx - 9, y - 4, 18, 5, '#c9a078'); R(mx - 7, y - 8, 14, 4, '#c9a078'); R(mx - 5, y - 7, 5, 1, '#e8c8a0');
      }
    }
  }

  bot(I) {
    if (this.phase === 'ai') { if (this.at > 2.8) I.actionPressed = true; return; }
    if (this.pause > 0) return;
    const i = this.marks.indexOf(null);
    if (i < 0 || (this.k === ING.length - 1 && i === CUTS - 1)) return;
    if (Math.abs(this.kt - (i + 1) * BEAT) < 0.05) I.actionPressed = true;
  }
}

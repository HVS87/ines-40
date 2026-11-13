// Nível 18, ato 2: montar a gala. A sala vê-se de lado (mais larga do que o ecrã: a câmara
// segue a Inês, de auricular). Vão aparecendo imprevistos, um de cada vez, em seis postos:
// microfone, projetor, luzes, mesas, catering e crachás. Levar a Inês até lá (arrastar o dedo ou
// setas) antes de o tempo acabar vale um coração; se não, a Bárbara resolve (sem coração).
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, PINK, MINT, clamp, person, shadow, text, mark, mkR } from '../draw.js';
import { box, bimby, VERDE, INOX, INOX_D } from './bimby-comum.js';

const POSTOS = [
  { k: 'micro', x: 0.07, pede: 'Isabel: «Inês! O microfone não para de apitar!»', feito: 'Um, dois... som! O microfone já não apita.' },
  { k: 'projetor', x: 0.25, pede: 'Isabel: «Inês, o projetor não liga!»', feito: 'Estava desligado da tomada. Um clássico!' },
  { k: 'luzes', x: 0.41, pede: 'Bárbara: «As luzes do palco apagaram-se todas!»', feito: 'Luzes afinadas: o palco já brilha.' },
  { k: 'mesas', x: 0.57, pede: 'Bárbara: «Faltam cadeiras nesta mesa!»', feito: 'Cadeiras a caminho... e já cá estão.' },
  { k: 'catering', x: 0.74, pede: 'Bárbara: «O catering chegou, mas as travessas vêm vazias!»', feito: 'Croquetes localizados. Crise resolvida!' },
  { k: 'crachas', x: 0.9, pede: 'Isabel: «Os crachás estão todos misturados!»', feito: 'Crachás por ordem alfabética. Impecável.' },
];
const ORDEM = [1, 4, 0, 3, 5, 2];
const VEL = 105;          // velocidade da Inês (píxeis por segundo)
const OBRA = 1.1;         // segundos para resolver um imprevisto
const FOLGA = 2.8;        // folga além do tempo de lá chegar
const CORES = [PINK, GOLD, MINT, '#6fb0f0', '#c79bff'];

export class EventosGala extends Act {
  get max() { return this.cfg.hearts || POSTOS.length; }

  start(v) {
    this.W = Math.max(470, v.w);
    this.px = this.W * 0.5; this.face = 1; this.dist = 0; this.moving = false;
    this.cam = clamp(this.px - v.w / 2, 0, this.W - v.w);
    this.fixed = POSTOS.map(() => false);
    this.n = 0;               // imprevistos já lançados
    this.cur = -1;            // posto com imprevisto (-1: nenhum)
    this.gap = 2.4; this.tt = 0; this.T = 0; this.prog = 0; this.over = 0;
    this.ines = getCharacter('ines', 'work');
    this.barbara = getCharacter('barbara', 'festa');
    this.isabel = getCharacter('isabelv', 'festa');
    this.hint('Arrasta o dedo (ou usa as setas) e leva a Inês a cada imprevisto antes que o tempo acabe!');
  }

  update(dt, I, v) {
    this.W = Math.max(470, v.w);
    if (this.over) { this.over += dt; if (this.over > 2.6) this.done(); return; }
    // a Inês anda atrás do dedo (ou das setas)
    let dx = 0;
    if (I.pointerX >= 0) { const tx = this.cam + I.pointerX * v.w; if (Math.abs(tx - this.px) > 3) dx = clamp(tx - this.px, -VEL * dt, VEL * dt); }
    else if (I.left) dx = -VEL * dt;
    else if (I.right) dx = VEL * dt;
    this.moving = dx !== 0;
    if (dx) { this.face = dx > 0 ? 1 : -1; this.px = clamp(this.px + dx, 14, this.W - 14); this.dist += Math.abs(dx); }
    this.cam += (clamp(this.px - v.w / 2, 0, this.W - v.w) - this.cam) * Math.min(1, dt * 8);

    if (this.cur < 0) {
      this.gap -= dt;
      if (this.gap <= 0) {
        this.cur = ORDEM[this.n++]; this.tt = 0; this.prog = 0;
        this.T = Math.abs(POSTOS[this.cur].x * this.W - this.px) / VEL + OBRA + FOLGA;
        this.sfx('plim');
        this.hint(POSTOS[this.cur].pede);
      }
      return;
    }
    const p = POSTOS[this.cur], sx = p.x * this.W, at = Math.abs(this.px - sx) < 14;
    this.tt += dt;
    if (at) {
      if (Math.floor(this.prog * 4) !== Math.floor((this.prog + dt / OBRA) * 4)) this.sfx('toc');
      this.prog += dt / OBRA;
      if (this.prog >= 1) this.solve(this.tt <= this.T + 0.6, v);
    } else if (this.tt > this.T) this.solve(false, v);
  }

  solve(ok, v) {
    const p = POSTOS[this.cur], gy = this.gy(v);
    this.fixed[this.cur] = true;
    this.fx.burst(p.x * this.W - this.cam, gy - 30, 12, [GOLD, '#ffffff', MINT], 60);
    if (ok) { this.heart(1, p.x * this.W - this.cam, gy - 50); this.sfx('check'); this.hint(p.feito); }
    else { this.sfx('click'); this.hint('Bárbara: «Deixa estar, Inês, deste trato eu!»'); }
    this.cur = -1; this.gap = 1.9;
    if (this.n >= ORDEM.length) {
      this.over = 0.01; this.sfx('win');
      this.hint(ok ? p.feito + ' Tudo pronto: que abram as portas!' : 'Tudo pronto, mesmo em cima da hora: que abram as portas!');
    }
  }

  gy(v) { return Math.round(v.h * (v.portrait ? 0.74 : 0.86)); }

  // A sala (parte fixa), desenhada uma vez num canvas com a largura do mundo.
  hall(v, top, gy) {
    const W = this.W, k = `${W}x${v.h}:${top}`;
    if (this.bg && this.bg.k === k) return this.bg.c;
    const c = document.createElement('canvas');
    c.width = W; c.height = v.h;
    const g = c.getContext('2d'), R = mkR(g);
    R(0, 0, W, v.h, '#33265a');
    for (let x = 0; x < W; x += 60) { R(x + 26, 0, 8, gy, '#3f3070'); R(x + 26, 0, 1, gy, '#c9a24a'); R(x + 33, 0, 1, gy, '#c9a24a'); }
    // faixas verdes penduradas (quando a parede é alta)
    if (gy - top > 150) for (let x = 200; x < W - 30; x += 120) { box(R, x, top + 22, 26, gy - top - 120, VERDE); R(x, top + 22, 26, 4, '#2f7f52'); R(x + 8, top + 36, 10, 6, '#ffffff'); R(x + 10, top + 30, 6, 6, INOX); }
    // a treliça das luzes
    R(0, top + 4, W, 1, INK); R(0, top + 5, W, 4, '#5a6072'); R(0, top + 9, W, 1, INK);
    for (let x = 0; x < W; x += 8) R(x, top + 5, 1, 4, '#2a2f3a');
    // o palco: cortinas, ecrã e estrado
    const sw = Math.round(W * 0.33);
    R(0, top + 10, sw, gy - top - 18, '#241a4a');
    for (let x = 0; x < 22; x += 6) { R(x, top + 10, 4, gy - top - 18, '#8a2338'); R(x + 4, top + 10, 2, gy - top - 18, '#6a1a2a'); }
    for (let x = sw - 18; x < sw; x += 6) { R(x, top + 10, 4, gy - top - 18, '#8a2338'); R(x + 4, top + 10, 2, gy - top - 18, '#6a1a2a'); }
    R(0, top + 10, sw, 6, '#8a2338'); for (let x = 0; x < sw; x += 8) R(x, top + 16, 6, 3, '#8a2338');
    box(R, 0, gy - 8, sw + 4, 8, '#8a5a34'); R(0, gy - 8, sw + 4, 2, '#b8834a'); R(0, gy - 3, sw + 4, 3, '#1c1c28');
    // o chão: alcatifa
    R(0, gy, W, v.h - gy, '#7a2338'); R(0, gy, W, 2, '#c9a24a');
    for (let y = gy + 8, r = 0; y < v.h; y += 10, r++) for (let x = (r % 2) * 10; x < W; x += 20) R(x, y, 3, 2, '#96303f');
    // mesas ao fundo (decoração)
    for (const f of [0.5, 0.66, 0.82]) { const x = Math.round(W * f); R(x - 9, gy - 22, 18, 1, INK); R(x - 8, gy - 21, 16, 5, '#d8d3e6'); R(x - 1, gy - 16, 2, 8, '#5a6072'); R(x - 1, gy - 26, 2, 4, VERDE); R(x - 2, gy - 28, 4, 3, PINK); }
    this.bg = { k, c };
    return c;
  }

  draw(ctx, v, R) {
    const top = this.top(v), gy = this.gy(v), t = this.t, W = this.W, cam = Math.round(this.cam);
    ctx.drawImage(this.hall(v, top, gy), -cam, 0);
    const X = (f) => Math.round(W * f) - cam, F = this.fixed;
    const pulse = Math.floor(t * 6) % 2;

    // ----- luzes: os focos da treliça e a mesa de luz -----
    for (let i = 0; i < 9; i++) {
      const x = Math.round((W * (i + 0.5)) / 9) - cam;
      box(R, x - 3, top + 10, 6, 5, '#2a2f3a');
      R(x - 2, top + 15, 4, 2, F[2] ? CORES[i % 5] : '#11131a');
      if (F[2]) { ctx.globalAlpha = 0.1; ctx.fillStyle = CORES[i % 5]; ctx.beginPath(); ctx.moveTo(x - 2, top + 17); ctx.lineTo(x + 2, top + 17); ctx.lineTo(x + 22, gy); ctx.lineTo(x - 22, gy); ctx.fill(); ctx.globalAlpha = 1; }
    }
    let x = X(0.41);
    box(R, x - 13, gy - 18, 26, 10, '#5a6072'); R(x - 13, gy - 18, 26, 2, INOX_D); R(x - 11, gy - 8, 2, 8, '#11131a'); R(x + 9, gy - 8, 2, 8, '#11131a');
    for (let i = 0; i < 6; i++) R(x - 11 + i * 4, gy - 15 + (F[2] ? (i * 3) % 4 : 3), 2, 3, F[2] ? CORES[i % 5] : '#2a2f3a');

    // ----- projetor: o ecrã do palco e o projetor no tripé -----
    const ex = X(0.17);
    box(R, ex - 34, gy - 62, 68, 40, F[1] ? '#f4f8ff' : '#11131a');
    if (F[1]) { text(ctx, 'GALA', ex - 30, gy - 56, VERDE, { scale: 2 }); bimby(ctx, R, ex + 18, gy - 26, 1, {}); }
    else text(ctx, 'SEM SINAL', ex, gy - 45, '#5a6072', { align: 'center' });
    x = X(0.25);
    R(x - 1, gy - 22, 2, 22, INK); R(x - 5, gy - 2, 10, 2, INK);
    box(R, x - 8, gy - 30, 16, 8, '#d8dce6'); R(x - 10, gy - 28, 2, 4, F[1] ? '#fff3c4' : INK);
    R(x + 8, gy - 26, 6, 1, INK); R(x + 13, gy - 26, 1, 24, INK);
    if (F[1]) R(x + 13, gy - 3, 12, 1, INK); else { R(x + 13, gy - 3, 5, 1, INK); R(x + 18, gy - 4, 2, 3, GOLD); }
    box(R, x + 24, gy - 8, 5, 6, PAPER);

    // ----- microfone, no estrado -----
    x = X(0.07);
    R(x, gy - 40, 1, 32, INOX); R(x - 4, gy - 9, 9, 1, INK); box(R, x - 2, gy - 46, 4, 6, '#3a3f55'); R(x - 1, gy - 45, 2, 2, INOX);
    if (!F[0]) for (let i = 0; i < 3; i++) { const o = 6 + i * 4 + pulse; R(x - o, gy - 46 + (i % 2) * 3, 2, 2, '#ff5d5d'); R(x + o, gy - 44 - (i % 2) * 3, 2, 2, '#ff5d5d'); }

    // ----- a mesa a que faltam cadeiras -----
    x = X(0.57);
    if (F[3]) for (const d of [-22, 16]) { box(R, x + d, gy - 22, 6, 12, '#e0b84a'); box(R, x + d - 1, gy - 10, 8, 3, '#e0b84a'); R(x + d, gy - 6, 1, 6, INK); R(x + d + 5, gy - 6, 1, 6, INK); }
    R(x - 2, gy - 8, 4, 8, '#5a6072');
    box(R, x - 15, gy - 16, 30, 8, '#ffffff'); R(x - 15, gy - 10, 30, 2, '#d8dce6');
    R(x - 1, gy - 22, 2, 6, VERDE); R(x - 3, gy - 25, 3, 3, PINK); R(x, gy - 26, 3, 3, GOLD);

    // ----- o catering -----
    x = X(0.74);
    box(R, x - 22, gy - 15, 44, 15, '#ffffff'); R(x - 22, gy - 15, 44, 2, '#d8dce6'); R(x - 22, gy - 4, 44, 4, VERDE);
    for (let i = 0; i < 3; i++) {
      const tx = x - 19 + i * 14;
      box(R, tx, gy - 19, 10, 3, INOX);
      if (F[4]) for (let j = 0; j < 3; j++) { R(tx + 1 + j * 3, gy - 22, 3, 3, INK); R(tx + 1 + j * 3, gy - 22, 2, 2, '#c98f52'); }
    }

    // ----- os crachás -----
    x = X(0.9);
    box(R, x + 12, gy - 54, 14, 54, PAPER); R(x + 12, gy - 54, 14, 10, VERDE); R(x + 15, gy - 38, 8, 6, INOX); R(x + 14, gy - 32, 10, 5, '#d8dce6');
    box(R, x - 18, gy - 16, 30, 16, VERDE); R(x - 18, gy - 16, 30, 3, '#ffffff');
    for (let i = 0; i < 5; i++) {
      const bx = x - 16 + i * 6, by = gy - 22 + (F[5] ? 0 : [2, -3, 1, -4, 3][i]);
      R(bx - 1, by - 1, 6, 7, INK); R(bx, by, 4, 5, '#ffffff'); R(bx, by, 4, 1, F[5] ? VERDE : CORES[i]);
    }

    // ----- a Bárbara e a Isabel -----
    const who = (this.s.lastHint || '').split(':')[0];
    for (const [f, fr, n, face] of [[0.335, this.isabel, 'Isabel', 1], [0.82, this.barbara, 'Bárbara', -1]]) {
      shadow(ctx, X(f), gy, 14);
      person(ctx, fr, X(f), gy, { scale: 2, face, hop: who === n ? Math.round(Math.abs(Math.sin(t * 8)) * 2) : 0 });
    }

    // ----- a Inês, de auricular -----
    const px = Math.round(this.px) - cam, fc = this.face, work = this.cur >= 0 && Math.abs(this.px - POSTOS[this.cur].x * W) < 14;
    shadow(ctx, px, gy, 14);
    person(ctx, this.ines, px, gy, { scale: 2, face: fc, moving: this.moving, dist: this.dist, hop: work ? pulse : 0 });
    const hy = gy - (work ? pulse : 0), M = (dx, wd) => (fc > 0 ? px + dx : px - dx - wd);
    R(px - 8, hy - 44, 16, 2, '#11131a'); R(M(-9, 4), hy - 36, 4, 7, '#11131a'); R(M(-5, 9), hy - 27, 9, 1, '#11131a'); R(M(3, 2), hy - 28, 2, 3, '#11131a');

    // ----- o imprevisto do momento: balão, tempo e seta se estiver fora do ecrã -----
    if (this.cur >= 0) {
      const p = POSTOS[this.cur], sx = X(p.x), left = clamp(1 - this.tt / this.T, 0, 1), by = gy - 70 + pulse * 2;
      if (sx < 10 || sx > v.w - 10) {
        const ax = sx < 10 ? 12 : v.w - 12, d = sx < 10 ? -1 : 1, o = pulse * 2 * d;
        box(R, ax - 8 + o, by - 4, 16, 14, GOLD);
        for (let i = 0; i < 5; i++) R(ax - 3 * d + i * d + o, by - 1 + i, 1, 9 - i * 2, INK);
      } else {
        mark(ctx, sx, by, '!');
        box(R, sx - 9, by + 4, 18, 3, '#3a2f4f'); R(sx - 9, by + 4, Math.round(18 * left), 3, left < 0.3 ? '#ff5d5d' : '#5cf08a');
        if (work) { box(R, px - 10, gy - 56, 20, 4, '#3a2f4f'); R(px - 10, gy - 56, Math.round(20 * clamp(this.prog, 0, 1)), 4, GOLD); }
      }
    }
    // os seis postos, em baixo: já resolvidos ou por resolver
    const cx = Math.round(v.w / 2) - 33;
    for (let i = 0; i < POSTOS.length; i++) { const o = ORDEM[i]; box(R, cx + i * 11, v.h - 9, 8, 5, this.fixed[o] ? '#5cf08a' : o === this.cur ? GOLD : '#3a2f4f'); }
  }

  bot(I) {
    if (this.over || this.cur < 0) return;
    const sx = POSTOS[this.cur].x * this.W;
    if (this.px < sx - 5) I.right = true; else if (this.px > sx + 5) I.left = true;
  }
}

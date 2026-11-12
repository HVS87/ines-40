// «Verões em Santo Amaro»: o comboio da Linha de Cascais, de Santo Amaro até Alcântara-Mar,
// de noite, com o rio e a lua ao fundo (e, lá para o fim, a Ponte 25 de Abril). Em cada estação
// toca-se quando a porta dourada chega à marca amarela do cais: o comboio trava e, se parar em
// cima da marca, dá um coração. Se ninguém tocar, ele para sozinho mais à frente (sem coração).
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, PINK, PAPER, hash, sky, stars, disc, person, sign } from '../draw.js';

const NOMES = ['Paço de Arcos', 'Caxias', 'Cruz Quebrada', 'Algés', 'Belém', 'Alcântara-Mar'];
const GAP = 460;        // distância entre estações (píxeis de jogo)
const TRAVA = 12;       // distância que o comboio ainda anda depois do toque
const TOL = 13;         // meia largura da marca amarela
const CAR = 74;         // comprimento de uma carruagem
const CABELOS = ['#6b4226', '#8a5f3a', '#c9985a', '#a8562e'];
const mod = (a, n) => ((a % n) + n) % n;

export class VeraoComboio extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    this.girls = ['ines', 'isabel', 'ana', 'soft'].map((w) => getCharacter(w, 'night'));
    this.pos = 0; this.speed = 0; this.k = 0; this.a = 0;
    this.mode = 'board';    // board → go → brake → stop → go ... → arrive
    this.mt = 0; this.res = []; this.told = -1;
    this.hint('Estação de Santo Amaro: todas a bordo! Destino: Alcântara-Mar.');
  }

  mark(k) { return (k + 1) * GAP; }

  update(dt, I) {
    this.mt += dt;
    const last = NOMES.length - 1;
    if (this.mode === 'board') { if (this.mt > 2.4) { this.mode = 'go'; this.mt = 0; this.sfx('ring'); } return; }
    if (this.mode === 'arrive') { if (this.mt > 3) this.done(); return; }
    if (this.mode === 'stop') {
      if (this.mt > 1.5 || (this.mt > 0.7 && I.actionPressed)) { this.k++; this.mode = 'go'; this.mt = 0; }
      return;
    }
    const d = this.mark(this.k) - this.pos;
    if (this.mode === 'go') {
      const near = d < 170, target = near ? 64 + this.k * 7 : 190;
      this.speed = this.speed < target ? Math.min(target, this.speed + 130 * dt) : Math.max(target, this.speed - 200 * dt);
      if (near && this.told !== this.k) { this.told = this.k; this.hint(`Próxima paragem: ${NOMES[this.k]}. Toca quando a porta dourada chegar à marca amarela!`); }
      if ((I.actionPressed && d < 70) || d < -30) { this.mode = 'brake'; this.a = (this.speed * this.speed) / (2 * TRAVA); this.sfx('saw'); }
    } else {
      this.speed -= this.a * dt;
      if (this.speed <= 0) {
        this.speed = 0;
        const e = -d, ok = Math.abs(e) <= TOL, v = this.game.view, L = this.layout(v);
        this.res[this.k] = ok;
        if (ok) { this.heart(1, L.doorX, L.gy - 50); this.sfx('plim'); } else this.sfx('toc');
        if (this.k >= last) { this.mode = 'arrive'; this.hint('Inês: «Alcântara-Mar! É aqui que saímos!»'); }
        else { this.mode = 'stop'; this.hint(`${NOMES[this.k]}: ${ok ? 'paragem perfeita!' : e > 0 ? 'passou um bocadinho da marca...' : 'parou antes da marca...'}`); }
        this.mt = 0;
      }
    }
    this.pos += this.speed * dt;
  }

  layout(v) {
    const top = this.top(v), gy = v.portrait ? Math.round(v.h * 0.6) : v.h - 20;
    return { top, gy, hy: gy - 62, doorX: Math.round(v.w * (v.portrait ? 0.52 : 0.42)) };
  }

  fundo(ctx, v, R, L, t) {
    const { gy, hy, top } = L, w = v.w, pos = this.pos;
    sky(ctx, w, v.h, hy, ['#090d28', '#131944', '#2b2f6a']);
    stars(ctx, w, hy - 8, t, 3, 46);
    const mx = Math.round(w * 0.74), my = Math.min(hy - 24, top + 24);
    disc(ctx, mx, my, 9, '#fff6d0'); disc(ctx, mx + 4, my - 3, 7, '#0f1438');
    // o rio, com o reflexo da lua, e a outra margem com luzinhas
    R(0, hy, w, gy - hy, '#16224e'); R(0, hy, w, 6, '#1f2d62');
    for (let k = 0; k < 8; k++) R(mx - 7 + Math.round(Math.sin(t * 2 + k * 1.3) * 3) + k, hy + 3 + k * 5, 15 - k * 1.5, 2, k % 2 ? '#8a94d0' : '#c9d0ee');
    for (let i = 0; i < 26; i++) R(mod(hash(i * 2.1) * 700 + pos * 0.03 + i * 31, w + 20) - 10, hy + 8 + Math.floor(hash(i * 3.7) * (gy - hy - 26)), 5, 1, '#24346e');
    R(0, hy - 3, w, 4, '#0b0f26');
    for (let i = 0; i < 22; i++) { const x = mod(hash(i * 1.37) * 900 + pos * 0.06, w + 30) - 15; R(x, hy - 3 + (i % 2), 1, 1, i % 3 ? GOLD : '#ffb38a'); R(x, hy + 2, 1, 2, '#5a5a8a'); }
    // a Ponte 25 de Abril e o Cristo Rei, ao longe, quando Lisboa se aproxima
    const bx = Math.round(w * 0.7 - (this.mark(5) - pos) * 0.2), c = '#070a1e';
    if (bx > -130) {
      R(bx - 120, hy - 13, 240, 2, c);
      for (const s of [-1, 1]) {
        R(bx + s * 46 - 2, hy - 36, 4, 36, c); R(bx + s * 46 - 3, hy - 26, 6, 1, c);
        if (Math.floor(t * 2) % 2) R(bx + s * 46 - 1, hy - 38, 2, 2, '#ff5d5d');
        for (let x = 0; x <= 74; x += 2) R(bx + s * (46 + x), hy - 36 + (x / 74) * 22, 2, 1, c);
      }
      for (let x = -46; x <= 46; x += 2) R(bx + x, hy - 36 + (1 - (x / 46) * (x / 46)) * 21, 2, 1, c);
      for (let x = -116; x < 120; x += 9) R(bx + x, hy - 14, 1, 1, GOLD);
      R(bx - 150, hy - 20, 4, 18, c); R(bx - 150, hy - 29, 4, 9, c); R(bx - 154, hy - 27, 12, 2, c);
    }
    // margem, candeeiros da estrada e postes da catenária
    R(0, gy - 13, w, 13, '#1c1a34'); R(0, gy - 13, w, 1, '#2c2a4c');
    for (let i = 0; i < 6; i++) {
      const x = mod(i * 130 + pos * 0.8, w + 130) - 65;
      R(x, gy - 40, 1, 28, '#3a3a5e'); R(x - 3, gy - 41, 5, 2, '#fff0b0'); R(x - 5, gy - 39, 9, 5, 'rgba(255,240,176,0.14)');
    }
    R(0, gy - 51, w, 1, '#4a4f80');
    for (let i = 0; i < 7; i++) { const x = mod(i * 96 + pos, w + 96) - 48; R(x, gy - 56, 2, 56, '#3c406a'); R(x - 8, gy - 53, 10, 1, '#3c406a'); }
    // via: balastro, travessas e carris; por baixo, o talude e a estrada marginal
    R(0, gy, w, v.h - gy, '#3a3448');
    for (let i = 0; i * 9 < w + 18; i++) R(mod(i * 9 + pos, w + 18) - 9, gy + 3, 5, 3, '#5a4a3e');
    R(0, gy, w, 2, '#aab0be'); R(0, gy + 2, w, 1, '#5a5868');
    if (v.h - gy > 50) {
      R(0, gy + 14, w, 18, '#1f3a34'); for (let i = 0; i < 20; i++) R(mod(hash(i * 1.9) * 500 + pos, w + 20) - 10, gy + 16 + Math.floor(hash(i * 2.3) * 12), 3, 2, '#2f5a44');
      R(0, gy + 32, w, v.h - gy - 32, '#27253e'); R(0, gy + 32, w, 2, '#4a4868');
      const ry = gy + 32 + Math.round((v.h - gy - 32) * 0.45);
      for (let i = 0; i * 40 < w + 80; i++) R(mod(i * 40 + pos * 1.3, w + 80) - 40, ry, 18, 2, '#8a8594');
    }
  }

  estacao(ctx, R, L, name, sx, w) {
    const { gy } = L;
    if (sx < -260 || sx > w + 80) return;
    // alpendre e tabuleta com o nome (por trás do comboio)
    R(sx + 14, gy - 58, 150, 4, INK); R(sx + 15, gy - 57, 148, 2, '#7a8098');
    for (let x = sx + 30; x < sx + 160; x += 44) R(x, gy - 54, 2, 46, '#5a5f7a');
    R(sx - 50, gy - 50, 2, 42, '#5a5f7a'); R(sx - 18, gy - 50, 2, 42, '#5a5f7a');
    sign(ctx, name, sx - 34, gy - 62, { bg: '#f2f2f7', color: '#1a2a5a', border: INK });
  }

  cais(R, L, sx, w) {
    const { gy } = L;
    if (sx < -260 || sx > w + 80) return;
    const x0 = sx - 70, len = 300;
    R(x0, gy - 9, len, 1, INK); R(x0, gy - 8, len, 7, '#8f8ca0'); R(x0, gy - 8, len, 1, '#e0a820'); R(x0, gy - 1, len, 15, '#5a5868'); R(x0, gy - 1, len, 1, '#44425a');
    // a marca amarela onde a porta tem de parar
    R(sx - TOL - 1, gy - 9, TOL * 2 + 2, 9, INK);
    for (let i = 0; i < TOL * 2; i += 4) { R(sx - TOL + i, gy - 8, 2, 7, GOLD); R(sx - TOL + i + 2, gy - 8, 2, 7, '#3a3550'); }
    for (let i = 0; i < 5; i++) R(sx - i - 1, gy + 2 + i, i * 2 + 2, 1, GOLD);
  }

  comboio(ctx, R, nx, gy, open) {
    for (let c = 0; c < 3; c++) {
      const x = nx + c * CAR;
      R(x, gy - 39, CAR - 2, 35, INK); R(x + 1, gy - 38, CAR - 4, 33, '#c9ced8'); R(x + 1, gy - 38, CAR - 4, 3, '#8a90a0'); R(x + 1, gy - 34, CAR - 4, 1, '#aab0be');
      for (let y = gy - 19; y < gy - 6; y += 3) R(x + 1, y, CAR - 4, 1, '#9aa2b2');
      R(x + 3, gy - 32, CAR - 8, 11, '#2a3358');
      for (const [wx, ww] of c ? [[5, 17], [36, 16], [64, 6]] : [[36, 16], [64, 6]]) R(x + wx, gy - 31, ww, 9, '#ffe9a8');
      for (const dx of [26, 54]) {
        const first = c === 0 && dx === 26;
        if (first) R(x + dx - 2, gy - 36, 12, 32, GOLD);
        R(x + dx - 1, gy - 35, 10, 30, INK); R(x + dx, gy - 34, 8, 28, first && open ? '#ffe9a8' : '#9aa2b2');
        if (!(first && open)) { R(x + dx + 1, gy - 32, 6, 9, '#ffe9a8'); R(x + dx + 4, gy - 34, 1, 28, INK); }
      }
      R(x + 2, gy - 6, CAR - 6, 2, '#3a3550');
      for (const wx of [9, 19, CAR - 23, CAR - 13]) { disc(ctx, x + wx, gy - 3, 3, INK); R(x + wx - 1, gy - 4, 2, 2, '#8a90a0'); }
    }
    // frente amarela, com o farol aceso
    R(nx + 1, gy - 38, 13, 33, '#ffd23e'); R(nx + 1, gy - 38, 13, 3, '#e0a820'); R(nx + 3, gy - 32, 8, 10, '#2a3358'); R(nx + 4, gy - 31, 3, 3, '#6f8ad8');
    R(nx + 1, gy - 16, 13, 2, '#e0572f'); R(nx - 1, gy - 12, 3, 4, '#fff6d0');
    for (let i = 0; i < 6; i++) R(nx - 8 - i * 8, gy - 12 - i * 0.6, 8, 4 + i * 1.2, `rgba(255,246,208,${(0.22 - i * 0.035).toFixed(3)})`);
    // as quatro amigas à janela
    CABELOS.forEach((h, i) => { const x = nx + [38, 46, 65, CAR + 8][i]; R(x, gy - 30, 6, 3, h); R(x, gy - 27, 1, 4, h); R(x + 1, gy - 27, 5, 5, '#f6c9a0'); });
    // pantógrafo
    R(nx + CAR + 30, gy - 51, 1, 12, '#5a5f7a'); R(nx + CAR + 24, gy - 51, 13, 1, '#5a5f7a'); R(nx + CAR + 36, gy - 45, 1, 6, '#5a5f7a');
  }

  draw(ctx, v, R) {
    const L = this.layout(v), t = this.t, { gy, doorX, top } = L, w = v.w, nx = doorX - 30;
    const sx = (P) => Math.round(doorX - (P - this.pos));
    const shake = this.speed > 100 ? Math.round(Math.sin(t * 30)) : 0;
    this.fundo(ctx, v, R, L, t);
    for (let s = -1; s < NOMES.length; s++) this.estacao(ctx, R, L, s < 0 ? 'SANTO AMARO' : NOMES[s], sx(this.mark(s)), w);
    this.comboio(ctx, R, nx, gy + (shake > 0 ? 1 : 0), this.mode === 'stop' || this.mode === 'board' || this.mode === 'arrive');
    for (let s = -1; s < NOMES.length; s++) this.cais(R, L, sx(this.mark(s)), w);
    // a entrar em Santo Amaro / a sair em Alcântara-Mar
    if (this.mode === 'board') this.girls.forEach((g, k) => { const x = doorX + 44 + k * 15 - this.mt * 62; if (x > doorX + 1) person(ctx, g, x, gy - 3, { face: -1, moving: true, dist: this.mt * 62 + k * 4 }); });
    if (this.mode === 'arrive') this.girls.forEach((g, k) => { const u = this.mt - 0.3 - k * 0.25; if (u > 0) person(ctx, g, doorX + Math.min(u * 60, 16 + (3 - k) * 15), gy - 3, { face: 1, moving: u * 60 < 16 + (3 - k) * 15, dist: u * 60, hop: u * 60 >= 16 + (3 - k) * 15 ? Math.round(Math.abs(Math.sin(t * 7 + k)) * 3) : 0 }); });
    // o percurso: uma linha com as sete estações
    const bw = Math.min(w - 44, 190), bx = Math.round((w - bw) / 2), by = top + 7, n = NOMES.length;
    R(bx - 6, by - 4, bw + 12, 9, INK); R(bx - 5, by - 3, bw + 10, 7, '#2a2650'); R(bx, by, bw, 1, '#8a90c8');
    for (let s = -1; s < n; s++) {
      const x = bx + Math.round(((s + 1) / n) * bw), done = s < 0 || this.res[s] !== undefined;
      R(x - 2, by - 2, 4, 5, done ? (s < 0 || this.res[s] ? GOLD : '#8a7f9a') : s === this.k && Math.floor(t * 4) % 2 ? PINK : PAPER);
    }
    const tx = bx + Math.round(Math.min(1, this.pos / (n * GAP)) * bw);
    R(tx - 3, by - 6, 7, 3, INK); R(tx - 2, by - 5, 5, 1, '#ffd23e');
  }

  bot(I) {
    if (this.mode === 'go' && this.mark(this.k) - this.pos <= TRAVA + 1.5) I.actionPressed = true;
    if (this.mode === 'stop' && this.mt > 0.8) I.actionPressed = true;
  }
}

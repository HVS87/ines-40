// «O Rainha», ato 2: a campainha já tocou e a Inês sobe a escadaria nobre do palácio a correr.
// Arrasta-se o dedo (ou usam-se as setas) para a desviar dos colegas que descem. Cada lance de
// escadas sem encontrões dá um coração. Lá em cima, um rapaz novo segura a porta da sala...
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, clamp, hash, lerp, person, shadow, mark, text, sign } from '../draw.js';
import { recolor, costas } from './rainha-cenario.js';

const POR_LANCE = 4;
const DESCULPAS = ['Inês: «Ups! Desculpa!»', 'Inês: «Com licença, com licença!»', 'Inês: «Perdão! Estou atrasada!»'];

export class Escadaria extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    const ines = getCharacter('ines', 'teen');
    this.ines = costas(ines, '#6b4226', '#4a3a2a');
    this.lourenco = getCharacter('lourenco', 'teen');
    // colegas anónimos: figurantes recoloridos
    const a = getCharacter('professora', 'casual'), o = getCharacter('ze', 'casual');
    this.colegas = [
      recolor(a, { '#9a5a3a': '#2b2b3a', '#b87a52': '#4a4a5e', '#b8862e': '#8a5ac0', '#96691e': '#6a3fa0' }),
      recolor(o, { '#6b4a2e': '#2b2b3a', '#7a8a5a': '#c0392b', '#3b4a7a': '#4a6a9a' }),
      recolor(a, { '#9a5a3a': '#d8a858', '#b87a52': '#f0c888', '#b8862e': '#3fa672', '#96691e': '#2f8652' }),
      recolor(o, { '#6b4a2e': '#c9985a', '#7a8a5a': '#3f9f9a', '#3b4a7a': '#5a4630' }),
    ];
    this.lances = this.max;
    this.px = 0;                      // posição da Inês (píxeis a contar do meio da escada)
    this.obs = [];
    this.n = 0;                       // quantos colegas já apareceram
    this.spawn = 1.0;
    this.hits = []; this.passed = [];
    this.stun = 0; this.sc = 0; this.dist = 0;
    this.phase = 'run'; this.e = 0;
    this.lastLane = 0;
    this.hint('Arrasta o dedo (ou usa as setas) para a Inês se desviar de quem desce!');
  }

  geo(v) {
    const sw = Math.min(v.w - 44, 230), lane = sw / 3;
    return { sw, lane, cx: v.w / 2, sx: Math.round((v.w - sw) / 2), iy: v.h - 12, top: this.top(v), vy: v.portrait ? 96 : 62, cs: v.portrait ? 50 : 34 };
  }

  update(dt, I, v) {
    const g = this.geo(v), lim = g.sw / 2 - 16;
    this.px = clamp(this.px, -lim, lim);
    if (this.phase === 'end') {
      this.e += dt;
      if (this.e < 1.3) { this.sc += g.cs * dt; this.dist += g.cs * dt; }
      this.px = lerp(this.px, -Math.min(30, lim), Math.min(1, dt * 3));
      for (const o of this.obs) o.y += g.vy * dt;      // quem ainda vinha a descer segue caminho
      if (this.e > 4.2) this.done();
      return;
    }
    this.sc += g.cs * dt;
    if (this.stun > 0) this.stun -= dt;
    else {
      this.dist += g.cs * dt;
      // mover: o dedo manda; senão, as setas
      if (I.pointerX >= 0) {
        const tx = I.pointerX * v.w - g.cx;
        this.px += clamp(tx - this.px, -170 * dt, 170 * dt);
      } else if (I.left) this.px -= 130 * dt;
      else if (I.right) this.px += 130 * dt;
      this.px = clamp(this.px, -lim, lim);
    }
    // novos colegas a descer
    const total = this.lances * POR_LANCE;
    this.spawn -= dt;
    if (this.spawn <= 0 && this.n < total) {
      const l = Math.floor(this.n / POR_LANCE);
      // metade das vezes vêm na faixa da Inês (para ser preciso desviar), nunca 3 seguidas na mesma
      let lane = hash(this.n * 3.3 + 1) < 0.55 ? Math.round(this.px / g.lane) : Math.floor(hash(this.n * 7.1) * 3) - 1;
      lane = clamp(lane, -1, 1);
      if (lane === this.lastLane && lane === this.prevLane) lane = lane === 1 ? 0 : lane + 1;
      this.prevLane = this.lastLane; this.lastLane = lane;
      this.obs.push({ x: lane * g.lane + (hash(this.n * 1.9) - 0.5) * 10, y: g.top - 6, l, kind: this.n % this.colegas.length, face: hash(this.n) < 0.5 ? 1 : -1, hit: false, dist: 0 });
      this.n++;
      this.spawn = (this.n % POR_LANCE === 0 ? 2.1 : 1.1) - Math.min(0.15, l * 0.04);
    }
    for (const o of this.obs) {
      o.y += g.vy * dt; o.dist += g.vy * dt * 0.6;
      if (o.hit) o.x += o.push * dt;
      else if (Math.abs(o.x - this.px) < 15 && Math.abs(o.y - g.iy) < 9) {
        o.hit = true; o.push = o.x < this.px ? -50 : 50;
        this.hits[o.l] = true;
        this.stun = 0.45;
        this.sfx('hurt');
        this.fx.burst(g.cx + this.px, g.iy - 30, 8, ['#ffffff', GOLD], 50);
        this.hint(DESCULPAS[Math.floor(hash(this.n + o.y) * DESCULPAS.length)]);
      }
      if (!o.gone && o.y > g.iy + 16) {
        o.gone = true;
        this.passed[o.l] = (this.passed[o.l] || 0) + 1;
        if (this.passed[o.l] === POR_LANCE) this.lanceFeito(o.l, g);
      }
    }
    this.obs = this.obs.filter((o) => o.y < v.h + 60);
  }

  lanceFeito(l, g) {
    if (!this.hits[l]) { this.heart(1, g.cx + this.px, g.iy - 54); this.sfx('check'); }
    if (l >= this.lances - 1) {
      this.phase = 'end'; this.e = 0;
      this.sfx('win');
      this.hint('Mesmo a tempo! E quem será o rapaz novo que segura a porta da sala?');
    } else if (!this.hits[l]) this.hint('Lance limpinho! Continua a subir.');
    else this.hint('Arrasta o dedo (ou usa as setas) para a Inês se desviar de quem desce!');
  }

  draw(ctx, v, R) {
    const g = this.geo(v), t = this.t, off = Math.floor(this.sc) % 8;
    // paredes com lambril de azulejo (desliza para baixo à medida que se sobe)
    R(0, 0, v.w, v.h, '#efe3cc');
    const tile = 10, to = Math.floor(this.sc) % (tile * 2);
    for (const side of [0, 1]) {
      const x0 = side ? g.sx + g.sw + 7 : 0, x1 = side ? v.w : g.sx - 7;
      for (let y = -tile * 2 + to; y < v.h; y += tile) {
        for (let x = side ? x0 : x1 - tile; side ? x < x1 : x > -tile; x += side ? tile : -tile) {
          const odd = ((Math.round((y - to) / tile) + Math.round(x / tile)) & 1) === 0;
          R(x, y, tile, tile, '#f6f2ea');
          R(x, y, tile, 1, '#c9d3e6'); R(x, y, 1, tile, '#c9d3e6');
          if (odd) { R(x + 4, y + 2, 2, 6, '#3f6fb5'); R(x + 2, y + 4, 6, 2, '#3f6fb5'); } else R(x + 3, y + 3, 4, 4, '#7ea6dc');
        }
      }
    }
    // corrimãos de pedra
    for (const x of [g.sx - 7, g.sx + g.sw]) {
      R(x, 0, 7, v.h, '#d9c9a8'); R(x, 0, 1, v.h, '#b8a484'); R(x + 6, 0, 1, v.h, '#b8a484');
      for (let y = -16 + (Math.floor(this.sc) % 16); y < v.h; y += 16) R(x + 2, y, 3, 8, '#f4e8d2');
    }
    // degraus e passadeira
    const cw = Math.round(g.sw * 0.62), cx0 = Math.round(g.cx - cw / 2);
    for (let y = -8 + off; y < v.h; y += 8) {
      R(g.sx, y, g.sw, 6, '#e6d8bc'); R(g.sx, y + 6, g.sw, 2, '#b8a484');
      R(cx0, y, cw, 6, '#b03a50'); R(cx0, y + 6, cw, 2, '#7e2438');
      R(cx0, y, 2, 8, GOLD); R(cx0 + cw - 2, y, 2, 8, GOLD);
    }

    // o cimo das escadas: patamar, porta da sala e o rapaz novo
    let land = -999;
    if (this.phase === 'end') {
      const H = 82, k = clamp(this.e / 1.3, 0, 1);
      land = Math.round(g.top + lerp(-H - 20, H, k));         // linha de baixo da parede
      R(0, 0, v.w, land, '#efe3cc');
      R(0, land - 14, v.w, 14, '#a8324a'); R(0, land - 15, v.w, 1, '#7e2438');   // rodapé
      R(0, land, v.w, 16, '#e6d8bc'); R(0, land + 16, v.w, 2, '#b8a484');          // patamar
      const dx = Math.round(g.cx);
      R(dx - 20, land - 54, 40, 54, '#f4e8d2');
      R(dx - 17, land - 51, 34, 51, '#ffe9a8');                // a sala, iluminada
      R(dx - 17, land - 20, 12, 8, '#8a5a34'); R(dx + 2, land - 20, 12, 8, '#8a5a34');   // carteiras
      R(dx + 17, land - 51, 9, 51, '#6b4226'); R(dx + 18, land - 28, 2, 4, GOLD);        // a porta aberta
      sign(ctx, 'AULA', dx, land - 66, { bg: '#f4e8d2', color: '#6a3a3a', border: '#b8a484' });
      if (k >= 1) {
        const lx = dx + 44;
        shadow(ctx, lx, land + 8, 14);
        person(ctx, this.lourenco, lx, land + 8, { face: -1, scale: 2 });
        if (this.e > 2 && Math.floor(t * 3) % 2) mark(ctx, lx, land - 44, '♥', '#ff5d8f');
      }
    }

    // colegas e a Inês, por ordem de profundidade
    const iy = this.phase === 'end' ? Math.round(lerp(g.iy, Math.min(g.iy, Math.max(land + 70, g.top + 120)), clamp((this.e - 1.3) / 1.4, 0, 1))) : g.iy;
    let drawn = false;
    const ines = () => {
      const blink = this.stun > 0 && Math.floor(t * 20) % 2;
      shadow(ctx, g.cx + this.px, iy, 14);
      if (!blink) person(ctx, this.ines, g.cx + this.px, iy, { face: 1, scale: 2, moving: this.phase !== 'end' || this.e < 2.7, dist: this.dist * 1.2 });
      if (this.phase === 'end' && this.e > 2.9) mark(ctx, g.cx + this.px, iy - 52, '?', '#e0572f');
      drawn = true;
    };
    for (const o of [...this.obs].sort((a, b) => a.y - b.y)) {
      if (!drawn && o.y > iy) ines();
      if (o.y < land + 20) continue;
      shadow(ctx, g.cx + o.x, o.y, 14);
      person(ctx, this.colegas[o.kind], g.cx + o.x, o.y, { face: o.face, scale: 2, moving: true, dist: o.dist });
    }
    if (!drawn) ines();

    // em que lance vai
    if (this.phase === 'run') {
      const l = Math.min(this.lances, Math.floor(Math.max(0, this.n - 1) / POR_LANCE) + 1);
      const bx = 4, by = v.h - 13;
      R(bx, by, 45, 9, INK); text(ctx, 'LANCE ' + l + '/' + this.lances, bx + 2, by + 2, GOLD);
    }
  }

  bot(I, v) {
    if (this.phase !== 'run') return;
    const g = this.geo(v), ahead = v.portrait ? 170 : 105;
    const danger = (x) => this.obs.some((o) => !o.hit && o.y < g.iy + 12 && o.y > g.iy - ahead && Math.abs(o.x - x) < 31);
    if (!danger(this.px)) return;
    let best = null, bd = 1e9;
    for (const lx of [-g.lane, 0, g.lane]) {
      const d = Math.abs(lx - this.px);
      if (!danger(lx) && d < bd) { bd = d; best = lx; }
    }
    if (best === null) best = this.px < 0 ? g.lane : -g.lane;
    if (best < this.px - 2) I.left = true; else if (best > this.px + 2) I.right = true;
  }
}

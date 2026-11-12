// «As Escravas», recreio: a Inês anda pelo recreio (arrastar o dedo ou setas) e vai conhecendo
// as quatro amigas. Cada uma apresenta-se, dá um coração e passa a andar atrás dela em fila.
// Se o jogador demorar, são as amigas que vêm ter com a Inês (o ato acaba sempre).
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, PAPER, clamp, person, shadow, mark, sign, disc } from '../draw.js';
import { linhas, recreio } from './escravas-cenario.js';

const MUNDO = 600;      // largura do recreio, em píxeis de jogo
const VEL = 74;         // velocidade da Inês (px/s)
const ANDAR = 'Arrasta o dedo (ou usa as setas) para andar pelo recreio e conhecer as amigas.';
const AMIGAS = [
  { who: 'anac', name: 'Ana', x: 150, toy: 'corda', line: 'Ana: «Olá! Eu sou a Ana. Queres saltar à corda connosco?»' },
  { who: 'maisac', name: 'Maísa', x: 262, toy: 'macaca', line: 'Maísa: «Eu sou a Maísa! Sabes jogar à macaca?»' },
  { who: 'softc', name: 'Soft', x: 415, toy: 'bola', line: 'Soft: «Sou a Sofia... mas toda a gente me chama Soft!»' },
  { who: 'isabelc', name: 'Isabel', x: 530, toy: 'lanche', line: 'Isabel: «E eu sou a Isabel. Queres metade do meu lanche?»' },
];

export class EscravasRecreio extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.ines = getCharacter('inesc', 'farda');
    this.x = 40; this.face = 1; this.dist = 0; this.moving = false;
    this.girls = AMIGAS.map((a) => ({ ...a, frames: getCharacter(a.who, 'farda'), px: a.x, face: -1, met: false, dist: 0, moving: false }));
    this.line = [];          // as amigas já conhecidas, pela ordem (andam em fila atrás da Inês)
    this.mode = 'walk';      // walk → talk → walk ... → bell
    this.tt = 0; this.time = 0; this.cur = null;
    this.hint(ANDAR);
  }

  cam(v) { return clamp(this.x - v.w * 0.42, 0, Math.max(0, MUNDO - v.w)); }

  meet(g) {
    g.met = true; this.cur = g; this.line.push(g);
    this.mode = 'talk'; this.tt = 0; this.moving = false;
    this.face = g.px >= this.x ? 1 : -1; g.face = -this.face;
    this.hint(g.line);
    this.sfx('chirp');
    const v = this.game.view;
    this.heart(1, g.px - this.cam(v), linhas(v).fy - 44);
  }

  // as amigas conhecidas seguem a Inês em fila indiana
  follow(dt) {
    let prev = this.x;
    for (const g of this.line) {
      const d = prev - g.px, gap = 19;
      g.moving = Math.abs(d) > gap + 1 && this.mode === 'walk';
      if (g.moving) { const s = Math.min(Math.abs(d) - gap, (VEL + 6) * dt); g.px += Math.sign(d) * s; g.dist += s; g.face = Math.sign(d); }
      prev = g.px;
    }
  }

  update(dt, I, v) {
    this.time += dt;
    if (this.mode === 'bell') { this.tt += dt; if (this.tt > 2.4) this.done(); return; }
    if (this.mode === 'talk') {
      this.tt += dt;
      if ((this.tt > 0.6 && I.actionPressed) || this.tt > 3.6) {
        if (this.line.length >= this.girls.length) {
          this.mode = 'bell'; this.tt = 0; this.sfx('ring');
          this.hint('Trrrim! Acabou o recreio. Todas para a sala de aula!');
        } else { this.mode = 'walk'; this.hint(ANDAR); }
      }
      return;
    }
    let dir = 0;
    if (I.pointerX >= 0) { const tx = this.cam(v) + I.pointerX * v.w; if (Math.abs(tx - this.x) > 5) dir = tx > this.x ? 1 : -1; }
    else if (I.right) dir = 1; else if (I.left) dir = -1;
    this.moving = dir !== 0;
    if (dir) { this.face = dir; this.x = clamp(this.x + dir * VEL * dt, 16, MUNDO - 16); this.dist += VEL * dt; }
    this.follow(dt);
    for (const g of this.girls) {
      if (g.met) continue;
      // ao fim de algum tempo, as amigas que faltam vêm elas ter com a Inês
      if (this.time > 42) { const d = this.x - g.px; g.px += Math.sign(d) * 50 * dt; g.dist += 50 * dt; g.moving = true; g.face = Math.sign(d) || 1; }
      if (Math.abs(g.px - this.x) < 22) { this.meet(g); break; }
    }
  }

  // brinquedos de cada amiga, no sítio onde ela estava
  toy(ctx, R, g, sx, fy, t) {
    const busy = !g.met;
    if (g.toy === 'corda' && busy) {
      const c = Math.cos(t * 7), hy = fy - 12;
      for (let i = -8; i <= 8; i++) { const k = 1 - (i / 8) * (i / 8); R(sx + i * 1.6, hy + (c > 0 ? c * 12 : c * 30) * k, 2, 1, c > 0 ? '#fff6e6' : '#b89a6a'); }
    } else if (g.toy === 'macaca') {
      // jogo da macaca, a giz no chão
      for (let k = 0; k < 5; k++) { const x = sx - 34 + k * 14; R(x, fy + 1, 13, 7, '#fff6e6'); R(x + 1, fy + 2, 11, 5, '#dcc090'); R(x + 6, fy + 3, 1, 3, '#fff6e6'); }
      R(sx + 36, fy + 1, 9, 7, '#fff6e6'); R(sx + 37, fy + 2, 7, 5, '#dcc090');
      R(sx - 8, fy + 3, 3, 2, INK); R(sx - 8, fy + 3, 2, 1, '#9a94a0');   // a pedrinha
    } else if (g.toy === 'bola') {
      const by = busy ? fy - 5 - Math.abs(Math.sin(t * 4.5)) * 20 : fy - 5, bx = sx + 18;
      shadow(ctx, bx, fy, 8);
      disc(ctx, bx, by, 5, INK); disc(ctx, bx, by, 4, '#ff5d8f'); R(bx - 3, by - 1, 6, 2, '#fff6e6'); R(bx - 2, by - 3, 2, 1, '#ffd1e0');
    } else if (g.toy === 'lanche') {
      // banco de madeira com a lancheira
      const x = sx + 6;
      R(x - 1, fy - 12, 34, 4, INK); R(x, fy - 11, 32, 2, '#b8854e'); R(x + 2, fy - 8, 3, 8, INK); R(x + 27, fy - 8, 3, 8, INK);
      R(x - 1, fy - 24, 34, 4, INK); R(x, fy - 23, 32, 2, '#b8854e'); R(x + 2, fy - 20, 2, 9, '#7a5236'); R(x + 28, fy - 20, 2, 9, '#7a5236');
      R(x + 15, fy - 19, 11, 8, INK); R(x + 16, fy - 18, 9, 6, '#e0527a'); R(x + 18, fy - 20, 5, 1, INK); R(x + 16, fy - 15, 9, 1, '#ffd166');
    }
  }

  draw(ctx, v, R) {
    const { gy, fy } = linhas(v), cam = this.cam(v), t = this.t;
    recreio(ctx, v, R, t, { cam, top: this.top(v), gy, capela: 337, arvores: [92, 470] });
    for (const g of this.girls) this.toy(ctx, R, g, Math.round(g.x - cam), fy, t);
    for (const g of this.girls) {
      const sx = Math.round(g.px - cam);
      if (sx < -20 || sx > v.w + 20) continue;
      const talking = this.mode === 'talk' && this.cur === g;
      let hop = talking ? Math.round(Math.abs(Math.sin(t * 7)) * 3) : 0, air = false;
      if (!g.met && !g.moving) {
        if (g.toy === 'corda') { hop = Math.round(Math.max(0, Math.cos(t * 7 - 0.6)) * 5); air = hop > 1; }
        if (g.toy === 'macaca') { hop = Math.round(Math.abs(Math.sin(t * 4)) * 4); air = true; }
      }
      shadow(ctx, sx, fy, 12);
      person(ctx, g.frames, sx, fy, { face: g.face, scale: 2, hop, moving: g.moving, dist: g.dist, air });
      if (g.toy === 'lanche' && !g.met) { R(sx - 11, fy - 13, 6, 4, INK); R(sx - 10, fy - 12, 4, 2, '#f0d090'); }
      if (talking) sign(ctx, g.name, sx, fy - 46, { bg: PAPER, color: '#a8324a' });
      else if (!g.met) mark(ctx, sx, fy - 35 - Math.round(Math.abs(Math.sin(t * 3 + g.x)) * 2), '!');
    }
    const ix = Math.round(this.x - cam);
    shadow(ctx, ix, fy, 12);
    person(ctx, this.ines, ix, fy, { face: this.face, scale: 2, moving: this.moving, dist: this.dist });
    // a mala da escola, às costas
    R(ix - this.face * 9 - 3, fy - 15, 7, 8, INK); R(ix - this.face * 9 - 2, fy - 14, 5, 6, '#c0392b'); R(ix - this.face * 9 - 2, fy - 12, 5, 1, GOLD);
    // seta para a amiga mais próxima que falte conhecer, se não estiver à vista
    if (this.mode === 'walk') {
      const left = this.girls.filter((g) => !g.met), seen = left.some((g) => g.px - cam > 8 && g.px - cam < v.w - 8);
      if (left.length && !seen && Math.floor(t * 3) % 2) {
        const d = left[0].px > this.x ? 1 : -1, ax = d > 0 ? v.w - 12 : 12, ay = fy - 18;
        for (let i = 0; i < 5; i++) R(ax + d * i - (d < 0 ? 0 : 1), ay - (4 - i) - 1, 2, (4 - i) * 2 + 3, INK);
        for (let i = 0; i < 4; i++) R(ax + d * i - (d < 0 ? 0 : 1), ay - (3 - i), 2, (3 - i) * 2 + 1, GOLD);
      }
    }
    if (this.mode === 'bell') {   // a sineta a tocar
      const bx = Math.round(v.w / 2), by = this.top(v) + 8, sw = Math.round(Math.sin(t * 24) * 2);
      R(bx - 5 + sw, by, 10, 9, INK); R(bx - 4 + sw, by + 1, 8, 7, GOLD); R(bx - 6 + sw, by + 7, 12, 3, INK); R(bx - 5 + sw, by + 8, 10, 1, '#e0a820'); R(bx - 1 - sw, by + 10, 3, 3, INK);
    }
  }

  bot(I) {
    if (this.mode === 'talk') { if (this.tt > 0.7) I.actionPressed = true; return; }
    if (this.mode !== 'walk') return;
    const g = this.girls.find((k) => !k.met);
    if (g) { if (g.px > this.x) I.right = true; else I.left = true; }
  }
}

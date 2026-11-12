// «O Namoro», ato 2: o jantar no Di Casa. Por baixo da mesa, os pés tocam-se: mantém-se premido
// para a Inês esticar o pé até ao do Lourenço e larga-se quando o empregado olhar. Enquanto os pés
// se tocam, a barra do coração enche (5 corações).
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, PINK, GOLD, SKIN, clamp, person, shadow, mark, text } from '../draw.js';
import { sala, mesa } from './namoro-cenario.js';

const BASE = 'Mantém premido para tocar no pé do Lourenço. Larga quando o empregado olhar!';
const APANHADOS = ['Empregado: «Está tudo bem com a pizza?»', 'Empregado: «Desejam mais alguma coisa?»', 'Empregado: «Caiu alguma coisa ao chão?»'];
const rnd = (a, b) => a + Math.random() * (b - a);

export class Jantar extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    this.ines = getCharacter('ines', 'teen');
    this.lourenco = getCharacter('lourenco', 'teen');
    this.empregado = getCharacter('empregado', 'casual');
    this.reach = 0;            // quanto o pé da Inês está esticado (0 a 1)
    this.meter = 0;            // a barra do coração (0 a 1)
    this.w = { st: 'away', t: 2.4, seen: 0 };
    this.stun = 0; this.strikes = 0; this.life = 0; this.over = 0;
    this.hint(BASE);
  }

  update(dt, I) {
    if (this.over) { this.over += dt; this.reach = Math.max(0, this.reach - dt * 2); if (this.over > 2.4) this.done(); return; }
    this.life += dt;
    // o empregado: ora de costas, ora a olhar para a mesa
    const w = this.w;
    w.t -= dt; w.seen += dt;
    if (w.t <= 0) {
      if (w.st === 'away') { w.st = 'watch'; w.t = this.strikes >= 3 ? rnd(0.8, 1.1) : rnd(1.0, 1.6); } else { w.st = 'away'; w.t = this.strikes >= 3 ? rnd(2.6, 3.4) : rnd(1.9, 3.0); }
      w.seen = 0;
    }
    if (this.stun > 0) {
      this.stun -= dt; this.reach = Math.max(0, this.reach - dt * 4);
      if (this.stun <= 0) this.hint(BASE);
    } else {
      this.reach = clamp(this.reach + (I.action ? 2.3 : -3.6) * dt, 0, 1);
      if (w.st === 'watch' && w.seen > 0.24 && this.reach > 0.3) {
        // apanhados!
        this.stun = 1.1; this.strikes++;
        this.meter = Math.max(Math.floor(this.meter * this.max) / this.max, this.meter - 0.05);
        this.sfx('buzz');
        this.hint(APANHADOS[this.strikes % APANHADOS.length]);
      } else if (this.reach >= 0.97) {
        const before = Math.floor(this.meter * this.max + 1e-6);
        this.meter = Math.min(1, this.meter + dt / 12);
        const now = Math.floor(this.meter * this.max + 1e-6);
        if (now > before) { this.heart(1); this.sfx('plim'); }
      }
    }
    if (this.meter >= 1 || this.life > 48) {
      this.over = 0.01;
      this.sfx('win');
      this.hint('Lourenço: «Para a semana, à mesma mesa?»');
    }
  }

  // onde fica cada coisa, conforme o ecrã
  geo(v) {
    const top = this.top(v);
    if (v.portrait) {
      const py = Math.round(v.h * 0.62);
      return { top, gy: Math.round(v.h * 0.54), cx: Math.round(v.w * 0.4), wx: v.w - 34, px: 12, py, pw: v.w - 24, ph: Math.min(112, v.h - py - 26) };
    }
    const px = Math.round(v.w * 0.58), py = top + 16;
    return { top, gy: Math.round(v.h * 0.9), cx: Math.round(px * 0.38), wx: px - 30, px, py, pw: v.w - px - 8, ph: v.h - py - 20 };
  }

  draw(ctx, v, R) {
    const g = this.geo(v), t = this.t, w = this.w, touching = this.reach >= 0.97 && !this.stun;
    sala(ctx, v, R, g.gy, g.cx, g.top, t);
    // o empregado (de costas quando não está a olhar)
    const watch = w.st === 'watch', ex = g.wx + (watch ? 0 : 8);
    shadow(ctx, ex, g.gy, 14);
    person(ctx, this.empregado, ex, g.gy, { face: watch ? -1 : 1, scale: 2, moving: !watch, dist: t * 30 });
    R(ex + (watch ? -18 : 8), g.gy - 26, 12, 2, '#c9c9d8'); R(ex + (watch ? -15 : 11), g.gy - 30, 5, 4, '#f4f0e6');   // a bandeja
    if (this.stun > 0) mark(ctx, ex, g.gy - 52, '!');
    else if (!watch && w.t < 0.55) mark(ctx, ex, g.gy - 52, '?', '#e0572f');
    // os dois à mesa
    const hop = this.stun > 0 ? Math.round(Math.abs(Math.sin(t * 18)) * 2) : 0;
    person(ctx, this.ines, g.cx - 28, g.gy, { face: 1, scale: 2, hop });
    person(ctx, this.lourenco, g.cx + 28, g.gy, { face: -1, scale: 2, hop });
    if (touching || this.stun > 0) { R(g.cx - 21, g.gy - 26, 4, 2, '#f07a8c'); R(g.cx + 18, g.gy - 28, 4, 2, '#f07a8c'); }   // corados
    mesa(ctx, R, g.cx, g.gy, t);
    if (touching && Math.floor(t * 3) % 2) mark(ctx, g.cx, g.gy - 60, '♥', PINK);

    // ----- debaixo da mesa (vista aumentada) -----
    const { px, py, pw, ph } = g;
    R(px - 2, py - 2, pw + 4, ph + 4, INK);
    R(px, py, pw, ph, '#3a2436');
    R(px, py + ph - 12, pw, 12, '#a4522f'); R(px, py + ph - 12, pw, 1, '#733a26');
    for (let x = px + 6; x < px + pw; x += 22) R(x, py + ph - 11, 1, 11, '#8a4226');
    // a toalha a cair
    for (let x = 0; x < pw; x += 6) for (let y = 0; y < 12; y += 6) R(px + x, py + y, Math.min(6, pw - x), 6, ((x + y) / 6) & 1 ? '#c0392b' : '#fff6e6');
    for (let x = 0; x < pw; x += 12) R(px + x, py + 12, Math.min(6, pw - x), 3, '#fff6e6');
    R(px + 5, py + 12, 5, ph - 24, '#5a3a2a'); R(px + pw - 10, py + 12, 5, ph - 24, '#5a3a2a');
    // os pés: o da Inês estica-se, o do Lourenço espera (e abana quando se tocam)
    const fy = py + ph - 12, shoe = 22, lx = px + pw - 24 - shoe, rest = px + 22, span = lx - rest - shoe;
    const ix = Math.round(rest + this.reach * span), wig = touching ? Math.round(Math.sin(t * 16)) : 0;
    R(ix + 2, py + 12, 8, fy - py - 20, INK); R(ix + 3, py + 12, 6, fy - py - 20, SKIN);                      // perna da Inês
    R(ix, fy - 10, shoe, 10, INK); R(ix + 1, fy - 9, shoe - 2, 6, '#ffffff'); R(ix + 1, fy - 3, shoe - 2, 2, '#c9c9d8'); R(ix + 8, fy - 9, 3, 6, PINK);
    R(lx + shoe - 11 + wig, py + 12, 10, fy - py - 20, INK); R(lx + shoe - 10 + wig, py + 12, 8, fy - py - 20, '#4a6a9a');   // perna do Lourenço
    R(lx + wig, fy - 10, shoe, 10, INK); R(lx + 1 + wig, fy - 9, shoe - 2, 6, '#ffffff'); R(lx + 1 + wig, fy - 3, shoe - 2, 2, '#c9c9d8'); R(lx + 11 + wig, fy - 9, 3, 6, '#c0392b');
    if (touching) { const hx = lx - 2, hy = fy - 18 - Math.round(Math.abs(Math.sin(t * 5)) * 4); R(hx - 2, hy, 2, 1, PINK); R(hx + 1, hy, 2, 1, PINK); R(hx - 2, hy + 1, 5, 2, PINK); R(hx - 1, hy + 3, 3, 1, PINK); R(hx, hy + 4, 1, 1, PINK); }
    // título e barra do coração
    R(px + pw / 2 - 33, py - 9, 66, 9, INK);
    text(ctx, 'DEBAIXO DA MESA', px + pw / 2, py - 7, GOLD, { align: 'center' });
    const bw = pw - 24, bx = px + 12, by = py + ph + 5;
    R(bx - 1, by - 1, bw + 2, 8, INK); R(bx, by, bw, 6, '#4a3a52'); R(bx, by, Math.round(bw * this.meter), 6, PINK);
    for (let k = 1; k < this.max; k++) R(bx + Math.round((bw * k) / this.max), by, 1, 6, PAPER);
  }

  bot(I) {
    if (this.over || this.stun > 0) return;
    if (this.w.st === 'away' && this.w.t > 0.32) I.action = true;
  }
}

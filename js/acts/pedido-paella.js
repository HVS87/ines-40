// Nível 23, no catamarã: servir a enorme paella. Os convidados passam, um a um, com o prato na
// mão; toca-se para a concha servir quando o prato está por baixo dela. Quem falhar é servido
// na mesma pelo cozinheiro (sem coração): nunca se perde.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, person, shadow, text } from '../draw.js';
import { tejoBg } from './pedido-cenario.js';

const GUESTS = [['tomas', 'casual', 44], ['tiafatima', 'hoje', 50], ['tio', 'hoje', 46], ['ana', 'casual', 58], ['pipoca', 'casual', 52], ['mi', 'casual', 64]];
const WIN = 10;          // meia largura (px) da zona onde o prato apanha o arroz

export const convesChao = (v) => Math.round(v.h * (v.portrait ? 0.74 : 0.84));

export class Paella extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.k = 0;
    this.g = null;             // convidado atual: { x, v, frames, state: 'in' | 'wait' | 'out', full }
    this.gone = [];            // os que já vão a sair, de prato cheio
    this.wait = 0.9;
    this.cool = 0;             // a concha a ir buscar mais arroz
    this.drop = null;          // arroz a cair { x, y, ok }
    this.good = 0;
    this.over = 0;
    this.cook = getCharacter('empregado');
    this.ines = getCharacter('ines', 'casual');
    this.lourenco = getCharacter('lourenco', 'casual');
    this.hint('Toca para servir a paella quando o prato passar por baixo da concha!');
  }

  xs(v) { return Math.round(v.w * (v.portrait ? 0.56 : 0.5)); }

  update(dt, I, v) {
    const xs = this.xs(v), gy = convesChao(v);
    for (const o of this.gone) o.x += dt * 70;
    this.gone = this.gone.filter((o) => o.x < v.w + 30);
    if (this.drop) { this.drop.y += dt * 150; if (this.drop.y > (this.drop.ok ? gy - 24 : gy + 4)) this.drop = null; }
    if (this.over) {
      this.over += dt;
      if (this.over > 3.4 || (this.over > 1.4 && I.actionPressed)) this.done();
      return;
    }
    this.cool = Math.max(0, this.cool - dt);
    if (!this.g) {
      this.wait -= dt;
      if (this.wait <= 0) {
        if (this.k >= GUESTS.length) { this.over = 0.01; this.sfx('win'); this.hint('Lourenço: «Estão todos servidos? É que eu tenho uma coisa para dizer...»'); return; }
        const [who, outfit, speed] = GUESTS[this.k++];
        this.g = { x: Math.min(v.w + 18, xs + 190), v: speed, frames: getCharacter(who, outfit), state: 'in', full: false, t: 0 };
      }
      return;
    }
    const g = this.g, plate = g.x - 13;
    if (g.state === 'in') {
      g.x -= g.v * dt;
      if (I.actionPressed && this.cool <= 0) {
        this.cool = 0.75;
        const ok = Math.abs(plate - xs) <= WIN;
        this.drop = { x: xs, y: gy - 42, ok };
        if (ok) {
          g.full = true; this.good++;
          this.heart(1, xs, gy - 50);
          this.sfx('check');
          this.leave(0.25);
        } else { this.sfx('toc'); this.hint(plate > xs ? 'Cedo de mais: caiu no convés! Espera pelo prato.' : 'Tarde de mais! Espera pelo próximo prato.'); }
      } else if (plate < xs - WIN - 6) { g.state = 'wait'; g.t = 0; }      // passou: o cozinheiro serve
    } else if (g.state === 'wait') {
      g.t += dt;
      if (g.t > 0.5 && !g.full) { g.full = true; this.sfx('pop'); this.hint('O cozinheiro serve este prato. Toca quando o próximo estiver por baixo da concha!'); }
      if (g.t > 0.9) this.leave(0);
    }
  }

  leave(delay) {
    this.gone.push({ x: this.g.x, frames: this.g.frames });
    this.g = null;
    this.wait = 0.35 + delay;
  }

  draw(ctx, v, R) {
    const gy = convesChao(v), top = this.top(v), t = this.t, xs = this.xs(v), P = v.portrait;
    tejoBg(ctx, v, R, t, { gy, top });
    const px = xs - 56;                         // centro da paelheira
    // a Inês e o Lourenço, junto à mesa
    const ix = P ? 14 : Math.round(v.w * 0.07), lx = P ? 36 : Math.round(v.w * 0.16);
    shadow(ctx, ix, gy + 3, 14); person(ctx, this.ines, ix, gy + 3, { face: 1, scale: 2 });
    shadow(ctx, lx, gy + 1, 14); person(ctx, this.lourenco, lx, gy + 1, { face: 1, scale: 2 });
    // o cozinheiro, atrás da mesa
    person(ctx, this.cook, xs - 18, gy - 2, { face: 1, scale: 2 });
    // mesa com toalha e a paelheira enorme
    R(px - 44, gy - 17, 88, 20, INK); R(px - 43, gy - 16, 86, 18, '#ffffff'); R(px - 43, gy - 16, 86, 2, '#e0e4f0');
    for (let x = px - 40; x < px + 42; x += 8) R(x, gy - 2, 4, 3, '#6fb0f0');
    R(px - 46, gy - 24, 6, 3, INK); R(px + 40, gy - 24, 6, 3, INK);
    R(px - 41, gy - 26, 82, 10, INK); R(px - 40, gy - 25, 80, 8, '#3a3448'); R(px - 38, gy - 25, 76, 6, '#f4b830'); R(px - 38, gy - 25, 76, 1, '#ffd870');
    for (let i = 0; i < 11; i++) {
      const x = px - 35 + i * 7, y = gy - 24 + (i % 3);
      if (i % 4 === 0) { R(x, y, 4, 2, '#ff6a4a'); R(x + 3, y + 1, 2, 2, '#ff6a4a'); }           // camarão
      else if (i % 4 === 1) R(x, y + 1, 3, 2, '#2b1d2e');                                        // mexilhão
      else if (i % 4 === 2) R(x, y + 1, 2, 2, '#5cc85c');                                        // ervilha
      else R(x, y, 3, 3, '#fff06a');                                                             // limão
    }
    for (let k = 0; k < 3; k++) { const p = (t * 0.7 + k / 3) % 1; R(px - 20 + k * 20 + Math.round(Math.sin(p * 6) * 2), gy - 30 - Math.round(p * 12), 2, 3, 'rgba(255,255,255,0.45)'); }
    // a concha (quando acabou de servir, vai buscar mais arroz à paelheira)
    const back = this.cool > 0 ? Math.sin((this.cool / 0.75) * Math.PI) : 0;
    const cx = xs - Math.round(back * 22), cy = gy - 46 + Math.round(back * 16) + Math.round(Math.sin(t * 3) * 1);
    for (let k = 0; k < 7; k++) R(cx - 3 - k * 2, cy - 2 - k, 3, 2, '#8a93a7');
    R(cx - 6, cy - 1, 12, 7, INK); R(cx - 5, cy, 10, 5, '#c9c9d8');
    if (this.cool < 0.3) { R(cx - 5, cy - 2, 10, 3, '#f4b830'); R(cx - 2, cy - 3, 4, 1, '#ff6a4a'); }
    // marca no convés: onde o prato tem de estar
    if (!this.over) { R(xs - WIN, gy + 5, WIN * 2, 2, Math.floor(t * 4) % 2 ? GOLD : '#b8862e'); R(xs - 1, gy + 3, 2, 2, GOLD); }
    // arroz a cair
    if (this.drop) { R(this.drop.x - 3, this.drop.y, 6, 4, '#f4b830'); R(this.drop.x - 1, this.drop.y - 3, 2, 2, '#ff6a4a'); }
    // convidados: os que saem e o que vem a chegar
    for (const o of this.gone) this.guest(ctx, R, o, gy, 1, true, true);
    if (this.g) this.guest(ctx, R, this.g, gy, -1, this.g.state === 'in', this.g.full);
    // pratos servidos
    const n = GUESTS.length, x0 = Math.round(v.w / 2 - (n * 12) / 2), y0 = top + 4;
    for (let k = 0; k < n; k++) {
      const done = k < this.k - (this.g ? 1 : 0);
      R(x0 + k * 12, y0, 10, 4, INK); R(x0 + k * 12 + 1, y0 + 1, 8, 2, done ? '#f4b830' : PAPER);
    }
    text(ctx, 'PAELLA', px, gy - 9, '#3f6fb5', { align: 'center' });
  }

  guest(ctx, R, o, gy, face, moving, full) {
    shadow(ctx, o.x, gy + 6, 14);
    person(ctx, o.frames, o.x, gy + 6, { face, scale: 2, moving, dist: o.x * 0.5 });
    const x = Math.round(o.x + face * 13), y = gy - 18;
    R(x - 7, y, 14, 3, INK); R(x - 6, y, 12, 2, PAPER);
    if (full) { R(x - 4, y - 3, 8, 3, '#f4b830'); R(x - 1, y - 4, 3, 1, '#ff6a4a'); }
  }

  bot(I, v) {
    if (this.over) { if (this.over > 1.6) I.actionPressed = true; return; }
    const g = this.g;
    if (g && g.state === 'in' && this.cool <= 0 && Math.abs(g.x - 13 - this.xs(v)) < 4) I.actionPressed = true;
  }
}

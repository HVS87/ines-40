// Ato «reencontro» (nível 15): nas chegadas do aeroporto, a Inês espera; a porta abre-se, o
// Lourenço aparece de mala e chapéu, correm um para o outro e abraçam-se. As falas avançam com
// um toque (ou sozinhas). Dá um coração no abraço.
import { Act } from './base.js';
import { getCharacter, makeSprite } from '../sprites.js';
import { INK, PAPER, GOLD, PINK, clamp, person, shadow, sign, text } from '../draw.js';

const PASSOS = [
  { say: 'No aeroporto, nas chegadas: a Inês não tira os olhos da porta...' },
  { say: 'Lourenço: «Inês!»', out: true },
  { say: 'Inês: «Lourenço! Finalmente! Tantas saudades!»', hug: true },
  { say: 'Lourenço: «Trouxe-te um canguru! De peluche... o verdadeiro não cabia na mala.»', roo: 1 },
  { say: 'Inês: «Fica comigo. E tu não voltas a saltar para o outro lado do mundo!»', roo: 2 },
  { say: 'Lourenço: «Fico. E trago uma ideia: sushi entregue em casa. Sushi@Home!»', roo: 2 },
];

const ROO = [
  '.....o.o..', '....okoko.', '....okkko.', '...okkekko', '...okkkkko', '..okkkoo..', '.okkwwko..', 'okkkwwkko.', 'okkkkkkko.', '.okkkokko.', '..okkookko', '..oooo.ooo',
];

export class Reencontro extends Act {
  get max() { return 1; }

  start(v) {
    this.ines = getCharacter('ines', 'casual');
    this.lou = getCharacter('lourenco', 'aussie');
    this.roo = makeSprite(ROO, { o: INK, k: '#c88a4a', w: '#f4dcae', e: INK });
    this.i = -1; this.timer = 0;
    this.ix = 0.3; this.lx = 1.15;      // posições (fração da largura)
    this.iw = 0; this.lw = 0;           // distância andada (para as pernas)
    this.hugged = false;
    this.advance();
  }

  advance() {
    this.i++; this.timer = 0;
    if (this.i >= PASSOS.length) { this.done(); return; }
    this.hint(PASSOS[this.i].say);
    this.sfx(this.i === 1 ? 'plim' : 'click');
  }

  update(dt, I, v) {
    this.timer += dt;
    const st = PASSOS[Math.min(this.i, PASSOS.length - 1)], u = v.portrait ? 3 : 2, gap = (7 * u) / v.w;
    // para onde vai cada um: à espera → à porta → ao abraço, a meio
    const it = this.i >= 2 ? 0.5 - gap : 0.3 + (this.i === 0 ? Math.sin(this.t * 1.3) * 0.04 : 0);
    const lt = this.i >= 2 ? 0.5 + gap : this.i === 1 ? 0.74 : 1.15;
    const sp = (this.i >= 2 ? 0.42 : 0.3) * dt;
    const mi = clamp(it - this.ix, -sp, sp), ml = clamp(lt - this.lx, -sp, sp);
    this.ix += mi; this.lx += ml;
    this.imove = Math.abs(mi) > 0.0005; this.lmove = Math.abs(ml) > 0.0005;
    if (this.imove) this.iw += Math.abs(mi) * v.w / u * 1.4;
    if (this.lmove) this.lw += Math.abs(ml) * v.w / u * 1.4;
    const arrived = !this.imove && !this.lmove;
    if (st.hug && arrived && !this.hugged) {
      this.hugged = true;
      this.sfx('kiss');
      this.heart(1, v.w / 2, this.gy(v) - 30 * u);
      this.fx.burst(v.w / 2, this.gy(v) - 20 * u, 14, [PINK, '#ffd1e0', GOLD], 60);
    }
    if (this.hugged && Math.floor(this.t * 3) !== Math.floor((this.t - dt) * 3)) this.fx.heart(v.w / 2 - 12 + Math.random() * 24, this.gy(v) - 26 * u);
    const wait = (st.out || st.hug) && !arrived;
    if (!wait && ((this.timer > 0.5 && I.actionPressed) || this.timer > 3 + st.say.length * 0.06)) this.advance();
    else if (wait && this.timer > 6) this.advance();
  }

  gy(v) { return Math.round(v.h * (v.portrait ? 0.74 : 0.86)); }

  draw(ctx, v, R) {
    const gy = this.gy(v), top = this.top(v), u = v.portrait ? 3 : 2, t = this.t, w = v.w;
    const st = PASSOS[Math.min(this.i, PASSOS.length - 1)];
    // a sala das chegadas
    R(0, 0, w, gy, '#dbe4ee'); R(0, gy - 26 * u, w, 26 * u, '#c6d2e0'); R(0, gy - 26 * u, w, 1, '#aab8cc');
    // janelões para a pista, com um avião acabado de aterrar
    const wh = Math.max(top + 4, gy - 44 * u) - 8;
    R(0, 0, w, wh, '#a4d4f2'); R(0, 0, w, Math.round(wh * 0.45), '#8cc4ee'); R(0, wh - 7, w, 7, '#8e98ac'); R(0, wh - 7, w, 1, '#c8d0dc');
    for (let k = 0; k < 3; k++) { const cx = (k * 131 + 40) % (w + 40) - 20, cy = Math.round(wh * (0.3 + k * 0.17)); R(cx, cy, 26, 4, '#ffffff'); R(cx + 6, cy - 3, 12, 3, '#ffffff'); }
    const ax = Math.round(((t * 5 + 60) % (w + 90)) - 60), ay = wh - 18;
    R(ax, ay, 44, 8, '#ffffff'); R(ax + 44, ay + 1, 4, 6, '#ffffff'); R(ax + 48, ay + 3, 2, 3, '#ffffff'); R(ax, ay + 6, 44, 2, '#c8d0dc');
    R(ax - 3, ay - 9, 9, 10, '#3f6fb5'); R(ax - 3, ay - 9, 4, 3, '#a4d4f2'); R(ax + 16, ay + 6, 16, 3, '#aab8cc');
    for (let k = 0; k < 8; k++) R(ax + 9 + k * 4, ay + 2, 2, 2, '#3a4a6a');
    R(ax + 10, ay + 9, 2, 3, INK); R(ax + 36, ay + 9, 2, 3, INK);
    for (let x = 0; x < w; x += 44) R(x, 0, 2, wh, '#c8d2de');
    R(0, wh, w, 3, '#aab8cc');
    R(0, gy, w, v.h - gy, '#b4bccb'); R(0, gy, w, 2, '#8e98ac');
    for (let x = -20; x < w + 40; x += 28) R(x + ((gy % 7) | 0), gy + 6, 18, 1, '#d4dbe6');
    for (let y = gy + 14; y < v.h; y += 12) R(0, y, w, 1, '#a4adbf');
    // a porta de correr por onde saem os passageiros
    const dx = Math.round(w * 0.78), dh = 34 * u, dw = 15 * u, open = clamp(this.i >= 1 ? (this.i === 1 ? this.timer * 2.5 : 1) : 0, 0, 1) * (this.i >= 3 ? clamp(1 - this.timer, 0, 1) : 1);
    R(dx - dw - 3, gy - dh - 3, dw * 2 + 6, dh + 3, '#5a6478'); R(dx - dw, gy - dh, dw * 2, dh, '#2a3044');
    const pw = Math.round(dw * (1 - open * 0.85));
    R(dx - dw, gy - dh, pw, dh, '#9cc4dc'); R(dx + dw - pw, gy - dh, pw, dh, '#9cc4dc');
    R(dx - dw + 2, gy - dh + 3, Math.max(0, pw - 6), 2, '#d8eef8'); R(dx - dw + pw - 1, gy - dh, 1, dh, '#5a6478'); R(dx + dw - pw, gy - dh, 1, dh, '#5a6478');
    // letreiro e painel dos voos
    const sy = Math.min(top + 6, gy - dh - 18);
    sign(ctx, 'CHEGADAS', dx, Math.max(sy, gy - dh - 16), { bg: '#2a3358', color: GOLD });
    const bx = Math.round(w * 0.08), bw = Math.min(Math.round(w * 0.38), 96), by = Math.max(top + 4, gy - 44 * u);
    R(bx - 1, by - 1, bw + 2, 37, INK); R(bx, by, bw, 35, '#1c1c28');
    text(ctx, 'CHEGADAS', bx + 3, by + 3, GOLD);
    for (let k = 0; k < 4; k++) {
      R(bx + 3, by + 11 + k * 6, Math.round(bw * 0.3), 3, '#8a93b0'); R(bx + 6 + Math.round(bw * 0.3), by + 11 + k * 6, Math.round(bw * 0.2), 3, '#5a6488');
      R(bx + bw - 14, by + 11 + k * 6, 11, 3, k === 0 ? (Math.floor(t * 2) % 2 ? '#5cf08a' : '#2f7f52') : '#ffb347');
    }
    // fita de separação
    for (const px of [0.56, 0.66]) { const x = Math.round(w * px); R(x, gy - 12 * u, 2, 12 * u, '#5a6478'); R(x - 2, gy - 2, 6, 2, '#5a6478'); }
    R(Math.round(w * 0.56), gy - 11 * u, Math.round(w * 0.1), 2, '#c0392b');
    // a mala (fica onde ele a larga) e os dois
    const ix = Math.round(this.ix * w), lx = Math.round(this.lx * w);
    const mx = lx + 11 * u;
    R(mx - 3 * u, gy - 10 * u, 6 * u, 9 * u, INK); R(mx - 3 * u + 1, gy - 10 * u + 1, 6 * u - 2, 9 * u - 2, '#c0792b'); R(mx - 3 * u + 1, gy - 6 * u, 6 * u - 2, u, '#8a5220');
    R(mx - 1, gy - 14 * u, 2, 4 * u, INK); R(mx - 2 * u, gy - u, u, u, INK); R(mx + u, gy - u, u, u, INK);
    const hug = this.hugged ? Math.round(Math.abs(Math.sin(t * 5)) * 1.5) : 0;
    shadow(ctx, ix, gy, 7 * u); shadow(ctx, lx, gy, 7 * u);
    person(ctx, this.ines, ix + (this.hugged ? u : 0), gy, { face: 1, scale: u, moving: this.imove, dist: this.iw, hop: hug });
    person(ctx, this.lou, lx - (this.hugged ? u : 0), gy, { face: -1, scale: u, moving: this.lmove, dist: this.lw, hop: hug });
    // o canguru de peluche: primeiro nas mãos dele, depois ao colo dela
    if (st.roo) {
      const rx = st.roo === 1 ? lx - 12 * u : ix - 9 * u, ry = gy - 16 * u - (st.roo === 1 ? Math.round(Math.abs(Math.sin(t * 6)) * 3) : 0);
      ctx.drawImage(this.roo, rx, ry, this.roo.width * u, this.roo.height * u);
    }
    if (this.i === 0 && Math.floor(t * 1.5) % 2) { R(ix + 5 * u, gy - 27 * u, 2, 2, PAPER); R(ix + 7 * u, gy - 29 * u, 3, 3, PAPER); }
    if (this.timer > 0.6 && Math.floor(t * 2.5) % 2) { R(w - 12, v.h - 10, 5, 1, PAPER); R(w - 11, v.h - 9, 3, 1, PAPER); R(w - 10, v.h - 8, 1, 1, PAPER); }
  }

  bot(I) { if (this.timer > 0.6) I.actionPressed = true; }
}

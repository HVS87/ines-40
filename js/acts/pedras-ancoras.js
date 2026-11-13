// Pedras d'El Rei, ato 3: fim de tarde no Cemitério das Âncoras. A Inês anda à beira-mar
// (arrastar o dedo ou setas) a apanhar as conchas que cada onda deixa na areia, antes de a onda
// seguinte as levar, com o pequeno Tomás atrás dela («A mãe tem tesouro!»). No fim, a fotografia
// de família de todos os anos, à frente das âncoras.
import { Act } from './base.js';
import { INK, GOLD, PAPER, clamp, lerp, hash, disc, hills, person, shadow, sign, sky, text } from '../draw.js';
import { tufo, TARDE } from './farol-comum.js';
import { getCharacter } from '../sprites.js';
import { familia, ancora, casaAtum } from './pedras-comum.js';

const CICLO = 4.2;                      // segundos entre ondas
const ONDAS = [1, 1, 2, 1, 2, 1];       // conchas que cada onda deixa
const VEL = 95;                         // velocidade da Inês (px/s)
const TESOURO = 'Tomás: «A mãe tem tesouro!»';
const D = 3;                            // segundos da fala do Tomás, antes da fotografia
const FALA1 = 'Tia Fátima: «Todos juntos, à frente das âncoras! A fotografia de todos os anos!»';
const FALA2 = 'Clique! Mais um verão em Pedras d\'El Rei para o álbum de família.';

export class PedrasAncoras extends Act {
  get max() { return this.cfg.hearts || 3; }

  start(v) {
    this.fam = familia();
    this.tom = getCharacter('tomasc');
    this.ix = v.w * 0.3; this.face = 1; this.walk = 0; this.moving = false;
    this.tw = 0; this.onda = -1; this.conchas = []; this.n = 0; this.fase = 'jogo'; this.tf = 0; this.flash = 0;
    this.hint('Arrasta o dedo (ou usa as setas) e apanha as conchas antes de a onda as levar!');
  }

  lay(v) {
    const P = v.portrait, gy = Math.round(v.h * (P ? 0.8 : 0.84));
    return { P, gy, dTop: gy - (P ? 190 : 80), dBot: gy - (P ? 100 : 40), cy: gy + 5 };
  }

  // altura da água (a onda sobe até aos pés da Inês e volta a descer)
  agua(v, L) {
    const w = (this.tw % CICLO) / CICLO, up = w < 0.4 ? Math.sin((w / 0.4) * Math.PI) : 0;
    return lerp(v.h - 3, L.gy + 1, up);
  }

  update(dt, I, v) {
    const L = this.lay(v);
    this.tf += dt;
    this.flash = Math.max(0, this.flash - dt * 2);
    if (this.fase === 'jogo') {
      // a Inês
      let dir = (I.right ? 1 : 0) - (I.left ? 1 : 0);
      if (I.pointerX >= 0) { const d = I.pointerX * v.w - this.ix; dir = Math.abs(d) > 3 ? Math.sign(d) : 0; }
      this.moving = dir !== 0;
      if (dir) { this.face = dir; this.ix = clamp(this.ix + dir * VEL * dt, 12, v.w - 12); this.walk += VEL * dt; }
      // as ondas
      const antes = this.tw;
      this.tw += dt;
      const k = Math.floor(this.tw / CICLO), w = (this.tw % CICLO) / CICLO, wa = (antes % CICLO) / CICLO;
      if (w >= 0.12 && (wa < 0.12 || Math.floor(antes / CICLO) !== k)) {
        // a onda leva as conchas que ficaram e, ao recuar, deixa outras
        if (this.conchas.some((c) => !c.got)) this.sfx('slurp');
        this.conchas = [];
        this.onda = k;
        if (k >= ONDAS.length) { this.fase = 'foto'; this.tf = 0; this.hint(TESOURO); this.sfx('kiss'); return; }
        const n = ONDAS[k], lado = this.ix > v.w / 2 ? -1 : 1, lim = Math.min(150, v.w * 0.42);
        const x1 = clamp(this.ix + lado * (45 + hash(k * 3.7) * (lim - 45)), 18, v.w - 18);
        const t0 = this.tw + CICLO * 0.18;
        this.conchas.push({ x: x1, got: false, tipo: k % 3, t0 });
        if (n > 1) this.conchas.push({ x: clamp(x1 + (x1 > v.w / 2 ? -1 : 1) * (50 + hash(k * 9.1) * 30), 18, v.w - 18), got: false, tipo: (k + 1) % 3, t0 });
      }
      for (const c of this.conchas) {
        if (c.got || this.tw < c.t0) continue;
        if (Math.abs(c.x - this.ix) < 10) {
          c.got = true; this.n++; this.sfx('plim');
          this.fx.burst(c.x, L.cy, 5, [GOLD, PAPER], 40);
          if (this.n % 2 === 0) this.heart(1, c.x, L.gy - 30);
        }
      }
    } else if (this.fase === 'foto') {
      if (this.tf > D && this.tf - dt <= D) { this.hint(FALA1); this.sfx('click'); }
      if (this.tf > D + 2.4 && this.tf - dt <= D + 2.4) { this.flash = 1; this.sfx('plim'); this.hint(FALA2); }
      if (this.tf > D + 7.5 || (this.tf > D + 4 && I.actionPressed)) { this.fase = 'fim'; this.done(); }
    }
  }

  draw(ctx, v, R) {
    const L = this.lay(v), { P, gy, dTop, dBot } = L, t = this.t, top = this.top(v);
    // céu do fim da tarde e o sol a descer
    sky(ctx, v.w, v.h, dTop + 4, TARDE.ceu);
    disc(ctx, v.w * 0.78, dTop - (P ? 30 : 4), P ? 14 : 10, '#fff0b0'); disc(ctx, v.w * 0.78, dTop - (P ? 30 : 4), P ? 11 : 8, '#ffd166');
    // as casas caiadas da antiga armação do atum
    for (let k = 0; k < (P ? 3 : 4); k++) casaAtum(R, 4 + k * 29, dTop + 7, 26, 13);
    // as dunas e as âncoras alinhadas
    hills(ctx, v.w, dBot, dTop + 12, 0, 0, 5, 3, '#e4bf84', 2);
    R(0, dBot - 2, v.w, 2, '#d0a66a');
    const fy = Math.round(lerp(dTop + 8, dBot, 0.5));
    for (let x = 6 + (P ? 96 : 124); x < v.w; x += 19) ancora(R, x, fy + Math.round(hash(x) * 3), 1, Math.round(hash(x * 3) * 2 - 1), true);
    for (let x = 10; x < v.w; x += 19) ancora(R, x, fy + 12 + Math.round(hash(x * 1.7) * 3), 1, Math.round(hash(x * 5) * 2 - 1), true);
    for (let x = 16, i = 0; x < v.w + 10; x += P ? 34 : 38, i++) { ancora(R, x, dBot - 2 + (i % 2) * 3, 2, (i % 3) - 1); if (i % 2) tufo(R, x + 16, dBot - 3, '#8a9a4a'); }
    // a praia, a areia molhada e a onda
    R(0, dBot, v.w, v.h - dBot, '#f0cf98');
    for (let i = 0; i < 50; i++) R(hash(i * 3.3) * v.w, dBot + 3 + hash(i * 7.1) * (v.h - dBot), 2, 1, i % 2 ? '#d8b078' : '#fbe6b8');
    R(0, gy + 3, v.w, v.h - gy - 3, '#d9b684'); R(0, gy + 3, v.w, 1, '#c8a070');
    const foto = this.fase !== 'jogo';
    const wy = foto ? v.h - 3 + Math.sin(t * 1.5) * 2 : this.agua(v, L);
    // conchas
    for (const c of this.conchas) {
      if (c.got || foto || this.tw < c.t0) continue;
      const x = Math.round(c.x), y = L.cy;
      if (c.tipo === 0) { R(x - 5, y - 4, 10, 7, INK); R(x - 4, y - 3, 8, 5, '#fff6e6'); R(x - 2, y - 3, 1, 5, '#f09a8c'); R(x + 1, y - 3, 1, 5, '#f09a8c'); R(x - 1, y + 2, 2, 2, INK); }
      else if (c.tipo === 1) { R(x - 4, y - 5, 9, 8, INK); R(x - 3, y - 4, 7, 6, '#ffb38a'); R(x - 1, y - 2, 3, 2, '#fff6e6'); R(x + 3, y - 1, 3, 3, INK); R(x + 3, y, 2, 1, '#ffb38a'); }
      else { R(x - 1, y - 6, 3, 11, INK); R(x - 6, y - 1, 13, 3, INK); R(x, y - 5, 1, 9, '#ff7a5a'); R(x - 5, y, 11, 1, '#ff7a5a'); }
      if (!c.got) R(x, y - 12 - Math.round(Math.abs(Math.sin(t * 5)) * 2), 1, 3, GOLD);
    }
    // a família
    const sp = Math.min(32, (v.w - 30) / 7), fy2 = dBot + (P ? 16 : 22), ordem = [3, 6, 1, 0, 2, 5, 4];
    const tf = Math.max(0, this.tf - D);                    // tempo desde que a família se junta para a fotografia
    if (!foto) {
      // os outros passeiam junto às âncoras
      [1, 2, 3, 4, 5, 6].forEach((k, i) => { const x = v.w * (P ? 0.3 : 0.44) + i * (P ? 26 : 30), y = dBot + 6; shadow(ctx, x, y, 12); person(ctx, this.fam[k], x, y, { scale: 2, face: i < 3 ? 1 : -1 }); });
      shadow(ctx, this.ix, gy, 14);
      // o Tomás, pequenino, atrás da mãe
      const tx = this.ix - this.face * 22;
      shadow(ctx, tx, gy, 10); person(ctx, this.tom, tx, gy, { scale: 2, face: this.face, moving: this.moving, dist: this.walk });
      person(ctx, this.fam[0], this.ix, gy, { scale: 2, face: this.face, moving: this.moving, dist: this.walk });
    } else {
      const u = clamp(tf / 1.6, 0, 1), cx = v.w / 2;
      ordem.forEach((k, j) => {
        const xf = cx + (j - 3) * sp, x0 = k === 0 ? this.ix : v.w * (P ? 0.3 : 0.44) + (k - 1) * (P ? 26 : 30), y0 = k === 0 ? gy : dBot + 6;
        const x = lerp(x0, xf, u), y = lerp(y0, fy2, u), pronto = u >= 1;
        shadow(ctx, x, y, 14);
        person(ctx, this.fam[k], x, y, { scale: 2, face: pronto ? (j < 3 ? 1 : -1) : (xf > x0 ? 1 : -1), moving: !pronto, dist: u * 80, hop: pronto && tf > 2.4 ? Math.round(Math.abs(Math.sin(t * 6 + j)) * 2) : 0 });
      });
      // o Tomás à frente de todos, aos saltos com as conchas
      const tx0 = this.ix - this.face * 22, tx = lerp(tx0, cx + 6, u), ty = lerp(gy, fy2 + 7, u);
      shadow(ctx, tx, ty, 10); person(ctx, this.tom, tx, ty, { scale: 2, face: 1, moving: u < 1 && this.tf > D, dist: u * 60, hop: Math.round(Math.abs(Math.sin(t * 7)) * 3) });
      // a moldura da fotografia
      if (tf > 2.4) {
        const x0 = Math.round(cx - sp * 3.5 - 8), x1 = Math.round(cx + sp * 3.5 + 8), y0 = Math.max(top + 2, fy2 - 64), y1 = fy2 + 8;
        R(x0 - 6, y0 - 6, x1 - x0 + 12, 6, PAPER); R(x0 - 6, y1, x1 - x0 + 12, 16, PAPER); R(x0 - 6, y0, 6, y1 - y0, PAPER); R(x1, y0, 6, y1 - y0, PAPER);
        R(x0 - 7, y0 - 7, x1 - x0 + 14, 1, INK); R(x0 - 7, y1 + 16, x1 - x0 + 14, 1, INK); R(x0 - 7, y0 - 7, 1, y1 - y0 + 24, INK); R(x1 + 6, y0 - 7, 1, y1 - y0 + 24, INK);
        text(ctx, 'PEDRAS D\'EL REI', cx, y1 + 5, '#a3242c', { align: 'center' });
      }
    }
    // a onda (por cima de tudo: molha os pés)
    R(0, wy, v.w, v.h - wy, '#5a8ac8'); R(0, wy + 4, v.w, v.h - wy, '#3f6fb0');
    for (let x = 0; x < v.w; x += 6) R(x, wy - 1 + Math.round(Math.sin(x * 0.2 + t * 3)), 5, 2, '#fff6e6');
    if (this.flash > 0) R(0, 0, v.w, v.h, `rgba(255,255,255,${this.flash.toFixed(2)})`);
    // conchas apanhadas
    if (!foto) { sign(ctx, 'CONCHAS ' + this.n, v.w / 2, top + 3, { scale: 2, color: PAPER }); }
  }

  bot(I, v) {
    if (this.fase === 'jogo') {
      const c = this.conchas.find((q) => !q.got && this.tw >= q.t0);
      if (c) { I.pointerX = c.x / v.w; I.pointerY = 0.9; }
    } else if (this.tf > D + 4.5) I.actionPressed = true;
  }
}

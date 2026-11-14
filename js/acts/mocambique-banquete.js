// O banquete na praia (Moçambique): os pratos vão passando pela mesa, da direita para a esquerda.
// Um só botão: tocar quando um prato de marisco (camarão ou caranguejo) passa à frente da Inês,
// para ela o comer. Se tocar numa malagueta... piri-piri! (fumo pelas orelhas e um marisco a menos).
// Nunca se perde: o que a Inês não apanhar, come o Zé Brás, na ponta da mesa.
//   { act: Banquete, hearts: 5, seq: 'CCKMCC...' }   C camarão · K caranguejo · M malagueta
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, clamp, mix, person, text } from '../draw.js';
import { praiaMoz } from './mocambique-cenario.js';

const A = '#ff8a5a', B = '#ffd0a0', C = '#ff5d3a', K = '#ff7a2a', KL = '#ffb070', M = '#e0182a', V = '#3fae5a';
// cada comida: retângulos [x, y, largura, altura, cor] numa grelha com origem no centro
const COMIDA = {
  C: [[-1, -5, 4, 2, A], [-3, -4, 2, 2, B], [-5, -3, 2, 3, A], [-5, 0, 2, 2, B], [-4, 2, 2, 2, A], [-2, 3, 2, 2, B], [0, 3, 3, 1, C], [1, 2, 2, 1, C], [1, 4, 2, 1, C],
    [3, -4, 2, 3, A], [5, -3, 1, 2, A], [-2, -2, 1, 2, C], [0, -2, 1, 2, C], [2, -1, 1, 2, C]],
  K: [[-5, -2, 10, 5, K], [-4, -3, 8, 1, K], [-4, 3, 8, 1, K], [-8, -6, 3, 3, K], [-7, -3, 2, 2, K], [5, -6, 3, 3, K], [5, -3, 2, 2, K],
    [-2, -5, 1, 2, K], [1, -5, 1, 2, K], [-7, 0, 2, 1, K], [-7, 2, 2, 1, K], [5, 0, 2, 1, K], [5, 2, 2, 1, K]],
  M: [[-6, 2, 3, 2, M], [-4, 0, 4, 3, M], [-1, -1, 4, 3, M], [2, -2, 3, 3, M], [4, -4, 2, 2, V], [5, -5, 2, 1, V]],
};
const BRILHO = { C: [[4, -3, 1, 1, INK]], K: [[-3, -2, 3, 1, KL], [-2, -6, 1, 1, '#ffffff'], [1, -6, 1, 1, '#ffffff'], [-7, -6, 1, 1, KL], [6, -6, 1, 1, KL]], M: [[-3, 0, 3, 1, '#ff8a8a'], [0, -1, 2, 1, '#ff8a8a']] };

function comida(R, kind, cx, cy, s) {
  for (const p of COMIDA[kind]) R(cx + p[0] * s - 1, cy + p[1] * s - 1, p[2] * s + 2, p[3] * s + 2, INK);
  for (const p of COMIDA[kind].concat(BRILHO[kind])) R(cx + p[0] * s, cy + p[1] * s, p[2] * s, p[3] * s, p[4]);
}

const DICA = 'Toca quando o marisco passar à frente da Inês. Na malagueta, não toques!';

export class Banquete extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    this.seq = (this.cfg.seq || 'CCKMCCMKCCMCKCMCC').split('');
    this.items = [];
    this.k = 0; this.spawn = 0.8; this.eaten = 0; this.stun = 0; this.fogo = 0; this.fim = 0; this.el = 0; this.zb = 0; this.chew = 0;
    this.gente = [
      { who: 'zebras', x: 0.08, face: 1 }, { who: 'lourenco', x: 0.29, face: 1 }, { who: 'ines', x: 0.5, face: 1 },
      { who: 'mi', x: 0.7, face: -1 }, { who: 'leal', x: 0.83, face: -1 }, { who: 'pi', x: 0.95, face: -1 },
    ].map((p) => ({ ...p, frames: getCharacter(p.who, 'praia') }));
    this.hint(DICA);
  }

  geo(v) {
    const gy = Math.round(v.h * (v.portrait ? 0.74 : 0.86));
    return { gy, fy: gy - 12, ty: gy - 16, zx: Math.round(v.w / 2), endX: Math.round(v.w * 0.08) + 18 };
  }

  update(dt, I, v) {
    this.el += dt;
    if (this.zb > 0) this.zb -= dt;
    if (this.chew > 0) this.chew -= dt;
    if (this.fogo > 0) this.fogo -= dt;
    if (this.fim) { this.fim += dt; if (this.fim > 3.4) this.done(); return; }
    const g = this.geo(v), speed = 56 + Math.min(28, this.k * 1.8);
    if (this.k < this.seq.length) {
      this.spawn -= dt;
      if (this.spawn <= 0) { this.items.push({ kind: this.seq[this.k], x: v.w + 18, fly: 0 }); this.k++; this.spawn = Math.max(1.15, 1.5 - this.k * 0.02); }
    }
    for (const it of this.items) {
      it.x -= speed * dt;
      if (it.fly) it.fly += dt;
      if (!it.gone && it.kind !== 'M' && it.x < g.endX) { it.gone = true; this.zb = 0.5; this.sfx('pop'); }   // fica para o Zé Brás
    }
    this.items = this.items.filter((it) => it.x > -24);
    if (this.stun > 0) { this.stun -= dt; if (this.stun <= 0) this.hint(DICA); }
    else if (I.actionPressed) {
      const it = this.items.find((i) => !i.gone && Math.abs(i.x - g.zx) <= 19);
      if (!it) this.sfx('toc');
      else if (it.kind === 'M') {
        it.gone = true; this.stun = 1.2; this.fogo = 1.7;
        this.eaten = Math.max(this.got * 2, this.eaten - 1);
        this.sfx('hurt');
        this.fx.burst(g.zx + 6, g.fy - 30, 14, ['#ff3b3b', '#ff8a4b', GOLD], 70);
        this.hint('Inês: «Piri-piri!!! Água! Uma 2M, depressa!»');
      } else {
        it.gone = true; it.fly = 0.01; this.eaten++; this.chew = 0.5;
        this.sfx('slurp');
        if (this.eaten % 2 === 0) this.heart(1, g.zx, g.ty - 34);
      }
    }
    if (this.k >= this.seq.length && !this.items.length) {
      this.fim = 0.01; this.sfx('win');
      this.hint(this.cfg.fim || 'Barriga cheia, pés na areia e o sol a pôr-se no Índico. Que viagem!');
    }
  }

  draw(ctx, v, R) {
    const g = this.geo(v), t = this.t, dusk = clamp(0.3 + this.el / 34 * 0.55 + this.fim * 0.08, 0, 1);
    praiaMoz(ctx, v, R, t, { gy: g.fy, dusk });
    // os amigos, atrás da mesa
    for (const p of this.gente) {
      const x = Math.round(p.x * v.w), ines = p.who === 'ines';
      let hop = this.fim ? Math.round(Math.abs(Math.sin(t * 7 + p.x * 9)) * 3) : 0;
      if (ines && this.chew > 0) hop = Math.round(Math.abs(Math.sin(this.chew * 20)) * 2);
      if (ines && this.fogo > 0) hop = Math.round(Math.abs(Math.sin(t * 22)) * 5);
      if (p.who === 'zebras' && this.zb > 0) hop = Math.round(Math.sin(this.zb * 2 * Math.PI) * 3);
      person(ctx, p.frames, x, g.fy, { scale: 2, face: p.face, hop });
      if (ines && this.fogo > 0) {
        // cara encarnada e fumo pelas orelhas
        R(x - 6, g.fy - 34 - hop, 16, 12, 'rgba(255,40,20,0.45)');
        for (let i = 0; i < 4; i++) {
          const k = (t * 1.6 + i * 0.25) % 1, c = k < 0.5 ? '#ffffff' : '#d8d3e6';
          R(x - 14 - k * 10, g.fy - 32 - k * 22 - hop, 4 + k * 3, 4 + k * 3, c); R(x + 12 + k * 10, g.fy - 32 - k * 22 - hop, 4 + k * 3, 4 + k * 3, c);
        }
      }
    }
    // a mesa, com uma capulana a fazer de toalha
    const tx0 = 3, tw = v.w - 6, cores = ['#e0527a', '#ffd166', '#2fa6a0', '#ff8a4b'];
    R(tx0 - 1, g.ty - 1, tw + 2, 16, INK);
    R(tx0, g.ty, tw, 5, '#fff6e6');
    for (let x = 0; x < tw; x += 8) { R(tx0 + x, g.ty + 5, Math.min(8, tw - x), 9, cores[(x / 8) % 4 | 0]); R(tx0 + x + 3, g.ty + 8, 2, 2, '#fff6e6'); }
    R(tx0, g.ty + 5, tw, 1, mix('#fff6e6', '#2b1d2e', 0.3));
    for (const lx of [10, v.w - 14]) { R(lx - 1, g.ty + 14, 5, 5, INK); R(lx, g.ty + 14, 3, 4, '#8a5a34'); }
    // cervejas 2M e a tigela do piri-piri
    for (const fx of [0.2, 0.4, 0.62, 0.9]) this.garrafa(ctx, R, Math.round(fx * v.w), g.ty + 1);
    R(Math.round(v.w * 0.76) - 6, g.ty - 4, 12, 5, INK); R(Math.round(v.w * 0.76) - 5, g.ty - 3, 10, 3, '#e0182a'); R(Math.round(v.w * 0.76) - 3, g.ty - 3, 3, 1, '#ff8a8a');
    // o lugar da Inês: um individual dourado e uma moldura a piscar
    const on = this.items.some((i) => !i.gone && Math.abs(i.x - g.zx) <= 19);
    R(g.zx - 21, g.ty, 42, 5, INK); R(g.zx - 20, g.ty + 1, 40, 3, on ? '#fff3a8' : GOLD);
    const c = on || Math.floor(t * 3) % 2 ? GOLD : '#fff6e6', y0 = g.ty - 25;
    for (const sx of [-1, 1]) { R(g.zx + sx * 21 - 1, y0 - 1, 3, 9, INK); R(g.zx + sx * 21 - (sx > 0 ? 6 : -1), y0 - 1, 7, 3, INK); R(g.zx + sx * 21, y0, 1, 7, c); R(g.zx + sx * 21 - (sx > 0 ? 5 : 0), y0, 6, 1, c); }
    // os pratos
    for (const it of this.items) {
      const x = Math.round(it.x);
      R(x - 14, g.ty - 3, 28, 5, INK); R(x - 13, g.ty - 2, 26, 3, '#ffffff'); R(x - 9, g.ty, 18, 1, '#c9d2e0');
      if (it.gone && !it.fly) continue;
      if (it.fly) {                       // a caminho da boca da Inês
        const k = clamp(it.fly / 0.22, 0, 1);
        if (k < 1) comida(R, it.kind, Math.round(x + (g.zx + 8 - x) * k), Math.round(g.ty - 10 - k * 18), 2);
        continue;
      }
      comida(R, it.kind, x, g.ty - 10, 2);
      if (it.kind === 'M' && Math.floor(t * 8) % 2) { R(x - 3, g.ty - 25, 2, 3, '#ff8a4b'); R(x + 4, g.ty - 27, 2, 3, GOLD); }
    }
    // quantos já comeu (dois mariscos = um coração)
    const by = Math.min(v.h - 9, g.gy + 10), n = this.max * 2, bx = Math.round(v.w / 2 - (n * 9 + (n / 2 - 1) * 4) / 2);
    for (let i = 0; i < n; i++) {
      const x = bx + i * 9 + Math.floor(i / 2) * 4, lit = i < this.eaten;
      R(x - 1, by - 1, 8, 7, INK); R(x, by, 6, 5, lit ? A : '#5a4a5e'); R(x + 2, by + 2, 3, 3, INK); R(x + 4, by + 1, 1, 1, lit ? '#ffffff' : '#8a7a8e');
    }
    if (this.fim && this.fim > 0.4) text(ctx, 'BOM PROVEITO!', v.w / 2, this.top(v) + 8, GOLD, { scale: 2, align: 'center', shadow: INK });
  }

  garrafa(ctx, R, x, y) {
    R(x - 4, y - 16, 9, 17, INK); R(x - 3, y - 15, 7, 15, '#7a4a22'); R(x - 2, y - 21, 5, 6, INK); R(x - 1, y - 20, 3, 6, '#7a4a22'); R(x - 1, y - 21, 3, 1, GOLD);
    R(x - 3, y - 11, 7, 7, '#e0182a'); text(ctx, '2M', x - 3, y - 10, '#ffd166');
  }

  bot(I, v) {
    if (this.fim || this.stun > 0) return;
    const zx = Math.round(v.w / 2);
    if (this.items.some((i) => !i.gone && i.kind !== 'M' && Math.abs(i.x - zx) < 7)) I.actionPressed = true;
  }
}

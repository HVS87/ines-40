// Nível 19 «Lanheses», ato 1: a eira. O milho está a secar nas lajes e vem lá uma nuvem!
// Arrasta-se o dedo (ou usam-se as setas) para levar a Inês até um monte de espigas (apanha
// sozinha um cesto) e depois até à porta do espigueiro, onde o Lourenço as guarda. Cada monte
// guardado antes de a nuvem tapar o sol vale um coração; se chover, a família trata do resto.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, clamp, lerp, person, shadow, mark } from '../draw.js';
import { ceu, sol, nuvem, casaGranito, latada, espigueiro, eira, monte } from './lanheses-comum.js';

const MONTES = [0.08, 0.21, 0.34, 0.47, 0.6];   // onde estão os montes (fração da largura)
const TEMPO = 30;                               // segundos até a nuvem tapar o sol

export class Eira extends Act {
  get max() { return this.cfg.hearts || MONTES.length; }

  start(v) {
    this.x = v.w * 0.7;
    this.face = -1; this.dist = 0; this.anda = false;
    this.cesto = false;
    this.montes = MONTES.map(() => true);
    this.guardados = 0;
    this.tempo = 0;
    this.chuva = 0; this.over = 0;
    this.ines = getCharacter('ines', 'casual');
    this.lou = getCharacter('lourenco', 'casual');
    this.hint('Arrasta o dedo (ou usa as setas) para levar o milho ao espigueiro antes da chuva!');
  }

  lay(v) {
    const top = this.top(v), P = v.portrait, w = v.w;
    const gy = Math.round(v.h * (P ? 0.62 : 0.72));
    const ex = Math.round(w * (P ? 0.36 : 0.5)), ew = Math.round(w * 0.97) - ex, eh = clamp(gy - top - 12, 48, 100);
    return { top, gy, wy: gy + 10, ex, ew, eh, dep: ex + ew - 16, solX: Math.round(w * 0.13), solY: top + 14 };
  }

  update(dt, I, v) {
    const L = this.lay(v);
    if (this.over) { this.over += dt; if (this.over > 2.6) this.done(); return; }
    if (this.chuva) {
      this.chuva += dt;
      if (this.chuva > 3) this.done();
      return;
    }
    this.tempo += dt;
    // andar: atrás do dedo ou com as setas
    let dir = 0;
    if (I.pointerX >= 0) { const tx = I.pointerX * v.w; if (Math.abs(tx - this.x) > 3) dir = tx > this.x ? 1 : -1; } else if (I.left) dir = -1; else if (I.right) dir = 1;
    const vel = Math.max(72, v.w * 0.3);
    this.anda = dir !== 0;
    if (dir) { this.face = dir; this.x = clamp(this.x + dir * vel * dt, 10, L.dep + 4); this.dist += vel * dt; }
    // apanhar um monte / entregar no espigueiro
    if (!this.cesto) {
      const i = MONTES.findIndex((f, k) => this.montes[k] && Math.abs(f * v.w - this.x) < 8);
      if (i >= 0) { this.montes[i] = false; this.cesto = true; this.sfx('pop'); }
    } else if (this.x >= L.dep - 8) {
      this.cesto = false; this.guardados++;
      this.heart(1, L.dep, L.gy - 30); this.sfx('check');
      this.fx.burst(L.dep, L.gy - 24, 8, ['#f2b830', '#ffd95a'], 40);
      if (this.guardados >= MONTES.length) { this.over = 0.01; this.sfx('win'); this.hint('Lourenço: «O milho todo no espigueiro! Mesmo a tempo.»'); return; }
    }
    if (this.tempo > TEMPO * 0.7 && this.tempo - dt <= TEMPO * 0.7) this.hint('A nuvem está quase a tapar o sol... Depressa!');
    if (this.tempo >= TEMPO) {
      this.chuva = 0.01; this.sfx('boom');
      this.hint('Começou a chover! A família vem a correr ajudar a guardar o resto.');
    }
  }

  draw(ctx, v, R) {
    const L = this.lay(v), w = v.w, gy = L.gy, t = this.t, p = clamp(this.tempo / TEMPO, 0, 1);
    ceu(ctx, v, R, gy, this.chuva ? 1 : 0);
    if (!this.chuva) sol(ctx, L.solX, L.solY);
    const nx = lerp(w + 50, L.solX + 4, p);
    nuvem(ctx, R, nx, L.solY - 2, p > 0.7 || this.chuva ? '#8a8fa0' : '#c9ced8', '#6f7486');
    const cw = Math.min(84, Math.round(w * 0.28)), ch = clamp(gy - L.top - 34, 40, 64);
    casaGranito(ctx, R, 6, gy, cw, ch);
    if (L.ex - cw - 20 > 24) latada(R, cw + 18, L.ex - 12, gy, 26);
    espigueiro(R, L.ex, gy, L.ew, L.eh, 0.15 + (this.guardados / MONTES.length) * 0.8);
    eira(R, v, gy);
    // escadote à porta e o Lourenço a receber as espigas
    R(L.dep - 5, gy - 16, 2, 18, '#6b4a2e'); R(L.dep + 5, gy - 16, 2, 18, '#6b4a2e'); for (let k = 0; k < 4; k++) R(L.dep - 5, gy - 14 + k * 5, 12, 1, '#8a5a34');
    shadow(ctx, L.dep + 16, L.wy, 14);
    person(ctx, this.lou, Math.min(L.dep + 16, w - 12), L.wy, { scale: 2, face: -1, hop: this.over ? Math.round(Math.abs(Math.sin(t * 8)) * 3) : 0 });
    // os montes de espigas
    MONTES.forEach((f, k) => { if (this.montes[k]) monte(R, f * w, L.wy + 5, this.chuva > 0.6); });
    // a Inês (com o cesto, quando leva milho)
    shadow(ctx, this.x, L.wy, 14);
    person(ctx, this.ines, this.x, L.wy, { scale: 2, face: this.face, moving: this.anda, dist: this.dist });
    if (this.cesto) {
      const cx = Math.round(this.x + this.face * 11), cy = L.wy - 24;
      R(cx - 7, cy - 1, 14, 9, INK); R(cx - 6, cy, 12, 7, '#b8793a'); R(cx - 6, cy + 2, 12, 1, '#8a5a34'); R(cx - 6, cy + 5, 12, 1, '#8a5a34');
      R(cx - 5, cy - 4, 10, 4, INK); R(cx - 4, cy - 3, 8, 3, '#f2b830'); R(cx - 2, cy - 3, 2, 1, '#ffd95a'); R(cx + 2, cy - 2, 2, 1, '#ffd95a');
    }
    // setas de ajuda: para onde ir
    if (!this.over && !this.chuva) {
      const b = Math.round(Math.abs(Math.sin(t * 6)) * 3);
      let ax = L.dep, ay = gy - L.eh * 0.24 - 14;
      if (!this.cesto) {
        let best = -1;
        MONTES.forEach((f, k) => { if (this.montes[k] && (best < 0 || Math.abs(f * w - this.x) < Math.abs(MONTES[best] * w - this.x))) best = k; });
        if (best >= 0) { ax = Math.round(MONTES[best] * w); ay = L.wy - 6; }
      } else ay = L.wy - 56;
      R(ax - 4, ay - 8 - b, 9, 5, INK); R(ax - 3, ay - 7 - b, 7, 2, GOLD); R(ax - 2, ay - 5 - b, 5, 1, GOLD); R(ax - 1, ay - 4 - b, 3, 1, GOLD);
    }
    // a chuva (e a família, ao longe, a correr)
    if (this.chuva) {
      R(0, 0, w, v.h, 'rgba(40,50,80,0.22)');
      for (let k = 0; k < 60; k++) { const rx = (k * 37 + Math.floor(t * 90)) % (w + 20) - 10, ry = (k * 53 + Math.floor(t * 260)) % v.h; R(rx, ry, 1, 4, '#bfe0f8'); }
      mark(ctx, this.x, L.wy - 52, '!');
    }
  }

  bot(I, v) {
    if (this.over || this.chuva) return;
    const L = this.lay(v);
    let tx = L.dep;
    if (!this.cesto) {
      let best = -1;
      MONTES.forEach((f, k) => { if (this.montes[k] && (best < 0 || Math.abs(f * v.w - this.x) < Math.abs(MONTES[best] * v.w - this.x))) best = k; });
      if (best < 0) return;
      tx = MONTES[best] * v.w;
    }
    if (tx > this.x) I.right = true; else I.left = true;
  }
}

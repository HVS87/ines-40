// Nível 15 «Viver Juntos», ato 1: as mudanças. As caixas sobem as escadas de mão em mão
// (Lourenço → Tomás → Inês); toca-se quando a caixa chega às mãos da Inês. O Tomás, agarrado
// ao telemóvel, deixa cair uma (a que diz «FRÁGIL», claro). Caixa falhada cai ao chão, mas
// vai para dentro de casa na mesma: nunca se perde.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, clamp, lerp, person, text, shadow, mark } from '../draw.js';

// dur: tempo de voo do Tomás até à Inês (s) · alt: altura do arco (px)
const CAIXAS = [
  { nome: 'LIVROS', dur: 1.15, alt: 18 },
  { nome: 'LOUÇA', dur: 0.95, alt: 12 },
  { nome: 'FRAGIL', dur: 1.3, alt: 24, queda: true },
  { nome: 'BIMBY', dur: 0.85, alt: 10 },
  { nome: 'TOMÁS', dur: 1.05, alt: 20 },
];
const LT = 0.8;                      // voo do Lourenço até ao Tomás (s)
const ANTES = 0.24, DEPOIS = 0.16;   // folga para apanhar: antes e depois de a caixa chegar (s)
const DICA = 'Toca quando a caixa chegar às mãos da Inês!';

function caixa(ctx, R, x, y, nome) {
  x = Math.round(x); y = Math.round(y);
  R(x - 14, y - 9, 28, 18, INK); R(x - 13, y - 8, 26, 16, '#c9985a'); R(x - 13, y - 8, 26, 2, '#e0b878'); R(x - 13, y + 6, 26, 2, '#a87a42');
  R(x - 12, y - 4, 24, 9, '#f6ecd2');
  text(ctx, nome, x, y - 2, INK, { align: 'center' });
}
function caixinha(R, x, y) { R(x - 8, y - 4, 16, 9, INK); R(x - 7, y - 3, 14, 7, '#c9985a'); R(x - 7, y - 3, 14, 1, '#e0b878'); R(x - 1, y - 3, 2, 7, '#f0dca8'); }

export class Mudancas extends Act {
  get max() { return this.cfg.hearts || CAIXAS.length; }

  start() {
    this.k = 0;              // caixa atual
    this.fase = 'pega';      // pega → lt → (cai →) seg → ti → guarda | chao → pega ...
    this.ft = 0;             // tempo na fase
    this.lock = 0;           // depois de um toque fora de tempo, a Inês demora a recompor-se
    this.salto = 0;
    this.caiu = false;       // o Tomás já deixou cair a caixa frágil
    this.dentro = 0;         // caixas já dentro de casa
    this.over = 0;
    this.ines = getCharacter('ines', 'casual');
    this.lou = getCharacter('lourenco', 'casual');
    this.tom = getCharacter('tomas', 'teen');
    this.hint(DICA);
  }

  go(fase) { this.fase = fase; this.ft = 0; }

  // Onde está cada um: três patamares ligados por dois lanços de escada.
  lay(v) {
    const top = this.top(v), P = v.portrait;
    const y0 = P ? Math.round(v.h * 0.72) : v.h - 12;
    const rise = clamp(Math.floor((y0 - top - 56) / 2), 16, P ? 84 : 40);
    const xl = Math.max(Math.round(v.w * 0.15), 50), xt = Math.round(v.w * 0.47), xi = Math.round(v.w * (P ? 0.72 : 0.78));
    return { y0, rise, xl, xt, xi, yl: y0, yt: y0 - rise, yi: y0 - 2 * rise };
  }

  // Altura do chão (degraus) em cada x.
  chao(x, L) {
    const lanco = (xa, xb, ya, yb) => {
      const n = Math.max(1, Math.round((ya - yb) / 6));
      return ya - Math.min(n, Math.floor(((x - xa) / (xb - xa)) * (n + 1))) * ((ya - yb) / n);
    };
    if (x < L.xl + 18) return L.yl;
    if (x < L.xt - 18) return lanco(L.xl + 18, L.xt - 18, L.yl, L.yt);
    if (x < L.xt + 18) return L.yt;
    if (x < L.xi - 18) return lanco(L.xt + 18, L.xi - 18, L.yt, L.yi);
    return L.yi;
  }

  seguinte() {
    this.k++;
    this.dentro++;
    if (this.k >= CAIXAS.length) { this.over = 0.01; this.hint('Lourenço: «Última caixa! Agora só falta... arrumar isto tudo.»'); this.sfx('win'); } else { this.go('pega'); this.hint(DICA); }
  }

  update(dt, I, v) {
    if (this.over) { this.over += dt; if (this.over > 2.4) this.done(); return; }
    this.ft += dt;
    this.lock = Math.max(0, this.lock - dt);
    this.salto = Math.max(0, this.salto - dt);
    const c = CAIXAS[this.k], L = this.lay(v);
    if (this.fase === 'pega') {
      if (this.ft > 0.6) { this.go('lt'); this.sfx('jump'); }
    } else if (this.fase === 'lt') {
      if (this.ft >= LT) {
        if (c.queda && !this.caiu) {
          this.go('cai'); this.sfx('boom');
          this.fx.burst(L.xt - 14, L.yt - 6, 10, ['#c9985a', PAPER], 50);
          this.hint('Tomás: «Ups... Estava só a responder a uma mensagem!»');
        } else { this.go('seg'); this.sfx('toc'); }
      }
    } else if (this.fase === 'cai') {
      if (this.ft > 2.3) { this.caiu = true; this.go('seg'); this.sfx('toc'); this.hint('Lourenço: «Tomás! Larga o telemóvel e agarra a caixa!»'); }
    } else if (this.fase === 'seg') {
      if (this.ft > (c.queda ? 1.7 : 0.45)) { this.go('ti'); this.sfx('jump'); if (c.queda) this.hint(DICA); }
    } else if (this.fase === 'ti') {
      const falta = c.dur - this.ft;
      if (I.actionPressed && this.lock <= 0) {
        if (falta < ANTES && falta > -DEPOIS) {
          this.heart(1, L.xi - 12, L.yi - 34); this.sfx('check');
          this.go('guarda');
          return;
        }
        this.lock = 0.6; this.salto = 0.3; this.sfx('click');   // cedo de mais: a Inês dá um saltinho em falso
      }
      if (falta < -DEPOIS) {
        this.go('chao'); this.sfx('boom');
        this.fx.burst(L.xi - 14, L.yi - 6, 8, ['#c9985a', PAPER], 45);
        this.hint(this.k % 2 ? 'Inês: «Ai! Esta escapou-me...»' : 'Inês: «Ups! Ainda bem que não era a louça... ou era?»');
      }
    } else if (this.fase === 'guarda') {
      if (this.ft > 0.8) this.seguinte();
    } else if (this.fase === 'chao') {
      if (this.ft > 1.5) this.seguinte();
    }
  }

  // Posição da caixa que vai no ar (ou nas mãos de alguém).
  pos(L) {
    const c = CAIXAS[this.k], f = this.ft;
    const mL = { x: L.xl + 13, y: L.yl - 24 }, mTe = { x: L.xt - 13, y: L.yt - 24 }, mTd = { x: L.xt + 13, y: L.yt - 24 }, mI = { x: L.xi - 13, y: L.yi - 24 };
    const arco = (a, b, p, alt) => ({ x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p) - alt * 4 * p * (1 - p) });
    switch (this.fase) {
      case 'pega': { const p = clamp(f / 0.5, 0, 1); return { x: lerp(L.xl - 6, mL.x, p), y: lerp(L.yl - 10, mL.y, p) }; }
      case 'lt': return arco(mL, mTe, clamp(f / LT, 0, 1), 16);
      case 'cai': { const p = clamp(f / 0.22, 0, 1); return { x: mTe.x - 2, y: lerp(mTe.y, L.yt - 9, p * p) - (f < 0.5 ? Math.abs(Math.sin(f * 14)) * 3 * (1 - f * 2) : 0) }; }
      case 'seg': { if (c.queda) { const p = clamp((f - 0.9) / 0.4, 0, 1); return { x: lerp(mTe.x - 2, mTd.x, p), y: lerp(L.yt - 9, mTd.y, p) }; } return f < 0.2 ? mTe : mTd; }
      case 'ti': { const p = f / c.dur, a = arco(mTd, mI, Math.min(p, 1), c.alt); if (p > 1) a.y += (p - 1) * (p - 1) * 300; return a; }
      case 'guarda': { const p = clamp(f / 0.6, 0, 1); return { x: lerp(mI.x, L.xi + 30, p), y: lerp(mI.y, L.yi - 14, p) - Math.sin(p * Math.PI) * 6 }; }
      default: { const p = clamp(f / 0.25, 0, 1); return { x: mI.x - 2, y: lerp(mI.y + 4, L.yi - 9, p * p) - (f < 0.6 ? Math.abs(Math.sin(f * 13)) * 3 * (1 - f / 0.6) : 0) }; }
    }
  }

  draw(ctx, v, R) {
    const L = this.lay(v), t = this.t, w = v.w, c = CAIXAS[Math.min(this.k, CAIXAS.length - 1)];
    // a parede da escada, com azulejos em baixo
    R(0, 0, w, v.h, '#efe4cc');
    for (let x = 0; x < w; x += 2) {
      const y = this.chao(x, L);
      for (let r = 0; r < 4; r++) R(x, y - 24 + r * 6, 2, 6, (Math.floor(x / 6) + r) % 2 ? '#8fb6d8' : '#f6f2e6');
      R(x, y - 26, 2, 2, '#3f6fb5');
    }
    // janela da escada
    const jx = Math.round(w * 0.3), jy = Math.max(this.top(v) + 6, L.yt - 96);
    R(jx - 13, jy - 1, 26, 30, INK); R(jx - 12, jy, 24, 28, '#9fd6f5'); R(jx - 12, jy + 16, 24, 12, '#c8ecfa'); R(jx - 1, jy, 2, 28, PAPER); R(jx - 12, jy + 13, 24, 2, PAPER);
    // a porta de casa (aberta), com as caixas que já entraram
    const dx = L.xi + 30, dy = L.yi;
    R(dx - 17, dy - 50, 34, 50, INK); R(dx - 15, dy - 48, 30, 48, '#5a4038'); R(dx - 15, dy - 48, 30, 6, '#7a5a48');
    R(dx + 15, dy - 48, 5, 48, '#8a5a34'); R(dx + 16, dy - 26, 2, 3, GOLD);
    for (let k = 0; k < this.dentro; k++) caixinha(R, dx - 2 + (k % 2 ? 3 : -3), dy - 5 - k * 8);
    // tapete
    R(L.xi - 8, dy - 2, 28, 2, '#c0392b'); R(L.xi - 6, dy - 2, 24, 1, '#e0655a');
    // os degraus
    for (let x = 0; x < w; x += 2) {
      const y = this.chao(x, L);
      R(x, y, 2, v.h - y, '#9a8f86'); R(x, y, 2, 2, '#d8cfc4'); R(x, y + 2, 2, 1, '#7a7068');
    }
    // as caixas à espera, ao pé do Lourenço
    const px = L.xl - 26;
    for (let k = CAIXAS.length - 1; k > this.k; k--) caixa(ctx, R, px, L.yl - 9 - (CAIXAS.length - 1 - k) * 17, CAIXAS[k].nome);

    // ---- as pessoas ----
    const f = this.fase;
    shadow(ctx, L.xl, L.yl, 14); shadow(ctx, L.xt, L.yt, 14); shadow(ctx, L.xi, L.yi, 14);
    person(ctx, this.lou, L.xl, L.yl, { scale: 2, face: f === 'pega' && this.ft < 0.3 ? -1 : 1 });
    // o Tomás: vira-se para quem lhe atira a caixa; de resto, está ao telemóvel
    const distraido = !this.over && ((f === 'lt' && c.queda && !this.caiu) || f === 'cai' || f === 'ti' || f === 'guarda' || f === 'chao' || f === 'pega');
    const tf = f === 'seg' && this.ft > (c.queda ? 1.2 : 0.2) ? 1 : f === 'ti' ? 1 : -1;
    person(ctx, this.tom, L.xt, L.yt, { scale: 2, face: tf, hop: f === 'cai' && this.ft < 0.3 ? 3 : 0 });
    if (distraido) {
      const hx = L.xt + tf * 11, hy = L.yt - 30;
      R(hx - 2, hy - 1, 5, 9, INK); R(hx - 1, hy, 3, 7, Math.floor(t * 3) % 2 ? '#9fe8ff' : '#d6f6ff');
    }
    if (f === 'cai') mark(ctx, L.xt, L.yt - 52, '!');
    // a Inês
    const hop = this.salto > 0 ? Math.round(Math.sin((this.salto / 0.3) * Math.PI) * 5) : this.over ? Math.round(Math.abs(Math.sin(t * 7)) * 2) : 0;
    person(ctx, this.ines, L.xi, L.yi, { scale: 2, face: f === 'guarda' && this.ft > 0.15 ? 1 : -1, hop });

    // ---- a caixa em jogo ----
    if (!this.over) {
      const p = this.pos(L);
      if (f === 'ti') {
        // onde apanhar: um contorno nas mãos da Inês, que acende quando é a altura
        const falta = c.dur - this.ft, agora = falta < ANTES && falta > -DEPOIS;
        const gx = L.xi - 13, gyy = L.yi - 24, col = agora ? GOLD : PAPER;
        for (let k = -14; k < 14; k += 4) { R(gx + k, gyy - 10, agora ? 4 : 2, 1, col); R(gx + k, gyy + 9, agora ? 4 : 2, 1, col); }
        for (let k = -9; k < 9; k += 4) { R(gx - 15, gyy + k, 1, agora ? 4 : 2, col); R(gx + 14, gyy + k, 1, agora ? 4 : 2, col); }
        if (agora) { R(gx - 16, gyy - 11, 32, 1, GOLD); R(gx - 16, gyy + 10, 32, 1, GOLD); }
      }
      caixa(ctx, R, p.x, p.y, c.nome);
      if ((f === 'cai' && this.ft > 0.2) || (f === 'chao' && this.ft > 0.25)) {
        // estrelinhas do trambolhão
        for (let k = 0; k < 3; k++) { const a = t * 5 + k * 2.1; R(p.x + Math.cos(a) * 12, p.y - 14 + Math.sin(a) * 3, 2, 2, GOLD); }
      }
    }
  }

  bot(I) {
    if (this.fase === 'ti' && this.lock <= 0 && CAIXAS[this.k].dur - this.ft < 0.08) I.actionPressed = true;
  }
}

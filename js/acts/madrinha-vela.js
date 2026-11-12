// Nível 21 «Madrinha do Micas», ato 2: acender a vela do batismo no círio pascal. A chama do
// círio dança com a corrente de ar; toca-se quando ela se inclina para o pavio da vela. São
// precisos três toques certos para a chama pegar (cada um, à primeira, vale um coração); à
// terceira falha seguida o pavio aquece sozinho. O Leal comove-se e a Mi tira fotografias.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, clamp, disc, person, shadow } from '../draw.js';
import { igreja, cirio, bebe } from './madrinha-comum.js';

const VEL = [2.0, 2.6, 3.2];     // velocidade do vaivém da chama em cada toque
const PEGA = 0.6;                // a chama chega ao pavio quando se inclina mais do que isto (0–1)
const DICA = 'Toca quando a chama do círio se inclinar até ao pavio da vela!';

export class Vela extends Act {
  get max() { return this.cfg.hearts || 3; }

  start() {
    this.n = 0;              // toques certos (0–3)
    this.ph = Math.PI; this.inc = 0;
    this.falhas = 0; this.limpa = true;
    this.lock = 1; this.flash = 0; this.fumo = 0;
    this.over = 0;
    this.ines = getCharacter('ines', 'festa');
    this.padre = getCharacter('padre');
    this.mi = getCharacter('mi', 'festa');
    this.leal = getCharacter('leal', 'festa');
    this.hint(DICA);
  }

  lay(v) {
    const P = v.portrait, top = this.top(v), w = v.w;
    const gy = Math.round(v.h * (P ? 0.78 : 0.86));
    // o grande plano das chamas: à esquerda (deitado) ou em cima (ao alto)
    const Z = P ? { x: 16, y: top + 8, w: w - 32, h: Math.min(170, gy - top - 80) } : { x: 10, y: top + 4, w: Math.min(150, Math.round(w * 0.4)), h: v.h - top - 12 };
    const a = P ? 0 : Z.x + Z.w, larg = w - a;
    const fx = P ? [0.12, 0.29, 0.43, 0.67, 0.87] : [0.12, 0.3, 0.46, 0.7, 0.9];
    return { top, gy, Z, xp: a + larg * fx[0], xc: a + larg * fx[1], xi: a + larg * fx[2], xl: a + larg * fx[3], xm: a + larg * fx[4] };
  }

  acerta(v, dado) {
    const L = this.lay(v), Z = L.Z;
    if (this.limpa && !dado) this.heart(1, Z.x + Z.w * 0.62, Z.y + Z.h * 0.4); else this.sfx('check');
    this.n++; this.falhas = 0; this.limpa = true; this.lock = 0.9;
    this.fx.burst(Z.x + Z.w * 0.62, Z.y + Z.h * 0.42, 10, [GOLD, '#ff8a2b', PAPER], 40);
    if (this.n >= 3) {
      this.over = 0.01; this.sfx('win'); this.flash = 0.2;
      this.hint('Leal: «Não estou a chorar... é do fumo das velas!»');
    } else this.hint(this.n === 1 ? 'O pavio já aqueceu... Outra vez!' : 'Está quase a pegar! Só mais uma vez.');
  }

  update(dt, I, v) {
    this.flash = Math.max(0, this.flash - dt);
    this.fumo = Math.max(0, this.fumo - dt);
    if (this.over) {
      const antes = this.over; this.over += dt;
      if (antes < 1.2 && this.over >= 1.2) { this.flash = 0.2; this.sfx('click'); }
      if (antes < 2.6 && this.over >= 2.6) { this.flash = 0.2; this.sfx('click'); this.hint('Mi: «Olha o passarinho! Esta fica para o álbum.»'); }
      if (this.over > 5) this.done();
      return;
    }
    this.lock = Math.max(0, this.lock - dt);
    this.parado = (this.parado || 0) + dt;
    if (this.parado > 12) { this.parado = 0; this.acerta(v, true); return; }   // sem toques, o pavio acaba por pegar sozinho
    if (I.actionPressed) this.parado = 0;
    this.ph += dt * VEL[this.n];
    this.inc = Math.sin(this.ph);
    if (I.actionPressed && this.lock <= 0) {
      if (this.inc > PEGA) this.acerta(v, false);
      else {
        this.falhas++; this.limpa = false; this.lock = 0.5; this.fumo = 0.6; this.sfx('toc');
        if (this.falhas >= 3) this.acerta(v, true); else this.hint('Quase! Espera que a chama se incline para a vela...');
      }
    }
  }

  // Uma chama em píxeis grandes: base em (x, y), inclinada `inc` píxeis no topo.
  chama(R, x, y, u, inc, t, alt = 13) {
    const perfil = [3, 5, 6, 6, 6, 5, 5, 4, 3, 3, 2, 1, 1];
    for (let j = 0; j < alt; j++) {
      const k = Math.min(perfil.length - 1, Math.round((j / alt) * perfil.length)), hw = perfil[k] + (j > 2 && Math.floor(t * 9 + j) % 5 === 0 ? 1 : 0);
      const ox = Math.round(inc * Math.pow(j / (alt - 1), 1.5)), yy = y - (j + 1) * u;
      R(x + ox - hw * u, yy, hw * 2 * u, u, j === 0 ? '#6fb0f0' : '#ff8a2b');
      if (hw > 2 && j > 0) R(x + ox - (hw - 2) * u, yy, (hw - 2) * 2 * u, u, GOLD);
      if (hw > 4 && j > 0 && j < 7) R(x + ox - (hw - 4) * u, yy, (hw - 4) * 2 * u, u, '#fff6c4');
    }
  }

  draw(ctx, v, R) {
    const L = this.lay(v), gy = L.gy, t = this.t, Z = L.Z, acesa = this.n >= 3;
    igreja(ctx, v, R, gy, L.top, t);
    // o grupo: padre, círio, a Inês com a vela, o Leal com o Micas ao colo, a Mi de máquina na mão
    shadow(ctx, L.xp, gy, 14); person(ctx, this.padre, L.xp, gy, { scale: 2, face: 1 });
    cirio(R, L.xc, gy, 58, t);
    shadow(ctx, L.xi, gy, 14); person(ctx, this.ines, L.xi, gy, { scale: 2, face: -1 });
    const vx = Math.round(L.xi - 12), vy = gy - 28;
    R(vx - 1, vy - 22, 4, 24, INK); R(vx, vy - 21, 2, 22, PAPER);
    if (acesa) { R(vx - 1, vy - 27 - (Math.floor(t * 8) % 2), 3, 5, '#ff8a2b'); R(vx, vy - 24, 1, 2, '#fff1a8'); }
    shadow(ctx, L.xl, gy, 14); person(ctx, this.leal, L.xl, gy, { scale: 2, face: -1 });
    bebe(R, L.xl - 10, gy - 19, 1, acesa ? 'riso' : 'calmo', 1, t);
    if (this.n >= 2) { const d = Math.floor(t * 3) % 4; R(L.xl - 9, gy - 33 + d, 1, 2, '#6fc8ff'); if (acesa) R(L.xl - 4, gy - 32 + ((d + 2) % 4), 1, 2, '#6fc8ff'); }   // lágrimas de emoção
    shadow(ctx, L.xm, gy, 14); person(ctx, this.mi, L.xm, gy, { scale: 2, face: -1 });
    R(L.xm - 16, gy - 31, 9, 7, INK); R(L.xm - 15, gy - 30, 7, 5, '#5a5a70'); R(L.xm - 14, gy - 29, 3, 3, '#9fe8ff'); R(L.xm - 10, gy - 32, 2, 1, INK);

    // ---- o grande plano das chamas ----
    R(Z.x - 3, Z.y - 3, Z.w + 6, Z.h + 6, INK); R(Z.x - 2, Z.y - 2, Z.w + 4, Z.h + 4, GOLD); R(Z.x, Z.y, Z.w, Z.h, '#2a1f38');
    R(Z.x, Z.y + Math.round(Z.h * 0.6), Z.w, Z.h - Math.round(Z.h * 0.6), '#3a2a44');
    for (let k = 0; k < 7; k++) { const bx = Z.x + 8 + Math.round(((k * 47) % 100) / 100 * (Z.w - 16)), by = Z.y + 8 + ((k * 29) % Math.round(Z.h * 0.5)); disc(ctx, bx, by, 3 + (k % 3), 'rgba(255,209,102,0.12)'); }
    const u = Z.h >= 120 ? 3 : 2, cx = Math.round(Z.x + Z.w * 0.34), cy = Math.round(Z.y + Z.h * 0.6);   // topo do círio
    const px = cx + 10 * u, py = cy - 11 * u;                                                              // pavio da vela
    // o círio (largo, com a cruz encarnada)
    const cw = 8 * u, fundo = Z.y + Z.h - cy;
    R(cx - cw - 2, cy - 1, cw * 2 + 4, fundo + 1, INK); R(cx - cw, cy + 1, cw * 2, fundo - 1, PAPER); R(cx - cw, cy + 1, 3 * u, fundo - 1, '#ffffff'); R(cx + cw - 2 * u, cy + 1, 2 * u, fundo - 1, '#e6dcc4');
    if (fundo > 30) { R(cx - 2, cy + 10, 4, Math.min(18, fundo - 14), '#c0392b'); R(cx - 7, cy + 15, 14, 4, '#c0392b'); }
    R(cx - 1, cy - 5, 2, 5, INK);
    disc(ctx, cx + Math.round(this.inc * 4 * u), cy - 7 * u, 11 * u, 'rgba(255,209,102,0.10)');
    this.chama(R, cx, cy - 3, u, Math.round(this.inc * 13 * u), t);
    // a vela do batismo, inclinada, a entrar pelo canto
    for (let k = 0; k < 70; k++) { const qx = px + Math.round(k * 0.7), qy = py + 4 + k * 2; if (qy > Z.y + Z.h - 2 || qx + 4 * u + 1 > Z.x + Z.w) break; R(qx - 1, qy, 4 * u + 2, 2, INK); R(qx, qy, 4 * u, 2, PAPER); R(qx, qy, u, 2, '#ffffff'); }
    R(px + 2 * u - 1, py - 2, 2, 6, this.n > 0 ? '#e0572f' : INK);
    const perto = this.inc > PEGA && !this.over;
    if (acesa) { disc(ctx, px + 3, py - 12, 14, 'rgba(255,209,102,0.14)'); this.chama(R, px + 3, py - 1, u, Math.round(Math.sin(t * 3) * 2), t, 9); }
    else {
      if (this.n === 2 && Math.floor(t * 10) % 2) { R(px + 1, py - 5, 2, 2, GOLD); R(px + 5, py - 3, 1, 1, '#ff8a2b'); }
      if (perto) { R(px - 3, py - 8, 3, 1, GOLD); R(px + 6, py - 8, 3, 1, GOLD); R(px + 2, py - 12, 2, 3, GOLD); }
      if (this.fumo > 0) for (let k = 0; k < 3; k++) R(px + 2 + Math.round(Math.sin(t * 6 + k) * 2), py - 6 - k * 4 - Math.round((0.6 - this.fumo) * 14), 2, 2, 'rgba(220,220,230,0.6)');
    }
    // as três «pegas» da chama
    for (let k = 0; k < 3; k++) { R(Z.x + 5 + k * 9, Z.y + 5, 7, 7, INK); R(Z.x + 6 + k * 9, Z.y + 6, 5, 5, k < this.n ? '#ff8a2b' : '#4a3f5a'); }
    if (this.flash > 0) R(0, 0, v.w, v.h, `rgba(255,255,255,${clamp(this.flash / 0.2, 0, 1).toFixed(2)})`);
  }

  bot(I) {
    if (!this.over && this.lock <= 0 && this.inc > 0.8) I.actionPressed = true;
  }
}

// Nível 21 «Madrinha do Micas», ato 1: na pia batismal, com o Micas ao colo. Cada toque é um
// embalo: o marcador (a carinha do Micas) sobe e depois vai descendo sozinho. Com toques
// suaves e a compasso fica na zona calma (verde) e a barra do batismo vai enchendo, em cinco
// partes; cada parte sem choro vale um coração. Se o marcador sair por cima (embalo a mais)
// ou por baixo (embalo a menos), o Micas chora, a igreja faz «ohhh» e recomeça-se a embalar.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, clamp, person, text, shadow } from '../draw.js';
import { igreja, altar, pia, bebe } from './madrinha-comum.js';

const PARTES = 5, T_PARTE = 3.4;        // partes do batismo e segundos de calma que cada uma pede
const LO = 0.27, HI = 0.73;             // zona calma
const G = 1.15, IMPULSO = 0.52;         // o marcador cai (por s²) e cada toque dá-lhe este impulso
const FALAS = [
  'Padre: «Miguel Francisco, eu te batizo em nome do Pai...»',
  'Padre: «... e do Filho...»',
  'Padre: «... e do Espírito Santo.»',
  'Mi: «Tão sossegadinho ao colo da madrinha!»',
];
const DICA = 'Toca a um ritmo calmo para embalar o Micas e mantê-lo na zona verde!';

export class Embalar extends Act {
  get max() { return this.cfg.hearts || PARTES; }

  start() {
    this.y = 0.5; this.vy = 0.25;
    this.parte = 0; this.calma = 0; this.limpa = true;
    this.choro = 0; this.choros = 0;
    this.agua = 0; this.embalo = 0;
    this.T = 0; this.over = 0;
    this.ines = getCharacter('ines', 'festa');
    this.padre = getCharacter('padre');
    this.mi = getCharacter('mi', 'festa');
    this.leal = getCharacter('leal', 'festa');
    this.hint(DICA);
  }

  lay(v) {
    const P = v.portrait, top = this.top(v), w = v.w;
    const gy = Math.round(v.h * (P ? 0.72 : 0.86));
    const fx = P ? [0.14, 0.33, 0.52, 0.7, 0.86] : [0.24, 0.36, 0.48, 0.62, 0.73];
    const bh = P ? 150 : gy - top - 14;
    return { top, gy, xp: w * fx[0], xpia: w * fx[1], xi: w * fx[2], xm: w * fx[3], xl: w * fx[4], bx: w - 34, by: top + (P ? 22 : 8), bh };
  }

  fechaParte(v) {
    const L = this.lay(v);
    if (this.limpa) this.heart(1, L.xi - 14, L.gy - 40); else this.sfx('check');
    if (this.parte < 3) { this.agua = 1.2; this.vy = Math.min(this.vy, 0) - 0.22; this.sfx('slurp'); }   // a água está fria!
    this.hint(FALAS[Math.min(this.parte, FALAS.length - 1)]);
    this.parte++; this.calma = 0; this.limpa = true;
    if (this.parte >= PARTES) { this.over = 0.01; this.sfx('win'); this.hint('Padre: «Bem-vindo, Micas!»'); }
  }

  update(dt, I, v) {
    if (this.over) { this.over += dt; if (this.over > 2.4) this.done(); return; }
    this.T += dt;
    this.agua = Math.max(0, this.agua - dt);
    this.embalo = Math.max(0, this.embalo - dt);
    if (this.choro > 0) {
      // a chorar: a igreja faz «ohhh» e daqui a nada recomeça-se
      this.choro -= dt;
      if (this.choro <= 0) { this.y = 0.5; this.vy = 0.3; this.hint(DICA); }
      return;
    }
    const ajuda = this.choros >= 3 ? 0.7 : 1;
    // cada toque é um embalo (mais suave se o Micas já vai alto, para não ser fácil exagerar)
    if (I.actionPressed) { this.vy = IMPULSO * (this.y > 0.56 ? 0.6 : 1) * (ajuda < 1 ? 0.9 : 1); this.embalo = 0.3; this.sfx('click'); }
    this.vy -= G * ajuda * dt;
    this.y += this.vy * dt;
    if (this.y <= 0 || this.y >= 1) {
      this.choros++; this.limpa = false; this.choro = 1.8;
      this.sfx('hurt');
      this.hint(this.y >= 1 ? 'Ohhh... Embalo a mais! Devagarinho, madrinha...' : 'Ohhh... O Micas quer colo! Embala-o com toques suaves.');
      this.y = clamp(this.y, 0, 1);
      return;
    }
    const lo = this.choros >= 3 ? LO - 0.07 : LO, hi = this.choros >= 3 ? HI + 0.07 : HI;
    if (this.y > lo && this.y < hi) {
      this.calma += dt;
      if (this.calma >= T_PARTE) this.fechaParte(v);
    }
    if (this.T > 60 && !this.over) { this.limpa = false; this.fechaParte(v); }   // nunca se fica preso
  }

  cara() {
    if (this.over) return 'riso';
    if (this.choro > 0) return 'choro';
    return this.y > LO && this.y < HI ? 'calmo' : 'agitado';
  }

  draw(ctx, v, R) {
    const L = this.lay(v), gy = L.gy, t = this.t, w = v.w;
    igreja(ctx, v, R, gy, L.top, t);
    if (!v.portrait) altar(R, w * 0.1, gy);
    // o grupo junto à pia
    shadow(ctx, L.xp, gy, 14); person(ctx, this.padre, L.xp, gy, { scale: 2, face: 1 });
    pia(R, L.xpia, gy);
    shadow(ctx, L.xm, gy, 14); person(ctx, this.mi, L.xm, gy, { scale: 2, face: -1, hop: this.over ? Math.round(Math.abs(Math.sin(t * 7)) * 2) : 0 });
    shadow(ctx, L.xl, gy, 14); person(ctx, this.leal, L.xl, gy, { scale: 2, face: -1, hop: this.over ? Math.round(Math.abs(Math.sin(t * 7 + 1)) * 2) : 0 });
    // a Inês embala: balança um pouco a cada toque
    const sw = this.embalo > 0 ? Math.round(Math.sin((this.embalo / 0.3) * Math.PI) * 2) : 0;
    shadow(ctx, L.xi, gy, 14); person(ctx, this.ines, L.xi + sw, gy, { scale: 2, face: -1 });
    const bx = L.xi - 10 + sw, by = gy - 19 - (this.embalo > 0 ? 1 : 0);
    bebe(R, bx, by, 1, this.cara(), 1, t);
    // a concha do padre e a água
    const cx = Math.round(L.xp + 14), cy = gy - 34;
    R(cx - 1, cy - 1, 9, 5, INK); R(cx, cy, 7, 3, '#f2e6d0'); R(cx + 1, cy, 5, 1, '#8fd0f5');
    if (this.agua > 0) {
      const p = 1 - this.agua / 1.2;
      for (let k = 0; k < 5; k++) { const q = (p * 2 + k / 5) % 1; R(Math.round(cx + 6 + (bx - 8 - cx - 6) * q), Math.round(cy + 2 + (by - 6 - cy) * q * q), 2, 3, '#6fc8ff'); }
      for (let k = 0; k < 3; k++) R(bx - 12 + k * 4, by - 8 + ((Math.floor(t * 10) + k) % 3), 1, 2, '#bfeaf8');
    }
    if (this.choro > 0) {
      // «ohhh» da igreja toda
      const oy = Math.min(v.h - 14, gy + 8);
      text(ctx, 'OHHH...', w / 2, oy, PAPER, { align: 'center', scale: 2, shadow: INK });
    }

    // a barra do embalo, com a carinha do Micas
    const B = { x: L.bx, y: L.by, h: L.bh }, lo = this.choros >= 3 ? LO - 0.07 : LO, hi = this.choros >= 3 ? HI + 0.07 : HI;
    R(B.x - 2, B.y - 2, 16, B.h + 4, INK); R(B.x, B.y, 12, B.h, '#3a2f4f');
    R(B.x, B.y, 12, Math.round(B.h * (1 - hi)), '#b8485a'); R(B.x, B.y + Math.round(B.h * (1 - lo)), 12, B.h - Math.round(B.h * (1 - lo)), '#5a6aa8');
    R(B.x, B.y + Math.round(B.h * (1 - hi)), 12, Math.round(B.h * (hi - lo)), '#5cf08a');
    const my = Math.round(B.y + B.h * (1 - clamp(this.y, 0, 1)));
    R(B.x - 9, my - 8, 30, 16, INK); R(B.x - 8, my - 7, 28, 14, GOLD);
    bebe(R, B.x + 6, my, 1, this.cara(), 1, t);
    // as cinco partes do batismo
    const pw = 14;
    const gx = v.portrait ? Math.round(w / 2 - (PARTES * (pw + 3)) / 2) : Math.round(L.xpia - (PARTES * (pw + 3)) / 2), gyy = v.portrait ? L.top + 6 : L.top + 4;
    for (let k = 0; k < PARTES; k++) {
      const x = gx + k * (pw + 3), f = k < this.parte ? 1 : k === this.parte ? this.calma / T_PARTE : 0;
      R(x - 1, gyy - 1, pw + 2, 9, INK); R(x, gyy, pw, 7, '#3a2f4f'); R(x, gyy, Math.round(pw * f), 7, k < this.parte ? GOLD : '#8fd0f5');
    }
  }

  bot(I) {
    if (this.over || this.choro > 0) return;
    if (this.y < 0.46 && this.vy <= 0) I.actionPressed = true;
  }
}

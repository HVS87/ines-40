// Ilha do Farol, ato 3: o jantar de enlatados à volta da fogueira. Mantém-se o dedo no ecrã (ou
// o Espaço) para soprar a fogueira: com a chama na zona verde, a lata aquece. Quatro latas
// depois, dormem todas ao relento, debaixo das estrelas.
import { Act } from './base.js';
import { INK, GOLD, PAPER, clamp, disc, hills, sign, stars } from '../draw.js';
import { praia, farol, casinha, trolley, tenda, fogueira, lata, sentada, dorminhoca, raparigas, NOITE, CORES } from './farol-comum.js';

const Z0 = 0.4, Z1 = 0.72;        // zona verde da chama
const LIMITE = 10;                // segundos por lata (depois vai morna, sem coração)
const LATAS = [
  { cor: '#3f7fd0', fala: 'Atum de lata, no ponto! Esta é para a Maria.' },
  { cor: '#d8433c', fala: 'Salsichas de lata, a especialidade da casa! Sai uma para a Ana.' },
  { cor: '#d8902e', fala: 'Feijão de lata, bem quentinho!' },
  { cor: '#f0c040', fala: 'E para sobremesa... pêssego em calda!' },
];
const DICA = 'Mantém o dedo no ecrã (ou o Espaço) para soprar: com a chama no verde, a lata aquece!';
// lugares à volta da fogueira: lado (-1 esquerda, 1 direita) e distância (1 = mais perto)
// ordem: Inês, Isabel, e as outras sete
const LUGAR = [[-1, 1], [1, 4], [-1, 2], [-1, 3], [-1, 4], [-1, 5], [1, 1], [1, 2], [1, 3]];
const COMEM = [6, 2, 7, 3];       // quem recebe cada lata (a Maria e a Ana são nomeadas nas falas)

export class FarolFogueira extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.g = raparigas();
    this.fase = 'aquecer';
    this.n = 0; this.f = 0.15; this.prog = 0; this.tc = 0; this.ts = 0; this.sl = 0;
    this.queima = 0; this.sopro = false; this.quente = [];
    this.hint(DICA);
  }

  lay(v) {
    const P = v.portrait, cx = Math.round(v.w / 2), fy = Math.round(v.h * (P ? 0.66 : 0.8));
    const step = Math.min(21, (cx - 30) / 5.3);
    const lugar = (k) => {
      const [lado, d] = LUGAR[k];
      return { x: Math.round(cx + lado * (16 + d * step)), y: fy + (d % 2 ? 4 : -8), face: -lado, tras: d % 2 === 0 };
    };
    return { P, cx, fy, lugar, sy: fy - (P ? 60 : 44), hy: fy - (P ? 110 : 70) };
  }

  update(dt, I, v) {
    const L = this.lay(v);
    if (this.queima > 0) this.queima -= dt;
    if (this.fase === 'aquecer') {
      this.tc += dt;
      this.sopro = !!I.action;
      this.f = clamp(this.f + (this.sopro ? 0.62 : -(0.36 + 0.12 * Math.sin(this.t * 1.7))) * dt, 0, 1);
      if (this.f >= Z0 && this.f <= Z1) this.prog += dt / 2.4;
      if (this.f >= 0.985 && this.queima <= 0) {
        // chama a mais: a lata chamusca-se e atrasa
        this.queima = 0.8; this.prog = Math.max(0, this.prog - 0.3); this.f = 0.8;
        this.sfx('buzz');
        this.fx.burst(L.cx, L.fy - 30, 10, ['#ffe066', '#ff9a2e', '#e8452a'], 70);
      }
      if (this.prog >= 1 || this.tc > LIMITE) {
        const ok = this.prog >= 1;
        this.quente[this.n] = ok;
        if (ok) { this.heart(1, L.cx, L.fy - 40); this.sfx('check'); } else this.sfx('toc');
        this.hint(ok ? LATAS[this.n].fala : 'Esta ficou morna... mas com fome, marcha tudo!');
        this.fase = 'servir'; this.ts = 0; this.sopro = false;
      }
    } else if (this.fase === 'servir') {
      this.ts += dt;
      this.f = Math.max(0.3, this.f - dt * 0.3);
      if (this.ts > 0.7 && this.ts - dt <= 0.7) this.sfx('slurp');
      if (this.ts > 2.4 || (this.ts > 0.9 && I.actionPressed)) {
        this.n++;
        if (this.n >= LATAS.length) {
          this.fase = 'dormir'; this.sl = 0;
          this.hint('Na tenda não cabiam: dormiram todas ao relento, a contar as estrelas.');
        } else { this.fase = 'aquecer'; this.prog = 0; this.tc = 0; this.hint(DICA); }
      }
    } else if (this.fase === 'dormir') {
      this.sl += dt;
      if (this.sl > 7.5 || (this.sl > 3 && I.actionPressed)) { this.fase = 'fim'; this.done(); }
    }
  }

  fundo(ctx, v, R, L, n = 50) {
    const t = this.t, top = this.top(v);
    praia(ctx, v, R, t, {
      ...NOITE, sy: L.sy, hy: L.hy,
      ceuExtra: (B) => {
        stars(ctx, v.w, B.hy - 2, t, 5, n);
        disc(ctx, v.w * 0.18, Math.max(top + 10, B.hy - (L.P ? 60 : 14)), L.P ? 9 : 6, '#fff3c4');
        disc(ctx, v.w * 0.18 + 3, Math.max(top + 10, B.hy - (L.P ? 60 : 14)) - 2, L.P ? 8 : 5, '#0f1236');
      },
      fundo: (B) => {
        hills(ctx, v.w, B.sy, B.sy, 0, 0.3, 6, 3, '#3e3654', 3);
        casinha(R, v.w * 0.58, B.sy - 5, 12, true); casinha(R, v.w * 0.68, B.sy - 6, 14, true);
        farol(ctx, R, v.w * 0.84, B.sy - 4, Math.min(L.P ? 170 : 84, B.sy - top + 8), { noite: true, luz: true, t, feixe: v.w * 0.7 });
      },
    });
  }

  draw(ctx, v, R) {
    const L = this.lay(v), { P, cx, fy } = L, top = this.top(v);
    if (this.fase === 'dormir' || this.fase === 'fim') {
      if (this.sl < 0.5) this.jantar(ctx, v, R, L); else this.sono(ctx, v, R, L);
      const a = clamp(1 - Math.abs(this.sl - 0.5) * 2, 0, 1);
      if (a > 0) R(0, 0, v.w, v.h, `rgba(8,6,24,${a.toFixed(2)})`);
      return;
    }
    this.jantar(ctx, v, R, L);
    // --- a barra da chama ---
    const bw = Math.min(170, v.w - 40), bx = Math.round((v.w - bw) / 2), by = top + 6;
    R(bx - 2, by - 2, bw + 4, 12, INK);
    R(bx, by, bw, 8, '#3a4a8a');
    R(bx + bw * Z1, by, bw * (1 - Z1), 8, '#c0392b');
    R(bx + bw * Z0, by, bw * (Z1 - Z0), 8, '#5cf08a');
    const mx = Math.round(bx + this.f * bw);
    R(mx - 3, by - 5, 7, 17, INK); R(mx - 2, by - 1, 5, 12, '#ff9a2e'); R(mx - 1, by - 4, 3, 6, '#ff9a2e'); R(mx - 1, by + 3, 3, 6, '#ffe066');
    // quanto falta para a lata ficar quente
    R(bx - 2, by + 13, bw + 4, 6, INK); R(bx, by + 15, bw, 2, '#3a2f4f'); R(bx, by + 15, bw * clamp(this.prog, 0, 1), 2, GOLD);
    // as quatro latas
    for (let k = 0; k < LATAS.length; k++) {
      const x = bx + bw + 8 + (P ? 0 : k * 9), y = by + 6 + (P ? k * 10 - 12 : 0);
      if (k < this.n || (k === this.n && this.fase === 'servir')) lata(R, x, y, 1, this.quente[k] ? LATAS[k].cor : '#8a8794');
      else { R(x - 4, y - 8, 8, 9, INK); R(x - 3, y - 7, 6, 7, k === this.n ? PAPER : '#5a4f6a'); }
    }
    if (this.queima > 0) sign(ctx, 'CHAMA A MAIS!', cx, fy - 66, { color: '#ffe066' });
  }

  // o jantar: as nove sentadas à volta da fogueira, a lata ao lume
  jantar(ctx, v, R, L) {
    const { cx, fy } = L, t = this.t;
    this.fundo(ctx, v, R, L);
    const flame = this.fase === 'dormir' ? 0.25 : this.f;
    // clarão da fogueira na areia
    ctx.globalAlpha = 0.14;
    disc(ctx, cx, fy - 4, Math.round(46 + flame * 26 + Math.sin(t * 9) * 2), '#ff9a2e');
    disc(ctx, cx, fy - 4, Math.round(26 + flame * 16), '#ffe066');
    ctx.globalAlpha = 1;
    const comeu = (k) => COMEM.indexOf(k) >= 0 && (COMEM.indexOf(k) < this.n || (COMEM.indexOf(k) === this.n && this.fase === 'servir' && this.ts > 0.7));
    const senta = (k) => {
      const p = L.lugar(k);
      const hop = comeu(k) && COMEM[this.n] === k ? Math.round(Math.abs(Math.sin(t * 8)) * 2) : 0;
      sentada(ctx, R, this.g[k], p.x, p.y - hop, p.face);
      if (k === 1) trolley(R, p.x + 24, p.y, 2, -1, { lean: 0.25 });
      if (comeu(k)) lata(R, p.x + p.face * 12, p.y - 12 - hop, 1, LATAS[COMEM.indexOf(k)].cor);
    };
    for (let k = 0; k < 9; k++) if (L.lugar(k).tras) senta(k);
    // a lata ao lume, pendurada numa cana
    fogueira(R, cx, fy, flame, t);
    if (this.fase === 'aquecer' || (this.fase === 'servir' && this.ts < 0.7)) {
      let lx = cx, ly = fy - 30;
      if (this.fase === 'servir') { const p = L.lugar(COMEM[this.n]), u = this.ts / 0.7; lx = cx + (p.x + p.face * 12 - cx) * u; ly = fy - 30 + (p.y - 12 - (fy - 30)) * u - Math.sin(u * Math.PI) * 18; }
      else { R(cx - 22, fy - 42, 2, 42, '#8a5a2e'); R(cx + 20, fy - 42, 2, 42, '#8a5a2e'); R(cx - 24, fy - 44, 48, 2, '#b8834a'); R(cx - 1, fy - 42, 2, 4, '#c9ccd6'); }
      lata(R, lx, ly, 2, LATAS[Math.min(this.n, LATAS.length - 1)].cor);
      if (this.fase === 'aquecer' && this.f >= Z0 && this.f <= Z1) for (let k = 0; k < 2; k++) { const p = (t * 1.2 + k * 0.5) % 1; R(lx - 3 + k * 6, ly - 18 - p * 10, 2, 2, 'rgba(255,255,255,0.6)'); }
    }
    for (let k = 0; k < 9; k++) if (!L.lugar(k).tras) senta(k);
    // o sopro da Inês
    if (this.sopro) {
      const p = L.lugar(0);
      for (let k = 0; k < 3; k++) { const u = (t * 2.5 + k / 3) % 1; R(p.x + 9 + u * (cx - p.x - 16), p.y - 21 + Math.sin(u * 9 + k) * 2, 3, 1, '#dfe8ff'); }
    }
  }

  // a noite: todas a dormir na areia, em duas filas, e a tenda vazia
  sono(ctx, v, R, L) {
    const { P, fy } = L, t = this.t;
    this.fundo(ctx, v, R, L, 80);
    // estrela cadente
    const u = (t * 0.35) % 1;
    if (u < 0.25) for (let k = 0; k < 6; k++) R(v.w * 0.75 - u * 260 + k * 3, this.top(v) + 6 + u * 90 - k * 1, 2, 1, k < 2 ? '#ffffff' : 'rgba(255,255,255,0.5)');
    tenda(R, v.w * 0.14, L.sy + 24, {});
    fogueira(R, v.w * 0.86, L.sy + 22, 0, t);
    for (let k = 0; k < 2; k++) { const p = (t * 0.4 + k * 0.5) % 1; R(v.w * 0.86 - 1 + Math.sin(p * 6 + k) * 3, L.sy + 12 - p * 22, 2, 2, 'rgba(200,200,220,0.5)'); }
    const x0 = Math.round((v.w - 230) / 2), y1 = P ? fy + 6 : fy - 6, y2 = y1 + (P ? 42 : 26);
    [2, 3, 4, 5, 6].forEach((k, j) => dorminhoca(ctx, R, this.g[k], x0 + j * 46, y1, CORES[k], t + j));
    [0, 7, 8, 1].forEach((k, j) => dorminhoca(ctx, R, this.g[k], x0 + 14 + j * 46, y2, CORES[k], t + j * 1.7));
    // a Isabel dorme agarrada ao trolley
    trolley(R, x0 + 14 + 3 * 46 + 62, y2, 2, -1, { lean: 0.2 });
  }

  bot(I) {
    if (this.fase === 'aquecer') I.action = this.f < 0.56;
    else if (this.fase === 'servir' && this.ts > 1) I.actionPressed = true;
    else if (this.fase === 'dormir' && this.sl > 4) I.actionPressed = true;
  }
}

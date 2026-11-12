// Ilha do Farol, ato 4: a manhã. A lancha da GNR aproxima-se («É proibido acampar aqui!») e é
// preciso desmontar o acampamento a correr: tocar em cada coisa para a arrumar (ou escolher com
// as setas e arrumar com o Espaço) antes de a lancha encostar. No fim, a Isabel lá vai, a puxar
// o trolley pela areia.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, PAPER, clamp, lerp, hills, person, shadow, sign } from '../draw.js';
import { praia, farol, casinha, trolley, riscos, tenda, fogueira, lata, dorminhoca, raparigas, lancha, barcoCarreira, MANHA, CORES } from './farol-comum.js';

const TEMPO = 22;                 // segundos até a lancha encostar
// coisas a arrumar: l = [x, fila] deitado; p = [x, fila] ao alto
const COISAS = [
  { tipo: 'tenda', toques: 3, l: [0.47, 0], p: [0.5, 0] },
  { tipo: 'mochilas', l: [0.26, 0], p: [0.16, 1] },
  { tipo: 'lenha', l: [0.68, 0], p: [0.85, 1] },
  { tipo: 'sono', quem: 3, l: [0.14, 1], p: [0.26, 2] },
  { tipo: 'sono', quem: 5, l: [0.5, 1], p: [0.72, 2] },
  { tipo: 'latas', l: [0.2, 2], p: [0.15, 3] },
  { tipo: 'cinzas', l: [0.4, 2], p: [0.4, 1] },
  { tipo: 'sono', quem: 7, l: [0.72, 2], p: [0.42, 3] },
];
// quem está de pé: [rapariga, deitado, ao alto]
const DE_PE = [
  [0, [0.33, 1], [0.62, 1]], [1, [0.88, 1], [0.8, 3]],
  [2, [0.05, 0], [0.08, 0]], [4, [0.13, 0], [0.2, 0]], [6, [0.86, 0], [0.8, 0]], [8, [0.95, 0], [0.92, 0]],
];
const DICA = 'A GNR vem aí! Toca em cada coisa (ou setas + Espaço) para arrumar o acampamento a tempo!';

export class FarolGNR extends Act {
  get max() { return this.cfg.hearts || 3; }

  start() {
    this.g = raparigas();
    this.gnr = getCharacter('gnr');
    this.it = COISAS.map((c) => ({ ...c, toques: c.toques || 1, feito: false, puf: 0 }));
    this.n = 0; this.b = 0; this.fase = 'jogo'; this.tf = 0; this.sel = -1; this.teclado = false;
    this.prev = {}; this.limpo = false; this.auto = 0; this.botN = 0;
    this.hint(DICA);
    this.sfx('ring');
  }

  lay(v) {
    const P = v.portrait, sy = Math.round(v.h * (P ? 0.5 : 0.6)), hy = sy - (P ? 64 : 30);
    const nr = P ? 4 : 3, y0 = sy + (P ? 18 : 14), step = Math.min(P ? 60 : 30, (v.h - 6 - y0) / (nr - 1));
    const at = (q) => ({ x: Math.round(q[0] * v.w), y: Math.round(y0 + q[1] * step) });
    return { P, sy, hy, at, pos: (c) => at(P ? c.p : c.l) };
  }

  arruma(i, L, auto) {
    const c = this.it[i], p = L.pos(c);
    if (c.feito) return;
    c.toques--; c.puf = 1;
    this.fx.burst(p.x, p.y - 10, 7, ['#fbeec8', '#dcbf80', PAPER], 50);
    if (c.toques > 0) { this.sfx('toc'); return; }
    c.feito = true; this.n++;
    this.sfx(c.tipo === 'sono' ? 'chirp' : 'pop');
    if (!auto && (this.n === 3 || this.n === 6 || this.n === this.it.length)) this.heart(1, p.x, p.y - 20);
  }

  // a coisa por arrumar mais perto de (x, y)
  perto(L, x, y, raio) {
    let best = -1, bd = 1e9;
    this.it.forEach((c, i) => {
      if (c.feito) return;
      const p = L.pos(c), dx = Math.abs(p.x - x) / (c.tipo === 'sono' || c.tipo === 'tenda' ? 1.4 : 1), dy = Math.abs(p.y - 11 - y), d = Math.hypot(dx, dy);
      if (d < bd && (!raio || (dx < raio && dy < raio))) { bd = d; best = i; }
    });
    return best;
  }

  update(dt, I, v) {
    const L = this.lay(v);
    for (const c of this.it) c.puf = Math.max(0, c.puf - dt * 3);
    this.tf += dt;
    if (this.fase === 'jogo') {
      // teclado: as setas escolhem, o Espaço arruma
      const k = { l: I.left, r: I.right, u: I.up, d: I.down };
      const falta = this.it.map((c, i) => i).filter((i) => !this.it[i].feito);
      if (falta.length) {
        const passo = ((k.r && !this.prev.r) || (k.d && !this.prev.d) ? 1 : 0) - ((k.l && !this.prev.l) || (k.u && !this.prev.u) ? 1 : 0);
        if (passo) { this.teclado = true; const j = falta.indexOf(this.sel); this.sel = falta[((j < 0 ? 0 : j + passo) + falta.length) % falta.length]; this.sfx('click'); }
        if (I.actionPressed) {
          if (I.pointerX >= 0) {
            const i = this.perto(L, I.pointerX * v.w, I.pointerY * v.h, 24);
            if (i >= 0) this.arruma(i, L);
          } else {
            this.teclado = true;
            if (this.sel < 0 || this.it[this.sel].feito) this.sel = falta[0];
            const p = L.pos(this.it[this.sel]);
            this.arruma(this.sel, L);
            if (this.it[this.sel].feito) this.sel = this.perto(L, p.x, p.y - 11);
          }
        }
      }
      this.prev = k;
      this.b += this.n >= this.it.length ? dt * 0.35 : dt / TEMPO;
      if (this.b >= 1) {
        this.b = 1; this.fase = 'chega'; this.tf = 0; this.limpo = this.n >= this.it.length;
        this.sfx('ring');
      }
    } else if (this.fase === 'chega') {
      // o que faltar arruma-se agora, à pressa
      this.auto -= dt;
      const i = this.it.findIndex((c) => !c.feito);
      if (i >= 0) { if (this.auto <= 0) { this.arruma(i, L, true); this.auto = 0.28; } this.tf = 0; } else if (this.tf > 0.5) {
        this.fase = 'guarda'; this.tf = 0;
        this.hint(this.limpo ? 'Guarda: «É proibido acampar aqui... Já está tudo arrumado? Assim até dá gosto!»' : 'Guarda: «Meninas, é proibido acampar aqui! Vá, toca a desmontar isso tudo.»');
        this.sfx('click');
      }
    } else if (this.fase === 'guarda') {
      if (this.tf > 4.2 || (this.tf > 1 && I.actionPressed)) {
        this.fase = 'isabel'; this.tf = 0;
        this.hint('Isabel: «Esperem por mim! Estas rodinhas não foram feitas para a areia...»');
        this.sfx('click');
      }
    } else if (this.fase === 'isabel') {
      if (this.tf > 5.2 || (this.tf > 2.5 && I.actionPressed)) { this.fase = 'fim'; this.done(); }
    }
  }

  coisa(ctx, R, c, p, t) {
    const { x, y } = p, j = Math.round(c.puf * 2);
    if (c.tipo === 'tenda') tenda(R, x + j, y, { h: 4 + c.toques * 2.7 });
    else if (c.tipo === 'mochilas') {
      for (const [dx, cor, cl] of [[-8, '#e0572f', '#ff9a6a'], [7, '#3f6fb5', '#7aa8e8']]) {
        R(x + dx - 7, y - 16 - j, 14, 16, INK); R(x + dx - 6, y - 15 - j, 12, 14, cor); R(x + dx - 6, y - 15 - j, 3, 14, cl);
        R(x + dx - 4, y - 8 - j, 8, 5, INK); R(x + dx - 3, y - 7 - j, 6, 3, cl); R(x + dx - 3, y - 18 - j, 6, 2, INK);
      }
    } else if (c.tipo === 'lenha') {
      for (let k = 0; k < 3; k++) { R(x - 11 + k * 2, y - 5 - k * 4 - j, 20, 5, INK); R(x - 10 + k * 2, y - 4 - k * 4 - j, 18, 3, k % 2 ? '#96602e' : '#7a4a2a'); R(x + 6 + k * 2, y - 4 - k * 4 - j, 2, 3, '#e0b070'); }
    } else if (c.tipo === 'latas') {
      lata(R, x - 8, y - j, 1.5, '#3f7fd0'); lata(R, x + 3, y - j, 1.5, '#d8433c'); lata(R, x + 13, y + 2 - j, 1.5, '#f0c040');
    } else if (c.tipo === 'cinzas') {
      R(x - 12, y - 4, 24, 5, INK); R(x - 11, y - 3, 22, 3, '#6a6474');
      fogueira(R, x, y - 2, 0, t, 1.5);
      for (let k = 0; k < 2; k++) { const u = (t * 0.5 + k * 0.5) % 1; R(x - 1 + Math.sin(u * 6 + k) * 3, y - 10 - u * 16, 2, 2, 'rgba(120,120,140,0.55)'); }
    } else if (c.tipo === 'sono') dorminhoca(ctx, R, this.g[c.quem], x - 24, y, CORES[c.quem], t + c.quem);
  }

  draw(ctx, v, R) {
    const L = this.lay(v), { P, sy, hy } = L, t = this.t, top = this.top(v);
    const fim = this.fase === 'isabel' || this.fase === 'fim', u = fim ? this.tf : 0;
    praia(ctx, v, R, t, {
      ...MANHA, sy, hy,
      fundo: (B) => {
        hills(ctx, v.w, B.hy + 5, B.hy + 5, 0, 0.3, 4, 2, '#e9d6a4', 3);
        farol(ctx, R, v.w * 0.12, B.hy + 3, Math.min(P ? 110 : 40, B.hy - top + 14));
        casinha(R, v.w * 0.24, B.hy + 3, 10);
        if (fim) barcoCarreira(ctx, R, lerp(-60, v.w * 0.2, clamp(u / 2.5, 0, 1)), B.sy - 4, P ? 1.4 : 1, t);
        const b = this.b, s = lerp(0.5, P ? 1.5 : 1.3, b);
        lancha(ctx, R, lerp(v.w * 0.93, v.w * 0.66, b), lerp(B.hy + 9, B.sy - 1, b), s, t, this.gnr);
      },
    });
    // --- coisas e pessoas, de trás para a frente ---
    const lista = [];
    this.it.forEach((c, i) => {
      const p = L.pos(c);
      if (!c.feito) lista.push({ y: p.y, f: () => this.coisa(ctx, R, c, p, t), i, p, c });
      else if (c.tipo === 'sono') {
        // acordou: de pé, de toalha ao ombro, e depois a caminho do barco
        const x = p.x - (fim ? u * (54 + i * 3) : 0);
        lista.push({ y: p.y, f: () => { shadow(ctx, x, p.y, 14); person(ctx, this.g[c.quem], x, p.y, { face: -1, scale: 2, moving: fim, dist: u * 60, hop: fim ? 0 : Math.round(Math.abs(Math.sin(t * 7 + i)) * 3) }); R(x + 5, p.y - 30, 6, 12, INK); R(x + 6, p.y - 29, 4, 10, CORES[c.quem]); } });
      }
    });
    for (const [k, l, pp] of DE_PE) {
      const p = L.at(P ? pp : l);
      if (k === 1) {
        // a Isabel e o trolley (no fim, lá vai ela a puxá-lo, a deixar dois riscos na areia)
        const x = p.x - (fim ? Math.min(u, 4.6) * 24 : 0), stuck = fim && u > 1 && Math.floor(u * 2) % 3 === 0;
        lista.push({ y: p.y, f: () => {
          if (fim) riscos(R, x + 38, p.x + 34, p.y, 0, '#cdb078');
          shadow(ctx, x, p.y, 14);
          person(ctx, this.g[1], x, p.y, { face: -1, scale: 2, moving: fim && !stuck, dist: u * 40, hop: fim ? 0 : Math.round(Math.abs(Math.sin(t * 6)) * 2) });
          trolley(R, x + 30, p.y + (stuck ? 1 : 0), 2, -1);
        } });
      } else {
        const x = p.x - (fim ? u * (60 + k * 4) : 0), agit = this.fase === 'jogo' ? Math.round(Math.abs(Math.sin(t * 6 + k * 1.3)) * 3) : 0;
        const face = fim ? -1 : this.fase === 'jogo' ? (Math.sin(t * 1.5 + k * 2) > 0 ? 1 : -1) : (v.w * 0.66 > x ? 1 : -1);
        lista.push({ y: p.y, f: () => { shadow(ctx, x, p.y, 14); person(ctx, this.g[k], x, p.y, { face, scale: 2, moving: fim, dist: u * 60 + k * 4, hop: agit }); } });
      }
    }
    lista.sort((a, b) => a.y - b.y);
    for (const e of lista) e.f();
    // cursor do teclado
    if (this.teclado && this.fase === 'jogo' && this.sel >= 0 && !this.it[this.sel].feito) {
      const c = this.it[this.sel], p = L.pos(c), hw = c.tipo === 'sono' || c.tipo === 'tenda' ? 28 : 17, hh = c.tipo === 'cinzas' || c.tipo === 'latas' ? 18 : 30;
      const o = Math.floor(t * 4) % 2;
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const x = p.x + dx * (hw + o), y = p.y + 3 - hh / 2 + dy * (hh / 2 + o);
        R(x - (dx > 0 ? 5 : 0), y - 1, 6, 3, INK); R(x - 1, y - (dy > 0 ? 5 : 0), 3, 6, INK);
        R(x - (dx > 0 ? 4 : 0), y, 4, 1, GOLD); R(x, y - (dy > 0 ? 4 : 0), 1, 4, GOLD);
      }
    }
    // --- a lancha a chegar: barra do tempo e megafone ---
    if (this.fase === 'jogo' || this.fase === 'chega') {
      const bw = Math.min(150, v.w - 60), bx = Math.round((v.w - bw) / 2), by = top + 4, b = this.b;
      R(bx - 2, by - 2, bw + 4, 9, INK); R(bx, by, bw, 5, '#3a2f4f');
      R(bx, by, bw * (1 - b), 5, b > 0.75 ? '#e0572f' : b > 0.5 ? GOLD : '#5cf08a');
      const mx = bx + bw * (1 - b);
      R(mx - 5, by - 3, 10, 5, INK); R(mx - 4, by - 2, 8, 3, '#eef1f4'); R(mx + 1, by - 5, 3, 3, '#2f7a4a');
      if (Math.floor(t * 2) % 4 !== 3) sign(ctx, 'É PROIBIDO ACAMPAR AQUI!', v.w / 2, by + 11, { bg: '#fff6e6', color: '#a3242c' });
    }
  }

  bot(I, v) {
    if (this.fase === 'jogo') {
      this.botN++;
      if (this.botN % 26) return;
      const i = this.it.findIndex((c) => !c.feito);
      if (i < 0) return;
      const p = this.lay(v).pos(this.it[i]);
      I.pointerX = p.x / v.w; I.pointerY = (p.y - 11) / v.h; I.actionPressed = true;
    } else if (this.tf > 1.2 && this.fase === 'guarda') I.actionPressed = true;
    else if (this.tf > 3 && this.fase === 'isabel') I.actionPressed = true;
  }
}

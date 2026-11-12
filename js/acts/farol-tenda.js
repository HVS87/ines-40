// Ilha do Farol, ato 2: montar o acampamento com quase nada. Primeiro pregam-se as estacas da
// tenda (tocar quando o marcador passa no verde); depois as nove tentam caber na tenda
// individual (não cabem...) e os pescadores aparecem para ajudar.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, PAPER, SKIN, clamp, lerp, hills, mark, person, shadow, sign } from '../draw.js';
import { chao, praia, farol, casinha, tufo, trolley, tenda, raparigas, TARDE } from './farol-comum.js';

// onde está cada uma (x em fração do ecrã; fila: 0 = à frente, 1 = a meio, 2 = atrás)
// ordem: Inês, Isabel, e as outras sete
const CASA = [
  { x: 0.36, r: 0 }, { x: 0.8, r: 0, face: -1 }, { x: 0.08, r: 2 }, { x: 0.17, r: 1 }, { x: 0.28, r: 2 },
  { x: 0.68, r: 2, face: -1 }, { x: 0.9, r: 2, face: -1 }, { x: 0.63, r: 1, face: -1 }, { x: 0.1, r: 0 },
];
const ENTRAM = [0, 8, 3, 7];     // quem tenta entrar na tenda, por ordem
const GRITOS = ['CABE MAIS UMA!', 'CHEGA PARA LÁ!', 'AI, O MEU PÉ!', 'SÓ MAIS UMA...'];
const FALAS = [
  'Pescador: «Então, meninas? Nove raparigas... e uma tenda de brincar?»',
  'Pescador: «Tomem lá lenha para a fogueira. E um abre-latas, que faz sempre falta!»',
  'Inês: «Muito obrigada! Salvaram-nos o jantar.»',
];

export class FarolTenda extends Act {
  get max() { return this.cfg.hearts || 3; }

  start() {
    this.g = raparigas();
    this.pesc = getCharacter('pescador');
    this.fase = 'estacas';
    this.n = 0; this.pos = 0.05; this.dir = 1; this.wait = 0.8; this.res = [];
    this.bate = 0; this.dentro = 0; this.mov = null; this.tf = 0; this.salta = 0; this.grito = 0;
    this.linha = 0; this.px = 0; this.espera = 0;
    this.hint('Toca quando o marcador passar no verde para pregar as estacas da tenda!');
  }

  zona() { return 0.27 - this.n * 0.025; }

  lay(v) {
    const P = v.portrait, gy = chao(v), cx = Math.round(v.w / 2), D = P ? 18 : 10;
    const casa = (k) => ({ x: k === 0 ? cx - 37 : Math.round(CASA[k].x * v.w), y: gy - CASA[k].r * (D / 2), face: CASA[k].face || 1 });
    return { P, gy, cx, casa, estaca: [cx - 27, cx + 27, cx - 33] };
  }

  update(dt, I, v) {
    const L = this.lay(v);
    this.tf += dt;
    this.bate = Math.max(0, this.bate - dt * 4);
    this.grito = Math.max(0, this.grito - dt);
    if (this.fase === 'estacas') {
      if (this.wait > 0) { this.wait -= dt; return; }
      this.pos += this.dir * dt * (0.8 + this.n * 0.15);
      if (this.pos > 1 || this.pos < 0) { this.dir *= -1; this.pos = clamp(this.pos, 0, 1); }
      this.espera += dt;
      // sem toques durante muito tempo, a estaca prega-se sozinha (torta)
      if (I.actionPressed || this.espera > 9) {
        const ok = I.actionPressed && Math.abs(this.pos - 0.5) < this.zona() / 2;
        this.espera = 0;
        this.res.push(ok);
        this.bate = 1;
        if (ok) { this.sfx('toc'); this.heart(1, L.estaca[this.n], L.gy - 14); } else this.sfx('stomp');
        this.n++; this.wait = 0.8; this.pos = 0.05; this.dir = 1;
        if (this.n >= 3) {
          this.fase = 'caber'; this.tf = 0;
          this.hint('Uma tenda individual... para nove! Toca para irem entrando, uma a uma.');
        }
      }
    } else if (this.fase === 'caber') {
      if (this.mov) {
        this.mov.t += dt / 0.55;
        if (this.mov.t >= 1) { this.mov = null; this.dentro++; this.grito = 1.3; this.sfx('pop'); this.tf = 0; }
        return;
      }
      if ((I.actionPressed && this.tf > 0.25) || this.tf > 2.6) {
        if (this.dentro < ENTRAM.length) { this.mov = { k: ENTRAM[this.dentro], t: 0 }; this.sfx('click'); } else {
          // a tenda não aguenta: saem todas disparadas
          this.fase = 'rebenta'; this.tf = 0; this.salta = 0.01;
          this.sfx('boom');
          this.fx.burst(L.cx, L.gy - 14, 16, ['#2fa8a0', '#7fe0d4', '#fff6e6', GOLD], 80);
          this.hint('Inês: «Nove numa tenda individual... não cabemos! Dorme-se cá fora.»');
        }
      }
    } else if (this.fase === 'rebenta') {
      this.salta = Math.min(1, this.salta + dt / 0.8);
      if (this.tf > 3.4 || (this.tf > 1.2 && I.actionPressed)) {
        this.fase = 'pescadores'; this.tf = 0; this.linha = 0; this.dentro = 0;
        this.hint(FALAS[0]); this.sfx('click');
      }
    } else if (this.fase === 'pescadores') {
      this.px = Math.min(1, this.px + dt / 1.6);
      if (this.px < 1) { this.tf = 0; return; }
      if ((this.tf > 0.5 && I.actionPressed) || this.tf > 3 + FALAS[this.linha].length * 0.06) {
        this.linha++; this.tf = 0;
        if (this.linha >= FALAS.length) { this.fase = 'fim'; this.done(); return; }
        this.hint(FALAS[this.linha]); this.sfx(this.linha === 2 ? 'check' : 'click');
      }
    }
  }

  draw(ctx, v, R) {
    const L = this.lay(v), { P, gy, cx } = L, t = this.t, top = this.top(v);
    praia(ctx, v, R, t, {
      ...TARDE, gy, sy: gy - (P ? 50 : 22), hy: gy - (P ? 96 : 42),
      fundo: (B) => {
        hills(ctx, v.w, B.sy, B.sy, 0, 0.3, 8, 3, '#e8cb92', 3);
        casinha(R, v.w * 0.62, B.sy - 6, 14); casinha(R, v.w * 0.74, B.sy - 7, 12); casinha(R, v.w * 0.04, B.sy - 6, 12);
        tufo(R, v.w * 0.5, B.sy - 6, '#7a9a4a'); tufo(R, v.w * 0.9, B.sy - 5, '#7a9a4a'); tufo(R, v.w * 0.2, B.sy - 5, '#7a9a4a');
        farol(ctx, R, v.w * 0.3, B.sy - 4, Math.min(P ? 150 : 120, B.sy - top - 22));
      },
    });
    // --- a tenda (cresce com as estacas; engorda com as raparigas lá dentro) ---
    const feitas = this.fase === 'estacas' ? this.n : 3;
    const wob = this.fase === 'caber' && this.dentro ? Math.round(Math.sin(t * 14) * Math.min(2, this.dentro * 0.6)) : 0;
    const gordo = this.fase === 'caber' ? this.dentro * 0.28 + (this.mov ? this.mov.t * 0.2 : 0) : 0;
    const drawTent = () => {
      tenda(R, cx + wob, gy, { h: 4 + feitas * 2.7, gordo });
      // estacas pregadas (tortas, se a pancada falhou)
      for (let k = 0; k < feitas; k++) {
        const ex = L.estaca[k];
        if (this.res[k] === false) { R(ex - 1, gy - 4, 3, 1, INK); R(ex, gy - 3, 1, 3, '#8a8794'); } else { R(ex - 1, gy - 3, 3, 1, '#c9ccd6'); R(ex, gy - 2, 1, 2, '#8a8794'); }
      }
      // pés de fora
      if (this.fase === 'caber' && this.dentro >= 2) { R(cx - 30 + wob, gy - 3, 7, 3, INK); R(cx - 29 + wob, gy - 2, 5, 1, SKIN); }
      if (this.fase === 'caber' && this.dentro >= 3) { R(cx + 23 + wob, gy - 3, 7, 3, INK); R(cx + 24 + wob, gy - 2, 5, 1, SKIN); }
    };
    // --- as raparigas, de trás para a frente ---
    const escondida = (k) => this.fase === 'caber' && ENTRAM.indexOf(k) >= 0 && ENTRAM.indexOf(k) < this.dentro;
    const ordem = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort((a, b) => CASA[b].r - CASA[a].r);
    let tentDone = false;
    for (const k of ordem) {
      if (!tentDone && CASA[k].r === 0) { drawTent(); tentDone = true; }
      if (escondida(k)) continue;
      const c = L.casa(k);
      let x = c.x, y = c.y, hop = 0, face = c.face, moving = false;
      if (k === 0 && this.fase === 'estacas' && this.n < 3) {
        // a Inês vai de estaca em estaca, com uma pedra na mão
        const ex = L.estaca[this.n];
        x = ex + (ex < cx ? -11 : 11); face = ex < cx ? 1 : -1;
      }
      if (this.mov && this.mov.k === k) { x = lerp(c.x, cx, this.mov.t); y = lerp(c.y, gy, this.mov.t); face = cx > c.x ? 1 : -1; moving = true; hop = Math.round(Math.sin(this.mov.t * Math.PI) * 5); }
      if (this.fase === 'rebenta' && ENTRAM.indexOf(k) >= 0) {
        const u = this.salta;
        x = lerp(cx, c.x, u); y = lerp(gy, c.y, u); hop = Math.round(Math.sin(u * Math.PI) * 26);
      } else if (this.fase === 'caber' || this.fase === 'rebenta') hop = Math.round(Math.abs(Math.sin(t * 5 + k)) * 1.5);
      shadow(ctx, x, y, 14);
      person(ctx, this.g[k], x, y, { face, scale: 2, hop, moving, dist: t * 60 });
      if (k === 1) trolley(R, x + 30, y, 2, -1);
      if (k === 0 && this.fase === 'estacas' && this.n < 3) {
        // a pedra que serve de martelo
        const hx = x + face * 11, hy = y - 22 + Math.round(this.bate * 12);
        R(hx - 3, hy - 2, 7, 5, INK); R(hx - 2, hy - 1, 5, 3, '#9a97a8');
        const ex = L.estaca[this.n];
        R(ex, gy - 7, 1, 7, '#8a8794'); R(ex - 1, gy - 8, 3, 1, '#c9ccd6');
      }
    }
    if (!tentDone) drawTent();
    // gritos de dentro da tenda
    if (this.grito > 0 && this.fase === 'caber' && this.dentro > 0) {
      const s = GRITOS[(this.dentro - 1) % GRITOS.length];
      sign(ctx, s, cx, gy - 50 - Math.round((1.3 - this.grito) * 6), { bg: PAPER, color: INK });
    }
    // --- os pescadores ---
    if (this.fase === 'pescadores' || this.fase === 'fim') {
      const x1 = lerp(-20, cx - 64, this.px), x2 = x1 - 26, walking = this.px < 1;
      const talk = this.linha < 2 && !walking ? Math.round(Math.abs(Math.sin(t * 7)) * 2) : 0;
      shadow(ctx, x2, gy + 3, 14); person(ctx, this.pesc, x2, gy + 3, { face: 1, scale: 2, moving: walking, dist: this.px * 120 });
      shadow(ctx, x1, gy + 3, 14); person(ctx, this.pesc, x1, gy + 3, { face: 1, scale: 2, moving: walking, dist: this.px * 120 + 9, hop: talk });
      // a lenha (ao colo do primeiro; depois, ao pé da tenda) e o abre-latas
      const dada = this.linha >= 2;
      const lx = dada ? cx + 40 : x1 + 9, ly = dada ? gy + 4 : gy - 14;
      for (let k = 0; k < 3; k++) { R(lx - 8 + k, ly - 3 - k * 3, 16, 4, INK); R(lx - 7 + k, ly - 2 - k * 3, 14, 2, k % 2 ? '#96602e' : '#7a4a2a'); R(lx + 6 + k, ly - 2 - k * 3, 1, 2, '#e0b070'); }
      if (this.linha >= 1) {
        const ax = dada ? L.casa(0).x : x2 + 4, ay = dada ? gy - 52 : gy - 54;
        mark(ctx, ax, ay, ' ');
        R(ax - 2, ay - 7, 5, 2, '#8a8794'); R(ax - 2, ay - 5, 2, 3, '#e0572f'); R(ax + 1, ay - 5, 2, 3, '#e0572f'); R(ax, ay - 4, 1, 1, INK);
      }
    }
    // --- a barra do martelo ---
    if (this.fase === 'estacas') {
      const bw = Math.min(170, v.w - 36), bx = Math.round((v.w - bw) / 2), by = top + 6, z = this.zona();
      R(bx - 2, by - 2, bw + 4, 12, INK); R(bx, by, bw, 8, '#3a2f4f');
      R(bx + bw * (0.5 - z / 2), by, bw * z, 8, '#5cf08a');
      R(bx + bw * 0.5 - 1, by, 2, 8, '#d8ffe4');
      R(bx + this.pos * bw - 2, by - 4, 5, 16, INK); R(bx + this.pos * bw - 1, by - 3, 3, 14, GOLD);
      for (let k = 0; k < 3; k++) { R(bx + bw + 6, by - 2 + k * 5, 4, 4, INK); R(bx + bw + 7, by - 1 + k * 5, 2, 2, k < this.n ? (this.res[k] ? '#5cf08a' : '#e0572f') : PAPER); }
    }
  }

  bot(I) {
    if (this.fase === 'estacas') { if (this.wait <= 0 && Math.abs(this.pos - 0.5) < 0.05) I.actionPressed = true; } else if (this.tf > 0.6 && Math.floor(this.tf * 60) % 20 === 0) I.actionPressed = true;
  }
}

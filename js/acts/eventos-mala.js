// Nível 19, ato 1: fazer a mala antes de o táxi chegar. Em cima da cama há oito coisas: tocar
// nas quatro da lista (crachá, portátil, sapatos de gala, carregador) para as pôr na mala. As
// outras (a boia, os chinelos, a Bimby, o comando) fazem perder tempo. Com o teclado, as setas
// movem o cursor e o Espaço escolhe. No fim, o aeroporto: «PARTIDAS».
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, SKIN, clamp, lerp, person, shadow, text, sign, disc } from '../draw.js';
import { box, VERDE, INOX, INOX_D } from './bimby-comum.js';

const COISAS = [
  { k: 'cracha', nome: 'CRACHÁ', ok: true },
  { k: 'portatil', nome: 'PORTÁTIL', ok: true },
  { k: 'sapatos', nome: 'SAPATOS', ok: true },
  { k: 'carregador', nome: 'CARREGADOR', ok: true },
  { k: 'boia', nome: 'BOIA', fala: 'A boia?! É um evento de trabalho, não é uma semana na praia!' },
  { k: 'chinelos', nome: 'CHINELOS', fala: 'Chinelos numa gala? Só se ninguém olhar para os pés...' },
  { k: 'bimby', nome: 'BIMBY', fala: 'A Bimby fica em casa: no evento vai haver dezenas delas!' },
  { k: 'comando', nome: 'COMANDO', fala: 'O comando da televisão?! Esse fica no sofá, Inês.' },
];
const TAXI = 20;        // segundos até o táxi chegar
const MULTA = 3;        // segundos perdidos por cada coisa errada

// Ícones das coisas (16 x 16, centrados; desenham-se à escala s).
function icone(ctx, R, k, cx, cy, s) {
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy));
  ctx.scale(s, s);
  if (k === 'cracha') {
    R(-3, -8, 2, 6, VERDE); R(1, -8, 2, 6, VERDE);
    box(R, -5, -2, 10, 9, '#ffffff'); R(-5, -2, 10, 2, VERDE);
    R(-3, 1, 3, 4, SKIN); R(-3, 1, 3, 1, '#6b4226'); R(1, 2, 3, 1, INOX_D); R(1, 4, 3, 1, INOX_D);
  } else if (k === 'portatil') {
    box(R, -6, -6, 12, 8, '#8fd0f5'); R(-5, -5, 4, 1, '#ffffff'); R(-5, -3, 7, 1, '#5a8fd0');
    box(R, -8, 3, 16, 2, INOX);
  } else if (k === 'sapatos') {
    R(-8, 0, 11, 5, INK); R(-1, -5, 8, 10, INK); R(3, 3, 4, 5, INK);
    R(-7, 1, 9, 3, '#d43d51'); R(0, -4, 6, 8, '#d43d51'); R(4, 4, 2, 3, '#d43d51'); R(-6, 1, 3, 1, '#ff8a9a'); R(1, -4, 4, 2, '#fff6e6');
  } else if (k === 'carregador') {
    R(-2, -7, 1, 3, INOX_D); R(1, -7, 1, 3, INOX_D);
    box(R, -3, -4, 6, 6, '#ffffff'); R(-1, -2, 2, 2, '#7be0b0');
    R(0, 3, 1, 3, INK); R(-6, 6, 7, 1, INK); R(-6, 2, 1, 4, INK); R(-7, 0, 3, 2, INK);
  } else if (k === 'boia') {
    disc(ctx, 0, 0, 7, INK); disc(ctx, 0, 0, 6, '#ffd166'); R(-6, -1, 3, 3, '#ff5d8f'); R(3, -1, 3, 3, '#ff5d8f'); R(-1, -6, 3, 3, '#ff5d8f'); R(-1, 3, 3, 3, '#ff5d8f');
    disc(ctx, 0, 0, 3, INK); disc(ctx, 0, 0, 2, PAPER);
  } else if (k === 'chinelos') {
    box(R, -6, -5, 5, 11, '#3fa6a0'); box(R, 1, -5, 5, 11, '#3fa6a0');
    R(-6, -2, 2, 1, GOLD); R(-3, -2, 2, 1, GOLD); R(-4, -4, 1, 3, GOLD); R(1, -2, 2, 1, GOLD); R(4, -2, 2, 1, GOLD); R(3, -4, 1, 3, GOLD);
  } else if (k === 'bimby') {
    box(R, -4, -6, 8, 7, INOX); R(-3, -6, 1, 7, '#eef1f5'); R(-5, -7, 10, 1, INK);
    box(R, -6, 1, 12, 6, '#ffffff'); R(-4, 3, 5, 2, '#17323a'); R(3, 3, 2, 2, INOX_D); R(-6, 6, 12, 1, '#d8dce6');
  } else {
    box(R, -3, -7, 6, 14, '#3a3f55'); R(-1, -5, 2, 2, '#d43d51'); R(-2, -1, 1, 1, INOX); R(1, -1, 1, 1, INOX); R(-2, 1, 1, 1, INOX); R(1, 1, 1, 1, INOX); R(-1, 4, 2, 1, INOX);
  }
  ctx.restore();
}

export class EventosMala extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.cells = COISAS.map((c) => ({ ...c, st: 0 }));     // st: 0 na cama · 1 na mala · 2 posta de lado
    for (let i = this.cells.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [this.cells[i], this.cells[j]] = [this.cells[j], this.cells[i]]; }
    this.sel = 0; this.packed = 0; this.fly = [];
    this.taxi = TAXI; this.late = false; this.auto = 0;
    this.phase = 'mala';      // mala → fecho → aero
    this.pt = 0; this.botT = 0; this.no = -1; this.noT = 0;
    this.ines = getCharacter('ines', 'work');
    this.hint('Toca nas coisas da lista para as pôr na mala (ou setas e Espaço), antes de o táxi chegar!');
  }

  lay(v) {
    const top = this.top(v);
    if (v.portrait) {
      const gy0 = top + 60, ch = Math.min(90, Math.floor((v.h - 24 - gy0) / 4)), cw = Math.min(116, Math.floor((v.w - 12) / 2));
      return { top, cols: 2, rows: 4, cw, ch, gx: Math.round((v.w - cw * 2) / 2), gy0, lx: 6, ly: top + 2, ix: 104, iy: top + 52, mx: 160, ty: v.h - 14 };
    }
    const gy0 = top + 4, ch = Math.min(56, Math.floor((v.h - 18 - gy0) / 2)), cw = Math.min(64, Math.floor((v.w - 92) / 4));
    return { top, cols: 4, rows: 2, cw, ch, gx: 88 + Math.round((v.w - 92 - cw * 4) / 2), gy0, lx: 4, ly: top + 2, ix: 20, iy: v.h - 17, mx: 60, ty: v.h - 11 };
  }

  center(L, i) { return [L.gx + (i % L.cols) * L.cw + L.cw / 2, L.gy0 + Math.floor(i / L.cols) * L.ch + L.ch / 2]; }

  update(dt, I, v) {
    const L = this.lay(v);
    this.pt += dt;
    if (this.noT > 0) this.noT -= dt;
    for (let i = this.fly.length - 1; i >= 0; i--) { this.fly[i].t += dt / 0.4; if (this.fly[i].t >= 1) this.fly.splice(i, 1); }
    if (this.phase === 'fecho') { if (this.pt > 1.5) { this.phase = 'aero'; this.pt = 0; this.hint('No aeroporto, cartão de embarque na mão... Mesmo a tempo!'); } return; }
    if (this.phase === 'aero') { if (this.pt > 3.6 || (this.pt > 1.5 && I.actionPressed)) this.done(); return; }

    // o táxi vem a caminho
    this.taxi -= dt;
    if (this.taxi <= 0 && !this.late) {
      this.late = true; this.auto = 0.6; this.sfx('ring');
      this.hint('Biiip! O táxi chegou. O resto vai para a mala a correr!');
    }
    if (this.late) {
      // já sem tempo: a Inês atira o que falta lá para dentro
      this.auto -= dt;
      if (this.auto <= 0) { const i = this.cells.findIndex((c) => c.ok && !c.st); if (i >= 0) this.pick(i, L); this.auto = 0.4; }
      return;
    }
    // cursor (teclado) e toque
    const n = this.cells.length;
    if (I.left && !this.pl && this.sel % L.cols > 0) this.sel--;
    if (I.right && !this.pr && this.sel % L.cols < L.cols - 1) this.sel++;
    if (I.up && !this.pu && this.sel >= L.cols) this.sel -= L.cols;
    if (I.down && !this.pd && this.sel + L.cols < n) this.sel += L.cols;
    this.pl = I.left; this.pr = I.right; this.pu = I.up; this.pd = I.down;
    if (I.actionPressed) {
      if (I.pointerX >= 0) {
        const c = Math.floor((I.pointerX * v.w - L.gx) / L.cw), r = Math.floor((I.pointerY * v.h - L.gy0) / L.ch);
        if (c >= 0 && c < L.cols && r >= 0 && r < L.rows) { this.sel = r * L.cols + c; this.pick(this.sel, L); }
      } else this.pick(this.sel, L);
    }
  }

  pick(i, L) {
    const c = this.cells[i];
    if (c.st) return;
    const [cx, cy] = this.center(L, i);
    if (c.ok) {
      c.st = 1; this.packed++;
      this.fly.push({ k: c.k, x: cx, y: cy, t: 0 });
      this.sfx('pop');
      if (!this.late) this.heart(1, cx, cy - 8);
      if (this.packed >= 4) { this.phase = 'fecho'; this.pt = 0; this.sfx('win'); this.hint(this.late ? 'Mala fechada à pressa. Para o aeroporto!' : 'Mala feita antes de o táxi chegar! Para o aeroporto.'); }
    } else {
      c.st = 2; this.no = i; this.noT = 0.5;
      this.sfx('buzz');
      this.taxi = Math.max(0.01, this.taxi - MULTA);
      this.hint(c.fala);
    }
  }

  draw(ctx, v, R) {
    if (this.phase === 'aero') { this.aeroporto(ctx, v, R); return; }
    const L = this.lay(v), t = this.t, w = v.w, P = v.portrait;
    // o quarto: parede, rodapé e a cama (onde estão as coisas)
    R(0, 0, w, v.h, '#e9e0f2');
    for (let x = 0; x < w; x += 14) R(x, 0, 1, v.h, '#e0d5ec');
    R(0, L.iy, w, v.h - L.iy, P ? '#e9e0f2' : '#b89a78');
    if (P) { R(0, L.iy, w, 3, '#b89a78'); R(0, L.iy + 3, w, 1, INK); }
    const gw = L.cw * L.cols, gh = L.ch * L.rows;
    box(R, L.gx - 4, L.gy0 - 3, gw + 8, gh + 6, '#f2c6d8');
    R(L.gx - 4, L.gy0 - 3, gw + 8, 5, '#ffffff');

    // as coisas em cima da cama
    const s = L.ch >= 50 ? 2 : 1;
    this.cells.forEach((c, i) => {
      const [cx, cy] = this.center(L, i), x = cx - L.cw / 2 + 2, y = cy - L.ch / 2 + 2;
      const sh = this.no === i && this.noT > 0 ? Math.round(Math.sin(t * 60) * 2) : 0;
      if (i === this.sel && !this.game.input.touch && this.phase === 'mala' && !this.late) R(x - 2, y - 2, L.cw, L.ch, GOLD);
      box(R, x + sh, y, L.cw - 4, L.ch - 4, c.st === 1 ? '#d8f0dc' : c.st === 2 ? '#d8d3e0' : PAPER);
      if (c.st === 1) {
        // já está na mala: fica o visto
        R(cx - 6, cy, 3, 3, VERDE); R(cx - 3, cy + 3, 3, 3, VERDE); R(cx, cy, 3, 3, VERDE); R(cx + 3, cy - 3, 3, 3, VERDE); R(cx + 6, cy - 6, 3, 3, VERDE);
        return;
      }
      if (c.st === 2) ctx.globalAlpha = 0.4;
      icone(ctx, R, c.k, cx + sh, cy - 5, s);
      text(ctx, c.nome, cx + sh, y + L.ch - 12, INK, { align: 'center' });
      ctx.globalAlpha = 1;
      if (c.st === 2) { for (let d = -6; d <= 6; d += 2) { R(cx + d - 1, cy - 5 + d - 1, 3, 3, '#d43d51'); R(cx + d - 1, cy - 5 - d - 1, 3, 3, '#d43d51'); } }
    });

    // a lista
    box(R, L.lx, L.ly, 76, 46, PAPER);
    R(L.lx, L.ly, 76, 9, VERDE);
    text(ctx, 'LISTA', L.lx + 38, L.ly + 2, '#ffffff', { align: 'center' });
    COISAS.filter((c) => c.ok).forEach((c, i) => {
      const y = L.ly + 12 + i * 8, done = this.cells.find((q) => q.k === c.k).st === 1;
      R(L.lx + 4, y, 6, 6, INK); R(L.lx + 5, y + 1, 4, 4, done ? '#5cf08a' : PAPER);
      text(ctx, c.nome, L.lx + 14, y + 1, done ? '#8a93a7' : INK);
    });

    // a Inês e a mala
    const closed = this.phase === 'fecho', gy = L.iy, mx = L.mx;
    shadow(ctx, L.ix, gy, 14);
    person(ctx, this.ines, L.ix, gy, { scale: 2, face: 1 });
    if (closed) {
      box(R, mx - 18, gy - 26, 36, 24, '#3f6fb5'); R(mx - 18, gy - 15, 36, 2, '#2f5795'); R(mx - 5, gy - 31, 10, 2, INK); R(mx - 5, gy - 31, 2, 5, INK); R(mx + 3, gy - 31, 2, 5, INK);
      R(mx - 14, gy - 2, 4, 2, INK); R(mx + 10, gy - 2, 4, 2, INK);
    } else {
      box(R, mx - 18, gy - 36, 36, 20, '#5a8fd0'); R(mx - 15, gy - 33, 30, 14, '#3f6fb5');
      box(R, mx - 18, gy - 14, 36, 14, '#3f6fb5');
      R(mx - 16, gy - 14, 32, 4, '#1f2c52');
      for (let i = 0; i < this.packed - this.fly.length; i++) R(mx - 14 + i * 7, gy - 17, 6, 5, ['#ffffff', '#8fd0f5', '#d43d51', '#7be0b0'][i]);
    }
    for (const f of this.fly) {
      const e = f.t * f.t;
      icone(ctx, R, f.k, lerp(f.x, mx, e), lerp(f.y, gy - 16, e) - Math.sin(f.t * Math.PI) * 18, f.t < 0.5 ? s : 1);
    }

    // o táxi a caminho (preto, de tejadilho verde) e a porta de casa
    const tx0 = P ? 8 : 88, tx1 = w - 22, ty = L.ty, f = clamp(1 - this.taxi / TAXI, 0, 1);
    R(tx0, ty + 3, tx1 - tx0, 3, '#5a5a66');
    for (let x = tx0 + 2; x < tx1; x += 10) R(x, ty + 4, 5, 1, '#d8d3e6');
    box(R, tx1 + 4, ty - 8, 12, 14, '#f4ecd8'); R(tx1 + 7, ty - 3, 5, 9, '#8a5a34'); R(tx1 + 2, ty - 11, 16, 3, '#c0392b');
    const cx = Math.round(lerp(tx0 + 10, tx1 - 10, f)), urg = this.taxi < 6 && Math.floor(t * 6) % 2;
    R(cx - 10, ty - 3, 20, 7, INK); R(cx - 6, ty - 8, 12, 6, INK);
    R(cx - 9, ty - 2, 18, 4, '#1c1c28'); R(cx - 5, ty - 7, 10, 4, '#3fa672'); R(cx - 4, ty - 6, 3, 3, '#bfe6fa'); R(cx + 1, ty - 6, 3, 3, '#bfe6fa');
    R(cx - 2, ty - 10, 4, 2, urg ? '#ff5d8f' : GOLD); R(cx + 8, ty - 1, 2, 2, GOLD);
    R(cx - 7, ty + 3, 4, 3, INK); R(cx + 3, ty + 3, 4, 3, INK); R(cx - 6, ty + 4, 2, 1, INOX); R(cx + 4, ty + 4, 2, 1, INOX);
  }

  // O aeroporto: janelão com um avião a levantar voo, o painel «PARTIDAS» e a Inês com o trólei.
  aeroporto(ctx, v, R) {
    const w = v.w, t = this.pt, top = this.top(v), gy = Math.round(v.h * (v.portrait ? 0.76 : 0.88));
    R(0, 0, w, v.h, '#dfe6ee');
    // janelão
    const wy = top + 30, wh = gy - 26 - wy;
    box(R, 8, wy, w - 16, wh, '#8fd0f5');
    R(8, wy + wh * 0.6, w - 16, wh * 0.4, '#c4e8fa');
    for (let i = 0; i < 4; i++) { const x = 20 + ((i * 97 + t * 6) % (w - 60)); R(x, wy + 8 + (i * 13) % Math.max(10, wh - 30), 18, 4, '#ffffff'); R(x + 4, wy + 5 + (i * 13) % Math.max(10, wh - 30), 9, 3, '#ffffff'); }
    R(8, wy + wh - 6, w - 16, 6, '#8a93a7');
    // o avião
    const ax = Math.round(lerp(10, w - 30, clamp(t / 3.4, 0, 1))), ay = Math.round(wy + wh - 16 - Math.max(0, t - 0.8) * Math.max(8, wh - 30) * 0.4);
    if (ay > wy + 14) {
      ctx.save(); ctx.translate(ax, ay); ctx.scale(2, 2); ctx.translate(-ax, -ay);
      R(ax - 14, ay - 3, 28, 6, INK); R(ax - 13, ay - 2, 26, 4, '#ffffff'); R(ax + 12, ay - 1, 3, 2, '#ffffff'); R(ax - 13, ay + 1, 26, 1, '#d8dce6');
      R(ax - 14, ay - 8, 5, 6, INK); R(ax - 13, ay - 7, 3, 5, VERDE); R(ax - 4, ay, 9, 5, INK); R(ax - 3, ay + 1, 7, 3, '#d8dce6');
      for (let i = 0; i < 5; i++) R(ax - 4 + i * 3, ay - 1, 1, 1, '#3f6fb5');
      ctx.restore();
    }
    for (let x = 8 + Math.round((w - 16) / 4); x < w - 12; x += Math.round((w - 16) / 4)) R(x, wy, 2, wh, '#ffffff');
    sign(ctx, 'PARTIDAS', w / 2, top + 6, { scale: 2, bg: '#1c1c28', color: GOLD });
    // chão brilhante e cadeiras
    R(0, gy, w, v.h - gy, '#b8c0cc'); R(0, gy, w, 2, '#9aa3b2');
    for (let x = 0; x < w; x += 30) R(x, gy + 2, 1, v.h - gy, '#a8b0bc');
    for (let x = 14; x < w - 30; x += 26) { box(R, x, gy - 22, 20, 12, '#3a3f55'); box(R, x, gy - 9, 20, 3, '#3a3f55'); R(x + 9, gy - 5, 2, 5, INOX_D); }
    // a Inês a caminho da porta de embarque, com o trólei
    const ix = Math.round(lerp(w * 0.15, w * 0.75, clamp(t / 3.4, 0, 1)));
    shadow(ctx, ix, gy, 14);
    R(ix - 13, gy - 26, 1, 12, INK); R(ix - 22, gy - 26, 10, 1, INK);
    box(R, ix - 30, gy - 24, 14, 20, '#3f6fb5'); R(ix - 30, gy - 15, 14, 2, '#2f5795'); R(ix - 29, gy - 3, 3, 3, INK); R(ix - 20, gy - 3, 3, 3, INK);
    person(ctx, this.ines, ix, gy, { scale: 2, face: 1, moving: true, dist: t * 60 });
  }

  bot(I, v) {
    if (this.phase !== 'mala' || this.late) return;
    this.botT += 1 / 60;
    if (this.botT < 0.8) return;
    this.botT = 0;
    const L = this.lay(v), i = this.cells.findIndex((c) => c.ok && !c.st);
    if (i < 0) return;
    const [cx, cy] = this.center(L, i);
    I.pointerX = cx / v.w; I.pointerY = cy / v.h; I.actionPressed = true;
  }
}

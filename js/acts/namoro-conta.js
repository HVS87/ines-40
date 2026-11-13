// «O Namoro», ato 3: pagar a conta «baratinha». Os dois despejam os bolsos em cima da mesa: toca-se
// nas moedas (ou escolhe-se com as setas e Espaço) até fazer a conta — mas no meio há botões,
// rebuçados e outras coisas que não pagam pizzas. No fim, um beijo à porta do Di Casa.
import { Act } from './base.js';
import { getCharacter, getSprites } from '../sprites.js';
import { INK, PAPER, PINK, GOLD, clamp, lerp, disc, person, shadow, text } from '../draw.js';
import { porta } from './namoro-cenario.js';

const BASE = 'Toca nas moedas (ou usa as setas e Espaço) para juntar o dinheiro da conta!';
const TRALHA = {
  botao: 'Lourenço: «Isso é um botão do meu casaco...»',
  rebucado: 'Inês: «Um rebuçado não paga pizzas, pois não?»',
  clipe: 'Lourenço: «O clipe não conta. Já tentei uma vez.»',
  elastico: 'Inês: «Isso é o meu elástico do cabelo!»',
  bilhete: 'Lourenço: «Esse bilhete já está usado...»',
};
const MOEDAS = ['ouro', 'prata', 'cobre', 'ouro', 'prata', 'cobre', 'ouro', 'prata'];
const COR = { ouro: ['#ffd23e', '#c8961a', 8], prata: ['#dfe2ee', '#9a9fb2', 7], cobre: ['#e0915a', '#a85f2a', 6] };

function moeda(ctx, R, x, y, kind, glint) {
  const [c, s, r] = COR[kind];
  disc(ctx, x, y, r + 1, INK); disc(ctx, x, y, r, c); disc(ctx, x, y, r - 2, s); disc(ctx, x, y, r - 3, c);
  R(x - r + 2, y - r + 2, 2, 2, '#ffffff');
  if (glint) { R(x + r - 3, y - r - 2, 1, 5, '#ffffff'); R(x + r - 5, y - r, 5, 1, '#ffffff'); }
}

function tralha(ctx, R, x, y, kind) {
  if (kind === 'botao') {
    disc(ctx, x, y, 8, INK); disc(ctx, x, y, 7, '#5a8fd0'); disc(ctx, x, y, 5, '#3f6fb0');
    R(x - 2, y - 2, 1, 1, INK); R(x + 1, y - 2, 1, 1, INK); R(x - 2, y + 1, 1, 1, INK); R(x + 1, y + 1, 1, 1, INK);
  } else if (kind === 'rebucado') {
    R(x - 6, y - 4, 12, 8, INK); R(x - 5, y - 3, 10, 6, '#e0527a'); R(x - 2, y - 3, 2, 6, '#fff6e6'); R(x + 2, y - 3, 2, 6, '#fff6e6');
    R(x - 10, y - 3, 4, 6, INK); R(x - 9, y - 2, 3, 4, '#ff9ab8'); R(x + 6, y - 3, 4, 6, INK); R(x + 6, y - 2, 3, 4, '#ff9ab8');
  } else if (kind === 'clipe') {
    const c = '#6a6478';
    R(x - 7, y - 4, 13, 1, c); R(x + 6, y - 3, 1, 6, c); R(x - 7, y + 3, 13, 1, c); R(x - 8, y - 3, 1, 6, c);
    R(x - 4, y - 2, 8, 1, c); R(x - 5, y - 1, 1, 2, c); R(x - 4, y + 1, 12, 1, c);
  } else if (kind === 'elastico') {
    disc(ctx, x, y, 8, INK); disc(ctx, x, y, 7, '#c79bff'); disc(ctx, x, y, 4, INK); disc(ctx, x, y, 3, PAPER);
  } else {
    R(x - 9, y - 6, 18, 12, INK); R(x - 8, y - 5, 16, 10, '#ffe9a8'); R(x - 6, y - 3, 9, 1, '#a8884a'); R(x - 6, y, 12, 1, '#a8884a'); R(x - 6, y + 2, 6, 1, '#a8884a');
    R(x + 5, y - 5, 3, 3, PAPER);
  }
}

export class Conta extends Act {
  get max() { return this.cfg.hearts || 3; }

  start() {
    this.ines = getCharacter('ines', 'teen');
    this.lourenco = getCharacter('lourenco', 'teen');
    const all = [...MOEDAS.map((k) => ({ k, coin: true })), ...Object.keys(TRALHA).map((k) => ({ k, coin: false })), null, null];
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    // cada coisa fica numa célula da grelha (com um desvio para parecer espalhada)
    this.items = [];
    all.forEach((it, cell) => { if (it) this.items.push({ ...it, cell, jx: Math.random() - 0.5, jy: Math.random() - 0.5, gone: false, fly: 0, shake: 0 }); });
    this.paid = 0; this.total = MOEDAS.length;
    this.clean = true; this.errors = 0; this.idle = 0; this.life = 0;
    this.cur = 0; this.kb = false; this.prev = {};
    this.phase = 'mesa'; this.e = 0; this.step = 0;
    this.hint(BASE);
  }

  geo(v) {
    const top = this.top(v);
    if (v.portrait) {
      const bill = { x: Math.round(v.w / 2 - 58), y: top + 4, w: 116, h: 60 };
      return { bill, sc: 2, cols: 3, rows: 5, ax: 12, ay: top + 76, aw: v.w - 24, ah: v.h - top - 92 };
    }
    const bill = { x: 8, y: top + 6, w: 84, h: v.h - top - 16 };
    return { bill, sc: 1, cols: 5, rows: 3, ax: 102, ay: top + 6, aw: v.w - 112, ah: v.h - top - 16 };
  }

  pos(it, g) {
    const cw = g.aw / g.cols, ch = g.ah / g.rows;
    return { x: g.ax + (it.cell % g.cols + 0.5) * cw + it.jx * Math.max(0, cw - 16 - 22 * g.sc), y: g.ay + (Math.floor(it.cell / g.cols) + 0.5) * ch + it.jy * Math.max(0, ch - 10 - 20 * g.sc) };
  }

  slot(i, g) {
    const b = g.bill, per = b.w > 100 ? 8 : 4;
    return { x: b.x + b.w / 2 + ((i % per) - (per - 1) / 2) * 13, y: b.y + b.h - (b.w > 100 ? 12 : 28) + Math.floor(i / per) * 14 };
  }

  pick(it) {
    this.idle = 0;
    if (it.coin) {
      it.gone = true; it.fly = 0.001; it.n = this.paid++;
      this.sfx('plim');
      if (this.paid === 3 || this.paid === 6 || this.paid === this.total) {
        if (this.clean) this.heart(1); else this.hint(BASE);
        this.clean = true;
      }
      if (this.paid >= this.total) {
        this.phase = 'pago'; this.e = 0;
        this.sfx('win');
        this.hint('Mesmo à justa! Não sobrou nem para uma pastilha.');
      }
    } else {
      it.shake = 0.4; this.clean = false; this.errors++;
      this.sfx('toc');
      this.hint(TRALHA[it.k]);
    }
  }

  update(dt, I, v) {
    const g = this.geo(v);
    for (const it of this.items) { if (it.fly > 0 && it.fly < 1) it.fly = Math.min(1, it.fly + dt * 3); if (it.shake > 0) it.shake -= dt; }
    if (this.phase === 'pago') { this.e += dt; if (this.e > 2) { this.phase = 'porta'; this.e = 0; this.hint(''); } return; }
    if (this.phase === 'porta') {
      this.e += dt;
      const at = (n, time, fn) => { if (this.step === n && this.e >= time) { this.step++; fn(); } };
      at(0, 0.4, () => this.hint('Lourenço: «Para a semana pago eu... se a mesada chegar.»'));
      at(1, 2.8, () => {
        this.hint('Um beijo à porta do Di Casa. Até para a semana!'); this.sfx('kiss');
        const gy = Math.round(v.h * (v.portrait ? 0.72 : 0.86)), x = v.w * 0.64;
        for (let k = 0; k < 7; k++) this.fx.heart(x + (k - 3) * 7, gy - 50 - (k % 3) * 6, k % 2 ? GOLD : PINK);
      });
      if (this.e > 5.6) this.done();
      return;
    }
    this.life += dt; this.idle += dt;
    const left = this.items.filter((it) => !it.gone);
    // teclado: as setas levam o cursor para a coisa mais próxima nessa direção
    for (const [key, dx, dy] of [['left', -1, 0], ['right', 1, 0], ['up', 0, -1], ['down', 0, 1]]) {
      if (I[key] && !this.prev[key]) {
        this.kb = true;
        const from = this.pos(this.items[this.cur], g);
        let best = -1, bs = 1e9;
        this.items.forEach((it, i) => {
          if (it.gone || i === this.cur) return;
          const p = this.pos(it, g), along = (p.x - from.x) * dx + (p.y - from.y) * dy, perp = Math.abs((p.x - from.x) * dy) + Math.abs((p.y - from.y) * dx);
          if (along > 4 && along + perp * 2 < bs) { bs = along + perp * 2; best = i; }
        });
        if (best >= 0) { this.cur = best; this.sfx('click'); }
      }
      this.prev[key] = I[key];
    }
    if (this.items[this.cur].gone && left.length) this.cur = this.items.indexOf(left[0]);
    if (I.actionPressed) {
      if (I.pointerX >= 0) {
        this.kb = false;
        const x = I.pointerX * v.w, y = I.pointerY * v.h;
        let best = null, bd = 12 + 12 * g.sc;
        for (const it of left) { const p = this.pos(it, g), d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = it; } }
        if (best) this.pick(best);
      } else { this.kb = true; if (!this.items[this.cur].gone) this.pick(this.items[this.cur]); }
    }
    // se demorar muito, as moedas que faltam vão sozinhas para a conta
    if (this.life > 45 && this.phase === 'mesa' && Math.floor(this.life * 3) !== Math.floor((this.life - dt) * 3)) {
      const c = left.find((it) => it.coin);
      if (c) { this.clean = false; this.pick(c); }
    }
  }

  draw(ctx, v, R) {
    const t = this.t;
    if (this.phase === 'porta') {
      const gy = Math.round(v.h * (v.portrait ? 0.72 : 0.86)), close = this.e > 2.6 ? 1 : 0, x = Math.round(v.w * 0.64);
      porta(ctx, v, R, gy, t);
      shadow(ctx, x - 11 + close, gy, 14); shadow(ctx, x + 11 - close, gy, 14);
      person(ctx, this.ines, x - 11 + close, gy, { face: 1, scale: 2 });
      person(ctx, this.lourenco, x + 11 - close, gy, { face: -1, scale: 2 });
      if (this.e > 2.8 && Math.floor(t * 4) % 2) ctx.drawImage(getSprites().heart, x - 4, gy - 62);
      if (this.e < 0.4) R(0, 0, v.w, v.h, `rgba(10,6,20,${(1 - this.e / 0.4).toFixed(2)})`);
      return;
    }
    const g = this.geo(v), b = g.bill;
    // a toalha aos quadrados e o individual de papel
    for (let y = 0; y < v.h; y += 12) for (let x = 0; x < v.w; x += 12) R(x, y, 12, 12, ((x + y) / 12) & 1 ? '#c0392b' : '#f4e6d8');
    R(g.ax - 3, g.ay - 3, g.aw + 6, g.ah + 6, INK); R(g.ax - 2, g.ay - 2, g.aw + 4, g.ah + 4, PAPER);
    R(g.ax + 2, g.ay + 2, g.aw - 4, 1, '#e0c9a0'); R(g.ax + 2, g.ay + g.ah - 3, g.aw - 4, 1, '#e0c9a0');
    // a conta
    R(b.x - 1, b.y - 1, b.w + 2, b.h + 2, INK); R(b.x, b.y, b.w, b.h, '#ffffff');
    text(ctx, 'CONTA', b.x + b.w / 2, b.y + 4, '#c0392b', { align: 'center' });
    if (b.w > 100) {
      text(ctx, '1 PIZZA', b.x + 6, b.y + 14, '#6a6478'); text(ctx, '1 ESPARGUETE', b.x + 6, b.y + 22, '#6a6478');
      R(b.x + 5, b.y + 31, b.w - 10, 1, '#c9c9d8');
      text(ctx, (this.total - this.paid === 1 ? 'FALTA ' : 'FALTAM ') + (this.total - this.paid), b.x + b.w - 6, b.y + 14, INK, { align: 'right' });
    } else {
      text(ctx, '1 PIZZA', b.x + 6, b.y + 16, '#6a6478'); text(ctx, '1 ESPARGUETE', b.x + 6, b.y + 25, '#6a6478');
      R(b.x + 5, b.y + 34, b.w - 10, 1, '#c9c9d8');
      text(ctx, (this.total - this.paid === 1 ? 'FALTA ' : 'FALTAM ') + (this.total - this.paid), b.x + b.w / 2, b.y + 40, INK, { align: 'center' });
    }
    for (let i = 0; i < this.total; i++) { const s = this.slot(i, g); disc(ctx, s.x, s.y, 6, '#d8d3e6'); disc(ctx, s.x, s.y, 5, '#ffffff'); }
    // as coisas dos bolsos
    const help = this.idle > 5 || this.errors >= 2;
    const put = (x, y, fn) => { ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.scale(g.sc, g.sc); fn(); ctx.restore(); };
    this.items.forEach((it, i) => {
      const p = this.pos(it, g);
      if (it.gone) {
        const s = this.slot(it.n, g), k = it.fly;
        if (k < 1) put(lerp(p.x, s.x, k), lerp(p.y, s.y, k) - Math.sin(k * Math.PI) * 14, () => moeda(ctx, R, 0, 0, it.k, false));
        else moeda(ctx, R, Math.round(s.x), Math.round(s.y), it.k, false);
        return;
      }
      const sx = Math.round(p.x + (it.shake > 0 ? Math.sin(t * 50) * 2 : 0)), sy = Math.round(p.y);
      put(sx, sy, () => {
        R(-7, 8, 14, 2, 'rgba(43,29,46,0.2)');
        if (it.coin) moeda(ctx, R, 0, 0, it.k, help && Math.floor(t * 3 + i) % 3 === 0); else tralha(ctx, R, 0, 0, it.k);
      });
      if (this.kb && i === this.cur) {
        const d = 12 * g.sc + (Math.floor(t * 4) % 2);
        for (const [ax, ay] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { R(sx + ax * d - 1, sy + ay * d - 1, 3, 3, INK); R(sx + ax * d - (ax > 0 ? 3 : -1), sy + ay * d, 3, 1, GOLD); R(sx + ax * d, sy + ay * d - (ay > 0 ? 3 : -1), 1, 3, GOLD); }
      }
    });
  }

  bot(I, v) {
    if (this.phase !== 'mesa' || this.idle < 0.6) return;
    const c = this.items.find((it) => !it.gone && it.coin);
    if (!c) return;
    const p = this.pos(c, this.geo(v));
    I.pointerX = clamp(p.x / v.w, 0, 1); I.pointerY = clamp(p.y / v.h, 0, 1); I.actionPressed = true;
  }
}

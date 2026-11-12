// Nível 23, o pedido: no catamarã, o Lourenço ajoelha-se com o anel. Mantém-se o dedo no ecrã
// (ou Espaço) para encher o coração do «SIM!»; quando enche, a Inês diz que sim e há fogo de
// vista de corações. Não há como falhar: se ninguém tocar, o coração enche-se sozinho, devagar.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, PINK, GOLD, clamp, shadow, text } from '../draw.js';
import { tejoBg } from './pedido-cenario.js';
import { convesChao } from './pedido-paella.js';

const LEFT = [['tio', 'hoje', 0.05], ['tiafatima', 'hoje', 0.15], ['tomas', 'casual', 0.25]];
const RIGHT = [['ana', 'casual', 0.77], ['pipoca', 'casual', 0.87], ['mi', 'casual', 0.96]];

// Forma de coração: para um raio r, as riscas (y, x0, x1) que o preenchem.
const shapes = {};
function heartRows(r) {
  if (!shapes[r]) {
    const rows = [];
    for (let py = -r; py <= r; py++) {
      let a = null;
      for (let px = -r; px <= r + 1; px++) {
        const x = (px / r) * 1.25, y = (-py / r) * 1.25 + 0.15;
        const inside = px <= r && Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y <= 0;
        if (inside && a === null) a = px;
        if (!inside && a !== null) { rows.push([py, a, px]); a = null; }
      }
    }
    shapes[r] = rows;
  }
  return shapes[r];
}

export class PedidoSim extends Act {
  get max() { return this.cfg.hearts || 3; }

  start() {
    this.state = 'ask';       // ask → fill → sim
    this.timer = 0;
    this.fill = 0; this.given = 0; this.idle = 0;
    this.boomT = 0;
    this.ines = getCharacter('ines', 'casual');
    this.lourenco = getCharacter('lourenco', 'casual');
    this.guests = [...LEFT, ...RIGHT].map(([who, outfit, x]) => ({ x, frames: getCharacter(who, outfit), face: x < 0.5 ? 1 : -1 }));
    this.hint('Lourenço: «Inês, tenho uma coisa muito importante para te perguntar...»');
  }

  update(dt, I, v) {
    this.timer += dt;
    const down = I.action || I.actionPressed, gy = convesChao(v);
    if (this.state === 'ask') {
      if (this.timer > 1.6 && !this.knelt) { this.knelt = true; this.sfx('plim'); this.hint('Lourenço: «Inês... queres casar comigo?»'); }
      if (this.timer > 4.6 || (this.timer > 2.6 && I.actionPressed)) {
        this.state = 'fill'; this.timer = 0;
        this.hint('Mantém o dedo no ecrã (ou Espaço) para encher o coração do «SIM!»');
      }
    } else if (this.state === 'fill') {
      this.idle = down ? 0 : this.idle + dt;
      const floor = this.given / this.max;
      if (down) this.fill += dt * 0.27;
      else if (this.idle > 7) this.fill += dt * 0.1;
      else this.fill = Math.max(floor, this.fill - dt * 0.05);
      this.fill = clamp(this.fill, 0, 1);
      if (down && Math.floor(this.timer * 5) !== Math.floor((this.timer - dt) * 5)) this.fx.heart(v.w / 2 + (Math.random() - 0.5) * 40, gy - 40, Math.random() < 0.3 ? GOLD : PINK);
      while (this.given < this.max && this.fill >= (this.given + 1) / this.max - 0.0001) { this.given++; this.heart(1, v.w / 2, this.heartY(v)); }
      if (this.fill >= 1) {
        this.state = 'sim'; this.timer = 0;
        this.sfx('fanfare');
        this.hint('Inês: «SIM!»');
      }
    } else {
      this.boomT -= dt;
      if (this.boomT <= 0 && this.timer < 5) {
        this.boomT = 0.45;
        this.boom(v.w * (0.15 + Math.random() * 0.7), this.top(v) + 10 + Math.random() * Math.max(10, gy - this.top(v) - 80), [PINK, GOLD, '#ff8a4b', '#ffffff'][Math.floor(Math.random() * 4)]);
        this.sfx('pop');
      }
      if (this.timer > 2.6 && !this.said) { this.said = true; this.sfx('kiss'); this.hint('E, nesse preciso momento, ouve-se um batuque a aproximar-se...'); }
      if (this.timer > 6 || (this.timer > 3.6 && I.actionPressed)) this.done();
    }
  }

  // Fogo de vista em forma de coração.
  boom(x, y, color) {
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      this.fx.add({ x, y, vx: hx * 2.6, vy: hy * 2.6, g: 12, life: 1.1 + Math.random() * 0.3, color: i % 4 ? color : PAPER, size: 2 });
    }
  }

  heartR(v) { return v.portrait ? 34 : clamp(Math.floor((convesChao(v) - this.top(v) - 62) / 2), 14, 26); }
  heartY(v) { return this.top(v) + 6 + this.heartR(v); }

  draw(ctx, v, R) {
    const gy = convesChao(v), top = this.top(v), t = this.t, cx = Math.round(v.w / 2), sim = this.state === 'sim';
    tejoBg(ctx, v, R, t, { gy, top });
    // família e amigos, dos dois lados
    for (const g of this.guests) {
      const x = Math.round(g.x * v.w), hop = sim ? Math.round(Math.abs(Math.sin(t * 7 + g.x * 20)) * 4) : 0;
      const img = g.frames[sim && Math.floor(t * 4 + g.x * 9) % 2 ? 'a' : 'stand'][g.face < 0 ? 'l' : 'r'];
      shadow(ctx, x, gy + 2, 14);
      ctx.drawImage(img, x - 16, gy + 2 - 48 - hop, 32, 48);
    }
    // a Inês e o Lourenço (de joelhos depois de fazer a pergunta; de pé e juntinhos depois do sim)
    const close = sim ? clamp(this.timer / 0.8, 0, 1) : 0;
    const ix = cx - 17 + Math.round(close * 7), lx = cx + 17 - Math.round(close * 7);
    const kneel = this.knelt && !(sim && this.timer > 0.5) && this.lourenco.kneel;
    const hop = sim ? Math.round(Math.abs(Math.sin(t * 8)) * 3) : 0;
    shadow(ctx, ix, gy + 4, 14); shadow(ctx, lx, gy + 4, 14);
    ctx.drawImage(this.ines.stand.r, ix - 16, gy + 4 - 48 - hop, 32, 48);
    const limg = (kneel ? this.lourenco.kneel : this.lourenco.stand).l;
    ctx.drawImage(limg, lx - 16, gy + 4 - limg.height * 2 - (kneel ? 0 : hop), 32, limg.height * 2);
    // o anel, na mão dele
    if (this.knelt && !sim) {
      const rx = lx - 16, ry = gy - 22;
      R(rx - 3, ry + 3, 7, 5, INK); R(rx - 2, ry + 4, 5, 3, '#7a3fa0');
      R(rx - 2, ry - 1, 5, 5, INK); R(rx - 1, ry, 3, 3, GOLD); R(rx, ry - 3, 1, 3, PAPER);
      if (Math.floor(t * 5) % 2) { R(rx - 3, ry - 4, 1, 1, PAPER); R(rx + 3, ry - 5, 1, 1, PAPER); }
    }
    // o coração do «SIM!», a encher de baixo para cima
    if (this.state !== 'ask') {
      const r = this.heartR(v), hy = this.heartY(v), beat = sim ? Math.round(Math.abs(Math.sin(t * 6)) * 2) : 0;
      const level = hy + r - Math.round(this.fill * 2 * r);
      for (const [py, a, b] of heartRows(r + 2)) R(cx + a, hy + py, b - a, 1, INK);
      for (const [py, a, b] of heartRows(r + beat)) R(cx + a, hy + py, b - a, 1, hy + py >= level ? PINK : '#4a2f5a');
      for (const [py, a, b] of heartRows(r + beat)) if (hy + py >= level && py < -r * 0.3 && a < 0 && b <= 2) R(cx + a + 3, hy + py, 3, 1, '#ff9ab8');
      text(ctx, 'SIM!', cx + 1, hy - (r > 28 ? 9 : 6), this.fill > 0.55 ? PAPER : '#b89ac0', { align: 'center', scale: r > 28 ? 3 : 2, shadow: INK });
    }
  }

  bot(I) {
    if (this.state === 'ask') { if (this.timer > 2.8) I.actionPressed = true; } else if (this.state === 'fill') I.action = true;
    else if (this.timer > 3.8) I.actionPressed = true;
  }
}

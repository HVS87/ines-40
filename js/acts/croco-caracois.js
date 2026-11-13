// «O Crô-Crô», ato 2: primavera, caracóis! O palito anda de um lado para o outro: toca-se quando
// estiver na zona verde (por cima do caracol) para o tirar da casca. A travessa vai-se esvaziando
// e as cascas acumulam-se na tacinha. Quem falha... fica o Pipoca com o caracol.
import { Act } from './base.js';
import { INK, GOLD, clamp, hash, disc, text } from '../draw.js';
import { esplanada, sentados, malta, partes, painel } from './croco-cenario.js';

const BASE = 'Toca quando o palito estiver na zona verde, por cima do caracol!';
const BOAS = ['Inês: «Hmm, este estava ótimo!»', 'Ana: «E agora molha o pão no molho!»', 'Tété: «Cuidado com o molho, que salpica.»', 'Pi: «Isto pede mais uma imperial.»', 'Mi: «Não há caracóis como estes!»', 'Maria: «Primavera é isto mesmo.»'];
const MAS = ['Pipoca: «Esse escorregou... fica para mim!»', 'Soft: «O caracol fugiu-te!»', 'Isabel: «Roda o palito, que é jeito.»'];
const RONDAS = 8;

function casca(ctx, R, x, y, r) {
  disc(ctx, x, y, r + 1, INK); disc(ctx, x, y, r, '#d2a86e'); disc(ctx, x + 1, y - 1, Math.round(r * 0.66), '#a87a48'); disc(ctx, x + 1, y - 1, Math.round(r * 0.38), '#d2a86e');
  if (r > 4) R(x + 1, y - 1, 1, 1, '#7a5430');
}

export class Caracois extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    this.list = malta();
    this.r = 0;                 // ronda
    this.eaten = 0;             // cascas vazias na tacinha
    this.pos = 0; this.dir = 1;
    this.state = 'aim'; this.st = 0; this.ok = false;
    this.over = 0;
    this.novo();
    this.hint(BASE);
  }

  novo() { this.zc = 0.22 + hash(this.r * 5.3 + 1) * 0.56; this.zw = Math.max(0.2, 0.27 - this.r * 0.01); this.pos = this.zc > 0.5 ? 0 : 1; this.dir = this.zc > 0.5 ? 1 : -1; }

  update(dt, I) {
    if (this.over) { this.over += dt; if (this.over > 2.6) this.done(); return; }
    this.st += dt;
    if (this.state === 'res') {
      if (this.st > 1.0) {
        this.r++; this.state = 'aim'; this.st = 0;
        if (this.r >= RONDAS) { this.over = 0.01; this.sfx('win'); this.hint('Soft: «Travessa vazia! Venha outra, que é primavera!»'); } else this.novo();
      }
      return;
    }
    this.pos += this.dir * Math.min(1, 0.72 + this.r * 0.04) * dt;
    if (this.pos > 1 || this.pos < 0) { this.dir *= -1; this.pos = clamp(this.pos, 0, 1); }
    if ((I.actionPressed && this.st > 0.25) || this.st > 7) {
      this.ok = I.actionPressed && Math.abs(this.pos - this.zc) <= this.zw / 2;
      this.state = 'res'; this.st = 0;
      if (this.ok) { this.eaten++; this.heart(1); this.sfx('slurp'); this.hint(BOAS[this.r % BOAS.length]); }
      else { this.sfx('toc'); this.hint(I.actionPressed ? MAS[this.r % MAS.length] : 'Pipoca: «Se não comes, como eu!»'); }
    }
  }

  draw(ctx, v, R) {
    const p = partes(v, this.top(v)), t = this.t;
    esplanada(ctx, v, R, { gy: p.gy, top: p.top, cx: p.cx, half: p.half, t });
    const res = this.state === 'res';
    sentados(ctx, R, this.list, { x0: p.x0, x1: p.x1, gy: p.gy, rows: p.rows, t, drinks: 10, all: this.over > 0, speaker: res && !this.ok ? 'Pipoca' : res ? 'Inês' : '' });

    // ----- a mesa em grande plano -----
    const { pw, ph } = painel(R, p, '#dfe3ee'), px = 0, py = 0;
    ctx.save(); ctx.translate(p.px, p.py); ctx.scale(p.s, p.s);
    R(px, py, pw, 2, '#f2f4fa'); R(px, py + ph - 3, pw, 3, '#b8bccc');
    const bw = pw - 28, bx = px + 14, by = py + ph - 16, cy = Math.round(py + ph * 0.56);
    // a travessa (à esquerda, em cima) com os caracóis que faltam, e a tacinha das cascas (à direita)
    const left = RONDAS - this.r - (res ? 1 : 0), tx = px + Math.round(pw * 0.25), ty = py + 14;
    R(tx - 27, ty - 9, 54, 20, INK); R(tx - 26, ty - 8, 52, 18, '#ffffff'); R(tx - 23, ty - 5, 46, 12, '#e8d8b0');
    for (let i = 0; i < left; i++) casca(ctx, R, tx - 17 + (i % 4) * 11, ty - 2 + Math.floor(i / 4) * 7, 3);
    const cx2 = px + Math.round(pw * 0.78);
    R(cx2 - 19, ty - 3, 38, 14, INK); R(cx2 - 18, ty - 2, 36, 12, '#5a8fd0'); R(cx2 - 18, ty - 2, 36, 2, '#8fb8e8');
    for (let i = 0; i < this.eaten; i++) casca(ctx, R, cx2 - 12 + (i % 4) * 8, ty - 4 - Math.floor(i / 4) * 5, 3);
    // o caracol da vez, por cima do meio da zona verde
    const zx = bx + Math.round(this.zc * bw), mx = bx + Math.round(this.pos * bw);
    if (!(res && this.st > 0.5)) {
      casca(ctx, R, zx, cy + 8, 10);
      R(zx - 12, cy + 12, 8, 6, INK); R(zx - 11, cy + 13, 6, 4, res && this.ok ? '#3a2c28' : '#e8d8a8');
    }
    // o palito (desce quando se toca)
    const down = res ? Math.min(1, this.st / 0.12) : 0, up = res && this.st > 0.25 ? Math.min(1, (this.st - 0.25) / 0.3) : 0;
    const tipY = cy - 20 + Math.round(down * 28) - Math.round(up * 24), ptx = mx - 6;
    for (let i = 0; i < 16; i++) R(ptx + Math.round(i * 0.5), tipY - i, 2, 1, i < 2 ? INK : '#e8c890');
    R(ptx + 7, tipY - 21, 9, 8, INK); R(ptx + 8, tipY - 20, 7, 6, '#f6c9a0');                 // os dedos
    if (res && this.ok && this.st > 0.12) { R(ptx - 3, tipY - 1, 7, 6, INK); R(ptx - 2, tipY, 5, 4, '#e8d8a8'); R(ptx - 1, tipY + 1, 2, 1, '#a89868'); }
    // a barra: zona verde e marcador
    R(bx - 1, by - 1, bw + 2, 8, INK); R(bx, by, bw, 6, '#3a2f4f');
    R(bx + Math.round((this.zc - this.zw / 2) * bw), by, Math.round(this.zw * bw), 6, '#5cf08a');
    R(mx - 2, by - 3, 5, 12, INK); R(mx - 1, by - 2, 3, 10, GOLD);
    if (res) text(ctx, this.ok ? 'SAIU!' : 'ESCORREGOU!', px + pw / 2, by - 11, this.ok ? '#2f8a4a' : '#c0392b', { align: 'center' });
    ctx.restore();
  }

  bot(I) {
    if (this.over || this.state !== 'aim' || this.st < 0.3) return;
    if (Math.abs(this.pos - this.zc) < this.zw * 0.3) I.actionPressed = true;
  }
}

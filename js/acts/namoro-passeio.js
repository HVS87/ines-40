// «O Namoro», ato 1: depois das aulas, a Inês e o Lourenço vão a pé de mãos dadas. Toca-se para
// saltarem os dois e apanharem os corações que pairam no caminho. No fim, o primeiro beijo —
// com as amigas a espreitar por trás de uma sebe.
import { Act } from './base.js';
import { getCharacter, getSprites } from '../sprites.js';
import { INK, PINK, GOLD, clamp, person, shadow } from '../draw.js';
import { ruaTarde, sebe } from './namoro-cenario.js';

const SPEED = 55, PASSO = 120, X0 = 60, PRIMEIRO = 190;

export class Passeio extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    this.ines = getCharacter('ines', 'teen');
    this.lourenco = getCharacter('lourenco', 'teen');
    this.amigas = ['mi', 'maria', 'tete'].map((w) => getCharacter(w, 'teen'));
    this.n = this.max + 1;                 // há um coração a mais do que os que contam
    this.hearts = Array.from({ length: this.n }, (_, i) => ({ x: PRIMEIRO + i * PASSO, up: (i % 2) * 5, got: false, lost: false }));
    this.endX = PRIMEIRO + this.n * PASSO - 30;
    this.x = X0; this.dist = 0; this.jy = 0; this.vy = 0;
    this.phase = 'walk'; this.e = 0; this.step = 0;
    this.hint('Toca para saltarem os dois e apanharem os corações!');
  }

  update(dt, I, v) {
    if (this.phase === 'end') { this.fim(dt, v); return; }
    this.x += SPEED * dt; this.dist += SPEED * dt;
    // salto (de mãos dadas, saltam os dois)
    if (I.actionPressed && this.jy <= 0) { this.vy = 168; this.sfx('jump'); }
    if (this.vy || this.jy > 0) {
      this.jy += this.vy * dt; this.vy -= 520 * dt;
      if (this.jy <= 0) { this.jy = 0; this.vy = 0; }
    }
    const cx = this.x - 11, gy = this.gy(v);
    for (const h of this.hearts) {
      if (h.got || h.lost) continue;
      if (Math.abs(h.x - cx) < 19 && this.jy >= 9 + h.up) {
        h.got = true;
        this.fx.burst(h.x - this.cam(v), gy - 66 - h.up, 8, [PINK, GOLD, '#ffffff'], 50);
        if (!this.heart(1, h.x - this.cam(v), gy - 70)) this.sfx('plim');
      } else if (h.x < cx - 26) h.lost = true;
    }
    if (this.x >= this.endX && this.jy <= 0) { this.phase = 'end'; this.e = 0; this.step = 0; }
  }

  // o fim do passeio: a pergunta, o «quero!» e o primeiro beijo
  fim(dt, v) {
    this.e += dt;
    const at = (n, time, fn) => { if (this.step === n && this.e >= time) { this.step++; fn(); } };
    const sx = this.x - 9 - this.cam(v), gy = this.gy(v);
    at(0, 0.3, () => this.hint('Lourenço: «Inês... queres namorar comigo?»'));
    at(1, 2.6, () => { this.hint('Inês: «Quero!»'); this.sfx('chirp'); });
    at(2, 4.0, () => {
      this.hint('O primeiro beijo!'); this.sfx('kiss');
      for (let k = 0; k < 6; k++) this.fx.heart(sx + (k - 2.5) * 7, gy - 50 - (k % 3) * 6, k % 2 ? GOLD : PINK);
    });
    at(3, 5.6, () => { this.hint('Maria: «(Eu não disse? Eu não disse?!)»'); this.sfx('pop'); });
    if (this.e > 8.2) this.done();
  }

  gy(v) { return Math.round(v.h * (v.portrait ? 0.72 : 0.84)); }
  cam(v) { return Math.round(this.x - v.w * 0.36); }

  draw(ctx, v, R) {
    const gy = this.gy(v), cam = this.cam(v), t = this.t, end = this.phase === 'end';
    ruaTarde(ctx, v, R, gy, cam, t);
    // as amigas, escondidas atrás da sebe (aparecem no fim)
    const hx = this.endX + 50 - cam;
    if (end && this.e > 5.4) {
      const up = clamp((this.e - 5.4) / 0.4, 0, 1);
      this.amigas.forEach((f, i) => person(ctx, f, hx + 12 + i * 21, gy + Math.round((1 - up) * 34) - 8, { face: -1, scale: 2, hop: i === 1 ? Math.round(Math.abs(Math.sin(t * 7)) * 2) : 0 }));
    }
    sebe(ctx, R, hx, gy + 1, 66);
    // corações no caminho
    const spr = getSprites().heart;
    for (const h of this.hearts) {
      if (h.got) continue;
      const x = Math.round(h.x - cam), y = gy - 74 - h.up + Math.round(Math.sin(t * 3 + h.x) * 2);
      if (x < -20 || x > v.w + 20) continue;
      ctx.globalAlpha = h.lost ? 0.35 : 1;
      ctx.drawImage(spr, x - 9, y, 18, 16);
      ctx.globalAlpha = 1;
    }
    // os dois, de mãos dadas
    const close = end && this.e > 3.8 ? 1 : 0, kiss = end && this.e > 4 && this.e < 5.4;
    const lx = this.x - 22 + close - cam, ix = this.x - close - cam;
    shadow(ctx, lx, gy, 14); shadow(ctx, ix, gy, 14);
    const hopI = end && this.e > 2.6 && this.e < 3.4 ? Math.round(Math.abs(Math.sin(t * 9)) * 3) : 0;
    person(ctx, this.lourenco, lx, gy - this.jy, { face: 1, scale: 2, moving: !end, dist: this.dist, air: this.jy > 0 });
    person(ctx, this.ines, ix, gy - this.jy, { face: end ? -1 : 1, scale: 2, moving: !end, dist: this.dist + 7, air: this.jy > 0, hop: hopI });
    if (!end) { R(lx + 10, gy - 20 - this.jy, 3, 3, INK); R(lx + 11, gy - 19 - this.jy, 1, 1, '#f6c9a0'); }
    if (kiss && Math.floor(t * 4) % 2) { const s = getSprites().heart; ctx.drawImage(s, Math.round((lx + ix) / 2) - 4, gy - 62); }
  }

  bot(I, v) {
    if (this.phase !== 'walk' || this.jy > 0) return;
    const cx = this.x - 11, h = this.hearts.find((k) => !k.got && !k.lost);
    if (h && h.x - cx < 13 && h.x - cx > -6) I.actionPressed = true;
  }
}

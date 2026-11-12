// Ver os veleiros a passar, da esplanada do Clube Naval: a Inês tira fotografias ao pôr do sol.
// Um só botão: tocar quando a vela passa mesmo à frente do sol (uma fotografia por veleiro).
// Passam cinco veleiros e há quatro corações: pode falhar-se um sem perder nada.
//   { act: Veleiros, hearts: 4, boats: 5 }
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, clamp, disc, person, text } from '../draw.js';
import { docaBelem, docaGeo } from './naval-fundo.js';
import { tom } from './pesca.js';

const CERTO = 10;                                   // píxeis de tolerância entre a vela e o sol
const VELAS = ['#ffffff', '#ff8a8a', '#ffffff', '#8fd0f5', '#ffffff', '#ffd166'];
const DICA = 'Toca quando a vela passar mesmo à frente do sol, para a Inês tirar a fotografia!';

export class Veleiros extends Act {
  get max() { return this.cfg.hearts || 4; }

  start(v) {
    this.total = this.cfg.boats || 5;
    this.n = -1; this.el = 0; this.flash = 0; this.foto = null; this.fim = 0;
    this.ines = getCharacter('ines', 'casual'); this.lourenco = getCharacter('lourenco', 'casual');
    this.novo(v);
    this.hint(DICA);
  }

  novo(v) {
    this.n++;
    if (this.n >= this.total) { this.b = null; this.fim = 0.01; this.sfx('win'); this.hint('Inês: «Não há pôr do sol como o de Belém.»'); return; }
    const dir = this.n % 2 ? -1 : 1;
    this.b = { dir, x: dir > 0 ? -26 : v.w + 26, vel: v.w * 0.11 + ((this.n * 7) % 16) * 0.6, shot: false, cor: VELAS[this.n % VELAS.length] };
  }

  dusk() { return clamp(0.36 + this.el * 0.012, 0, 0.7); }

  geo(v) { return docaGeo(v, { gy: Math.round(v.h * (v.portrait ? 0.76 : 0.88)), dusk: this.dusk() }); }

  update(dt, I, v) {
    this.el += dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.foto) this.foto.t += dt;
    if (this.fim) { this.fim += dt; if (this.fim > 2.6) this.done(); return; }
    const g = this.geo(v), b = this.b;
    b.x += b.dir * b.vel * (b.shot ? 3 : 1) * dt;
    if (I.actionPressed && !b.shot) {
      const dx = b.x - g.sunX, ok = Math.abs(dx) <= CERTO;
      b.shot = true; this.flash = 0.14; this.sfx('click');
      this.foto = { dx, ok, t: 0, cor: b.cor, dir: b.dir };
      if (ok) { this.heart(1, g.sunX, g.sunY - 16); this.sfx('plim'); }
      this.hint(ok ? ['Que fotografia! Vem aí outro veleiro.', 'Linda! Esta vai para a moldura.', 'Em cheio, com o sol na vela!', 'Perfeita! Parece um postal.', 'Mais uma para o álbum!'][this.n % 5] : (Math.abs(dx) < 30 ? 'Quase... a vela ficou ao lado do sol. Vem aí outro!' : 'Cedo ou tarde demais: espera que a vela tape o sol.'));
    } else if (!b.shot && (b.x - g.sunX) * b.dir > 34) { b.shot = true; this.hint('Esse já passou... Vem aí outro: toca quando a vela tapar o sol.'); }
    if (b.x < -30 || b.x > v.w + 30) this.novo(v);
  }

  draw(ctx, v, R) {
    const g = this.geo(v), t = this.t;
    docaBelem(ctx, v, R, t, { gy: g.gy, dusk: g.dusk, signX: 0.28 });
    // o veleiro, entre a outra margem e a marina
    const wy = g.hy + Math.round((g.gy - g.hy) * 0.3);
    if (this.b) this.veleiro(R, Math.round(this.b.x), wy + Math.round(Math.sin(t * 2) * 1), this.b.dir, this.b.cor, Math.abs(this.b.x - g.sunX) < 16, g);
    // a Inês (de máquina na mão) e o Lourenço, na esplanada
    const ix = Math.round(v.w * 0.2);
    person(ctx, this.lourenco, ix - 26, g.gy, { scale: 2, face: 1 });
    person(ctx, this.ines, ix, g.gy, { scale: 2, face: 1 });
    R(ix + 8, g.gy - 32, 9, 7, INK); R(ix + 9, g.gy - 31, 7, 5, '#5a5a66'); R(ix + 12, g.gy - 30, 3, 3, '#cfeaff'); if (this.flash > 0) R(ix + 15, g.gy - 34, 4, 4, '#ffffff');
    // a última fotografia, tipo «polaroid»
    if (this.foto && this.foto.t < 2.2) {
      const f = this.foto, fw = 46, fh = 44, fx = Math.round(v.w - fw - 10), fy = Math.round(Math.max(this.top(v) + 4, g.hy - fh - 26) + Math.max(0, 0.2 - f.t) * 60);
      R(fx - 1, fy - 1, fw + 2, fh + 2, INK); R(fx, fy, fw, fh, PAPER);
      R(fx + 3, fy + 3, fw - 6, 26, tom('#f29a5a', '#c8527a', g.dusk)); R(fx + 3, fy + 20, fw - 6, 9, tom('#3a6fa8', '#2a2358', g.dusk));
      disc(ctx, fx + fw / 2, fy + 16, 6, '#fff6c8');
      const bx = clamp(Math.round(fx + fw / 2 + f.dx * 0.6), fx + 6, fx + fw - 7);
      R(bx, fy + 8, 1, 13, INK); for (let i = 0; i < 11; i++) R(bx + (f.dir > 0 ? 1 : -1 - Math.round(i * 0.7)), fy + 9 + i, Math.round(i * 0.7) + 1, 1, INK); R(bx - 5, fy + 21, 11, 2, INK);
      text(ctx, f.ok ? 'LINDA!' : 'QUASE', fx + fw / 2, fy + 33, f.ok ? '#e0527a' : '#8a8794', { align: 'center' });
    }
    if (this.flash > 0) R(0, 0, v.w, v.h, 'rgba(255,255,255,0.75)');
    // quantos veleiros faltam
    for (let i = 0; i < this.total; i++) { const x = v.w / 2 - this.total * 5 + i * 10, y = v.h - 9; R(x, y, 7, 2, i < this.n ? '#5a4a5e' : PAPER); R(x + 3, y - 5, 1, 5, i < this.n ? '#5a4a5e' : PAPER); R(x + 4, y - 4, 2, 3, i < this.n ? '#5a4a5e' : GOLD); }
  }

  veleiro(R, x, wy, dir, cor, contraluz, g) {
    const casco = contraluz ? INK : '#f2f2f7', vela = contraluz ? tom(cor, '#2b1d2e', 0.75) : tom(cor, '#ff9a5a', g.dusk * 0.5);
    R(x - 10, wy - 3, 21, 4, INK); R(x - 9, wy - 2, 19, 2, casco); R(x + dir * 9, wy - 4, 3, 2, INK);
    R(x, wy - 27, 1, 24, INK);
    for (let i = 0; i < 22; i++) { const w = Math.round(1 + i * 0.5); R(x + (dir > 0 ? 2 : -1 - w), wy - 26 + i, w, 1, vela); }       // vela grande
    for (let i = 0; i < 16; i++) { const w = Math.round(1 + i * 0.45); R(x + (dir > 0 ? -1 - w : 2), wy - 21 + i, w, 1, tom(vela, '#000000', 0.12)); }   // estai
    R(x - 12, wy + 1, 25, 1, '#ffffff');
  }

  bot(I, v) {
    if (this.fim || !this.b || this.b.shot) return;
    if (Math.abs(this.b.x - this.geo(v).sunX) < 3) I.actionPressed = true;
  }
}

// Pedras d'El Rei, ato 2: raquetes na praia. A Inês e o irmão trocam a bola sem a deixar cair:
// toca-se quando a bola chega à raquete da Inês. Contam-se os toques; a família torce, debaixo
// dos chapéus de sol, e passa o vendedor das bolas de Berlim.
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, PAPER, clamp, lerp, disc, person, shadow, sign } from '../draw.js';
import { chao, praia, DIA } from './farol-comum.js';
import { familia, chapeu } from './pedras-comum.js';

const BOLAS = 10;                 // quantas vezes a bola vai ter com a Inês
const J0 = 0.78, J1 = 1.12;       // janela para bater (fração do voo)

export class PedrasRaquetes extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.fam = familia();
    this.vend = getCharacter('empregado');
    this.u = 0; this.dir = -1; this.T = 1.3; this.hits = 0; this.arr = 0; this.swing = 0; this.cool = 0; this.pswing = 0;
    this.fase = 'serve'; this.tf = 0; this.from = null; this.festa = 0; this.over = 0;
    this.hint('Toca quando a bola chegar à raquete da Inês. Não a deixes cair na areia!');
  }

  lay(v) {
    const P = v.portrait, gy = chao(v), ix = Math.round(v.w * (P ? 0.17 : 0.2)), px = v.w - ix;
    return { P, gy, ix, px, ry: gy - 32, H: P ? 96 : 42, a: { x: px - 16, y: gy - 32 }, b: { x: ix + 16, y: gy - 32 } };
  }

  bola(L) {
    const u = this.u, A = this.from || (this.dir < 0 ? L.a : L.b), B = this.dir < 0 ? L.b : L.a;
    return { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u) - 4 * L.H * u * (1 - u) };
  }

  update(dt, I, v) {
    const L = this.lay(v);
    this.swing = Math.max(0, this.swing - dt * 4); this.pswing = Math.max(0, this.pswing - dt * 4);
    this.cool = Math.max(0, this.cool - dt); this.festa = Math.max(0, this.festa - dt);
    this.tf += dt;
    if (this.over) { this.over += dt; if (this.over > 3.2 || (this.over > 1.2 && I.actionPressed)) this.done(); return; }
    if (this.fase === 'serve') {
      // o irmão prepara-se e serve
      if (this.tf > 0.9) { this.fase = 'voo'; this.dir = -1; this.u = 0; this.from = null; this.pswing = 1; this.sfx('toc'); }
      return;
    }
    if (this.fase === 'queda') {
      if (this.tf > 1.1) {
        if (this.arr >= BOLAS) this.acaba(); else { this.fase = 'serve'; this.tf = 0; }
      }
      return;
    }
    this.u += dt / this.T;
    if (this.dir > 0) {
      if (this.u >= 1) {
        if (this.arr >= BOLAS) { this.acaba(); return; }
        this.dir = -1; this.u = 0; this.from = null; this.pswing = 1; this.sfx('toc');
        this.T = Math.max(0.98, 1.3 - this.arr * 0.035);
      }
      return;
    }
    if (I.actionPressed && this.cool <= 0) {
      this.swing = 1; this.cool = 0.36;
      if (this.u >= J0 && this.u <= J1) {
        const p = this.bola(L);
        this.hits++; this.arr++; this.festa = 0.5;
        this.sfx('toc');
        if (this.hits % 2 === 0) this.heart(1, p.x, p.y - 8);
        this.from = { x: p.x, y: Math.min(p.y, L.ry) }; this.dir = 1; this.u = 0;
        return;
      }
    }
    if (this.u > J1 + 0.04) {
      this.arr++; this.fase = 'queda'; this.tf = 0; this.sfx('stomp');
      const p = this.bola(L);
      this.fx.burst(p.x, L.gy, 6, ['#fbeec8', '#dcbf80'], 40);
    }
  }

  acaba() {
    this.over = 0.01; this.fase = 'fim';
    this.sfx('win');
    this.hint(this.hits >= 7 ? 'Tia Fátima: «Que craques! Nem a bola de Berlim vos distrai.»' : 'Tia Fátima: «Pausa para a bolinha! Quem quer com creme?»');
  }

  draw(ctx, v, R) {
    const L = this.lay(v), { P, gy, ix, px } = L, t = this.t, top = this.top(v);
    const { sy } = praia(ctx, v, R, t, { ...DIA, gy, sy: gy - (P ? 110 : 36), hy: gy - (P ? 170 : 62) });
    // ao fundo: chapéus de sol, toalhas e a família a torcer
    const by = sy + (P ? 34 : 13), salto = this.festa > 0 ? Math.round(Math.abs(Math.sin(t * 14)) * 3) : 0;
    const xs = P ? [0.3, 0.44, 0.58, 0.72] : [0.36, 0.45, 0.55, 0.64];
    R(v.w * xs[0] - 12, by + 1, 30, 4, '#e0527a'); R(v.w * xs[2] - 6, by + 2, 30, 4, '#3fa6a0'); R(v.w * xs[2] - 6, by + 2, 6, 4, '#ffffff');
    chapeu(R, v.w * xs[0] - 12, by, '#e0572f', '#fff6e6'); chapeu(R, v.w * xs[3] + 12, by, '#2f6fb5', '#ffd166');
    [1, 2, 3, 4].forEach((k, i) => { shadow(ctx, v.w * xs[i], by + 2, 8); person(ctx, this.fam[k], v.w * xs[i], by + 2, { face: i < 2 ? -1 : 1, hop: salto && (i + Math.floor(t * 7)) % 2 ? salto : 0 }); });
    // o vendedor das bolas de Berlim
    const vu = ((t + 4) % 16) / 9;
    if (vu < 1) {
      const vx = lerp(v.w + 20, -20, vu), vy = sy + (P ? 14 : 5);
      person(ctx, this.vend, vx, vy, { face: -1, moving: true, dist: vu * 400 });
      R(vx - 12, vy - 13, 9, 7, INK); R(vx - 11, vy - 12, 7, 5, '#fff6e6'); R(vx - 10, vy - 14, 5, 2, '#e0a050');
      if (vx > 40 && vx < v.w - 40) sign(ctx, 'OLHA A BOLINHA!', vx, vy - 40, { bg: PAPER, color: '#a3242c' });
    }
    // os jogadores
    const janela = this.fase === 'voo' && this.dir < 0 && this.u >= J0 && this.u <= J1;
    const raquete = (x, y, face, sw, on) => {
      const rx = x + face * (11 + sw * 3), ry = y - 28 - sw * 6;
      if (on) disc(ctx, rx, ry, 9, GOLD);
      disc(ctx, rx, ry, 7, INK); disc(ctx, rx, ry, 5, '#d89a52'); R(rx - 1, ry - 4, 2, 8, '#b87a3a');
      R(rx - face * 3 - 1, ry + 5, 3, 6, INK);
    };
    shadow(ctx, ix, gy, 14); person(ctx, this.fam[0], ix, gy, { scale: 2, face: 1, hop: Math.round(this.swing * 3) });
    raquete(ix, gy, 1, this.swing, janela);
    shadow(ctx, px, gy, 14); person(ctx, this.fam[5], px, gy, { scale: 2, face: -1, hop: Math.round(this.pswing * 3) });
    raquete(px, gy, -1, this.pswing, false);
    // a bola (e a sombra na areia)
    let p = null;
    if (this.fase === 'voo') p = this.bola(L);
    else if (this.fase === 'serve') p = { x: L.a.x, y: L.a.y - Math.abs(Math.sin(this.tf * 7)) * 6 };
    else if (this.fase === 'queda') p = { x: lerp(L.b.x - 4, L.a.x, clamp((this.tf - 0.5) / 0.6, 0, 1)), y: gy - 3 - Math.sin(clamp((this.tf - 0.5) / 0.6, 0, 1) * Math.PI) * 30 };
    else p = { x: L.a.x, y: L.a.y };
    p.y = Math.min(p.y, gy - 3);
    R(p.x - 3, gy + 1, 6, 2, 'rgba(43,29,46,0.3)');
    disc(ctx, p.x, p.y, 4, INK); disc(ctx, p.x, p.y, 3, '#fff04a'); R(p.x - 2, p.y - 2, 2, 1, '#ffffff');
    // o marcador de toques
    sign(ctx, 'TOQUES ' + this.hits, v.w / 2, top + 3, { scale: 2, color: PAPER });
    for (let k = 0; k < BOLAS; k++) { const x = v.w / 2 - BOLAS * 4 + k * 8; R(x, top + 25, 6, 4, INK); R(x + 1, top + 26, 4, 2, k < this.arr ? '#9a93ad' : '#fff04a'); }
  }

  bot(I) {
    if (this.fase === 'voo' && this.dir < 0 && this.u >= 0.92 && this.cool <= 0) I.actionPressed = true;
    if (this.over > 1.5) I.actionPressed = true;
  }
}

// «O Crôcô», ato 1: tirar as imperiais para a mesa. Primeiro aparece o logótipo da casa; depois,
// mantém-se premido para encher o copo e
// larga-se quando a espuma chega à marca verde. Cada imperial bem tirada dá um coração.
import { Act } from './base.js';
import { INK, clamp, text } from '../draw.js';
import { esplanada, sentados, malta, partes, painel, logo, logoTam } from './croco-cenario.js';

const BASE = 'Mantém premido para encher o copo e larga com a espuma na marca verde!';
const BOAS = ['Pipoca: «Essa é para mim! Está perfeita.»', 'Ana: «Com a espuma mesmo no ponto!»', 'Leal: «Tiras imperiais como ninguém.»', 'Tété: «Fresquinha! Venha a próxima.»', 'Maria: «Assim é que é uma imperial!»'];
const CURTAS = ['Soft: «Isso é só meia imperial...»', 'Isabel: «Falta cerveja nesse copo!»'];
const CHEIAS = ['Mi: «Olha a espuma a fugir pelo copo abaixo!»', 'Pipoca: «Entornou! Deixa, que eu bebo assim mesmo.»'];

export class Imperiais extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    this.list = malta();
    this.n = 0;                 // copos já servidos
    this.T = 0;                 // nível do copo (1 = cheio até cima)
    this.state = 'logo'; this.st = 0;                         // começa pelo logótipo da casa
    this.armed = false; this.started = false; this.pour = false; this.res = '';
    this.over = 0;
    this.hint('No Crôcô havia café e hambúrgueres... e imperiais bem tiradas!');
  }

  zone() { return [0.78 + this.n * 0.01, 0.96]; }

  update(dt, I) {
    if (this.over) { this.over += dt; if (this.over > 2.6) this.done(); return; }
    this.st += dt;
    this.pour = false;
    if (this.state === 'logo') {
      if (this.st > 2.8 || (I.actionPressed && this.st > 0.6)) { this.state = 'fill'; this.st = 0; this.armed = false; this.hint(BASE); }
      return;
    }
    if (this.state === 'res') {
      if (this.st > 1.3) {
        this.n++; this.T = 0; this.state = 'fill'; this.st = 0; this.armed = false; this.started = false;
        if (this.n >= this.max) { this.over = 0.01; this.sfx('win'); this.hint('Todos: «Saúde! Às tardes no Crôcô!»'); }
      }
      return;
    }
    if (!I.action) this.armed = true;          // é preciso um toque novo para cada copo
    if (I.action && this.armed) {
      this.pour = true; this.started = true;
      this.T += (0.5 + this.n * 0.07) * dt;
      if (Math.floor(this.st * 12) !== Math.floor((this.st - dt) * 12)) this.sfx('click');
      if (this.T >= 1.1) this.avaliar();
    } else if (this.started) {
      if (this.T < 0.25) { this.started = false; this.hint('Ainda está quase vazio: mantém premido para continuar a encher!'); } else this.avaliar();
    } else if (this.st > 9) this.avaliar();   // ninguém tirou a imperial: segue para a próxima
  }

  avaliar() {
    const [a, b] = this.zone(), k = this.n;
    this.state = 'res'; this.st = 0;
    if (this.T >= a && this.T <= b) { this.res = 'ok'; this.heart(1); this.sfx('check'); this.hint(BOAS[k % BOAS.length]); }
    else if (this.T > b) { this.res = 'cheia'; this.sfx('pop'); this.hint(CHEIAS[k % CHEIAS.length]); }
    else { this.res = 'curta'; this.sfx('toc'); this.hint(this.started ? CURTAS[k % CURTAS.length] : 'Mi: «Então e essa imperial, sai ou não sai?»'); }
  }

  draw(ctx, v, R) {
    const p = partes(v, this.top(v)), t = this.t;
    esplanada(ctx, v, R, { gy: p.gy, top: p.top, cx: p.cx, half: p.half, rows: p.rows, t });
    sentados(ctx, R, this.list, { x0: p.x0, x1: p.x1, gy: p.gy, rows: p.rows, t, drinks: this.n + (this.state === 'res' && this.st > 0.9 ? 1 : 0), all: this.over > 0 });

    // ----- o balcão em grande plano -----
    const { pw, ph } = painel(R, p, '#d8ecf0'), px = 0, py = 0, by = ph - 20;
    ctx.save(); ctx.translate(p.px, p.py); ctx.scale(p.s, p.s);
    for (let y = py; y < by; y += 12) for (let x = px; x < px + pw; x += 12) { R(x, y, Math.min(12, px + pw - x), 1, '#b8d4dc'); R(x, y, 1, Math.min(12, by - y), '#b8d4dc'); }
    R(px, by, pw, 20, '#8a5a34'); R(px, by, pw, 3, '#b07a48'); R(px, by + 3, pw, 1, '#6b4226');
    // a torneira de pressão
    const gx = Math.round(px + pw * 0.44), gh = clamp(ph - 62, 44, 84), gw = Math.round(gh * 0.5), gt = by - gh;
    const tx = gx + gw / 2 - 3, ty = Math.max(py + 14, gt - 30);
    if (this.state === 'logo') {                // o logótipo da casa, em grande, antes de começar
      const [lw, lh] = logoTam(true);
      logo(ctx, R, px + Math.round((pw - lw) / 2), py + Math.max(3, Math.round((ph - lh) / 2)), true);
      ctx.restore();
      return;
    }
    // ... e depois em pequeno, na parede, à esquerda da torneira (se couber)
    const livre = tx - 18 - px, [lw] = logoTam(false);
    if (gt >= 42 && livre >= lw + 3) logo(ctx, R, px + Math.max(2, Math.round((livre - lw) / 2)), py + 10, false);
    R(tx - 14, ty - 1, 12, by - ty + 1, INK); R(tx - 13, ty, 10, by - ty, '#c9c9d8'); R(tx - 11, ty, 3, by - ty, '#f2f2f7');
    R(tx - 14, ty + 5, 22, 8, INK); R(tx - 13, ty + 6, 20, 6, '#c9c9d8'); R(tx + 1, ty + 12, 6, 6, INK); R(tx + 2, ty + 12, 4, 5, '#8a8794');
    const hx = this.pour ? 9 : 0;
    R(tx - 3 + hx, ty - 12 + (hx ? 4 : 0), 6, 14, INK); R(tx - 2 + hx, ty - 11 + (hx ? 4 : 0), 4, 12, '#a8324a');     // o manípulo
    // o copo, a cerveja e a espuma
    const T = Math.min(this.T, 1), lh = Math.round(T * (gh - 6)), fh = lh ? Math.max(3, Math.round(lh * 0.2)) : 0;
    if (this.pour) R(tx + 3, ty + 17, 2, by - 4 - lh - (ty + 17), '#f2b632');
    R(gx - 2, gt - 1, gw + 4, gh + 1, INK); R(gx, gt, gw, gh - 2, '#eef6f8'); R(gx + 2, gt, 2, gh - 4, '#ffffff');
    if (lh) {
      R(gx, by - 3 - lh, gw, lh, '#f2b632'); R(gx + gw - 4, by - 3 - lh, 4, lh, '#d8961e');
      for (let i = 0; i < 5; i++) { const yy = (t * 30 + i * 17) % Math.max(1, lh - fh); R(gx + 4 + i * ((gw - 8) / 5), by - 4 - yy, 1, 1, '#fff3c0'); }
      R(gx, by - 3 - lh, gw, fh, '#ffffff'); R(gx, by - 3 - lh + fh - 1, gw, 1, '#f6e6b0');
    }
    if (this.T > 1 || this.res === 'cheia') { R(gx - 3, gt - 3, gw + 6, 4, '#ffffff'); R(gx - 3, gt, 2, 16, '#ffffff'); R(gx + gw + 1, gt, 2, 24, '#ffffff'); R(gx - 8, by - 2, gw + 16, 2, '#f6e6b0'); }
    // a marca verde (onde a espuma deve chegar)
    const [a, b] = this.zone(), za = by - 3 - Math.round(a * (gh - 6)), zb = by - 3 - Math.round(b * (gh - 6));
    R(gx + gw + 4, zb - 1, 9, za - zb + 2, INK); R(gx + gw + 5, zb, 7, za - zb, '#5cf08a');
    R(gx + gw + 1, zb, 3, 1, '#2f8a4a'); R(gx + gw + 1, za - 1, 3, 1, '#2f8a4a');
    R(gx - 13, zb - 1, 9, za - zb + 2, INK); R(gx - 12, zb, 7, za - zb, '#5cf08a');
    // tabuleiro com as que já estão tiradas
    const bx = px + pw - 6, sy = py + 34;
    R(bx - this.max * 9 - 3, sy, this.max * 9 + 5, 3, INK); R(bx - this.max * 9 - 2, sy, this.max * 9 + 3, 2, '#b07a48');     // prateleira
    for (let i = 0; i < this.max; i++) {
      const x = bx - i * 9, done = i < this.n;
      R(x - 6, sy - 12, 7, 12, done ? INK : '#b8d4dc');
      if (done) { R(x - 5, sy - 8, 5, 7, '#f2b632'); R(x - 5, sy - 11, 5, 3, '#ffffff'); }
    }
    text(ctx, (this.n + (this.state === 'res' ? 1 : 0)) + '/' + this.max, px + 5, by + 8, '#f6e6c8');
    if (this.state === 'res') text(ctx, this.res === 'ok' ? 'PERFEITA!' : this.res === 'cheia' ? 'ENTORNOU!' : 'CURTA...', px + pw - 5, py + 5, this.res === 'ok' ? '#2f8a4a' : '#c0392b', { align: 'right' });
    ctx.restore();
  }

  bot(I) {
    if (this.over || this.state !== 'fill' || this.st < 0.3) return;
    const [a] = this.zone();
    if (this.T < a + 0.07) I.action = true;
  }
}

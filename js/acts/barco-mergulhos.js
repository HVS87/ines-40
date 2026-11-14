// Ancorados numa enseada: mergulhos da popa. Uma boia anda de um lado para o outro na água;
// tocar faz saltar quem está na plataforma, e o mergulho é «em cheio» se a boia estiver na
// marca quando ele cair (é preciso tocar um bocadinho antes). Entre mergulhos, o Pi e o Carlos
// discutem quem é o comandante. Nunca se perde: um mergulho ao lado é só um chapão.
//   { act: Mergulhos, hearts: 4, divers: ['ines', 'mi', ...], lines: ['Pi: «...»', ...] }
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, GOLD, clamp, lerp, person, text } from '../draw.js';
import { tom } from './pesca.js';
import { enseada, lancha } from './barco-cenario.js';

const VOO = 0.55, RAIO = 34, CERTO = 14;
const NOMES = { ines: 'Inês', mi: 'Mi', leal: 'Leal', lourenco: 'Lourenço' };
const VEZ = { ines: 'da Inês', mi: 'da Mi', leal: 'do Leal', lourenco: 'do Lourenço' };
const FALAS = [
  'Carlos: «Âncora no fundo. Ordens do comandante!»',
  'Pi: «Qual comandante? O barco é alugado!»',
  'Carlos: «Pois é. Mas quem tem a carta de marinheiro sou eu.»',
  'Pi: «Está bem, está bem... Às ordens, comandante Carlos!»',
  'Inês: «Quem manda é quem traz o almoço. Que dia em grande!»',
];

export class Mergulhos extends Act {
  get max() { return this.cfg.hearts || 4; }

  start() {
    this.fila = this.cfg.divers || ['ines', 'mi', 'leal', 'lourenco', 'ines'];
    this.falas = this.cfg.lines || FALAS;
    this.f = {};
    for (const w of ['ines', 'mi', 'leal', 'lourenco']) this.f[w] = getCharacter(w, 'praia');
    this.f.pi = getCharacter('pi', 'casual'); this.f.carlos = getCharacter('carlos', 'casual');
    this.n = -1; this.rp = 0; this.fala = '';
    this.seguinte();
  }

  seguinte() {
    this.n++;
    if (this.n >= this.fila.length) { this.ph = 'fim'; this.pt = 0; this.sfx('win'); this.hint(this.cfg.fim || 'Mergulhos, almoço a bordo e conversa até ao pôr do sol.'); return; }
    this.ph = 'espera'; this.pt = 0; this.vel = 30 + (this.n % 3) * 5;
    this.hint(`É a vez ${VEZ[this.fila[this.n]] || 'de mais um'}! Toca para mergulhar quando a boia estiver quase na marca.`);
  }

  // posição da boia (onda triangular à volta da marca)
  boiaX(g, rp) { const k = ((rp / (RAIO * 4)) % 1 + 1) % 1; return g.lx + RAIO * (k < 0.5 ? 4 * k - 1 : 3 - 4 * k); }

  geo(v) {
    const top = this.top(v), wl = Math.round(Math.max(top + 62, v.h * (v.portrait ? 0.4 : 0.5)));
    const xs = Math.round(Math.min(v.w * 0.04 + 150, v.w * 0.5));      // a popa (o barco está virado para a esquerda)
    return { wl, xs, px: xs + 7, lx: xs + 56 };
  }

  update(dt, I, v) {
    this.pt += dt;
    const g = this.geo(v);
    if (this.ph !== 'agua' && this.ph !== 'fim') this.rp += this.vel * dt;
    if (this.ph === 'espera') {
      if ((I.actionPressed && this.pt > 0.3) || this.pt > 9) { this.ph = 'voo'; this.pt = 0; this.sfx('jump'); }
    } else if (this.ph === 'voo') {
      if (this.pt >= VOO) {
        this.ok = Math.abs(this.boiaX(g, this.rp) - g.lx) <= CERTO;
        this.ph = 'agua'; this.pt = 0;
        this.fx.burst(g.lx, g.wl, this.ok ? 14 : 26, ['#ffffff', '#cfefff', '#8fd8e8'], this.ok ? 60 : 110);
        if (this.ok) { this.sfx('catchWin'); this.heart(1, g.lx, g.wl - 20); } else this.sfx('pop');
        this.fala = this.falas[this.n % this.falas.length] || '';
        this.hint(this.fala);
      }
    } else if (this.ph === 'agua') {
      if (this.pt > 2.6) this.seguinte();
    } else if (this.pt > 2.4) this.done();
  }

  draw(ctx, v, R) {
    const g = this.geo(v), t = this.t, wl = g.wl, quem = this.fila[Math.min(this.n, this.fila.length - 1)];
    enseada(ctx, v, R, t, wl);
    const n = 8, H = v.h - wl;
    for (let i = 0; i < n; i++) R(0, wl + Math.floor((i * H) / n), v.w, Math.ceil(H / n) + 1, tom('#5fd8d0', '#1f7a9a', i / (n - 1)));
    for (let i = 0; i < 14; i++) R((i * 53 + Math.sin(t + i) * 6 + 400) % (v.w + 20) - 10, wl + 3 + ((i * 17) % Math.max(8, H - 8)), 8, 1, '#bff4ee');
    // o barco (espelhado: a proa para a esquerda) e quem fica a bordo
    const bob = Math.round(Math.sin(t * 1.5) * 1), fy = wl - 6 + bob, len = 150;
    const espelho = (part) => { ctx.save(); ctx.translate(g.xs, 0); ctx.scale(-1, 1); lancha(R, 0, wl + bob, len, 2, part); ctx.restore(); };
    espelho('tras');
    const falador = (/^([^:«]{1,24}):/.exec(this.ph === 'agua' ? this.fala : '') || [])[1] || '';
    const bordo = [['pi', 'Pi', 46], ['carlos', 'Carlos', 74]].concat(['lourenco', 'leal', 'mi', 'ines'].filter((w) => w !== quem || this.ph === 'fim').map((w, i) => [w, NOMES[w], 22 + i * 30 + (i > 0 ? 44 : 0)]));
    for (const [w, nome, dx] of bordo.sort((a, b) => b[2] - a[2])) {
      const hop = nome === falador || this.ph === 'fim' ? Math.round(Math.abs(Math.sin(t * 7 + dx)) * 3) : 0;
      person(ctx, this.f[w], g.xs - dx, fy, { scale: 2, face: w === 'pi' ? -1 : 1, hop });
    }
    espelho('frente');
    // plataforma de banho, à popa
    R(g.xs - 2, wl - 5 + bob, 18, 4, INK); R(g.xs - 1, wl - 4 + bob, 16, 2, '#c98f52');
    for (let i = 0; i < 8; i++) R(g.xs - 160 + i * 22 + Math.sin(t * 2 + i) * 2, wl + (i % 2), 9, 1, '#ffffff');

    // a marca onde se cai e a boia
    const bx = Math.round(this.boiaX(g, this.rp)), by = wl + 5 + Math.round(Math.sin(t * 3) * 1);
    for (const s of [-1, 1]) { R(g.lx + s * 17 - 2, wl - 9, 5, 10, INK); R(g.lx + s * 17 - 1, wl - 8, 3, 8, GOLD); R(g.lx + s * 17 - 1, wl - 5, 3, 2, '#e0182a'); }
    if (this.ph === 'espera') for (let i = 1; i < 8; i++) { const k = i / 8; R(lerp(g.px + 4, g.lx, k), wl - 12 - Math.sin(Math.PI * k) * 30, 2, 2, Math.floor(t * 4 + i) % 2 ? '#ffffff' : '#cfefff'); }
    const anel = (frente) => {
      const y = by + (frente ? 0 : -4);
      R(bx - 14, y - 1, 28, 6, INK); R(bx - 13, y, 26, 4, '#ff7a2a'); R(bx - 13, y, 6, 4, '#ffffff'); R(bx - 3, y, 6, 4, '#ffffff'); R(bx + 7, y, 6, 4, '#ffffff');
      if (!frente) R(bx - 9, y + 3, 18, 2, '#2f9aa8');
    };
    anel(false);
    // quem mergulha
    const img = this.f[quem].stand.r;
    if (this.ph === 'espera') person(ctx, this.f[quem], g.px, wl - 4 + bob, { scale: 2, face: 1, hop: Math.round(Math.abs(Math.sin(t * 6)) * 2) });
    else if (this.ph === 'voo') {
      const k = clamp(this.pt / VOO, 0, 1), x = lerp(g.px + 4, g.lx, k), y = wl - 26 - Math.sin(Math.PI * k) * 30 + k * 22;
      ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(k * 2.9); ctx.drawImage(img, -16, -24, 32, 48); ctx.restore();
    } else if (this.ph === 'agua' && this.pt > 0.5) {
      const x = this.ok ? bx : g.lx, y = wl - 15 + Math.round(Math.sin(t * 4) * 1);
      ctx.drawImage(img, 0, 0, 16, 14, x - 16, y - 10, 32, 28);                                    // só a cabeça de fora
      R(x - 12, wl + 3, 24, 1, '#ffffff');
    }
    anel(true);
    if (this.ph === 'agua' && this.pt < 1.5) text(ctx, this.ok ? 'EM CHEIO!' : 'CHAPÃO!', clamp(g.lx, 44, v.w - 44), wl - 46, this.ok ? GOLD : '#ffffff', { scale: 2, align: 'center', shadow: INK });
  }

  bot(I, v) {
    if (this.ph !== 'espera' || this.pt < 0.5) return;
    const g = this.geo(v);
    if (Math.abs(this.boiaX(g, this.rp + this.vel * VOO) - g.lx) < 3) I.actionPressed = true;
  }
}

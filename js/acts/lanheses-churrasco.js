// Nível 21 «Lanheses», ato 2: o churrasco do Lourenço. Seis postas de carne barrosã na grelha,
// cada uma com o seu tempo. Toca-se na posta que está no ponto (barra no verde) para a servir
// — ou, no teclado, escolhe-se com as setas e serve-se com Espaço. Crua não sai da grelha;
// se passar do ponto, queima-se. Cada posta no ponto vale um coração (até ao máximo do ato).
import { Act } from './base.js';
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, clamp, lerp, mix, person, text } from '../draw.js';
import { ceu, casaGranito, latada } from './lanheses-comum.js';

// põe: quando vai para a grelha · pronto: quando fica no ponto (segundos desde o início)
const POSTAS = [
  { poe: 0.6, pronto: 9.5 }, { poe: 0.9, pronto: 4.5 }, { poe: 1.2, pronto: 15 },
  { poe: 1.5, pronto: 7 }, { poe: 1.8, pronto: 17.5 }, { poe: 2.1, pronto: 12 },
];
const JANELA = 2.4, QUEIMA = 1.1;    // tempo no ponto; tempo a arder antes de sair da grelha
const FAMILIA = [['tiafatima', 'hoje'], ['tio', 'hoje'], ['ines', 'casual'], ['lourenco', 'grelha'], ['irmao', 'casual'], ['irma1', 'casual'], ['irma2', 'casual']];
const DICA = 'Toca na posta que está no ponto, com a barra no verde (ou usa as setas e Espaço)!';

export class Churrasco extends Act {
  get max() { return this.cfg.hearts || 5; }

  start() {
    this.T = 0;
    this.p = POSTAS.map((q) => ({ ...q, est: 'espera', ft: 0 }));   // espera → grelha → servida | queimada → fora
    this.cur = 0; this.tec = false; this.prev = {};
    this.boas = 0; this.prato = 0; this.voa = [];
    this.salta = FAMILIA.map(() => 0); this.tem = FAMILIA.map(() => false);
    this.over = 0;
    this.gente = FAMILIA.map(([who, outfit]) => getCharacter(who, outfit));
    this.hint(DICA);
  }

  lay(v) {
    const P = v.portrait, top = this.top(v), cols = P ? 3 : 6, rows = 6 / cols;
    const cw = P ? Math.min(66, Math.floor((v.w - 36) / 3)) : Math.min(46, Math.floor((v.w - 36) / 6)), ch = P ? 50 : 32;
    const gw = cols * cw + 8, gh = rows * ch + 6;
    const gx = Math.round((v.w - gw) / 2), gyy = P ? Math.round(v.h * 0.5) : v.h - gh - 16;
    const cel = [0, 1, 2, 3, 4, 5].map((i) => ({ x: gx + 4 + (i % cols) * cw, y: gyy + 3 + Math.floor(i / cols) * ch, w: cw, h: ch }));
    const px = FAMILIA.map((_, k) => Math.round(v.w * (0.5 + (k - 3) * (P ? 0.136 : 0.125))));
    return { top, cols, rows, cw, ch, gx, gw, gh, gyy, cel, px, pw: cw - (P ? 18 : 12), ph: P ? 22 : 15 };
  }

  estado(q) {            // 0–1 cru → no ponto → queimado
    const dur = q.pronto - q.poe, e = this.T - q.poe;
    return { e, dur, ponto: e >= dur && e <= dur + JANELA, cru: e < dur };
  }

  servir(i, L) {
    const q = this.p[i];
    if (!q || q.est !== 'grelha') return;
    const s = this.estado(q), c = L.cel[i], cx = c.x + c.w / 2, cy = c.y + c.h / 2 - 2;
    if (s.cru) { this.sfx('toc'); this.hint('Lourenço: «Calma, essa ainda está crua!»'); this.aviso = 1.6; return; }
    q.est = 'servida'; q.ft = 0;
    // a posta voa para o prato de alguém da família
    let k = this.prato % FAMILIA.length; if (k === 3) k = (this.prato = this.prato + 1) % FAMILIA.length;
    this.prato++;
    this.voa.push({ x0: cx, y0: cy, k, t: 0 });
    this.boas++;
    if (!this.heart(1, cx, cy - 8)) this.sfx('check');
    this.hint(['Lourenço: «No ponto! Quem quer?»', 'Tia Fátima: «Ai que cheirinho...»', 'Lourenço: «Barrosã, da melhor!»', 'Inês: «Essa é para mim!»', 'Lourenço: «Mais uma a sair!»', 'Lourenço: «E a última, para repetir!»'][Math.min(this.boas - 1, 5)]);
    this.aviso = 1.8;
  }

  update(dt, I, v) {
    const L = this.lay(v);
    if (this.over) { this.over += dt; if (this.over > 2.6) this.done(); return; }
    this.T += dt;
    if (this.aviso > 0) { this.aviso -= dt; if (this.aviso <= 0) this.hint(DICA); }
    this.salta = this.salta.map((s) => Math.max(0, s - dt));
    for (const f of this.voa) { f.t += dt; if (f.t >= 0.5 && !f.fim) { f.fim = true; this.salta[f.k] = 0.6; this.tem[f.k] = true; this.sfx('pop'); } }
    this.voa = this.voa.filter((f) => f.t < 0.5);
    this.p.forEach((q, i) => {
      q.ft += dt;
      if (q.est === 'espera' && this.T >= q.poe) { q.est = 'grelha'; q.ft = 0; this.sfx('slurp'); }
      else if (q.est === 'grelha') {
        const s = this.estado(q);
        if (s.e > s.dur + JANELA) { q.est = 'queimada'; q.ft = 0; this.sfx('buzz'); this.hint('Lourenço: «Ups, essa passou do ponto...»'); this.aviso = 1.8; }
        else if (Math.random() < dt * 3) { const c = L.cel[i]; this.fx.add({ x: c.x + c.w / 2 + (Math.random() - 0.5) * 12, y: c.y + 6, vx: (Math.random() - 0.5) * 6, vy: -16, life: 0.9, color: 'rgba(240,240,240,0.5)', size: 2 }); }
      } else if (q.est === 'queimada' && q.ft > QUEIMA) { q.est = 'fora'; }
    });
    // escolher: tocar numa posta, ou cursor com as setas + Espaço
    const novo = (k) => I[k] && !this.prev[k];
    if (I.left || I.right || I.up || I.down) this.tec = true;
    if (novo('left')) this.cur = (this.cur + 5) % 6;
    if (novo('right')) this.cur = (this.cur + 1) % 6;
    if ((novo('up') || novo('down')) && L.rows > 1) this.cur = (this.cur + L.cols) % 6;
    if (I.actionPressed) {
      if (I.pointerX >= 0) {
        const px = I.pointerX * v.w, py = I.pointerY * v.h;
        const i = L.cel.findIndex((c) => px >= c.x && px < c.x + c.w && py >= c.y - 4 && py < c.y + c.h + 2);
        if (i >= 0) { this.tec = false; this.servir(i, L); }
      } else { this.tec = true; this.servir(this.cur, L); }
    }
    this.prev = { left: I.left, right: I.right, up: I.up, down: I.down };
    if (this.p.every((q) => q.est === 'servida' || q.est === 'fora') && !this.voa.length) {
      this.over = 0.01; this.sfx('win');
      this.hint(this.boas >= 4 ? 'Lourenço: «Carne barrosã no ponto! Todos para a mesa!»' : 'Lourenço: «O que interessa é a companhia... Todos para a mesa!»');
    }
  }

  posta(R, c, L, q, t) {
    const s = this.estado(q), cx = Math.round(c.x + c.w / 2), cy = Math.round(c.y + c.h / 2 - 3), w = L.pw, h = L.ph;
    const queimada = q.est === 'queimada';
    const f = clamp(s.e / s.dur, 0, 1);
    const cor = queimada ? '#2a2024' : s.cru ? mix('#d8485a', '#a85a34', f) : '#8a4a26';
    const x = cx - w / 2, y = cy - h / 2;
    R(x - 1, y, w + 2, h, INK); R(x, y - 1, w, h + 2, INK);
    R(x, y, w, h, cor); R(x + 1, y, w - 2, 2, queimada ? '#3a3034' : s.cru ? mix('#fff0e0', '#f0c890', f) : '#f2c060');
    if (f > 0.45) for (let k = 3; k < w - 2; k += 5) R(x + k, y + 3, 2, h - 5, queimada ? '#120c10' : '#5a2f1a');
    if (s.ponto && q.est === 'grelha') {
      // no ponto: contorno dourado a piscar e brilhos
      const on = Math.floor(t * 6) % 2;
      R(x - 3, y - 3, w + 6, 1, on ? GOLD : PAPER); R(x - 3, y + h + 2, w + 6, 1, on ? GOLD : PAPER); R(x - 3, y - 3, 1, h + 6, on ? GOLD : PAPER); R(x + w + 2, y - 3, 1, h + 6, on ? GOLD : PAPER);
    }
    // barra do ponto: cru | verde | queimado
    const bw = w + 4, bx = cx - bw / 2, by = y + h + (L.rows > 1 ? 6 : 4), tot = s.dur + JANELA + 0.8;
    R(bx - 1, by - 1, bw + 2, 5, INK); R(bx, by, bw, 3, '#b8485a');
    R(bx + (s.dur / tot) * bw, by, (JANELA / tot) * bw, 3, '#5cf08a'); R(bx + ((s.dur + JANELA) / tot) * bw, by, bw - ((s.dur + JANELA) / tot) * bw, 3, '#3a3034');
    R(bx + clamp(s.e / tot, 0, 1) * (bw - 2), by - 2, 2, 7, PAPER);
  }

  draw(ctx, v, R) {
    const L = this.lay(v), t = this.t, w = v.w, chao = L.gyy + 8;
    ceu(ctx, v, R, chao);
    R(0, chao, w, v.h - chao, '#7fae5a'); R(0, chao, w, 2, '#9fce72');
    // ao fundo: a casa de granito e a latada por cima de todos
    const alt = clamp(chao - L.top - 6, 40, v.portrait ? 92 : 70);
    casaGranito(ctx, R, Math.round(w * 0.04), chao, Math.round(w * (v.portrait ? 0.5 : 0.3)), Math.min(alt + 6, 76));
    latada(R, 10, w - 10, chao, alt);
    // a família em fila atrás da grelha, de prato na mão; o Lourenço ao centro, de pinça
    FAMILIA.forEach((_, k) => {
      const x = L.px[k], hop = this.salta[k] > 0 ? Math.round(Math.abs(Math.sin(this.salta[k] * 12)) * 4) : (this.over ? Math.round(Math.abs(Math.sin(t * 7 + k)) * 2) : 0);
      person(ctx, this.gente[k], x, L.gyy + 6, { scale: 2, face: k < 3 ? 1 : k === 3 ? (Math.floor(t / 2) % 2 ? 1 : -1) : -1, hop });
      if (k !== 3) {
        const py = L.gyy - 12 - hop;
        R(x - 8, py, 16, 4, INK); R(x - 7, py + 1, 14, 2, PAPER);
        if (this.tem[k]) { R(x - 5, py - 3, 10, 4, INK); R(x - 4, py - 2, 8, 2, '#8a4a26'); }
      } else { R(x + 9, L.gyy - 20, 2, 14, INK); R(x + 12, L.gyy - 20, 2, 14, INK); R(x + 9, L.gyy - 22, 5, 3, '#c9c9d8'); }
    });
    // a grelha
    R(L.gx - 3, L.gyy - 2, L.gw + 6, L.gh + 5, INK); R(L.gx - 2, L.gyy - 1, L.gw + 4, L.gh + 3, '#4a4458');
    R(L.gx, L.gyy + 1, L.gw, L.gh - 1, '#2a1a1c');
    for (let k = 0; k < 26; k++) { const bx = L.gx + 3 + Math.round(((k * 53) % 97) / 97 * (L.gw - 8)), by = L.gyy + 3 + ((k * 31) % (L.gh - 6)); R(bx, by, 3, 2, (k + Math.floor(t * 4)) % 3 ? '#e0572f' : '#ffb040'); }
    for (let y = L.gyy + 4; y < L.gyy + L.gh - 1; y += 5) R(L.gx, y, L.gw, 1, '#8a8aa0');
    if (v.h - (L.gyy + L.gh + 3) > 4) { const lh = Math.min(38, v.h - L.gyy - L.gh - 3); R(L.gx + 6, L.gyy + L.gh + 3, 4, lh, INK); R(L.gx + L.gw - 10, L.gyy + L.gh + 3, 4, lh, INK); if (lh >= 38) { R(L.gx + 2, L.gyy + L.gh + 3 + lh, 12, 3, INK); R(L.gx + L.gw - 14, L.gyy + L.gh + 3 + lh, 12, 3, INK); R(L.gx + 10, L.gyy + L.gh + 22, L.gw - 20, 3, INK); } }
    this.p.forEach((q, i) => {
      const c = L.cel[i];
      if (q.est === 'grelha' || q.est === 'queimada') this.posta(R, c, L, q, t);
      if (q.est === 'queimada') for (let k = 0; k < 3; k++) { const pz = (t * 1.2 + k / 3) % 1; R(c.x + c.w / 2 - 4 + k * 4, c.y + 4 - Math.round(pz * 16), 3, 3, `rgba(60,50,60,${(0.7 * (1 - pz)).toFixed(2)})`); }
      if (this.tec && this.cur === i && !this.over) {
        for (const [cx, cy, dx, dy] of [[c.x + 1, c.y, 1, 1], [c.x + c.w - 2, c.y, -1, 1], [c.x + 1, c.y + c.h - 3, 1, -1], [c.x + c.w - 2, c.y + c.h - 3, -1, -1]]) { R(dx > 0 ? cx : cx - 4, cy, 5, 1, PAPER); R(cx, dy > 0 ? cy : cy - 4, 1, 5, PAPER); }
      }
    });
    // postas a caminho dos pratos
    for (const f of this.voa) {
      const p = f.t / 0.5, x = lerp(f.x0, L.px[f.k], p), y = lerp(f.y0, L.gyy - 14, p) - Math.sin(p * Math.PI) * 18;
      R(x - 6, y - 3, 12, 6, INK); R(x - 5, y - 2, 10, 4, '#8a4a26'); R(x - 4, y - 2, 8, 1, '#f2c060');
    }
    if (this.over) text(ctx, 'BOM APETITE!', w / 2, L.gyy + L.gh / 2 - 5, GOLD, { align: 'center', scale: 2, shadow: INK });
  }

  bot(I, v) {
    if (this.over) return;
    const L = this.lay(v);
    const i = this.p.findIndex((q) => q.est === 'grelha' && this.estado(q).ponto && this.estado(q).e - this.estado(q).dur > 0.35);
    if (i < 0) return;
    const c = L.cel[i];
    I.pointerX = (c.x + c.w / 2) / v.w; I.pointerY = (c.y + c.h / 2) / v.h; I.actionPressed = true;
  }
}

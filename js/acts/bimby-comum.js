// Desenhos comuns aos níveis da Bimby (11) e dos eventos da Vorwerk (17): a máquina, o copo de
// inox, a cozinha do escritório, a prova das colegas e um «guarda-fundos» (para desenhar os
// cenários mais pesados uma só vez por tamanho de ecrã).
import { INK, PAPER, mkR, text, sign, disc } from '../draw.js';

export const VERDE = '#3f9f6a', INOX = '#c9ced6', INOX_L = '#eef1f5', INOX_D = '#8a93a7';

// Devolve um canvas com o fundo pintado por `paint(g, R)`; só volta a pintar se o ecrã mudar.
export function cached(act, key, v, paint) {
  const k = `${key}:${v.w}x${v.h}`;
  if (!act.bgCache || act.bgCache.k !== k) {
    const c = document.createElement('canvas');
    c.width = v.w;
    c.height = v.h;
    const g = c.getContext('2d');
    paint(g, mkR(g));
    act.bgCache = { k, c };
  }
  return act.bgCache.c;
}

// Caixa com contorno escuro.
export const box = (R, x, y, w, h, c) => { R(x - 1, y - 1, w + 2, h + 2, INK); R(x, y, w, h, c); };

// O copo de inox (base em by). o: { lid: false = aberto, handle: com pega, fill: n.º de ingredientes }
export function copo(R, cx, by, u, o = {}) {
  const w = 16 * u, h = 12 * u, x = cx - w / 2, y = by - h;
  if (o.handle) { R(x + w, y + 2 * u, 3 * u + 1, u + 1, INK); R(x + w + 2 * u, y + 2 * u, u + 1, 8 * u, INK); R(x + w, y + 9 * u, 3 * u + 1, u + 1, INK); }
  box(R, x, y, w, h, INOX);
  R(x + u, y, 2 * u, h, INOX_L);
  R(x + w - 3 * u, y, 3 * u, h, INOX_D);
  R(x, y + h - 3 * u, w, u, INOX_D);
  if (o.lid === false) R(x + u, y, w - 2 * u, 2 * u, '#5a6072');
  else {
    box(R, x - u, y - 2 * u, w + 2 * u, 2 * u, '#3a3f55');
    box(R, cx - 2.5 * u, y - 5 * u, 5 * u, 3 * u, '#b8c8dc');
    R(cx - 1.5 * u, y - 5 * u, u, 3 * u, '#e6eef8');
  }
}

// A Bimby: corpo branco, ecrã, roda, logótipo verde e o copo de inox (base em by; 26u x 28u).
// o: { cup: false = sem copo, screen: texto no ecrã, color, shake, knob: ângulo da roda, lid }
export function bimby(ctx, R, cx, by, u, o = {}) {
  const bw = 26 * u, bh = 12 * u, x = cx - bw / 2, y = by - bh;
  // os braços brancos que abraçam o copo
  box(R, x + u, y - 7 * u, 4 * u, 8 * u, '#ffffff');
  box(R, x + bw - 5 * u, y - 7 * u, 4 * u, 8 * u, '#ffffff');
  R(x + 4 * u, y - 7 * u, u, 7 * u, '#d8dce6');
  R(x + bw - 5 * u, y - 7 * u, u, 7 * u, '#d8dce6');
  if (o.cup !== false) copo(R, cx + (o.shake || 0), y + u, u, { lid: o.lid });
  // o corpo
  box(R, x, y, bw, bh, '#ffffff');
  R(x, by - 2 * u, bw, 2 * u, '#d8dce6');
  R(x, y, bw, u, '#f1f3f7');
  // o ecrã
  box(R, x + 2 * u, y + 2 * u, 14 * u, 7 * u, '#17323a');
  if (o.screen) {
    const ts = Math.max(1, Math.min(2, Math.floor((14 * u - 4) / 23)));
    text(ctx, o.screen, x + 9 * u, y + 2 * u + (7 * u - 5 * ts) / 2, o.color || '#9af0c0', { align: 'center', scale: ts });
  }
  // a roda
  const kx = Math.round(x + 21 * u), ky = Math.round(y + 5.5 * u), kr = Math.round(2.5 * u);
  disc(ctx, kx, ky, kr + 1, INK);
  disc(ctx, kx, ky, kr, INOX);
  disc(ctx, kx, ky, Math.max(1, kr - u), INOX_L);
  const a = o.knob === undefined ? -1.2 : o.knob;
  R(kx + Math.cos(a) * (kr - 1) - u / 2, ky + Math.sin(a) * (kr - 1) - u / 2, u, u, VERDE);
  // o logótipo verde
  R(x + 2 * u, by - 2 * u + Math.floor(u / 2), 5 * u, Math.max(1, u - 1), VERDE);
}

// Vapor a subir a partir de (cx, y).
export function vapor(R, cx, y, t, n = 5) {
  for (let i = 0; i < n; i++) {
    const f = (t * 0.55 + i / n) % 1, s = 2 + Math.round(f * 4);
    R(cx + Math.sin(i * 2.3 + t * 2.2) * (3 + f * 5) - s / 2, y - f * 26 - s, s, s, `rgba(255,255,255,${(0.85 * (1 - f)).toFixed(2)})`);
  }
}

// Um quadro com um prato (decoração da parede).
function quadro(g, R, x, y, cor) {
  box(R, x, y, 34, 40, PAPER);
  R(x, y, 34, 3, VERDE);
  disc(g, x + 17, y + 22, 11, '#d8dce6');
  disc(g, x + 17, y + 22, 9, '#ffffff');
  disc(g, x + 17, y + 22, 6, cor);
  R(x + 14, y + 19, 3, 2, 'rgba(255,255,255,0.5)');
}

// A cozinha do escritório da Vorwerk: parede, azulejos, janela, prateleiras, letreiro e chão
// (sem a bancada, que se desenha à parte para poder haver gente atrás dela).
export function cozinha(g, R, v, top, gy, o = {}) {
  const w = v.w, ty = gy - 62, wy = ty - 40;
  R(0, 0, w, v.h, '#f6efe0');
  for (let x = 0; x < w; x += 16) R(x, 0, 8, ty, '#f2e8d4');
  // azulejos por cima da bancada, com um friso verde
  R(0, ty, w, 62, '#ffffff');
  for (let x = 5; x < w; x += 12) R(x, ty, 1, 40, '#dfe9e4');
  for (let y = ty + 11; y < gy - 24; y += 12) R(0, y, w, 1, '#dfe9e4');
  R(0, ty - 3, w, 3, VERDE);
  if (o.letreiro !== false) sign(g, 'BIMBY', w / 2, top + 4, { scale: 2, bg: '#ffffff', color: VERDE, border: VERDE });
  // a janela
  if (wy > top) {
    box(R, 10, wy, 44, 30, '#8fd0f5');
    R(10, wy + 19, 44, 11, '#c4e8fa');
    R(16, wy + 6, 12, 3, '#ffffff'); R(20, wy + 4, 6, 2, '#ffffff'); R(36, wy + 11, 10, 3, '#ffffff');
    R(31, wy, 2, 30, '#ffffff'); R(10, wy + 14, 44, 2, '#ffffff');
    box(R, 8, wy + 30, 48, 3, '#ffffff');
    // as prateleiras: frascos e livros de receitas
    const x0 = w - 70;
    if (o.prateleiras !== false) for (let i = 0; i < 5; i++) { box(R, x0 + 3 + i * 12, wy + 5, 8, 9, ['#e8b878', '#c0392b', '#f4ecd8', '#7ab84a', '#e0a040'][i]); R(x0 + 3 + i * 12, wy + 5, 8, 2, '#8a5a34'); }
    if (o.prateleiras !== false) {
      box(R, x0, wy + 14, 62, 2, '#9a6a3c');
      for (let i = 0; i < 8; i++) R(x0 + 3 + i * 7, wy + 21 + (i % 3), 6, 9 - (i % 3), ['#3f9f6a', '#c0392b', '#3f6fb5', '#ffd166', '#7a3fa0'][i % 5]);
      box(R, x0, wy + 30, 62, 2, '#9a6a3c');
    }
  }
  // ao alto sobra parede: quadros com pratos
  const free = wy - (top + 28);
  if (free > 70) {
    const y = top + 28 + Math.round((free - 40) / 2);
    [0.2, 0.5, 0.8].forEach((f, i) => quadro(g, R, Math.round(w * f) - 17, y, ['#ff9a3b', '#7ab84a', '#c0392b'][i]));
  }
  // o chão
  R(0, gy, w, v.h - gy, '#cdb99a');
  for (let y = gy + 7; y < v.h; y += 9) R(0, y, w, 1, '#b8a486');
  for (let y = gy, k = 0; y < v.h; y += 9, k++) for (let x = (k % 2) * 24; x < w; x += 48) R(x, y, 1, 8, '#b8a486');
}

// A bancada, a toda a largura (tampo em gy - 24).
export function bancada(R, v, gy) {
  const by = gy - 24, w = v.w;
  R(0, by - 1, w, 1, INK);
  R(0, by, w, 4, '#e2dccf');
  R(0, by + 3, w, 1, '#b8b0a0');
  R(0, by + 4, w, 20, '#fbfbf6');
  for (let x = 4; x < w; x += 36) { R(x, by + 4, 1, 20, '#cfd2d8'); R(x + 14, by + 8, 8, 2, INOX_D); }
  R(0, gy - 3, w, 3, '#5a6072');
}

// Uma tigela de creme a fumegar (centro em x, base em y).
export function tigela(R, x, y, t) {
  R(x - 6, y - 5, 12, 5, INK); R(x - 4, y - 1, 8, 2, INK);
  R(x - 5, y - 4, 10, 3, '#ffffff'); R(x - 3, y - 1, 6, 1, '#d8dce6');
  R(x - 4, y - 4, 8, 1, '#ff9a3b');
  if (t !== undefined) vapor(R, x, y - 6, t + x, 2);
}

// ----- A prova (ato de conversa do nível 10): fundo e primeiro plano -----
export function fundoProva(ctx, v, R, t, act) {
  const top = act.top(v), gy = act.ground(v);
  ctx.drawImage(cached(act, 'prova' + top + gy, v, (g, r) => cozinha(g, r, v, top, gy)), 0, 0);
  bancada(R, v, gy);
  const bx = Math.round(v.w * 0.86);
  bimby(ctx, R, bx, gy - 24, 2, { screen: 'PRONTO', lid: false });
  vapor(R, bx, gy - 24 - 46, t, 6);
  tigela(R, Math.round(v.w * 0.08), gy - 25, t);
}

export function frenteProva(ctx, v, R, t, act) {
  const gy = act.ground(v);
  for (const p of act.people) {
    const x = Math.round(p.x * v.w) + (p.face || 1) * 11;
    tigela(R, x, gy - 20, t);
    R(x + (p.face || 1) * 3, gy - 30, 1, 6, INOX_D);   // a colher
    R(x + (p.face || 1) * 3 - 1, gy - 32, 3, 3, INOX_L);
  }
}

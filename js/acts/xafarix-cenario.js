// Cenário do Xafarix (nível 12): o bar de música ao vivo colado ao chafariz, com paredes de
// pedra, um palco pequeno onde o Mico toca guitarra e canta, mesas (onde também se dança) e o
// letreiro «XAFARIX». Serve de fundo ao jogo de ritmo, ao balcão e aos momentos de história.
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, hash, sign } from '../draw.js';

// Feixe de luz em riscas (um trapézio).
function beam(R, x0, y0, x1, y1, w0, w1, color) {
  const n = Math.max(1, Math.ceil((y1 - y0) / 2));
  for (let i = 0; i < n; i++) { const f = i / n, w = w0 + (w1 - w0) * f; R(x0 + (x1 - x0) * f - w / 2, y0 + i * 2, w, 2, color); }
}

// Parede de pedra do chafariz: blocos de calcário com juntas, mais escuros junto ao teto.
export function pedra(R, x0, y0, w, h, seed = 0) {
  R(x0, y0, w, h, '#8f8672');
  const bh = 12;
  for (let y = y0, j = 0; y < y0 + h; y += bh, j++) {
    const off = (j % 2) * 13;
    for (let x = x0 - off, i = 0; x < x0 + w; x += 26, i++) {
      const s = hash(i * 7.3 + j * 3.1 + seed);
      const c = s > 0.75 ? '#a39a84' : s > 0.4 ? '#958c78' : s > 0.15 ? '#877e6a' : '#7a725f';
      const xa = Math.max(x0, x + 1), xb = Math.min(x0 + w, x + 25), hh = Math.min(bh - 1, y0 + h - y - 1);
      if (xb > xa && hh > 0) { R(xa, y + 1, xb - xa, hh, c); R(xa, y + 1, xb - xa, 1, '#b0a790'); }
    }
  }
  R(x0, y0, w, Math.min(h, 10), 'rgba(30,20,30,0.35)');
}

// Arco de pedra com um nicho escuro e um candeeiro lá dentro.
function arco(R, cx, by, w, h, t) {
  R(cx - w / 2 - 3, by - h, w + 6, h, '#6a6252');
  R(cx - w / 2 + 2, by - h - 3, w - 4, 3, '#6a6252');
  R(cx - w / 2, by - h + 3, w, h - 3, '#2a2030'); R(cx - w / 2 + 3, by - h, w - 6, 3, '#2a2030');
  const glow = 0.25 + Math.sin(t * 5 + cx) * 0.05;
  R(cx - 5, by - h + 8, 10, 12, `rgba(255,190,90,${glow.toFixed(2)})`);
  R(cx - 2, by - h + 10, 4, 6, '#ffd166'); R(cx - 3, by - h + 9, 6, 1, INK); R(cx - 1, by - h + 4, 1, 5, '#5a5248');
}

// Mesa redonda de madeira (tampo a `th` do chão), com uma vela.
export const MESA_H = 16;
export function mesa(R, x, gy, t = 0) {
  R(x - 18, gy - MESA_H - 1, 36, 5, INK); R(x - 17, gy - MESA_H, 34, 3, '#b07a44'); R(x - 17, gy - MESA_H, 34, 1, '#d09a5c');
  R(x - 3, gy - MESA_H + 4, 6, MESA_H - 6, INK); R(x - 2, gy - MESA_H + 4, 4, MESA_H - 6, '#7a4f2a');
  R(x - 9, gy - 3, 18, 3, INK); R(x - 8, gy - 2, 16, 1, '#7a4f2a');
}

// O Mico, de guitarra, ao microfone (pés em x, gy).
export function mico(ctx, R, x, gy, t, beat = t * 2, playing = true) {
  const f = getCharacter('mico'), b = Math.floor(beat);
  const hop = playing ? Math.round(Math.max(0, 1 - (beat - b) * 3) * 1.5) : 0;
  const img = f.stand.r, y = gy - 48 - hop;
  ctx.drawImage(img, x - 16, y, 32, 48);
  // guitarra: caixa, boca, braço a apontar para cima à direita
  const gx = x - 2, gyy = y + 30;
  R(gx - 8, gyy - 1, 16, 11, INK); R(gx - 7, gyy, 14, 9, '#c8843c'); R(gx - 7, gyy, 14, 2, '#e0a45c');
  R(gx - 2, gyy + 3, 4, 4, '#3a2416');
  for (let k = 0; k < 9; k++) { R(gx + 7 + k * 2, gyy + 1 - k, 3, 4, INK); }
  for (let k = 0; k < 9; k++) { R(gx + 7 + k * 2, gyy + 2 - k, 2, 2, '#7a4f2a'); }
  R(gx + 24, gyy - 9, 5, 5, INK); R(gx + 25, gyy - 8, 3, 3, '#e0a45c');
  // mão a dedilhar
  const s = playing ? Math.round(Math.sin(beat * Math.PI * 2) * 2) : 0;
  R(gx - 1, gyy + 2 + s, 4, 4, INK); R(gx, gyy + 3 + s, 2, 2, '#f6c9a0');
  // microfone
  R(x + 15, gy - 34, 1, 34, '#3a3448'); R(x + 11, gy - 1, 9, 1, '#3a3448'); R(x + 12, gy - 37, 4, 4, INK); R(x + 13, gy - 36, 2, 2, '#c9c9d8');
  // notas de música a subir
  if (playing) {
    for (let k = 0; k < 2; k++) {
      const p = (t * 0.6 + k * 0.5) % 1, nx = x + 20 + k * 9 + Math.round(Math.sin(p * 6 + k) * 3), ny = gy - 44 - Math.round(p * 22);
      R(nx, ny, 1, 6, PAPER); R(nx - 2, ny + 5, 3, 2, PAPER); R(nx + 1, ny, 2, 1, PAPER);
    }
  }
}

// o: { gy, top, beat, pulse, playing, tables: [x...], stage: x do Mico (ou null), bar: desenha só a sala }
export function xafarixBg(ctx, v, R, t, o) {
  const { gy, top } = o, w = v.w, P = v.portrait;
  // teto de madeira e parede de pedra
  R(0, 0, w, top, '#2a1c1a');
  pedra(R, 0, Math.max(0, top - 30), w, gy - Math.max(0, top - 30), 3);
  for (let x = 6; x < w; x += 46) R(x, 0, 5, top - 28, '#3a2820');
  // arcos com candeeiros
  const ah = Math.min(P ? 84 : 56, gy - top - 34), na = P ? 2 : 3;
  for (let i = 0; i < na; i++) arco(R, Math.round(((i + 0.5) * w) / na + (P ? 0 : 0)), gy - 6, 30, ah, t);
  // quadros com fotografias de concertos (só ao alto, onde a parede é grande)
  if (P && gy - top > 150) {
    for (let i = 0; i < 3; i++) {
      const fx = Math.round(w * (0.2 + i * 0.3)) - 11, fy = top + 44 + (i % 2) * 8;
      R(fx - 1, fy - 1, 24, 20, INK); R(fx, fy, 22, 18, '#d09a5c'); R(fx + 2, fy + 2, 18, 14, ['#3a4a6a', '#5a3a4a', '#3a5a4a'][i]);
      R(fx + 8, fy + 6, 5, 5, '#f6c9a0'); R(fx + 7, fy + 11, 7, 5, PAPER); R(fx + 13, fy + 9, 6, 2, '#c8843c');
    }
  }
  // letreiro
  const sx = o.signX !== undefined ? o.signX : Math.round(w * (P ? 0.64 : 0.76));
  sign(ctx, 'XAFARIX', sx, top + 5, { scale: 2, bg: '#4a2018', color: GOLD, border: '#d09a5c' });
  // fio de luzinhas
  for (let x = 4, i = 0; x < w; x += 12, i++) {
    const y = top + 30 + Math.round(Math.sin(x * 0.045) * 3);
    R(x, y, 2, 2, (i + Math.floor(t * 2)) % 3 ? '#ffd166' : '#ff8a4b');
  }
  // rodapé e chão de tábuas
  R(0, gy - 6, w, 6, '#4a3626'); R(0, gy - 7, w, 1, INK);
  R(0, gy, w, v.h - gy, '#6a4a2e');
  for (let y = gy, j = 0; y < v.h; y += 9, j++) {
    R(0, y, w, 1, '#4a3220');
    for (let x = (j % 2) * 30 + 10; x < w; x += 60) R(x, y, 1, 9, '#4a3220');
  }
  // palco pequeno, com foco de luz, e o Mico
  if (o.stage !== null && o.stage !== undefined) {
    const mx = o.stage, sw = 76, sh = 9;
    beam(R, mx, top + 34, mx, gy - sh, 8, 60, 'rgba(255,220,150,0.16)');
    R(mx - sw / 2 - 1, gy - sh - 1, sw + 2, sh + 1, INK); R(mx - sw / 2, gy - sh, sw, sh, '#7a4f2a'); R(mx - sw / 2, gy - sh, sw, 2, '#b07a44');
    // coluna de som
    R(mx - 36, gy - sh - 20, 14, 20, INK); R(mx - 35, gy - sh - 19, 12, 18, '#2a2436'); R(mx - 32, gy - sh - 16, 6, 6, '#0d0820'); R(mx - 31, gy - sh - 8, 4, 4, '#0d0820');
    mico(ctx, R, mx + 2, gy - sh, t, o.beat === undefined ? t * 1.7 : o.beat, o.playing !== false);
  }
  // mesas
  for (const x of o.tables || []) mesa(R, x, gy, t);
}

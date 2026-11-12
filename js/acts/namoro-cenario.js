// Cenários do nível «O Namoro»: a rua ao fim da tarde (o caminho depois das aulas), a sala do
// Di Casa (toalha aos quadrados, vela, pizza e esparguete) e a porta do restaurante, à noite.
import { INK, PAPER, GOLD, hash, sky, stars, disc, sign } from '../draw.js';

const GLASS = '#34466e';

// ---------- a rua, ao fim da tarde ----------
const CASAS = ['#f2d9a0', '#e8a9a0', '#a8c8e0', '#f4f0e6', '#c9e0b8', '#f0c090'];

function casa(ctx, R, x, gy, i, fh) {
  const w = 64, floors = 2 + Math.floor(hash(i * 3.7) * 2), h = floors * fh, col = CASAS[Math.floor(hash(i * 1.3 + 2) * CASAS.length)];
  R(x, gy - h, w, h, col);
  if (hash(i * 5.1) > 0.5) {
    // fachada de azulejo
    for (let yy = gy - h + 2; yy < gy - fh; yy += 4) for (let xx = x + 2 + ((yy >> 2) & 1) * 2; xx < x + w - 2; xx += 4) R(xx, yy, 1, 1, 'rgba(60,90,150,0.35)');
  }
  R(x, gy - h, 1, h, 'rgba(43,29,46,0.25)'); R(x + w - 1, gy - h, 1, h, 'rgba(43,29,46,0.25)');
  R(x - 1, gy - h - 2, w + 2, 2, '#f4e8d2');
  R(x, gy - h - 6, w, 4, '#b5523a'); R(x, gy - h - 3, w, 1, '#8e3d2a');
  // janelas de sacada nos andares de cima
  for (let f = 1; f < floors; f++) {
    for (let k = 0; k < 3; k++) {
      const wx = x + 9 + k * 19, wy = gy - (f + 1) * fh + Math.round(fh * 0.22), wh = Math.round(fh * 0.55);
      R(wx - 1, wy - 1, 10, wh + 2, '#f4e8d2'); R(wx, wy, 8, wh, hash(i * 9 + f * 3 + k) > 0.6 ? '#ffd98a' : GLASS); R(wx + 4, wy, 1, wh, '#f4e8d2');
      R(wx - 3, wy + wh, 14, 1, INK); R(wx - 3, wy + wh - 4, 14, 1, INK);
      for (let b = -3; b <= 10; b += 2) R(wx + b, wy + wh - 4, 1, 4, INK);
    }
  }
  // rés do chão: porta e montra
  const dh = Math.round(fh * 0.8);
  R(x + 8, gy - dh, 12, dh, '#5a3a2a'); R(x + 9, gy - dh + 1, 10, dh - 1, '#7a4f34'); R(x + 17, gy - Math.round(dh / 2), 1, 2, GOLD);
  R(x + 28, gy - dh, 28, dh - 6, '#f4e8d2'); R(x + 29, gy - dh + 1, 26, dh - 8, hash(i * 2.9) > 0.5 ? '#ffe2a0' : '#5d70a0');
  R(x + 27, gy - dh - 4, 30, 4, hash(i * 4.3) > 0.5 ? '#a8324a' : '#2f7a4a');
}

function jacaranda(ctx, R, x, gy, big) {
  const th = big ? 44 : 30, r = big ? 17 : 12;
  R(x - 2, gy - th, 4, th, '#5a4030'); R(x - 1, gy - th, 1, th, '#7a5a44');
  disc(ctx, x, gy - th - r + 4, r, '#8a6ad0'); disc(ctx, x - r + 3, gy - th + 2, r - 4, '#7a5ac0'); disc(ctx, x + r - 3, gy - th + 1, r - 5, '#9c80e0');
  disc(ctx, x - 3, gy - th - r, r - 6, '#b49cf0');
  R(x - 6, gy - 2, 12, 2, '#6b5a4e');
}

function candeeiro(R, x, gy, big) {
  const h = big ? 62 : 44;
  R(x, gy - h, 2, h, INK); R(x - 3, gy - h - 6, 8, 6, INK); R(x - 2, gy - h - 5, 6, 4, '#ffe9a8'); R(x - 2, gy - 2, 6, 2, INK);
}

// O caminho depois das aulas: prédios de Lisboa, jacarandás em flor, calçada. cam = deslocamento.
export function ruaTarde(ctx, v, R, gy, cam, t) {
  const p = v.portrait, fh = p ? 34 : 21;
  sky(ctx, v.w, v.h, gy, ['#3d2f78', '#a8508a', '#f08a5a', '#ffd68a']);
  disc(ctx, Math.round(v.w * 0.78), gy - fh * 3 - (p ? 60 : 4), p ? 20 : 13, '#fff0b8');
  for (let i = Math.floor(cam / 64) - 1; i <= Math.floor((cam + v.w) / 64); i++) casa(ctx, R, i * 64 - Math.round(cam), gy - 8, i, fh);
  // passeio (calçada à portuguesa), lancil e estrada
  R(0, gy - 8, v.w, 22, '#e6dcc6');
  for (let wx = Math.floor(cam / 12) * 12; wx < cam + v.w; wx += 12) {
    const x = wx - Math.round(cam);
    R(x, gy + 4, 6, 1, '#5a5566'); R(x + 6, gy + 6, 6, 1, '#5a5566'); R(x + 2, gy + 5, 2, 1, '#5a5566'); R(x + 8, gy + 7, 2, 1, '#5a5566');
    if (hash(wx) > 0.5) R(x + 3, gy - 5, 2, 1, '#cfc3a8');
  }
  R(0, gy + 14, v.w, 3, '#b9ae98');
  R(0, gy + 17, v.w, v.h - gy - 17, '#5a5566');
  for (let wx = Math.floor(cam / 40) * 40; wx < cam + v.w; wx += 40) R(wx - Math.round(cam), gy + 17 + Math.round((v.h - gy - 17) * 0.45), 18, 2, '#8a8496');
  // árvores e candeeiros, entre os prédios e o passeio
  for (let i = Math.floor(cam / 150) - 1; i <= Math.floor((cam + v.w) / 150) + 1; i++) {
    jacaranda(ctx, R, i * 150 + 40 - Math.round(cam), gy - 6, p);
    candeeiro(R, i * 150 + 115 - Math.round(cam), gy - 6, p);
  }
}

// Uma sebe (para as amigas espreitarem por trás).
export function sebe(ctx, R, x, gy, w) {
  R(x, gy - 24, w, 24, '#2f6a3a');
  for (let i = 0; i < w; i += 6) { disc(ctx, x + i + 3, gy - 24, 4, i % 12 ? '#3f8a4a' : '#357a40'); R(x + i + 1, gy - 14 + (i % 3) * 3, 2, 1, '#4f9a5a'); }
  R(x, gy - 2, w, 2, '#255a30');
}

// ---------- o Di Casa por dentro ----------
// A sala: parede, letreiro, candeeiro; cx = centro da mesa, gy = chão, top = limite de cima.
export function sala(ctx, v, R, gy, cx, top, t) {
  R(0, 0, v.w, gy, '#f0d8a8');
  for (let y = 6; y < gy - 36; y += 9) for (let x = ((y / 9) & 1) * 9; x < v.w; x += 18) if (hash(x * 0.7 + y) > 0.72) { R(x, y, 16, 7, '#e2bf8a'); }
  // lambril de madeira e chão de tijoleira
  R(0, gy - 34, v.w, 34, '#8a4a32'); R(0, gy - 34, v.w, 2, '#b06a48');
  for (let x = 5; x < v.w; x += 14) R(x, gy - 30, 1, 30, '#733a26');
  R(0, gy, v.w, v.h - gy, '#b8623e');
  for (let y = gy, k = 0; y < v.h; y += 10, k++) for (let x = (k % 2) * 10; x < v.w; x += 20) R(x, y, 10, 10, '#a4522f');
  R(0, gy, v.w, 1, '#733a26');
  // faixa tricolor e letreiro
  const sy = top + 5;
  R(0, sy + 4, v.w, 3, '#2f7a4a'); R(0, sy + 7, v.w, 3, '#f4f0e6'); R(0, sy + 10, v.w, 3, '#c0392b');
  sign(ctx, 'DI CASA', cx, sy, { scale: 2, bg: '#2f7a4a', color: '#fff6e6' });
  // prateleira com garrafas e um quadro
  const px = Math.round(cx + 62), py = sy + 34;
  R(px - 16, py, 34, 2, '#733a26');
  for (let i = 0; i < 4; i++) { R(px - 13 + i * 8, py - 9, 4, 9, i % 2 ? '#3f6a3a' : '#7a2e3a'); R(px - 12 + i * 8, py - 12, 2, 3, i % 2 ? '#3f6a3a' : '#7a2e3a'); R(px - 13 + i * 8, py - 4, 4, 4, '#d8b070'); }
  const qx = Math.round(cx - 74);
  R(qx - 11, py - 16, 22, 18, '#733a26'); R(qx - 9, py - 14, 18, 14, '#a8d0e8'); R(qx - 9, py - 6, 18, 6, '#4f9a5a'); R(qx - 2, py - 11, 3, 6, '#f4f0e6'); R(qx - 3, py - 12, 5, 2, '#c0392b');
  // candeeiro por cima da mesa
  const ly = gy - 78;
  R(cx, sy + 13, 1, ly - sy - 13, INK);
  R(cx - 9, ly + 4, 19, 3, '#96281b'); R(cx - 7, ly, 15, 4, '#c0392b'); R(cx - 3, ly - 3, 7, 3, '#c0392b'); R(cx - 2, ly + 7, 5, 2, '#fff0b8');
}

// A mesa posta (desenha-se por cima dos dois, para parecerem sentados).
export function mesa(ctx, R, cx, gy, t) {
  const x0 = cx - 50, ty = gy - 18;
  // cadeiras (as costas veem-se atrás da toalha)
  R(x0 + 4, gy - 3, 3, 3, '#5a3a2a'); R(x0 + 93, gy - 3, 3, 3, '#5a3a2a');
  // toalha aos quadrados
  R(x0 - 1, ty - 1, 102, 18, INK);
  for (let y = 0; y < 16; y += 4) for (let x = 0; x < 100; x += 4) R(x0 + x, ty + y, 4, 4, ((x + y) >> 2) & 1 ? '#c0392b' : '#fff6e6');
  R(x0, ty, 100, 2, '#fff6e6');
  R(x0 + 8, gy - 2, 3, 2, '#5a3a2a'); R(x0 + 89, gy - 2, 3, 2, '#5a3a2a');
  // vela numa garrafa
  R(cx - 2, ty - 9, 5, 9, '#2f6a3a'); R(cx - 1, ty - 12, 3, 3, '#2f6a3a'); R(cx, ty - 17, 1, 5, PAPER);
  const fl = Math.floor(t * 9) % 3;
  R(cx - 1, ty - 21 + (fl === 1 ? 1 : 0), 3, 3, '#ff8a3a'); R(cx, ty - 22 + (fl === 2 ? 1 : 0), 1, 3, GOLD);
  // pizza de massa fina (para dividir) numa tábua
  R(cx - 30, ty - 2, 24, 2, '#8a5a34');
  R(cx - 28, ty - 4, 20, 2, '#e8b04a'); R(cx - 27, ty - 5, 18, 1, '#d8483a');
  R(cx - 24, ty - 5, 2, 1, '#fff6e6'); R(cx - 18, ty - 5, 2, 1, '#3f8a4a'); R(cx - 13, ty - 5, 2, 1, '#fff6e6');
  // prato de esparguete
  R(cx + 9, ty - 2, 18, 2, '#f4f0e6'); R(cx + 11, ty - 5, 14, 3, '#f2d078'); R(cx + 13, ty - 6, 9, 2, '#c0392b');
  R(cx + 12, ty - 4, 2, 1, '#d8b050'); R(cx + 17, ty - 4, 3, 1, '#d8b050'); R(cx + 22, ty - 4, 2, 1, '#d8b050');
}

// ---------- a porta do Di Casa, à noite ----------
export function porta(ctx, v, R, gy, t) {
  const cx = Math.round(v.w * 0.4), top = Math.max(20, gy - (v.portrait ? 190 : 118));
  sky(ctx, v.w, v.h, gy, ['#141032', '#2a2358', '#4a3a78']);
  stars(ctx, v.w, top + 20, t, 5, 40);
  // parede
  R(0, top + 22, v.w, gy - top - 22, '#c9785a');
  for (let y = top + 28; y < gy - 8; y += 8) for (let x = ((y >> 3) & 1) * 8; x < v.w; x += 16) if (hash(x + y * 3.1) > 0.6) R(x, y, 14, 6, '#bd6c50');
  R(0, top + 20, v.w, 3, '#f4e8d2');
  R(0, gy - 8, v.w, 8, '#8a4a3a');
  // letreiro iluminado
  const sy = top + 32;
  R(cx - 44, sy - 4, 88, 26, 'rgba(255,220,140,0.25)');
  sign(ctx, 'DI CASA', cx, sy, { scale: 2, bg: '#2f7a4a', color: '#fff6e6' });
  // toldo às riscas por cima da porta e da montra
  const ay = sy + 26;
  for (let i = 0; i < 12; i++) R(cx - 54 + i * 9, ay, 9, 8, ['#2f7a4a', '#f4f0e6', '#c0392b'][i % 3]);
  for (let i = 0; i < 12; i++) R(cx - 54 + i * 9 + 2, ay + 8, 5, 2, ['#2f7a4a', '#f4f0e6', '#c0392b'][i % 3]);
  R(cx - 55, ay - 1, 110, 1, INK);
  // porta de madeira e vidro, com a luz lá de dentro
  const dh = gy - ay - 12;
  R(cx - 50, ay + 12, 28, dh, '#5a3a2a'); R(cx - 48, ay + 14, 24, dh - 2, '#7a4f34');
  R(cx - 45, ay + 17, 18, Math.round(dh * 0.5), '#ffd98a'); R(cx - 36, ay + 17, 1, Math.round(dh * 0.5), '#7a4f34'); R(cx - 27, gy - Math.round(dh * 0.4), 2, 3, GOLD);
  // montra com cortina aos quadrados e uma vela
  const wy = ay + 16, wh = Math.round(dh * 0.62);
  R(cx - 14, wy - 2, 66, wh + 4, '#f4e8d2'); R(cx - 12, wy, 62, wh, '#ffcf80');
  for (let x = 0; x < 62; x += 4) for (let y = 0; y < 8; y += 4) R(cx - 12 + x, wy + y, 4, 4, ((x + y) >> 2) & 1 ? '#c0392b' : '#fff6e6');
  R(cx + 17, wy + wh - 10, 4, 10, '#2f6a3a'); R(cx + 18, wy + wh - 14, 1, 4, PAPER); R(cx + 17, wy + wh - 17, 3, 3, Math.floor(t * 8) % 2 ? '#ff8a3a' : GOLD);
  // passeio e candeeiro
  R(0, gy, v.w, v.h - gy, '#4a4458'); R(0, gy, v.w, 2, '#6a6478');
  for (let y = gy + 8, k = 0; y < v.h; y += 10, k++) for (let x = (k % 2) * 12; x < v.w; x += 24) R(x, y, 10, 1, '#5a5468');
  const lx = Math.round(v.w * 0.9), lh = v.portrait ? 96 : 76;
  R(lx, gy - lh, 2, lh, INK); R(lx - 4, gy - lh - 7, 10, 7, INK); R(lx - 3, gy - lh - 6, 8, 5, '#ffe9a8');
  disc(ctx, lx + 1, gy - lh - 3, 16, 'rgba(255,233,168,0.18)');
}

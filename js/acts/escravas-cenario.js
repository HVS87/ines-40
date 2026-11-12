// Cenários do nível «As Escravas»: a fachada do colégio (chegada) e o recreio (com a capela
// de vitrais ao fundo). A fachada e a farda verdadeiras não se conseguiram confirmar: o
// desenho é genérico (um colégio de Lisboa, com cruz e letreiro curto).
import { INK, clamp, hash, sky, disc, sign } from '../draw.js';

const VIDROS = ['#e0527a', '#3f8fe0', '#ffd166', '#4fb888', '#c79bff', '#ff8a4b'];

// Linhas do recreio: gy = base do edifício; fy = linha dos pés das meninas (mais à frente).
export function linhas(v) {
  const gy = v.portrait ? Math.round(v.h * 0.6) : v.h - 36;
  return { gy, fy: v.portrait ? gy + 30 : v.h - 15 };
}

function nuvens(R, w, y0, y1, t) {
  for (let i = 0; i < 4; i++) {
    const x = ((hash(i + 3) * (w + 80) + t * (2 + i)) % (w + 80)) - 40, y = y0 + hash(i * 5 + 1) * Math.max(4, y1 - y0);
    R(x, y, 26, 5, '#ffffff'); R(x + 5, y - 3, 14, 3, '#ffffff'); R(x + 3, y + 5, 18, 2, '#e4f2fc');
  }
}

function arvore(ctx, R, x, gy) {
  R(x - 3, gy - 26, 6, 28, INK); R(x - 2, gy - 26, 4, 27, '#7a5236');
  disc(ctx, x, gy - 36, 15, INK); disc(ctx, x - 11, gy - 28, 11, INK); disc(ctx, x + 11, gy - 28, 11, INK);
  disc(ctx, x, gy - 36, 14, '#3f8a4a'); disc(ctx, x - 11, gy - 28, 10, '#2f6f3c'); disc(ctx, x + 11, gy - 28, 10, '#3f8a4a');
  disc(ctx, x - 4, gy - 40, 6, '#5cab5e');
}

// Janela ogival com vidros de cores (a capela do colégio tem vitrais).
export function vitral(R, cx, y, w, h, seed = 1) {
  const x0 = Math.round(cx - w / 2);
  R(x0 - 1, y + 5, w + 2, h - 5, INK); R(x0 + 1, y + 2, w - 2, 3, INK); R(x0 + 3, y, w - 6, 2, INK);
  for (let yy = 1; yy < h - 1; yy += 2) {
    const inset = yy < 2 ? 4 : yy < 5 ? 2 : 0;
    for (let xx = inset; xx < w - inset; xx += 2) R(x0 + xx, y + yy, 2, 2, VIDROS[Math.floor(hash(xx * 7 + yy * 13 + seed) * VIDROS.length)]);
  }
  R(x0 + w / 2 - 1, y + 1, 1, h - 2, INK);
  R(x0, y + Math.round(h * 0.45), w, 1, INK);
}

function cruz(R, cx, y, c = '#5a4630') {
  R(cx - 1, y, 2, 9, c); R(cx - 3, y + 2, 6, 2, c);
}

function janela(R, x, y, w, h) {
  R(x - 1, y - 1, w + 2, h + 2, '#8a6a4a'); R(x, y, w, h, '#fff6e6');
  R(x + 1, y + 1, w - 2, h - 2, '#6f9ac8'); R(x + 1, y + 1, w - 2, Math.round(h * 0.35), '#9cc0e4');
  R(x + Math.floor(w / 2), y, 1, h, '#fff6e6'); R(x - 2, y + h + 1, w + 4, 2, '#d8c49a');
}

// A fachada do colégio, vista da rua (fundo do ato Talk da chegada). A porta fica a 62% da largura.
export function fachada(ctx, v, R, t, act) {
  const gy = act.ground(v), w = v.w, top = act.top(v);
  sky(ctx, w, v.h, gy, ['#6fbdf0', '#b4e0fa', '#fdf0d8']);
  const bh = clamp(gy - top - 26, 60, 150), by = gy - bh, cx = Math.round(w * 0.62);
  nuvens(R, w, top + 4, Math.max(top + 8, by - 34), t);
  // corpo do edifício, com beiral de telha e soco de pedra
  R(0, by, w, bh, '#f3e3c0');
  R(0, by - 4, w, 5, '#c96f4a'); R(0, by + 1, w, 1, '#a85a3a');
  for (let x = 2; x < w; x += 6) R(x, by - 4, 1, 4, '#a85a3a');
  R(0, gy - 12, w, 12, '#d8c49a'); R(0, gy - 12, w, 1, '#b8a47a');
  const two = bh >= 100, wh = two ? 20 : 16;
  for (let x = cx - 26 - 34; x > -14; x -= 34) { janela(R, x, by + 12, 12, wh); if (two) janela(R, x, by + bh - 54, 12, wh); }
  for (let x = cx + 26 + 22; x < w + 2; x += 34) { janela(R, x, by + 12, 12, wh); if (two) janela(R, x, by + bh - 54, 12, wh); }
  // corpo central, mais alto, com frontão e cruz
  R(cx - 27, by - 9, 54, bh + 9, INK); R(cx - 26, by - 8, 52, bh + 8, '#f8ecd0');
  R(cx - 26, by - 8, 4, bh + 8, '#e0cfa4'); R(cx + 22, by - 8, 4, bh + 8, '#e0cfa4');
  for (let i = 0; i < 8; i++) { const half = 29 - i * 3.5; R(cx - half, by - 10 - i, half * 2, 1, i ? '#c96f4a' : INK); }
  cruz(R, cx, by - 26);
  if (bh >= 100) {   // rosácea de vidros de cores, por cima do letreiro
    disc(ctx, cx, by + 16, 10, INK); disc(ctx, cx, by + 16, 9, '#ffd166');
    for (let k = 0; k < 8; k++) R(cx + Math.round(Math.cos(k * 0.785) * 5) - 1, by + 16 + Math.round(Math.sin(k * 0.785) * 5) - 1, 3, 3, VIDROS[k % VIDROS.length]);
    disc(ctx, cx, by + 16, 2, '#fff6e6');
  }
  sign(ctx, 'EXTERNATO', cx, gy - 55, { bg: '#fff6e6', color: '#3a4a7a', border: '#8a6a4a' });
  // portão de madeira, em arco, aberto
  R(cx - 13, gy - 36, 26, 36, INK); R(cx - 11, gy - 39, 22, 3, INK); R(cx - 8, gy - 41, 16, 2, INK);
  R(cx - 12, gy - 35, 24, 35, '#3a2c3e'); R(cx - 10, gy - 38, 20, 3, '#3a2c3e'); R(cx - 7, gy - 40, 14, 2, '#3a2c3e');
  R(cx - 12, gy - 35, 5, 35, '#8a5a34'); R(cx + 7, gy - 35, 5, 35, '#8a5a34');
  R(cx - 11, gy - 30, 3, 12, '#6b4226'); R(cx + 8, gy - 30, 3, 12, '#6b4226'); R(cx - 11, gy - 14, 3, 12, '#6b4226'); R(cx + 8, gy - 14, 3, 12, '#6b4226');
  R(cx - 20, gy - 30, 3, 5, INK); R(cx - 19, gy - 29, 1, 3, '#ffd166'); R(cx + 17, gy - 30, 3, 5, INK); R(cx + 18, gy - 29, 1, 3, '#ffd166');
  R(cx - 17, gy - 2, 34, 2, '#b8a47a');
  // passeio de calçada e rua
  const ph = Math.min(26, Math.round((v.h - gy) * 0.6));
  R(0, gy, w, ph, '#e2dccc'); R(0, gy, w, 1, '#b8a47a');
  for (let i = 0; i < 90; i++) R(Math.floor(hash(i * 1.7) * w), gy + 2 + Math.floor(hash(i * 3.3) * (ph - 4)), 2, 1, i % 3 ? '#c9c2b0' : '#8a8590');
  R(0, gy + ph, w, 2, '#9a94a0'); R(0, gy + ph + 2, w, v.h - gy - ph - 2, '#6f6a7a');
  const rh = v.h - gy - ph - 2;
  if (rh > 40) for (let y = gy + ph + 8; y < v.h - 6; y += 12) R(cx - 22, y, 44, 6, '#e8e4ee');   // passadeira em frente ao portão
  else for (let x = 6; x < w; x += 30) R(x, gy + ph + Math.round(rh * 0.5) + 1, 14, 2, '#8a8594');
  arvore(ctx, R, Math.round(w * 0.1), gy + 2);
}

// O recreio: o edifício do colégio em arcadas, a capela com o vitral, árvores e chão de terra batida.
// o = { cam (deslocamento do mundo), top, gy (base do edifício), capela (x da capela no mundo), arvores: [x...] }
export function recreio(ctx, v, R, t, o) {
  const w = v.w, gy = o.gy, cam = o.cam || 0;
  const wallH = clamp(gy - o.top - 44, 58, 124), wy = gy - wallH;
  sky(ctx, w, v.h, gy, ['#6fbdf0', '#b4e0fa', '#f6efd8']);
  nuvens(R, w, o.top + 2, Math.max(o.top + 6, wy - 40), t);
  R(0, wy, w, wallH, '#f1dfb8');
  R(0, wy - 4, w, 5, '#c96f4a'); R(0, wy + 1, w, 1, '#a85a3a');
  for (let x = -((cam % 6) + 6) % 6; x < w; x += 6) R(x, wy - 4, 1, 4, '#a85a3a');
  const wh = wallH >= 90 ? 20 : 9;
  for (let k = Math.floor(cam / 44) - 1; k * 44 - cam < w + 44; k++) {
    const x = k * 44 + 10 - Math.round(cam);
    // arco da galeria
    R(x - 1, gy - 31, 26, 31, '#c9a878'); R(x + 1, gy - 34, 22, 3, '#c9a878'); R(x + 4, gy - 36, 16, 2, '#c9a878');
    R(x, gy - 30, 24, 30, '#8a6a4a'); R(x + 2, gy - 33, 20, 3, '#8a6a4a'); R(x + 5, gy - 35, 14, 2, '#8a6a4a');
    R(x, gy - 12, 24, 12, '#a8875a'); R(x, gy - 4, 24, 4, '#c9a878');
    janela(R, x + 6, wy + 9, 12, wh);
    if (wallH >= 110) janela(R, x + 6, wy + 44, 12, 18);
  }
  // capela: corpo mais alto, com frontão, cruz e o vitral
  const cx = Math.round((o.capela === undefined ? 337 : o.capela) - cam);
  if (cx > -40 && cx < w + 40) {
    R(cx - 31, wy - 23, 62, wallH + 23, INK); R(cx - 30, wy - 22, 60, wallH + 22, '#f8ecd0');
    R(cx - 30, wy - 22, 4, wallH + 22, '#e0cfa4'); R(cx + 26, wy - 22, 4, wallH + 22, '#e0cfa4');
    for (let i = 0; i < 8; i++) { const half = 33 - i * 4; R(cx - half, wy - 24 - i, half * 2, 1, i ? '#c96f4a' : INK); }
    cruz(R, cx, wy - 40);
    const vh = Math.min(34, wallH - 34);
    vitral(R, cx, wy - 12, 16, vh, 3);
    if (wallH >= 100) { vitral(R, cx - 17, wy + 4, 8, 18, 5); vitral(R, cx + 17, wy + 4, 8, 18, 9); }
    R(cx - 9, gy - 22, 18, 22, INK); R(cx - 6, gy - 24, 12, 2, INK); R(cx - 8, gy - 21, 16, 21, '#7a5236'); R(cx - 5, gy - 23, 10, 2, '#7a5236'); R(cx, gy - 22, 1, 22, '#5a3a22');
  }
  // chão
  R(0, gy, w, v.h - gy, '#dcc090'); R(0, gy, w, 2, '#b89a6a');
  for (let i = 0; i < 80; i++) {
    const x = (((hash(i * 1.3) * 660 - cam) % 660) + 660) % 660 - 20;
    R(x, gy + 5 + Math.floor(hash(i * 2.7) * (v.h - gy - 8)), 2, 1, i % 4 ? '#c8aa78' : '#eed6a8');
  }
  if (v.h - gy > 120) {   // ao alto sobra chão: um campo de jogos pintado e um canteiro à frente
    const y0 = gy + 70, y1 = v.h - 34, c = '#f4e6c4';
    R(10, y0, w - 20, 2, c); R(10, y1, w - 20, 2, c); R(10, y0, 2, y1 - y0, c); R(w - 12, y0, 2, y1 - y0 + 2, c); R(Math.round(w / 2) - 1, y0, 2, y1 - y0, c);
    for (let a = 0; a < 40; a++) R(Math.round(w / 2 + Math.cos(a * 0.157) * 26) - 1, Math.round((y0 + y1) / 2 + Math.sin(a * 0.157) * 14), 2, 2, c);
    R(0, v.h - 16, w, 16, '#2f6f3c'); R(0, v.h - 18, w, 3, '#3f8a4a');
    for (let x = 3; x < w; x += 9) { R(x, v.h - 21 + Math.round(hash(x) * 3), 6, 5, '#3f8a4a'); if (x % 2) R(x + 2, v.h - 12 + Math.round(hash(x * 3) * 6), 2, 2, x % 3 ? '#ff8ab8' : '#ffe066'); }
  }
  for (const ax of o.arvores || []) if (ax - cam > -30 && ax - cam < w + 30) arvore(ctx, R, Math.round(ax - cam), gy + 3);
}

// Uma personagem sentada: só a parte de cima do boneco (as primeiras `rows` linhas), à escala 2.
export function busto(ctx, frames, x, y, face = 1, rows = 13) {
  const img = frames.stand[face < 0 ? 'l' : 'r'];
  ctx.drawImage(img, 0, 0, img.width, rows, Math.round(x - img.width), Math.round(y - rows * 2), img.width * 2, rows * 2);
}

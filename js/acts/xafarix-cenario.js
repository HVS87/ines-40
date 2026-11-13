// Cenário do Xafarix (nível 12), desenhado a partir de fotografias da sala: paredes brancas,
// arcos de pedra amarelada, chão de tijoleira, bancos corridos de pele escura, mesas brancas, um
// palco preto pequeno com a sua grade de projetores (luzes cor-de-rosa e roxas) e o gato de
// auscultadores do logótipo. Serve de fundo ao jogo de ritmo, ao balcão e aos momentos de história.
import { getCharacter, makeSprite } from '../sprites.js';
import { INK, PAPER, hash, text } from '../draw.js';

const WALL = '#efe8dc', WALL_D = '#dcd2c2', STONE = '#c9a35a', STONE_L = '#e0bf7a', STONE_D = '#a07f42';
const TILE = '#a8482e', TILE_D = '#7e3220', TILE_L = '#bf5a3a', LEATHER = '#3a2a26';

// Estilo do letreiro «XAFARIX» (para sign() de js/draw.js).
export const LETREIRO = { scale: 2, bg: '#f4eee2', color: '#2b1d2e', border: '#2b1d2e' };

// O gato de auscultadores do logótipo (17x13): w traço, h auscultadores, k olhos, nariz e boca.
const GATO = [
  '....hhhhhhhhh....',
  '...h.........h...',
  '..h.ww.....ww.h..',
  '.hh.www...www.hh.',
  '.hhwwwwwwwwwwwhh.',
  '.hhwkkkwwwkkkwhh.',
  '.hhwwwwwwwwwwwhh.',
  'w..wwwwwkwwwww..w',
  '.w.wwwwkkkwwww.w.',
  'w..wwwwwkwwwww..w',
  '....wwkwwwkww....',
  '.....wwkkkww.....',
  '......wwwww......',
];
const gatos = new Map();
// Desenha o gato com o canto em (x, y): fg = cor do traço, bg = cor do fundo (olhos, nariz, boca).
export function gato(ctx, x, y, fg = '#ffffff', bg = '#141220', scale = 1) {
  const key = fg + bg;
  if (!gatos.has(key)) gatos.set(key, makeSprite(GATO, { w: fg, h: fg, k: bg }));
  const img = gatos.get(key);
  ctx.drawImage(img, Math.round(x), Math.round(y), img.width * scale, img.height * scale);
}

// Feixe de luz em riscas (um trapézio).
function beam(R, x0, y0, x1, y1, w0, w1, color) {
  const n = Math.max(1, Math.ceil((y1 - y0) / 2));
  for (let i = 0; i < n; i++) { const f = i / n, w = w0 + (w1 - w0) * f; R(x0 + (x1 - x0) * f - w / 2, y0 + i * 2, w, 2, color); }
}

// Parede branca caiada, com um leve banho de luz cor-de-rosa e roxa a subir dos apliques.
export function parede(R, x0, y0, w, h, seed = 0) {
  R(x0, y0, w, h, WALL);
  for (let i = 0; i < Math.floor(w / 9); i++) R(x0 + hash(i + seed) * w, y0 + hash(i * 3.3 + seed) * h, 2, 1, WALL_D);
  R(x0, y0, w, Math.min(h, 8), 'rgba(60,30,80,0.18)');
}

// Aplique de parede: caixa branca com a luz colorida a escorrer para baixo.
function aplique(R, x, y, color, t) {
  const a = 0.2 + Math.sin(t * 2 + x) * 0.04;
  for (let k = 0; k < 9; k++) R(x - 5 - k, y + 8 + k * 2, 10 + k * 2, 2, color.replace('A', (a * (1 - k / 9)).toFixed(2)));
  R(x - 4, y - 1, 8, 10, WALL_D); R(x - 3, y, 6, 8, '#ffffff');
}

// Arco de pedra amarelada (pilares e volta), com a sala seguinte, mais escura, lá ao fundo.
function arco(R, cx, by, w, h) {
  const r = Math.round(w / 2), top = by - h;
  // o vão: a outra sala, em penumbra quente
  for (let y = 0; y < h; y++) {
    const dy = y < r ? r - y : 0, half = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
    R(cx - half, top + y, half * 2, 1, y % 2 ? '#5a4038' : '#523a34');
  }
  R(cx - 4, by - 26, 8, 2, '#ffd166'); R(cx - 12, by - 14, 24, 14, LEATHER);          // uma luz e um banco ao fundo
  // os pilares e a volta de pedra
  for (const d of [-1, 1]) { R(cx + d * r - 3, top + r, 7, h - r, STONE); R(cx + d * r - 3, top + r, 2, h - r, STONE_L); R(cx + d * r + 2, top + r, 2, h - r, STONE_D); }
  for (let a = 0; a <= 32; a++) {
    const an = (a / 32) * Math.PI, x = cx - Math.cos(an) * r, y = top + r - Math.sin(an) * r;
    R(x - 3, y - 3, 7, 7, a % 4 === 0 ? STONE_D : STONE); R(x - 3, y - 3, 7, 2, STONE_L);
  }
}

// Mesa branca de pé central (tampo a MESA_H do chão), com uma vela e pegadas de gato no tampo.
export const MESA_H = 16;
export function mesa(R, x, gy, t = 0) {
  R(x - 18, gy - MESA_H - 1, 36, 5, INK); R(x - 17, gy - MESA_H, 34, 3, '#f4eee2'); R(x - 17, gy - MESA_H + 2, 34, 1, '#cfc6b6');
  R(x - 9, gy - MESA_H, 2, 1, '#3a2a26'); R(x + 5, gy - MESA_H + 1, 2, 1, '#3a2a26');
  R(x - 2, gy - MESA_H + 4, 4, MESA_H - 6, '#2b2530');
  R(x - 9, gy - 3, 18, 3, INK); R(x - 8, gy - 2, 16, 1, '#4a4458');
  R(x - 1, gy - MESA_H - 4, 3, 3, '#fff3c4'); if (Math.floor(t * 6 + x) % 3) R(x, gy - MESA_H - 6, 1, 2, '#ff8a3a');
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
  R(x + 15, gy - 34, 1, 34, '#8a8794'); R(x + 11, gy - 1, 9, 1, '#8a8794'); R(x + 12, gy - 37, 4, 4, INK); R(x + 13, gy - 36, 2, 2, '#c9c9d8');
  // notas de música a subir
  if (playing) {
    for (let k = 0; k < 2; k++) {
      const p = (t * 0.6 + k * 0.5) % 1, nx = x + 20 + k * 9 + Math.round(Math.sin(p * 6 + k) * 3), ny = gy - 44 - Math.round(p * 22);
      R(nx, ny, 1, 6, PAPER); R(nx - 2, ny + 5, 3, 2, PAPER); R(nx + 1, ny, 2, 1, PAPER);
    }
  }
}

// O chão de tijoleira vermelha, com as juntas escuras.
export function tijoleira(R, w, gy, h) {
  R(0, gy, w, h - gy, TILE);
  for (let y = gy, j = 0; y < h; y += 10, j++) {
    R(0, y, w, 1, TILE_D);
    for (let x = (j % 2) * 9; x < w; x += 18) { R(x, y, 1, 10, TILE_D); if (hash(x + j * 7) > 0.7) R(x + 2, y + 2, 14, 6, TILE_L); }
  }
}

// o: { gy, top, beat, playing, tables: [x...], stage: x do Mico (ou null), signX }
export function xafarixBg(ctx, v, R, t, o) {
  const { gy, top } = o, w = v.w, P = v.portrait;
  // teto escuro e parede caiada
  R(0, 0, w, top, '#1f1a2a');
  const wy = Math.max(0, top - 30);
  parede(R, 0, wy, w, gy - wy, 3);
  // arcos de pedra, com a sala do fundo
  const ah = Math.min(P ? 92 : 62, gy - top - 30), aw = P ? 62 : 54, na = P ? 2 : 3;
  for (let i = 0; i < na; i++) {
    const cx = Math.round(((i + 0.5) * w) / na);
    if (o.stage !== null && o.stage !== undefined && Math.abs(cx - o.stage) < aw * 0.8) continue;   // o palco tapa esse arco
    arco(R, cx, gy - 6, aw, ah);
  }
  // apliques de luz cor-de-rosa e roxa
  for (let i = 0; i <= na; i++) {
    const x = Math.round((i * w) / na) + (i === 0 ? 10 : i === na ? -10 : 0);
    if (o.stage !== null && o.stage !== undefined && Math.abs(x - o.stage) < 44) continue;
    aplique(R, x, gy - ah - 2, i % 2 ? 'rgba(200,90,255,A)' : 'rgba(255,90,170,A)', t);
  }
  // letreiro: o nome em letras escuras sobre branco e o gato ao lado
  const sx = o.signX !== undefined ? o.signX : Math.round(w * (P ? 0.64 : 0.76));
  R(sx - 47, top + 3, 94, 19, INK); R(sx - 46, top + 4, 92, 17, '#f4eee2');
  text(ctx, 'XAFARIX', sx - 40, top + 8, '#2b1d2e', { scale: 2 });
  gato(ctx, sx + 24, top + 6, '#2b1d2e', '#f4eee2');
  // banco corrido de pele escura ao longo da parede e rodapé
  R(0, gy - 13, w, 13, INK); R(0, gy - 12, w, 12, LEATHER); R(0, gy - 12, w, 2, '#5a4038');
  for (let x = 20; x < w; x += 40) R(x, gy - 12, 1, 12, '#2a1c1a');
  tijoleira(R, w, gy, v.h);
  // palco preto pequeno, com o pano de fundo, a grade de projetores e o Mico
  if (o.stage !== null && o.stage !== undefined) {
    const mx = o.stage, sw = 84, sh = 9, ty = Math.max(top + 26, gy - ah - 18);
    R(mx - sw / 2, ty, sw, gy - sh - ty, '#141220');                                   // pano preto
    R(mx - sw / 2 + 4, ty + 10, 21, 26, INK); gato(ctx, mx - sw / 2 + 6, ty + 13);      // o cartaz do gato
    for (let k = 0; k < 4; k++) R(mx - sw / 2 + 5, ty + 29 + k * 2, 19 - k * 2, 1, '#ffffff');
    // grade de projetores
    R(mx - sw / 2 - 2, ty - 4, sw + 4, 4, INK);
    for (let x = mx - sw / 2; x < mx + sw / 2; x += 6) R(x, ty - 3, 3, 2, '#4a4458');
    ['#ff4f8a', '#ffd166', '#c85aff'].forEach((c, i) => {
      const lx = mx - 26 + i * 26;
      R(lx - 3, ty, 7, 6, INK); R(lx - 2, ty + 4, 5, 2, c);
      beam(R, lx, ty + 6, mx + (i - 1) * 10, gy - sh, 5, 34, c === '#ffd166' ? 'rgba(255,220,150,0.13)' : c === '#ff4f8a' ? 'rgba(255,80,150,0.13)' : 'rgba(200,90,255,0.13)');
    });
    R(mx - sw / 2 - 1, gy - sh - 1, sw + 2, sh + 1, INK); R(mx - sw / 2, gy - sh, sw, sh, '#1c1a22'); R(mx - sw / 2, gy - sh, sw, 2, '#3a3448');
    // coluna de som
    R(mx - 38, gy - sh - 22, 14, 22, INK); R(mx - 37, gy - sh - 21, 12, 20, '#2a2436'); R(mx - 34, gy - sh - 18, 6, 6, '#0d0820'); R(mx - 33, gy - sh - 9, 4, 4, '#0d0820');
    mico(ctx, R, mx + 4, gy - sh, t, o.beat === undefined ? t * 1.7 : o.beat, o.playing !== false);
  }
  // mesas
  for (const x of o.tables || []) mesa(R, x, gy, t);
}

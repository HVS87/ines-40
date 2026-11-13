// O Recreio de Miraflores, desenhado a partir de fotografias do espaço: paredes, colunas e
// condutas do teto em verde-salva, bancas com vidro canelado de luz acesa, balcões de mármore
// e plantas por cima, chão de mosaico geométrico, mesas de madeira clara, a vidraça para a
// esplanada (cadeiras cor-de-rosa, guarda-sóis verdes e a carrinha do bar), os cartazes da
// túlipa e do girassol, os matraquilhos, o escorrega e, para a festa, o palco da música ao vivo.
import { INK, PAPER, GOLD, PINK, disc, hash, text, person } from '../draw.js';
import { getCharacter } from '../sprites.js';

export const VERDE = '#a9c9a0', ROSA = '#f3a6b8';
const VERDE_C = '#bcd7b3', VERDE_D = '#8db487', VERDE_E = '#5f8f66', VERDE_X = '#3f6f52', MARMORE = '#eceae6', MADEIRA = '#dcb680', MADEIRA_D = '#b88a52';
const FESTA = ['#ff5d8f', '#ffd166', '#6fb0f0', '#c79bff', '#ff8a4b'];

const VAO = 170;       // distância entre bancas
// As bancas, pela ordem em que aparecem ('*' = a vidraça para a esplanada).
const BANCAS = ['AMÉLIA', 'PASTRAMI', 'STREET', '*', 'SOÃO', 'PATIFE', 'POLPETTA', 'ATALHO', 'BAR'];

// Uma banca: friso com o nome, vidros canelados, ementa, cozinheiro, balcão de mármore e plantas.
function banca(ctx, R, x, sy, gy, nome, k) {
  const w = 88, x0 = Math.round(x - w / 2), cy = gy - 26, bar = nome === 'BAR';
  R(x0 - 2, sy, w + 4, gy - sy, VERDE_E);
  R(x0 + 3, sy + 13, w - 6, cy - sy - 13, bar ? '#3a3448' : '#e9d3a6'); R(x0 + 3, sy + 13, w - 6, 8, bar ? '#4a4460' : '#f6e7b8');
  if (bar) {
    // a garrafeira: prateleiras de garrafas
    for (let j = 0; j < 2; j++) { R(x0 + 22, sy + 36 + j * 14, 44, 1, '#8a7a6a'); for (let i = 0; i < 8; i++) { const c = ['#3f8f5a', '#c0392b', '#f2e6c8', '#7a3fa0'][(i + j) % 4]; R(x0 + 24 + i * 5, sy + 28 + j * 14, 3, 8, c); R(x0 + 25 + i * 5, sy + 25 + j * 14, 1, 3, c); } }
  } else {
    // prateleira de frascos e o cozinheiro, de barrete
    R(x0 + 22, sy + 37, 44, 1, '#b89a6a');
    for (let j = 0; j < 5; j++) R(x0 + 24 + j * 9, sy + 32, 5, 5, ['#c0392b', '#3f8f5a', '#fff6e6', '#d9b25a'][(j + k) % 4]);
    const px = x0 + 30 + ((k * 17) % 28);
    R(px - 6, cy - 13, 12, 13, '#ffffff'); R(px - 4, cy - 21, 8, 8, ['#f6c9a0', '#e0a878', '#c98a5a'][k % 3]); R(px - 4, cy - 25, 8, 5, '#ffffff'); R(px - 5, cy - 26, 10, 2, '#ffffff');
    R(px - 2, cy - 18, 1, 1, INK); R(px + 1, cy - 18, 1, 1, INK);
  }
  // vidros canelados, de luz acesa, dos dois lados
  for (const gx of [x0 + 3, x0 + w - 19]) {
    R(gx, sy + 13, 16, cy - sy - 13, '#f6e7b0');
    for (let j = 1; j < 16; j += 3) R(gx + j, sy + 13, 1, cy - sy - 13, '#e6cf88');
    R(gx - 1, sy + 13, 1, cy - sy - 13, VERDE_X); R(gx + 16, sy + 13, 1, cy - sy - 13, VERDE_X); R(gx, sy + 13 + Math.round((cy - sy - 13) * 0.5), 16, 2, VERDE_E);
  }
  // a ementa
  if (!bar) { R(x0 + 23, sy + 15, 42, 12, '#fffdf6'); for (let j = 0; j < 3; j++) R(x0 + 26, sy + 18 + j * 3, 24 + ((j * 7 + k * 5) % 12), 1, '#9a9488'); }
  // friso com o nome
  R(x0 - 3, sy, w + 6, 13, VERDE_X); R(x0 - 3, sy + 12, w + 6, 1, '#2f573f');
  text(ctx, nome, x, sy + 4, '#f4f1e4', { align: 'center' });
  // balcão de mármore, com o tampo verde
  R(x0 - 3, cy, w + 6, 3, '#dcd8d2'); R(x0 - 2, cy + 3, w + 4, gy - cy - 3, MARMORE);
  for (let j = 0; j < 7; j++) { const vx = x0 + 3 + ((j * 29 + k * 13) % (w - 14)); R(vx, cy + 6 + (j % 3) * 6, 7, 1, '#c9c5cc'); R(vx + 5, cy + 7 + (j % 3) * 6, 5, 1, '#c9c5cc'); }
  R(x0 + w - 24, cy - 4, 14, 4, VERDE_X); R(x0 + w - 23, cy - 3, 12, 2, '#6fae7a');     // o terminal de pagamento, verde
  // floreira por cima, com plantas a cair
  for (let j = 0; j < 10; j++) { const fx = x0 + 2 + j * 9, d = 2 + ((j * 5 + k * 3) % 5); disc(ctx, fx, sy - 3, 5, j % 2 ? '#3f7a4a' : '#2f6a3f'); R(fx - 1, sy, 2, d, '#3f7a4a'); }
}

// A vidraça para a esplanada, de noite: prédios de escritórios, deck de madeira, a carrinha do
// «Bar do Recreio», um guarda-sol verde, mesas e cadeiras cor-de-rosa e um fio de luzes.
function vidraca(ctx, R, x, sy, gy, t) {
  const w = 100, x0 = Math.round(x - w / 2), y0 = sy - 8, h = gy - y0, dy = gy - 20;
  R(x0 - 3, y0 - 3, w + 6, h + 3, VERDE_X);
  R(x0, y0, w, h, '#1a1f44');
  R(x0, y0 + 10, 36, dy - y0 - 10, '#262b55'); R(x0 + 42, y0 + 2, 58, dy - y0 - 2, '#2e3360'); R(x0 + 42, y0 + 44, 58, 5, '#6a4aa0');
  for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) R(x0 + 46 + i * 9, y0 + 7 + j * 12, 6, 7, hash(i * 7 + j * 13) > 0.55 ? '#ffe9a8' : '#3a4074');
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) R(x0 + 4 + i * 10, y0 + 16 + j * 11, 6, 6, hash(i + j * 5 + 2) > 0.5 ? '#ffe9a8' : '#343a6c');
  R(x0, dy, w, 20, '#8a5a3a'); for (let j = 0; j < 4; j++) R(x0, dy + 3 + j * 5, w, 1, '#6f452a');
  // a carrinha do bar, verde-água
  const cx = x0 + 31;
  R(cx - 25, dy - 27, 50, 24, INK); R(cx - 24, dy - 26, 48, 22, '#bfe3c8'); R(cx - 24, dy - 26, 48, 3, '#e6f4ea'); R(cx - 24, dy - 8, 48, 4, '#9fcdb0');
  R(cx - 17, dy - 21, 24, 9, '#2b2540'); R(cx - 16, dy - 20, 22, 1, '#ffe9a8'); R(cx - 19, dy - 23, 28, 2, '#f4f1e4');
  R(cx + 12, dy - 21, 9, 8, '#8fcdf0'); R(cx + 12, dy - 21, 9, 1, '#dff3ff');
  for (const wx of [cx - 15, cx + 13]) { disc(ctx, wx, dy - 1, 4, INK); disc(ctx, wx, dy - 1, 2, '#c8ccd8'); }
  text(ctx, 'BAR DO RECREIO', cx + 3, dy - 35, '#f4f1e4', { align: 'center' });
  // guarda-sol verde, mesa e cadeiras cor-de-rosa
  const px = x0 + 78;
  R(px, dy - 36, 1, 38, INK); R(px - 17, dy - 38, 35, 3, '#7fb878'); R(px - 11, dy - 41, 23, 3, '#8fc888'); R(px - 5, dy - 43, 11, 2, '#9fd898');
  R(px - 8, dy - 6, 17, 2, ROSA); R(px, dy - 4, 1, 8, ROSA);
  for (const d of [-1, 1]) { const qx = px + d * 14; R(qx - 2, dy - 11, 5, 2, ROSA); R(qx - 2 + (d > 0 ? 4 : 0), dy - 11, 1, 14, ROSA); R(qx - 2, dy - 5, 5, 1, ROSA); R(qx + (d > 0 ? -2 : 2), dy - 5, 1, 8, ROSA); }
  // fio de luzes
  for (let i = 0; i < 12; i++) { const lx = x0 + 4 + i * 8, ly = y0 + 5 + Math.round(Math.sin(i * 0.7) * 2); R(lx, ly, 2, 2, Math.floor(t * 2 + i) % 3 ? '#ffe9a8' : '#fffbe0'); }
  // caixilhos
  for (let i = 1; i < 3; i++) R(x0 + Math.round((w * i) / 3) - 1, y0, 2, h, VERDE_X);
  R(x0, gy - 2, w, 2, VERDE_X);
}

// O chão de mosaico: faixa às riscas pretas e brancas e ladrilhos creme, verdes e mostarda.
function chao(R, v, gy, cam) {
  R(0, gy, v.w, v.h - gy, '#efe8d6');
  for (let x = -(((cam % 6) + 6) % 6); x < v.w; x += 6) R(x, gy, 3, 5, '#2b2b33');
  R(0, gy + 5, v.w, 1, VERDE_D);
  const T = 14, cols = [null, VERDE, VERDE_X, null, '#d9b25a', VERDE];
  for (let y = gy + 6, r = 0; y < v.h; y += 9, r++) {
    for (let i = Math.floor(cam / T) - 1; i <= Math.floor((cam + v.w) / T) + 1; i++) {
      const c = cols[(((i * 2 + r * 3 + ((i * r) & 1)) % 6) + 6) % 6];
      if (c) R(i * T - cam, y, T, 9, c);
    }
  }
}

// A entrada: azulejos verde-água, o nome da casa e os dois cartazes (a túlipa e o girassol).
export function entrada(ctx, R, x, sy, gy) {
  const y0 = sy - 10, h = gy - y0, W = 104;
  R(x, y0, W, h, '#7fc8b8');
  for (let i = 0; i < W; i += 8) R(x + i, y0, 1, h, '#6ab4a4');
  for (let j = 0; j < h; j += 8) R(x, y0 + j, W, 1, '#6ab4a4');
  R(x + 5, y0 + 6, 94, 22, INK); R(x + 6, y0 + 7, 92, 20, '#0e5a1c');
  text(ctx, 'RECREIO', x + 52, y0 + 9, '#ffe14a', { scale: 2, align: 'center' });
  text(ctx, 'DE MIRAFLORES', x + 52, y0 + 21, '#ffe14a', { align: 'center' });
  const py = y0 + 32, ph = Math.max(40, Math.min(58, gy - py - 14)), red = '#ee1c1c';
  // a túlipa vermelha, sobre verde-claro
  let cx = x + 28;
  R(x + 5, py - 1, 46, ph + 2, INK); R(x + 6, py, 44, ph, '#8fe36a');
  R(cx - 4, py + ph - 20, 8, 20, '#0e5a1c');
  disc(ctx, cx, py + 22, 18, red); R(cx - 18, py + 4, 37, 18, red);
  for (let dx = -18; dx <= 18; dx++) { const d = 9 - Math.abs(((dx + 18) % 18) - 9); if (d > 0) R(cx + dx, py + 4, 1, d, '#8fe36a'); }
  // o girassol, sobre verde-escuro
  cx = x + 76;
  R(x + 53, py - 1, 46, ph + 2, INK); R(x + 54, py, 44, ph, '#0e5a1c');
  R(cx - 3, py + 30, 6, ph - 30, '#2fae2f'); disc(ctx, cx - 11, py + ph - 10, 8, '#2fae2f'); disc(ctx, cx + 11, py + ph - 10, 8, '#2fae2f');
  R(x + 54, py + ph - 2, 44, 2, '#0e5a1c');
  disc(ctx, cx, py + 18, 16, '#ffe14a'); disc(ctx, cx, py + 18, 9, '#8f1f1a');
  if (gy - py - ph > 9) text(ctx, 'PAUSA MERECIDA', x + 52, py + ph + 4, '#0e5a1c', { align: 'center' });
}

// Os matraquilhos.
export function matraquilhos(R, x, gy) {
  x = Math.round(x);
  R(x - 20, gy - 22, 40, 12, INK); R(x - 19, gy - 21, 38, 10, VERDE_X); R(x - 17, gy - 21, 34, 3, '#6fbf62');
  for (let k = 0; k < 4; k++) { const rx = x - 14 + k * 9; R(rx, gy - 27, 1, 8, '#c8ccd8'); R(rx - 1, gy - 20, 3, 3, k % 2 ? '#3f6fb5' : '#c0392b'); R(rx - 1, gy - 29, 3, 3, INK); }
  R(x - 17, gy - 10, 3, 10, INK); R(x + 14, gy - 10, 3, 10, INK); R(x - 14, gy - 5, 28, 1, INK);
}

// O escorrega (o recreio também é para os mais pequenos).
export function escorrega(R, x, gy) {
  x = Math.round(x);
  R(x - 20, gy - 34, 2, 34, INK); R(x - 10, gy - 34, 2, 34, INK);
  for (let k = 0; k < 5; k++) R(x - 18, gy - 6 - k * 6, 8, 1, INK);
  R(x - 22, gy - 36, 18, 3, INK); R(x - 21, gy - 35, 16, 1, PINK); R(x - 20, gy - 44, 1, 8, INK); R(x - 8, gy - 44, 1, 8, INK); R(x - 20, gy - 45, 13, 1, INK);
  for (let k = 0; k <= 30; k++) { const sx = x - 6 + k, sy = gy - 34 + Math.round((k * 30) / 30); R(sx, sy - 1, 2, 5, INK); R(sx, sy, 2, 3, '#ffd166'); }
  R(x + 24, gy - 5, 8, 5, INK); R(x + 24, gy - 4, 7, 3, '#ffd166');
}

// Mesa redonda de madeira clara, com duas cadeiras.
export function mesa(R, x, gy) {
  x = Math.round(x);
  R(x - 11, gy - 17, 22, 4, INK); R(x - 10, gy - 16, 20, 2, MADEIRA); R(x - 1, gy - 13, 2, 11, MADEIRA_D); R(x - 5, gy - 2, 10, 2, MADEIRA_D);
  for (const d of [-1, 1]) {
    const cx = x + d * 18, b = cx + (d > 0 ? 3 : -4);
    R(b, gy - 24, 2, 14, MADEIRA_D); R(b - 1, gy - 25, 4, 8, MADEIRA); R(cx - 4, gy - 11, 9, 2, MADEIRA);
    R(cx - 4, gy - 9, 1, 9, MADEIRA_D); R(cx + 4, gy - 9, 1, 9, MADEIRA_D);
  }
}

// O palco da música ao vivo: pano de fundo, projetores, bola de espelhos, colunas de som e a
// banda (guitarra, voz e bateria). o: { top, beat, on (a tocar) }.
export function palco(ctx, R, x, gy, t, o = {}) {
  x = Math.round(x);
  const W = 116, x0 = x - W / 2, ty = gy - 12, hy = Math.max(o.top || 0, gy - 100), alto = ty - hy, on = !!o.on, beat = o.beat || 0;
  const bob = on ? Math.round(Math.abs(Math.sin(beat * Math.PI)) * 2) : 0;
  R(x0 - 3, hy, W + 6, alto, INK); R(x0 - 2, hy + 1, W + 4, alto - 1, '#263a36');
  for (let i = 0; i < W + 4; i += 8) R(x0 - 2 + i, hy + 1, 1, alto - 1, '#2f4a45');
  if (alto > 84) text(ctx, 'MÚSICA AO VIVO', x, hy + 4, GOLD, { align: 'center' });
  // projetores coloridos, a piscar com a música
  const ly = hy + (alto > 84 ? 12 : 2);
  R(x0, ly, W, 2, '#11181a');
  ['#ff5d8f', '#ffd166', '#6fd0ff', '#7be0b0'].forEach((c, i) => {
    const lx = x0 + 15 + i * 29;
    R(lx - 3, ly + 2, 7, 4, INK); R(lx - 2, ly + 5, 5, 2, c);
    ctx.globalAlpha = on ? 0.1 + 0.1 * ((Math.floor(beat) + i) % 2) : 0.06;
    for (let k = 0; k < ty - ly - 8; k += 2) R(Math.round(lx - 2 - k * 0.22), ly + 7 + k, Math.round(5 + k * 0.44), 2, c);
    ctx.globalAlpha = 1;
  });
  // bola de espelhos
  if (alto > 70) {
    const by = ly + 17;
    R(x, ly + 2, 1, 9, '#8a8794'); disc(ctx, x, by, 6, INK); disc(ctx, x, by, 5, '#c8ccd8');
    for (let k = 0; k < 4; k++) R(x - 4 + ((k * 3 + Math.floor(t * 6)) % 8), by - 3 + ((k * 2) % 6), 2, 2, k % 2 ? PAPER : '#8fcdf0');
    if (on) for (let k = 0; k < 5; k++) { const a = t * 1.3 + k * 1.26; R(Math.round(x + Math.cos(a) * 22), Math.round(by + 6 + Math.sin(a) * 9), 2, 2, PAPER); }
  }
  // colunas de som
  for (const sx of [x0 + 2, x0 + W - 13]) { R(sx, ty - 30, 11, 30, INK); R(sx + 1, ty - 29, 9, 28, '#3a3448'); disc(ctx, sx + 5, ty - 21, 3, '#16161f'); disc(ctx, sx + 5, ty - 9, 4, '#16161f'); }
  // a bateria (com o «40» no bombo) e o baterista
  const bx = x + 30, hit = on ? Math.floor(beat * 2) % 2 : 0;
  person(ctx, getCharacter('musico', 'b'), bx, ty - 4, { scale: 2, face: -1, hop: bob });
  R(bx - 19, ty - 31 + hit, 11, 2, GOLD); R(bx - 14, ty - 29, 1, 29, '#8a8794'); R(bx + 9, ty - 33 - hit, 11, 2, GOLD); R(bx + 14, ty - 31, 1, 31, '#8a8794');
  R(bx - 13, ty - 22, 9, 6, INK); R(bx - 12, ty - 21, 7, 4, '#c0392b'); R(bx + 5, ty - 22, 9, 6, INK); R(bx + 6, ty - 21, 7, 4, '#c0392b');
  disc(ctx, bx, ty - 9, 10, INK); disc(ctx, bx, ty - 9, 9, '#c0392b'); disc(ctx, bx, ty - 9, 7, PAPER);
  text(ctx, '40', bx, ty - 11, '#c0392b', { align: 'center' });
  // o guitarrista
  const gx = x - 38;
  person(ctx, getCharacter('musico', 'casual'), gx, ty, { scale: 2, face: 1, hop: bob });
  R(gx - 10, ty - 28 - bob, 15, 10, INK); R(gx - 9, ty - 27 - bob, 13, 8, '#c8843c'); R(gx - 5, ty - 25 - bob, 3, 3, '#3a2416'); R(gx + 4, ty - 26 - bob, 15, 3, INK); R(gx + 5, ty - 25 - bob, 13, 1, '#8a5a34');
  // a cantora, ao microfone
  const vx = x - 6;
  person(ctx, getCharacter('cantora', 'casual'), vx, ty, { scale: 2, face: 1, hop: on ? 2 - bob : 0 });
  R(vx + 11, ty - 34, 1, 34, '#8a8794'); R(vx + 9, ty - 37, 4, 4, INK); R(vx + 8, ty - 1, 7, 1, '#8a8794');
  // o estrado
  R(x0 - 4, ty, W + 8, 12, INK); R(x0 - 3, ty + 1, W + 6, 10, '#5a4a3e'); R(x0 - 3, ty + 1, W + 6, 2, '#7a6654');
}

// O interior do Recreio, a deslizar com a câmara. o: { stageX (onde fica o palco, em coordenadas
// do mundo), beat, on, entrada (desenha a entrada no início), bandeiras }.
export function interior(ctx, v, R, gy, cam, top, t, o = {}) {
  cam = Math.round(cam);
  const sy = Math.max(top + 22, gy - 98);            // topo das bancas
  R(0, 0, v.w, gy, VERDE);
  // o teto: placas, a conduta de ventilação e a calha de luzes, tudo pintado de verde
  const dy = Math.max(top + 2, sy - 40);
  R(0, 0, v.w, dy, VERDE_D);
  for (let x = -(((cam % 20) + 20) % 20); x < v.w; x += 20) R(x, 0, 1, dy, '#7fa680');
  R(0, dy, v.w, 10, VERDE_C); R(0, dy, v.w, 2, '#d2e6ca'); R(0, dy + 8, v.w, 2, VERDE_D);
  for (let x = -(((cam % 12) + 12) % 12); x < v.w; x += 12) R(x, dy, 1, 10, VERDE_D);
  R(0, dy + 13, v.w, 1, VERDE_E);
  for (let x = -(((cam % 34) + 34) % 34) + 10; x < v.w; x += 34) { R(x, dy + 14, 3, 3, '#2b2b33'); R(x + 1, dy + 17, 1, 1, '#fff3c4'); }
  // com o ecrã ao alto sobra parede por cima: faixas de parabéns e vasos suspensos
  const livre = dy - top;
  if (livre > 56 && o.bandeiras !== false) {
    const my = top + Math.round(livre * 0.52);
    for (let i = Math.floor((cam - 130) / 230); i <= Math.floor((cam + v.w + 130) / 230); i++) {
      const bx = i * 230 + 130 - cam;
      R(bx - 54, 0, 1, my - 10, '#7fa680'); R(bx + 54, 0, 1, my - 10, '#7fa680');
      R(bx - 61, my - 11, 122, 22, INK); R(bx - 60, my - 10, 120, 20, '#fff6e6'); R(bx - 60, my - 10, 120, 2, PINK); R(bx - 60, my + 8, 120, 2, PINK);
      text(ctx, 'PARABÉNS INÊS!', bx, my - 5, '#c0392b', { scale: 2, align: 'center' });
      const px = bx + 115;
      R(px, 0, 1, my - 8, '#7fa680'); R(px - 6, my - 9, 12, 5, VERDE_X);
      disc(ctx, px, my + 2, 9, '#3f7a4a'); disc(ctx, px - 7, my + 7, 5, '#2f6a3f'); disc(ctx, px + 7, my + 8, 5, '#4f8a5a'); R(px - 3, my + 10, 2, 8, '#3f7a4a'); R(px + 4, my + 11, 2, 5, '#2f6a3f');
    }
  }
  // colunas, entre as bancas
  for (let i = Math.floor((cam - 40) / VAO); i <= Math.floor((cam + v.w + 40) / VAO); i++) {
    const cx = i * VAO + 250 - cam;
    R(cx - 8, dy + 10, 16, gy - dy - 10, VERDE_D); R(cx - 8, dy + 10, 3, gy - dy - 10, VERDE_C); R(cx + 6, dy + 10, 2, gy - dy - 10, VERDE_E);
  }
  // bancas (ou a vidraça da esplanada); onde está o palco não há banca
  for (let i = Math.floor((cam - 80) / VAO) - 1; i <= Math.floor((cam + v.w + 80) / VAO); i++) {
    const wx = i * VAO + 165, x = wx - cam, nome = BANCAS[((i % BANCAS.length) + BANCAS.length) % BANCAS.length];
    if (o.entrada && wx < 110) continue;
    if (o.stageX !== undefined && Math.abs(wx - o.stageX) < 106) continue;
    if (nome === '*') vidraca(ctx, R, x, sy, gy, t); else banca(ctx, R, x, sy, gy, nome, i + 40);
  }
  if (o.entrada) entrada(ctx, R, 4 - cam, sy, gy);
  if (o.stageX !== undefined && o.stageX - cam > -80 && o.stageX - cam < v.w + 80) palco(ctx, R, o.stageX - cam, gy, t, { top: dy + 12, beat: o.beat, on: o.on });
  // a festa: grinalda de bandeirinhas
  if (o.bandeiras !== false) {
    for (let x = -(((cam % 9) + 9) % 9), i = Math.floor(cam / 9); x < v.w; x += 9, i++) {
      const y = dy + 9 + Math.round(Math.sin(i * 0.5) * 2);
      R(x, y, 9, 1, PAPER); R(x + 2, y + 1, 5, 3, FESTA[((i % 5) + 5) % 5]); R(x + 3, y + 4, 3, 2, FESTA[((i % 5) + 5) % 5]);
    }
  }
  chao(R, v, gy, cam);
}

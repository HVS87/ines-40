// Peças de desenho comuns aos níveis de praia (Ilha do Farol e Pedras d'El Rei): a praia vista
// de lado, o farol, o trolley da Isabel, a tenda, a fogueira, os barcos e as nove raparigas.
import { getCharacter } from '../sprites.js';
import { INK, SKIN, hash, sky, text, recolor } from '../draw.js';

// Linha do chão (os pés dos bonecos) por omissão.
export const chao = (v) => Math.round(v.h * (v.portrait ? 0.72 : 0.84));

// ---------- As nove raparigas ----------
// Pela ordem: Inês, Isabel, e as outras sete (a nona é uma amiga sem nome, feita aqui).
let grupo = null;
export const CORES = ['#ff8a4b', '#c79bff', '#3fa6a0', '#ffd166', '#ff5d8f', '#5a8fd0', '#ff8a4b', '#7be0b0', '#f2f2f7'];
export function raparigas() {
  if (!grupo) {
    grupo = ['ines', 'isabel', 'ana', 'soft', 'maisa', 'mi', 'maria', 'tete'].map((q) => getCharacter(q, 'praia'));
    grupo.push(recolor(getCharacter('tete', 'praia'), { '#1f1a2a': '#9a5a3a', '#3a3550': '#b87a52', '#7be0b0': '#f2f2f7', '#ffffff': '#5a8fd0' }));
  }
  return grupo;
}

// ---------- A praia ----------
// Céu, mar (com ondinhas e espuma) e areia. Devolve { sy: onde começa a areia, hy: horizonte }.
// o = { sy, hy, ceu: [...], agua: [fundo, onda, espuma], cores: [areia, grão escuro, grão claro],
//       cam: deslocamento da areia, fundo(L): desenhado entre o mar e a areia }
export const DIA = { ceu: ['#4fa8e6', '#8fd0f5', '#dff4fb'], agua: ['#2a86bd', '#56b4d8', '#eefaff'], cores: ['#f1d9a0', '#dcbf80', '#fbeec8'] };
export const TARDE = { ceu: ['#5a6fc0', '#f09a7a', '#ffd9a0'], agua: ['#3a6aa8', '#7a9ad0', '#ffe9d0'], cores: ['#eecb92', '#d4ab72', '#fbe2b4'] };
export const NOITE = { ceu: ['#0b0d2a', '#161a48', '#2c2a62'], agua: ['#141c44', '#2a3870', '#7088c8'], cores: ['#54496a', '#453b58', '#6c5f86'] };
export const MANHA = { ceu: ['#7ab6e8', '#ffd0c0', '#fff0d8'], agua: ['#3a8cc0', '#6cbcdc', '#f4fcff'], cores: ['#f3dca6', '#dfc388', '#fcf0cc'] };

export function praia(ctx, v, R, t, o = {}) {
  const P = v.portrait, gy = o.gy || chao(v);
  const sy = Math.round(o.sy !== undefined ? o.sy : gy - (P ? 34 : 16));
  const hy = Math.round(o.hy !== undefined ? o.hy : sy - (P ? 46 : 22));
  const L = { gy, sy, hy };
  sky(ctx, v.w, v.h, hy, o.ceu || DIA.ceu);
  if (o.ceuExtra) o.ceuExtra(L);
  const ag = o.agua || DIA.agua;
  R(0, hy, v.w, sy - hy, ag[0]);
  const W = v.w + 40;
  for (let y = hy + 2, k = 0; y < sy - 3; y += 4, k++) {
    for (let i = 0; i < 7; i++) {
      const x = ((hash(k * 13 + i * 1.7) * W + t * (3 + (k % 3) * 2) * (k % 2 ? 1 : -1)) % W + W) % W - 20;
      R(x, y, 5 + hash(i + k * 5) * 9, 1, ag[1]);
    }
  }
  if (o.fundo) o.fundo(L);
  // espuma à beira da areia
  const f = Math.round(Math.sin(t * 1.3) * 1.4);
  R(0, sy - 3 + f, v.w, 4, ag[1]);
  for (let x = 0; x < v.w; x += 6) R(x, sy - 2 + f + Math.round(Math.sin(x * 0.21 + t * 2)), 4, 1, ag[2]);
  // areia
  const ar = o.cores || DIA.cores, cam = o.cam || 0, WW = v.w + 16;
  R(0, sy, v.w, v.h - sy, ar[0]);
  R(0, sy, v.w, 1, ar[1]);
  for (let i = 0; i < 80; i++) {
    const x = ((hash(i * 3.3) * WW - cam) % WW + WW) % WW - 8, y = sy + 3 + hash(i * 7.1) * (v.h - sy - 4);
    R(x, y, hash(i) > 0.5 ? 2 : 1, 1, i % 3 ? ar[1] : ar[2]);
  }
  return L;
}

// Tufo de erva das dunas.
export function tufo(R, x, y, c = '#6f9a4a') {
  R(x, y - 3, 1, 3, c); R(x - 2, y - 2, 1, 2, c); R(x + 2, y - 4, 1, 4, c); R(x + 4, y - 2, 1, 2, c);
}

// ---------- O farol ----------
// Farol do Cabo de Santa Maria: torre branca alta, com nervuras de betão por fora, e lanterna e
// varandim vermelhos. (cx = centro, base = chão, H = altura total)
export function farol(ctx, R, cx, base, H, o = {}) {
  cx = Math.round(cx); base = Math.round(base); H = Math.round(H);
  const noite = !!o.noite;
  const wb = Math.max(7, Math.round(H * 0.19)), wt = Math.max(5, Math.round(H * 0.105));
  const hl = Math.max(7, Math.round(H * 0.15)), ht = H - hl;
  const c1 = noite ? '#8e90b8' : '#fbf8f0', c2 = noite ? '#6a6c94' : '#d9d3c6', c3 = noite ? '#4a4c72' : '#9f998c';
  const red = noite ? '#a8323a' : '#d8343c', redD = noite ? '#7a2430' : '#a3242c';
  // casa do faroleiro, na base
  const cw = Math.round(wb * 1.5), chh = Math.max(4, Math.round(H * 0.09));
  R(cx - wb / 2 - cw, base - chh, cw * 2 + wb, chh, c3);
  R(cx - wb / 2 - cw + 1, base - chh + 1, cw * 2 + wb - 2, chh - 1, c1);
  R(cx - wb / 2 - cw, base - chh - 1, cw * 2 + wb, 2, noite ? '#7a3a3a' : '#c8643c');
  if (H > 60) for (let k = 0; k < 2; k++) { R(cx - wb / 2 - cw + 4 + k * 7, base - chh + 3, 3, 3, noite ? '#ffd166' : '#5a8fb8'); R(cx + wb / 2 + 4 + k * 7, base - chh + 3, 3, 3, noite ? '#ffd166' : '#5a8fb8'); }
  // torre, fatia a fatia (afunila para cima)
  const ribs = H > 70 ? [-0.55, -0.1, 0.4] : [-0.2];
  for (let i = 0; i < ht; i++) {
    const hw = (wb + (wt - wb) * (i / ht)) / 2, y = base - 1 - i;
    R(cx - hw, y, hw * 2, 1, c1);
    R(cx + hw * 0.35, y, hw * 0.65, 1, c2);
    for (const p of ribs) R(cx + hw * p, y, 1, 1, c3);
    R(cx - hw, y, 1, 1, c3); R(cx + hw - 1, y, 1, 1, c3);
  }
  // anéis de betão
  const rings = H > 70 ? 5 : 3;
  for (let k = 1; k < rings; k++) {
    const i = Math.round((ht * k) / rings), hw = (wb + (wt - wb) * (i / ht)) / 2;
    R(cx - hw, base - 1 - i, hw * 2, 1, c3);
  }
  // janelinhas
  if (H > 50) for (const f of [0.3, 0.55, 0.8]) R(cx - 1, base - Math.round(ht * f), 1, Math.max(2, Math.round(H * 0.03)), noite ? '#ffd166' : '#4a5a70');
  // varandim e lanterna vermelhos
  const ty = base - ht, gw = wt + 4;
  R(cx - gw / 2, ty - 1, gw, 2, redD);
  R(cx - gw / 2, ty - 3, gw, 1, red);
  for (let x = 0; x < gw; x += 2) R(cx - gw / 2 + x, ty - 3, 1, 2, red);
  const lw = Math.max(3, wt - 2), lh = Math.max(3, hl - 6), ly = ty - 3 - lh;
  R(cx - lw / 2, ly, lw, lh + 2, red);
  R(cx - lw / 2 + 1, ly + 1, lw - 2, lh - 1, o.luz ? '#fff3b0' : noite ? '#3a3f6a' : '#cfeaf5');
  if (lw > 5) R(cx, ly + 1, 1, lh - 1, red);
  R(cx - lw / 2 - 1, ly - 1, lw + 2, 2, redD);
  R(cx - lw / 2 + 1, ly - 2, lw - 2, 1, red);
  R(cx, ly - 4, 1, 2, INK);
  // o feixe de luz, à noite, a rodar
  if (o.luz) {
    const sw = Math.sin((o.t || 0) * 0.7), dir = sw < 0 ? -1 : 1, len = Math.abs(sw) * (o.feixe || 120);
    const my = ly + Math.round(lh / 2);
    for (let i = 0; i < len; i += 2) {
      const hh = 2 + i * 0.13;
      ctx.globalAlpha = 0.5 * (1 - i / (len + 1));
      R(cx + dir * (lw / 2 + i) - (dir < 0 ? 2 : 0), my - hh, 2, hh * 2, '#fff3b0');
    }
    ctx.globalAlpha = 1;
  }
}

// Casinha baixa da aldeia (caiada), para pôr nas dunas.
export function casinha(R, x, y, w = 14, noite = false) {
  R(x, y - 7, w, 7, noite ? '#7c7ea6' : '#fbf8f0');
  R(x, y - 8, w, 1, noite ? '#5a4a5a' : '#c8643c');
  R(x + w - 3, y - 7, 3, 7, noite ? '#64668c' : '#dcd6c8');
  R(x + 3, y - 4, 2, 4, noite ? '#3a3f6a' : '#4a7fb0');
  R(x + 8, y - 5, 2, 2, noite ? '#ffd166' : '#4a5a70');
}

// ---------- O trolley da Isabel (piada recorrente) ----------
// Mala de rodinhas inclinada, puxada pela pega. (x, gy) = rodas; face = para que lado está a pega
// (quem puxa); s = escala (2 para bonecos com scale 2).
export function trolley(R, x, gy, s = 2, face = 1, o = {}) {
  x = Math.round(x); gy = Math.round(gy);
  const lean = o.lean === undefined ? 0.4 : o.lean, h = 6, w = 8, cor = o.cor || '#e8384f';
  const q = (a, i, ww, hh, c) => R(face > 0 ? x + a * s : x - (a + ww) * s, gy - (i + hh) * s, ww * s, hh * s, c);
  const off = (i) => Math.floor(i * lean);
  // pega (comprida, até à mão de quem puxa)
  for (let i = h; i < h + 3; i++) q(off(i) + 3, i + 2, 1, 1, INK);
  q(off(h + 2) + 2, h + 5, 3, 1, INK);
  // corpo da mala, com duas cintas
  q(off(0) - 4, 1, w, 1, INK);
  for (let i = 0; i < h; i++) {
    q(off(i) - 5, i + 2, w + 2, 1, INK);
    q(off(i) - 4, i + 2, w, 1, i === 1 || i === 4 ? '#a82238' : cor);
    q(off(i) - 4, i + 2, 1, 1, '#ff8a96');
  }
  q(off(h) - 4, h + 2, w, 1, INK);
  q(off(2), 4, 2, 2, '#ffd166');               // etiqueta de viagem
  // rodinhas
  q(-5, 0, 2, 2, INK); q(1, 0, 2, 2, INK);
}

// Os dois riscos que as rodinhas deixam na areia, de x0 até x1 (cam = deslocamento do chão).
export function riscos(R, x0, x1, gy, cam = 0, c = '#c9a868') {
  for (let x = Math.floor(x0); x < x1; x += 3) {
    const k = Math.floor((x + cam) / 3);
    if (hash(k) > 0.12) R(x, gy + 1 + (hash(k * 1.3) > 0.8 ? 1 : 0), 3, 1, c);
    if (hash(k + 50) > 0.12) R(x, gy + 4 + (hash(k * 2.1) > 0.8 ? 1 : 0), 3, 1, c);
  }
}

// ---------- A tenda individual (minúscula) ----------
// (x = centro, gy = chão) o = { s, h: altura em unidades (12 = montada), gordo: 0–1 (a rebentar
// pelas costuras), cor }
export function tenda(R, x, gy, o = {}) {
  x = Math.round(x); gy = Math.round(gy);
  const s = o.s || 2, h = Math.max(2, Math.round(o.h === undefined ? 12 : o.h)), hw0 = 11, g = o.gordo || 0;
  const c1 = o.cor || '#2fa8a0', c2 = '#1f7f7a', c3 = '#7fe0d4';
  const hw = (i) => hw0 * (1 - i / h) + 1 + g * 5 * Math.sin(Math.PI * Math.min(1, (i + 1) / h));
  for (let i = 0; i < h; i++) R(x - hw(i) * s - 1, gy - (i + 1) * s - 1, hw(i) * 2 * s + 2, s + 1, INK);
  for (let i = 0; i < h; i++) {
    const a = hw(i) * s;
    R(x - a, gy - (i + 1) * s, a * 2, s, c1);
    R(x + a * 0.4, gy - (i + 1) * s, a * 0.6, s, c2);
    R(x - a, gy - (i + 1) * s, Math.min(s, a), s, c3);
  }
  // a porta (fecho ao meio)
  const dh = Math.round(h * 0.7);
  for (let i = 0; i < dh; i++) { const a = 3.5 * (1 - i / dh) * s; R(x - a, gy - (i + 1) * s, a * 2, s, '#173f4a'); }
  // espias e estacas
  if (h >= 10) for (const d of [-1, 1]) {
    for (let k = 0; k < 5; k++) R(x + d * (hw0 * s + 2 + k * 2), gy - 8 + k * 2, 1, 1, INK);
    R(x + d * (hw0 * s + 12), gy - 3, 1, 3, '#8a8794');
  }
}

// ---------- A fogueira ----------
// f = tamanho da chama (0 = só brasas; 1 = grande). (x = centro, gy = chão)
export function fogueira(R, x, gy, f, t, s = 2) {
  x = Math.round(x); gy = Math.round(gy);
  // lenha cruzada
  R(x - 7 * s, gy - 2 * s, 14 * s, 2 * s, INK);
  R(x - 7 * s + 1, gy - 2 * s + 1, 14 * s - 2, 2 * s - 2, '#7a4a2a');
  R(x - 4 * s, gy - 3 * s, 8 * s, s, INK);
  R(x - 4 * s + 1, gy - 3 * s + 1, 8 * s - 2, s, '#96602e');
  for (let k = 0; k < 4; k++) R(x - 5 * s + k * 3 * s, gy - 2 * s + 1, s, s - 1 || 1, Math.sin(t * 5 + k * 2) > 0 ? '#ff9a2e' : '#e8452a');
  if (f <= 0.02) return;
  for (let k = -2; k <= 2; k++) {
    const hh = Math.max(1, (f * 13 + 2) * (1 - Math.abs(k) * 0.27) * (0.78 + 0.22 * Math.sin(t * 9 + k * 2.3))) * s;
    const bx = x + k * 2 * s - s, by = gy - 3 * s;
    R(bx, by - hh, 2 * s, hh, '#e8452a');
    R(bx, by - hh * 0.72, 2 * s, hh * 0.72, '#ff9a2e');
    if (Math.abs(k) < 2) R(bx, by - hh * 0.42, 2 * s, hh * 0.42, '#ffe066');
  }
  // faúlhas
  for (let k = 0; k < 3; k++) {
    const p = (t * 0.9 + k * 0.37) % 1;
    R(x + Math.sin(t * 3 + k * 2) * 6 * s * f, gy - (4 + f * 14 + p * 14) * s, 1, 1, p < 0.6 ? '#ffe066' : '#ff9a2e');
  }
}

// Lata de conserva. (x = centro, y = base) cor = rótulo.
export function lata(R, x, y, s, cor) {
  x = Math.round(x); y = Math.round(y);
  R(x - 3 * s - 1, y - 7 * s - 1, 6 * s + 2, 7 * s + 2, INK);
  R(x - 3 * s, y - 7 * s, 6 * s, 7 * s, '#c9ccd6');
  R(x - 3 * s, y - 5 * s, 6 * s, 3 * s, cor);
  R(x - 3 * s, y - 7 * s, s, 7 * s, '#eef0f6');
  R(x - 3 * s, y - 7 * s, 6 * s, 1, '#f4f6fa');
}

// ---------- Bonecos sentados e deitados ----------
// Sentada na areia: o tronco do boneco e as pernas esticadas para a frente.
export function sentada(ctx, R, frames, x, gy, face = 1, s = 2) {
  x = Math.round(x); gy = Math.round(gy);
  const img = frames.stand[face < 0 ? 'l' : 'r'], rows = img.height - 3;
  const x0 = face > 0 ? x + s : x - 9 * s;
  R(x0, gy - 3 * s, 8 * s, 3 * s, INK);
  R(x0 + (face > 0 ? 0 : s), gy - 2 * s, 7 * s, s, SKIN);
  ctx.drawImage(img, 0, 0, img.width, rows, x - (img.width / 2) * s, gy - rows * s, img.width * s, rows * s);
}

// Deitada de costas na areia, com a cabeça para a esquerda. Ocupa de x a x + 24·s, acima de gy.
export function deitada(ctx, frames, x, gy, s = 2) {
  const img = frames.stand.r;
  ctx.save();
  ctx.translate(Math.round(x), Math.round(gy));
  ctx.rotate(-Math.PI / 2);
  ctx.drawImage(img, 0, 0, img.width * s, img.height * s);
  ctx.restore();
}

// A dormir na areia, tapada com a toalha de praia (cor).
export function dorminhoca(ctx, R, frames, x, gy, cor, t, zzz = true, s = 2) {
  x = Math.round(x); gy = Math.round(gy);
  deitada(ctx, frames, x, gy, s);
  const bx = x + 12 * s, by = gy - 13 * s;
  R(bx - 1, by - 1, 12 * s + 2, 12 * s + 2, INK);
  R(bx, by, 12 * s, 12 * s, cor);
  for (let k = 1; k < 6; k += 2) R(bx + k * 2 * s, by, s, 12 * s, 'rgba(255,255,255,0.45)');
  R(bx, by + 10 * s, 12 * s, 2 * s, 'rgba(43,29,46,0.18)');
  if (zzz) {
    const p = (t * 0.6 + hash(x) * 3) % 1;
    text(ctx, 'Z', x + 6 * s + p * 6, gy - 16 * s - p * 10, '#fff6e6', { shadow: INK });
    if (p > 0.4) text(ctx, 'Z', x + 2 * s + p * 4, gy - 14 * s - p * 6, '#fff6e6', { shadow: INK });
  }
}

// ---------- Barcos ----------
// O barco de carreira de Olhão. (x = centro, wy = linha de água, s = escala)
export function barcoCarreira(ctx, R, x, wy, s, t) {
  const b = Math.round(Math.sin(t * 1.8));
  const q = (a, c, w, h, col) => R(x + a * s, wy + c * s + b, w * s, h * s, col);
  q(-2, -27, 1, 9, INK); q(-1, -27, 2, 2, '#2f8a4a'); q(1, -27, 3, 2, '#d43d3d');
  q(-19, -19, 36, 2, '#2f6fb5');
  q(-17, -17, 32, 10, INK); q(-16, -16, 30, 9, '#ffffff');
  for (let k = 0; k < 5; k++) q(-14 + k * 5.6, -14, 4, 4, '#6fc0e8');
  q(-25, -8, 50, 8, INK); q(-24, -7, 48, 6, '#f4f4f8'); q(-24, -4, 48, 2, '#2f6fb5');
  q(25, -8, 2, 4, INK); q(25, -7, 1, 2, '#f4f4f8');
  if (s >= 2) text(ctx, 'OLHÃO', Math.round(x - 20 * s), Math.round(wy - 7 * s + b) + 1, '#2f6fb5');
}

// A lancha da GNR, com dois guardas (um de megafone). (x = centro, wy = linha de água)
export function lancha(ctx, R, x, wy, s, t, guarda, face = -1) {
  const b = Math.round(Math.sin(t * 2.2));
  const q = (a, c, w, h, col) => R(face < 0 ? x + a * s : x - (a + w) * s, wy + c * s + b, w * s, h * s, col);
  // os guardas (da cintura para cima)
  if (guarda) {
    const img = guarda.stand[face < 0 ? 'l' : 'r'], k = s * 0.62;
    for (const a of [-8, 4]) {
      const gx = face < 0 ? x + a * s : x - a * s;
      ctx.drawImage(img, 0, 0, img.width, 18, Math.round(gx - 8 * k), Math.round(wy - 6 * s - 17 * k + b), Math.round(16 * k), Math.round(18 * k));
    }
    // megafone
    q(-16, -12, 3, 3, '#fff6e6'); q(-19, -13, 3, 5, '#e0572f'); q(-20, -14, 1, 7, INK);
  }
  // casco
  q(-21, -7, 42, 7, INK); q(-20, -6, 40, 5, '#eef1f4'); q(-20, -3, 40, 1, '#2f7a4a'); q(-20, -2, 40, 1, '#c9ced6');
  q(-24, -9, 5, 3, INK); q(-23, -8, 4, 2, '#eef1f4');
  // cabina e luz azul
  q(9, -13, 11, 7, INK); q(10, -12, 9, 6, '#dfe5ea'); q(11, -11, 6, 3, '#6fc0e8');
  q(13, -15, 2, 2, Math.floor(t * 5) % 2 ? '#3f8fff' : '#bfd9ff');
  if (s >= 1.2) text(ctx, 'GNR', Math.round(x - 6 * s), Math.round(wy - 6 * s + b) + (s >= 1.6 ? 1 : 0), '#2f7a4a');
}

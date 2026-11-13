// Nível 21 «Lanheses»: os cenários da Casa do Tinoco, partilhados pelos atos do nível — o céu
// e os montes do Minho, a casa de granito, a vinha em latada, o espigueiro enorme (caixa de
// granito com fendas, sobre pilares com lajes redondas, telhado de duas águas e cruz) e a
// eira lajeada onde o milho seca.
import { INK, PAPER, GOLD, hash, sky, hills, disc, sign } from '../draw.js';

const GRANITO = '#b9b2a6', GRANITO_L = '#d2ccc0', GRANITO_D = '#8f887c';

// Céu e montes verdes. escuro: 0 (sol) a 1 (vem aí chuva).
export function ceu(ctx, v, R, gy, escuro = 0) {
  sky(ctx, v.w, v.h, gy, escuro > 0.5 ? ['#6a7a92', '#8e9cb0', '#b8c2cc'] : ['#4fa6e6', '#8fcdf0', '#d8ecf3']);
  hills(ctx, v.w, v.h, gy, 0, 0, 34, 12, escuro > 0.5 ? '#5a8a62' : '#7fbf78', 2);
  hills(ctx, v.w, v.h, gy, 60, 1, 16, 8, escuro > 0.5 ? '#4a7a52' : '#5aa85a', 5);
}

export function sol(ctx, x, y) { disc(ctx, x, y, 9, '#fff1a8'); disc(ctx, x, y, 7, GOLD); }

export function nuvem(ctx, R, x, y, cor = '#ffffff', sombra = '#d8e4ee') {
  x = Math.round(x); y = Math.round(y);
  disc(ctx, x - 14, y + 2, 8, cor); disc(ctx, x, y - 3, 11, cor); disc(ctx, x + 14, y + 1, 9, cor); disc(ctx, x + 26, y + 4, 6, cor);
  R(x - 22, y + 4, 54, 7, cor); R(x - 20, y + 9, 50, 2, sombra);
}

// A casa de granito, com a base em gy e o canto esquerdo em x.
export function casaGranito(ctx, R, x, gy, w, h) {
  x = Math.round(x);
  const th = Math.round(h * 0.28), y = gy - h + th;
  R(x - 1, y - 1, w + 2, h - th + 1, INK); R(x, y, w, h - th, GRANITO);
  for (let k = 0; k < Math.round(w * h * 0.012); k++) { const bx = x + 2 + Math.round(hash(k + 1) * (w - 10)), by = y + 3 + Math.round(hash(k * 1.7 + 4) * (h - th - 8)); R(bx, by, 6, 3, k % 2 ? GRANITO_L : GRANITO_D); }
  // telhado de telha
  for (let r = 0; r < th; r++) { const inset = Math.round(((th - r) / th) * 8) - 4; R(x + inset, y - th + r, w - inset * 2, 1, r % 3 === 0 ? '#a8462e' : '#c75a3a'); }
  R(x - 4, y - 1, w + 8, 2, '#8a3a26');
  R(x + Math.round(w * 0.7), y - th - 5, 7, 8, GRANITO_D); R(x + Math.round(w * 0.7) - 1, y - th - 6, 9, 2, INK);
  // porta e janelas
  const dw = 12, dx = x + Math.round(w / 2 - dw / 2);
  R(dx - 2, gy - 24, dw + 4, 24, GRANITO_L); R(dx, gy - 22, dw, 22, '#5a2f2a'); R(dx + dw / 2 - 1, gy - 22, 1, 22, '#3a1f1c'); R(dx + dw - 3, gy - 11, 1, 2, GOLD);
  for (const fx of [0.18, 0.82]) { const jx = x + Math.round(w * fx) - 5; if (w > 60) { R(jx - 2, y + 7, 14, 16, GRANITO_L); R(jx, y + 9, 10, 12, PAPER); R(jx + 1, y + 10, 8, 10, '#5a7fa8'); R(jx + 4, y + 10, 1, 10, PAPER); R(jx + 1, y + 14, 8, 1, PAPER); } }
}

// Vinha em latada: esteios de granito e as videiras por cima.
export function latada(R, x0, x1, gy, alt) {
  const y = gy - alt;
  for (let x = x0; x <= x1; x += 26) { R(x - 1, y, 4, alt, INK); R(x, y, 2, alt, GRANITO_L); }
  R(x0 - 6, y - 2, x1 - x0 + 14, 2, '#6b4a2e');
  for (let x = x0 - 8; x < x1 + 8; x += 5) {
    const d = Math.round(hash(x * 0.37) * 3);
    R(x, y - 8 + d, 7, 7 - d, x % 2 ? '#3f8a4a' : '#4fa65a'); R(x + 1, y - 9 + d, 3, 2, '#6fc070');
    if (hash(x * 1.9) > 0.62) { R(x + 2, y + 1, 3, 3, '#6a3f8a'); R(x + 3, y + 4, 1, 2, '#6a3f8a'); }
  }
}

// O espigueiro: canto esquerdo em x, base em gy. cheio (0–1): o milho que se vê pelas fendas.
export function espigueiro(R, x, gy, w, h, cheio = 0.3) {
  x = Math.round(x);
  const ph = Math.round(h * 0.24), rh = Math.round(h * 0.22), bh = h - ph - rh - 8;
  const by = gy - ph - bh;
  // pilares com as lajes redondas (as «mesas», que não deixam subir os ratos)
  const n = Math.max(3, Math.round(w / 34));
  for (let k = 0; k < n; k++) {
    const px = x + 6 + Math.round((k * (w - 18)) / (n - 1));
    R(px - 1, gy - ph + 3, 8, ph - 3, INK); R(px, gy - ph + 3, 6, ph - 3, GRANITO); R(px, gy - ph + 3, 2, ph - 3, GRANITO_L);
    R(px - 5, gy - ph - 1, 16, 5, INK); R(px - 4, gy - ph, 14, 3, GRANITO_L);
  }
  // a caixa de granito com fendas
  R(x - 1, by - 1, w + 2, bh + 2, INK); R(x, by, w, bh, '#4a3a2a');
  const mh = Math.round((bh - 6) * cheio);
  R(x + 3, by + bh - 3 - mh, w - 6, mh, '#e0a830');
  for (let k = 0; k < mh; k += 3) for (let j = (k % 2) * 3; j < w - 8; j += 7) R(x + 4 + j, by + bh - 5 - k, 2, 1, '#f6d060');
  for (let sx = x + 4; sx < x + w - 4; sx += 4) R(sx, by + 3, 3, bh - 6, (sx / 4) % 2 < 1 ? GRANITO : GRANITO_L);
  R(x, by, w, 3, GRANITO_L); R(x, by + bh - 3, w, 3, GRANITO_L); R(x, by + bh - 1, w, 1, GRANITO_D);
  R(x, by, 4, bh, GRANITO_L); R(x + w - 4, by, 4, bh, GRANITO_L);
  for (let k = 1; k < n - 1; k++) { const px = x + 7 + Math.round((k * (w - 18)) / (n - 1)); R(px, by, 4, bh, GRANITO_L); R(px + 3, by + 3, 1, bh - 6, GRANITO_D); }
  // a porta de madeira
  R(x + w - 22, by + 4, 12, bh - 7, INK); R(x + w - 21, by + 5, 10, bh - 9, '#8a5a34'); R(x + w - 16, by + 5, 1, bh - 9, '#6b4226');
  // telhado de duas águas e as cruzes
  for (let r = 0; r < rh; r++) { const inset = Math.round(((rh - r) / rh) * 6) - 4; R(x + inset, by - rh + r - 1, w - inset * 2, 1, r % 3 === 0 ? '#a8462e' : '#c75a3a'); }
  R(x - 5, by - 2, w + 10, 2, '#8a3a26'); R(x + 2, by - rh - 2, w - 4, 2, '#8a3a26');
  for (const cx of [x + 5, x + w - 6]) { R(cx - 2, by - rh - 12, 5, 11, INK); R(cx - 4, by - rh - 9, 9, 4, INK); R(cx - 1, by - rh - 11, 3, 9, GRANITO_L); R(cx - 3, by - rh - 8, 7, 2, GRANITO_L); }
}

// A eira: um chão enorme de lajes de granito, da linha gy até ao fundo do ecrã.
export function eira(R, v, gy) {
  R(0, gy, v.w, v.h - gy, '#cfc8ba'); R(0, gy, v.w, 2, '#e6e0d4');
  for (let y = gy + 9, r = 0; y < v.h; y += 9 + r, r++) {
    R(0, y, v.w, 1, '#a8a092');
    for (let x = (r % 2) * 17 + 8; x < v.w; x += 34 + r * 3) R(x, y - 8 - r + 1, 1, 8 + r - 1, '#a8a092');
  }
}

// Um monte de espigas a secar.
export function monte(R, x, y, molhado = false) {
  x = Math.round(x); y = Math.round(y);
  const a = molhado ? '#b08a3a' : '#f2b830', b = molhado ? '#8a6a2a' : '#ffd95a';
  R(x - 11, y - 3, 22, 4, INK); R(x - 8, y - 6, 16, 4, INK); R(x - 4, y - 8, 8, 3, INK);
  R(x - 10, y - 2, 20, 2, a); R(x - 7, y - 5, 14, 3, a); R(x - 3, y - 7, 6, 2, a);
  R(x - 6, y - 4, 3, 1, b); R(x + 1, y - 5, 3, 1, b); R(x - 2, y - 2, 4, 1, b); R(x + 5, y - 2, 3, 1, b); R(x - 9, y - 1, 2, 1, '#7fae4a');
}

export function placa(ctx, cx, y) { sign(ctx, 'CASA DO TINOCO', cx, y, { bg: '#5a4630', color: PAPER }); }

// Nível 21 «Madrinha do Micas»: cenários e desenhos partilhados pelos atos do batizado — a
// igreja por dentro (arcos, vitral, altar), a pia batismal, o círio pascal, a igreja por fora
// e o Micas, desenhado à mão, de veste branca.
import { INK, PAPER, GOLD, SKIN, hash, sky, disc } from '../draw.js';

const PEDRA = '#e6dcc4', PEDRA_D = '#c9bc9e', PEDRA_L = '#f4ecd8';

// O Micas embrulhado na veste branca, com a cabeça à esquerda (dir = 1) ou à direita (-1).
// (x, y) = centro; s = tamanho do píxel; cara: 'calmo' | 'riso' | 'agitado' | 'choro' | 'sono'.
export function bebe(R, x, y, s = 1, cara = 'calmo', dir = 1, t = 0) {
  x = Math.round(x); y = Math.round(y);
  const P = (dx, dy, w, h, c) => R(dir > 0 ? x + dx * s : x - (dx + w) * s, y + dy * s, w * s, h * s, c);
  // veste branca (22 x 9 píxeis ao todo)
  P(-4, -3, 15, 7, INK); P(-3, -2, 13, 5, '#ffffff'); P(-3, 2, 13, 1, '#dcd6ea'); P(1, -1, 1, 3, '#dcd6ea'); P(5, -1, 1, 3, '#dcd6ea'); P(9, -1, 1, 2, '#dcd6ea');
  // cabeça
  P(-11, -4, 8, 8, INK); P(-10, -3, 6, 6, SKIN); P(-10, -3, 6, 1, '#8a5a34'); P(-8, -4, 3, 1, '#8a5a34'); P(-10, -2, 1, 1, '#8a5a34');
  const olho = cara === 'calmo' || cara === 'sono' || cara === 'choro' ? '#b07a5a' : INK;
  P(-9, -1, 1, 1, olho); P(-6, -1, 1, 1, olho);
  if (cara === 'riso') { P(-9, 1, 4, 1, '#c2544c'); P(-10, 0, 1, 1, '#f09a8c'); P(-5, 0, 1, 1, '#f09a8c'); }
  else if (cara === 'agitado') { P(-8, 0, 2, 2, '#7a2e2a'); P(-9, -2, 1, 1, INK); P(-6, -2, 1, 1, INK); }
  else if (cara === 'choro') { P(-8, 0, 3, 2, '#7a2e2a'); const d = Math.floor(t * 6) % 2; P(-10, d, 1, 2, '#6fc8ff'); P(-5, 1 - d, 1, 2, '#6fc8ff'); }
  else if (cara === 'sono') P(-8, 1, 1, 1, '#c2544c');
  else P(-8, 1, 2, 1, '#c2544c');
}

// A igreja por dentro: parede de pedra clara com arcos, um vitral ao meio, o altar e o chão.
export function igreja(ctx, v, R, gy, top, t = 0) {
  const w = v.w;
  R(0, 0, w, gy, PEDRA);
  for (let k = 0; k < 50; k++) R(Math.round(hash(k + 2) * w), Math.round(hash(k * 1.9 + 7) * gy), 7, 3, k % 2 ? PEDRA_L : PEDRA_D);
  // arcos
  const n = v.portrait ? 2 : 3, aw = w / n, ay = Math.max(top - 8, gy - (v.portrait ? 230 : 120));
  for (let k = 0; k < n; k++) {
    const cx = Math.round(aw * (k + 0.5)), r = Math.round(Math.min(aw * 0.36, 60));
    disc(ctx, cx, ay + r, r + 3, PEDRA_D); disc(ctx, cx, ay + r, r, '#d8cdb0'); R(cx - r, ay + r, r * 2, gy - ay - r, '#d8cdb0');
    R(cx - r - 3, ay + r, 3, gy - ay - r, PEDRA_D); R(cx + r, ay + r, 3, gy - ay - r, PEDRA_D);
    // vitral (no arco do meio) ou janela alta
    const vw = 14, vh = Math.min(34, gy - ay - 60), vy = ay + Math.round(r * 0.35) + 4;
    if (vh > 14) {
      R(cx - vw / 2 - 1, vy - 1, vw + 2, vh + 2, INK); disc(ctx, cx, vy, vw / 2 + 1, INK); disc(ctx, cx, vy, vw / 2, '#ffd166');
      const cores = ['#e0527a', '#3f8fd0', '#ffd166', '#4fb888', '#c79bff', '#ff8a4b'];
      for (let j = 0; j < 6; j++) R(cx - vw / 2 + (j % 2) * (vw / 2), vy + Math.floor(j / 2) * Math.ceil(vh / 3), vw / 2, Math.ceil(vh / 3), cores[(j + k * 2) % 6]);
      R(cx - 1, vy - 4, 2, vh + 4, INK); R(cx - vw / 2, vy + Math.round(vh * 0.3), vw, 2, INK);
      // luz colorida a entrar
      R(cx - vw / 2 - 2, vy + vh + 1, vw + 4, gy - vy - vh - 1, 'rgba(255,220,140,0.10)');
    }
  }
  // chão em xadrez
  R(0, gy, w, v.h - gy, '#b9a888'); R(0, gy, w, 2, '#8f7f62');
  for (let y = gy + 2, r = 0; y < v.h; y += 8, r++) for (let x = (r % 2) * 12 - 6; x < w; x += 24) R(x, y, 12, 8, '#a39070');
}

// O altar, ao fundo (centro em x, base em gy).
export function altar(R, x, gy) {
  x = Math.round(x);
  R(x - 23, gy - 23, 46, 23, INK); R(x - 22, gy - 22, 44, 22, PAPER); R(x - 22, gy - 22, 44, 4, '#ffffff'); R(x - 22, gy - 12, 44, 2, GOLD);
  R(x - 2, gy - 40, 4, 18, GOLD); R(x - 7, gy - 35, 14, 3, GOLD);
  for (const d of [-16, 16]) { R(x + d - 1, gy - 32, 3, 10, PAPER); R(x + d, gy - 35, 1, 3, '#ff8a2b'); }
}

// A pia batismal de pedra (centro em x, base em gy).
export function pia(R, x, gy) {
  x = Math.round(x);
  R(x - 9, gy - 4, 18, 4, INK); R(x - 8, gy - 3, 16, 3, '#b8b0a0');
  R(x - 4, gy - 18, 8, 15, INK); R(x - 3, gy - 18, 6, 15, '#cfc8b8'); R(x - 3, gy - 18, 2, 15, '#e6e0d2');
  R(x - 14, gy - 28, 28, 11, INK); R(x - 13, gy - 27, 26, 9, '#cfc8b8'); R(x - 13, gy - 27, 26, 2, '#8fd0f5'); R(x - 11, gy - 27, 6, 1, '#ffffff');
  R(x - 11, gy - 22, 22, 1, '#a8a090'); R(x - 2, gy - 23, 4, 4, '#a8a090');
}

// O círio pascal no seu castiçal (centro em x, base em gy); alt = altura total.
export function cirio(R, x, gy, alt, t = 0) {
  x = Math.round(x);
  const ph = Math.round(alt * 0.4);
  R(x - 8, gy - 3, 16, 3, INK); R(x - 7, gy - 2, 14, 2, GOLD); R(x - 2, gy - ph, 4, ph - 2, INK); R(x - 1, gy - ph, 2, ph - 2, GOLD);
  R(x - 6, gy - ph - 2, 12, 3, INK); R(x - 5, gy - ph - 1, 10, 1, GOLD);
  const top = gy - alt;
  R(x - 4, top, 8, alt - ph - 2, INK); R(x - 3, top + 1, 6, alt - ph - 3, PAPER); R(x - 3, top + 1, 2, alt - ph - 3, '#ffffff');
  R(x - 1, top + 6, 2, 8, '#c0392b'); R(x - 2, top + 8, 4, 2, '#c0392b');
  const f = Math.floor(t * 8) % 2;
  R(x - 1, top - 5 - f, 3, 5 + f, '#ff8a2b'); R(x, top - 3, 1, 3, '#fff1a8');
}

// A igreja por fora: fachada branca com cantaria, portal, óculo e sineira.
export function fachada(ctx, v, R, gy, top, cx) {
  const w = v.w;
  sky(ctx, w, v.h, gy, ['#4fa6e6', '#8fcdf0', '#d8ecf3']);
  cx = Math.round(cx);
  const fw = Math.min(150, Math.round(w * 0.62)), fh = Math.min(gy - top - 22, v.portrait ? 170 : 96), x = cx - Math.round(fw / 2), y = gy - fh;
  // árvores
  for (const tx of [x - 22, x + fw + 22]) { R(tx - 2, gy - 22, 4, 22, '#6b4a2e'); disc(ctx, tx, gy - 30, 13, '#3f8a4a'); disc(ctx, tx - 5, gy - 34, 7, '#4fa65a'); }
  R(x - 1, y - 1, fw + 2, fh + 1, INK); R(x, y, fw, fh, '#fbf6ea');
  R(x, y, 6, fh, PEDRA_D); R(x + fw - 6, y, 6, fh, PEDRA_D); R(x, y, fw, 4, PEDRA_D);
  // frontão e sineira com cruz
  const th = Math.min(22, y - top + 6);
  for (let r = 0; r < th; r++) { const inset = Math.round(((th - r) / th) * (fw / 2 - 12)); R(x + inset - 1, y - th + r - 1, fw - inset * 2 + 2, 1, INK); }
  for (let r = 0; r < th; r++) { const inset = Math.round(((th - r) / th) * (fw / 2 - 12)); R(x + inset, y - th + r, fw - inset * 2, 1, '#fbf6ea'); R(x + inset, y - th + r, 4, 1, PEDRA_D); R(x + fw - inset - 4, y - th + r, 4, 1, PEDRA_D); }
  R(cx - 9, y - th - 12, 18, 16, INK); R(cx - 8, y - th - 11, 16, 14, '#fbf6ea'); R(cx - 4, y - th - 8, 8, 9, '#5a7fa8'); R(cx - 2, y - th - 6, 4, 5, GOLD);
  R(cx - 1, y - th - 20, 3, 8, INK); R(cx - 3, y - th - 18, 7, 2, INK);
  // óculo e portal
  disc(ctx, cx, y + Math.round(fh * 0.24), 8, PEDRA_D); disc(ctx, cx, y + Math.round(fh * 0.24), 6, '#5a7fa8'); R(cx - 1, y + Math.round(fh * 0.24) - 6, 1, 12, PEDRA_D); R(cx - 6, y + Math.round(fh * 0.24) - 1, 12, 1, PEDRA_D);
  const dw = 30, dh = Math.min(48, Math.round(fh * 0.5));
  disc(ctx, cx, gy - dh, dw / 2 + 3, PEDRA_D); R(cx - dw / 2 - 3, gy - dh, dw + 6, dh, PEDRA_D);
  disc(ctx, cx, gy - dh, dw / 2, '#6b3a2a'); R(cx - dw / 2, gy - dh, dw, dh, '#6b3a2a'); R(cx - 1, gy - dh - dw / 2, 1, dh + dw / 2, '#3a1f1c');
  R(cx - 5, gy - Math.round(dh / 2), 2, 2, GOLD); R(cx + 3, gy - Math.round(dh / 2), 2, 2, GOLD);
  // adro e degraus
  R(0, gy, w, v.h - gy, '#cfc8ba'); R(0, gy, w, 2, '#e6e0d4');
  R(cx - dw, gy - 3, dw * 2, 3, '#b8b0a0'); R(cx - dw - 6, gy, dw * 2 + 12, 3, '#b8b0a0');
  for (let yy = gy + 10, r = 0; yy < v.h; yy += 10, r++) { R(0, yy, w, 1, '#a8a092'); for (let xx = (r % 2) * 16; xx < w; xx += 32) R(xx, yy - 9, 1, 9, '#a8a092'); }
}

// Pétalas e arroz a cair (só enfeite).
export function petalas(R, v, t, n = 26) {
  for (let k = 0; k < n; k++) {
    const x = (hash(k + 1) * v.w + Math.sin(t * 1.5 + k) * 8) % v.w, y = ((t * (18 + hash(k * 3) * 22) + hash(k * 7) * v.h) % v.h);
    R(x, y, k % 3 ? 2 : 1, k % 3 ? 1 : 2, k % 3 === 0 ? '#ffffff' : k % 3 === 1 ? '#ffb0c8' : '#ff8ab0');
  }
}

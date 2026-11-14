// Nível 21 «Lanheses»: os cenários da casa de família do Lourenço, desenhados a partir das
// fotografias da casa e partilhados pelos atos do nível — o céu, a serra ao longe, a mata, os
// campos de milho e os cavalos; a casa caiada com cantaria de granito, telhado de telha, escadaria
// exterior e hortênsias; a vinha em latada; o espigueiro comprido (ripas de madeira vermelha entre
// esteios de granito, sobre pilares com lajes redondas, telhado de telha e cruzes); a eira lajeada
// com a guarita de porta vermelha; o celeiro de pedra ao lado da piscina.
import { INK, PAPER, GOLD, hash, sky, hills, disc, sign } from '../draw.js';

const GRANITO = '#b9b2a6', GRANITO_L = '#d2ccc0', GRANITO_D = '#8f887c', CAL = '#f7f4ec', CAL_S = '#e2ddd0';
const TELHA = '#c75a3a', TELHA_D = '#a8462e', BEIRAL = '#8a3a26';
const HORTENSIAS = ['#8fa8e8', '#b79ae8', '#f0a8c8', '#a8c8f0'];

// Céu, a Serra d'Arga ao longe (um monte largo e careca), a mata, os campos de milho e dois
// cavalos a pastar. escuro: 0 (sol) a 1 (vem aí chuva).
export function ceu(ctx, v, R, gy, escuro = 0) {
  const feio = escuro > 0.5, w = v.w;
  sky(ctx, w, v.h, gy, feio ? ['#6a7a92', '#8e9cb0', '#b8c2cc'] : ['#4fa6e6', '#8fcdf0', '#d8ecf3']);
  const cx = w * 0.7, a = w * 0.46, alto = 30;
  for (let x = 0; x < w; x += 2) {
    const u = (x - cx) / a, hh = u * u < 1 ? Math.round(alto * Math.pow(1 - u * u, 0.8)) : 0;
    if (hh <= 0) continue;
    R(x, gy - 22 - hh, 2, hh + 8, feio ? '#6f8496' : '#8fa6ba');
    if (hh > alto * 0.72) R(x, gy - 22 - hh, 2, Math.min(4, hh - Math.round(alto * 0.72)), feio ? '#8a9aa6' : '#b8c6cc');
  }
  hills(ctx, w, v.h, gy, 0, 0, 19, 6, feio ? '#3f6a4a' : '#3f8a4a', 2);
  // os campos de milho, em linhas
  R(0, gy - 9, w, 9, feio ? '#5a9a4a' : '#7fc84a'); R(0, gy - 9, w, 1, feio ? '#6aa85a' : '#a4e06a');
  for (let x = 1; x < w; x += 3) R(x, gy - 8, 1, 8, feio ? '#4a8a3f' : '#62b03a');
  for (const [fx, c] of [[0.52, '#8a5a34'], [0.6, '#f2ede2']]) {
    const hx = Math.round(w * fx), hy = gy - 11;
    R(hx - 4, hy - 4, 8, 3, c); R(hx - 4, hy - 1, 1, 3, c); R(hx + 3, hy - 1, 1, 3, c); R(hx - 5, hy - 4, 1, 3, c);
    R(hx + 4, hy - 5, 2, 3, c); R(hx + 5, hy - 2, 2, 2, c);        // pescoço e cabeça, a pastar
  }
}

export function sol(ctx, x, y) { disc(ctx, x, y, 9, '#fff1a8'); disc(ctx, x, y, 7, GOLD); }

export function nuvem(ctx, R, x, y, cor = '#ffffff', sombra = '#d8e4ee') {
  x = Math.round(x); y = Math.round(y);
  disc(ctx, x - 14, y + 2, 8, cor); disc(ctx, x, y - 3, 11, cor); disc(ctx, x + 14, y + 1, 9, cor); disc(ctx, x + 26, y + 4, 6, cor);
  R(x - 22, y + 4, 54, 7, cor); R(x - 20, y + 9, 50, 2, sombra);
}

// Uma sebe de hortênsias (azuis, lilases e cor-de-rosa), de x0 a x1, com a base em gy.
export function hortensias(ctx, R, x0, x1, gy) {
  for (let x = Math.round(x0) + 4, k = 0; x < x1 - 2; x += 8, k++) {
    disc(ctx, x, gy - 4, 5, k % 2 ? '#3f7a4a' : '#2f6a3f');
    const c = HORTENSIAS[(k + Math.round(x0)) % 4];
    disc(ctx, x - 2, gy - 6, 2, c); disc(ctx, x + 2, gy - 4, 2, HORTENSIAS[(k + Math.round(x0) + 1) % 4]); R(x - 1, gy - 9, 2, 2, c);
  }
}

// A casa: paredes caiadas de branco com cunhais e molduras de granito, telhado de telha,
// escadaria exterior de pedra até ao primeiro andar e hortênsias à volta. Base em gy, canto
// esquerdo em x.
export function casaGranito(ctx, R, x, gy, w, h) {
  x = Math.round(x);
  const th = Math.round(h * 0.24), y = gy - h + th, ah = h - th;        // y = beiral · ah = altura das paredes
  R(x - 1, y - 1, w + 2, ah + 1, INK); R(x, y, w, ah, CAL);
  R(x, y, w, 2, CAL_S);
  // cunhais e rodapé de granito
  for (let k = 0, yy = y; yy < gy - 3; yy += 5, k++) {
    const cw = k % 2 ? 4 : 6, c = k % 2 ? GRANITO : GRANITO_L, hh = Math.min(5, gy - 3 - yy);
    R(x, yy, cw, hh, c); R(x + w - cw, yy, cw, hh, c);
  }
  R(x, gy - 3, w, 3, GRANITO); R(x, gy - 3, w, 1, GRANITO_L);
  // telhado de telha e chaminé
  R(x + Math.round(w * 0.18), y - th - 6, 7, 10, CAL); R(x + Math.round(w * 0.18) - 1, y - th - 7, 9, 2, GRANITO_D);
  for (let r = 0; r < th; r++) { const inset = Math.round(((th - r) / th) * 8) - 4; R(x + inset, y - th + r, w - inset * 2, 1, r % 3 === 0 ? TELHA_D : TELHA); }
  R(x - 4, y - 1, w + 8, 2, BEIRAL);
  // janelas e portas com moldura de granito
  const janela = (jx, jy, jw = 9, jh = 11) => {
    R(jx - 2, jy - 2, jw + 4, jh + 4, GRANITO); R(jx - 2, jy - 2, jw + 4, 1, GRANITO_L);
    R(jx, jy, jw, jh, PAPER); R(jx + 1, jy + 1, jw - 2, jh - 2, '#4a6a8a'); R(jx + Math.floor(jw / 2), jy + 1, 1, jh - 2, PAPER); R(jx + 1, jy + Math.floor(jh / 2), jw - 2, 1, PAPER);
  };
  const porta = (px, py, pw, ph) => {
    R(px - 2, py - 2, pw + 4, ph + 2, GRANITO); R(px - 2, py - 2, pw + 4, 1, GRANITO_L);
    R(px, py, pw, ph, '#2f5a44'); R(px + Math.floor(pw / 2), py, 1, ph, '#234636'); R(px + pw - 3, py + Math.floor(ph / 2), 1, 2, GOLD);
  };
  if (w < 70 || ah < 44) {
    // casa pequena (ao longe): um piso, porta ao meio e duas janelas
    porta(x + Math.round(w / 2) - 5, gy - 21, 10, 18);
    if (w > 46) for (const fx of [0.2, 0.8]) janela(x + Math.round(w * fx) - 4, gy - 21, 8, 10);
    hortensias(ctx, R, x + 2, x + Math.round(w * 0.36), gy);
    return;
  }
  const piso = y + Math.round(ah * 0.52);                               // altura do primeiro andar
  // primeiro andar: duas janelas e a porta ao cimo da escadaria
  janela(x + Math.round(w * 0.13), y + 6);
  janela(x + Math.round(w * 0.33), y + 6);
  porta(x + Math.round(w * 0.76), y + 5, 9, piso - y - 5);
  // rés do chão: janela pequena e porta verde
  janela(x + Math.round(w * 0.13), piso + 6, 8, 8);
  porta(x + Math.round(w * 0.31), gy - 20, 10, 17);
  // a escadaria exterior: degraus de granito e guarda caiada, a subir da esquerda para a direita
  const e0 = x + Math.round(w * 0.47), e1 = x + Math.round(w * 0.72), fim = x + Math.round(w * 0.9);
  for (let px = e0; px < e1; px++) {
    const top = Math.round(gy - 3 - ((px - e0) / (e1 - e0)) * (gy - 3 - piso));
    R(px, top - 6, 1, gy - top + 3, CAL); R(px, top - 7, 1, 2, GRANITO_D); R(px, top - 6, 1, 1, GRANITO_L);
    if ((px - e0) % 3 === 0) R(px, top - 4, 1, 2, CAL_S);                 // os degraus
  }
  R(e1, piso - 6, fim - e1, 6, CAL); R(e1, piso - 7, fim - e1, 2, GRANITO_D); R(e1, piso - 6, fim - e1, 1, GRANITO_L);
  R(e0 - 1, gy - 9, 1, 6, GRANITO_D);
  R(e1 + 4, gy - 15, 8, 12, '#3a3a44'); R(e1 + 3, gy - 16, 10, 1, GRANITO);       // a arrecadação por baixo do patamar
  hortensias(ctx, R, x + 2, e0 - 2, gy);
  hortensias(ctx, R, fim - 2, x + w - 2, gy);
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

// O espigueiro: canto esquerdo em x, base em gy. cheio (0–1): o milho que se vê entre as ripas.
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
  // a caixa: ripas de madeira vermelha entre esteios de granito
  R(x - 1, by - 1, w + 2, bh + 2, INK); R(x, by, w, bh, '#4a3a2a');
  const mh = Math.round((bh - 6) * cheio);
  R(x + 3, by + bh - 3 - mh, w - 6, mh, '#e0a830');
  for (let k = 0; k < mh; k += 3) for (let j = (k % 2) * 3; j < w - 8; j += 7) R(x + 4 + j, by + bh - 5 - k, 2, 1, '#f6d060');
  for (let sx = x + 4; sx < x + w - 4; sx += 4) R(sx, by + 3, 3, bh - 6, (sx / 4) % 2 < 1 ? '#8f4034' : '#a84e3e');
  R(x, by, w, 3, GRANITO_L); R(x, by + bh - 3, w, 3, GRANITO_L); R(x, by + bh - 1, w, 1, GRANITO_D);
  R(x, by, 4, bh, GRANITO_L); R(x + w - 4, by, 4, bh, GRANITO_L);
  for (let k = 1; k < n - 1; k++) { const px = x + 7 + Math.round((k * (w - 18)) / (n - 1)); R(px, by, 4, bh, GRANITO_L); R(px + 3, by + 3, 1, bh - 6, GRANITO_D); }
  // a porta de madeira
  R(x + w - 22, by + 4, 12, bh - 7, INK); R(x + w - 21, by + 5, 10, bh - 9, '#6b3028'); R(x + w - 16, by + 5, 1, bh - 9, '#4a201a');
  // telhado de telha e as cruzes
  for (let r = 0; r < rh; r++) { const inset = Math.round(((rh - r) / rh) * 6) - 4; R(x + inset, by - rh + r - 1, w - inset * 2, 1, r % 3 === 0 ? TELHA_D : TELHA); }
  R(x - 5, by - 2, w + 10, 2, BEIRAL); R(x + 2, by - rh - 2, w - 4, 2, BEIRAL);
  for (const cx of [x + 5, x + w - 6]) { R(cx - 2, by - rh - 12, 5, 11, INK); R(cx - 4, by - rh - 9, 9, 4, INK); R(cx - 1, by - rh - 11, 3, 9, GRANITO_L); R(cx - 3, by - rh - 8, 7, 2, GRANITO_L); }
}

// A eira: um chão enorme de lajes de granito com musgo nas juntas, de gy até ao fundo do ecrã.
export function eira(R, v, gy) {
  R(0, gy, v.w, v.h - gy, '#c6bcaa'); R(0, gy, v.w, 2, '#ded6c6');
  for (let y = gy + 9, r = 0; y < v.h; y += 9 + r, r++) {
    R(0, y, v.w, 1, r % 2 ? '#8a9468' : '#a39a88');
    for (let x = (r % 2) * 17 + 8; x < v.w; x += 34 + r * 3) R(x, y - 8 - r + 1, 1, 8 + r - 1, (x + r) % 3 ? '#a39a88' : '#8a9468');
  }
}

// A guarita de granito à beira da eira, de porta vermelha e telhado de telha.
export function guarita(R, x, gy) {
  x = Math.round(x);
  R(x - 7, gy - 21, 14, 21, INK); R(x - 6, gy - 20, 12, 20, GRANITO); R(x - 6, gy - 20, 3, 20, GRANITO_L);
  R(x - 1, gy - 12, 4, 2, GRANITO_D); R(x + 2, gy - 6, 3, 2, GRANITO_D);
  R(x - 3, gy - 14, 6, 14, '#a8342a'); R(x - 3, gy - 14, 6, 1, '#7a241c'); R(x + 1, gy - 7, 1, 2, GOLD);
  R(x - 9, gy - 24, 18, 3, TELHA_D); R(x - 7, gy - 27, 14, 3, TELHA); R(x - 4, gy - 30, 8, 3, TELHA_D); R(x - 1, gy - 32, 2, 2, GRANITO_L);
}

// O celeiro de pedra ao lado da piscina: parede de granito à vista, janelinhas e hera por cima.
export function celeiro(R, x, gy, w, h) {
  x = Math.round(x);
  R(x - 1, gy - h - 1, w + 2, h + 1, INK); R(x, gy - h, w, h, GRANITO);
  for (let k = 0; k < Math.round(w * h * 0.02); k++) { const bx = x + 1 + Math.round(hash(k + 21) * (w - 9)), by = gy - h + 2 + Math.round(hash(k * 1.7 + 9) * (h - 6)); R(bx, by, 7, 3, k % 2 ? GRANITO_L : GRANITO_D); }
  for (const fx of [0.22, 0.72]) R(x + Math.round(w * fx), gy - h + 7, 6, 4, '#2b2b33');
  R(x + Math.round(w * 0.44), gy - Math.min(18, h - 6), 9, Math.min(18, h - 6), '#2b2b33'); R(x + Math.round(w * 0.44) - 1, gy - Math.min(18, h - 6) - 1, 11, 1, GRANITO_L);
  for (let px = x - 2; px < x + w + 2; px += 4) { const d = Math.round(hash(px * 0.7) * 4); R(px, gy - h - 4 + (d > 2 ? 1 : 0), 5, 4 + d, px % 8 ? '#3f7a4a' : '#2f6a3f'); }
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

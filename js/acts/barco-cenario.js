// Cenários dos passeios de barco (nível 24): a costa vista do mar, a enseada, a lancha alugada
// (desenhada à escala u = 1 ou 2) e a «pele» da pesca no mar português.
import { INK, hash, sky } from '../draw.js';
import { casco } from './pesca.js';

function nuvem(R, x, y, w, c) {
  R(x, y, w, 4, c); R(x + 3, y - 3, w - 8, 3, c); R(x + Math.round(w * 0.3), y - 5, Math.round(w * 0.35), 2, c);
}

// Céu de verão, nuvens, gaivotas e uma costa de falésias no horizonte (hy). scroll: paralaxe.
export function costa(ctx, v, R, t, hy, scroll = 0) {
  sky(ctx, v.w, v.h, hy, ['#2f86dc', '#86c8f5', '#e0f4fc']);
  for (let i = 0; i < 4; i++) {
    const W = v.w + 90, x = (((hash(i + 2) * W + t * (2 + i) - scroll * 0.05) % W) + W) % W - 45;
    nuvem(R, x, hy - 30 - hash(i * 3 + 1) * Math.min(90, hy * 0.4), 28 + i * 7, '#ffffff');
  }
  // falésias com vegetação por cima
  for (let x = 0; x < v.w; x += 2) {
    const wx = x + scroll * 0.25;
    const hh = Math.round(9 + Math.sin(wx * 0.013) * 5 + Math.sin(wx * 0.041 + 2) * 3 + (Math.sin(wx * 0.006 + 1) > 0.2 ? 5 : 0));
    if (hh < 4) continue;
    R(x, hy - hh, 2, hh, Math.floor(wx / 6) % 3 ? '#d8b070' : '#c49a5a');
    R(x, hy - hh, 2, 2, '#5a9a4a'); R(x, hy - 2, 2, 2, '#b88a4a');
  }
  // gaivotas a voar
  for (let i = 0; i < 3; i++) {
    const W = v.w + 40, x = (((hash(i + 20) * W + t * (9 + i * 4)) % W) + W) % W - 20, y = hy - 26 - i * 9 + Math.sin(t * 2 + i) * 3;
    const up = Math.floor(t * 4 + i) % 2;
    R(x - 3, y - (up ? 1 : -1), 3, 1, '#ffffff'); R(x + 1, y - (up ? 1 : -1), 3, 1, '#ffffff'); R(x, y, 1, 1, INK);
  }
}

// A lancha, com a popa em bx e a proa para a direita. part: 'tras' (o que fica atrás das pessoas:
// para-brisas, consola e bandeira) ou 'frente' (o casco). u: escala (1 ou 2).
export function lancha(R, bx, wl, len, u = 2, part = 'frente') {
  const a = 6 * u;
  if (part === 'tras') {
    // bandeira à popa
    R(bx + 2 * u, wl - a - 14 * u, 1 * u, 14 * u, INK);
    R(bx + 3 * u, wl - a - 14 * u, 3 * u, 4 * u, '#1f8a3a'); R(bx + 6 * u, wl - a - 14 * u, 4 * u, 4 * u, '#e0182a'); R(bx + 5 * u, wl - a - 13 * u, 2 * u, 2 * u, '#ffd166');
    // consola com para-brisas e volante
    const cx = bx + Math.round(len * 0.56);
    R(cx - 1, wl - a - 13 * u - 1, 11 * u + 2, 13 * u + 1, INK);
    R(cx, wl - a - 13 * u, 11 * u, 13 * u, '#eef0f6'); R(cx + 1 * u, wl - a - 12 * u, 9 * u, 5 * u, '#8fd0f5'); R(cx + 2 * u, wl - a - 11 * u, 2 * u, 1 * u, '#ffffff');
    R(cx, wl - a - 5 * u, 11 * u, 1 * u, '#2a3358');
    return;
  }
  casco(R, bx, wl, len, { alto: a, cor: '#f8f8fb', risca: '#2a3358', riscaY: 2 * u - (u > 1 ? 1 : 0), riscaH: u, borda: '#c98f52', sombra: '#b8c4d8' });
  // defensas
  for (const f of [0.25, 0.6]) { const x = bx + Math.round(len * f); R(x - 1, wl - a + 2 * u, 2 * u + 2, 3 * u + 1, INK); R(x, wl - a + 2 * u, 2 * u, 3 * u, '#ff8a4b'); }
}

// A enseada onde ancoram para o almoço: falésias à volta, pinheiros e uma prainha.
export function enseada(ctx, v, R, t, wl) {
  sky(ctx, v.w, v.h, wl, ['#2f86dc', '#86c8f5', '#e0f4fc']);
  nuvem(R, Math.round(v.w * 0.2 + t * 2) % (v.w + 60) - 30, wl - Math.min(110, wl * 0.5), 34, '#ffffff');
  const alto = Math.min(70, Math.round(wl * 0.42));
  for (let x = 0; x < v.w; x += 2) {
    const k = x / v.w, lado = Math.pow(Math.abs(k - 0.42) * 1.9, 1.6);          // mais alto nas pontas, baixo ao meio (a prainha)
    const hh = Math.round(6 + lado * alto + Math.sin(x * 0.07) * 2 + Math.sin(x * 0.19) * 1.5);
    R(x, wl - hh, 2, hh, Math.floor(x / 8) % 3 ? '#d8b070' : '#c49a5a');
    R(x, wl - hh, 2, 3, '#4a8a3f');
    if (hh > 16 && x % 14 === 0) { R(x, wl - hh - 7, 2, 7, '#5a3a22'); R(x - 4, wl - hh - 11, 10, 4, '#2f6a35'); R(x - 2, wl - hh - 13, 6, 2, '#2f6a35'); }
    if (hh < 12) R(x, wl - 3, 2, 3, '#fff0c8');
  }
}

const TRIPULACAO = [
  { who: 'leal', outfit: 'praia' }, { who: 'mi', outfit: 'praia' }, { who: 'carlos', outfit: 'casual' },
  { who: 'pi', outfit: 'casual' }, { who: 'lourenco', outfit: 'praia' }, { who: 'ines', outfit: 'praia' },
];

// A «pele» da pesca no mar português.
export const PELE_MAR = {
  back: (ctx, v, R, t, wl) => costa(ctx, v, R, t, wl, 0),
  sea: ['#2f8fc8', '#123a66', '#cfeaff'],
  bed: '#8a8a7a',
  len: 150, deck: 6,
  ajuda: 'Carlos: «Dá cá a cana, que eu ajudo... já vem!»',
  crew: TRIPULACAO,
  boatBack: (ctx, R, bx, wl, len) => lancha(R, bx, wl, len, 2, 'tras'),
  boat: (ctx, R, bx, wl, len) => lancha(R, bx, wl, len, 2, 'frente'),
  // rochas e algas no fundo (onde o polvo se agarra)
  under(ctx, v, R, t) {
    for (let i = 0; i < Math.ceil(v.w / 46); i++) {
      const x = Math.round(10 + i * 46 + hash(i + 31) * 20), w = 12 + Math.round(hash(i + 7) * 10), hh = 4 + Math.round(hash(i + 3) * 5);
      R(x, v.h - 6 - hh, w, hh + 2, '#4a5466'); R(x + 2, v.h - 7 - hh, w - 5, 1, '#6a7488');
      for (let j = 0; j < 7; j++) R(x + w + 2 + Math.round(Math.sin(t * 2 + j * 0.7 + i) * 1.5), v.h - 7 - j, 2, 1, '#3f9a5a');
    }
  },
};
export { TRIPULACAO };

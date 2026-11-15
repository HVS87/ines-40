// Cenários de Moçambique (nível 20): a praia de areia branca com palmeiras e um dhow, o mar
// visto do barco e a «pele» da pesca (barco, tripulação e cores do Índico).
import { INK, disc, hash, lerp, mix, sky } from '../draw.js';
import { casco } from './pesca.js';

const CEU_DIA = ['#2f8fe0', '#7cc8f5', '#d8f4fb'], CEU_TARDE = ['#3a2a6a', '#e0527a', '#ffb35a'];

function nuvem(R, x, y, w, c) {
  R(x, y, w, 4, c); R(x + 3, y - 3, w - 8, 3, c); R(x + Math.round(w * 0.3), y - 5, Math.round(w * 0.35), 2, c);
}

// Céu com sol e nuvens até ao horizonte (hy). dusk: 0 = dia, 1 = pôr do sol.
function ceu(ctx, v, R, t, hy, dusk) {
  sky(ctx, v.w, v.h, hy, CEU_DIA.map((c, i) => mix(c, CEU_TARDE[i], dusk)));
  const sx = Math.round(v.w * 0.7), sy = Math.round(lerp(hy - Math.min(58, hy * 0.42), hy - 3, dusk));
  disc(ctx, sx, sy, 13, mix('#bfe6fb', '#ff9a5a', Math.min(1, dusk + 0.25)));
  disc(ctx, sx, sy, 10, mix('#fffbe0', '#ffe08a', dusk));
  const cn = mix('#ffffff', '#ffb0a0', dusk);
  for (let i = 0; i < 4; i++) {
    const W = v.w + 80, x = (((hash(i + 2) * W + t * (2 + i)) % W) + W) % W - 40;
    nuvem(R, x, hy - 22 - hash(i * 3 + 1) * Math.min(70, hy * 0.35), 26 + i * 6, cn);
  }
  return [sx, sy];
}

// Palmeira com o pé em (x, gy): tronco curvo (lean = para que lado se inclina) e copa de folhas caídas.
function palmeira(R, x, gy, alt, lean = 1, shade = 0) {
  const tr = mix('#9a7a52', '#3a2038', shade), tr2 = mix('#6b5236', '#2a1830', shade);
  const f1 = mix('#3fae5a', '#2a2040', shade), f2 = mix('#1f7a3a', '#1c1430', shade);
  for (let i = 0; i < alt; i++) {
    const k = i / alt, ox = Math.round(lean * k * k * alt * 0.3);
    R(x + ox - 1, gy - i - 1, k > 0.5 ? 3 : 4, 1, i % 4 === 0 ? tr2 : tr);
  }
  const tx = x + Math.round(lean * alt * 0.3), ty = gy - alt, len = Math.round(Math.max(14, alt * 0.34));
  for (const a of [-0.35, 0.3, 0.95, 1.57, 2.2, 2.85, 3.5]) {
    for (let j = 0; j < len; j++) {
      const px = tx + Math.cos(a) * j, py = ty - Math.sin(a) * j * 0.8 + (j * j) / len * 0.55;
      R(px, py, 2, 2, f1); R(px, py + 2, 1, 2 + (j % 2), f2);
    }
  }
  const coco = mix('#5a3a22', '#1c1430', shade);
  R(tx - 2, ty + 1, 3, 3, coco); R(tx + 1, ty + 2, 3, 3, coco);
}

// Dhow: barco de madeira com vela latina branca. (x, wy) = meio do casco, na linha de água.
export function dhow(R, x, wy, s = 1, dir = 1, shade = 0) {
  const W = mix('#8a5a34', '#2a1830', shade), Wd = mix('#5a3420', '#1c1430', shade);
  const vela = mix('#ffffff', '#ffc890', shade), vela2 = mix('#d8e2ee', '#e09a6a', shade);
  const X = (dx) => x + dir * dx * s;
  // casco, com a proa levantada
  R(Math.min(X(-12), X(12)), wy - 3 * s, 24 * s, 3 * s, W); R(Math.min(X(-10), X(10)), wy, 20 * s, s, Wd);
  R(Math.min(X(11), X(15)), wy - 5 * s, 4 * s, 2 * s, W); R(Math.min(X(-13), X(-11)), wy - 4 * s, 2 * s, s, W);
  // mastro e vela (triângulo: tope, ponta de trás, ponta da frente)
  const top = [-2, -25], tras = [-10, -6], frente = [12, -7];
  for (let i = 0; i <= 19; i++) {
    const k = i / 19, xl = top[0] + (tras[0] - top[0]) * k, xr = top[0] + (frente[0] - top[0]) * k, y = wy + (top[1] + i) * s;
    const a = Math.min(X(xl), X(xr)), b = Math.max(X(xl), X(xr));
    R(a, y, b - a + s, s, vela); R(dir > 0 ? a : b - (b - a) * 0.3, y, (b - a) * 0.3, s, vela2);
  }
  for (let i = 0; i < 22; i++) R(X(1 + i * 0.05), wy - (3 + i) * s, s, s, Wd);
}

// A praia: céu, mar turquesa, dhow, areia branca e palmeiras. o: { gy (linha dos pés), dusk }.
export function praiaMoz(ctx, v, R, t, o = {}) {
  const gy = o.gy || Math.round(v.h * 0.8), dusk = o.dusk || 0;
  const sy = gy - 12, hy = sy - (v.portrait ? 64 : 30);
  const [sx] = ceu(ctx, v, R, t, hy, dusk);
  const mar = ['#1f8fc0', '#2fc0c8', '#8fe8dc'].map((c, i) => mix(c, ['#5a3a7a', '#c0607a', '#ffb07a'][i], dusk * 0.7));
  const n = 6, H = sy - hy;
  for (let i = 0; i < n; i++) R(0, hy + Math.floor((i * H) / n), v.w, Math.ceil(H / n) + 1, mix(mar[0], mar[2], i / (n - 1)));
  R(0, hy, v.w, 1, mix(mar[0], '#ffffff', 0.35));
  // o sol a brilhar na água
  for (let i = 0; i < H; i += 2) { const w = 3 + Math.round(Math.abs(Math.sin(t * 2 + i)) * (5 + i * 0.4)); R(sx - w / 2, hy + 1 + i, w, 1, mix('#ffffff', '#ffe08a', dusk)); }
  dhow(R, Math.round(v.w * 0.3 + Math.sin(t * 0.15) * 8), hy + Math.round(H * 0.3), 1, 1, dusk * 0.6);
  // areia e rebentação
  const areia = mix('#fff6dc', '#e8a878', dusk * 0.6);
  R(0, sy, v.w, v.h - sy, areia);
  for (let x = 0; x < v.w; x += 6) R(x, sy - 1 + Math.round(Math.sin(t * 1.4 + x * 0.09) * 1.5), 6, 2, '#ffffff');
  for (let i = 0; i < 46; i++) R(hash(i + 5) * v.w, sy + 5 + hash(i * 2 + 1) * (v.h - sy - 6), 2, 1, mix(areia, '#b88a5a', 0.35));
  // conchas e uma estrela-do-mar
  for (let i = 0; i < 4; i++) R(hash(i + 40) * v.w, gy + 5 + hash(i + 50) * Math.max(4, v.h - gy - 10), 2, 2, i % 2 ? '#ff9ab0' : '#ffffff');
  const alt = Math.round(Math.min(132, gy * 0.56));
  palmeira(R, Math.round(v.w * 0.05), gy - 3, alt, 1, dusk * 0.75);
  palmeira(R, Math.round(v.w * 0.96), gy - 5, Math.round(alt * 0.85), -1, dusk * 0.75);
  return { sy, hy, areia };
}

// O mar visto do barco de pesca: céu, costa de areia branca com palmeiras ao longe e um dhow.
function marMoz(ctx, v, R, t, wl) {
  ceu(ctx, v, R, t, wl, 0);
  const cw = Math.round(v.w * 0.5);
  for (let x = 0; x < cw; x += 2) {
    const hh = Math.round(3 + Math.sin(x * 0.05) * 1.5 + Math.sin(x * 0.13) * 1);
    R(x, wl - hh - 2, 2, hh, '#3f9a5a'); R(x, wl - 2, 2, 2, '#fff6dc');
  }
  for (let i = 0; i < 7; i++) {
    const x = Math.round(6 + i * (cw / 7.5) + hash(i) * 6), hh = 9 + Math.round(hash(i + 3) * 5);
    R(x, wl - 4 - hh, 1, hh, '#6b5236'); R(x - 3, wl - 5 - hh, 7, 2, '#2f8a4a'); R(x - 4, wl - 3 - hh, 2, 2, '#2f8a4a'); R(x + 3, wl - 3 - hh, 2, 2, '#2f8a4a');
  }
  dhow(R, Math.round(v.w * 0.74 + Math.sin(t * 0.2) * 6), wl, 1, -1, 0);
}

// A «pele» da pesca em Moçambique.
export const PELE_MOZ = {
  back: marMoz,
  sea: ['#2fc8c8', '#0f5a8a', '#d0fff4'],
  bed: '#f2e2b8',
  len: 150, deck: 6,
  ajuda: 'Pi: «Deixa que eu dou uma ajuda... já vem!»',
  crew: [
    { who: 'pi', outfit: 'casual' }, { who: 'leal', outfit: 'praia' }, { who: 'mi', outfit: 'praia' },
    { who: 'zebras', outfit: 'praia' }, { who: 'lourenco', outfit: 'praia' }, { who: 'ines', outfit: 'praia' },
  ],
  // atrás das pessoas: canas nos suportes e a geleira
  boatBack(ctx, R, bx, wl) {
    for (const dx of [10, 15]) { for (let i = 0; i < 44; i++) R(bx + dx - Math.round(i * 0.12), wl - 12 - i, 1, 1, i < 8 ? '#b8793a' : INK); }
    R(bx + 40, wl - 24, 20, 13, INK); R(bx + 41, wl - 23, 18, 11, '#3fa6e0'); R(bx + 41, wl - 23, 18, 3, '#f6f6fa');
  },
  boat(ctx, R, bx, wl, len) {
    casco(R, bx, wl, len, { alto: 12, cor: '#f8f8fb', risca: '#1fb0b8', riscaY: 4, riscaH: 3, borda: '#c98f52', sombra: '#b8c8d8' });
    // motor fora de borda
    R(bx - 9, wl - 19, 10, 12, INK); R(bx - 8, wl - 18, 8, 10, '#2f3a55'); R(bx - 8, wl - 18, 8, 2, '#5a6a8a');
    R(bx - 6, wl - 7, 4, 9, INK); R(bx - 5, wl - 7, 2, 8, '#8a93a7');
  },
  // corais no fundo
  under(ctx, v, R) {
    for (let i = 0; i < Math.ceil(v.w / 60); i++) {
      const x = Math.round(18 + i * 60 + hash(i + 11) * 26), c = i % 2 ? '#ff7a9a' : '#ff9a4a';
      R(x, v.h - 11, 2, 6, c); R(x - 3, v.h - 9, 2, 4, c); R(x + 3, v.h - 13, 2, 8, c); R(x - 3, v.h - 9, 8, 1, c);
    }
  },
};

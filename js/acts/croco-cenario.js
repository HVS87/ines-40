// Cenários do nível «O Crô-Crô»: a esplanada do café (toldo com letreiro, árvores, mesas) e a
// malta sentada às mesas. Usado pelos três atos do nível.
import { INK, PAPER, GOLD, hash, lerp, sky, disc, text, person } from '../draw.js';
import { getCharacter } from '../sprites.js';

// Os amigos da esplanada, pela ordem em que se sentam.
export const MALTA = [['ana', 'Ana'], ['mi', 'Mi'], ['soft', 'Soft'], ['pipoca', 'Pipoca'], ['ines', 'Inês'], ['pi', 'Pi'], ['leal', 'Leal'], ['isabel', 'Isabel'], ['maria', 'Maria'], ['tete', 'Tété']];
export const malta = () => MALTA.map(([who, name]) => ({ who, name, frames: getCharacter(who, 'casual') }));

function rgb(c) { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function mixHex(a, b, t) {
  const A = rgb(a), B = rgb(b);
  return '#' + [0, 1, 2].map((i) => Math.round(lerp(A[i], B[i], t)).toString(16).padStart(2, '0')).join('');
}
const DIA = ['#6ab4ec', '#9fd0f4', '#cfe8f7', '#eef5e0'], TARDE = ['#3d2f78', '#c8527a', '#f8a05a', '#ffd68a'];

function arvore(ctx, R, x, gy, big, dusk) {
  const th = big ? 70 : 52, r = big ? 22 : 16;
  R(x - 3, gy - th, 6, th, '#6b4a30'); R(x - 1, gy - th, 2, th, '#8a6442');
  const a = mixHex('#4f9f52', '#3a6a52', dusk), b = mixHex('#6fbf62', '#4a8a5a', dusk);
  disc(ctx, x, gy - th - r + 8, r, a); disc(ctx, x - r + 4, gy - th + 4, r - 6, a); disc(ctx, x + r - 4, gy - th + 2, r - 7, b);
  disc(ctx, x - 4, gy - th - r + 2, r - 9, b);
  for (let i = 0; i < 6; i++) R(x - r + 6 + i * (r / 3.2), gy - th - r + 10 + (i % 3) * 7, 2, 2, '#ffd6e6');   // flores da primavera
}

// A esplanada: céu (dusk 0 = tarde de sol, 1 = pôr do sol), o café com o toldo e o letreiro,
// árvores e calçada. cx = centro do café, gy = chão, top = limite de cima.
export function esplanada(ctx, v, R, o) {
  const { gy, top, cx, t } = o, dusk = o.dusk || 0, big = v.portrait;
  sky(ctx, v.w, v.h, gy, DIA.map((c, i) => mixHex(c, TARDE[i], dusk)));
  disc(ctx, Math.round(cx + (o.half || 100) * 0.9), Math.round(lerp(top + 16, gy - 34, dusk)), big ? 14 : 11, dusk > 0.5 ? '#ffe2a0' : '#fff6c8');
  const bw = Math.min(200, (o.half || 100) * 2 - 8), wt = Math.max(top + 4, gy - (big ? 150 : 122));
  arvore(ctx, R, cx - bw / 2 - 6, gy, big, dusk); arvore(ctx, R, cx + bw / 2 + 8, gy, big, dusk);
  // o café
  const x0 = Math.round(cx - bw / 2);
  R(x0 - 1, wt - 1, bw + 2, gy - wt + 1, INK);
  R(x0, wt, bw, gy - wt, mixHex('#f4e8d2', '#e8c8a8', dusk));
  R(x0, wt, bw, 3, '#b5523a');
  for (let x = x0 + 2; x < x0 + bw - 4; x += 6) { R(x, gy - 22, 5, 5, '#f6f2ea'); R(x + 1, gy - 21, 3, 3, '#5a8fd0'); R(x, gy - 16, 5, 5, '#f6f2ea'); R(x + 2, gy - 14, 1, 1, '#5a8fd0'); }
  // letreiro (com os acentos circunflexos desenhados à mão, para se lerem bem)
  R(cx - 37, wt + 5, 74, 22, INK); R(cx - 36, wt + 6, 72, 20, '#a8324a');
  text(ctx, 'CRO-CRO', cx, wt + 13, '#fff6e6', { scale: 2, align: 'center' });
  for (const ox of [cx - 11, cx + 21]) { R(ox + 2, wt + 8, 2, 2, '#fff6e6'); R(ox, wt + 10, 2, 2, '#fff6e6'); R(ox + 4, wt + 10, 2, 2, '#fff6e6'); }
  // toldo às riscas
  const ay = wt + 31;
  for (let x = 0; x < bw + 8; x += 8) { const c = (x >> 3) & 1 ? '#fff6e6' : '#2f8a5a'; R(x0 - 4 + x, ay, Math.min(8, bw + 8 - x), 9, c); R(x0 - 3 + x, ay + 9, Math.min(6, bw + 8 - x), 2, c); }
  R(x0 - 5, ay - 1, bw + 10, 1, INK);
  // porta e montra (com a luz acesa quando o sol se põe)
  const dh = Math.max(20, gy - ay - 16), glass = dusk > 0.5 ? '#ffd98a' : '#5d70a0';
  R(x0 + 10, gy - dh, 22, dh, '#5a3a2a'); R(x0 + 12, gy - dh + 2, 18, dh - 2, glass);
  R(x0 + 40, gy - dh, bw - 52, dh - 22, '#5a3a2a'); R(x0 + 42, gy - dh + 2, bw - 56, dh - 26, glass);
  // calçada
  R(0, gy, v.w, v.h - gy, mixHex('#e6dcc6', '#c8a890', dusk)); R(0, gy, v.w, 1, '#b9ae98');
  for (let i = 0; i < 90; i++) R(Math.floor(hash(i) * v.w), gy + 3 + Math.floor(hash(i * 2.3) * (v.h - gy - 4)), 2, 1, hash(i * 5) > 0.5 ? '#cfc3a8' : '#5a5566');
  // mesas vazias à frente, quando sobra chão (ecrã ao alto)
  if (o.fore && v.h - gy > 70) {
    const y = gy + Math.round((v.h - gy) * 0.55);
    for (const x of [Math.round(v.w * 0.24), Math.round(v.w * 0.74)]) {
      for (const d of [-1, 1]) {      // duas cadeiras, uma de cada lado
        const bx = d < 0 ? x - 30 : x + 23, sx = d < 0 ? x - 30 : x + 18;
        R(bx - 1, y - 9, 9, 13, INK); R(bx, y - 8, 7, 11, '#2f8a5a'); R(bx + 2, y - 6, 3, 7, '#4fae7a');
        R(sx - 1, y + 2, 14, 5, INK); R(sx, y + 3, 12, 3, '#2f8a5a');
        R(sx, y + 7, 2, 11, '#8a8794'); R(sx + 10, y + 7, 2, 11, '#8a8794');
      }
      R(x - 15, y - 5, 30, 5, INK); R(x - 14, y - 4, 28, 3, '#e8e8f0'); R(x - 1, y, 2, 18, '#8a8794'); R(x - 7, y + 18, 14, 2, '#8a8794');
    }
  }
}

// Uma imperial pequenina (em cima da mesa).
export function copinho(R, x, y) {
  R(x - 1, y - 9, 6, 9, INK); R(x, y - 6, 4, 5, '#f2b632'); R(x, y - 8, 4, 2, '#ffffff');
}

// Uma mesa comprida de esplanada com o tampo em y; n imperiais e chávenas de café em cima.
export function mesa(R, x0, x1, y, n, cafe) {
  R(x0 - 1, y - 1, x1 - x0 + 2, 6, INK); R(x0, y, x1 - x0, 4, '#e8e8f0'); R(x0, y + 3, x1 - x0, 1, '#b8b8c8');
  R(x0 + 6, y + 5, 2, 12, '#8a8794'); R(x1 - 8, y + 5, 2, 12, '#8a8794'); R(Math.round((x0 + x1) / 2), y + 5, 2, 12, '#8a8794');
  for (let i = 0; i < n; i++) copinho(R, Math.round(x0 + 8 + ((x1 - x0 - 20) * (i + 0.5)) / Math.max(1, n)), y);
  if (cafe) { const x = Math.round(x0 + (x1 - x0) * cafe); R(x - 1, y - 4, 7, 4, INK); R(x, y - 3, 5, 3, PAPER); R(x + 1, y - 3, 3, 1, '#5a3a2a'); R(x - 3, y - 1, 11, 1, PAPER); }
}

// A malta às mesas, entre x0 e x1: uma fila (ecrã deitado) ou duas (ao alto). Quem fala (ou toda a
// gente, com all) dá saltinhos. drinks = imperiais em cima das mesas.
export function sentados(ctx, R, list, o) {
  const { x0, x1, gy, t } = o, rows = o.rows || 1, drinks = o.drinks || 0;
  const draw = (m, x, y) => {
    const hop = (o.all || (m.name && m.name === o.speaker)) ? Math.round(Math.abs(Math.sin(t * 7 + x)) * 2) : 0;
    person(ctx, m.frames, x, y, { face: x < (x0 + x1) / 2 ? 1 : -1, scale: 2, hop });
  };
  if (rows === 2) {
    const back = list.slice(0, 5), front = list.slice(5), by = gy - 40;
    back.forEach((m, i) => draw(m, Math.round(x0 + 14 + ((x1 - x0 - 28) * i) / 4), by));
    mesa(R, x0 + 2, x1 - 2, by - 17, Math.min(drinks, 5), 0);
    front.forEach((m, i) => draw(m, Math.round(x0 + 22 + ((x1 - x0 - 44) * i) / Math.max(1, front.length - 1)), gy));
    mesa(R, x0 + 14, x1 - 14, gy - 17, Math.max(0, drinks - 5), o.cafe ? 0.5 : 0);
  } else {
    list.forEach((m, i) => draw(m, Math.round(x0 + 14 + ((x1 - x0 - 28) * i) / (list.length - 1)), gy));
    mesa(R, x0, x1, gy - 17, drinks, o.cafe ? 0.4 : 0);
  }
}

// Onde ficam a cena e o painel do minijogo, conforme o ecrã (para os atos das imperiais e dos caracóis).
export function partes(v, top) {
  if (v.portrait) {
    const py = Math.round(v.h * 0.57);
    return { top, gy: Math.round(v.h * 0.5), cx: Math.round(v.w / 2), half: v.w / 2, x0: 6, x1: v.w - 6, rows: 2, px: 10, py, pw: v.w - 20, ph: v.h - py - 14, s: 2 };
  }
  const pw = Math.round(v.w * 0.4), sx = pw + 16;
  return { top, gy: Math.round(v.h * 0.9), cx: Math.round((sx + v.w) / 2), half: (v.w - sx) / 2, x0: sx + 4, x1: v.w - 6, rows: 1, px: 8, py: top + 4, pw, ph: v.h - top - 12, s: 1 };
}

// Moldura de um painel de «grande plano». Devolve o tamanho por dentro, em unidades do painel:
// ao alto o painel desenha-se ao dobro (p.s = 2), com ctx.translate(p.px, p.py) e ctx.scale(p.s, p.s).
export function painel(R, p, cor) {
  R(p.px - 2, p.py - 2, p.pw + 4, p.ph + 4, INK); R(p.px - 1, p.py - 1, p.pw + 2, p.ph + 2, GOLD); R(p.px, p.py, p.pw, p.ph, cor);
  return { pw: Math.floor(p.pw / p.s), ph: Math.floor(p.ph / p.s) };
}

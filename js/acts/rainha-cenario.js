// Cenários do nível «O Rainha»: o palácio da Rua da Junqueira visto da rua (fachada comprida em
// três corpos, portão ao centro, dois terraços, o elétrico a passar) e o pátio do liceu.
// Também há aqui uma ajuda para os bonecos: vê-los de costas.
import { INK, hash, sky, disc, sign, person, shadow, recolor } from '../draw.js';

const PAL_X = 25;    // onde começa o palácio, em píxeis de mundo
const WALL = '#eaa9a0', WALL_S = '#d48e86', STONE = '#f4e8d2', STONE_S = '#cdb898';
const ROOF = '#b5523a', ROOF_S = '#8e3d2a', GLASS = '#34466e';

// ---------- bonecos ----------

// Um boneco visto de costas: a cara fica tapada pelo cabelo (cor `hair`).
export function costas(frames, hair, eyes) {
  return recolor(frames, { '#f6c9a0': hair, '#f09a8c': hair, '#c2544c': hair, [eyes]: hair }, 14);
}

// ---------- o palácio ----------
function janela(R, x, y, w, h, varanda) {
  R(x - 1, y - 1, w + 2, h + 2, STONE);
  R(x, y, w, h, GLASS);
  R(x, y, w, 1, '#5d70a0');
  R(x + (w >> 1), y, 1, h, STONE);
  if (varanda) {
    R(x - 3, y + h, w + 6, 1, INK);
    R(x - 3, y + h - 4, w + 6, 1, INK);
    for (let i = -3; i <= w + 2; i += 2) R(x + i, y + h - 4, 1, 4, INK);
  }
}

function fila(R, x, w, n, b, u, andares, semMeio) {
  const step = w / n, ww = 8, wh = Math.round(u * 0.52);
  for (let f = 0; f < andares; f++) {
    for (let i = 0; i < n; i++) {
      if (semMeio && f === 0 && i === (n - 1) / 2) continue;
      janela(R, Math.round(x + step * (i + 0.5) - ww / 2), b - (f + 1) * u + Math.round(u * 0.24), ww, wh, f > 0);
    }
  }
}

function corpo(R, x, w, b, u, andares) {
  const h = andares * u;
  R(x, b - h, w, h, WALL);
  R(x, b - h, w, 2, WALL_S);
  R(x, b - 5, w, 5, STONE_S);
  R(x, b - h, 3, h, STONE); R(x + w - 3, b - h, 3, h, STONE);
  for (let f = 1; f < andares; f++) R(x, b - f * u - 1, w, 1, STONE);
  R(x - 2, b - h - 3, w + 4, 3, STONE);
  R(x - 1, b - h - 8, w + 2, 5, ROOF); R(x - 1, b - h - 4, w + 2, 1, ROOF_S);
}

function terraco(ctx, R, x, w, b, u) {
  // vasos e arbustos no terraço, por trás da balaustrada
  for (let i = 0; i < 3; i++) {
    const px = Math.round(x + w * (0.2 + i * 0.3));
    disc(ctx, px, b - u - 11, 5, '#3f8a4a'); disc(ctx, px - 2, b - u - 13, 3, '#5fae62');
  }
  R(x, b - u, w, u, WALL);
  R(x, b - 5, w, 5, STONE_S);
  // balaustrada de pedra
  R(x, b - u - 2, w, 2, STONE);
  for (let i = 1; i < w - 1; i += 3) R(x + i, b - u - 7, 2, 5, STONE_S);
  R(x, b - u - 8, w, 2, STONE);
  fila(R, x, w, 4, b, u, 1);
}

// O palácio visto da rua: x0 = canto esquerdo no ecrã, b = base, u = altura de um andar.
function palacio(ctx, R, x0, b, u) {
  const A = 70, T = 90, C = 150;
  // alas das pontas (2 andares)
  corpo(R, x0, A, b, u, 2); fila(R, x0, A, 3, b, u, 2);
  corpo(R, x0 + A + T + C + T, A, b, u, 2); fila(R, x0 + A + T + C + T, A, 3, b, u, 2);
  // os dois terraços sobre a rua
  terraco(ctx, R, x0 + A, T, b, u);
  terraco(ctx, R, x0 + A + T + C, T, b, u);
  // corpo central (3 andares), com frontão, brasão e portão
  const cx0 = x0 + A + T, cx = cx0 + C / 2, h = 3 * u;
  corpo(R, cx0, C, b, u, 3);
  for (let i = 0; i < 6; i++) R(cx - 22 + i * 4, b - h - 9 - i, 44 - i * 8, 1, STONE);
  R(cx - 2, b - h - 8, 5, 4, '#b08a3a'); R(cx - 1, b - h - 4, 3, 1, '#b08a3a');
  fila(R, cx0, C, 7, b, u, 3, true);
  // portão: arco de pedra, portas de madeira abertas para o pátio
  const gw = 22, gh = Math.round(u * 0.82);
  R(cx - gw / 2 - 3, b - gh - 1, gw + 6, gh + 1, STONE);
  disc(ctx, cx, b - gh, gw / 2 + 3, STONE);
  R(cx - gw / 2, b - gh, gw, gh, '#2a2238');
  disc(ctx, cx, b - gh, gw / 2, '#2a2238');
  R(cx - gw / 2, b - gh, 4, gh, '#6b4226'); R(cx + gw / 2 - 4, b - gh, 4, gh, '#6b4226');
  R(cx - 3, b - Math.round(gh * 0.5), 6, Math.round(gh * 0.5), '#4a5a48');   // o pátio lá ao fundo
  // a placa por cima do portão
  sign(ctx, 'LICEU RAINHA D. AMÉLIA', cx, b - u - Math.round(u * 0.3) - 2, { bg: STONE, color: '#6a3a3a', border: STONE_S });
}

// O elétrico amarelo (x = frente, à esquerda; y = carris). Vai da direita para a esquerda.
export function eletrico(ctx, R, x, y, big) {
  const L = big ? 84 : 58, H = big ? 38 : 26, half = Math.round(H * 0.45);
  x = Math.round(x);
  R(x + 8, y - 5, L - 16, 4, '#3a3040');
  R(x + 10, y - 4, 7, 4, INK); R(x + L - 17, y - 4, 7, 4, INK);
  R(x, y - H, L, H - 4, INK);
  R(x + 1, y - H + 1, L - 2, H - 6, '#f6c41c');
  R(x + 1, y - H + 1, L - 2, half, '#fff3d6');
  const n = big ? 6 : 5, ww = Math.floor((L - 10) / n) - 2;
  for (let i = 0; i < n; i++) {
    const wx = x + 6 + i * (ww + 2);
    R(wx, y - H + 4, ww, half - 5, GLASS);
    if (i % 2) R(wx + 2, y - H + half - 5, 4, 4, INK);       // passageiros
  }
  R(x + 1, y - H + half + 1, L - 2, 1, '#c8961a');
  R(x + 2, y - H - 2, L - 4, 3, '#8a8794'); R(x + 2, y - H - 3, L - 4, 1, INK);
  R(x - 1, y - 9, 2, 3, '#fff6c0');
  R(x + Math.round(L * 0.55), y - H - (big ? 12 : 9), 1, big ? 10 : 7, INK);
}

function nuvem(R, x, y, s) {
  R(x, y, 22 * s, 4 * s, '#ffffff'); R(x + 4 * s, y - 3 * s, 12 * s, 3 * s, '#ffffff'); R(x + 2 * s, y + 4 * s, 16 * s, 1 * s, '#e6f0fa');
}

// Medidas da rua para este ecrã: gy = chão (passeio de cá), b = base do palácio, u = um andar.
export function geo(v) {
  const p = v.portrait, gy = Math.round(v.h * (p ? 0.74 : 0.87));
  return { gy, u: p ? 34 : 20, b: gy - (p ? 62 : 42), big: p };
}

// A Rua da Junqueira: céu, palácio do outro lado da rua, carris e elétrico, passeio de cá.
export function rua(ctx, v, R, g, cam, t) {
  const { gy, u, b, big } = g;
  sky(ctx, v.w, v.h, b, ['#86c2f0', '#bfe0f7', '#f3ead2']);
  nuvem(R, Math.round(v.w * 0.12 - cam * 0.1), Math.round(b * 0.3), big ? 2 : 1);
  nuvem(R, Math.round(v.w * 0.7 - cam * 0.1), Math.round(b * 0.5), 1);
  // árvores por trás do palácio
  for (let i = 0; i < 9; i++) {
    const x = PAL_X - cam + i * 62 + 10;
    disc(ctx, x, b - u * 2 - 2, big ? 16 : 11, i % 2 ? '#4a9a54' : '#3f8a4a');
  }
  palacio(ctx, R, PAL_X - cam, b, u);
  // passeio do outro lado, estrada e carris
  R(0, b, v.w, 4, '#d6ccb8');
  R(0, b + 4, v.w, gy - 12 - (b + 4), '#6a6474');
  const road = gy - 12 - (b + 4), r1 = b + 4 + Math.round(road * 0.42), r2 = b + 4 + Math.round(road * 0.72);
  R(0, r1, v.w, 1, '#a9a4b8'); R(0, r2, v.w, 1, '#a9a4b8');
  for (let wx = Math.floor(cam / 14) * 14; wx < cam + v.w; wx += 14) R(wx - cam, r1 + 1, 2, r2 - r1 - 1, '#5c5666');
  // o fio do elétrico e o elétrico (passa de vez em quando)
  const H = big ? 38 : 26, wire = r2 - H - (big ? 12 : 9);
  R(0, wire, v.w, 1, '#4a4458');
  const tx = 620 - ((t * 44 + 300) % 1100);
  eletrico(ctx, R, tx - cam, r2 + 1, big);
  // passeio de cá (calçada)
  R(0, gy - 12, v.w, 2, '#b9ae98');
  R(0, gy - 10, v.w, v.h - gy + 10, '#e6dcc6');
  for (let wx = Math.floor(cam / 7) * 7; wx < cam + v.w; wx += 7) {
    const k = hash(wx * 0.37);
    R(wx - cam, gy - 8 + Math.floor(k * (v.h - gy + 6)), 2, 1, k > 0.5 ? '#cfc3a8' : '#f3ecdc');
  }
}

// O pátio do liceu (fundo das conversas): parede do palácio com arcadas, árvore, banco.
export function patio(ctx, v, R, t, gy, top = 50) {
  const p = v.portrait, u = Math.max(30, Math.min(60, Math.round((gy - top - 16) / 2))), wt = gy - u * 2 - 4;
  sky(ctx, v.w, v.h, wt + 20, ['#86c2f0', '#cfe8f7']);
  nuvem(R, Math.round(v.w * 0.6), Math.max(8, wt - 26), 1);
  // parede
  R(0, wt, v.w, gy - wt, WALL);
  R(0, wt - 6, v.w, 6, ROOF); R(0, wt - 1, v.w, 1, ROOF_S); R(0, wt, v.w, 3, STONE);
  R(0, gy - u - 2, v.w, 2, STONE);
  // arcadas em baixo, janelas de sacada em cima
  const step = p ? 50 : 56, x0 = Math.round((v.w % step) / 2) - step / 2 + 6;
  for (let x = x0; x < v.w + step; x += step) {
    const aw = Math.round(step * 0.56), ah = Math.round(u * 0.46), cx = x + step / 2;
    R(cx - aw / 2 - 2, gy - ah, aw + 4, ah, STONE); disc(ctx, cx, gy - ah, aw / 2 + 2, STONE);
    R(cx - aw / 2, gy - ah, aw, ah, '#4a3a52'); disc(ctx, cx, gy - ah, aw / 2, '#4a3a52');
    R(cx - aw / 2, gy - 6, aw, 6, '#3a2c44');
    janela(R, Math.round(cx - 6), gy - u * 2 + Math.round(u * 0.28), 12, Math.round(u * 0.5), true);
  }
  // chão de lajes
  R(0, gy, v.w, v.h - gy, STONE_S);
  R(0, gy, v.w, 2, '#b8a484');
  for (let y = gy + 10, k = 0; y < v.h; y += 12, k++) {
    R(0, y, v.w, 1, '#bca88a');
    for (let x = (k % 2) * 16; x < v.w; x += 32) R(x, y - 10, 1, 10, '#bca88a');
  }
  // banco de pedra e árvore
  const bx = Math.round(v.w * (p ? 0.02 : 0.04));
  R(bx, gy - 9, 46, 3, STONE); R(bx + 3, gy - 6, 4, 6, STONE_S); R(bx + 39, gy - 6, 4, 6, STONE_S);
  const tx = Math.round(v.w * (p ? 0.95 : 0.93));
  R(tx - 3, gy - u * 2, 6, u * 2, '#6b4a30'); R(tx - 1, gy - u * 2, 2, u * 2, '#8a6442');
  disc(ctx, tx, gy - u * 2 - 6, p ? 26 : 20, '#3f8a4a'); disc(ctx, tx - 12, gy - u * 2 + 2, p ? 16 : 12, '#4a9a54');
  disc(ctx, tx - 4, gy - u * 2 - 14, p ? 14 : 10, '#5fae62');
}

// Desenha um grupo de bonecos (lista de { frames, x, dy, face, name }); quem fala dá saltinhos.
export function grupo(ctx, list, gy, speaker, t) {
  const order = [...list].sort((a, b) => (b.dy || 0) - (a.dy || 0));
  for (const m of order) {
    const hop = m.name && m.name === speaker ? Math.round(Math.abs(Math.sin(t * 7)) * 2) : 0;
    shadow(ctx, m.x, gy - (m.dy || 0), 14);
    person(ctx, m.frames, m.x, gy - (m.dy || 0), { face: m.face || 1, scale: 2, hop });
  }
}

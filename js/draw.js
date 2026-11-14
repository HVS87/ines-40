// Ferramentas de desenho comuns a todos os níveis: cores, retângulos, céus em faixas, discos,
// montes, letras em píxeis (para tabuletas e letreiros) e bonecos.
import { charFrame } from './sprites.js';

export const INK = '#2b1d2e', PAPER = '#fff6e6', PINK = '#ff5d8f', GOLD = '#ffd166', MINT = '#7be0b0';
export const SKIN = '#f6c9a0';

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;

// Pseudo-aleatório determinístico (o mesmo n dá sempre o mesmo valor entre 0 e 1).
export const hash = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

// R(x, y, w, h, cor): um retângulo alinhado aos píxeis de jogo.
export function mkR(ctx) {
  return (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
}

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
export function mix(a, b, t) {
  const A = rgb(a), B = rgb(b);
  const c = (i) => Math.round(A[i] + (B[i] - A[i]) * t);
  return `rgb(${c(0)},${c(1)},${c(2)})`;
}

// Céu em faixas (estilo pixel art), de cima (stops[0]) até à linha y = gy; daí para baixo fica a última cor.
export function sky(ctx, w, h, gy, stops, n = 12) {
  const span = Math.max(40, gy);
  for (let i = 0; i < n; i++) {
    const f = (i / (n - 1)) * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(f));
    const y0 = Math.floor((i * span) / n);
    ctx.fillStyle = mix(stops[k], stops[k + 1], f - k);
    ctx.fillRect(0, y0, w, i === n - 1 ? h - y0 : Math.ceil(span / n) + 1);
  }
}

export function stars(ctx, w, limit, t, seed = 1, n = 40) {
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < n; i++) {
    const tw = Math.sin(t * 2 + i * 1.7);
    if (tw < -0.7) continue;
    const x = Math.floor(hash(i + seed) * w), y = Math.floor(hash(i * 3.1 + seed) * limit);
    ctx.fillRect(x, y, 1, 1);
    if (tw > 0.6 && hash(i * 7.7 + seed) > 0.8) { ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3); }
  }
}

export function disc(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  cx = Math.round(cx); cy = Math.round(cy);
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.floor(Math.sqrt(r * r - dy * dy));
    ctx.fillRect(cx - half, cy + dy, half * 2, 1);
  }
}

// Montes ao fundo, com paralaxe (camX * par).
export function hills(ctx, w, h, gy, camX, par, height, amp, color, seed = 1) {
  ctx.fillStyle = color;
  const off = camX * par;
  for (let x = 0; x < w; x += 2) {
    const wx = x + off;
    const y = Math.floor(gy - height - amp * (Math.sin(wx * 0.021 + seed) * 0.6 + Math.sin(wx * 0.047 + seed * 1.7) * 0.4));
    ctx.fillRect(x, y, 2, h - y);
  }
}

// ---------- Letras em píxeis (3x5), para letreiros: maiúsculas, algarismos e pontuação ----------
// cada letra: 5 linhas de 3 pontos
const G = {
  "0": '### #.# #.# #.# ###', "1": '.#. ##. .#. .#. ###', "2": '##. ..# .#. #.. ###', "3": '##. ..# .#. ..# ##.',
  "4": '#.# #.# ### ..# ..#', "5": '### #.. ##. ..# ##.', "6": '.## #.. ### #.# ###', "7": '### ..# .#. .#. .#.',
  "8": '### #.# ### #.# ###', "9": '### #.# ### ..# ##.', "A": '.#. #.# ### #.# #.#', "B": '##. #.# ##. #.# ##.',
  "C": '.## #.. #.. #.. .##', "D": '##. #.# #.# #.# ##.', "E": '### #.. ##. #.. ###', "F": '### #.. ##. #.. #..',
  "G": '.## #.. #.# #.# .##', "H": '#.# #.# ### #.# #.#', "I": '### .#. .#. .#. ###', "J": '..# ..# ..# #.# .#.',
  "K": '#.# #.# ##. #.# #.#', "L": '#.. #.. #.. #.. ###', "M": '#.# ### ### #.# #.#', "N": '##. #.# #.# #.# #.#',
  "O": '.#. #.# #.# #.# .#.', "P": '##. #.# ##. #.. #..', "Q": '.#. #.# #.# .#. ..#', "R": '##. #.# ##. #.# #.#',
  "S": '.## #.. .#. ..# ##.', "T": '### .#. .#. .#. .#.', "U": '#.# #.# #.# #.# ###', "V": '#.# #.# #.# #.# .#.',
  "W": '#.# #.# ### ### #.#', "X": '#.# #.# .#. #.# #.#', "Y": '#.# #.# .#. .#. .#.', "Z": '### ..# .#. #.. ###',
  "!": '.#. .#. .#. ... .#.', "?": '##. ..# .#. ... .#.', ".": '... ... ... ... .#.', ",": '... ... ... .#. #..',
  "-": '... ... ### ... ...', ":": '... .#. ... .#. ...', "+": '... .#. ### .#. ...', "/": '..# ..# .#. #.. #..',
  "'": '.#. .#. ... ... ...', "*": '... #.# .#. #.# ...', "@": '### #.# ### #.. ###', "&": '.#. #.# .#. #.# .##', "♥": '#.# ### ### .#. ...',
  " ": '... ... ... ... ...',
};
for (const k of Object.keys(G)) G[k] = G[k].replace(/ /g, '');
const ACCENT = { 'Á': 'A', 'À': 'A', 'Â': 'A', 'Ã': 'A', 'É': 'E', 'Ê': 'E', 'Í': 'I', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ú': 'U' };

export const textW = (str, scale = 1) => Math.max(0, String(str).length * 4 - 1) * scale;

// Escreve `str` em letras de píxeis. opts: { scale, align: 'left' | 'center' | 'right', shadow: cor }.
export function text(ctx, str, x, y, color = PAPER, opts = {}) {
  const sc = opts.scale || 1, s = String(str).toUpperCase(), w = textW(s, sc);
  let x0 = Math.round(opts.align === 'center' ? x - w / 2 : opts.align === 'right' ? x - w : x);
  const y0 = Math.round(y);
  const put = (ox, oy, c) => {
    ctx.fillStyle = c;
    let cx = x0 + ox;
    for (const ch of s) {
      const base = ACCENT[ch] || (ch === 'Ç' ? 'C' : ch), g = G[base] || G['?'];
      for (let i = 0; i < 15; i++) if (g[i] === '#') ctx.fillRect(cx + (i % 3) * sc, y0 + oy + Math.floor(i / 3) * sc, sc, sc);
      if (ACCENT[ch]) ctx.fillRect(cx + sc, y0 + oy - 2 * sc, ch === 'Ã' || ch === 'Õ' ? 2 * sc : sc, sc);
      if (ch === 'Ç') ctx.fillRect(cx + sc, y0 + oy + 5 * sc, sc, sc);
      cx += 4 * sc;
    }
  };
  if (opts.shadow) put(sc, sc, opts.shadow);
  put(0, 0, color);
  return w;
}

// Tabuleta com letreiro: caixa escura com o texto ao centro (cx, y = topo). Devolve a largura.
export function sign(ctx, str, cx, y, opts = {}) {
  const sc = opts.scale || 1, w = textW(str, sc) + 6 * sc, h = 5 * sc + 4 * sc;
  ctx.fillStyle = opts.border || INK;
  ctx.fillRect(Math.round(cx - w / 2) - 1, Math.round(y) - 1, w + 2, h + 2);
  ctx.fillStyle = opts.bg || '#3a2f4f';
  ctx.fillRect(Math.round(cx - w / 2), Math.round(y), w, h);
  text(ctx, str, cx, y + 2 * sc, opts.color || GOLD, { scale: sc, align: 'center' });
  return w;
}

// Desenha um boneco (fotogramas de getCharacter) com os pés em (x, gy).
// opts: { face: 1 | -1, moving, dist, air, scale (1 ou 2), hop (píxeis acima do chão) }
export function person(ctx, frames, x, gy, opts = {}) {
  const img = charFrame(frames, opts.face || 1, !!opts.moving, !!opts.air, opts.dist || 0);
  const sc = opts.scale || 1, w = img.width * sc, h = img.height * sc;
  ctx.drawImage(img, Math.round(x - w / 2), Math.round(gy - h - (opts.hop || 0)), w, h);
}

// Sombra oval no chão.
export function shadow(ctx, x, gy, w = 12) {
  ctx.fillStyle = 'rgba(43,29,46,0.35)';
  ctx.fillRect(Math.round(x - w / 2), Math.round(gy), w, 2);
  ctx.fillRect(Math.round(x - w / 2) + 1, Math.round(gy) - 1, w - 2, 1);
}

// Balão de «!» ou de coração por cima de alguém (para chamar a atenção).
export function mark(ctx, x, y, kind = '!', color = GOLD) {
  ctx.fillStyle = INK; ctx.fillRect(Math.round(x) - 4, Math.round(y) - 9, 9, 10);
  ctx.fillStyle = PAPER; ctx.fillRect(Math.round(x) - 3, Math.round(y) - 8, 7, 8);
  if (kind === '!') { ctx.fillStyle = color === GOLD ? '#e0572f' : color; ctx.fillRect(Math.round(x), Math.round(y) - 7, 1, 4); ctx.fillRect(Math.round(x), Math.round(y) - 2, 1, 1); }
  else text(ctx, kind, Math.round(x) - 1, Math.round(y) - 7, color);
}

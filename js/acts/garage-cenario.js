// Cenários do Paradise Garage (nível 5): a porta, na rua, com o néon e a fila; e a pista, com a
// bola de espelhos, as luzes, o bar (Metz, Smirnoff Ice, shots) e a cabine do DJ.
import { getCharacter, makeSprite, flip, LOOKS } from '../sprites.js';
import { INK, PAPER, PINK, GOLD, hash, disc, text, textW, stars } from '../draw.js';

// Silhueta de um boneco (para a multidão às escuras): o mesmo desenho, todo de uma cor.
const tints = new Map();
export function tint(img, color) {
  let byColor = tints.get(img);
  if (!byColor) { byColor = {}; tints.set(img, byColor); }
  if (!byColor[color]) {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    byColor[color] = c;
  }
  return byColor[color];
}

// Feixe de luz: um trapézio de (x0, y0), com largura w0, até (x1, y1), com largura w1, em riscas.
export function beam(R, x0, y0, x1, y1, w0, w1, color) {
  const n = Math.max(1, Math.ceil((y1 - y0) / 2));
  for (let i = 0; i < n; i++) {
    const f = i / n, w = w0 + (w1 - w0) * f;
    R(x0 + (x1 - x0) * f - w / 2, y0 + i * 2, w, 2, color);
  }
}

const LIGHTS = ['255,93,143', '111,208,255', '255,209,102', '123,224,176', '199,155,255'];

// Letreiro de néon (letras de píxeis com brilho à volta).
export function neon(ctx, R, str, cx, y, sc, color, glow, on = true) {
  const w = textW(str, sc);
  if (on) R(Math.round(cx - w / 2) - 3, y - 3, w + 6, 5 * sc + 6, glow);
  text(ctx, str, cx, y, on ? color : '#5a4a6a', { scale: sc, align: 'center', shadow: on ? undefined : INK });
  if (on && sc > 1) { text(ctx, str, cx, y, PAPER, { scale: sc, align: 'center' }); text(ctx, str, cx + 1, y + 1, color, { scale: sc, align: 'center' }); }
}

// ---------- A porta ----------
// o: { gy, top }. Devolve onde ficam a porta e o porteiro: { door, guard }.
export function portaGeo(v, gy) {
  const door = Math.round(v.w * (v.portrait ? 0.8 : 0.84));
  return { door, guard: door - (v.portrait ? 30 : 36) };
}

export function portaBg(ctx, v, R, t, o) {
  const { gy, top } = o, w = v.w, { door } = portaGeo(v, gy);
  // céu de noite e o passadiço de Alcântara ao fundo
  R(0, 0, w, gy, '#141033');
  stars(ctx, w, Math.max(20, gy - 120), t, 5, 30);
  const wallTop = Math.max(top - 30, gy - (v.portrait ? 262 : 118));
  // passadiço (ponte pedonal) por trás do armazém
  const py = wallTop - (v.portrait ? 26 : 0);
  if (v.portrait) {
    R(0, py, w, 3, '#3a3660'); R(0, py - 8, w, 1, '#3a3660');
    for (let x = 4; x < w; x += 8) R(x, py - 8, 1, 8, '#2e2a52');
    for (let x = 20; x < w; x += 70) R(x, py + 3, 4, 40, '#2e2a52');
  }
  // o armazém: parede de tijolo escuro
  R(0, wallTop, w, gy - wallTop, '#3b2540');
  R(0, wallTop, w, 3, '#5a3a5a'); R(0, wallTop + 3, w, 1, INK);
  for (let y = wallTop + 8, j = 0; y < gy - 2; y += 6, j++) {
    for (let x = (j % 2) * 7 - 4; x < w; x += 14) R(x, y, 12, 1, '#30203a');
  }
  // janelas altas com luz a piscar lá dentro
  const winY = wallTop + 12, nwin = Math.floor(w / 46);
  if (v.portrait) {
    for (let i = 0; i < nwin; i++) {
      const x = 14 + i * 46, c = LIGHTS[(i + Math.floor(t * 2.1)) % LIGHTS.length];
      R(x - 1, winY - 1, 20, 14, INK); R(x, winY, 18, 12, `rgba(${c},0.55)`); R(x + 8, winY, 2, 12, INK); R(x, winY + 5, 18, 1, INK);
    }
  }
  // letreiro de néon
  const flick = hash(Math.floor(t * 9)) > 0.06;
  const sy = v.portrait ? winY + 26 : Math.max(top + 4, wallTop + 8);
  if (v.portrait) {
    R(w / 2 - 62, sy - 6, 124, 42, INK); R(w / 2 - 60, sy - 4, 120, 38, '#1a1030');
    neon(ctx, R, 'PARADISE', w / 2, sy, 3, PINK, 'rgba(255,93,143,0.25)', flick);
    neon(ctx, R, 'GARAGE', w / 2, sy + 18, 3, '#6fd0ff', 'rgba(111,208,255,0.25)', true);
  } else {
    const cx = Math.round(w * 0.42);
    R(cx - 70, sy - 5, 140, 21, INK); R(cx - 68, sy - 3, 136, 17, '#1a1030');
    neon(ctx, R, 'PARADISE', cx - 30, sy, 2, PINK, 'rgba(255,93,143,0.25)', flick);
    neon(ctx, R, 'GARAGE', cx + 40, sy, 2, '#6fd0ff', 'rgba(111,208,255,0.25)', true);
  }
  // cartaz da Ladies Night ao lado da porta
  const lx = door - (v.portrait ? 76 : 96), ly = gy - (v.portrait ? 92 : 70);
  R(lx - 1, ly - 1, 36, 26, INK); R(lx, ly, 34, 24, '#ffe3ee');
  text(ctx, 'LADIES', lx + 17, ly + 3, '#c2185b', { align: 'center' });
  text(ctx, 'NIGHT', lx + 17, ly + 10, '#c2185b', { align: 'center' });
  text(ctx, 'SEXTA', lx + 17, ly + 17, INK, { align: 'center' });
  // a porta: aberta, com luz de dentro
  const dh = v.portrait ? 62 : 56, dw = 30;
  R(door - dw / 2 - 3, gy - dh - 3, dw + 6, dh + 3, INK);
  R(door - dw / 2, gy - dh, dw, dh, '#0d0820');
  const c = LIGHTS[Math.floor(t * 2.6) % LIGHTS.length];
  R(door - dw / 2, gy - dh, dw, dh, `rgba(${c},0.4)`);
  beam(R, door, gy - dh + 6, door, gy, 6, dw, `rgba(${c},0.25)`);
  R(door - dw / 2 - 3, gy - dh - 9, dw + 6, 6, '#5a3a5a'); R(door - dw / 2 - 3, gy - dh - 10, dw + 6, 1, INK);
  // candeeiro por cima da porta
  R(door - 2, gy - dh - 15, 4, 5, GOLD); R(door - 3, gy - dh - 16, 6, 1, INK);
  // passeio e estrada
  R(0, gy, w, v.h - gy, '#4a4458');
  R(0, gy, w, 2, '#6a6478');
  for (let x = -6 + (Math.floor(gy) % 3); x < w; x += 26) R(x, gy + 2, 1, 7, '#3a3448');
  R(0, gy + 9, w, 2, '#2e2a3a');
  R(0, gy + 11, w, v.h - gy - 11, '#2a2636');
  for (let x = 8; x < w; x += 44) R(x, gy + 11 + Math.round((v.h - gy - 11) * 0.5), 20, 2, '#5a5468');
}

// Postes com corda (à frente da fila), desenhados por cima das pessoas.
export function portaCorda(R, x0, x1, gy) {
  for (let x = x0; x <= x1 - 8; x += 30) {
    const xe = Math.min(x + 30, x1);
    for (let k = 1; k < 6; k++) { const f = k / 6; R(x + (xe - x) * f, gy - 13 + Math.round(Math.sin(f * Math.PI) * 4), (xe - x) / 6 + 1, 2, '#c2185b'); }
  }
  for (let x = x0; x <= x1; x += 30) { R(x - 1, gy - 15, 3, 15, INK); R(x, gy - 14, 1, 13, GOLD); R(x - 2, gy - 17, 5, 3, GOLD); R(x - 3, gy - 1, 7, 2, INK); }
}

// ---------- A pista ----------
// o: { gy, top, beat, pulse, dim (0–1: escurece a sala), noBooth }.
export function pistaBg(ctx, v, R, t, o) {
  const { gy, top } = o, w = v.w, beat = o.beat || t * 2, pulse = o.pulse || 0, P = v.portrait;
  const b = Math.floor(beat);
  // parede do fundo
  R(0, 0, w, gy, '#1a1030');
  for (let x = 12; x < w; x += 38) R(x, 0, 3, gy, '#221640');
  R(0, gy - 30, w, 30, '#150c28');
  // pontos de luz da bola de espelhos a passear pelas paredes
  for (let i = 0; i < 26; i++) {
    const x = (hash(i) * w + t * (10 + hash(i + 9) * 18)) % w, y = top - 20 + hash(i * 3.3) * (gy - top + 10);
    R(x, y, 2, 2, i % 3 ? 'rgba(255,255,255,0.28)' : 'rgba(255,209,102,0.4)');
  }
  // ----- o bar, à esquerda -----
  const barW = Math.round(P ? w * 0.4 : Math.min(120, w * 0.3)), shelfY = Math.max(top + 30, gy - (P ? 118 : 96));
  // quadro das bebidas
  R(3, shelfY - 26, 58, 24, INK); R(4, shelfY - 25, 56, 22, '#24382e');
  text(ctx, 'BAR', 32, shelfY - 23, GOLD, { align: 'center' });
  text(ctx, 'METZ', 8, shelfY - 16, PAPER);
  text(ctx, 'SHOTS', 36, shelfY - 16, '#7be0b0');
  text(ctx, 'SMIRNOFF ICE', 32, shelfY - 9, '#ff8a8a', { align: 'center' });
  // prateleira iluminada com garrafas: Metz (prateadas), Smirnoff Ice (vidro, rótulo no gargalo) e shots
  R(0, shelfY, barW, 20, '#2e1f4f'); R(0, shelfY + 20, barW, 2, '#5a3a8a'); R(0, shelfY - 1, barW, 1, '#5a3a8a');
  for (let x = 5, i = 0; x < barW - 8; x += 9, i++) {
    const k = i % 5;
    if (k < 2) {             // Metz: garrafa prateada com rótulo azul
      R(x, shelfY + 6, 5, 14, '#d8dce8'); R(x + 1, shelfY + 2, 3, 4, '#d8dce8'); R(x + 1, shelfY + 1, 3, 1, '#8a93a7'); R(x, shelfY + 11, 5, 4, '#3f6fb5');
    } else if (k < 4) {      // Smirnoff Ice: vidro claro, rótulo vermelho no gargalo
      R(x, shelfY + 7, 5, 13, '#eaf6ff'); R(x + 1, shelfY + 2, 3, 5, '#eaf6ff'); R(x + 1, shelfY + 3, 3, 3, '#e0392b'); R(x + 1, shelfY + 1, 3, 1, '#c9c9d8'); R(x + 1, shelfY + 12, 3, 4, '#c9e2f5');
    } else {                 // shots: três copinhos de cores
      R(x - 1, shelfY + 15, 3, 5, '#7be0b0'); R(x + 3, shelfY + 15, 3, 5, '#ff8a4b'); R(x + 7, shelfY + 15, 3, 5, '#6fd0ff'); x += 4;
    }
  }
  // balcão
  const cy = gy - (P ? 46 : 40);
  R(0, cy, barW, gy - cy, '#3a2456'); R(0, cy, barW, 3, '#7a4fb0'); R(0, cy + 3, barW, 1, INK);
  for (let x = 6; x < barW - 4; x += 16) R(x, cy + 8, 2, gy - cy - 8, '#2e1c46');
  R(barW, cy, 2, gy - cy, INK);
  // ----- a cabine do DJ, à direita -----
  if (!o.noBooth) {
    const bw = Math.round(P ? w * 0.36 : Math.min(104, w * 0.27)), bx = w - bw, by = gy - (P ? 72 : 62);
    // colunas de som
    R(w - 20, by - 44, 20, 44, INK); R(w - 18, by - 42, 18, 42, '#2a2440');
    disc(ctx, w - 9, by - 32, 5 + (pulse > 0.5 ? 1 : 0), '#0d0820'); disc(ctx, w - 9, by - 32, 2, '#5a5478');
    disc(ctx, w - 9, by - 13, 6 + (pulse > 0.5 ? 1 : 0), '#0d0820'); disc(ctx, w - 9, by - 13, 2, '#5a5478');
    // o DJ (de auscultadores), atrás da mesa
    const dj = getCharacter('empregado', 'casual'), img = dj[b % 2 ? 'a' : 'b'][b % 4 < 2 ? 'l' : 'r'];
    const dx = bx + Math.round((bw - 20) / 2), hop = Math.round(pulse * 2);
    ctx.drawImage(shade(img, 0.3), dx - 16, by - 34 - hop, 32, 48);
    R(dx - 11, by - 26 - hop, 22, 2, '#ff5d8f'); R(dx - 13, by - 24 - hop, 4, 8, '#ff5d8f'); R(dx + 9, by - 24 - hop, 4, 8, '#ff5d8f');
    // mesa com dois pratos
    R(bx, by, bw - 20, gy - by, '#2a2144'); R(bx, by, bw - 20, 3, '#ff5d8f'); R(bx - 2, by, 2, gy - by, INK);
    R(bx + 4, by - 5, bw - 28, 5, '#3a3458'); R(bx + 4, by - 6, bw - 28, 1, INK);
    const p1 = bx + 12, p2 = bx + bw - 36;
    for (const px of [p1, p2]) { R(px - 7, by - 9, 14, 4, '#0d0820'); R(px - 1 + Math.round(Math.sin(t * 9 + px) * 4), by - 8, 2, 2, '#c9c9d8'); }
    text(ctx, 'DJ', bx + (bw - 20) / 2, by + 8, GOLD, { align: 'center', scale: 2, shadow: INK });
    // luzes do equalizador na frente da mesa
    for (let k = 0; k < 6; k++) {
      const eh = 3 + Math.round(hash(k * 3.3 + b) * 9 * (0.4 + pulse * 0.6));
      R(bx + 6 + k * Math.floor((bw - 32) / 6), by + 36 - eh, 4, eh, k % 2 ? '#6fd0ff' : '#ff5d8f');
    }
  }
  // ----- bola de espelhos e projetores -----
  const mx = Math.round(w * (P ? 0.5 : 0.33)), my = top + 11;
  R(mx, 0, 1, my - 8, '#8a93a7');
  disc(ctx, mx, my, 8, INK); disc(ctx, mx, my, 7, '#9aa3b7');
  for (let j = -6; j <= 6; j += 3) for (let i = -6; i <= 6; i += 3) {
    if (i * i + j * j > 44) continue;
    const s = hash(i * 7 + j * 13 + Math.floor(t * 6));
    R(mx + i, my + j, 2, 2, s > 0.7 ? '#ffffff' : s > 0.35 ? '#c9d2e6' : '#7a84a0');
  }
  const nb = P ? 4 : 5;
  for (let i = 0; i < nb; i++) {
    const x0 = Math.round(((i + 0.5) * w) / nb), c = LIGHTS[(i + b) % LIGHTS.length];
    const sway = Math.sin(t * 1.3 + i * 2.1) * (P ? 40 : 60);
    R(x0 - 3, top - 2, 6, 4, INK); R(x0 - 2, top + 1, 4, 2, `rgb(${c})`);
    beam(R, x0, top + 3, x0 + sway, gy + 6, 4, 34, `rgba(${c},${(0.1 + pulse * 0.08).toFixed(2)})`);
  }
  // ----- a pista: mosaicos de luz que mudam a cada tempo -----
  const rows = Math.max(3, Math.ceil((v.h - gy) / 14)), th = Math.ceil((v.h - gy) / rows), tw = P ? 25 : 27;
  R(0, gy, w, v.h - gy, '#221640');
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i * tw < w; i++) {
      const k = Math.floor(hash(i * 5.3 + j * 9.1 + b * 3.7) * LIGHTS.length), lit = hash(i + j * 4 + b) > 0.45;
      R(i * tw, gy + j * th, tw, th, lit ? `rgba(${LIGHTS[k]},${(0.4 + pulse * 0.25).toFixed(2)})` : '#221640');
      R(i * tw, gy + j * th, tw, 1, '#150c28'); R(i * tw, gy + j * th, 1, th, '#150c28');
    }
  }
  R(0, gy, w, 2, '#0d0820');
  if (o.dim) R(0, 0, w, v.h, `rgba(8,4,20,${o.dim})`);
}

// ---------- Figurantes ----------
// Desconhecidos para a fila e para a multidão: os mesmos moldes dos bonecos, com cores ao acaso.
const HAIR = ['#3b2a20', '#6b4226', '#c9985a', '#1f1a2a', '#a8562e', '#8a5f3a'];
const CLOTH = ['#7a3fa0', '#3f6fb5', '#a8324a', '#3fa6a0', '#b8862e', '#d877a3', '#5a6aa8', '#c9c9d8'];
const extras = [];
export function extra(i) {
  i = ((i % 12) + 12) % 12;
  if (!extras[i]) {
    const def = (i % 2 ? LOOKS.pipoca : LOOKS.ines).def;
    const h = HAIR[Math.floor(hash(i * 3.1 + 2) * HAIR.length)], c = CLOTH[Math.floor(hash(i * 5.7 + 1) * CLOTH.length)];
    const pal = { o: INK, s: '#f6c9a0', c: '#f09a8c', e: INK, m: '#c2544c', h, H: h, v: h, d: '#f6c9a0', t: c, T: c, k: c, p: '#2a2f4a', b: INK };
    const frames = {};
    for (const leg of ['stand', 'a', 'b']) {
      const img = makeSprite([...def.upper, ...def.legs[leg]], pal);
      frames[leg] = { r: img, l: flip(img) };
    }
    extras[i] = frames;
  }
  return extras[i];
}

// O mesmo boneco, escurecido (gente na penumbra).
const shades = new Map();
export function shade(img, alpha = 0.5) {
  let c = shades.get(img);
  if (!c) {
    c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = `rgba(16,8,36,${alpha})`;
    g.fillRect(0, 0, c.width, c.height);
    shades.set(img, c);
  }
  return c;
}

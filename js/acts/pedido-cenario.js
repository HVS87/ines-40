// Cenário do nível 25 (o pedido): o Tejo ao pôr do sol visto do convés de um catamarã, com a
// Ponte 25 de Abril, o Cristo Rei e a Torre de Belém ao fundo. E o segundo barco, o da roda de samba.
import { getCharacter } from '../sprites.js';
import { INK, PAPER, GOLD, sky, disc, hash, text } from '../draw.js';

const RED = '#b8323a';

// o: { gy (linha do convés), top, deckW (largura do convés do catamarã; por omissão, o ecrã todo) }
export function tejoBg(ctx, v, R, t, o) {
  const { gy, top } = o, w = v.w, P = v.portrait;
  const hz = Math.round(Math.max(top + 34, gy - (P ? 110 : 62)));      // horizonte
  sky(ctx, w, v.h, hz, ['#3a2a6a', '#8a3f7a', '#e0624a', '#ffb45a', '#ffe08a']);
  // sol a pôr-se e nuvens
  const sx = Math.round(w * 0.6);
  disc(ctx, sx, hz - 3, 11, '#fff3c0'); disc(ctx, sx, hz - 3, 8, '#ffffff');
  for (let i = 0; i < 4; i++) {
    const cx = (hash(i + 2) * w + t * (2 + i)) % (w + 60) - 30, cy = Math.max(4, hz - 56 - i * 13);
    R(cx, cy, 30, 3, 'rgba(255,170,150,0.55)'); R(cx + 6, cy - 2, 16, 2, 'rgba(255,190,170,0.55)');
  }
  // margem sul, com o Cristo Rei
  for (let x = 0; x < w * 0.5; x += 2) R(x, hz - 5 - Math.round(Math.sin(x * 0.05) * 2 + Math.sin(x * 0.021 + 1) * 3), 2, 12, '#4a2f5a');
  const kx = Math.round(w * 0.2);
  R(kx - 2, hz - 30, 4, 24, '#3a2448'); R(kx - 3, hz - 12, 6, 6, '#3a2448');
  R(kx - 1, hz - 38, 2, 8, '#3a2448'); R(kx - 5, hz - 36, 10, 1, '#3a2448'); R(kx - 1, hz - 40, 2, 2, '#3a2448');
  // margem norte, com a Torre de Belém
  for (let x = Math.round(w * 0.74); x < w; x += 2) R(x, hz - 3 - Math.round(Math.sin(x * 0.07) * 1.5), 2, 8, '#5a3660');
  const bx = Math.round(w * 0.9);
  R(bx - 8, hz - 9, 14, 9, '#e8c8a0'); R(bx - 8, hz - 10, 14, 1, '#b89070'); R(bx - 9, hz - 12, 2, 3, '#e8c8a0'); R(bx + 5, hz - 12, 2, 3, '#e8c8a0');
  R(bx - 1, hz - 22, 8, 13, '#f0d4ac'); R(bx - 2, hz - 23, 10, 1, '#b89070'); R(bx - 2, hz - 26, 2, 3, '#f0d4ac'); R(bx + 6, hz - 26, 2, 3, '#f0d4ac'); R(bx + 2, hz - 27, 2, 4, '#f0d4ac');
  R(bx + 1, hz - 18, 2, 3, '#7a5a4a'); R(bx + 4, hz - 18, 2, 3, '#7a5a4a'); R(bx - 5, hz - 6, 2, 2, '#7a5a4a');
  // Ponte 25 de Abril: tabuleiro, duas torres, cabos e pendurais
  const dy = hz - 13, t1 = Math.round(w * 0.36), t2 = Math.round(w * 0.74), th = P ? 40 : 32;
  R(0, dy, w, 2, RED); R(0, dy + 2, w, 1, '#7a1f2a');
  for (let x = 3; x < w; x += 9) R(x, dy + 2, 1, hz - dy - 2, 'rgba(122,31,42,0.5)');
  const cable = (x) => {
    if (x < t1) { const f = (t1 - x) / (t1 + 20); return dy - th + Math.round(th * f * (2 - f) * 0.92); }
    if (x > t2) { const f = (x - t2) / (w - t2 + 20); return dy - th + Math.round(th * f * (2 - f) * 0.92); }
    const f = (x - t1) / (t2 - t1) * 2 - 1; return dy - 3 - Math.round((th - 3) * f * f);
  };
  for (let x = 0; x < w; x++) { const y = cable(x); R(x, y, 1, 1, RED); if (x % 5 === 0 && y < dy - 1) R(x, y, 1, dy - y, 'rgba(184,50,58,0.55)'); }
  for (const x of [t1, t2]) {
    R(x - 2, dy - th - 2, 4, hz - dy + th + 2, RED); R(x - 3, dy - th - 3, 6, 2, '#7a1f2a');
    R(x - 3, dy - Math.round(th * 0.5), 6, 1, '#7a1f2a'); R(x - 3, dy - Math.round(th * 0.75), 6, 1, '#7a1f2a');
    R(x - 3, hz - 2, 6, 3, '#5a4a5a');
  }
  // o rio, com o reflexo do sol
  const wh = v.h - hz, bands = ['#f0986a', '#d8707a', '#9a5a8a', '#5a4a8a', '#3a3a7a'];
  for (let i = 0; i < bands.length; i++) R(0, hz + Math.floor((i * i * wh) / 25), w, wh, bands[i]);
  for (let i = 0; i < 16; i++) {
    const y = hz + 2 + i * 4, ww = 6 + ((i * 7 + Math.floor(t * 3)) % 9) * 2;
    if (y < gy) R(sx - ww / 2 + Math.round(Math.sin(t * 2 + i) * 3), y, ww, 1, 'rgba(255,240,180,0.75)');
  }
  for (let i = 0; i < 14; i++) {
    const x = (hash(i * 3.3) * w + t * 6) % w, y = hz + 6 + hash(i * 1.7) * Math.max(4, gy - hz - 10);
    R(x, y, 7, 1, 'rgba(255,255,255,0.25)');
  }
  // ----- o catamarã: guarda, mastro com bandeirinhas e convés -----
  const dw = o.deckW || w;
  // mastro e retranca com a vela enrolada
  const mx = Math.round(Math.min(dw, w) * (P ? 0.1 : 0.07));
  R(mx - 1, 0, 3, gy, '#e8e8f0'); R(mx + 2, 0, 1, gy, '#a8a8b8');
  R(mx, gy - 44, Math.round(dw * 0.3), 3, '#e8e8f0'); R(mx + 3, gy - 49, Math.round(dw * 0.28), 5, '#f6f0e0'); R(mx + 3, gy - 45, Math.round(dw * 0.28), 1, '#c8b8a0');
  // bandeirinhas do mastro até à popa
  const fy0 = Math.max(top + 4, gy - 104);
  for (let x = mx + 4, i = 0; x < dw - 6; x += 12, i++) {
    const f = (x - mx) / Math.max(1, dw - mx), y = fy0 + Math.round(Math.sin(f * Math.PI) * 10 + f * 20);
    R(x, y, 12, 1, '#5a4a5a');
    const c = ['#ff5d8f', '#ffd166', '#7be0b0', '#6fd0ff'][i % 4];
    R(x + 3, y + 1, 6, 2, c); R(x + 4, y + 3, 4, 2, c); R(x + 5, y + 5, 2, 1, c);
  }
  // guarda (varandim)
  R(0, gy - 15, dw, 1, '#f2f2f7'); R(0, gy - 8, dw, 1, '#c8c8d8');
  for (let x = 6; x < dw; x += 22) { R(x, gy - 16, 2, 16, '#f2f2f7'); R(x + 2, gy - 16, 1, 16, '#a8a8b8'); }
  // convés
  R(0, gy, dw, v.h - gy, '#efe6d2'); R(0, gy, dw, 2, '#ffffff');
  for (let y = gy + 6; y < v.h; y += 7) R(0, y, dw, 1, '#d8ccb4');
  for (let x = 14; x < dw; x += 40) R(x, gy + 2, 1, v.h - gy, '#d8ccb4');
  if (dw < w) { R(dw, gy - 2, 3, v.h - gy + 2, '#a8a8b8'); R(dw - 2, gy - 16, 2, 16, '#f2f2f7'); }
}

// Instrumentos de samba, pequenos (centro em x, y): 0 pandeiro, 1 cavaquinho, 2 surdo.
export function instrumento(ctx, R, k, x, y, sc = 1) {
  if (k === 0) {
    disc(ctx, x, y, 6 * sc, INK); disc(ctx, x, y, 5 * sc, '#ffd23e'); disc(ctx, x, y, 3 * sc, '#fff6e6');
    R(x - 6 * sc, y - 1, 2, 2, '#c9c9d8'); R(x + 5 * sc - 1, y - 1, 2, 2, '#c9c9d8'); R(x - 1, y - 6 * sc, 2, 2, '#c9c9d8'); R(x - 1, y + 5 * sc - 1, 2, 2, '#c9c9d8');
  } else if (k === 1) {
    R(x - 6 * sc, y - 1 * sc, 8 * sc, 7 * sc, INK); R(x - 5 * sc, y, 6 * sc, 5 * sc, '#ff8a4b'); R(x - 3 * sc, y + 2 * sc, 2 * sc, 2 * sc, '#5a2e1e');
    for (let i = 0; i < 5; i++) { R(x + (1 + i) * sc, y - (1 + i) * sc, 3 * sc, 3 * sc, INK); }
    for (let i = 0; i < 5; i++) { R(x + (1 + i) * sc + 1, y - (1 + i) * sc + 1, sc, sc, '#e8c080'); }
  } else {
    R(x - 6 * sc, y - 5 * sc, 12 * sc, 11 * sc, INK); R(x - 5 * sc, y - 4 * sc, 10 * sc, 9 * sc, '#3f8fd0');
    R(x - 5 * sc, y - 4 * sc, 10 * sc, 2 * sc, '#fff6e6'); R(x - 5 * sc, y + 3 * sc, 10 * sc, 2 * sc, '#c9c9d8');
    R(x - 2 * sc, y - 2 * sc, sc, 5 * sc, '#ffd23e'); R(x + 1 * sc, y - 2 * sc, sc, 5 * sc, '#ffd23e');
  }
}

// O barco da roda de samba, a encostar ao catamarã: casco colorido de x0 até à direita do ecrã,
// com três músicos (pandeiro, cavaquinho e surdo).
export function barcoSamba(ctx, v, R, t, o) {
  const { gy, x0, beat } = o, w = v.w, P = v.portrait;
  if (x0 >= w) return;
  const b = Math.floor(beat), pulse = Math.max(0, 1 - (beat - b) * 3), bw = w - x0;
  // água entre os dois barcos
  R(x0 - 6, gy - 2, 6, v.h - gy + 2, '#4a4a8a');
  for (let y = gy + 2; y < v.h; y += 6) R(x0 - 5 + ((y + Math.floor(t * 4)) % 3), y, 3, 1, 'rgba(255,255,255,0.4)');
  // casco e convés
  R(x0, gy - 12, bw, 12, '#2f8f5a'); R(x0, gy - 13, bw, 2, '#ffd23e'); R(x0, gy - 5, bw, 2, '#3f6fd0');
  R(x0, gy, bw, v.h - gy, '#c89a5c'); R(x0, gy, bw, 2, '#ffd23e');
  for (let y = gy + 6; y < v.h; y += 7) R(x0, y, bw, 1, '#a87a44');
  R(x0, gy - 13, 2, v.h - gy + 13, INK);
  // mastro com letreiro e fitas
  const mx = x0 + Math.round(bw * 0.5);
  R(mx - 1, Math.max(0, o.top - 6), 2, gy - o.top + 6, '#7a4f2a');
  const sy = o.top + (P ? 22 : 8), sw = 58;
  R(mx - sw / 2 - 1, sy - 1, sw + 2, 11, INK); R(mx - sw / 2, sy, sw, 9, '#2f8f5a'); R(mx - sw / 2, sy, sw, 1, '#ffd23e');
  text(ctx, 'RODA DE SAMBA', mx, sy + 2, '#ffd23e', { align: 'center' });
  // os músicos
  const f = getCharacter('sambista'), n = 3;
  for (let k = 0; k < n; k++) {
    const x = x0 + Math.round(((k + 0.5) * bw) / n) + (P ? 0 : 2), leg = (b + k) % 2 ? 'a' : 'b', hop = Math.round(pulse * 3);
    const img = f[o.playing ? leg : 'stand'].l;
    R(x - 7, gy, 14, 2, 'rgba(43,29,46,0.35)');
    ctx.drawImage(img, x - 16, gy - 48 - (o.playing ? hop : 0), 32, 48);
    const iy = gy - 20 - (o.playing ? hop : 0);
    instrumento(ctx, R, k, x - 9, iy + (k === 2 ? 4 : 0), 1);
    if (k === 2) { const s = o.playing && pulse > 0.4 ? 3 : 0; R(x - 4, iy - 6 + s, 2, 6, PAPER); R(x - 5, iy - 1 + s, 4, 3, PAPER); }
    if (k === 0 && o.playing && pulse > 0.5) { R(x - 18, iy - 8, 2, 2, GOLD); R(x - 2, iy - 9, 2, 2, GOLD); }
  }
}

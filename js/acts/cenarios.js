// Cenários simples usados em mais do que um nível (fundos para o ato Talk).
import { INK, PAPER, sign, sky, disc } from '../draw.js';

// O céu ao fim da tarde, com um avião a subir a caminho da Austrália.
export function partida(ctx, v, R, t, act) {
  const gy = act.ground(v), top = act.top(v), w = v.w;
  sky(ctx, w, v.h, gy, ['#3a3a78', '#7a4a8a', '#d0607a', '#f09a6a', '#f8cf8a']);
  disc(ctx, Math.round(w * 0.2), gy - 8, 12, '#fff3c4');
  for (let i = 0; i < 4; i++) { const cx = ((i * 97 + t * 4) % (w + 60)) - 30, cy = top + 16 + i * 14; R(cx, cy, 26, 4, 'rgba(255,255,255,0.5)'); R(cx + 5, cy - 3, 14, 3, 'rgba(255,255,255,0.5)'); }
  // os telhados de Lisboa, em silhueta
  R(0, gy, w, v.h - gy, '#2a2540');
  for (let x = 0, i = 0; x < w; x += 22, i++) { const h = 8 + ((i * 7) % 5) * 4; R(x, gy - h, 21, h, '#2a2540'); R(x + 4, gy - h + 3, 3, 3, '#ffd98a'); if (i % 2) R(x + 12, gy - h + 6, 3, 3, '#ffd98a'); }
  // o avião, a subir da esquerda para a direita, com o rasto
  const f = (t * 0.12) % 1.3, px = Math.round(-20 + f * (w + 40)), py = Math.round(gy - 30 - f * (gy - top - 44));
  for (let k = 1; k < 9; k++) R(px - 10 - k * 9, py + 3 + k * 2, 6, 1, `rgba(255,255,255,${(0.7 - k * 0.07).toFixed(2)})`);
  R(px - 12, py, 26, 6, INK); R(px - 11, py + 1, 24, 4, PAPER); R(px + 12, py + 1, 3, 3, PAPER); R(px + 9, py + 1, 3, 2, '#6fb0f0');
  R(px - 13, py - 5, 5, 6, INK); R(px - 12, py - 4, 3, 5, '#e0392b');
  R(px - 3, py + 3, 9, 4, INK); R(px - 2, py + 4, 7, 2, '#c9c9d8');
  for (let k = 0; k < 4; k++) R(px - 6 + k * 4, py + 2, 2, 1, '#6fb0f0');
  sign(ctx, 'AUSTRÁLIA', Math.round(w * 0.74), Math.max(top + 4, gy - 60), { bg: '#2a2540', color: '#ffd166' });
}

// Corredor da maternidade: parede clara, porta da sala de partos, cadeiras de espera e um relógio.
export function corredor(ctx, v, R, t, act) {
  const gy = act.ground(v), top = act.top(v);
  R(0, 0, v.w, gy, '#e8f0ee');
  R(0, gy - 30, v.w, 30, '#bfe0d8'); R(0, gy - 30, v.w, 2, '#9fc8be');
  for (let x = 0, i = 0; x < v.w; x += 22, i++) for (let y = gy; y < v.h; y += 12) R(x, y, 22, 12, (i + Math.floor((y - gy) / 12)) % 2 ? '#d8dce6' : '#c8ccd8');
  R(0, gy, v.w, 2, '#a8acb8');
  // porta dupla com óculos redondos
  const dx = Math.round(v.w * 0.72), dh = Math.min(74, gy - top - 14);
  R(dx - 23, gy - dh - 2, 46, dh + 2, INK); R(dx - 21, gy - dh, 20, dh, '#8fc4b8'); R(dx + 1, gy - dh, 20, dh, '#8fc4b8');
  R(dx - 15, gy - dh + 8, 8, 8, '#dff3ff'); R(dx + 7, gy - dh + 8, 8, 8, '#dff3ff');
  R(dx - 4, gy - dh * 0.5, 2, 6, '#5a6478'); R(dx + 2, gy - dh * 0.5, 2, 6, '#5a6478');
  sign(ctx, 'SALA DE PARTOS', dx, gy - dh - 14, { bg: '#2f6f62', color: '#ffffff' });
  // cadeiras de espera
  const cx = Math.round(v.w * 0.1);
  for (let k = 0; k < 3; k++) { R(cx + k * 14, gy - 22, 12, 10, '#5a8fd0'); R(cx + k * 14, gy - 12, 12, 3, '#3f6fb0'); R(cx + k * 14 + 1, gy - 9, 2, 9, '#8a93a7'); R(cx + k * 14 + 9, gy - 9, 2, 9, '#8a93a7'); }
  // relógio de parede, com o ponteiro a andar
  const kx = Math.round(v.w * 0.4), ky = Math.max(top + 10, gy - 78);
  R(kx - 7, ky - 7, 14, 14, INK); R(kx - 6, ky - 6, 12, 12, '#ffffff'); R(kx, ky - 4, 1, 5, INK);
  const a = t * 1.5; R(kx + Math.round(Math.cos(a) * 3), ky + Math.round(Math.sin(a) * 3), 1, 1, '#e0392b'); R(kx, ky, 1, 1, INK);
}

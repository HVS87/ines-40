// Cenários simples usados em mais do que um nível (fundos para o ato Talk).
import { INK, sign } from '../draw.js';

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

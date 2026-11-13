// Nível 18, ato 3 (conversa): a gala a correr bem, vista dos bastidores. À esquerda, por entre
// a cortina, o palco iluminado e a plateia a aplaudir; à direita, a Inês (de auricular) a
// suspirar de alívio... até o telefone tocar para o evento seguinte.
import { INK, PAPER, GOLD, PINK, MINT, SKIN, hash, sign } from '../draw.js';
import { box, bimby, VERDE, INOX_D } from './bimby-comum.js';

const CONF = [PINK, GOLD, MINT, '#6fb0f0', '#ffffff'];

export function fundoBastidores(ctx, v, R, t, act) {
  const w = v.w, gy = act.ground(v), top = act.top(v), sx = Math.round(w * 0.4);
  // o palco, lá ao fundo
  R(0, 0, sx, v.h, '#4a3590');
  for (let i = 0; i < 3; i++) {
    const x0 = (sx * (i + 0.5)) / 3;
    ctx.globalAlpha = 0.16; ctx.fillStyle = CONF[i + 1];
    ctx.beginPath(); ctx.moveTo(x0 - 2, top); ctx.lineTo(x0 + 2, top); ctx.lineTo(x0 + 24, gy); ctx.lineTo(x0 - 24, gy); ctx.fill();
    ctx.globalAlpha = 1;
  }
  sign(ctx, 'GALA', sx / 2, top + 6, { scale: 2, bg: '#ffffff', color: VERDE, border: VERDE });
  // a Bimby em destaque, num pedestal
  const bx = Math.round(sx * 0.45);
  box(R, bx - 12, gy - 26, 24, 26, '#ffffff'); R(bx - 12, gy - 26, 24, 3, VERDE);
  bimby(ctx, R, bx, gy - 27, 1, { screen: '' });
  // confettis
  for (let i = 0; i < 26; i++) {
    const f = (t * (0.25 + hash(i) * 0.2) + hash(i * 3.1)) % 1;
    R(hash(i * 7.7) * sx + Math.sin(t * 2 + i) * 4, top + f * (gy - top), 2, 2, CONF[i % 5]);
  }
  // o estrado e a plateia (cabeças e mãos a bater palmas)
  R(0, gy, sx, 7, '#8a5a34'); R(0, gy, sx, 2, '#b8834a'); R(0, gy + 7, sx, v.h - gy - 7, '#120c28');
  for (let r = 0; gy + 20 + r * 15 < v.h + 8; r++) {
    const y = gy + 20 + r * 15;
    for (let x = -6 + (r % 2) * 9, k = 0; x < sx - 8; x += 18, k++) {
      const up = Math.floor(t * 7 + k * 1.7 + r) % 2;
      R(x - 2, y + 9, 16, v.h - y, r % 2 ? '#3a2f6a' : '#33285e');
      R(x, y - 1, 12, 11, INK); R(x + 1, y, 10, 9, r % 2 ? '#5a4a96' : '#4a3d84'); R(x + 1, y, 10, 3, '#241a4a');
      R(x - 3 + up * 2, y - 6 - up * 3, 4, 4, SKIN); R(x + 11 - up * 2, y - 6 - up * 3, 4, 4, SKIN);
    }
  }
  // os bastidores: escuro, com caixas de material e um candeeiro de serviço
  R(sx, 0, w - sx, v.h, '#1c1830');
  for (let x = sx + 18; x < w; x += 22) R(x, 0, 1, gy, '#241f3c');
  R(sx, gy, w - sx, v.h - gy, '#3a2a22'); R(sx, gy, w - sx, 1, '#5a4030');
  for (let y = gy + 8; y < v.h; y += 9) R(sx, y, w - sx, 1, '#30221c');
  const cx = w - 30;
  box(R, cx - 14, gy - 20, 30, 20, '#2a2f3a'); R(cx - 14, gy - 20, 30, 2, INOX_D); R(cx - 14, gy - 2, 30, 2, INOX_D); R(cx - 12, gy - 12, 8, 5, PAPER); R(cx + 6, gy - 14, 6, 6, VERDE);
  box(R, cx - 6, gy - 34, 22, 13, '#3a3f55'); R(cx - 6, gy - 34, 22, 2, INOX_D);
  R(sx + 26, top + 4, 1, 16, INK); box(R, sx + 22, top + 20, 9, 5, '#3a3f55'); R(sx + 24, top + 25, 5, 2, '#8fd0f5');
  ctx.globalAlpha = 0.07; ctx.fillStyle = '#8fd0f5'; ctx.beginPath(); ctx.moveTo(sx + 24, top + 27); ctx.lineTo(sx + 29, top + 27); ctx.lineTo(sx + 60, gy); ctx.lineTo(sx - 6, gy); ctx.fill(); ctx.globalAlpha = 1;
  // a cortina, entreaberta
  for (let x = sx - 12; x < sx + 10; x += 6) { R(x, 0, 4, gy + 3, '#8a2338'); R(x + 4, 0, 2, gy + 3, '#6a1a2a'); }
  R(sx - 13, 0, 1, gy + 3, INK); R(sx + 10, 0, 1, gy + 3, INK);
}

export function frenteBastidores(ctx, v, R, t, act) {
  const gy = act.ground(v), p = act.people.find((q) => q.who === 'ines');
  if (!p) return;
  const px = Math.round(p.x * v.w), fc = p.face || 1, M = (dx, wd) => (fc > 0 ? px + dx : px - dx - wd);
  // o auricular
  R(px - 8, gy - 44, 16, 2, '#11131a'); R(M(-9, 4), gy - 36, 4, 7, '#11131a'); R(M(-5, 9), gy - 27, 9, 1, '#11131a'); R(M(3, 2), gy - 28, 2, 3, '#11131a');
  // o telefone: primeiro a tocar, depois ao ouvido
  if (act.i === 3) {
    const sh = Math.round(Math.sin(t * 40) * 1.5), x = M(10, 6) + sh;
    box(R, x, gy - 22, 6, 10, '#11131a'); R(x + 1, gy - 21, 4, 6, '#8fd0f5');
    for (let i = 0; i < 3; i++) { const o = 5 + i * 3 + (Math.floor(t * 8) % 2); R(x - o, gy - 26 - i * 2, 2, 2, GOLD); R(x + 5 + o, gy - 26 - i * 2, 2, 2, GOLD); }
  } else if (act.i > 3) { const x = M(-10, 5); box(R, x, gy - 38, 5, 10, '#3a3f55'); R(x + (fc > 0 ? 3 : 1), gy - 37, 1, 8, '#8fd0f5'); box(R, x, gy - 30, 5, 4, SKIN); }
}

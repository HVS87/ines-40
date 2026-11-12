// Cenário do fecho de «Verões em Santo Amaro»: uma rua de Alcântara, de noite, com o letreiro
// do «GARAGE» lá ao fundo (só o letreiro, ao longe; o aspeto real da discoteca não se inventa).
import { INK, PINK, hash, sky, stars, disc, text } from '../draw.js';

export function ruaGarage(ctx, v, R, t, act) {
  const gy = act.ground(v), w = v.w, top = act.top(v);
  sky(ctx, w, v.h, gy, ['#0b0f2c', '#1a1b4c', '#3a2a66']);
  stars(ctx, w, gy - 60, t, 11, 40);
  disc(ctx, 30, top + 18, 9, '#fff6d0'); disc(ctx, 34, top + 15, 7, '#10143a');
  // prédios às escuras, com uma ou outra janela acesa
  const bh = Math.min(120, gy - top - 14);
  for (let i = 0, x = -6; x < w; i++) {
    const bw = 30 + Math.floor(hash(i * 3.1) * 22), h = Math.round(bh * (0.5 + hash(i * 7.3) * 0.5));
    if (x + bw < w * 0.62 || x > w * 0.92) {
      R(x, gy - h, bw, h, '#15173a'); R(x, gy - h, bw, 2, '#22255a');
      for (let wy = gy - h + 8; wy < gy - 14; wy += 13) for (let wx = x + 5; wx < x + bw - 6; wx += 10) R(wx, wy, 5, 7, hash(wx * 1.3 + wy * 2.7) > 0.72 ? '#ffd98a' : '#22255a');
    }
    x += bw + 2;
  }
  // lá ao fundo: o armazém com o letreiro de néon e os focos de luz
  const gx = Math.round(w * 0.77), gw = 62, gh = Math.min(46, bh * 0.6), on = Math.floor(t * 3) % 7 !== 0;
  for (const s of [-1, 1]) for (let k = 0; k < 14; k++) R(gx + s * (4 + k * 2.2) + Math.round(Math.sin(t * 1.3 + s) * k * 0.8), gy - gh - 6 - k * 5, 3 + k * 0.5, 5, 'rgba(255,120,200,0.07)');
  R(gx - gw / 2 - 1, gy - gh - 1, gw + 2, gh + 1, INK); R(gx - gw / 2, gy - gh, gw, gh, '#1c1c34'); R(gx - gw / 2, gy - gh, gw, 3, '#2c2c50');
  R(gx - 29, gy - gh + 7, 58, 15, on ? 'rgba(255,93,143,0.22)' : 'rgba(255,93,143,0.08)');
  R(gx - 27, gy - gh + 9, 54, 11, INK); R(gx - 26, gy - gh + 10, 52, 9, '#2a1438');
  text(ctx, 'GARAGE', gx, gy - gh + 12, on ? PINK : '#a84a78', { align: 'center', scale: 1 });
  R(gx - 26, gy - gh + 10, 52, 1, on ? '#7be0ff' : '#3a6a8a'); R(gx - 26, gy - gh + 18, 52, 1, on ? '#7be0ff' : '#3a6a8a');
  R(gx - 6, gy - 16, 12, 16, INK); R(gx - 5, gy - 15, 10, 15, '#ffb86a'); R(gx - 1, gy - 15, 1, 15, '#c9703a');
  // rua empedrada, molhada, com candeeiros
  R(0, gy, w, v.h - gy, '#2c2a48'); R(0, gy, w, 1, '#4a4868');
  for (let i = 0; i < 90; i++) R(Math.floor(hash(i * 1.7) * w), gy + 3 + Math.floor(hash(i * 3.3) * (v.h - gy - 4)), 3, 1, i % 3 ? '#3a3858' : '#22203a');
  R(gx - 14, gy + 2, 28, 3, 'rgba(255,93,143,0.25)'); R(gx - 8, gy + 7, 16, 2, 'rgba(255,93,143,0.15)');
  for (const lx of [Math.round(w * 0.12), Math.round(w * 0.56)]) {
    R(lx - 1, gy - 46, 3, 46, INK); R(lx, gy - 45, 1, 45, '#5a5f7a'); R(lx - 4, gy - 49, 9, 4, INK); R(lx - 3, gy - 48, 7, 2, '#ffe9a8');
    R(lx - 9, gy - 45, 19, 12, 'rgba(255,233,168,0.12)'); R(lx - 12, gy + 1, 25, 3, 'rgba(255,233,168,0.14)');
  }
}

// Nível 13, ato 3: e depois das urgências... sair à noite na mesma! Um momento de conversa
// (como o Talk), mas com toda a gente a dançar e a Inês de dedo ligado no ar.
import { Talk } from './base.js';
import { INK, GOLD, PINK, MINT, disc, hash } from '../draw.js';
import { dedoNoAr } from './jantares-cuf.js';

const LUZES = ['#ff5d8f', '#ffd166', '#7be0b0', '#6fb0f0', '#c79bff'];

// A pista de dança: bola de espelhos, focos, colunas e chão aos quadrados.
function fundoNoite(ctx, v, R, t, act) {
  const w = v.w, gy = act.ground(v), top = act.top(v);
  R(0, 0, w, v.h, '#1a1238');
  for (let x = 0; x < w; x += 24) R(x, 0, 1, gy, '#241a4a');
  // focos a rodar
  for (let i = 0; i < 5; i++) {
    const x0 = (w * (i + 0.5)) / 5, sway = Math.sin(t * 1.3 + i * 1.9) * 40;
    ctx.fillStyle = LUZES[i];
    ctx.globalAlpha = 0.13;
    ctx.beginPath(); ctx.moveTo(x0 - 3, 0); ctx.lineTo(x0 + 3, 0); ctx.lineTo(x0 + sway + 26, gy); ctx.lineTo(x0 + sway - 26, gy); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // a bola de espelhos
  const bx = Math.round(w / 2), by = top + 16;
  R(bx, 0, 1, by - 9, '#8a93a7');
  disc(ctx, bx, by, 10, INK); disc(ctx, bx, by, 9, '#b8c0d8');
  for (let i = 0; i < 14; i++) {
    const a = i * 0.9 + Math.floor(t * 5) * 0.4, r = 2 + (i % 4) * 2;
    R(bx + Math.cos(a) * r - 1, by + Math.sin(a * 1.7) * r - 1, 2, 2, i % 3 ? '#ffffff' : LUZES[i % 5]);
  }
  for (let i = 0; i < 16; i++) {
    const k = i + Math.floor(t * 3) * 7;
    R(hash(k) * w, top + hash(k * 3.3) * (gy - top - 50), 2, 2, LUZES[i % 5]);
  }
  // as colunas de som
  for (const x of [6, w - 26]) {
    R(x - 1, gy - 47, 22, 47, INK); R(x, gy - 46, 20, 46, '#2a2f3a');
    const p = Math.floor(t * 6) % 2;
    disc(ctx, x + 10, gy - 32, 6 + p, '#11131a'); disc(ctx, x + 10, gy - 32, 3, '#5a6072');
    disc(ctx, x + 10, gy - 12, 7 + p, '#11131a'); disc(ctx, x + 10, gy - 12, 3, '#5a6072');
  }
  // o chão da pista, a acender aos quadrados
  R(0, gy - 4, w, v.h - gy + 4, '#120c28');
  const beat = Math.floor(t * 3);
  for (let y = gy - 4, r = 0; y < v.h; y += 12, r++) {
    for (let x = (w % 24) / 2 - 24, c = 0; x < w; x += 24, c++) {
      const on = hash(c * 7 + r * 13 + beat) > 0.55;
      R(x + 1, y + 1, 22, 10, on ? LUZES[(c + r + beat) % 5] : '#2a1f52');
      if (on) R(x + 1, y + 1, 22, 10, 'rgba(18,12,40,0.45)');
    }
  }
}

// O dedo ligado da Inês, bem no ar, com brilhos.
function frenteNoite(ctx, v, R, t, act) {
  const gy = act.ground(v), p = act.people.find((q) => q.who === 'ines');
  if (!p) return;
  const x = Math.round(p.x * v.w) + 11, y = gy - 30 - (p.dy || 0);
  dedoNoAr(R, x, y);
  for (let i = 0; i < 3; i++) {
    const a = t * 3 + i * 2.1, sx = x + 1 + Math.cos(a) * 9, sy = y - 12 + Math.sin(a) * 7;
    R(sx - 1, sy, 3, 1, i % 2 ? GOLD : MINT); R(sx, sy - 1, 1, 3, i % 2 ? GOLD : PINK);
  }
}

export class JantaresNoite extends Talk {
  constructor(scene, cfg) {
    super(scene, { bg: fundoNoite, fg: frenteNoite, ...cfg });
  }

  update(dt, I) {
    // toda a gente dança (cada um ao seu ritmo)
    this.people.forEach((p, i) => { p.dy = Math.round(Math.abs(Math.sin(this.t * 6 + i * 1.3)) * 3); });
    super.update(dt, I);
  }
}

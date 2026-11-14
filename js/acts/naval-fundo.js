// O cenário do Clube Naval de Lisboa (nível 18): a Doca de Belém ao fim da tarde, com os
// mastros da marina, o Padrão dos Descobrimentos ao lado, a Ponte 25 de Abril ao fundo, o Tejo
// e o pôr do sol. É usado pelos três atos do nível.
import { INK, GOLD, clamp, disc, hash, lerp, mix, sky, sign } from '../draw.js';

// céu em quatro momentos: fim de tarde dourado → pôr do sol → crepúsculo → noite
const CEUS = [['#5aa9e6', '#f9d98a', '#ffb35a'], ['#3a6fc0', '#f29a5a', '#ffcf6a'], ['#2a2358', '#c8527a', '#f8a05a'], ['#0e1030', '#2a2358', '#5a3f7a']];
function ceu(d) {
  const f = clamp(d, 0, 1) * 3, k = Math.min(2, Math.floor(f));
  return CEUS[k].map((c, i) => mix(c, CEUS[k + 1][i], f - k));
}

// Onde ficam o horizonte e o sol, para um dado ecrã. o: { gy (chão da esplanada), dusk }.
export function docaGeo(v, o = {}) {
  const gy = o.gy || Math.round(v.h * 0.84), dusk = clamp(o.dusk || 0, 0, 1);
  const hy = gy - (v.portrait ? 118 : 62);                       // horizonte (a outra margem)
  const sunX = Math.round(v.w * 0.66), sunY = Math.round(hy - lerp(30, -14, clamp(dusk * 1.25, 0, 1)));
  return { gy, hy, sunX, sunY, dusk };
}

// Desenha tudo até ao chão da esplanada. o: { gy, dusk (0 a 1), lights (0 a 1: luzes da ponte), deck (false = sem esplanada) }.
export function docaBelem(ctx, v, R, t, o = {}) {
  const g = docaGeo(v, o), { gy, hy, sunX, sunY, dusk } = g, luz = o.lights || 0;
  const cs = ceu(dusk), noite = clamp((dusk - 0.6) / 0.4, 0, 1);
  sky(ctx, v.w, v.h, hy, cs);
  if (noite > 0.3) for (let i = 0; i < 26; i++) if (hash(i + 7) < noite) R(hash(i) * v.w, hash(i * 3 + 1) * (hy - 30), 1, 1, '#ffffff');
  // sol
  if (sunY < hy + 12) { disc(ctx, sunX, sunY, 13, mix(cs[2], '#ffe08a', 0.5)); disc(ctx, sunX, sunY, 10, mix('#fff6c8', '#ff8a4b', dusk)); }
  // o Tejo
  const rio = [mix(cs[2], '#3a6fa8', 0.45), mix('#2f6fb0', '#141a40', dusk)], n = 7, H = gy - hy;
  for (let i = 0; i < n; i++) R(0, hy + Math.floor((i * H) / n), v.w, Math.ceil(H / n) + 1, mix(rio[0], rio[1], i / (n - 1)));
  if (dusk < 0.9) for (let i = 0; i < H - 4; i += 2) { const w = 3 + Math.round(Math.abs(Math.sin(t * 2 + i * 0.8)) * (4 + i * 0.3)); R(sunX - w / 2, hy + 1 + i, w, 1, mix('#fff6c8', '#ff9a5a', dusk)); }
  // a outra margem, com o Cristo Rei
  const mg = mix('#4a5a7a', '#141228', dusk);
  for (let x = 0; x < v.w; x += 2) { const hh = Math.round(4 + Math.sin(x * 0.03 + 1) * 2 + Math.sin(x * 0.011) * 2); R(x, hy - hh, 2, hh + 1, mg); }
  const cx = Math.round(v.w * 0.5);
  R(cx, hy - 13, 2, 8, mg); R(cx, hy - 17, 2, 4, mg); R(cx - 2, hy - 16, 6, 1, mg);
  // Ponte 25 de Abril
  const pv = mix('#c8452f', '#5a2030', dusk), t1 = Math.round(v.w * 0.1), t2 = Math.round(v.w * 0.38), th = v.portrait ? 44 : 36, dk = hy - 12;
  R(0, dk, cx - 6, 2, pv); R(0, dk + 2, cx - 6, 1, mix(pv, '#000000', 0.3));
  for (const tx of [t1, t2]) { R(tx - 2, hy - th, 2, th, pv); R(tx + 2, hy - th, 2, th, pv); for (let y = hy - th + 3; y < hy - 2; y += 8) R(tx - 2, y, 6, 1, pv); }
  for (let x = 0; x < cx - 6; x += 1) {
    let y;                                                      // cabo principal: três catenárias
    if (x < t1) { const k = x / Math.max(1, t1); y = lerp(dk - 6, hy - th, k * k); } else if (x <= t2) { const k = (x - t1) / (t2 - t1) * 2 - 1; y = lerp(dk - 3, hy - th, k * k); } else { const k = 1 - (x - t2) / (cx - 6 - t2); y = lerp(dk, hy - th, k * k); }
    R(x, y, 1, 1, pv);
    if (x % 6 === 0) R(x, y, 1, Math.max(0, dk - y), mix(pv, cs[1], 0.45));
    if (luz > 0 && x % 5 === 0 && hash(x) < luz) R(x, y - 1, 1, 1, '#fff3a8');
  }
  if (luz > 0) { for (let x = 2; x < cx - 6; x += 7) if (hash(x + 3) < luz) R(x, dk - 1, 1, 1, '#ffd166'); for (const tx of [t1, t2]) if (luz > 0.5 && Math.floor(t * 2) % 2) R(tx, hy - th - 2, 2, 2, '#ff3b3b'); }
  if (luz > 0.4) for (let i = 0; i < 22; i++) if (hash(i + 60) < luz) R(hash(i + 70) * v.w, hy - 2 - hash(i + 80) * 3, 1, 1, '#ffd166');
  // Padrão dos Descobrimentos, na margem de cá
  const px = Math.round(v.w * 0.88), ph = v.portrait ? 64 : 46, base = hy + 10;
  const pc = mix('#f2e2c4', '#3a3458', dusk), pd = mix('#c9b890', '#26203f', dusk);
  R(px - 26, base - 4, 44, 5, pd);
  for (let i = 0; i < ph; i++) { const k = i / ph, w = Math.round(5 + k * k * 22); R(px - w, base - 4 - ph + i, w + 5, 1, pc); }
  R(px + 5, base - 4 - ph, 2, ph, pd); R(px + 1, base - ph, 1, Math.round(ph * 0.6), pd); R(px - 1, base - ph + 6, 5, 1, pd);
  for (let i = 0; i < 6; i++) R(px - 8 - i * 3, base - 9 - (5 - i) * 2 + (v.portrait ? -2 : 0), 2, 4, pd);
  // a marina: pontão e veleiros amarrados
  const my = hy + Math.round(H * 0.62), barco = mix('#f2f2f7', '#3a3a5a', dusk * 0.9), mst = mix('#e8e8f0', '#55557a', dusk * 0.9);
  for (let i = 0; i < Math.ceil(v.w / 30); i++) {
    const x = Math.round(8 + i * 30 + hash(i + 9) * 10), mh = (v.portrait ? 52 : 34) + Math.round(hash(i + 4) * 14), b = Math.round(Math.sin(t * 1.3 + i) * 1);
    R(x, my - mh + b, 1, mh, mst); R(x - 3, my - mh * 0.6 + b, 7, 1, mst);
    R(x - 8, my - 3 + b, 17, 4, barco); R(x - 6, my + 1 + b, 13, 1, mix(barco, '#000000', 0.3)); R(x - 8, my - 1 + b, 17, 1, [mix('#2a3358', '#151530', dusk), mix('#c0392b', '#401a30', dusk)][i % 2]);
  }
  R(0, my + 3, v.w, 3, mix('#8a8794', '#2a2840', dusk)); R(0, my + 3, v.w, 1, mix('#c9c6d2', '#3a3856', dusk));
  if (o.deck === false) return g;
  // a esplanada: guarda de vidro, deque de madeira e a tabuleta do clube
  const dq = mix('#b8875a', '#3a2a40', dusk * 0.85), dq2 = mix('#8a6240', '#2a1e33', dusk * 0.85);
  R(0, gy - 16, v.w, 1, mix('#f2f2f7', '#55557a', dusk)); for (let x = 6; x < v.w; x += 28) R(x, gy - 16, 1, 16, mix('#d8d8e2', '#44446a', dusk));
  R(0, gy - 2, v.w, v.h - gy + 2, dq);
  for (let y = gy + 2; y < v.h; y += 5) R(0, y, v.w, 1, dq2);
  if (gy + 18 < v.h) sign(ctx, 'CLUBE NAVAL DE LISBOA', Math.round(v.w * (o.signX || 0.5)), gy + 7, { bg: '#1f2c52', color: luz > 0.3 ? '#fff3a8' : GOLD, border: INK });
  return g;
}

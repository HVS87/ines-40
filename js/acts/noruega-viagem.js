// Pele da «estrada» para o nível 20: de carro, de Oslo a Bergen. Montanhas com neve, pinheiros,
// cascatas, a igreja de madeira de Borgund, o túnel de Lærdal (com as suas grutas de luz azul),
// Flåm e o fiorde, e por fim as casas coloridas de Bryggen. Na estrada: renas, ovelhas e pedras.
//   no nível: { act: Estrada, skin: peleNoruega, tunnel: [18.5, 26], course: [...] }
import { getCharacter } from '../sprites.js';
import { INK, hash, sky, sign } from '../draw.js';
import { road, roda, cabeca, ROAD_H } from './estrada.js';

const ROCK = '#4c5262';

// serra com (ou sem) neve nos cumes, com paralaxe
function montes(R, a, par, base, height, amp, rock, snow, seed, snowAt = 6) {
  const off = a.cam * par;
  for (let x = 0; x < a.w; x += 2) {
    const wx = x + off;
    const y = Math.floor(base - height - amp * (Math.sin(wx * 0.031 + seed) * 0.6 + Math.sin(wx * 0.071 + seed * 1.7) * 0.4));
    R(x, y, 2, base - y, rock);
    const line = base - height - snowAt;
    if (snow && y < line) R(x, y, 2, Math.min(line - y, 7) + ((x >> 1) % 2), snow);
  }
}

function tri(R, cx, topY, half, h, color) {
  for (let i = 0; i < h; i++) { const hw = Math.round((half * (i + 1)) / h); R(cx - hw, topY + i, hw * 2, 1, color); }
}

function pinheiro(R, x, y, h, dark) {
  R(x, y - 4, 2, 4, '#5a3a22');
  for (let i = 0; i < h; i++) { const hw = 1 + Math.floor((i % 6) * 0.8) + Math.floor(i / 6); R(x + 1 - hw, y - 4 - h + i, hw * 2, 1, dark ? '#2a5a44' : '#356e4e'); }
}

// o troço do túnel no ecrã: [esquerda, direita, x da entrada, x da saída] ou null
function tunel(a) {
  const tn = a.act.cfg.tunnel;
  if (!tn) return null;
  const x0 = a.X(tn[0]), x1 = a.X(tn[1]);
  return [Math.max(0, x0), Math.min(a.w, x1), x0, x1];
}

export const peleNoruega = {
  intro: 'Toca para mudar de faixa: foge às renas e às ovelhas e apanha os corações!',
  arrive: 'Bergen! As casas de madeira coloridas do cais de Bryggen. Agora, o chalé!',

  start(act) {
    const m = act.mem;
    m.ines = getCharacter('ines', 'inverno');
    m.lou = getCharacter('lourenco', 'inverno');
    m.tomas = getCharacter('tomas', 'inverno');
  },

  back(ctx, R, a) {
    const base = a.roadTop - 6, cam = Math.round(a.cam);
    sky(ctx, a.w, a.h, base, ['#84beee', '#c2e2f4', '#f0f6ec']);
    montes(R, a, 0.05, base, 56, 16, '#8ea6c8', '#ffffff', 1, 2);
    montes(R, a, 0.14, base, 32, 14, '#5f8298', '#e6f0f8', 4, 8);
    montes(R, a, 0.35, base, 12, 8, '#3f7458', null, 7);
    const T = tunel(a);
    for (let k = Math.floor((cam - 20) / 23); k * 23 < cam + a.w + 20; k++) {
      const x = k * 23 + Math.floor(hash(k) * 12) - cam;
      if (T && x > T[2] - 66 && x < T[3] + 66) continue;
      if (hash(k * 3.7) < 0.75) pinheiro(R, x, base + 1, 13 + Math.floor(hash(k * 1.9) * 12), k % 2);
    }
    R(0, base, a.w, 6, '#6aaa5a'); R(0, base, a.w, 1, '#8cc870');
    if (T) {
      const [l, r, x0, x1] = T;
      // a montanha que o túnel atravessa, com as encostas de um lado e do outro
      for (let i = 0; i < 32; i++) {
        const yy = Math.round((i / 32) * (base - 8) + (i % 3));
        R(x0 - 2 - i * 2, yy, 2, base - yy, ROCK); R(x1 + i * 2, yy, 2, base - yy, ROCK);
        if (yy < 18) { R(x0 - 2 - i * 2, yy, 2, 4, '#ffffff'); R(x1 + i * 2, yy, 2, 4, '#ffffff'); }
      }
      if (r > l) {
        R(l, 0, r - l, a.roadTop, ROCK);
        for (let y = 5; y < a.roadTop - 42; y += 8) for (let x = l - ((cam + y * 3) % 34); x < r; x += 34) if (x + 16 > l) R(Math.max(l, x), y, Math.min(16, r - x), 1, '#5e6578');
        R(l, a.roadTop - 38, r - l, 38, '#151a2e');
        // as grutas iluminadas a azul, com luzes amarelas junto ao chão
        for (const f of [0.22, 0.5, 0.78]) {
          const cxk = Math.round(x0 + (x1 - x0) * f);
          for (const [hw, c] of [[62, 'rgba(60,140,255,0.16)'], [52, 'rgba(60,140,255,0.18)'], [42, 'rgba(70,150,255,0.2)'], [32, 'rgba(90,170,255,0.2)'], [22, 'rgba(120,195,255,0.22)'], [12, 'rgba(160,220,255,0.24)']]) {
            const zw = Math.round(hw * Math.min(1, (x1 - x0) / 700)), xa = Math.max(l, cxk - zw), xb = Math.min(r, cxk + zw);
            if (xb > xa) { ctx.fillStyle = c; ctx.fillRect(xa, a.roadTop - 38, xb - xa, 38); }
          }
          for (let j = -2; j <= 2; j++) { const lx = cxk + Math.round(j * 14 * Math.min(1, (x1 - x0) / 700)); if (lx > l && lx < r - 3) R(lx, a.roadTop - 4, 3, 2, '#ffd98a'); }
        }
        for (let x = x0 + 14 + Math.max(0, Math.ceil((l - x0 - 14) / 30)) * 30; x < r - 4; x += 30) R(x, a.roadTop - 37, 4, 2, '#fff3b0');
      }
      // as bocas do túnel
      for (const x of [x0, x1]) if (x > -6 && x < a.w + 6) { R(x - 3, a.roadTop - 44, 6, 44, '#aab0c0'); R(x - 3, a.roadTop - 44, 6, 2, '#d0d4e0'); R(x - 1, a.roadTop - 42, 2, 42, '#8a90a4'); }
    }
  },

  road(ctx, R, a) {
    road(ctx, R, a, { asphalt: '#5a5f6c', line: '#f4d23e' });
    const T = tunel(a);
    if (T && T[1] > T[0]) R(T[0], a.roadTop, T[1] - T[0], ROAD_H, 'rgba(8,10,34,0.45)');
  },

  // à frente da estrada: prado antes do túnel, rocha por baixo dele e, depois, o fiorde
  front(ctx, R, a) {
    const y = a.roadBot, hh = a.h - y, cam = Math.round(a.cam), T = tunel(a);
    R(0, y, a.w, hh, '#5a9c4e'); R(0, y, a.w, 2, '#7cc068');
    for (let k = Math.floor(cam / 13); k * 13 < cam + a.w; k++) {
      const x = k * 13 + Math.floor(hash(k * 2.3) * 9) - cam, fy = y + 5 + Math.floor(hash(k * 5.1) * Math.max(1, hh - 12));
      R(x, fy, 2, 2, ['#ffffff', '#ffd23e', '#f29ac0'][k % 3]); R(x, fy + 2, 1, 2, '#3f7a3a');
    }
    if (!T) return;
    const [l, r, , x1] = T;
    if (x1 < a.w) {
      const wl = Math.max(0, x1);
      R(wl, y, a.w - wl, 4, '#8a9484'); R(wl, y + 4, a.w - wl, hh - 4, '#2f8090'); R(wl, y + 4, a.w - wl, 2, '#57a8b4');
      for (let k = 0; k < 14; k++) {
        const rx = ((k * 53 - cam * 1.1 + Math.sin(a.t + k) * 3) % (a.w + 30) + a.w + 30) % (a.w + 30) - 15, ry = y + 9 + ((k * 17) % Math.max(4, hh - 14));
        if (rx > wl) R(rx, ry, 9 + (k % 3) * 4, 1, k % 2 ? '#8fd0d8' : '#1f6676');
      }
    }
    if (r > l) { R(l, y, r - l, hh, '#3a3f50'); R(l, y, r - l, 2, '#2a2e3c'); }
  },

  vehicle: {
    w: 56, h: 34,
    draw(ctx, R, x, y, a, act) {
      const m = act.mem, W = '#f4f4f8', D = '#c4c8d8';
      R(x - 27, y - 1, 54, 2, 'rgba(20,14,30,0.3)');
      // mala de tejadilho
      R(x - 18, y - 37, 28, 5, INK); R(x - 17, y - 36, 26, 3, '#3a3f55'); R(x - 14, y - 32, 2, 2, INK); R(x + 4, y - 32, 2, 2, INK);
      // habitáculo: o Tomás atrás; a Inês e o Lourenço à frente
      R(x - 24, y - 31, 42, 15, INK);
      R(x - 23, y - 30, 40, 14, W); R(x - 23, y - 30, 40, 1, '#ffffff');
      R(x - 21, y - 28, 13, 12, INK); R(x - 20, y - 27, 12, 11, '#c4e6f2');
      R(x - 7, y - 28, 25, 12, INK); R(x - 6, y - 27, 24, 11, '#c4e6f2');
      cabeca(ctx, m.tomas, x - 14, y - 16);
      cabeca(ctx, m.ines, x, y - 16);
      cabeca(ctx, m.lou, x + 12, y - 16);
      R(x + 17, y - 22, 1, 6, INK); R(x + 16, y - 22, 3, 1, INK);
      // carroçaria
      R(x - 29, y - 18, 58, 15, INK);
      R(x - 28, y - 17, 56, 13, W); R(x - 28, y - 9, 56, 5, D); R(x - 28, y - 6, 56, 2, '#3a3f55');
      R(x - 8, y - 16, 1, 10, D); R(x + 6, y - 16, 1, 10, D); R(x - 6, y - 14, 3, 1, INK); R(x + 8, y - 14, 3, 1, INK);
      R(x + 26, y - 15, 2, 3, '#fff3b0'); R(x - 28, y - 15, 2, 3, '#ff5d5d');
      R(x - 23, y - 10, 12, 7, INK); R(x + 11, y - 10, 12, 7, INK);
      roda(R, x - 17, y - 4, act.dist); roda(R, x + 17, y - 4, act.dist);
      // dentro do túnel, os faróis iluminam o caminho
      const tn = act.cfg.tunnel;
      if (tn && act.time > tn[0] && act.time < tn[1]) { ctx.fillStyle = 'rgba(255,240,170,0.18)'; ctx.fillRect(x + 28, y - 17, 30, 12); ctx.fillRect(x + 28, y - 14, 48, 9); }
    },
  },

  obs: {
    rena: {
      w: 22, h: 30, msg: ['Uma rena no meio da estrada! Aqui mandam elas.', 'Lourenço: «A rena tem prioridade. Sempre.»'],
      draw(ctx, R, x, y, o, a) {
        const B = '#8f6c4a', nod = Math.floor(a.t * 1.5 + o.at) % 2;
        for (const lx of [-7, -3, 3, 6]) R(x + lx, y - 9, 2, 9, '#4a3424');
        R(x - 9, y - 18, 19, 10, INK); R(x - 8, y - 17, 17, 8, B); R(x - 8, y - 11, 17, 2, '#b89a78'); R(x + 8, y - 17, 2, 3, '#efe4d0');
        R(x - 13, y - 24 + nod, 7, 10, INK); R(x - 12, y - 23 + nod, 5, 8, B); R(x - 10, y - 18 + nod, 3, 5, '#efe4d0');
        R(x - 17, y - 23 + nod, 5, 5, INK); R(x - 16, y - 22 + nod, 4, 3, B); R(x - 17, y - 21 + nod, 1, 1, '#1a1014'); R(x - 12, y - 22 + nod, 1, 1, INK);
        for (const [ax, ay, aw, ah] of [[-12, -30, 1, 6], [-14, -29, 2, 1], [-15, -31, 1, 2], [-9, -31, 1, 7], [-8, -29, 3, 1], [-6, -31, 1, 2]]) R(x + ax, y + ay + nod, aw, ah, '#e4d4b0');
      },
    },
    ovelhas: {
      w: 24, h: 14, msg: ['Mééé! As ovelhas norueguesas não têm pressa nenhuma.', 'Tomás: «Ovelhas outra vez? Isto é uma autoestrada de lã!»'],
      draw(ctx, R, x, y, o, a) {
        for (const [dx, dy] of [[-7, -1], [6, 0]]) {
          const sx = x + dx, sy = y + dy, hop = o.hit ? Math.round(Math.abs(Math.sin((a.t - o.hit) * 9)) * 3) : 0;
          R(sx - 4, sy - 3, 1, 3, INK); R(sx + 3, sy - 3, 1, 3, INK);
          R(sx - 6, sy - 11 - hop, 12, 9, INK); R(sx - 5, sy - 10 - hop, 10, 7, '#ffffff'); R(sx - 5, sy - 5 - hop, 10, 2, '#d8dce6'); R(sx - 3, sy - 12 - hop, 6, 2, '#ffffff');
          R(sx - 9, sy - 11 - hop, 5, 5, INK); R(sx - 8, sy - 10 - hop, 1, 1, '#ffffff');
        }
      },
    },
    pedra: {
      w: 14, h: 10, msg: 'Ui, uma pedra na estrada! Caiu da montanha.',
      draw(ctx, R, x, y) {
        R(x - 7, y - 8, 14, 8, INK); R(x - 5, y - 10, 9, 3, INK);
        R(x - 6, y - 7, 12, 6, '#9aa0b0'); R(x - 4, y - 9, 7, 3, '#b8bece'); R(x - 6, y - 3, 12, 2, '#6e7486'); R(x - 3, y - 8, 3, 1, '#e4e8f0');
      },
    },
  },

  props: {
    placa(ctx, R, x, a, p) {
      const b = a.roadTop - 5;
      R(x - 1, b - 22, 2, 24, '#8a8f9c');
      sign(ctx, p.label, x, b - 32, { bg: '#ffd23e', color: INK });
    },
    // a igreja de madeira de Borgund: telhados em escada, com cabeças de dragão
    borgund(ctx, R, x, a) {
      const b = a.roadTop - 5, W = '#4e3628', D = '#33221a', L = '#6e4e3a';
      R(x - 22, b - 10, 44, 10, D);
      for (let k = 0; k < 8; k++) R(x - 20 + k * 5, b - 8, 3, 6, '#1a120e');
      tri(R, x, b - 22, 25, 12, W); R(x - 12, b - 28, 24, 8, D);
      tri(R, x, b - 40, 16, 12, W); R(x - 6, b - 45, 12, 6, D);
      tri(R, x, b - 55, 9, 10, W);
      for (let i = 0; i < 9; i++) { R(x - 18 + i * 4, b - 13 - (i % 2), 2, 1, L); R(x - 10 + i * 2.5, b - 31 - (i % 2), 2, 1, L); }
      R(x - 1, b - 63, 2, 9, D); R(x - 3, b - 61, 6, 1, D);
      // cabeças de dragão nas pontas dos telhados
      for (const s of [-1, 1]) for (const [yy, d] of [[b - 41, 3], [b - 56, 2]]) { R(x + s * d - (s < 0 ? 4 : 0), yy, 4, 1, D); R(x + s * (d + 4) - (s < 0 ? 1 : 0), yy - 2, 1, 2, D); R(x + s * (d + 5) - (s < 0 ? 2 : 0), yy - 3, 2, 1, '#c0392b'); }
      R(x - 3, b - 8, 6, 8, '#1a120e'); R(x - 2, b - 7, 4, 7, '#8a5a34');
    },
    cascata(ctx, R, x, a) {
      const b = a.roadTop - 5, t = a.t;
      for (let dx = -20; dx < 20; dx += 2) {
        const hh = Math.round(56 - Math.abs(dx) * 0.7 - (Math.abs(dx) > 5 ? hash(dx + 30) * 9 : 0) - (Math.abs(dx) > 14 ? (Math.abs(dx) - 14) * 5 : 0));
        R(x + dx, b - hh, 2, hh, (dx + 20) % 8 < 2 ? '#565c6e' : ROCK); R(x + dx, b - hh, 2, 3, '#6aaa5a');
        if (hash(dx + 7) < 0.4) R(x + dx, b - hh + 8 + Math.floor(hash(dx) * 30), 2, 4, '#5e6578');
      }
      R(x - 4, b - 57, 8, 3, '#ffffff');
      R(x - 3, b - 56, 6, 56, '#dff2fa');
      for (let k = 0; k < 9; k++) R(x - 3 + (k % 3) * 2, b - 56 + Math.floor((t * 46 + k * 13) % 54), 2, 5, '#8fc8e8');
      for (let k = 0; k < 5; k++) R(x - 9 + k * 4, b - 3 - Math.floor(Math.abs(Math.sin(t * 6 + k)) * 4), 3, 3, '#ffffff');
    },
    // chalé de madeira vermelha, com relva no telhado
    chale(ctx, R, x, a) {
      const b = a.roadTop - 5;
      R(x - 18, b - 18, 36, 18, INK); R(x - 17, b - 17, 34, 17, '#b8392e');
      for (let k = 0; k < 6; k++) R(x - 17, b - 15 + k * 3, 34, 1, '#96281f');
      tri(R, x, b - 30, 21, 13, '#4f9a4a'); tri(R, x, b - 27, 15, 10, '#b8392e'); R(x - 21, b - 18, 42, 2, '#3f7a3a');
      for (let k = 0; k < 7; k++) R(x - 16 + k * 5, b - 21 - (k % 2) - Math.round(6 - Math.abs(k - 3) * 2), 1, 2, '#8cd070');
      R(x - 12, b - 12, 8, 8, '#ffffff'); R(x - 11, b - 11, 6, 6, '#ffe9a0'); R(x - 9, b - 11, 1, 6, '#ffffff');
      R(x + 4, b - 13, 8, 13, '#ffffff'); R(x + 5, b - 12, 6, 12, '#5a3a22');
      // a bandeira da Noruega
      R(x + 24, b - 34, 1, 34, '#d8dce6');
      R(x + 25, b - 34, 13, 9, '#c0392b'); R(x + 28, b - 34, 3, 9, '#ffffff'); R(x + 25, b - 31, 13, 3, '#ffffff'); R(x + 29, b - 34, 1, 9, '#2a3a6a'); R(x + 25, b - 30, 13, 1, '#2a3a6a');
    },
    // Bergen: as casas de empena em bico do cais de Bryggen
    bryggen(ctx, R, x, a) {
      const b = a.roadTop - 5, cols = ['#b03a2e', '#d89a3a', '#efe8da', '#b03a2e', '#d89a3a'];
      cols.forEach((c, k) => {
        const hx = x - 44 + k * 22, hh = 30 + (k % 2) * 4;
        R(hx - 11, b - hh, 22, hh, INK); R(hx - 10, b - hh, 20, hh, c);
        tri(R, hx, b - hh - 12, 11, 12, INK); tri(R, hx, b - hh - 10, 9, 10, c);
        for (let f = 0; f < 3; f++) for (const wx of [-6, 2]) { R(hx + wx, b - hh + 3 + f * 9, 5, 6, '#ffffff'); R(hx + wx + 1, b - hh + 4 + f * 9, 3, 4, '#3a4a6a'); }
        R(hx - 2, b - hh - 5, 4, 4, '#ffffff'); R(hx - 1, b - hh - 4, 2, 2, '#3a4a6a');
        for (let yy = b - hh + 1; yy < b; yy += 4) R(hx - 10, yy, 1, 2, 'rgba(0,0,0,0.2)');
      });
      sign(ctx, 'BERGEN', x, b - 62, { bg: '#ffd23e', color: INK });
      R(x - 1, b - 51, 2, 6, '#8a8f9c');
    },
  },
};

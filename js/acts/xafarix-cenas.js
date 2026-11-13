// Nível 12: momentos de história no Xafarix (configurações para o ato Talk).
//  - a entrada na sala;
//  - o Nuno ajoelha-se e pede a Maria em casamento, e todos brindam.
import { INK, PAPER, GOLD, PINK } from '../draw.js';
import { xafarixBg } from './xafarix-cenario.js';

const sala = (ctx, v, R, t, act) => xafarixBg(ctx, v, R, t, { gy: act.ground(v), top: act.top(v), stage: v.portrait ? 40 : 46, signX: Math.round(v.w * 0.66) });
// outro canto da sala, sem o palco: só mesas
const canto = (ctx, v, R, t, act) => xafarixBg(ctx, v, R, t, { gy: act.ground(v), top: act.top(v), stage: null, signX: Math.round(v.w * 0.5), tables: [Math.round(v.w * 0.34), Math.round(v.w * 0.71)] });
const find = (act, who) => act.people.find((p) => p.who === who);

// Coração de píxeis (7x6).
function coracao(R, x, y, c = PINK) {
  R(x - 3, y - 2, 3, 2, INK); R(x + 1, y - 2, 3, 2, INK); R(x - 4, y - 1, 9, 4, INK); R(x - 2, y + 3, 5, 1, INK); R(x - 1, y + 4, 3, 1, INK);
  R(x - 3, y - 1, 3, 3, c); R(x + 1, y - 1, 3, 3, c); R(x - 2, y + 1, 5, 2, c); R(x - 1, y + 3, 3, 1, c); R(x - 2, y - 1, 1, 1, PAPER);
}

// Copo erguido para o brinde.
function copo(R, x, y) {
  R(x - 3, y - 1, 7, 8, INK); R(x - 2, y, 5, 6, '#ffe9a8'); R(x - 2, y, 5, 2, PAPER); R(x, y + 7, 1, 4, INK); R(x - 2, y + 11, 5, 1, INK);
}

export const CENA_ENTRADA = {
  bg: sala,
  cast: [
    { who: 'ana', outfit: 'night', x: 0.42, name: 'Ana' },
    { who: 'ines', outfit: 'night', x: 0.56, name: 'Inês' },
    { who: 'pipoca', outfit: 'night', x: 0.72, name: 'Pipoca', face: -1 },
    { who: 'mi', outfit: 'night', x: 0.88, name: 'Mi', face: -1 },
  ],
  lines: [
    'Pipoca: «Hoje é o Mico da Câmara Pereira que toca e canta. Isto vai aquecer!»',
    'Inês: «Então vamos dançar... nem que seja em cima das mesas!»',
  ],
};

export const CENA_PEDIDO = {
  bg: canto,
  fg: (ctx, v, R, t, act) => {
    const gy = act.ground(v), maria = find(act, 'maria'), nuno = find(act, 'nuno');
    // o anel na mão do Nuno
    if (act.i >= 1) {
      const x = Math.round(nuno.x * v.w) - 15, y = gy - 24;
      R(x - 2, y - 1, 5, 5, INK); R(x - 1, y, 3, 3, GOLD); R(x, y - 3, 1, 2, PAPER);
      if (Math.floor(t * 4) % 2) R(x - 2, y - 4, 1, 1, PAPER);
    }
    if (act.i >= 2) {
      const cx = ((maria.x + nuno.x) / 2) * v.w;
      for (let k = 0; k < 3; k++) { const p = (t * 0.5 + k / 3) % 1; coracao(R, Math.round(cx + Math.sin(p * 6 + k * 2) * 8), Math.round(gy - 46 - p * 28)); }
    }
    // o brinde: copos no ar
    if (act.i >= 3) {
      for (const p of act.people) {
        if (p.who === 'nuno') continue;
        copo(R, Math.round(p.x * v.w) + (p.face < 0 ? -13 : 13), gy - 50 - Math.round(Math.abs(Math.sin(t * 5 + p.x * 9)) * 3));
      }
    }
  },
  cast: [
    { who: 'ines', outfit: 'night', x: 0.08, name: 'Inês' },
    { who: 'pipoca', outfit: 'night', x: 0.21, name: 'Pipoca' },
    { who: 'maria', outfit: 'night', x: 0.46, name: 'Maria' },
    { who: 'nuno', outfit: 'night', x: 0.62, name: 'Nuno', face: -1 },
    { who: 'mi', outfit: 'night', x: 0.8, name: 'Mi', face: -1 },
    { who: 'leal', outfit: 'night', x: 0.93, name: 'Leal', face: -1 },
  ],
  onLine: (i, act) => {
    const nuno = find(act, 'nuno'), v = act.game.view;
    if (i === 1 && nuno.frames.kneel) nuno.frames = { ...nuno.frames, stand: nuno.frames.kneel };   // de joelhos
    if (i === 2) act.sfx('kiss');
    if (i === 3) { act.sfx('plim'); for (const p of act.people) act.fx.burst(p.x * v.w, act.ground(v) - 56, 6, [GOLD, PAPER, PINK], 50); }
  },
  lines: [
    'Nuno: «Maria, tenho uma coisa muito importante para te perguntar...»',
    'Nuno: «Maria... queres casar comigo?»',
    'Maria: «Sim! Claro que sim!»',
    'Todos: «Vivam os noivos! Um brinde à Maria e ao Nuno!»',
  ],
};

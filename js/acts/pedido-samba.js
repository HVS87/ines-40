// A roda de samba como «pele» do jogo de ritmo (js/acts/ritmo.js): o segundo barco encosta ao
// catamarã, com pandeiro, cavaquinho e surdo, e todos dançam no convés. Três colunas de notas.
import { INK, PAPER, disc } from '../draw.js';
import { tejoBg, barcoSamba, instrumento } from './pedido-cenario.js';

// onde acaba o convés do catamarã e começa o barco do samba
const split = (v) => Math.round(v.w * (v.portrait ? 0.54 : 0.66));

export const SAMBA = {
  lanes: 3,
  bpm: 100,
  lead: 1.7,
  colors: ['#ffd23e', '#ff8a4b', '#6fd0ff'],
  sounds: ['click', 'pop', 'stomp'],
  track: '#2a2448',
  pattern: [
    '1...2...', '3...2...', '1...2.3.',
    '1.2.3...', '3.2.1...', '1...3.2.',
    '1.2.3.2.', '1..2..3.', '3..2..1.',
    '1.2.3.2.', '1..2..3.', '3.3.2.1.',
    '1.2.3.2.', '1..3..2.', '1.2.3...',
  ],
  ground: (v) => Math.round(v.h * (v.portrait ? 0.52 : 0.84)),
  bg: (ctx, v, R, t, st) => {
    const x1 = split(v), slide = Math.max(0, -st.beat - 1.2) * 46;      // o barco chega durante a contagem
    tejoBg(ctx, v, R, t, { gy: st.gy, top: st.top, deckW: x1 - 6 });
    barcoSamba(ctx, v, R, t, { gy: st.gy, top: st.top, x0: Math.round(x1 + slide), beat: st.beat, playing: st.playing || st.over > 0 });
  },
  // cada nota é o instrumento da sua coluna (pandeiro, cavaquinho, surdo) num disco claro
  note: (ctx, R, x, y, lane, col) => { disc(ctx, x, y, 10, INK); disc(ctx, x, y, 9, col); disc(ctx, x, y, 7, PAPER); instrumento(ctx, R, lane, x + (lane === 1 ? -1 : 0), y + (lane === 1 ? 1 : 0), 1); },
  dancers: [
    { who: 'tomas', outfit: 'casual', x: 0.05, px: 0.07 },
    { who: 'ines', outfit: 'casual', x: 0.17, px: 0.23, off: 1 },
    { who: 'lourenco', outfit: 'casual', x: 0.29, px: 0.39 },
  ],
  intro: 'Samba! Toca na coluna da nota (ou usa as setas ← ↓ →) quando ela chegar ao círculo.',
  end: 'Dois barcos, uma roda de samba e todos a dançar, felizes!',
};

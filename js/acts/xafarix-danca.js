// O Xafarix como «pele» do jogo de ritmo (js/acts/ritmo.js): o Mico toca guitarra no palco e a
// Inês, o Pipoca, a Ana e a Mi dançam (a Inês e a Mi, em cima das mesas). Duas colunas de notas.
import { INK, PAPER } from '../draw.js';
import { xafarixBg, MESA_H } from './xafarix-cenario.js';

// Posições (fração da largura): deitado / ao alto
const POS = { ana: [0.31, 0.4], ines: [0.67, 0.58], pipoca: [0.8, 0.76], mi: [0.93, 0.92] };
const at = (v, who) => Math.round(POS[who][v.portrait ? 1 : 0] * v.w);

export const DANCA = {
  lanes: 2,
  bpm: 104,
  lead: 1.6,
  colors: ['#ff8a4b', '#7be0b0'],
  sounds: ['click', 'toc'],
  track: '#2a1c1a',
  pattern: [
    '1...2...', '1...2...', '1.1.2...',
    '1...2.2.', '1.2.1...', '2...1.1.',
    '1.2.1.2.', '1...2...', '1.1.2.2.',
    '2.1.2.1.', '1.1.2...', '2.2.1.1.',
    '1.2.1.2.', '1.1.2.2.', '1.2.1...',
  ],
  songs: [{ label: 'AO VIVO', title: 'MICO DA CÂMARA PEREIRA' }],
  ground: (v) => Math.round(v.h * (v.portrait ? 0.52 : 0.86)),
  bg: (ctx, v, R, t, st) => xafarixBg(ctx, v, R, t, {
    gy: st.gy, top: st.top, beat: st.beat, playing: st.playing || st.over > 0,
    stage: v.portrait ? 40 : 46, tables: [at(v, 'ines'), at(v, 'mi')],
  }),
  // nota de música (colcheia) com contorno
  note: (ctx, R, x, y, lane, col) => {
    R(x - 6, y - 1, 9, 8, INK); R(x + 1, y - 10, 4, 12, INK); R(x + 3, y - 10, 6, 6, INK);
    R(x - 5, y, 7, 6, col); R(x + 2, y - 9, 2, 12, col); R(x + 4, y - 9, 4, 3, col);
    R(x - 4, y + 1, 2, 2, PAPER);
  },
  dancers: [
    { who: 'ana', outfit: 'night', x: POS.ana[0], px: POS.ana[1] },
    { who: 'ines', outfit: 'night', x: POS.ines[0], px: POS.ines[1], dy: MESA_H, off: 1 },
    { who: 'pipoca', outfit: 'night', x: POS.pipoca[0], px: POS.pipoca[1] },
    { who: 'mi', outfit: 'night', x: POS.mi[0], px: POS.mi[1], dy: MESA_H, off: 1 },
  ],
  end: 'Pipoca: «Outra! Outra!»',
};

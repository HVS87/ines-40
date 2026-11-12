// A pista do Paradise Garage como «pele» do jogo de ritmo (js/acts/ritmo.js).
import { PINK } from '../draw.js';
import { pistaBg } from './garage-cenario.js';

export const PISTA = {
  lanes: 1,
  bpm: 124,
  lead: 1.5,
  colors: [PINK],
  pattern: [
    '1...1...', '1...1...', '1...1.1.', '1...1...',
    '1.1.1...', '1.1.1...', '1...1.1.', '1.1.1.1.',
    '1.1.1.1.', '1.1...1.', '1.1.1.1.', '1.1.1...',
    '1.1.1.1.', '1.1.1.11', '1.1.1.1.', '1...1...',
  ],
  songs: [
    { label: 'A TOCAR AGORA', title: 'ONE MORE TIME' },
    { label: 'A TOCAR AGORA', title: 'TOUCH ME' },
  ],
  ground: (v) => Math.round(v.h * (v.portrait ? 0.52 : 0.86)),
  songAt: (v, st) => (v.portrait ? { x: v.w / 2, y: st.gy + 6 } : { x: v.w - 70, y: st.top + 3 }),
  bg: (ctx, v, R, t, st) => pistaBg(ctx, v, R, t, { gy: st.gy, top: st.top, beat: st.beat, pulse: st.playing || st.over ? st.pulse : 0 }),
  dancers: [
    { who: 'soft', outfit: 'night', x: 0.07, px: 0.1, off: 1 },
    { who: 'ana', outfit: 'night', x: 0.2, px: 0.26 },
    { who: 'ines', outfit: 'night', x: 0.34, px: 0.42, off: 1 },
    { who: 'lourenco', outfit: 'night', x: 0.66, px: 0.58 },
    { who: 'mi', outfit: 'night', x: 0.8, px: 0.74, off: 1 },
    { who: 'pipoca', outfit: 'night', x: 0.93, px: 0.9 },
  ],
  intro: 'Toca quando a luz chegar ao círculo, ao ritmo da música!',
  end: 'Ana: «Esta pista é nossa!»',
};

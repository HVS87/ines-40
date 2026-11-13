// Nível 17 — Fins de tarde no Clube Naval: o brinde na esplanada, os veleiros ao pôr do sol
// e a conversa de amigos enquanto as luzes da ponte se acendem.
import { Talk } from '../acts/base.js';
import { INK } from '../draw.js';
import { Brinde } from '../acts/naval-brinde.js';
import { Veleiros } from '../acts/naval-veleiros.js';
import { docaBelem } from '../acts/naval-fundo.js';

const FALAS = [
  'Ana: «Mais uma rodada? O sol ainda não se despediu de vez.»',
  'Pipoca: «Eu vou buscar. Imperiais para todos!»',
  'Lourenço: «Olhem a ponte... estão a acender as luzes.»',
  'Inês: «Fins de tarde assim, com vocês, são os meus preferidos.»',
  'Mi: «Então, um brinde aos fins de tarde no Clube Naval!»',
];

// anoitece ao longo da conversa; as luzes da ponte acendem-se a partir da terceira fala
const noite = (act) => Math.min(1, (Math.max(0, act.i) + Math.min(1, act.timer / 2.5)) / FALAS.length);
const fundo = (ctx, v, R, t, act) => {
  const k = noite(act);
  docaBelem(ctx, v, R, t, { gy: act.ground(v), dusk: 0.62 + k * 0.38, lights: Math.max(0, Math.min(1, (k - 0.35) * 3)) });
};
// a mesa, à frente dos amigos
const mesa = (ctx, v, R, t, act) => {
  const gy = act.ground(v), mw = Math.round(v.w * 0.86), mx = Math.round((v.w - mw) / 2), my = gy - 14;
  R(mx - 1, my - 1, mw + 2, 6, INK); R(mx, my, mw, 4, '#d8d8e6'); R(mx, my + 3, mw, 1, '#9a9ab0');
  for (const lx of [mx + 6, mx + mw - 9]) { R(lx - 1, my + 5, 5, gy - my - 2, INK); R(lx, my + 5, 3, gy - my - 3, '#6a6a80'); }
  for (let i = 0; i < 6; i++) { const x = Math.round(v.w * (0.14 + i * 0.146)) + 9; R(x - 3, my - 10, 7, 10, INK); R(x - 2, my - 6, 5, 6, '#f2b632'); R(x - 2, my - 9, 5, 3, '#ffffff'); }
};

export default {
  id: 'naval',
  title: 'Fins de Tarde no Clube Naval',
  music: 'calm',
  story: 'A Inês adora passar um final de tarde na esplanada do Clube Naval de Lisboa, na Doca de Belém: o Tejo à frente, a ponte ao fundo e uma imperial com os amigos.',
  help: 'Toca no ecrã (ou Espaço) no momento certo: quando os copos se encontram no brinde e quando a vela de um veleiro passa à frente do sol.',
  outro: 'Saúde! Aos fins de tarde junto ao rio.',
  ending: 'E a ponte ficou toda iluminada sobre o Tejo.',
  acts: [
    { act: Brinde, when: 'Um fim de tarde na Doca de Belém...', hearts: 4 },
    { act: Veleiros, hearts: 4, boats: 5 },
    {
      act: Talk, hearts: 1, bg: fundo, fg: mesa, lines: FALAS,
      cast: [
        { who: 'mi', x: 0.14, face: 1, name: 'Mi' }, { who: 'pipoca', x: 0.286, face: 1, name: 'Pipoca' },
        { who: 'ines', x: 0.432, face: 1, name: 'Inês' }, { who: 'lourenco', x: 0.578, face: -1, name: 'Lourenço' },
        { who: 'ana', x: 0.724, face: -1, name: 'Ana' }, { who: 'leal', x: 0.87, face: -1, name: 'Leal' },
      ],
    },
  ],
};

// Nível 18 — Fins de tarde no Clube Naval: o brinde na esplanada, os veleiros ao pôr do sol
// e a conversa de amigos enquanto as luzes da ponte se acendem. No fim chega o Kiko (o namorado
// da Ana), vindo do escritório, e ficam todos para jantar amêijoas à Bulhão Pato.
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
  'Mi: «Olhem quem chegou! Kiko, até que enfim!»',
  'Kiko: «Desculpem o atraso! Fiquei no escritório a trabalhar até tarde...»',
  'Ana: «Chegaste mesmo a tempo: é fim de semana e daqui ninguém arreda pé.»',
  'Lourenço: «Então está decidido: amêijoas à Bulhão Pato para todos e ficamos para jantar!»',
  'Todos: «Aos fins de tarde no Clube Naval!»',
];
const CHEGA = 4;       // a fala em que o Kiko chega
const LUGARES = [0.1, 0.233, 0.366, 0.5, 0.633, 0.766, 0.9];

// anoitece ao longo da conversa; as luzes da ponte acendem-se a partir da terceira fala
const noite = (act) => Math.min(1, (Math.max(0, act.i) + Math.min(1, act.timer / 2.5)) / FALAS.length);
// o Kiko chega do escritório e senta-se ao lado da Ana
const chega = (dt, act) => {
  const kiko = act.people.find((p) => p.who === 'kiko');
  if (kiko && act.i >= CHEGA) kiko.x = Math.max(LUGARES[6], kiko.x - dt * 0.3);
};
const fundo = (ctx, v, R, t, act) => {
  const k = noite(act);
  docaBelem(ctx, v, R, t, { gy: act.ground(v), dusk: 0.62 + k * 0.38, lights: Math.max(0, Math.min(1, (k - 0.35) * 3)) });
};
// a mesa, à frente dos amigos
const mesa = (ctx, v, R, t, act) => {
  const gy = act.ground(v), mw = Math.round(v.w * 0.86), mx = Math.round((v.w - mw) / 2), my = gy - 14;
  R(mx - 1, my - 1, mw + 2, 6, INK); R(mx, my, mw, 4, '#d8d8e6'); R(mx, my + 3, mw, 1, '#9a9ab0');
  for (const lx of [mx + 6, mx + mw - 9]) { R(lx - 1, my + 5, 5, gy - my - 2, INK); R(lx, my + 5, 3, gy - my - 3, '#6a6a80'); }
  for (let i = 0; i < (act.i > CHEGA ? 7 : 6); i++) { const x = Math.round(v.w * LUGARES[i]) + 9; R(x - 3, my - 10, 7, 10, INK); R(x - 2, my - 6, 5, 6, '#f2b632'); R(x - 2, my - 9, 5, 3, '#ffffff'); }
  // as amêijoas à Bulhão Pato: dois tachos a fumegar, com limão e coentros
  if (act.i >= FALAS.length - 2) for (const fx of [0.3, 0.7]) {
    const x = Math.round(v.w * fx);
    R(x - 13, my - 7, 26, 7, INK); R(x - 12, my - 6, 24, 5, '#5a5a6e'); R(x - 16, my - 6, 4, 2, INK); R(x + 12, my - 6, 4, 2, INK);
    for (let j = 0; j < 6; j++) { R(x - 11 + j * 4, my - 9 + (j % 2), 4, 3, INK); R(x - 10 + j * 4, my - 8 + (j % 2), 2, 2, j % 3 ? '#f2e6c8' : '#e8d0a0'); }
    R(x - 6, my - 10, 2, 1, '#4fae5a'); R(x + 3, my - 10, 2, 1, '#4fae5a'); R(x + 7, my - 9, 3, 2, '#ffe14a');
    for (let j = 0; j < 2; j++) { const p = (t * 0.5 + j / 2) % 1; R(x - 4 + j * 8 + Math.round(Math.sin(t * 2 + j) * 2), my - 12 - Math.round(p * 10), 1, 2, `rgba(255,246,230,${(0.6 * (1 - p)).toFixed(2)})`); }
  }
};

export default {
  id: 'naval',
  title: 'Fins de Tarde no Clube Naval',
  music: 'calm',
  story: 'A Inês adora passar um final de tarde na esplanada do Clube Naval de Lisboa, na Doca de Belém: o Tejo à frente, a ponte ao fundo e uma imperial com os amigos. E ao fim de semana ninguém tem pressa: pedem-se umas amêijoas à Bulhão Pato e ficam todos para jantar.',
  help: 'Toca no ecrã (ou Espaço) no momento certo: quando os copos se encontram no brinde e quando a vela de um veleiro passa à frente do sol.',
  outro: 'Saúde! Aos fins de tarde junto ao rio.',
  ending: 'E a ponte ficou toda iluminada sobre o Tejo.',
  acts: [
    { act: Brinde, when: 'Um fim de tarde na Doca de Belém...', hearts: 4 },
    { act: Veleiros, hearts: 4, boats: 5 },
    {
      act: Talk, hearts: 1, bg: fundo, fg: mesa, tick: chega, lines: FALAS,
      cast: [
        { who: 'leal', x: LUGARES[0], face: 1, name: 'Leal' }, { who: 'mi', x: LUGARES[1], face: 1, name: 'Mi' },
        { who: 'pipoca', x: LUGARES[2], face: 1, name: 'Pipoca' }, { who: 'ines', x: LUGARES[3], face: 1, name: 'Inês' },
        { who: 'lourenco', x: LUGARES[4], face: -1, name: 'Lourenço' }, { who: 'ana', x: LUGARES[5], face: -1, name: 'Ana' },
        { who: 'kiko', outfit: 'work', x: 1.15, face: -1, name: 'Kiko' },      // chega mais tarde, do escritório
      ],
    },
  ],
};

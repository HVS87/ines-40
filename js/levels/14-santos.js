// Nível 14 — «Santos»: os Santos Populares em Lisboa. Sardinhas e bifanas na banca, dançar
// música pimba no arraial e, na noite de Santo António, o mega arraial na praceta em frente ao
// Xafarix, com música ao vivo — onde a Mi e o Leal começaram a namorar. (O Lourenço está na
// Austrália: só aparece no telefonema do fim.)
import { Talk } from '../acts/base.js';
import { PINK, GOLD } from '../draw.js';
import { Ritmo } from '../acts/ritmo.js';
import { Call } from '../acts/call.js';
import { Sardinhas, PIMBA, praceta } from '../acts/santos.js';

// A Mi e o Leal na praceta: ele aproxima-se, ela vai ter com ele e dançam juntos.
const find = (act, who) => act.people.find((p) => p.who === who);
function aproximam(dt, act) {
  const leal = find(act, 'leal'), mi = find(act, 'mi');
  if (act.i >= 2) leal.x = Math.max(0.72, leal.x - dt * 0.25);
  if (act.i >= 3) mi.x = Math.min(0.58, mi.x + dt * 0.2);
}
function coracoes(i, act) {
  if (i < 3) return;
  const v = act.game.view, gy = act.ground(v);
  act.sfx(i === 3 ? 'kiss' : 'chirp');
  for (let k = 0; k < 4; k++) act.fx.heart(v.w * 0.65 + (k - 1.5) * 10, gy - 54 - (k % 2) * 6, k % 2 ? GOLD : PINK);
}

export default {
  id: 'santos',
  title: 'Santos',
  music: 'party',
  story: 'A Inês adora os Santos Populares em Lisboa: arraiais na rua, dançar música pimba, beber imperiais, comer sardinhas e bifanas... A noite de Santo António acabava sempre num mega arraial na praceta em frente ao Xafarix, com música ao vivo. E foi numa dessas noites que a Mi e o Leal começaram a namorar.',
  help: 'Na banca, toca no ecrã (ou Espaço) quando a barra estiver na zona verde, para tirar a sardinha no ponto. A dançar, toca do lado da nota (ou usa as setas ← →) quando ela chegar ao círculo.',
  outro: 'Viva o Santo António!',
  acts: [
    { act: Sardinhas, when: 'Junho em Lisboa: noite de Santo António!' },
    { act: Ritmo, hearts: 5, ...PIMBA },
    {
      act: Talk, hearts: 2, when: 'E a noite acabava sempre na praceta do Xafarix...', bg: praceta,
      cast: [
        { who: 'pipoca', outfit: 'casual', x: 0.2, face: 1, name: 'Pipoca' },
        { who: 'ines', outfit: 'casual', x: 0.4, face: 1, name: 'Inês' },
        { who: 'mi', outfit: 'casual', x: 0.6, face: -1, name: 'Mi' },
      ],
      lines: [
        'Pipoca: «A noite de Santo António acaba sempre aqui: o arraial do Xafarix!»',
        'Inês: «Música ao vivo, manjericos e a rua cheia. Não há noite como esta!»',
        'Mi: «Inês! Viste a Ana?»',
        'Inês: «A Ana? A Ana está no beco.»',
        'Pipoca: «Então siga a marcha, que a banda já está a tocar!»',
      ],
    },
    {
      act: Talk, hearts: 1, when: 'E foi nessa noite de Santo António, com a banda a tocar...', bg: praceta, tick: aproximam, onLine: coracoes,
      cast: [
        { who: 'pipoca', outfit: 'casual', x: 0.14, face: 1, name: 'Pipoca' },
        { who: 'ines', outfit: 'casual', x: 0.3, face: 1, name: 'Inês' },
        { who: 'mi', outfit: 'casual', x: 0.46, face: 1, name: 'Mi' },
        { who: 'leal', outfit: 'casual', x: 0.94, face: -1, name: 'Leal' },
      ],
      lines: [
        'Pipoca: «Inês, já reparaste? O Leal não tira os olhos da Mi.»',
        'Inês: «Mi, vai lá dançar com ele! Nós ficamos aqui... a fazer de cupido.»',
        'Leal: «Mi... esta dança é nossa?»',
        'Mi: «Pensei que nunca mais pedias!»',
        'E foi assim, numa noite de Santo António, que a Mi e o Leal começaram a namorar.',
      ],
    },
    // o telefonema da Austrália (ver js/acts/call.js)
    {
      act: Call, animal: 'emus', when: 'De madrugada, de manjerico debaixo do braço, o telefone toca...',
      lines: [
        'Inês: «Novidade da noite: a Mi e o Leal namoram! E guardei-te um manjerico.»',
        'Lourenço: «Sardinhas, bifanas, arraiais... Que saudades de Lisboa!»',
        'Lourenço: «Sabes que mais? Acho que está na hora de... que barulho é este?!»',
      ],
      win: 'Lourenço: «Eram emus! Um bando inteiro! Já chega: vou voltar para Lisboa!»',
      lose: 'Os emus levaram o Lourenço às costas! Decidido: está na hora de voltar para Lisboa.',
    },
  ],
};

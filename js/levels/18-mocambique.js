// Nível 18 — Moçambique: a chegada à praia, a pesca de barco e o banquete ao pôr do sol.
import { Talk } from '../acts/base.js';
import { Pesca } from '../acts/pesca.js';
import { Banquete } from '../acts/mocambique-banquete.js';
import { praiaMoz, PELE_MOZ } from '../acts/mocambique-cenario.js';

const praia = (ctx, v, R, t, act) => praiaMoz(ctx, v, R, t, { gy: act.ground(v), dusk: 0 });

export default {
  id: 'mocambique',
  title: 'Moçambique',
  music: 'play',
  story: 'Uma viagem épica: a Inês e o Lourenço, a Mi e o Leal e o Zé Brás foram ter com o Pi, que morava em Moçambique. Praias de areia branca, mar turquesa... e fartaram-se de comer e de pescar.',
  help: 'Na pesca: toca no ecrã (ou Espaço) para lançar e quando a boia afundar; depois mantém premido para puxar e larga para aliviar. No banquete: toca quando o marisco passar à frente da Inês.',
  outro: 'Uma viagem para nunca mais esquecer!',
  ending: 'Moçambique ficou no coração de todos.',
  acts: [
    {
      act: Talk, when: 'Moçambique. O Pi já estava à espera...', hearts: 1, bg: praia,
      cast: [
        { who: 'pi', outfit: 'casual', x: 0.12, face: 1, name: 'Pi' },
        { who: 'ines', outfit: 'praia', x: 0.34, face: -1, name: 'Inês' },
        { who: 'lourenco', outfit: 'praia', x: 0.5, face: -1, name: 'Lourenço' },
        { who: 'mi', outfit: 'praia', x: 0.64, face: -1, name: 'Mi' },
        { who: 'leal', outfit: 'praia', x: 0.78, face: -1, name: 'Leal' },
        { who: 'zebras', outfit: 'praia', x: 0.91, face: -1, name: 'Zé Brás' },
      ],
      lines: [
        'Pi: «Bem-vindos a Moçambique! Larguem as malas, que o mar está à espera.»',
        'Inês: «Que praia! Areia branca, palmeiras... e aquele barco de vela?»',
        'Pi: «É um dhow. Mas nós vamos pescar de barco a motor: há peixe para todos.»',
        'Zé Brás: «O maior é meu. Fica já combinado!»',
      ],
    },
    {
      act: Pesca, when: 'Mar adentro, de canas na mão...', hearts: 4, skin: PELE_MOZ,
      fim: 'Pi: «Bela pescaria! Logo à noite há banquete na praia.»',
      fish: [
        { who: 'ines', fish: 'dourado', turn: 'A Inês é a primeira.', cheer: 'Inês: «Um dourado! Olhem para estas cores!»' },
        { who: 'lourenco', fish: 'xareu', turn: 'É a vez do Lourenço.', cheer: 'Lourenço: «Um xaréu! Este deu luta.»' },
        { who: 'mi', fish: 'barracuda', turn: 'Agora a Mi.', cheer: 'Leal: «Uma barracuda! Mi, cuidado com os dentes!»' },
        { who: 'zebras', fish: 'atum', turn: 'Falta o Zé Brás.', cheer: 'Zé Brás: «Um atum! Tinha uns dois metros... no mínimo!»', alt: '2 METROS?!' },
      ],
    },
    { act: Banquete, when: 'Ao fim da tarde, banquete na praia: camarão, caranguejo e piri-piri...', hearts: 5 },
  ],
};

// Nível 6 — «O Crô-Crô»: as tardes na esplanada do café, com imperiais, caracóis na primavera e
// conversa até o sol se pôr. O Pipoca pede sempre «só mais um café».
import { Talk } from '../acts/base.js';
import { Imperiais } from '../acts/croco-imperiais.js';
import { Caracois } from '../acts/croco-caracois.js';
import { esplanada, sentados, malta } from '../acts/croco-cenario.js';

let gente = null;

// A esplanada inteira, com o sol a pôr-se à medida que a conversa avança.
function fundo(ctx, v, R, t, act) {
  if (!gente) gente = malta();
  const gy = act.ground(v), n = (act.cfg.lines || []).length;
  const dusk = Math.max(0, Math.min(1, (act.i + Math.min(1, act.timer / 3)) / n));
  esplanada(ctx, v, R, { gy, top: act.top(v), cx: Math.round(v.w / 2), half: v.w / 2, t, dusk, fore: true });
  sentados(ctx, R, gente, { x0: v.portrait ? 6 : Math.round(v.w * 0.04), x1: v.w - (v.portrait ? 6 : Math.round(v.w * 0.04)), gy, rows: v.portrait ? 2 : 1, t, drinks: 9, cafe: true, speaker: act.speaker, all: act.speaker === 'Todos' });
}

export default {
  id: 'croco',
  title: 'O Crô-Crô',
  music: 'play',
  story: 'A Inês, as amigas e amigos como o Pipoca iam sempre beber café e passar as tardes a conversar na esplanada do Crô-Crô, na Avenida Infante Santo, ao pé da Estrela. Também lá havia hambúrgueres, mas na primavera o que sabia mesmo bem eram os caracóis, com umas imperiais a acompanhar.',
  help: 'Mantém premido (ou Espaço) para encher o copo e larga com a espuma na marca verde. Nos caracóis, toca no ecrã (ou Espaço) quando o palito estiver na zona verde.',
  outro: 'Tardes inteiras de conversa, caracóis e imperiais. E só mais um café!',
  acts: [
    { act: Imperiais, when: 'Uma tarde qualquer, na esplanada do Crô-Crô...', hearts: 5 },
    { act: Caracois, when: 'Chega a primavera... e os caracóis!', hearts: 5 },
    {
      act: Talk, when: 'E a tarde vai passando...', hearts: 2, bg: fundo, cast: [], ground: 0.8,
      lines: [
        'Ana: «Só vínhamos beber um café... e já lá vão três horas.»',
        'Soft: «Quem é que acabou com os caracóis? Estou a olhar para ti, Pipoca.»',
        'Pipoca: «Eu?! Eu só molhei o pão no molho.»',
        'Lourenço: «Mais uma rodada? Pago eu... se a Inês me emprestar.»',
        'Tété: «Olhem o sol a pôr-se. Ficávamos aqui para sempre!»',
        'Inês: «Às tardes no Crô-Crô. Que nunca acabem!»',
        'Pipoca: «Só mais um café! É o último, juro.»',
        'Todos: «Já ouvimos essa, Pipoca!»',
      ],
    },
  ],
};

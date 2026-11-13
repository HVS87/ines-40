// Nível 12 — o Xafarix: dançar ao som do Mico, o Long Island Iced Tea ao balcão e o pedido de
// casamento do Nuno à Maria. (O Lourenço está na Austrália: só aparece no telefonema do fim.)
import { Call } from '../acts/call.js';
import { Talk } from '../acts/base.js';
import { Ritmo } from '../acts/ritmo.js';
import { DANCA } from '../acts/xafarix-danca.js';
import { LongIsland } from '../acts/xafarix-longisland.js';
import { CENA_ENTRADA, CENA_PEDIDO } from '../acts/xafarix-cenas.js';

export default {
  id: 'xafarix',
  title: 'O Xafarix',
  music: 'party',
  story: 'A Inês adorava dançar com o Pipoca, a Ana e a Mi no Xafarix, o bar de música ao vivo do Luís Represas, com o Mico da Câmara Pereira a tocar guitarra e a cantar. Ao balcão, os Long Island Iced Teas saíam na perfeição. E foi numa destas noites que o Nuno pediu a Maria em casamento.',
  help: 'A dançar: toca do lado da nota (ou usa as setas ← →) quando ela chegar ao círculo. Ao balcão: mantém o dedo no ecrã (ou Espaço) para deitar cada bebida e larga na marca dourada.',
  outro: 'Música ao vivo, amigos e amores: as noites do Xafarix!',
  acts: [
    { act: Talk, when: 'Uma noite de música ao vivo, em Santos...', ...CENA_ENTRADA },
    { act: Ritmo, hearts: 5, ...DANCA },
    { act: LongIsland, hearts: 5, when: 'Entretanto, ao balcão...' },
    { act: Talk, when: 'E numa dessas noites...', ...CENA_PEDIDO },
    // o telefonema da Austrália (ver js/acts/call.js)
    {
      act: Call, animal: 'aranha', when: 'Já em casa, de madrugada, o telefone toca...',
      lines: [
        'Inês: «Cheguei agora do Xafarix! O Nuno pediu a Maria em casamento!»',
        'Lourenço: «A sério?! E eu aqui, do outro lado do mundo...»',
        'Lourenço: «Um dia volto e levo-te eu a dançar. Prome... AAAH!»',
      ],
      win: 'Lourenço: «Já foi! Era só uma aranha do tamanho de um prato. Aqui é normal!»',
      lose: 'Lourenço: «ARANHA!» E lá voou o telefone pelo ar... A chamada caiu.',
    },
  ],
};

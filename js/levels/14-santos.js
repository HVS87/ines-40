// Nível 14 — «Santos»: os Santos Populares em Lisboa. Sardinhas e bifanas na banca, dançar
// música pimba no arraial e, na noite de Santo António, o mega arraial na praceta em frente ao
// Xafarix, com música ao vivo. (O Lourenço está na Austrália: só aparece no telefonema do fim.)
import { Talk } from '../acts/base.js';
import { Ritmo } from '../acts/ritmo.js';
import { Call } from '../acts/call.js';
import { Sardinhas, PIMBA, praceta } from '../acts/santos.js';

export default {
  id: 'santos',
  title: 'Santos',
  music: 'party',
  story: 'A Inês adora os Santos Populares em Lisboa: arraiais na rua, dançar música pimba, beber imperiais, comer sardinhas e bifanas... E a noite de Santo António acabava sempre num mega arraial na praceta em frente ao Xafarix, com música ao vivo.',
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
    // o telefonema da Austrália (ver js/acts/call.js)
    {
      act: Call, animal: 'emus', when: 'De madrugada, de manjerico debaixo do braço, o telefone toca...',
      lines: [
        'Inês: «Santo António sem ti não é a mesma coisa. Guardei-te um manjerico!»',
        'Lourenço: «Sardinhas, bifanas, arraiais... Que saudades de Lisboa!»',
        'Lourenço: «Sabes que mais? Acho que está na hora de... que barulho é este?!»',
      ],
      win: 'Lourenço: «Eram emus! Um bando inteiro! Já chega: vou voltar para Lisboa!»',
      lose: 'Os emus levaram o Lourenço às costas! Decidido: está na hora de voltar para Lisboa.',
    },
  ],
};

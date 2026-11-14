// Nível 26 — nasce a Jeanne, a filha da Inês e do Lourenço. O Lourenço apanha-a, e o Tomás,
// que está no fim do liceu, também ajuda.
import { Talk } from '../acts/base.js';
import { Catch } from '../acts/catch.js';
import { corredor } from '../acts/cenarios.js';

export default {
  id: 'jeanne',
  title: 'Nasce a Jeanne',
  music: 'embalar',
  story: 'A família cresce: vem aí a Jeanne, a filha da Inês e do Lourenço! O Lourenço está a postos na sala de partos, e o Tomás, que está a acabar o liceu, veio ajudar a receber a mana.',
  help: 'Arrasta o dedo (ou usa as setas) para pôr o Lourenço debaixo da bebé: a sombra no chão mostra onde ela vai cair. O Tomás também tenta lá chegar!',
  outro: 'Bem-vinda, Jeanne!',
  ending: 'Inês, Lourenço, Tomás e Jeanne: a família está completa!',
  acts: [
    {
      act: Talk, hearts: 2, bg: corredor,
      cast: [
        { who: 'lourenco', outfit: 'bata', x: 0.3, face: 1, name: 'Lourenço' },
        { who: 'tomas', outfit: 'casual', x: 0.5, face: -1, name: 'Tomás' },
        { who: 'parteira', x: 0.86, face: -1, name: 'Parteira' },
      ],
      lines: [
        'Lourenço: «Tomás, tu cobres o lado direito. Eu fico com o esquerdo.»',
        'Tomás: «Lourenço... isto é um parto, não é um jogo de rugby.»',
        'Parteira: «Menos tática e mais ação: ela vem aí!»',
      ],
    },
    {
      act: Catch, when: 'Na sala de partos...',
      mother: ['ines', 'bata'], catcher: ['lourenco', 'bata'], helper: ['tomas', 'casual'], helperName: 'O Tomás',
      baby: { name: 'Jeanne', article: 'a', blanket: '#ffc6de', born: 'Bem-vinda, Jeanne!' },
    },
  ],
};

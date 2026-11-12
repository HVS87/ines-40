// Nível 10 — nasce o Tomás, o filho da Inês. O pai, o Zé, tem de o apanhar!
import { Talk } from '../acts/base.js';
import { Catch } from '../acts/catch.js';
import { corredor } from '../acts/cenarios.js';

export default {
  id: 'tomas',
  title: 'Nasce o Tomás',
  music: 'menu',
  story: 'A Inês vai ser mãe! Na maternidade, o Zé, o pai, anda de um lado para o outro no corredor. Vem aí o Tomás — e vem com pressa.',
  help: 'Arrasta o dedo (ou usa as setas) para pôr o Zé debaixo do bebé: a sombra no chão mostra onde ele vai cair. Apanha à primeira para ganhares mais corações!',
  outro: 'Bem-vindo, Tomás!',
  ending: 'A Inês e o Tomás: começa aqui a melhor das aventuras.',
  acts: [
    {
      act: Talk, hearts: 2, bg: corredor,
      cast: [
        { who: 'ines', outfit: 'bata', x: 0.3, face: 1, name: 'Inês' },
        { who: 'ze', outfit: 'bata', x: 0.5, face: -1, name: 'Zé' },
        { who: 'parteira', x: 0.86, face: -1, name: 'Parteira' },
      ],
      lines: [
        'Zé: «Calma, calma... Está tudo controlado!»',
        'Inês: «Zé, quem está em trabalho de parto sou eu.»',
        'Parteira: «Está na hora! O pai venha comigo... e traga os reflexos.»',
      ],
    },
    {
      act: Catch, when: 'Na sala de partos...',
      mother: ['ines', 'bata'], catcher: ['ze', 'bata'],
      baby: { name: 'Tomás', article: 'o', blanket: '#8fc4ff', born: 'Bem-vindo, Tomás!' },
    },
  ],
};

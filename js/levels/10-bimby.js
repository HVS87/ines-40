// Nível 10: a Bimby. A Inês trabalha na Vorwerk, onde se está sempre a cozinhar e a experimentar
// receitas novas, com a Bárbara e a Isabel. (O Lourenço está na Austrália: só aparece no telefonema do fim.)
import { Call } from '../acts/call.js';
import { Talk } from '../acts/base.js';
import { BimbyReceita } from '../acts/bimby-receita.js';
import { BimbyProgramar } from '../acts/bimby-programar.js';
import { fundoProva, frenteProva } from '../acts/bimby-comum.js';

export default {
  id: 'bimby',
  title: 'A Bimby',
  music: 'cozinha',
  story: 'A Inês trabalha na Vorwerk, a empresa que faz o conhecido robô de cozinha Bimby. Adora o trabalho: no escritório estão sempre a cozinhar e a experimentar receitas novas, com as amigas Bárbara e Isabel.',
  help: 'Arrasta o dedo (ou usa as setas) para apanhar os ingredientes pela ordem da receita. Depois toca no ecrã (ou Espaço) quando cada marcador passar na marca verde.',
  outro: 'Receita aprovada pelo escritório inteiro!',
  acts: [
    { act: BimbyReceita, hearts: 5, when: 'No escritório da Vorwerk, hoje há receita nova...' },
    { act: BimbyProgramar, hearts: 3 },
    {
      act: Talk, hearts: 2, when: 'Dez minutos depois...',
      bg: fundoProva, fg: frenteProva,
      cast: [
        { who: 'barbara', x: 0.18, face: 1, name: 'Bárbara' },
        { who: 'ines', outfit: 'work', x: 0.42, face: 1, name: 'Inês' },
        { who: 'isabelv', x: 0.66, face: -1, name: 'Isabel' },
      ],
      lines: [
        'O creme de legumes está pronto. Hora da prova!',
        'Bárbara: «Hmm... nota dez! Aveludado, como deve ser.»',
        'Isabel: «Eu dou nove. Só para teres de repetir amanhã.»',
        'Inês: «Que trabalho difícil o nosso... alguém tem de provar tudo!»',
        'Bárbara: «E a seguir? Um risotto? Um bolo de chocolate?»',
        'Inês: «Os dois! A Bimby aguenta... e nós também.»',
      ],
    },
    // o telefonema da Austrália (ver js/acts/call.js)
    {
      act: Call, animal: 'canguru', when: 'À noite, o telefone toca: é da Austrália!',
      lines: [
        'Lourenço: «Bom dia! Quer dizer... boa noite? Aqui já é amanhã!»',
        'Inês: «Tenho saudades tuas. Hoje fiz um risotto na Bimby que...»',
        'Lourenço: «Não me fales de comida, que eu... espera, o que é aquilo?!»',
      ],
      win: 'Lourenço: «Xô! Já foi. Era só um canguru de luvas de boxe: o normal por aqui.»',
      lose: 'Inês: «Lourenço? Estou?...» O canguru levou o telefone. Até amanhã, Austrália!',
    },
  ],
};

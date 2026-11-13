// Nível 26 — os 40 anos da Inês: a festa no Recreio, com a família e os amigos todos.
import { Abracos, Bolo } from '../acts/festa.js';
import { TIO } from '../nomes.js';

export default {
  id: 'festa',
  title: 'Os 40 Anos',
  music: 'party',
  story: `15 de novembro de 2026: a Inês faz 40 anos! A festa é no Recreio e está cá toda a gente: o ${TIO} e a Tia Fátima, a Sofia, a Maria, o Zé Inácio e o Kiko, as amigas de sempre, os amigos de todas as aventuras... e o Lourenço, o Tomás e a Jeanne.`,
  help: 'Arrasta o dedo (ou usa as setas) para a Inês atravessar a festa e receber os abraços de todos. No fim, toca muitas vezes no ecrã (ou em Espaço) para soprar as 40 velas!',
  outro: 'Parabéns, Inês!',
  ending: 'Parabéns, Inês! Que venham mais 40 anos de aventuras.',
  acts: [
    {
      act: Abracos, when: '15 de novembro de 2026',
      groups: [
        { people: [['tio', 'hoje'], ['tiafatima', 'hoje'], ['irma1', 'festa'], ['irma2', 'festa'], ['irmao', 'festa'], ['irmao2', 'festa']], extra: 'baloes',
          line: 'Tia Fátima: «Quarenta anos! E parece que foi ontem a corrida para a maternidade...»' },
        { people: [['ana', 'festa'], ['maisa', 'festa'], ['soft', 'festa'], ['isabel', 'festa']],
          line: 'Isabel: «Das Escravas até hoje, sempre juntas! E desta vez não trouxe o trolley.»' },
        { people: [['mi', 'festa'], ['leal', 'festa'], ['maria', 'festa'], ['nuno', 'festa'], ['tete', 'festa']],
          line: 'Mi: «Um brinde à melhor madrinha que o Micas podia ter!»' },
        { people: [['pipoca', 'festa']],
          line: 'Pipoca: «Parabéns, Inês! Trouxe quiche. E desta vez ninguém cortou dedos.»' },
        { people: [['barbara', 'festa'], ['isabelv', 'festa']],
          line: 'Bárbara: «O bolo? Feito na Bimby, claro. Velocidade 5, com muito amor.»' },
        { people: [['pi', 'festa'], ['carlos', 'festa'], ['zebras', 'festa']],
          line: 'Pi: «Amanhã há passeio de barco! O Carlos jura que o comandante é ele...»' },
        { people: [['lourenco', 'festa'], ['tomas', 'festa']], extra: 'bebe',
          line: 'Lourenço: «Parabéns, meu amor. Hoje não há cangurus, aranhas nem emus: só nós.»' },
      ],
    },
    {
      act: Bolo,
      crowd: [['tio', 'hoje'], ['tiafatima', 'hoje'], ['ana', 'festa'], ['maisa', 'festa'], ['soft', 'festa'], ['isabel', 'festa'], ['pipoca', 'festa'], ['mi', 'festa'], ['leal', 'festa'], ['maria', 'festa'], ['nuno', 'festa'], ['tete', 'festa'], ['lourenco', 'festa'], ['tomas', 'festa']],
    },
  ],
};

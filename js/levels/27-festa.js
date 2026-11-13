// Nível 27 — os 40 anos da Inês: a festa no Recreio de Miraflores (de que o Lourenço é um dos
// donos), com a família e os amigos todos, música ao vivo e um bolo com 40 velas.
import { Talk } from '../acts/base.js';
import { Ritmo } from '../acts/ritmo.js';
import { interior } from '../acts/recreio-cenario.js';
import { Abracos, Bolo, CONCERTO } from '../acts/festa.js';
import { TIO } from '../nomes.js';

export default {
  id: 'festa',
  title: 'Os 40 Anos',
  music: 'party',
  story: `15 de novembro de 2026: a Inês faz 40 anos! A festa é no Recreio de Miraflores, de que o Lourenço é um dos donos, com música ao vivo, e está cá toda a gente: o ${TIO} e a Tia Fátima, a Sofia, a Maria, o Zé Inácio e o Kiko, as amigas de sempre, os amigos de todas as aventuras... e o Lourenço, o Tomás e a Jeanne.`,
  help: 'Arrasta o dedo (ou usa as setas) para a Inês atravessar a festa e receber os abraços de todos. Quando a banda começar, toca do lado da nota (ou usa as setas ← →) ao chegar ao círculo. No fim, toca muitas vezes no ecrã (ou em Espaço) para soprar as 40 velas!',
  outro: 'Parabéns, Inês!',
  ending: 'Parabéns, Inês! Que venham mais 40 anos de aventuras.',
  acts: [
    // à entrada, o dono da casa recebe a aniversariante
    {
      act: Talk, when: '15 de novembro de 2026',
      bg: (ctx, v, R, t, act) => interior(ctx, v, R, act.ground(v), 0, act.top(v), t, { entrada: true }),
      cast: [
        { who: 'ines', outfit: 'festa', x: 0.52, face: 1, name: 'Inês' },
        { who: 'lourenco', outfit: 'festa', x: 0.78, face: -1, name: 'Lourenço' },
      ],
      lines: [
        'Lourenço: «Bem-vinda ao Recreio, Inês! Hoje a festa é por conta da casa.»',
        'Inês: «Dá jeito conhecer um dos donos... Então quero a banda a tocar a noite toda!»',
        'Lourenço: «Combinado. Entra, que está cá toda a gente à tua espera!»',
      ],
    },
    {
      act: Abracos,
      groups: [
        { people: [['tio', 'hoje'], ['tiafatima', 'hoje'], ['irma1', 'festa'], ['irma2', 'festa'], ['irmao', 'festa'], ['irmao2', 'festa']], extra: 'baloes',
          line: 'Tia Fátima: «Quarenta anos! E parece que foi ontem a corrida para a maternidade...»' },
        { people: [['ana', 'festa'], ['kiko', 'festa'], ['maisa', 'festa'], ['soft', 'festa'], ['isabel', 'festa']],
          line: 'Isabel: «Das Escravas até hoje, sempre juntas! E desta vez não trouxe o trolley.»' },
        { people: [['mi', 'festa'], ['leal', 'festa'], ['maria', 'festa'], ['nuno', 'festa'], ['tete', 'festa']],
          line: 'Mi: «Um brinde à melhor madrinha que o Micas podia ter!»' },
        { people: [['pipoca', 'festa']],
          line: 'Pipoca: «Parabéns, Inês! Trouxe quiche. E desta vez ninguém cortou dedos.»' },
        { people: [['barbara', 'festa'], ['isabelv', 'festa']],
          line: 'Bárbara: «O bolo? Feito na Bimby, claro. Velocidade 5, com muito amor.»' },
        { people: [['pi', 'festa'], ['carlos', 'festa'], ['zebras', 'festa']],
          line: 'Pi: «Amanhã alugamos um barco! A carta de marinheiro já está no bolso.»' },
        { people: [['moncada', 'festa'], ['marta', 'festa'], ['gonzaga', 'festa']],
          line: 'Moncada: «Parabéns, Inês! Depois do catamarã, uma festa em terra firme.»' },
        { people: [['lourenco', 'festa'], ['tomas', 'festa']], extra: 'bebe',
          line: 'Lourenço: «Parabéns, meu amor. Hoje não há cangurus, aranhas nem emus: só nós.»' },
      ],
    },
    {
      act: Ritmo, hearts: 5, music: 'concerto', when: 'As luzes baixam, a banda sobe ao palco... e a pista é da Inês!', ...CONCERTO,
    },
    {
      act: Bolo, music: 'parabens', when: 'E a banda ataca os parabéns!',
      crowd: [['tio', 'hoje'], ['tiafatima', 'hoje'], ['ana', 'festa'], ['kiko', 'festa'], ['maisa', 'festa'], ['soft', 'festa'], ['isabel', 'festa'], ['pipoca', 'festa'], ['mi', 'festa'], ['leal', 'festa'], ['maria', 'festa'], ['nuno', 'festa'], ['tete', 'festa'], ['moncada', 'festa'], ['marta', 'festa'], ['gonzaga', 'festa'], ['lourenco', 'festa'], ['tomas', 'festa']],
    },
  ],
};

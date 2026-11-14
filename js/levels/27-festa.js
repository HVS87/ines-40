// Nível 27 — os 40 anos da Inês: a festa no Recreio de Miraflores (de que o Lourenço é um dos
// donos), com os amigos todos, música ao vivo e um bolo com 40 velas.
import { Talk } from '../acts/base.js';
import { Ritmo } from '../acts/ritmo.js';
import { interior } from '../acts/recreio-cenario.js';
import { Abracos, Bolo, CONCERTO } from '../acts/festa.js';
import { COLEGIO, LICEU, O_PIPOCA, BIMBY, MAR, CATAMARA, CASA, CONVIDADOS } from '../convidados.js';

export default {
  id: 'festa',
  title: 'Os 40 Anos',
  music: 'party',
  story: `15 de novembro de 2026: a Inês faz 40 anos! A festa é no Recreio de Miraflores, de que o Lourenço é um dos donos, com música ao vivo, e estão cá as amigas de sempre, os amigos de todas as aventuras... e o Lourenço, o Tomás e a Jeanne.`,
  help: 'Arrasta o dedo (ou usa as setas) para a Inês atravessar a festa e receber os abraços de todos. Quando a banda começar, toca do lado da nota (ou usa as setas ← →) quando ela chegar ao círculo. No fim, toca muitas vezes no ecrã (ou em Espaço) para soprar as 40 velas!',
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
        { people: COLEGIO, extra: 'baloes',
          line: 'Isabel: «Das Escravas até hoje, sempre juntas! E desta vez não trouxe o trolley.»' },
        { people: LICEU,
          line: 'Mi: «Um brinde à melhor madrinha que o Micas podia ter!»' },
        { people: O_PIPOCA,
          line: 'Pipoca: «Parabéns, Inês! Trouxe quiche. E desta vez ninguém cortou dedos.»' },
        { people: BIMBY,
          line: 'Bárbara: «O bolo? Feito na Bimby, claro. Velocidade 5, com muito amor.»' },
        { people: MAR,
          line: 'Carlos: «Amanhã alugamos um barco! A carta de marinheiro já está no bolso.»' },
        { people: CATAMARA,
          line: 'Moncada: «Parabéns, Inês! Depois do catamarã, uma festa em terra firme.»' },
        { people: CASA, extra: 'bebe',
          line: 'Lourenço: «Parabéns, meu amor. Hoje não há cangurus, aranhas nem emus: só nós.»' },
      ],
    },
    {
      act: Ritmo, hearts: 5, music: 'concerto', when: 'As luzes baixam, a banda sobe ao palco... e a pista é da Inês!', ...CONCERTO,
    },
    {
      act: Bolo, music: 'parabens', when: 'E a banda ataca os parabéns!',
      crowd: CONVIDADOS,
    },
  ],
};

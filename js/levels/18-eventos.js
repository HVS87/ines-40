// Nível 18: eventos e viagens. A Inês é a responsável por organizar os eventos corporate da
// Vorwerk: fazer a mala a correr, apanhar o avião e pôr uma grande gala de pé.
import { Talk } from '../acts/base.js';
import { EventosMala } from '../acts/eventos-mala.js';
import { EventosGala } from '../acts/eventos-gala.js';
import { fundoBastidores, frenteBastidores } from '../acts/eventos-bastidores.js';

export default {
  id: 'eventos',
  title: 'Eventos e Viagens',
  music: 'play',
  story: 'A Inês é a responsável por organizar vários eventos corporate da Vorwerk, e por isso viaja muito: mala feita num instante, avião... e uma gala inteira para pôr de pé a horas.',
  help: 'Toca nas coisas da lista para as pôr na mala (ou setas e Espaço). Na gala, arrasta o dedo (ou usa as setas) para levar a Inês a cada imprevisto.',
  outro: 'Mais um evento perfeito. E o próximo já vem a caminho!',
  acts: [
    { act: EventosMala, hearts: 4, when: 'Véspera de mais um evento...' },
    { act: EventosGala, hearts: 6, when: 'No dia da gala, a poucas horas de abrirem as portas...' },
    {
      act: Talk, hearts: 2, when: 'À noite, com a sala cheia...',
      bg: fundoBastidores, fg: frenteBastidores,
      cast: [
        { who: 'isabelv', outfit: 'festa', x: 0.52, face: -1, name: 'Isabel' },
        { who: 'ines', outfit: 'work', x: 0.7, face: -1, name: 'Inês' },
        { who: 'barbara', outfit: 'festa', x: 0.88, face: -1, name: 'Bárbara' },
      ],
      onLine(i, act) { if (i === 3) act.sfx('ring'); },
      lines: [
        'A gala começa: sala cheia, luzes no sítio, som impecável. Aplausos!',
        'Inês: «Ufa... correu tudo bem. E ninguém deu pelo projetor!»',
        'Bárbara: «Tudo bem? Correu lindamente, como sempre!»',
        'Trrrim, trrrim! O telefone da Inês...',
        'Inês: «Estou? ... A próxima convenção? Outra viagem? Claro que sim!»',
        'Isabel: «Nem tirou o auricular... e lá vai ela fazer a mala outra vez.»',
      ],
    },
  ],
};

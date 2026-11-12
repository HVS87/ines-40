// Nível 5 — Paradise Garage: a discoteca da moda na adolescência da Inês, em Alcântara.
// A porta (o porteiro amigo e a Ladies Night), a pista (dançar ao ritmo) e os amigos todos.
import { Talk } from '../acts/base.js';
import { Ritmo } from '../acts/ritmo.js';
import { GaragePorta, portaFundo } from '../acts/garage-porta.js';
import { PISTA } from '../acts/garage-pista.js';
import { GarageAmigos } from '../acts/garage-amigos.js';

export default {
  id: 'garage',
  title: 'Paradise Garage',
  music: 'party',
  story: 'Na adolescência da Inês, a discoteca da moda era o Paradise Garage, em Alcântara. Às sextas-feiras havia Ladies Night (as raparigas não pagavam) e o porteiro, que era amigo da Inês, deixava-a sempre entrar com as amigas. Lá dentro, bebia-se Martini Metz, Smirnoff Ice e shots, e todos os amigos se encontravam na pista.',
  help: 'Toca no ecrã (ou carrega em Espaço) no momento certo: para acenar ao porteiro, para dançar ao ritmo quando a luz chega ao círculo e para encontrar os amigos quando o foco os ilumina.',
  outro: 'O grupo todo junto na pista: noites de Garage que ninguém esquece!',
  acts: [
    {
      act: Talk, when: 'Sexta-feira à noite, em Alcântara...', bg: portaFundo,
      cast: [
        { who: 'isabel', outfit: 'night', x: 0.08, name: 'Isabel' },
        { who: 'soft', outfit: 'night', x: 0.17, name: 'Soft' },
        { who: 'maisa', outfit: 'night', x: 0.26, name: 'Maísa' },
        { who: 'ana', outfit: 'night', x: 0.36, name: 'Ana' },
        { who: 'ines', outfit: 'night', x: 0.47, name: 'Inês' },
      ],
      lines: [
        'Ana: «Tanta gente! Com esta fila, só entramos de madrugada...»',
        'Inês: «Calma. O porteiro é meu amigo: deixa-nos sempre entrar!»',
      ],
    },
    { act: GaragePorta, hearts: 3 },
    { act: Ritmo, hearts: 4, when: 'Lá dentro, a pista já está a ferver...', ...PISTA },
    { act: GarageAmigos, hearts: 5, when: 'A pista encheu e as luzes baixaram. Onde está toda a gente?' },
  ],
};

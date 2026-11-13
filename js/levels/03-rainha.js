// Nível 3 — «O Rainha»: o Liceu Rainha Dona Amélia, no palácio da Rua da Junqueira. Novas amigas
// (a Mi, a Maria e a Tété) e o primeiro «olá» do Lourenço.
import { Talk } from '../acts/base.js';
import { getCharacter } from '../sprites.js';
import { PINK, GOLD } from '../draw.js';
import { Chegada } from '../acts/rainha-chegada.js';
import { Escadaria } from '../acts/rainha-escadaria.js';
import { patio, grupo } from '../acts/rainha-cenario.js';

// As amigas a cochichar a um canto do pátio (em duas filas quando o ecrã é estreito).
const AMIGAS = [['ana', 'Ana'], ['soft', 'Soft'], ['isabel', 'Isabel'], ['mi', 'Mi'], ['maria', 'Maria'], ['tete', 'Tété']];
function amigas(v) {
  const p = v.portrait;
  return AMIGAS.map(([who, name], i) => ({
    frames: getCharacter(who, 'teen'), name, face: 1,
    x: p ? 18 + (i % 3) * 27 + (i < 3 ? 12 : 0) : Math.round(v.w * 0.06) + i * 27,
    dy: p && i < 3 ? 15 : 0,
  }));
}

function fundoPatio(ctx, v, R, t, act) {
  const gy = act.ground(v);
  patio(ctx, v, R, t, gy, act.top(v));
  grupo(ctx, amigas(v), gy, act.speaker, t);
}

// Corações por cima dos dois quando se dizem olá.
function olas(i, act) {
  const v = act.game.view, gy = act.ground(v);
  if (i === 1 || i === 2 || i === 5) {
    act.sfx('chirp');
    for (let k = 0; k < 3; k++) act.fx.heart(v.w * (v.portrait ? 0.74 : 0.7) + (k - 1) * 12, gy - 56 - k * 4, k % 2 ? GOLD : PINK);
  }
}

export default {
  id: 'rainha',
  title: 'O Rainha',
  music: 'play',
  story: 'Na adolescência, a Inês vai para o Liceu Rainha Dona Amélia — «o Rainha» —, num palácio da Rua da Junqueira. A Ana, a Soft e a Isabel também vão; a Maísa segue para outro liceu, mas a amizade continua. Lá conhece novas amigas, como a Mi, a Maria e a Tété... e um rapaz chamado Lourenço Bruschy.',
  help: 'Mantém premido (ou a seta para a direita) para andar e toca no ecrã (ou Espaço) para cumprimentar. Na escadaria, arrasta o dedo (ou usa as setas) para te desviares de quem desce.',
  outro: 'Amigas novas para a vida inteira... e um «olá» que ainda ia dar muito que falar.',
  acts: [
    { act: Chegada, when: 'Primeiro dia de aulas no Rainha...', hearts: 3 },
    { act: Escadaria, when: 'A campainha já tocou!', hearts: 5 },
    {
      act: Talk, when: 'No intervalo, no pátio...', hearts: 2, bg: fundoPatio, onLine: olas,
      cast: [
        { who: 'ines', outfit: 'teen', x: 0.64, face: 1, name: 'Inês' },
        { who: 'lourenco', outfit: 'teen', x: 0.84, face: -1, name: 'Lourenço' },
      ],
      lines: [
        'Mi: «Não olhes já... mas o rapaz novo vem aí!»',
        'Lourenço: «Olá! Sou o Lourenço. Lourenço Bruschy.»',
        'Inês: «Olá... Eu sou a Inês.»',
        'Tété: «(Ela corou! Eu vi, ela corou!)»',
        'Lourenço: «Então... vemo-nos amanhã na aula?»',
        'Inês: «Vemo-nos amanhã!»',
        'Maria: «Isto ainda vai dar namoro. Escrevam o que eu digo!»',
      ],
    },
  ],
};

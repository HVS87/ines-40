// Nível 7: acampar na Ilha do Farol. Nove raparigas, uma tenda individual, o trolley da Isabel,
// os pescadores, o jantar de enlatados à volta da fogueira e, de manhã, a lancha da GNR.
import { partida } from '../acts/cenarios.js';
import { Talk } from '../acts/base.js';
import { hills, sign } from '../draw.js';
import { praia, farol, casinha, tufo, trolley, barcoCarreira } from '../acts/farol-comum.js';
import { FarolChegada } from '../acts/farol-chegada.js';
import { FarolTenda } from '../acts/farol-tenda.js';
import { FarolFogueira } from '../acts/farol-fogueira.js';
import { FarolGNR } from '../acts/farol-gnr.js';

// O cais da ilha: o barco de carreira acabado de chegar, o passadiço de madeira e o farol ao fundo.
function cais(ctx, v, R, t, act) {
  const gy = act.ground(v), P = v.portrait, top = act.top(v);
  praia(ctx, v, R, t, {
    sy: v.h + 8, hy: gy - (P ? 70 : 44),
    fundo: (B) => {
      // a ilha ao fundo, à direita: dunas, casinhas e o farol
      const iy = B.hy + (P ? 16 : 10);
      hills(ctx, v.w, iy, iy, -v.w * 0.9, 0.3, 5, 3, '#ecd79c', 3);
      R(0, iy - 2, v.w * 0.42, 8, '#2a86bd');
      casinha(R, v.w * 0.52, iy - 4, 12); casinha(R, v.w * 0.62, iy - 5, 14); tufo(R, v.w * 0.72, iy - 4); tufo(R, v.w * 0.92, iy - 5);
      farol(ctx, R, v.w * 0.82, iy - 3, Math.min(P ? 170 : 100, iy - top + 4));
      R(0, iy, v.w, 2, '#56b4d8');
      barcoCarreira(ctx, R, v.w * 0.2, gy - 4, 2, t);
    },
  });
  // o cais de madeira
  R(0, gy - 2, v.w, 9, '#2b1d2e'); R(0, gy - 1, v.w, 6, '#b8834a'); R(0, gy - 1, v.w, 1, '#e0b070');
  for (let x = 4; x < v.w; x += 14) R(x, gy, 1, 5, '#8a5a2e');
  for (let x = 10; x < v.w; x += 46) { R(x, gy + 7, 6, v.h - gy, '#2b1d2e'); R(x + 1, gy + 7, 3, v.h - gy, '#6b4a2e'); }
  sign(ctx, 'ILHA DO FAROL', v.w * 0.5, gy + 14);
}

export default {
  id: 'farol',
  title: 'Acampar na Ilha do Farol',
  music: 'acampar',
  story: 'A Inês foi acampar com a Ana, a Soft, a Isabel, a Maria, a Tété e mais três amigas para a Ilha do Farol, ao largo de Olhão: nove raparigas, sol, praia e uma noite debaixo das estrelas. O que é que podia correr mal?',
  help: 'Toca no ecrã (ou Espaço) para saltar, dar uma ajuda às amigas e pregar as estacas; mantém premido para soprar a fogueira. De manhã, toca em cada coisa (ou setas e Espaço) para a arrumar.',
  outro: 'Acampamento levantado! E o trolley da Isabel ficou para a história.',
  acts: [
    {
      act: Talk, when: 'Férias de verão: de Olhão, de barco, para a Ilha do Farol...', bg: cais,
      fg: (ctx, v, R, t, act) => trolley(R, Math.round(0.62 * v.w) + 30, act.ground(v), 2, -1),
      cast: [
        { who: 'ana', outfit: 'praia', x: 0.12, name: 'Ana' }, { who: 'ines', outfit: 'praia', x: 0.36, name: 'Inês' },
        { who: 'isabel', outfit: 'praia', x: 0.62, face: -1, name: 'Isabel' }, { who: 'maria', outfit: 'praia', x: 0.9, face: -1, name: 'Maria' },
      ],
      lines: [
        'Inês: «Ilha do Farol! Nove amigas e uma ilha inteira só para nós.»',
        'Ana: «Sol, praia e uma noite debaixo das estrelas. Vai ser de sonho!»',
        'Maria: «E o jantar vem comigo: latas e mais latas. Menu de luxo!»',
        'Isabel: «Alguém me ajuda? O meu trolley prende-se nas tábuas...»',
        'Inês: «Isabel... trouxeste um TROLLEY para acampar?!»',
        'Isabel: «Então? Tem rodinhas. É muito mais prático do que uma mochila!»',
        'Ana: «Na areia é que vai ser bonito... Anda, Isabel, eu vou atrás de ti e dou-te uma ajuda.»',
      ],
    },
    { act: FarolChegada, hearts: 4 },
    { act: FarolTenda, hearts: 3, when: 'No sítio do acampamento...' },
    { act: FarolFogueira, hearts: 4, when: 'Ao cair da noite...' },
    { act: FarolGNR, hearts: 3, music: 'tense', when: 'Na manhã seguinte...' },
    // e, depois desse verão, o Lourenço vai viver para a Austrália (daqui até ao regresso, só ao telefone)
    {
      act: Talk, music: 'saudade', when: 'Entretanto...', bg: partida, cast: [],
      lines: [
        'O Lourenço vai viver para a Austrália, do outro lado do mundo.',
        'Fica a saudade... e o telefone!',
      ],
    },
  ],
};

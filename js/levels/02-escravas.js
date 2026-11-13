// Nível 2 — «As Escravas»: a Inês, em criança, entra para o colégio e conhece a Ana, a Maísa,
// a «Soft» (Sofia) e a Isabel. Chegada, recreio, saltar à corda, bilhetinhos na aula e a
// fotografia de turma.
import { Talk } from '../acts/base.js';
import { fachada } from '../acts/escravas-cenario.js';
import { EscravasRecreio } from '../acts/escravas-recreio.js';
import { EscravasCorda } from '../acts/escravas-corda.js';
import { EscravasSala } from '../acts/escravas-sala.js';
import { EscravasFoto } from '../acts/escravas-foto.js';

export default {
  id: 'escravas',
  title: 'As Escravas',
  music: 'recreio',
  story: 'A pequena Inês, já crescidinha, vai para o colégio: o Externato das Escravas do Sagrado Coração de Jesus, em Lisboa. É lá, entre o recreio e as aulas, que conhece algumas das suas grandes amigas: a Ana, a Maísa, a «Soft» (Sofia) e a Isabel.',
  help: 'No recreio, arrasta o dedo (ou usa as setas) para andar. Na corda, toca no ecrã (ou Espaço) para saltar. Na aula, mantém premido para passar o bilhete e larga quando a Irmã se virar.',
  outro: 'Cinco amigas e um recreio inteiro por estrear!',
  ending: 'E assim começou uma amizade para a vida.',
  acts: [
    {
      act: Talk, when: 'Uns anos depois, na Lapa, em Lisboa...', bg: fachada,
      cast: [
        { who: 'inesc', outfit: 'farda', x: 0.3, face: 1, name: 'Inês' },
        { who: 'freira', x: 0.62, face: -1, name: 'Irmã' },
      ],
      lines: [
        'Primeiro dia no colégio novo: mala às costas e um friozinho na barriga.',
        'Irmã: «Bom dia! Tu deves ser a Inês. Sê muito bem-vinda!»',
        'Irmã: «O recreio é já ali. Vai conhecer as outras meninas!»',
      ],
    },
    { act: EscravasRecreio, hearts: 4 },
    { act: EscravasCorda, hearts: 4 },
    { act: EscravasSala, hearts: 4, when: 'Depois do recreio, na sala de aula...' },
    {
      act: EscravasFoto, flash: 3,
      cast: [
        { who: 'freira', x: 0.11, face: 1, name: 'Irmã' },
        { who: 'anac', outfit: 'farda', x: 0.29, face: 1, name: 'Ana' },
        { who: 'maisac', outfit: 'farda', x: 0.43, face: 1, name: 'Maísa' },
        { who: 'inesc', outfit: 'farda', x: 0.57, face: 1, name: 'Inês' },
        { who: 'softc', outfit: 'farda', x: 0.71, face: -1, name: 'Soft' },
        { who: 'isabelc', outfit: 'farda', x: 0.85, face: -1, name: 'Isabel' },
      ],
      lines: [
        'Antes de irem para casa... a fotografia de turma!',
        'Irmã: «Meninas, todas juntinhas e direitinhas!»',
        'Irmã: «Olha o passarinho!»',
        'Clique! A Inês, a Ana, a Maísa, a Soft e a Isabel: amigas desde o colégio.',
      ],
    },
  ],
};

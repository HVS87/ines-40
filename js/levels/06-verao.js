// Nível 6 — «Verões em Santo Amaro»: os dias na piscina da casa dos avós da Isabel, em Santo
// Amaro de Oeiras, e as noites em que fugiam pela janela para ir ao Garage, de comboio.
import { Talk } from '../acts/base.js';
import { VeraoPiscina } from '../acts/verao-piscina.js';
import { VeraoFuga } from '../acts/verao-fuga.js';
import { VeraoJanela } from '../acts/verao-janela.js';
import { VeraoComboio } from '../acts/verao-comboio.js';
import { ruaGarage } from '../acts/verao-cenario.js';

export default {
  id: 'verao',
  title: 'Verões em Santo Amaro',
  music: 'party',
  story: 'No verão, a Inês e as amigas passavam dias na casa dos avós da Isabel, em Santo Amaro de Oeiras. De dia, piscina. À noite queriam ir ao Garage: o avô da Isabel barricava a porta e até estacionava o carro à frente... e elas fugiam pela janela e iam de comboio.',
  help: 'Toca no ecrã (ou Espaço) no momento certo: quando a amiga bate no trampolim, para dar passinhos enquanto o avô ressona e para parar o comboio na marca amarela.',
  outro: 'Ida e volta de comboio... e o avô sempre a ressonar!',
  acts: [
    { act: VeraoPiscina, hearts: 4, when: 'Um dia de verão, em Santo Amaro de Oeiras...' },
    { act: VeraoFuga, hearts: 4, when: 'Nessa noite: a porta barricada e o carro do avô à frente do portão...' },
    { act: VeraoJanela },
    { act: VeraoComboio, hearts: 5, when: 'Estação de Santo Amaro, Linha de Cascais...' },
    {
      act: Talk, bg: ruaGarage,
      cast: [
        { who: 'ines', outfit: 'night', x: 0.2, face: 1, name: 'Inês' },
        { who: 'isabel', outfit: 'night', x: 0.34, face: 1, name: 'Isabel' },
        { who: 'ana', outfit: 'night', x: 0.48, face: 1, name: 'Ana' },
        { who: 'soft', outfit: 'night', x: 0.62, face: -1, name: 'Soft' },
      ],
      lines: [
        'Isabel: «Chegámos! Olhem ali as luzes do Garage!»',
        'Soft: «E o teu avô, Isabel?»',
        'Isabel: «A esta hora? A guardar a porta... de olhos fechados.»',
        'Inês: «Então vamos dançar! O comboio de volta é só de madrugada.»',
      ],
    },
    { act: VeraoJanela, back: true, when: 'De madrugada, de volta a Santo Amaro...' },
  ],
};

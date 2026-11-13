// Nível 24 — Passeios de barco: sair da marina, a pescaria e os mergulhos na enseada.
import { Pesca } from '../acts/pesca.js';
import { Navegar } from '../acts/barco-navegar.js';
import { Mergulhos } from '../acts/barco-mergulhos.js';
import { PELE_MAR } from '../acts/barco-cenario.js';

export default {
  id: 'barco',
  title: 'Passeios de Barco',
  music: 'play',
  story: 'A Inês adora os passeios de barco com os amigos. Alugam um barco e vai o Pi ao leme, que é quem tem a carta de marinheiro; a bordo seguem também o Carlos, a Mi, o Leal e o Lourenço. Sair da marina, pescar, ancorar numa enseada... dias em grande.',
  help: 'A navegar: arrasta o dedo para cima e para baixo (ou setas ↑ ↓). Na pesca: toca (ou Espaço) para lançar e quando a boia afundar; depois mantém premido para puxar. Nos mergulhos: toca no momento certo.',
  outro: 'Dias em grande, no mar e com os amigos!',
  ending: 'Mar, amigos e ninguém com pressa de voltar.',
  acts: [
    { act: Navegar, when: 'Manhã de sol, barco alugado e o Pi ao leme. Larguem as amarras!', hearts: 5 },
    {
      act: Pesca, when: 'Ao largo, canas na água...', hearts: 5, skin: PELE_MAR,
      fim: 'Carlos: «Com este peixe todo, o almoço está garantido!»',
      fish: [
        { who: 'ines', fish: 'robalo', turn: 'A Inês abre a pescaria.', cheer: 'Inês: «Um robalo! Este vai para a grelha.»' },
        { who: 'mi', fish: 'dourada', turn: 'É a vez da Mi.', cheer: 'Mi: «Uma dourada! Que bonita.»' },
        { who: 'leal', fish: 'sargo', turn: 'Agora o Leal.', cheer: 'Leal: «Um sargo! E não foi sorte, foi técnica.»' },
        { who: 'lourenco', fish: 'cavala', turn: 'Vez do Lourenço.', cheer: 'Lourenço: «Uma cavala! Pequenina, mas valente.»' },
        { who: 'ines', fish: 'polvo', turn: 'A Inês outra vez... e a linha prendeu-se?', cheer: 'Pi: «Um polvo! Agarrou-se às pedras, o teimoso!»' },
      ],
    },
    { act: Mergulhos, when: 'Hora de almoço, ancorados numa enseada...', hearts: 4 },
  ],
};

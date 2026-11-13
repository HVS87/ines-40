// Nível 13: jantares com amigos. As quiches em casa do Pipoca, com a Ana e a Mi; o dedo cortado,
// as urgências da CUF de garrafa de vodka na mão e, no fim, sair à noite a rir de tudo.
// (O Lourenço está na Austrália: só aparece no telefonema do fim.)
import { Call } from '../acts/call.js';
import { JantaresQuiche } from '../acts/jantares-quiche.js';
import { JantaresCuf } from '../acts/jantares-cuf.js';
import { JantaresNoite } from '../acts/jantares-noite.js';

export default {
  id: 'jantares',
  title: 'Jantares com Amigos',
  music: 'play',
  story: 'A Inês adora ir jantar a casa de amigos. Um clássico eram as quiches em casa do Pipoca, com ele, com a Ana e com a Mi. Uma vez, a ajudar na cozinha, a Inês cortou um dedo — ficou quase aberto ao meio! — e a noite ficou para a história.',
  help: 'Toca no ecrã (ou Espaço) quando a faca passar por cima de cada risca. Nas urgências, toca quando aparecer a senha da Inês e, depois, para ela aguentar o dedo quieto.',
  outro: 'Um dedo ligado, uma noite para a história... e a quiche ficou para o dia seguinte.',
  acts: [
    { act: JantaresQuiche, hearts: 5, when: 'Jantar em casa do Pipoca. Hoje há quiche!' },
    { act: JantaresCuf, hearts: 4, when: 'Pouco depois, com o dedo quase aberto ao meio, nas urgências da CUF...' },
    {
      act: JantaresNoite, hearts: 2, when: 'De dedo ligado... e agora?',
      cast: [
        { who: 'pipoca', outfit: 'night', x: 0.16, face: 1, name: 'Pipoca' },
        { who: 'ana', outfit: 'night', x: 0.38, face: 1, name: 'Ana' },
        { who: 'ines', outfit: 'night', x: 0.6, face: 1, name: 'Inês' },
        { who: 'mi', outfit: 'night', x: 0.82, face: -1, name: 'Mi' },
      ],
      lines: [
        'Depois das urgências... casa? Nem pensar. Sair à noite na mesma!',
        'Inês: «Dedo no ar! Assim nem preciso de levantar o braço para dançar.»',
        'Ana: «Só tu, Inês! Das urgências diretamente para a pista.»',
        'Mi: «E a cara da enfermeira quando viu a garrafa de vodka?»',
        'Pipoca: «E a quiche? Fica para amanhã. Fria também é boa!»',
        'Inês: «A melhor quiche que nunca chegámos a jantar!»',
      ],
    },
    // o telefonema da Austrália (ver js/acts/call.js)
    {
      act: Call, animal: 'bumerangue', label: 'DESVIA!', when: 'No dia seguinte, o telefone toca...',
      lines: [
        'Inês: «Abri um dedo quase ao meio a fazer quiche, fui às urgências... e depois fui sair!»',
        'Lourenço: «Só tu, Inês! Quem me dera ter estado aí para ver...»',
        'Lourenço: «Eu por cá ando a aprender a atirar o bumerangue. Olha só: zás!»',
      ],
      alert: 'O bumerangue voltou! Toca muitas vezes para o Lourenço se desviar!',
      win: 'Lourenço: «Ufa, passou a rasar! Dizem que volta sempre... e é verdade.»',
      lose: 'O bumerangue voltou... e levou o telefone com ele. Até amanhã, Austrália!',
    },
  ],
};

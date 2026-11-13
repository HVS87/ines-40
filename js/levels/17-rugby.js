// Nível 17 — «Tomás no Rugby»: o Tomás joga rugby na Agronomia desde miúdo. A Inês leva-o aos
// treinos, na Tapada da Ajuda, e não perde um jogo: a boleia para o treino, a corrida até ao
// ensaio, os pontapés de conversão e o abraço do fim, cheio de lama.
import { Talk } from '../acts/base.js';
import { Estrada } from '../acts/estrada.js';
import { PELE_RUGBY, JOGO, Pontape, fundoTreino, fundoJogo } from '../acts/rugby.js';

export default {
  id: 'rugby',
  title: 'Tomás no Rugby',
  music: 'play',
  story: 'O Tomás joga rugby na Agronomia desde miúdo, e agora já é um adolescente. A Inês leva-o sempre aos treinos, na Tapada da Ajuda, e não perde um jogo: da linha lateral, é a adepta número um!',
  help: 'Na corrida para o ensaio, toca no ecrã (ou Espaço, ou as setas ↑ ↓) para mudar de corredor e fugir às placagens. Nos pontapés, toca quando o marcador estiver na zona verde, entre os postes.',
  outro: 'Ensaio do Tomás! E a adepta número um ficou sem voz.',
  ending: 'Com lama até às orelhas e um sorriso de orelha a orelha.',
  acts: [
    {
      act: Talk, when: 'Fim de tarde, na Tapada da Ajuda...', bg: fundoTreino,
      cast: [
        { who: 'ines', outfit: 'casual', x: 0.4, face: 1, name: 'Inês' },
        { who: 'tomas', outfit: 'rugby', x: 0.6, face: -1, name: 'Tomás' },
      ],
      lines: [
        'Treino da Agronomia, como todas as semanas. E quem é que dá a boleia? A Inês, claro.',
        'Tomás: «Obrigado pela boleia, mãe! Sábado há jogo. Vens ver?»',
        'Inês: «Alguma vez faltei? Venho ver-te jogar desde que eras deste tamanho!»',
      ],
    },
    { act: Estrada, when: 'Sábado, dia de jogo!', skin: PELE_RUGBY, ...JOGO },
    { act: Pontape, hearts: 3, when: 'Ensaio da Agronomia! Falta o pontapé...' },
    {
      act: Talk, hearts: 1, when: 'Depois do apito final...', bg: fundoJogo,
      cast: [
        { who: 'ines', outfit: 'casual', x: 0.4, face: 1, name: 'Inês' },
        { who: 'tomas', outfit: 'rugby', x: 0.6, face: -1, name: 'Tomás' },
      ],
      lines: [
        'Tomás: «Viste, mãe? Viste o ensaio?»',
        'Inês: «Vi tudo! Ia ficando sem voz, de tanto gritar.»',
        'Tomás: «Estou cheio de lama...»',
        'Inês: «Lama é sinal de bom jogo! Anda cá dar um abraço... mas no carro vais sentado numa toalha.»',
      ],
    },
  ],
};
